import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';

export type JwtPayload = {
  sub: string; // userId
  role: 'user' | 'admin';
};

const secret: Secret = env.JWT_SECRET;

// Приводим expiresIn к типу, который ждёт jsonwebtoken
const expiresIn: SignOptions['expiresIn'] = env.JWT_EXPIRES_IN as SignOptions['expiresIn'];

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}
