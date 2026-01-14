import jwt from "jsonwebtoken";
import ms from "ms";
import { config } from "./config.js";

export type AccessTokenPayload = {
  sub: string;
  role: string;
};

export type RefreshTokenPayload = AccessTokenPayload & {
  jti: string;
};

export const signAccessToken = (payload: AccessTokenPayload) => {
  return jwt.sign(payload, config.accessTokenSecret, {
    algorithm: "HS256",
    expiresIn: config.accessTokenTtl
  });
};

export const signRefreshToken = (payload: RefreshTokenPayload) => {
  return jwt.sign(payload, config.refreshTokenSecret, {
    algorithm: "HS256",
    expiresIn: config.refreshTokenTtl
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload & jwt.JwtPayload => {
  return jwt.verify(token, config.accessTokenSecret) as AccessTokenPayload & jwt.JwtPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload & jwt.JwtPayload => {
  return jwt.verify(token, config.refreshTokenSecret) as RefreshTokenPayload & jwt.JwtPayload;
};

export const ttlToMs = (ttl: string) => ms(ttl);

