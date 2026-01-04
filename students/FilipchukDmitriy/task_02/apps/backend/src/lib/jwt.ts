import jwt from "jsonwebtoken";
import { config } from "../config";

export type JwtPayload = {
  sub: string;
  role: string;
  jti?: string;
  iat: number;
  exp: number;
};

export function signAccessToken(payload: { sub: string; role: string }) {
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.jwtAccessTtlSeconds
  });
}

export function signRefreshToken(payload: { sub: string; role: string; jti: string }) {
  const { jti, ...payloadWithoutJti } = payload;
  return jwt.sign(payloadWithoutJti, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshTtlSeconds,
    jwtid: jti
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtAccessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtRefreshSecret) as JwtPayload;
}
