import { ApiClient, jsonBody } from "./client";
import type { Room } from "../types";

export function createRoomsApi(client: ApiClient) {
  return {
    list: (filters?: { capacity?: number; equipment?: string }) => {
      const params = new URLSearchParams();
      if (filters?.capacity) params.set("capacity", String(filters.capacity));
      if (filters?.equipment) params.set("equipment", filters.equipment);
      const q = params.toString();
      return client.request<{ data: Room[] }>(`/rooms${q ? `?${q}` : ""}`);
    },
    create: (payload: Omit<Room, "id">) => client.request<{ data: Room }>("/rooms", { method: "POST", ...jsonBody(payload) }),
    update: (id: string, payload: Partial<Omit<Room, "id">>) =>
      client.request<{ data: Room }>(`/rooms/${id}`, { method: "PUT", ...jsonBody(payload) }),
    remove: (id: string) => client.request<void>(`/rooms/${id}`, { method: "DELETE" })
  };
}
