import axios from "axios";
import Constants from "expo-constants";
import { NativeModules, Platform } from "react-native";
import { supabase } from "../utils/supabase";

const API_PORT = "9001";

function getExpoDevServerHost() {
  const constants = Constants as typeof Constants & {
    manifest?: { debuggerHost?: string };
  };
  const scriptURL =
    typeof NativeModules.SourceCode?.scriptURL === "string"
      ? NativeModules.SourceCode.scriptURL
      : undefined;
  const scriptHost = scriptURL?.match(/^https?:\/\/([^:/]+)/)?.[1];
  const hostUri =
    Constants.expoConfig?.hostUri ?? constants.manifest?.debuggerHost;
  const host = scriptHost ?? hostUri?.split(":")[0];

  return host ? `http://${host}:${API_PORT}` : undefined;
}

function getApiBaseUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_SERVER_URL;

  if (Platform.OS === "web") {
    return configuredUrl || `http://localhost:${API_PORT}`;
  }

  if (
    configuredUrl &&
    !configuredUrl.includes("localhost") &&
    !configuredUrl.includes("127.0.0.1")
  ) {
    return configuredUrl;
  }

  return getExpoDevServerHost() || configuredUrl || `http://localhost:${API_PORT}`;
}

const client = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  }
});

export const apiBaseUrl = getApiBaseUrl();

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
