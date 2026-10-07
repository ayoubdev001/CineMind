import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Change this to your backend's address.
// "localhost" won't work on a phone/emulator — use your computer's local IP instead (e.g. http://192.168.1.10:3000)
const BASE_URL = "http://192.168.1.202:3000";

const api = axios.create({
  baseURL: BASE_URL,
});

// Before every request, attach the saved token (if we have one)
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server says our token is invalid/expired, clear it
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("token");
      // later: also redirect to login here, once routing is wired up
    }
    return Promise.reject(error);
  }
);

export default api;