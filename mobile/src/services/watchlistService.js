// like the favorite but to watch it later 
import api from "./api";

export async function getWatchlist() {
  const response = await api.get("/api/watchlist");
  return response.data;
}

export async function addToWatchlist(movieId) {
  const response = await api.post("/api/watchlist", { movieId });
  return response.data;
}

export async function removeFromWatchlist(movieId) {
  await api.delete(`/api/watchlist/${movieId}`);
}