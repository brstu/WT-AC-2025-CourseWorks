import { Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

export interface AuthUser {
  id: string;
  role: Role;
}

export function assertCanRead(ownerId: string, user: AuthUser) {
  if (user.role === 'admin') return;
  if (ownerId !== user.id) {
    throw { status: 403, code: 'forbidden', message: 'Forbidden' };
  }
}

export function assertCanModify(ownerId: string, user: AuthUser) {
  if (user.role !== 'user') {
    throw { status: 403, code: 'forbidden', message: 'Forbidden' };
  }
  if (ownerId !== user.id) {
    throw { status: 403, code: 'forbidden', message: 'Forbidden' };
  }
}

export function enforceUserRole(user: AuthUser) {
  if (user.role !== 'user') {
    throw { status: 403, code: 'forbidden', message: 'Forbidden' };
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res
      .status(403)
      .json({ status: 'error', error: { code: 'forbidden', message: 'Admin access required' } });
  }
  next();
}
