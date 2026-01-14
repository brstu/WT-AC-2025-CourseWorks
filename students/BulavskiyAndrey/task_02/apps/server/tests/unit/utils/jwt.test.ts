import { describe, expect, it } from "vitest";
import {
  signAccessToken,
  signRefreshToken,
  ttlToMs,
  verifyAccessToken,
  verifyRefreshToken
} from "../../../src/lib/jwt.js";

describe("jwt utils", () => {
  it("signs and verifies access tokens", () => {
    const token = signAccessToken({ sub: "user-1", role: "user" });
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe("user-1");
    expect(payload.role).toBe("user");
  });

  it("signs and verifies refresh tokens with jti", () => {
    const token = signRefreshToken({ sub: "user-2", role: "user", jti: "jti-123" });
    const payload = verifyRefreshToken(token);
    expect(payload.sub).toBe("user-2");
    expect(payload.role).toBe("user");
    expect(payload.jti).toBe("jti-123");
  });

  it("converts ttl string to milliseconds", () => {
    expect(ttlToMs("1h")).toBe(60 * 60 * 1000);
  });
});

