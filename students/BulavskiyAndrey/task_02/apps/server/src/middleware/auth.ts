import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt.js";
import { AppError } from "../lib/errors.js";

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers["authorization"];
  if (!header || Array.isArray(header)) {
    return next(new AppError(401, "Authorization header missing", "unauthorized"));
  }
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(new AppError(401, "Invalid authorization format", "unauthorized"));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (_err) {
    return next(new AppError(401, "Invalid or expired access token", "unauthorized"));
  }
};

export const authenticateOptional = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers["authorization"];
  if (!header) return next();
  if (Array.isArray(header)) {
    return next(new AppError(401, "Invalid authorization header", "unauthorized"));
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(new AppError(401, "Invalid authorization format", "unauthorized"));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (_err) {
    return next(new AppError(401, "Invalid or expired access token", "unauthorized"));
  }
};

