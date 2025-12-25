import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/jwt";
import { unauthorized, forbidden } from "../lib/errors";

export type AuthUser = { id: string; role: Role };

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(unauthorized("Missing access token"));
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    const payload = verifyAccessToken(token);
    if (payload.type !== "access") {
      return next(unauthorized("Invalid access token type"));
    }
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (err) {
    return next(unauthorized("Invalid or expired access token"));
  }
}

export function requireRole(roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(forbidden());
    }
    return next();
  };
}
