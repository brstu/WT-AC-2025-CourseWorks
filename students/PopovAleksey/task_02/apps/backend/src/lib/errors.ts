export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function unauthorized(message = "Unauthorized") {
  return new ApiError(401, message);
}

export function badRequest(message = "Bad request", details?: unknown) {
  return new ApiError(400, message, details);
}

export function forbidden(message = "Forbidden") {
  return new ApiError(403, message);
}
