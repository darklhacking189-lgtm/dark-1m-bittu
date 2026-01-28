import os from "os";
import { Module, getCommands } from "../lib/plugins.js";
import { getRandomPhoto } from "./bin/menu_img.js";
import config from "../config.js";

const readMore = String.fromCharCode(8206).repeat(4001);

function runtime(secs) {
  const pad = (s) => s.toString().padStart(2, "0");
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}

function buildGroupedCommands() {
  const cmds = getCommands();
  return cmds
    .filter((cmd) => cmd && cmd.command && cmd.command !== "undefined")
    .reduce((acc, cmd) => {
      const pkg = (cmd.package || "uncategorized").toString().toLowerCase();
      if (!acc[pkg]) acc[pkg] = [];
      acc[pkg].push(cmd.command);
      return acc;
    }, {});
}

// ================== Rabbit-Style Menu with Channel Forward ==================
Module({
  command: "menu",
  package: "general",
  description: "Show all commands in Rabbit-style with channel forward",
})(async (message, match) => {
  try {
    await message.react("📜");

    const time = new Date().toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    const userName = message.pushName || "User";
    const usedGB = ((os.totalmem() - os.freemem()) / 1073741824).toFixed(2);
    const totGB = (os.totalmem() / 1073741824).toFixed(2);
    const ram = `${usedGB} / ${totGB} GB`;

    const grouped = buildGroupedCommands();
    const categories = Object.keys(grouped).sort();
    let _cmd_st = "";

    if (match && grouped[match.toLowerCase()]) {
      const pack = match.toLowerCase();
      _cmd_st += `\n *╭────❒ ${pack.toUpperCase()} ❒*\n`;
      grouped[pack].sort().forEach((cmdName) => {
        _cmd_st += ` *├◈ ${cmdName}*\n`;
      });
      _cmd_st += ` *┕──────────────────❒*\n`;
    } else {
      _cmd_st += `
╔〔 🧚‍♀️*𝐃𝐀𝐑𝐊 Xᴍᴅ Mɪɴɪ*💐〕╗
 *👋 Hᴇʟʟᴏ, 𝐃𝐀𝐑𝐊 Xᴍᴅ Mɪɴɪ Usᴇʀ!*
╚══════════════════════╝

╭─「 *Cᴏᴍᴍᴀɴᴅ Pᴀɴᴇʟ* 」
│🔹 *Rᴜɴ*     : ${runtime(process.uptime())}
│🔹 *Mᴏᴅᴇ*    : Public
│🔹 *Pʀᴇғɪx*  : ${config.prefix}
│🔹 *Rᴀᴍ*     : ${ram}
│🔹 *Tɪᴍᴇ*    : ${time}
│🔹 *Uѕᴇʀ*    : ${userName}
|🔹 *Supreme : DARK-X❤️*
|🔹*𝐏𝐫𝐨      : 𝐃𝐀𝐑𝐊-𝐋🩷*
|🔹*𝐂𝐨𝐝𝐞𝐫    : 𝐃𝐀𝐑𝐊-𝐎🧡*
|🔹*𝐇𝐨𝐭𝐥𝐢𝐧𝐞 𝐥𝐞𝐚𝐝𝐞𝐫 : 𝐃𝐀𝐑𝐊-𝐁/𝐌𝐀𝐅𝐈𝐀💚*
|🔹*𝐇𝐚𝐜𝐤𝐢𝐧𝐠 𝐥𝐞𝐚𝐝𝐞𝐫 : 𝐃𝐀𝐑𝐊-𝐄/𝐃𝐀𝐑𝐊-𝐌💙*
|🔹*𝐒𝐩𝐲 𝐨𝐰𝐧𝐞𝐫    : 𝐃𝐀𝐑𝐊-𝐀𝐑𝐈𝐘𝐀𝐍🩵*
|🔹*𝐌𝐨𝐝𝐞𝐫𝐚𝐭𝐨𝐫    : 𝐃𝐀𝐑𝐊-𝟏𝐌💜*
|🔹*𝐑𝐮𝐥𝐞𝐫       : 𝐃𝐀𝐑𝐊-𝐈𝐓𝐀𝐂𝐇𝐈/𝐃𝐀𝐑𝐊-𝐏𝐒𝐘𝐂𝐇𝐎🤍*
|🔹*𝐂𝐞𝐨        : 𝐃𝐀𝐑𝐊-𝐖 (𝐑𝐀𝐌)💞*
|🔹*𝐃𝐞𝐬𝐭𝐫𝐨𝐲     : 𝐃𝐀𝐑𝐊-𝐈💗*
╰─────────────●●►
${readMore}
`;

      for (const cat of categories) {
        _cmd_st += `\n *╭────❒ ${cat.toUpperCase()} ❒*\n`;
        grouped[cat].sort().forEach((cmdName) => {
          _cmd_st += ` *├◈ ${cmdName}*\n`;
        });
        _cmd_st += ` *┕──────────────────❒*\n`;
      }

      _cmd_st += `\n *💐 𝐓ʜᴀɴᴋ 𝐘ᴏᴜ 𝐅ᴏʀ 𝐔sɪɴɢ 𝐃𝐀𝐑𝐊-𝐋 Xᴍᴅ 𝐁ᴏᴛ 💞*`;
    }

    const opts = {
      image: { url: "https://files.catbox.moe/z5aw6g.jpg" },
      caption: _cmd_st,
      mimetype: "image/jpeg",
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363404737630340@newsletter",
          newsletterName: "𝐑ᴀʙʙɪᴛ Xᴍᴅ",
          serverMessageId: 6,
        },
      },
    };

    await message.conn.sendMessage(message.from, opts);
  } catch (err) {
    console.error("❌ Menu command error:", err);
    await message.conn.sendMessage(message.from, {
      text: `❌ Error: ${err?.message || err}`,
    });
  }
});
