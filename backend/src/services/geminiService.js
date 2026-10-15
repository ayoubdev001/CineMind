//communicating with Gemini.

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function embedText(text) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: { outputDimensionality: 768 },
  });
  return response.embeddings[0].values;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateChatReply(
  systemPrompt,
  userMessage,
  retries = 3,
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.DEEPSEEK_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      });

      if (res.status === 429) throw new Error("AI_QUOTA_EXCEEDED");

      if (!res.ok) {
        const errorBody = await res.text();
        console.error("DeepSeek error response:", errorBody);
        const err = new Error(`DeepSeek request failed: ${res.status}`);
        err.status = res.status;
        throw err;
      }

      const data = await res.json();
      return data.choices[0].message.content;
    } catch (error) {
      if (error.message === "AI_QUOTA_EXCEEDED") throw error;

      const isOverloaded = error?.status === 503;
      const isLastAttempt = attempt === retries;
      if (isOverloaded && !isLastAttempt) {
        await sleep(1000 * attempt);
        continue;
      }
      throw error;
    }
  }
}
