import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ApiError } from "../lib/errors";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: err.flatten()
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      status: "error",
      message: err.message,
      details: err.details
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    return res.status(409).json({
      status: "error",
      message: "Resource already exists",
      meta: err.meta
    });
  }

  console.error(err);
  return res.status(500).json({ status: "error", message: "Internal server error" });
}
