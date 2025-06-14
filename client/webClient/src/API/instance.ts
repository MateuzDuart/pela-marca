import axios from "axios";

export const Instance = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    'Content-Type': 'application/json'
  }
});

Instance.defaults.withCredentials = true;
