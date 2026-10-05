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

export async function generateChatReply(systemPrompt, userMessage, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL,
        contents: userMessage,
        config: {
          systemInstruction: systemPrompt,
          thinkingConfig: { thinkingLevel: "low" },
        },
      });
      return response.text;
    } catch (error) {
      if (error?.status === 429) {
        throw new Error("AI_QUOTA_EXCEEDED");
      }

      const isOverloaded = error?.status === 503;
      const isLastAttempt = attempt === retries;

      if (isOverloaded && !isLastAttempt) {
        const delay = 1000 * attempt;
        console.log(`Gemini overloaded, retrying in ${delay}ms (attempt ${attempt}/${retries})`);
        await sleep(delay);
        continue;
      }

      throw error;
    }
  }
}