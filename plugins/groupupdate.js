// plugins/welcome-goodbye.js
import { Module } from "../lib/plugins.js";
import { db } from "../lib/client.js";
import axios from "axios";
import { jidNormalizedUser } from "baileys";

/* ---------------- defaults ---------------- */
function defaultWelcome() {
  return {
    status: false,
    message: "Hi &mention, welcome to &name! total &size",
  };
}
function defaultGoodbye() {
  return {
    status: false,
    message: "Goodbye &mention. We will miss you from &name (now &size).",
  };
}

/* ---------------- helpers ---------------- */
function toBool(v) {
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  if (typeof v === "string")
    return ["true", "1", "yes", "on"].includes(v.toLowerCase());
  return Boolean(v);
}

function buildText(template = "", replacements = {}) {
  let text = template || "";
  const wantsPp = text.includes("&pp");
  text = text.replace(/&pp/g, "").trim();
  text = text.replace(/&mention/g, replacements.mentionText || "");
  text = text.replace(/&name/g, replacements.name || "");
  text = text.replace(/&size/g, String(replacements.size ?? ""));
  return { text, wantsPp };
}

async function fetchProfileBuffer(conn, jid) {
  try {
    // prefer conn.profilePictureUrl if available (Baileys)
    const getUrl =
      typeof conn.profilePictureUrl === "function"
        ? () => conn.profilePictureUrl(jid, "image").catch(() => null)
        : () => Promise.resolve(null);
    const url = await getUrl();
    if (!url) return null;
    const res = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 20000,
    });
    return Buffer.from(res.data);
  } catch (e) {
    console.error(
      "[welcome-goodbye] fetchProfileBuffer error:",
      e?.message || e
    );
    return null;
  }
}

async function sendWelcomeMsg(
  conn,
  groupJid,
  text,
  mentions = [],
  imgBuffer = null
) {
  try {
    if (imgBuffer) {
      await conn.sendMessage(groupJid, {
        image: imgBuffer,
        caption: text,
        mentions,
      });
      console.log(
        "[welcome-goodbye] sent image welcome/goodbye to",
        groupJid,
        "mentions:",
        mentions
      );
    } else {
      await conn.sendMessage(groupJid, { text, mentions });
      console.log(
        "[welcome-goodbye] sent text welcome/goodbye to",
        groupJid,
        "mentions:",
        mentions
      );
    }
  } catch (err) {
    console.error(
      "[welcome-goodbye] sendWelcomeMsg primary error:",
      err?.message || err
    );
    // fallback without mentions
    try {
      if (imgBuffer)
        await conn.sendMessage(groupJid, { image: imgBuffer, caption: text });
      else await conn.sendMessage(groupJid, { text });
      console.log("[welcome-goodbye] fallback send succeeded for", groupJid);
    } catch (e) {
      console.error(
        "[welcome-goodbye] sendWelcomeMsg fallback error:",
        e?.message || e
      );
    }
  }
}

/* ---------------- COMMANDS (GLOBAL) ---------------- */
// .welcome [on|off|show|<message>]  -- GLOBAL setting (owner-only)
Module({
  command: "welcome",
  package: "group",
  description:
    "Toggle/set/show global welcome message for the bot (owner-only)",
})(async (message, match) => {
  if (!message.isFromMe)
    return message.send?.("❌ Only bot owner can use this command.");
  const raw = (match || "").trim();
  const botNumber =
    (message.conn?.user?.id && String(message.conn.user.id).split(":")[0]) ||
    "bot";
  const key = `global:welcome`;
  let cfg = await db.getAsync(botNumber, key, null);
  if (!cfg || typeof cfg !== "object") cfg = defaultWelcome();

  if (!raw) {
    return await message.sendreply?.(
      `*Global Welcome Settings*\n• Status: ${
        toBool(cfg.status) ? "✅ ON" : "❌ OFF"
      }\n• Message: ${
        cfg.message || "(none)"
      }\nPlaceholders: &mention, &name, &size, &pp`
    );
  }

  const lower = raw.toLowerCase();
  if (lower === "on" || lower === "off") {
    cfg.status = lower === "on";
    await db.set(botNumber, key, cfg);
    await message.react?.("✅");
    return await message.send(
      cfg.status ? "✅ Global welcome ENABLED" : "❌ Global welcome DISABLED"
    );
  }
  if (lower === "show" || lower === "get") {
    return await message.sendreply?.(
      `Message: ${cfg.message || "(none)"}\nStatus: ${
        toBool(cfg.status) ? "ON" : "OFF"
      }`
    );
  }

  // save custom global template
  cfg.message = raw;
  await db.set(botNumber, key, cfg);
  await message.react?.("✅");
  return await message.send("✅ Global welcome message updated");
});

