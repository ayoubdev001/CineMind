import { SYSTEM_PROMPT } from "../constants/systemPrompt.js";
import { searchCatalog } from "./airetrieverService.js";
import { generateChatReply } from "./geminiService.js";

export async function answerQuestion(userMessage) {
  const matches = await searchCatalog(userMessage, 5);

  const context = matches
    .map((m) => `- ${m.title} (${m.mediaType}): ${m.overview ?? "No overview available."}`)
    .join("\n");

  const prompt = `Retrieved catalog context:\n${context}\n\nUser question: ${userMessage}`;

  const reply = await generateChatReply(SYSTEM_PROMPT, prompt);
  return { reply, sources: matches.map((m) => ({ id: m.id, title: m.title })) };
}