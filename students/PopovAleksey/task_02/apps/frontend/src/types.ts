export type Role = "admin" | "teacher" | "student";

export type BookingStatus = "active" | "cancelled";

export type User = {
  id: string;
  email: string;
  username: string;
  role: Role;
};

export type Room = {
  id: string;
  name: string;
  description?: string | null;
  capacity: number;
  equipment?: string | null;
  location: string;
};

export type Booking = {
  id: string;
  roomId: string;
  userId: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: BookingStatus;
  room?: Room;
};

export type Paginated<T> = {
  data: T[];
  total: number;
  limit: number;
  offset: number;
};

export type ApiErrorShape = { status?: string; message?: string } | { error?: string } | { detail?: string } | null;
