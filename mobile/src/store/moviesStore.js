//manages movie-related state is it trending or popular ...

import { create } from "zustand";
import * as movieService from "../services/movieService";
import getErrorMessage from "../utils/getErrorMessage";

const LIMIT = 20;

const useMoviesStore = create((set, get) => ({
  movies: [],
  page: 0,
  totalPages: 1,
  isLoading: false, // first load: full-screen spinner
  isRefreshing: false, // pull-to-refresh
  isLoadingMore: false, // spinner at the bottom of the grid
  error: null,

  // First load, and also used for pull-to-refresh
  fetchMovies: async ({ refresh = false } = {}) => {
    const { isLoading, isRefreshing } = get();
    if (isLoading || isRefreshing) return;

    set(refresh ? { isRefreshing: true, error: null } : { isLoading: true, error: null });
    try {
      const { data, pagination } = await movieService.getMovies({
        nowPlaying: true,
        page: 1,
        limit: LIMIT,
      });
      set({
        movies: data,
        page: 1,
        totalPages: pagination.totalPages,
        isLoading: false,
        isRefreshing: false,
      });
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false, isRefreshing: false });
    }
  },

  // Next page, appended to the end of the list
  fetchMore: async () => {
    const { page, totalPages, isLoading, isRefreshing, isLoadingMore } = get();
    if (page === 0 || page >= totalPages) return;
    if (isLoading || isRefreshing || isLoadingMore) return;

    set({ isLoadingMore: true });
    try {
      const { data } = await movieService.getMovies({
        nowPlaying: true,
        page: page + 1,
        limit: LIMIT,
      });
      set((state) => ({
        movies: [...state.movies, ...data],
        page: page + 1,
        isLoadingMore: false,
      }));
    } catch (error) {
      set({ isLoadingMore: false }); // stay quiet: the user can scroll again to retry
    }
  },
}));

export default useMoviesStore;