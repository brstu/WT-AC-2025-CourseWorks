import { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/errors";
import { clearCookieOptions, getRefreshCookieName } from "../services/authService";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    if (err.status === 401) {
      res.clearCookie(getRefreshCookieName(), clearCookieOptions);
    }
    return res.status(err.status).json({
      status: "error",
      error: {
        code: err.code,
        message: err.message,
        fields: err.fields
      }
    });
  }

  console.error(err);
  return res.status(500).json({
    status: "error",
    error: {
      code: "internal_error",
      message: "Unexpected server error"
    }
  });
}
