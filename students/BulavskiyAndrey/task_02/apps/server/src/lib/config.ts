import "dotenv/config";
import ms from "ms";

const required = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(`Missing required env ${name}`);
  }
  return value;
};

const parseOrigins = (raw: string | undefined) => {
  if (!raw) return [] as string[];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseTtl = (value: string | undefined, fallback: string): string => {
  if (!value) return fallback;
  ms(value);
  return value;
};

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid numeric value: ${value}`);
  }
  return parsed;
};

export const config = {
  env: process.env.NODE_ENV ?? "development",
  host: process.env.SERVER_HOST ?? "0.0.0.0",
  port: Number(process.env.SERVER_PORT ?? 3000),
  corsOrigins: parseOrigins(process.env.CORS_ORIGIN),
  logLevel: process.env.LOG_LEVEL,
  redisUrl: process.env.REDIS_URL,
  accessTokenSecret: required(process.env.JWT_ACCESS_SECRET, "JWT_ACCESS_SECRET"),
  refreshTokenSecret: required(process.env.JWT_REFRESH_SECRET, "JWT_REFRESH_SECRET"),
  accessTokenTtl: parseTtl(process.env.JWT_ACCESS_TTL, "15m"),
  refreshTokenTtl: parseTtl(process.env.JWT_REFRESH_TTL, "7d"),
  cookieSecure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
  cookieSameSite: (process.env.COOKIE_SAMESITE as "lax" | "strict" | "none" | undefined) ?? "lax",
  cacheTtl: {
    short: parsePositiveInt(process.env.CACHE_TTL_SHORT, 30),
    medium: parsePositiveInt(process.env.CACHE_TTL_MEDIUM, 300),
    long: parsePositiveInt(process.env.CACHE_TTL_LONG, 3600)
  }
};

export const isProduction = config.env === "production";

