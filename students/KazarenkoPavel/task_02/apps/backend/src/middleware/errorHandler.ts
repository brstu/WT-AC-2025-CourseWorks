import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";

// Centralized error handler to keep responses consistent and human-readable.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) {
      const path = issue.path.join(".") || "root";
      fields[path] = issue.message;
    }
    return res.status(400).json({ status: "error", error: { code: "validation_failed", message: "Validation failed", fields } });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ status: "error", error: { code: err.code ?? "error", message: err.message } });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res
        .status(409)
        .json({ status: "error", error: { code: "conflict", message: "Resource already exists" } });
    }
  }

  if (err instanceof jwt.TokenExpiredError) {
    return res.status(401).json({ status: "error", error: { code: "token_expired", message: "Token expired" } });
  }

  if (err instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({ status: "error", error: { code: "invalid_token", message: "Invalid token" } });
  }

  if (typeof err === "object" && err !== null && "status" in err && typeof (err as any).status === "number") {
    const status = (err as any).status as number;
    const message = (err as any).message ?? "Error";
    const code = (err as any).code ?? "error";
    const fields = (err as any).fields;
    return res.status(status).json({ status: "error", error: { code, message, fields } });
  }

  console.error("Unhandled error", err);
  return res.status(500).json({ status: "error", error: { code: "internal_error", message: "Internal server error" } });
}
