import axios from "axios";

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL ?? "http://localhost:9001",
  headers: {
    "Content-Type": "application/json",
  }
});

export default client;