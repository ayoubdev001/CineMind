import { answerQuestion } from "../services/chatService.js";

export async function chat(req, res) {
  try {
    const result = await answerQuestion(req.userId, req.body.message);
    res.json(result);
  } catch (error) {
    if (error.message === "AI_QUOTA_EXCEEDED") {
      return res.status(429).json({ error: "AI quota exceeded, try again later" });
    }
    if (error?.status === 503) {
      return res.status(503).json({ error: "AI service is busy, please try again in a moment" });
    }
    throw error;
  }
}