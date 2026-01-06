import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/tokens";
import { AuthUser } from "../types/jwt";
import { LoginInput, RegisterInput } from "../schemas/authSchemas";
import { hashToken } from "../utils/crypto";
import { HttpError } from "../utils/httpError";

export type SanitizedUser = {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user";
};

export type ClientMeta = {
  ip?: string;
  userAgent?: string;
};

export type AuthResult = {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
  user: SanitizedUser;
};

function sanitizeUser(user: User): SanitizedUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  };
}

async function revokeAllUserRefreshTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() }
  });
}

async function createRefreshSession(user: AuthUser, jti: string, expiresAt: Date, meta: ClientMeta) {
  const hashedJti = hashToken(jti);
  const record = await prisma.refreshToken.create({
    data: {
      hashedToken: hashedJti,
      userId: user.id,
      expiresAt,
      createdByIp: meta.ip,
      userAgent: meta.userAgent
    }
  });
  return record.id;
}

async function issueTokens(user: User, meta: ClientMeta): Promise<AuthResult & { refreshRecordId: string }> {
  const authUser: AuthUser = { id: user.id, role: user.role };
  const { token: accessToken } = signAccessToken(authUser);

  const jti = randomUUID();
  const { token: refreshToken, expiresAt: refreshExpiresAt } = signRefreshToken(authUser, jti);
  const refreshRecordId = await createRefreshSession(authUser, jti, refreshExpiresAt, meta);

  return {
    accessToken,
    refreshToken,
    refreshExpiresAt,
    user: sanitizeUser(user),
    refreshRecordId
  };
}

export async function register(input: RegisterInput, meta: ClientMeta): Promise<AuthResult> {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email }, { username: input.username }]
    }
  });

  if (existing) {
    throw new HttpError(409, "User with this email or username already exists", "conflict");
  }

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      username: input.username,
      email: input.email,
      passwordHash,
      role: "user"
    }
  });

  const { refreshRecordId, ...result } = await issueTokens(user, meta);
  return result;
}

export async function login(input: LoginInput, meta: ClientMeta): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new HttpError(401, "Invalid credentials", "unauthorized");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, "Invalid credentials", "unauthorized");
  }

  const { refreshRecordId, ...result } = await issueTokens(user, meta);
  return result;
}

export async function rotateRefreshToken(refreshToken: string, meta: ClientMeta): Promise<AuthResult> {
  let payload: ReturnType<typeof verifyRefreshToken>;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (_err) {
    throw new HttpError(401, "Invalid refresh token", "unauthorized");
  }

  const hashedJti = hashToken(payload.jti);
  const stored = await prisma.refreshToken.findUnique({ where: { hashedToken: hashedJti } });

  if (!stored || stored.revokedAt) {
    await revokeAllUserRefreshTokens(payload.sub);
    throw new HttpError(401, "Refresh token has been revoked", "unauthorized");
  }

  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    throw new HttpError(401, "Refresh token expired", "unauthorized");
  }

  if (stored.userId !== payload.sub) {
    await revokeAllUserRefreshTokens(payload.sub);
    throw new HttpError(401, "Invalid refresh token", "unauthorized");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    await revokeAllUserRefreshTokens(payload.sub);
    throw new HttpError(401, "User not found", "unauthorized");
  }

  const { refreshRecordId, ...result } = await issueTokens(user, meta);

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date(), replacedByTokenId: refreshRecordId }
  });

  return result;
}

export async function logout(refreshToken: string | undefined) {
  if (!refreshToken) return;

  try {
    const payload = verifyRefreshToken(refreshToken);
    const hashedJti = hashToken(payload.jti);
    await prisma.refreshToken.update({ where: { hashedToken: hashedJti }, data: { revokedAt: new Date() } });
  } catch (_err) {
    // Silently ignore invalid token on logout.
  }
}
