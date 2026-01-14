import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { checkRedis } from "../lib/redis.js";

const router = Router();

// Liveness probe - checks if the server is running
router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "variant-33-organizer"
  });
});

// Readiness probe - checks if the server is ready to accept traffic
router.get(
  "/ready",
  asyncHandler(async (_req: import("express").Request, res: import("express").Response) => {
    const checks: Record<string, unknown> = {};
    let hasCriticalFailure = false;
    let hasDegradedCheck = false;

    const dbStarted = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = { status: "ok", responseTime: Date.now() - dbStarted };
    } catch (err) {
      checks.database = {
        status: "error",
        error: err instanceof Error ? err.message : "Database connection failed"
      };
      hasCriticalFailure = true;
    }

    const redisResult = await checkRedis();
    if (redisResult.ok) {
      checks.redis = { status: "ok", responseTime: redisResult.responseTime ?? null };
    } else {
      checks.redis = { status: "error", error: redisResult.error };
      hasDegradedCheck = true;
    }

    const status = hasCriticalFailure || hasDegradedCheck ? "degraded" : "ok";
    const httpStatus = hasCriticalFailure ? 503 : 200;

    res.status(httpStatus).json({
      status,
      timestamp: new Date().toISOString(),
      checks
    });
  })
);

export const healthRouter = router;


