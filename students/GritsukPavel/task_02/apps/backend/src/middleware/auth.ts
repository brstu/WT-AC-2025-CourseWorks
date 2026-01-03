import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../lib/tokens';
import { Role } from '@prisma/client';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ status: 'error', error: { code: 'unauthorized', message: 'Missing access token' } });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role as Role };
    next();
  } catch (error) {
    return res
      .status(401)
      .json({
        status: 'error',
        error: { code: 'unauthorized', message: 'Invalid or expired access token' },
      });
  }
}
