import axios from "axios";

// В production (Docker) всегда используем относительный путь /api (проксируется через nginx)
// В development используем полный URL
const apiBaseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
