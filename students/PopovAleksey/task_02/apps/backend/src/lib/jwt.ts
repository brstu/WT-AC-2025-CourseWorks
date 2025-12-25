import { Role } from "@prisma/client";
import jwt from "jsonwebtoken";
import ms from "ms";
import type { StringValue } from "ms";
import { randomUUID } from "crypto";
import { env } from "./env";

export type AccessPayload = {
  sub: string;
  role: Role;
  type: "access";
  iat: number;
  exp: number;
};

export type RefreshPayload = {
  sub: string;
  role: Role;
  type: "refresh";
  jti: string;
  iat: number;
  exp: number;
};

export function signAccessToken(userId: string, role: Role): string {
  const accessTtl = env.JWT_ACCESS_TTL as unknown as jwt.SignOptions["expiresIn"];
  return jwt.sign(
    { sub: userId, role, type: "access" },
    env.JWT_ACCESS_SECRET,
    { expiresIn: accessTtl }
  );
}

export function signRefreshToken(userId: string, role: Role) {
  const jti = randomUUID();
  const refreshTtl = env.JWT_REFRESH_TTL as unknown as jwt.SignOptions["expiresIn"];
  const token = jwt.sign(
    { sub: userId, role, type: "refresh", jti },
    env.JWT_REFRESH_SECRET,
    { expiresIn: refreshTtl }
  );

  const expiresAt = new Date(Date.now() + ms(env.JWT_REFRESH_TTL as unknown as StringValue));

  return { token, jti, expiresAt };
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
}

export function verifyRefreshToken(token: string): RefreshPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshPayload;
}
