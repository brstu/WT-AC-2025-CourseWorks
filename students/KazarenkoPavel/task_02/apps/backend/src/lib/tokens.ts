import jwt from "jsonwebtoken";
import ms from "ms";
import { env } from "../config/env";
import { AccessTokenPayload, AuthUser, RefreshTokenPayload } from "../types/jwt";

const accessTtlMs = ms(env.JWT_ACCESS_TTL);
const refreshTtlMs = ms(env.JWT_REFRESH_TTL);

if (accessTtlMs === undefined) {
  throw new Error("Invalid JWT_ACCESS_TTL format");
}

if (refreshTtlMs === undefined) {
  throw new Error("Invalid JWT_REFRESH_TTL format");
}

export const accessTokenTtlMs = accessTtlMs;
export const refreshTokenTtlMs = refreshTtlMs;

export function signAccessToken(user: AuthUser): { token: string; expiresAt: Date } {
  const payload: Omit<AccessTokenPayload, "iat" | "exp"> = {
    sub: user.id,
    role: user.role,
    tokenType: "access"
  };

  const token = jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_TTL });
  const expiresAt = new Date(Date.now() + accessTtlMs);
  return { token, expiresAt };
}

export function signRefreshToken(user: AuthUser, jti: string): { token: string; expiresAt: Date } {
  const payload: Omit<RefreshTokenPayload, "iat" | "exp"> = {
    sub: user.id,
    role: user.role,
    jti,
    tokenType: "refresh"
  };

  const token = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_TTL });
  const expiresAt = new Date(Date.now() + refreshTtlMs);
  return { token, expiresAt };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  if (payload.tokenType !== "access") {
    throw new Error("Invalid token type");
  }
  return payload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  if (payload.tokenType !== "refresh") {
    throw new Error("Invalid token type");
  }
  return payload;
}
