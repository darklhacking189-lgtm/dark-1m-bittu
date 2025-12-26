// client.js
// Example client bootstrap + messages.upsert handler.
// Replace placeholders (createBaileysSock, logger, entry/Serializer, config) with your real objects.

import { ensurePlugins } from "./lib/plugins.js";

/**
 * createSockAndStart - implement socket creation per your Baileys setup.
 * For example, create and return a sock instance from baileys.
 *
 * For demonstration this function returns a mock-like object with `ev.on`.
 * Replace this with your actual Baileys "makeWASocket" / socket creation logic.
 */
export async function createSockAndStart(options = {}) {
  // TODO: Replace the mock below with your actual Baileys socket creation
  // e.g.: const sock = makeWASocket({ auth, printQRInTerminal: false, ... });
  const sock = options.sock; // or create it here

  // Ensure sock exists
  if (!sock) throw new Error("createSockAndStart: provide a 'sock' option or integrate your Baileys creation here.");

  // Wire the messages.upsert handler
  attachHandlersToSock(sock);

  return sock;
}

/**
 * attachHandlersToSock - attaches listeners (messages.upsert) to a created sock.
 * This function contains the hot-path handler that does NOT await plugin loading.
 */
export function attachHandlersToSock(sock, deps = {}) {
  // deps placeholders (replace with your actual logger, serializer, sessionId, config)
  const logger = deps.logger || console;
  const entry = deps.entry || {}; // entry.serializer (optional)
  const Serializer = deps.Serializer || {}; // Serializer.serializeSync (optional)
  const sessionId = deps.sessionId || "session";
  const config = deps.config || { prefix: "." };

  sock.ev.on("messages.upsert", async (upsert) => {
    try {
      const { messages, type } = upsert || {};
      if (type !== "notify" || !messages?.length) return;
      const raw = messages[0];
      if (!raw?.message) return;

      // serialize safely (your serializer may be different)
      let msg = null;
      try {
        if (entry.serializer && typeof entry.serializer.serializeSync === "function")
          msg = entry.serializer.serializeSync(raw);
        else if (Serializer && typeof Serializer.serializeSync === "function")
          msg = Serializer.serializeSync(raw);
        else
          msg = raw; // fallback: use raw object
      } catch (e) {
        logger.warn?.({ sessionId }, "serialize failed", e?.message || e);
        msg = raw; // fallback
      }
      if (!msg) return;

      // SYNCHRONOUS plugin snapshot (no await!)
      const plugins = ensurePlugins(); // immediate return

      const prefix = config.prefix || ".";
      const body = (msg.body || "").toString();

      // commands
      if (body.startsWith(prefix)) {
        const [cmd, ...args] = body.slice(prefix.length).trim().split(/\s+/);
        const plugin = plugins.commands.get(cmd);
        if (plugin) {
          // run plugin asynchronously but do not await in hot path
          Promise.resolve()
            .then(() => plugin.exec(msg, args.join(" ")))
            .catch((err) =>
              logger.error?.(
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
          // fire-and-forget each text plugin
          Promise.resolve()
            .then(() => plugin.exec(msg))
            .catch((err) =>
              logger.error?.(
                { sessionId },
                `Text plugin error: ${err?.message || err}`
              )
            );
        }
      }
    } catch (err) {
      // Global handler protection
      try {
        // logger may be something like pino/winston
        logger.error?.({ sessionId: "unknown" }, "messages.upsert handler error", err?.message || err);
      } catch {
        console.error("messages.upsert handler error:", err);
      }
    }
  });
}