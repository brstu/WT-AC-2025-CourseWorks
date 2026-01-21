import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt';

// локально расширяем Request, чтобы TS точно видел req.user
type AuthedRequest = Request & { user?: { id: string; role: 'user' | 'admin' } };

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('authorization') ?? req.header('Authorization');
  if (!header) return next({ status: 401, message: 'missing Authorization header' });

  const m = /^Bearer\s+(.+)$/i.exec(header);
  if (!m) return next({ status: 401, message: 'invalid Authorization header format' });

  try {
    const payload = verifyAccessToken(m[1]);
    (req as AuthedRequest).user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return next({ status: 401, message: 'invalid or expired token' });
  }
}
