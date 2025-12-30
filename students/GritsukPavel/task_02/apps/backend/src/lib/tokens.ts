import jwt from 'jsonwebtoken';
import ms from 'ms';
import { randomUUID } from 'crypto';
import { env } from '../config/env';

export type AccessTokenPayload = {
  sub: string;
  role: string;
};

export type RefreshTokenPayload = AccessTokenPayload & {
  jti: string;
};

export function generateAccessToken(userId: string, role: string): string {
  const payload: AccessTokenPayload = { sub: userId, role };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_TTL });
}

export function generateRefreshToken(userId: string, role: string) {
  const jti = randomUUID();
  const payload: RefreshTokenPayload = { sub: userId, role, jti };
  const token = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_TTL });
  const expiresAt = new Date(Date.now() + ms(env.JWT_REFRESH_TTL));
  return { token, jti, expiresAt };
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload & AccessTokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as jwt.JwtPayload & RefreshTokenPayload;
}
