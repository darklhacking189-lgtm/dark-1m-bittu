import axios from "axios";
import { Module } from "../lib/plugins.js";

Module({
  command: "lookup",
  package: "tools",
  description: "Lookup mobile number details"
})(async (message, match) => {

  if (!match) {
    return message.send(
      "❌ Number dao\n\nExample:\n.lookup 8420757226"
    );
  }

  if (!/^\d{8,13}$/.test(match)) {
    return message.send("❌ Valid mobile number dao");
  }

  await message.react("🔍");

  try {
    const url = `https://duxx-zx-osint-api.onrender.com/api?key=Rabbit&type=mobile&term=${match}`;
    const res = await axios.get(url);

    if (
      !res.data.success ||
      !res.data.result?.result ||
      res.data.result.result.length === 0
    ) {
      await message.react("❌");
      return message.send("❌ Kono data paoa jay nai");
    }

    const d = res.data.result.result[0];

    const text = `
📱 *Mobile Number Details*

• Name: ${d.name || "N/A"}
• Father: ${d.father_name || "N/A"}
• Mobile: ${d.mobile}
• Alt Mobile: ${d.alt_mobile || "N/A"}
• Circle: ${d.circle || "N/A"}
• ID Number: ${d.id_number || "N/A"}
• Email: ${d.email || "N/A"}

🏠 *Address*
${d.address || "N/A"}

━━━━━━━━━━━━━━
✨ *Pᴏᴡᴇʀᴇᴅ Bʏ Mʀ Rᴀʙʙɪᴛ*
`;

    await message.send(text);
    await message.react("✅");

  } catch (e) {
    console.error(e);
    await message.react("❌");
    message.send("⚠️ Server error, try again later");
  }
});
