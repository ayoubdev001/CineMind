import { create } from "zustand";
import * as favoriteService from "../services/favoriteService";
import getErrorMessage from "../utils/getErrorMessage";

// movie ids that have a request running right now (not shown on screen,
// so it lives outside the store state)
const inFlight = new Set();

const useFavoritesStore = create((set, get) => ({
  items: [], // [{ id, movieId, Movie: {...} }], newest first
  isLoading: false,
  error: null,

  fetchFavorites: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await favoriteService.getFavorites();
      set({ items, isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
    }
  },

  // Add the movie if it isn't a favorite yet, remove it if it is.
  // Returns true on success, false if the server refused.
  toggleFavorite: async (movie) => {
    if (inFlight.has(movie.id)) return false;
    inFlight.add(movie.id);

    const original = get().items.find((item) => item.movieId === movie.id);
    const exists = !!original;

    // 1. Update the screen right away, before asking the server
    set((state) => ({
      items: exists
        ? state.items.filter((item) => item.movieId !== movie.id)
        : [{ id: `temp-${movie.id}`, movieId: movie.id, Movie: movie }, ...state.items],
    }));

    try {
      // 2. Tell the server
      if (exists) await favoriteService.removeFavorite(movie.id);
      else await favoriteService.addFavorite(movie.id);
      return true;
    } catch (error) {
      const status = error.response?.status;
      const alreadyDone = (exists && status === 404) || (!exists && status === 409);
      if (alreadyDone) return true; // the server already has what we wanted

      // 3. The server said no: undo only this change
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

  // Called on logout so the next user doesn't see these
  clear: () => set({ items: [], isLoading: false, error: null }),
}));

export default useFavoritesStore;