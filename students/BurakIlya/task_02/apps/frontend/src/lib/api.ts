import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import type {
  ApiResponse,
  User,
  Category,
  HelpRequest,
  VolunteerProfile,
  Assignment,
  Review,
  AssignmentStatus,
  HelpRequestStatus
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type AuthAxiosRequestConfig = AxiosRequestConfig & { _retry?: boolean; _skipAuthRefresh?: boolean };

let accessToken: string | null = null;
let accessTokenListener: ((token: string | null) => void) | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  accessTokenListener?.(token);
}

export function setAccessTokenListener(listener: ((token: string | null) => void) | null) {
  accessTokenListener = listener;
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

const plainApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

function requiresAuth(url?: string) {
  if (!url) return true;
  const pathname = new URL(url, API_URL).pathname;
  return !["/auth/login", "/auth/register", "/auth/refresh", "/health"].some((path) => pathname.startsWith(path));
}

export async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = plainApi
    .post("/auth/refresh", {}, { _skipAuthRefresh: true } as AuthAxiosRequestConfig)
    .then(({ data }) => {
      if (data.status !== "ok") {
        throw new Error(data.error?.message || "Refresh failed");
      }
      const token = (data.data as { accessToken: string }).accessToken;
      setAccessToken(token);
      return token;
    })
    .catch((err) => {
      setAccessToken(null);
      throw err;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as AuthAxiosRequestConfig | undefined;

    if (status === 401 && originalRequest && !originalRequest._retry && !originalRequest._skipAuthRefresh && requiresAuth(originalRequest.url)) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api.request(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
      }
    }

    return Promise.reject(error);
  }
);

async function request<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise;
  if (data.status === "error") {
    const error = new Error(data.error.message);
    (error as any).code = data.error.code;
    (error as any).fields = data.error.fields;
    throw error;
  }
  return data.data;
}

// Auth
export function login(email: string, password: string) {
  return request<{ user: User; accessToken: string }>(api.post("/auth/login", { email, password }));
}

export function register(payload: { email: string; username: string; password: string }) {
  return request<{ user: User; accessToken: string }>(api.post("/auth/register", payload));
}

export function logout() {
  return request<{ message: string }>(api.post("/auth/logout", {}));
}

export function getMe() {
  return request<{ user: User }>(api.get("/users/me"));
}

// Categories
export function listCategories() {
  return request<{ items: Category[]; total: number; limit: number; offset: number }>(api.get("/categories"));
}

export function createCategory(payload: { name: string; description?: string; icon?: string }) {
  return request<Category>(api.post("/categories", payload));
}

export function updateCategory(id: string, payload: Partial<{ name: string; description?: string; icon?: string }>) {
  return request<Category>(api.put(`/categories/${id}`, payload));
}

export function deleteCategory(id: string) {
  return request<{ id: string }>(api.delete(`/categories/${id}`));
}

// Requests
export function listRequests(params?: { status?: HelpRequestStatus; categoryId?: string }) {
  return request<{ items: HelpRequest[]; total: number; limit: number; offset: number }>(api.get("/requests", { params }));
}

export function createRequest(payload: {
  title: string;
  description: string;
  categoryId: string;
  locationAddress: string;
  locationLat?: number;
  locationLng?: number;
}) {
  return request<HelpRequest>(api.post("/requests", payload));
}

export function updateRequest(id: string, payload: Partial<Omit<HelpRequest, "id" | "userId" | "categoryId">> & { categoryId?: string }) {
  return request<HelpRequest>(api.put(`/requests/${id}`, payload));
}

export function deleteRequest(id: string) {
  return request<{ id: string }>(api.delete(`/requests/${id}`));
}

// Volunteers
export function listVolunteers() {
  return request<{ items: VolunteerProfile[]; total: number; limit: number; offset: number }>(api.get("/volunteers"));
}

export function createVolunteer(payload: { bio?: string; locationLat?: number; locationLng?: number }) {
  return request<VolunteerProfile>(api.post("/volunteers", payload));
}

export function updateVolunteer(id: string, payload: Partial<{ bio?: string; locationLat?: number; locationLng?: number }>) {
  return request<VolunteerProfile>(api.put(`/volunteers/${id}`, payload));
}

export function deleteVolunteer(id: string) {
  return request<{ id: string }>(api.delete(`/volunteers/${id}`));
}

// Assignments
export function listAssignments(params?: { status?: AssignmentStatus; requestId?: string; volunteerId?: string }) {
  return request<{ items: Assignment[]; total: number; limit: number; offset: number }>(api.get("/assignments", { params }));
}

export function createAssignment(payload: { requestId: string; volunteerId?: string }) {
  return request<Assignment>(api.post("/assignments", payload));
}

export function updateAssignment(id: string, payload: { status: AssignmentStatus }) {
  return request<Assignment>(api.put(`/assignments/${id}`, payload));
}

export function deleteAssignment(id: string) {
  return request<{ id: string }>(api.delete(`/assignments/${id}`));
}

// Reviews
export function listReviews(params?: { volunteerId?: string }) {
  return request<{ items: Review[]; total: number; limit: number; offset: number }>(api.get("/reviews", { params }));
}

export function createReview(payload: { assignmentId: string; rating: number; comment?: string }) {
  return request<Review>(api.post("/reviews", payload));
}

export function updateReview(id: string, payload: Partial<{ rating: number; comment?: string }>) {
  return request<Review>(api.put(`/reviews/${id}`, payload));
}

export function deleteReview(id: string) {
  return request<{ id: string }>(api.delete(`/reviews/${id}`));
}