// .goodbye [on|off|show|<message>]  -- GLOBAL setting (owner-only)
Module({
  command: "goodbye",
  package: "group",
  description:
    "Toggle/set/show global goodbye message for the bot (owner-only)",
})(async (message, match) => {
  if (!message.isFromMe)
    return message.send?.(
      "❌ Only bot owner can use this command (global setting)."
    );
  const raw = (match || "").trim();
  const botNumber =
    (message.conn?.user?.id && String(message.conn.user.id).split(":")[0]) ||
    "bot";
  const key = `global:goodbye`;
  let cfg = await db.getAsync(botNumber, key, null);
  if (!cfg || typeof cfg !== "object") cfg = defaultGoodbye();

  if (!raw) {
    return await message.sendreply?.(
      `*Global Goodbye Settings*\n• Status: ${
        toBool(cfg.status) ? "✅ ON" : "❌ OFF"
      }\n• Message: ${
        cfg.message || "(none)"
      }\nPlaceholders: &mention, &name, &size, &pp`
    );
  }

  const lower = raw.toLowerCase();
  if (lower === "on" || lower === "off") {
    cfg.status = lower === "on";
    await db.set(botNumber, key, cfg);
    await message.react?.("✅");
    return await message.send(
      cfg.status ? "✅ Global goodbye ENABLED" : "❌ Global goodbye DISABLED"
    );
  }
  if (lower === "show" || lower === "get") {
    return await message.sendreply?.(
      `Message: ${cfg.message || "(none)"}\nStatus: ${
        toBool(cfg.status) ? "ON" : "OFF"
      }`
    );
  }

  // save custom global template
  cfg.message = raw;
  await db.set(botNumber, key, cfg);
  await message.react?.("✅");
  return await message.send("✅ Global goodbye message updated");
});

