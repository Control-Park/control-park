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
  console.log("Attaching token to request:", Boolean(token));
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
