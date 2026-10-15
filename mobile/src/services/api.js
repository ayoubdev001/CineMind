import axios from "axios";
import * as SecureStore from "expo-secure-store";


const BASE_URL = "http://192.168.1.210:3000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout:10000,
});

// Before every request, attach the saved token (if we have one)
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

// If the server rejects our token, log the user out
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const hadToken = !!error.config?.headers?.Authorization;
    if (error.response?.status === 401 && hadToken && onUnauthorized) {
      await onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;