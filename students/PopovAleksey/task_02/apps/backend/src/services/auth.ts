import { Role, User } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../lib/password";
import { hashToken } from "../lib/hash";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { ApiError, badRequest, unauthorized } from "../lib/errors";
import { randomUUID } from "crypto";

export type PublicUser = Pick<User, "id" | "email" | "username" | "role">;

type TokenBundle = {
  accessToken: string;
  refreshToken: string;
  refreshTokenId: string;
  refreshTokenExpiresAt: Date;
};

async function issueTokens(user: User): Promise<TokenBundle> {
  const accessToken = signAccessToken(user.id, user.role);
  const { token: refreshToken, jti, expiresAt } = signRefreshToken(user.id, user.role);

  await prisma.refreshToken.create({
    data: {
      id: jti,
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt
    }
  });

  return {
    accessToken,
    refreshToken,
    refreshTokenId: jti,
    refreshTokenExpiresAt: expiresAt
  };
}

export async function registerUser(input: {
  email: string;
  username: string;
  password: string;
  role?: Role;
}): Promise<{ user: PublicUser; tokens: TokenBundle }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw badRequest("Email already in use");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      passwordHash,
      role: input.role ?? "student"
    }
  });

  const tokens = await issueTokens(user);

  return { user: toPublicUser(user), tokens };
}

export async function loginUser(email: string, password: string): Promise<{ user: PublicUser; tokens: TokenBundle }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw unauthorized("Invalid credentials");
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    throw unauthorized("Invalid credentials");
  }

  const tokens = await issueTokens(user);
  return { user: toPublicUser(user), tokens };
}

async function revokeAllUserTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() }
  });
}

export async function refreshSession(refreshTokenRaw: string): Promise<{ accessToken: string; newRefreshToken: TokenBundle }> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshTokenRaw);
  } catch (err) {
    throw unauthorized("Invalid or expired refresh token");
  }

  if (payload.type !== "refresh") {
    throw unauthorized("Invalid refresh token type");
  }

  const tokenHash = hashToken(refreshTokenRaw);
  const tokenRecord = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  // Reuse detection or unknown token
  if (!tokenRecord) {
    await revokeAllUserTokens(payload.sub);
    throw unauthorized("Refresh token not recognized");
  }

  if (tokenRecord.revokedAt || tokenRecord.expiresAt <= new Date()) {
    await revokeAllUserTokens(tokenRecord.userId);
    throw unauthorized("Refresh token revoked or expired");
  }

  if (tokenRecord.userId !== payload.sub) {
    await revokeAllUserTokens(tokenRecord.userId);
    throw unauthorized("Refresh token user mismatch");
  }

  const user = await prisma.user.findUnique({ where: { id: tokenRecord.userId } });
  if (!user) {
    await revokeAllUserTokens(tokenRecord.userId);
    throw unauthorized("User not found");
  }

  // Rotate: revoke old, issue new
  const newTokens = await issueTokens(user);
  await prisma.refreshToken.update({
    where: { tokenHash },
    data: { revokedAt: new Date(), replacedByTokenId: newTokens.refreshTokenId }
  });

  return { accessToken: newTokens.accessToken, newRefreshToken: newTokens };
}

export async function logout(refreshTokenRaw?: string) {
  if (!refreshTokenRaw) return;
  const tokenHash = hashToken(refreshTokenRaw);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() }
  });
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role
  };
}

export function generateAuditId() {
  return randomUUID();
}
