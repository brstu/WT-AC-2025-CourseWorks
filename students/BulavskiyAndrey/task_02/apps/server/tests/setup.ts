import { afterEach, vi } from "vitest";

process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "test-access-secret";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "test-refresh-secret";
process.env.JWT_ACCESS_TTL = process.env.JWT_ACCESS_TTL ?? "15m";
process.env.JWT_REFRESH_TTL = process.env.JWT_REFRESH_TTL ?? "7d";
process.env.COOKIE_SECURE = process.env.COOKIE_SECURE ?? "false";
process.env.COOKIE_SAMESITE = process.env.COOKIE_SAMESITE ?? "lax";
process.env.DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://test:test@localhost:5432/test_db";

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

