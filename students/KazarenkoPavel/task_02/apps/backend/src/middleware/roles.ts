import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError";

export function requireRole(roles: Array<"admin" | "user">) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError(401, "Unauthorized", "unauthorized"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, "Forbidden", "forbidden"));
    }

    next();
  };
}

export function isAdmin(req: Request) {
  return req.user?.role === "admin";
}
