import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import * as authService from "../services/authService";
import { setUnauthorizedHandler } from "../services/api";
import getErrorMessage from "../utils/getErrorMessage";

import useFavoritesStore from "./favoritesStore";
import useWatchlistStore from "./watchlistStore";

// must match the key used in api.js
const TOKEN_KEY = "token";

// load the user's favorites and watchlist in the background (not awaited,
// so login stays instant; each fetch handles its own errors)
function loadLibrary() {
  useFavoritesStore.getState().fetchFavorites();
  useWatchlistStore.getState().fetchWatchlist();
}

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isRestoring: true, // true while the app checks for a saved session at launch
  isLoading: false, // true while a login/register request is running
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.login(credentials);
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      set({ user, token, isLoading: false });
      loadLibrary(); // token is already saved, so these requests are authenticated
      return true;
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
      return false;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.register(data);
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      set({ user, token, isLoading: false });
      loadLibrary();
      return true;
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    // empty both lists so the next user never sees this user's data
    useFavoritesStore.getState().clear();
    useWatchlistStore.getState().clear();
    set({ user: null, token: null, error: null });
  },

  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) return;
      const { user } = await authService.getMe();
      set({ user, token });
      loadLibrary();
    } catch (error) {
      // token missing, expired, or server unreachable: start logged out
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      set({ user: null, token: null });
    } finally {
      set({ isRestoring: false });
    }
  },

  
  clearError: () => set({ error: null }),
}));


//log the user out 
setUnauthorizedHandler(() => useAuthStore.getState().logout());
export default useAuthStore;