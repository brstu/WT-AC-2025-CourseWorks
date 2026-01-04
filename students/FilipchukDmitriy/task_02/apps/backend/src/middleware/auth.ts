import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { verifyAccessToken } from "../lib/jwt";
import { HttpError } from "../lib/errors";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new HttpError(401, "unauthorized", "Authorization header missing");
  }
  const token = header.substring("Bearer ".length);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role as Role };
    return next();
  } catch (err) {
    throw new HttpError(401, "unauthorized", "Invalid or expired access token");
  }
}
