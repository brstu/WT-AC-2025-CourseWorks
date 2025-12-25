import { Prisma } from "@prisma/client";
import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ status: "error", error: { message: err.message, code: err.code } });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "error",
      error: {
        message: "Validation failed",
        code: "validation_failed",
        fields: err.flatten().fieldErrors
      }
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        status: "error",
        error: { message: "Resource already exists", code: "conflict", meta: err.meta }
      });
    }
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  return res.status(500).json({ status: "error", error: { message, code: "internal_error" } });
}
