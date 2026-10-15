import { create } from "zustand";
import * as watchlistService from "../services/watchlistService";
import getErrorMessage from "../utils/getErrorMessage";

const inFlight = new Set();

const useWatchlistStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchWatchlist: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await watchlistService.getWatchlist();
      set({ items, isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
    }
  },

  toggleWatchlist: async (movie) => {
    if (inFlight.has(movie.id)) return false;
    inFlight.add(movie.id);

    const original = get().items.find((item) => item.movieId === movie.id);
    const exists = !!original;

    set((state) => ({
      items: exists
        ? state.items.filter((item) => item.movieId !== movie.id)
        : [{ id: `temp-${movie.id}`, movieId: movie.id, Movie: movie }, ...state.items],
    }));

    try {
      if (exists) await watchlistService.removeFromWatchlist(movie.id);
      else await watchlistService.addToWatchlist(movie.id);
      return true;
    } catch (error) {
      const status = error.response?.status;
      const alreadyDone = (exists && status === 404) || (!exists && status === 409);
      if (alreadyDone) return true;

      set((state) => ({
        error: getErrorMessage(error),
        items: exists
          ? [original, ...state.items]
          : state.items.filter((item) => item.movieId !== movie.id),
      }));
      return false;
    } finally {
      inFlight.delete(movie.id);
    }
  },

  clear: () => set({ items: [], isLoading: false, error: null }),
}));

export default useWatchlistStore;