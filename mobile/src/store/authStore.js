import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import * as authService from "../services/authService";
import { setUnauthorizedHandler } from "../services/api";

// must match the key used in api.js
const TOKEN_KEY = "token";

function getErrorMessage(error) {
  const data = error.response?.data;

  if (data?.error) return data.error; // { error: "..." } from the error handler
  if (data?.errors?.length) return data.errors[0].message; // validation errors (422)
  if (error.response) return "Something went wrong. Please try again.";

  // no response at all: server off, wrong IP, no network, or timeout
  return "Cannot reach the server. Check your connection.";
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
      return true;
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ user: null, token: null, error: null });
  },

  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) return;
      const { user } = await authService.getMe();
      set({ user, token });
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
