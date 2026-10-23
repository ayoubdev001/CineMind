//getMovies logic from the backend
import api from "./api";

export async function getMovies(params = {}) {
  const response = await api.get("/api/movies", { params });
  return response.data; // { data: [...movies], pagination: {...} }
}

export async function getMovieById(id) {
  const response = await api.get(`/api/movies/${id}`);
  return response.data; // the movie, with its genres
}

//get similler movies
export async function getSimilarMovies(id) {
  const response = await api.get(`/api/movies/${id}/similar`);
  return response.data;
}
