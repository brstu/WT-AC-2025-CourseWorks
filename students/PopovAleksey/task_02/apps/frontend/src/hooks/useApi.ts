import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { createRoomsApi } from "../api/rooms";
import { createBookingsApi } from "../api/bookings";
import { createScheduleApi } from "../api/schedule";
import { createAuthApi } from "../api/auth";

export function useApi() {
  const { client } = useAuth();
  return useMemo(() => {
    return {
      auth: createAuthApi(client),
      rooms: createRoomsApi(client),
      bookings: createBookingsApi(client),
      schedule: createScheduleApi(client)
    };
  }, [client]);
}
