import axios from "axios";
import type { AuthResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

// Храним access token в памяти
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// Коллбек для обработки ошибок авторизации
let onAuthError: (() => void) | null = null;

export const setOnAuthError = (callback: () => void) => {
  onAuthError = callback;
};

const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Для refresh token в httpOnly cookie
});

// Interceptor для добавления access token
http.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Interceptor для обработки ошибок и refresh токена
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 и это не был refresh запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Пробуем обновить токен
        const response = await axios.post<{ status: string; data: AuthResponse }>(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (response.data.status === "ok" && response.data.data.accessToken) {
          accessToken = response.data.data.accessToken;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return http(originalRequest);
        }
      } catch (refreshError) {
        // Если refresh не удался, очищаем токен и вызываем коллбек
        accessToken = null;
        if (onAuthError) {
          onAuthError();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Универсальная функция для API запросов
export const apiRequest = async <T>(
  url: string,
  options?: {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    data?: unknown;
    params?: Record<string, unknown>;
  }
): Promise<T> => {
  const response = await http.request<T>({
    url,
    method: options?.method || "GET",
    data: options?.data,
    params: options?.params,
  });
  return response.data;
};

export const api = {
  health: () => http.get("/health"),
  getAnnouncements: (groupId: string) => http.get(`/groups/${groupId}/announcements`),
  createAnnouncement: (groupId: string, payload: { title: string; content: string }) =>
    http.post(`/groups/${groupId}/announcements`, payload),

  getFiles: (groupId: string) => http.get(`/groups/${groupId}/files`),
  uploadFile: (
    groupId: string,
    payload: { name: string; fileSize: number; mimeType: string; description?: string }
  ) => http.post(`/groups/${groupId}/files`, payload),
  deleteFile: (groupId: string, id: string) => http.delete(`/groups/${groupId}/files/${id}`),

  getEvents: (groupId: string) => http.get(`/groups/${groupId}/calendar`),
  createEvent: (
    groupId: string,
    payload: { title: string; startAt: string; type: string; description?: string }
  ) => http.post(`/groups/${groupId}/calendar`, payload),

  getPolls: (groupId: string) => http.get(`/groups/${groupId}/polls`),
  createPoll: (
    groupId: string,
    payload: { question: string; choices: { text: string }[]; isMultipleChoice?: boolean }
  ) => http.post(`/groups/${groupId}/polls`, payload),
  vote: (groupId: string, pollId: string, choiceIds: string[]) =>
    http.post(`/groups/${groupId}/polls/${pollId}/votes`, { choiceIds }),

  getChats: (groupId: string) => http.get(`/groups/${groupId}/chats`),
  createChat: (groupId: string, payload: { title: string; type: string }) =>
    http.post(`/groups/${groupId}/chats`, payload),
  getMessages: (groupId: string, chatId: string) =>
    http.get(`/groups/${groupId}/chats/${chatId}/messages`),
  sendMessage: (groupId: string, chatId: string, payload: { content: string }) =>
    http.post(`/groups/${groupId}/chats/${chatId}/messages`, payload),
};

export { API_BASE_URL };
