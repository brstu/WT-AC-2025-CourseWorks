export type Role = "admin" | "user";

export type User = {
  id: string;
  email: string;
  username: string;
  role: Role;
};

export type Category = {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
};

export type HelpRequestStatus = "new" | "assigned" | "in_progress" | "completed" | "cancelled";

export type AssignmentStatus = "assigned" | "in_progress" | "completed" | "cancelled";

export type HelpRequest = {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string;
  status: HelpRequestStatus;
  locationAddress: string;
  locationLat?: number | null;
  locationLng?: number | null;
  createdAt?: string;
  updatedAt?: string;
  category?: Category;
  assignments?: Assignment[];
};

export type VolunteerProfile = {
  id: string;
  userId: string;
  bio?: string | null;
  rating: number;
  totalHelps: number;
  locationLat?: number | null;
  locationLng?: number | null;
  user?: Pick<User, "id" | "email" | "username">;
};

export type Assignment = {
  id: string;
  requestId: string;
  volunteerId: string;
  status: AssignmentStatus;
  assignedAt?: string;
  completedAt?: string | null;
  request?: HelpRequest;
};

export type Review = {
  id: string;
  assignmentId: string;
  userId: string;
  volunteerId: string;
  rating: number;
  comment?: string | null;
  createdAt?: string;
};

export type ApiErrorPayload = {
  message: string;
  code?: string;
  fields?: Record<string, string[]>;
};

export type ApiErrorResponse = {
  status: "error";
  error: ApiErrorPayload;
};

export type ApiOkResponse<T> = {
  status: "ok";
  data: T;
};

export type ApiResponse<T> = ApiOkResponse<T> | ApiErrorResponse;

export function isApiError<T>(resp: ApiResponse<T>): resp is ApiErrorResponse {
  return resp.status === "error";
}
