import { ZodError } from "zod";
import { logger } from "../lib/logger.js";
import { AppError, isAppError } from "../lib/errors.js";
import type { Request, Response, NextFunction } from "express";

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "error",
      error: {
        code: "validation_failed",
        message: "Validation failed",
        fields: err.flatten()
      }
    });
  }

  if (isAppError(err)) {
    logger.warn({ err }, "handled application error");
    return res.status(err.statusCode).json({
      status: "error",
      error: { code: err.code, message: err.message }
    });
  }

  logger.error({ err }, "unhandled error");
  return res.status(500).json({
    status: "error",
    error: { code: "internal_error", message: "Something went wrong" }
  });
};

