import axios from "axios";
import { Platform } from "react-native";
import { supabase } from "../utils/supabase";

const fallbackHost =
  Platform.OS === "web" ? "http://localhost:9001" : "http://192.168.1.226:9001";

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL ?? fallbackHost,
  headers: {
    "Content-Type": "application/json",
  }
});

client.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Extract the server's error message from the response body so callers see it
client.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      error !== null &&
      typeof error === "object" &&
      "response" in error &&
      error.response !== null &&
      typeof error.response === "object" &&
      "data" in error.response &&
      error.response.data !== null &&
      typeof error.response.data === "object" &&
      "error" in error.response.data &&
      typeof error.response.data.error === "string"
    ) {
      return Promise.reject(new Error(error.response.data.error));
    }
    return Promise.reject(error);
  },
);

export default client;
