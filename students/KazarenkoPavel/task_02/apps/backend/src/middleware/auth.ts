import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/tokens";
import { HttpError } from "../utils/httpError";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new HttpError(401, "Authorization header missing", "unauthorized"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (_err) {
    return next(new HttpError(401, "Invalid or expired access token", "unauthorized"));
  }
}
