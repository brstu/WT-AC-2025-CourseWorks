import redis, { ensureRedisConnection } from "./redis.js";
import { logger } from "./logger.js";

const deserialize = <T>(value: string): T => {
  try {
    return JSON.parse(value) as T;
  } catch (_err) {
    return value as unknown as T;
  }
};

export const getCachedData = async <T>(key: string, ttlSeconds: number, fetchFn: () => Promise<T>): Promise<T> => {
  if (!redis) {
    return fetchFn();
  }

  try {
    const connected = await ensureRedisConnection();
    if (!connected) {
      return fetchFn();
    }

    const cached = await redis.get(key);
    if (cached) {
      return deserialize<T>(cached);
    }

    const data = await fetchFn();
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(data));
    } catch (err) {
      logger.warn({ err, key }, "Failed to set cache value");
    }
    return data;
  } catch (err) {
    logger.warn({ err, key }, "Cache fetch failed, falling back to source");
    return fetchFn();
  }
};

export const invalidateByPattern = async (pattern: string): Promise<void> => {
  if (!redis) return;

  try {
    const connected = await ensureRedisConnection();
    if (!connected) return;

    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    logger.warn({ err, pattern }, "Failed to invalidate cache pattern");
  }
};

