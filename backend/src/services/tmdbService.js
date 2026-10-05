const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";


//api logic from tmdb
async function tmdbFetch(path, params = {}) {
  const url = new URL(TMDB_BASE + path);
  url.searchParams.set("api_key", process.env.TMDB_API_KEY);
  url.searchParams.set("language", "en-US");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB request failed: ${res.status} ${path}`);
  return res.json();
}

export const fetchGenres = (type) => tmdbFetch(`/genre/${type}/list`);
export const fetchPopular = (type, page) => tmdbFetch(`/${type}/popular`, { page });
export const posterUrl = (path) => (path ? IMAGE_BASE + path : null);
export const fetchNowPlaying = (page) => tmdbFetch("/movie/now_playing", { page });