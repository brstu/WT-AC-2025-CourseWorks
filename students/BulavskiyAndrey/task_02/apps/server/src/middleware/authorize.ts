import type { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/errors.js";

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "Unauthorized", "unauthorized"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "Forbidden", "forbidden"));
    }
    return next();
  };
};

