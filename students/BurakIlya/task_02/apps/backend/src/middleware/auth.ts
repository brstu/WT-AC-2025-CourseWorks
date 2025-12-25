import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { verifyAccessToken } from "../lib/jwt";
import { AppError } from "./error-handler";
import type { Role } from "@prisma/client";

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    role: "admin" | "user";
    email: string;
    username: string;
  };
};

export async function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError(401, "Unauthorized", "unauthorized");
    }

    const token = authHeader.slice("Bearer ".length);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, email: true, username: true }
    });

    if (!user) {
      throw new AppError(401, "Unauthorized", "unauthorized");
    }

    req.user = { id: user.id, role: user.role, email: user.email, username: user.username };
    next();
  } catch (err) {
    next(new AppError(401, "Unauthorized", "unauthorized"));
  }
}

export function requireRole(...roles: Role[]) {
  return function roleGuard(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(403, "Forbidden", "forbidden"));
    }
    next();
  };
}
