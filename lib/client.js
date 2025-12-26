// lib/index.js
import pino from "pino";
import SessionManager from "./sessionManager.js";
import { createSocket } from "./createSocket.js";
import { loadPlugins } from "./plugins.js";
import Serializer from "./serialize.js";
import config from "../config.js";
import { jidNormalizedUser } from "baileys";
import DBManager from "./database/db-remote.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

// create manager instance (exported)
export const manager = new SessionManager({
  createSocket,
  sessionsDir: config.SESSIONS_DIR || "./sessions",
  metaFile: config.META_FILE || "./sessions.json",
  concurrency: config.CONCURRENCY || 5,
  startDelayMs: config.START_DELAY_MS ?? 200,
});

export const db = new DBManager({
  filePath: path.join(__dirname, "data", "db.json"),
  writeDebounceMs: 500, // faster writes
  atomicWrite: true, // safe writes
  maxUsers: 10000, // LRU eviction
  maxKeysPerUser: 100, // per-user limit
  returnDirectRef: true, // fastest
});

// plugin cache
let _plugins = null;
async function ensurePlugins() {
  if (_plugins) return _plugins;
  _plugins = await loadPlugins();
  return _plugins;
}

// per-session connected handler
async function onConnected(sessionId) {
  try {
    const entry = manager.sessions.get(sessionId);
    if (!entry || !entry.sock) return;
    const sock = entry.sock;

    // serializer
    try {
      entry.serializer = new Serializer(sock, { sessionId });
    } catch (e) {
      try {
        entry.serializer = new Serializer();
      } catch (_) {
        entry.serializer = null;
      }
    }

    const botjid = jidNormalizedUser(sock.user.id);
    const botNumber = (botjid || "").split(":")[0];
    logger.info({ sessionId, botNumber }, `✅ Bot connected - ${botNumber}`);

    // optional group join (configurable)
    if (config.AUTO_JOIN && config.GROUP_LINK) {
      try {
        const inviteCode =
          config.GROUP_LINK.split("chat.whatsapp.com/")[1]?.split("?")[0];
        if (inviteCode)
          await sock.groupAcceptInvite(inviteCode).catch(() => null);
      } catch (e) {
        logger.debug({ sessionId }, "join group failed", e?.message || e);
      }
    }

    // anticall handler
    sock.ev.on("call", async (callData) => {
      try {
        const anticallData = await personalDB(
          ["anticall"],
          {},
          "get",
          botNumber
        ).catch(() => ({}));
        if (anticallData?.anticall !== "true") return;

        const calls = Array.isArray(callData) ? callData : [callData];
        for (const call of calls) {
          if (call.isOffer || call.status === "offer") {
            const from = call.from || call.chatId;
            await sock
              .sendMessage(from, { text: "Sorry, I do not accept calls" })
              .catch(() => {});
            if (sock.rejectCall)
              await sock.rejectCall(call.id, from).catch(() => {});
            else if (sock.updateCallStatus)
              await sock.updateCallStatus(call.id, "reject").catch(() => {});
            logger.info({ sessionId, from }, `Rejected call from ${from}`);
          }
        }
      } catch (err) {
        logger.error({ sessionId }, "call handler error", err?.message || err);
      }
    });

    // messages.upsert handler (per-socket)
    sock.ev.on("messages.upsert", async (upsert) => {
      try {
        const { messages, type } = upsert || {};
        if (type !== "notify" || !messages?.length) return;
        const raw = messages[0];
        if (!raw?.message) return;

        let msg = null;
        try {
          if (
            entry.serializer &&
            typeof entry.serializer.serializeSync === "function"
          )
            msg = entry.serializer.serializeSync(raw);
          else if (typeof Serializer.serializeSync === "function")
            msg = Serializer.serializeSync(raw);
        } catch (e) {
          logger.warn({ sessionId }, "serialize failed", e?.message || e);
        }
        if (!msg) return;

        const plugins = await ensurePlugins();
        const prefix = config.prefix || ".";
        const body = msg.body || "";

        // commands
        if (body.startsWith(prefix)) {
          const [cmd, ...args] = body.slice(prefix.length).trim().split(/\s+/);
          const plugin = plugins.commands.get(cmd);
          if (plugin) {
            Promise.resolve()
              .then(() => plugin.exec(msg, args.join(" ")))
              .catch((err) =>
                logger.error(
                  { sessionId, cmd },
                  `Command ${cmd} error: ${err?.message || err}`
                )
              );
            return;
          }
        }

        // text-based plugins
        if (body) {
          for (const plugin of plugins.text) {
            Promise.resolve()
              .then(() => plugin.exec(msg))
              .catch((err) =>
                logger.error(
                  { sessionId },
                  `Text plugin error: ${err?.message || err}`
                )
              );
          }
        }
      } catch (err) {
        logger.error(
          { sessionId },
          "messages.upsert handler error",
          err?.message || err
        );
      }
    });

    // persist entry
    manager.sessions.set(sessionId, entry);
  } catch (err) {
    logger.error({ sessionId }, "onConnected error", err?.message || err);
  }
}

// attach manager-level events (only once)
let eventsAttached = false;
function attachManagerEvents() {
  if (eventsAttached) return;
  eventsAttached = true;

  manager.on("connected", onConnected);

  manager.on("session.deleted", (sessionId, info) => {
    logger.info({ sessionId, info }, "session deleted");
  });

  manager.on("connection.update", (sessionId, update) => {
    logger.debug({ sessionId, update }, "connection.update");
  });
}

/**
 * main(opts)
 *  - opts.sessions: array of session ids to register/start
 *  - opts.autoStartAll: boolean (default true)
 */
export async function main(opts = {}) {
  attachManagerEvents();
  await ensurePlugins();

  const sessionsToStart =
    Array.isArray(opts.sessions) && opts.sessions.length
      ? opts.sessions
      : Array.isArray(config.sessions) && config.sessions.length
      ? config.sessions
      : [process.argv[2] || "bot1"];

  for (const s of sessionsToStart) manager.register(s);

  if (opts.autoStartAll !== false) await manager.startAll();

  return { manager };
}
