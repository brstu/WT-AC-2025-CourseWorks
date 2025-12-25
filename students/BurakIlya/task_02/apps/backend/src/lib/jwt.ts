import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import crypto from "crypto";

type DurationUnit = "s" | "m" | "h" | "d";

function parseDurationToMs(value: string, fallbackMs: number) {
  const match = value.match(/^([0-9]+)([smhd])$/);
  if (!match) return fallbackMs;
  const amount = Number(match[1]);
  const unit = match[2] as DurationUnit;
  const multipliers: Record<DurationUnit, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return amount * multipliers[unit];
}

const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
if (!accessSecret) throw new Error("JWT_ACCESS_SECRET is not set (or fallback JWT_SECRET)");
if (!refreshSecret) throw new Error("JWT_REFRESH_SECRET is not set (or fallback JWT_SECRET)");

export const accessTtl = process.env.JWT_ACCESS_TTL || "15m";
export const refreshTtl = process.env.JWT_REFRESH_TTL || "30d";

const refreshTtlMs = parseDurationToMs(refreshTtl, 30 * 24 * 60 * 60 * 1000);

export type JwtPayload = {
  userId: string;
  role: Role;
};

export type RefreshJwtPayload = JwtPayload & { jti: string };

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, accessSecret, { expiresIn: accessTtl });
}

export function signRefreshToken(payload: RefreshJwtPayload) {
  return jwt.sign(payload, refreshSecret, { expiresIn: refreshTtl });
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, accessSecret);
  if (!decoded || typeof decoded !== "object") {
    throw new Error("Invalid token");
  }

  const { userId, role } = decoded as JwtPayload;
  if (!userId || !role) {
    throw new Error("Invalid token payload");
  }

  return { userId, role };
}

export function verifyRefreshToken(token: string): RefreshJwtPayload {
  const decoded = jwt.verify(token, refreshSecret);
  if (!decoded || typeof decoded !== "object") {
    throw new Error("Invalid token");
  }

  const { userId, role, jti } = decoded as RefreshJwtPayload;
  if (!userId || !role || !jti) {
    throw new Error("Invalid token payload");
  }

  return { userId, role, jti };
}

export function generateJti() {
  return crypto.randomUUID();
}

export function hashJti(jti: string) {
  return crypto.createHash("sha256").update(jti + refreshSecret).digest("hex");
}

export function getRefreshExpiryDate() {
  return new Date(Date.now() + refreshTtlMs);
}
