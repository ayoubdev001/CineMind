import api from "./api";

export async function sendMessage(message) {

  const response = await api.post(
    "/api/ai/chat",
    { message },
    { timeout: 60000 }
  );
  return response.data;
}