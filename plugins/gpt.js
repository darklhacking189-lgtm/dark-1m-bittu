import { Module } from "../lib/plugins.js";
import fetch from "node-fetch";

Module({
  command: "gemini",
  package: "ai",
  description: "Chat with gemini",
})(async (message, match) => {
  if (!match) return message.send("_Please provide a question_");

  try {
    const sent = await message.send("🤔 Thinking...");
    const res = await fetch(
      `https://api.privatezia.biz.id/api/ai/luminai?query=${encodeURIComponent(
        match
      )}`
    );
    const data = await res.json();

    if (!data.status) {
      return await message.send(
        "⚠️ Failed to get response. Please try again.",
        { edit: sent.key }
      );
    }

    const answer = data.data;
    await message.send(answer, { edit: sent.key });
  } catch (error) {
    console.error("[gemini ERROR]:", error.message);
    await message.send("⚠️ An error occurred. Please try again later.");
  }
});

Module({
  command: "gpt",
  package: "ai",
  description: "Chat with GPT AI",
})(async (message, match) => {
  if (!match) return message.send("_Please provide a question_");
  try {
    const sent = await message.send("🤔 Thinking...");
    const res = await fetch(
      `https://api.privatezia.biz.id/api/ai/luminai?query=${encodeURIComponent(
        match
      )}`
    );
    const data = await res.json();

    if (!data.status) {
      return await message.send(
        "⚠️ Failed to get response. Please try again.",
        { edit: sent.key }
      );
    }

    const answer = data.response;
    await message.send(answer, { edit: sent.key });
  } catch (error) {
    console.error("[gpt ERROR]:", error.message);
    await message.send("⚠️ An error occurred. Please try again later.");
  }
});

Module({
  command: "ai",
  package: "ai",
  description: "Chat with gemini",
})(async (message, match) => {
  if (!match) return message.send("_Please provide a question_");

  // Ensure you set GEMINI_API_KEY in your environment (process.env.GEMINI_API_KEY)
  const API_KEY = "AIzaSyAdP2qPk-f0ixQSc5Fb9nQKWHWQT8nEuq0";
  if (!API_KEY) {
    return message.send(
      "⚠️ Server misconfigured: missing GEMINI_API_KEY env var."
    );
  }

  try {
    const sent = await message.send("🤔 Thinking...");

    // Use the official REST endpoint for generateContent
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    const payload = {
      // "contents" is an array of input objects; each input has parts with text
      contents: [
        {
          parts: [{ text: match }],
        },
      ],
      // optionally you can set temperature, candidateCount etc if needed
      // example: temperature: 0.2
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // the official quickstart shows using x-goog-api-key for API keys
        "x-goog-api-key": API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("[gemini REST ERROR]", res.status, txt);
      return message.send(`⚠️ Gemini API error (status ${res.status}).`, {
        edit: sent.key,
      });
    }

    const data = await res.json();

    // safe extraction of text from response
    const candidate =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || "")
        .join("") ||
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.output?.[0]?.content?.text || // defensive
      null;

    if (!candidate) {
      console.error("[gemini REST] malformed response:", JSON.stringify(data));
      return message.send(
        "⚠️ Failed to parse Gemini response. See server logs.",
        { edit: sent.key }
      );
    }

    await message.send(candidate, { edit: sent.key });
  } catch (error) {
    console.error("[gemini ERROR]:", error);
    await message.send("⚠️ An error occurred. Please try again later.");
  }
});