/* ---------------- EVENT: group-participants.update ---------------- */
Module({ on: "group-participants.update" })(async (_msg, event, conn) => {
  try {
    console.log("[welcome-goodbye] event received:", {
      id: event?.id,
      action: event?.action,
      participants: event?.participants?.length ?? 0,
    });

    if (
      !event ||
      !event.id ||
      !event.action ||
      !Array.isArray(event.participants)
    ) {
      console.log("[welcome-goodbye] ignoring event (missing fields)");
      return;
    }

    const groupJid = event.id;

    // Use enriched fields if present (client.js sends them), otherwise fetch/fallback
    const groupName =
      event.groupName ||
      (event.groupMetadata && event.groupMetadata.subject) ||
      "";
    const groupSize =
      typeof event.groupSize === "number"
        ? event.groupSize
        : event.groupMetadata && Array.isArray(event.groupMetadata.participants)
        ? event.groupMetadata.participants.length
        : event.groupMetadata && event.groupMetadata.participants
        ? event.groupMetadata.participants.length
        : 0;

    // compute botNumber *exactly the same way* the command handlers do (important)
    const botNumber =
      (conn?.user?.id && String(conn.user.id).split(":")[0]) || "bot";
    console.log(
      "[welcome-goodbye] botNumber:",
      botNumber,
      "group:",
      groupJid,
      "action:",
      event.action
    );

    // normalize action
    const action = String(event.action).toLowerCase();

    for (const p of event.participants) {
      const participantJid = jidNormalizedUser(
        typeof p === "string" ? p : p.id || p.jid || ""
      );
      if (!participantJid) {
        console.log(
          "[welcome-goodbye] skipping participant (couldn't normalize)",
          p
        );
        continue;
      }

      // skip if the bot itself is the target
      const botJidFull = jidNormalizedUser(conn?.user?.id);
      if (botJidFull && participantJid === botJidFull) {
        console.log(
          "[welcome-goodbye] skipping bot itself as participant:",
          participantJid
        );
        continue;
      }

      console.log(
        "[welcome-goodbye] processing participant:",
        participantJid,
        "action:",
        action
      );

      // --- WELCOME: handle add/invite/join variants
      if (action === "add" || action === "invite" || action === "joined") {
        const cfgRaw = await db.getAsync(botNumber, `global:welcome`, null);
        const cfg =
          cfgRaw && typeof cfgRaw === "object" ? cfgRaw : defaultWelcome();
        console.log("[welcome-goodbye] welcome cfg:", cfg);

        if (!toBool(cfg.status)) {
          console.log(
            "[welcome-goodbye] welcome disabled for botNumber",
            botNumber
          );
        } else {
          const mentionText = `@${participantJid.split("@")[0]}`;
          const replacements = {
            mentionText,
            name: groupName,
            size: groupSize,
          };
          const { text, wantsPp } = buildText(cfg.message, replacements);
          console.log(
            "[welcome-goodbye] built welcome text; wantsPp:",
            wantsPp
          );

          let imgBuf = null;
          if (wantsPp) {
            imgBuf = await fetchProfileBuffer(conn, participantJid);
            console.log("[welcome-goodbye] fetched profile buffer:", !!imgBuf);
          }

          try {
            await sendWelcomeMsg(
              conn,
              groupJid,
              text,
              [participantJid],
              imgBuf
            );
          } catch (e) {
            console.error(
              "[welcome-goodbye] error sending welcome:",
              e?.message || e
            );
          }
        }
      }

      // --- GOODBYE: handle remove/leave/left/kicked variants
      if (
        action === "remove" ||
        action === "leave" ||
        action === "left" ||
        action === "kicked"
      ) {
        const cfgRaw = await db.getAsync(botNumber, `global:goodbye`, null);
        const cfg =
          cfgRaw && typeof cfgRaw === "object" ? cfgRaw : defaultGoodbye();
        console.log("[welcome-goodbye] goodbye cfg:", cfg);

        if (!toBool(cfg.status)) {
          console.log(
            "[welcome-goodbye] goodbye disabled for botNumber",
            botNumber
          );
        } else {
          const mentionText = `@${participantJid.split("@")[0]}`;
          const replacements = {
            mentionText,
            name: groupName,
            size: groupSize,
          };
          const { text, wantsPp } = buildText(cfg.message, replacements);
          console.log(
            "[welcome-goodbye] built goodbye text; wantsPp:",
            wantsPp
          );

          let imgBuf = null;
          if (wantsPp) {
            imgBuf = await fetchProfileBuffer(conn, participantJid);
            console.log("[welcome-goodbye] fetched profile buffer:", !!imgBuf);
          }

          try {
            await sendWelcomeMsg(
              conn,
              groupJid,
              text,
              [participantJid],
              imgBuf
            );
          } catch (e) {
            console.error(
              "[welcome-goodbye] error sending goodbye:",
              e?.message || e
            );
          }
        }
      }

      // --- PROMOTE / DEMOTE (existing behavior)
      if (action === "promote" || action === "demote") {
        let owner = botJidFull || null;
        if (owner && !owner.includes("@")) owner = `${owner}@s.whatsapp.net`;
        const ownerMention = owner
          ? `@${owner.split("@")[0]}`
          : conn.user?.id
          ? `@${String(conn.user.id).split(":")[0]}`
          : "Owner";
        const actor = event.actor || event.author || event.by || null;
        const actorText = actor ? `@${actor.split("@")[0]}` : "Admin";
        const targetText = `@${participantJid.split("@")[0]}`;
        const actionText = action === "promote" ? "promoted" : "demoted";
        const sendText = `╭─〔 *🎉 Admin Event* 〕\n├─ ${actorText} has ${actionText} ${targetText}\n├─ Group: ${groupName}\n╰─➤ Powered by ${ownerMention}`;
        try {
          const mentions = [actor, participantJid, botJidFull].filter(Boolean);
          if (owner) mentions.push(owner);
          await conn.sendMessage(groupJid, { text: sendText, mentions });
          console.log(
            "[welcome-goodbye] sent promote/demote message to",
            groupJid,
            "mentions:",
            mentions
          );
        } catch (e) {
          console.error(
            "[welcome-goodbye] promote/demote send error:",
            e?.message || e
          );
          try {
            await conn.sendMessage(groupJid, { text: sendText });
          } catch (_) {}
        }
      }
    }
  } catch (err) {
    console.error(
      "[welcome-goodbye] event handler error:",
      err?.message || err
    );
  }
});
