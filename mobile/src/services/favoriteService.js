// link the favorite backend for add or get Favorite and delete

import api from "./api";

export async function getFavorites() {
  const response = await api.get("/api/favorites");
  return response.data; // [{ id, userId, movieId, createdAt, Movie: {...} }]
}

export async function addFavorite(movieId) {
  const response = await api.post("/api/favorites", { movieId });
  return response.data; // { id, userId, movieId, createdAt } (no Movie inside)
}

export async function removeFavorite(movieId) {
  await api.delete(`/api/favorites/${movieId}`); // 204: nothing comes back
}