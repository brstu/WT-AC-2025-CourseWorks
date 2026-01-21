import type { Request, Response } from 'express';
import { UserModel } from '../_models/user.model';
import { HttpError } from '../../common/utils/httpError';
import { hashPassword, verifyPassword } from '../../common/utils/password';
import { signAccessToken } from '../../common/utils/jwt';

function normalizeEmail(v: unknown): string {
  if (typeof v !== 'string') throw new HttpError(400, 'email is required');
  const email = v.trim().toLowerCase();
  if (!email || !email.includes('@')) throw new HttpError(400, 'email is invalid');
  return email;
}

function requirePassword(v: unknown): string {
  if (typeof v !== 'string') throw new HttpError(400, 'password is required');
  const p = v.trim();
  if (p.length < 6) throw new HttpError(400, 'password must be at least 6 chars');
  return p;
}

export async function register(req: Request, res: Response) {
  const email = normalizeEmail(req.body?.email);
  const password = requirePassword(req.body?.password);
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';

  const exists = await UserModel.exists({ email });
  if (exists) throw new HttpError(409, 'email already in use');

  const passwordHash = await hashPassword(password);

  const user = await UserModel.create({
    email,
    passwordHash,
    name,
    role: 'user',
  });

  const token = signAccessToken({ sub: String(user._id), role: user.role });

  res.status(201).json({
    token,
    user: { id: String(user._id), email: user.email, name: user.name, role: user.role },
  });
}

export async function login(req: Request, res: Response) {
  const email = normalizeEmail(req.body?.email);
  const password = requirePassword(req.body?.password);

  const user = await UserModel.findOne({ email }).lean();
  if (!user) throw new HttpError(401, 'invalid credentials');

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new HttpError(401, 'invalid credentials');

  const token = signAccessToken({ sub: String(user._id), role: user.role });

  res.json({
    token,
    user: { id: String(user._id), email: user.email, name: user.name, role: user.role },
  });
}
