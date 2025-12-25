import { ApiClient } from "./client";
import type { Booking } from "../types";

export function createScheduleApi(client: ApiClient) {
  return {
    byRoom: (params: { roomId: string; date?: string; from?: string; to?: string }) => {
      const search = new URLSearchParams();
      search.set("roomId", params.roomId);
      if (params.date) search.set("date", params.date);
      if (params.from) search.set("from", params.from);
      if (params.to) search.set("to", params.to);
      const query = search.toString();
      return client.request<{ data: Booking[] }>(`/schedule?${query}`);
    },
    conflicts: (params: { roomId: string; startTime: string; endTime: string }) => {
      const search = new URLSearchParams();
      search.set("roomId", params.roomId);
      search.set("startTime", params.startTime);
      search.set("endTime", params.endTime);
      const query = search.toString();
      return client.request<{ hasConflicts: boolean; conflicts: Booking[] }>(`/schedule/conflicts?${query}`);
    }
  };
}
