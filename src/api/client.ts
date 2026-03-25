import axios from "axios";
import { supabase } from "../utils/supabase";

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL ?? "http://localhost:9001",
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

export default client;