import RedisImport from "ioredis";
import type { Redis as RedisClient } from "ioredis";
import { config } from "./config.js";
import { logger } from "./logger.js";

const Redis = RedisImport as unknown as new (...args: any[]) => RedisClient;

let redis: RedisClient | null = null;

const createRedisClient = (): RedisClient | null => {
  if (!config.redisUrl) {
    logger.info("Redis not configured, caching disabled");
    return null;
  }

  const client = new Redis(config.redisUrl, {
    lazyConnect: true,
    retryStrategy: () => null,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false
  });

  client.on("error", (err: Error & { code?: string }) => {
    if (err.code !== "ECONNREFUSED") {
      logger.error({ err }, "Redis connection error");
    }
  });
  client.on("connect", () => logger.info("Redis connected"));

  return client;
};

redis = createRedisClient();

export const ensureRedisConnection = async (): Promise<boolean> => {
  if (!redis) return false;
  if (redis.status === "ready") return true;
  try {
    await redis.connect();
    return true;
  } catch (err) {
    return false;
  }
};

export const checkRedis = async (): Promise<{ ok: boolean; responseTime?: number; error?: string }> => {
  if (!redis) {
    return { ok: true };
  }

  try {
    const start = Date.now();
    const connected = await ensureRedisConnection();
    if (!connected) {
      return { ok: false, error: "Redis unreachable" };
    }
    await redis.ping();
    return { ok: true, responseTime: Date.now() - start };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown redis error";
    return { ok: false, error };
  }
};

export default redis;

