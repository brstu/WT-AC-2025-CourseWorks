import { ApiClient, jsonBody } from "./client";
import type { Booking, Paginated } from "../types";

export type BookingCreateInput = {
  roomId: string;
  startTime: string;
  endTime: string;
  purpose: string;
};

export type BookingUpdateInput = {
  startTime: string;
  endTime: string;
};

export function createBookingsApi(client: ApiClient) {
  return {
    list: (params?: { limit?: number; offset?: number; roomId?: string; status?: string; userId?: string }) => {
      const search = new URLSearchParams();
      if (params?.limit) search.set("limit", String(params.limit));
      if (params?.offset) search.set("offset", String(params.offset));
      if (params?.roomId) search.set("roomId", params.roomId);
      if (params?.status) search.set("status", params.status);
      if (params?.userId) search.set("userId", params.userId);
      const query = search.toString();
      return client.request<Paginated<Booking>>(`/bookings${query ? `?${query}` : ""}`);
    },
    get: (id: string) => client.request<{ data: Booking }>(`/bookings/${id}`),
    create: (payload: BookingCreateInput) => client.request<{ data: Booking }>("/bookings", { method: "POST", ...jsonBody(payload) }),
    update: (id: string, payload: BookingUpdateInput) =>
      client.request<{ data: Booking }>(`/bookings/${id}`, { method: "PUT", ...jsonBody(payload) }),
    cancel: (id: string) => client.request<void>(`/bookings/${id}`, { method: "DELETE" })
  };
}
