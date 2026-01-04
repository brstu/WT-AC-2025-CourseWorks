import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { config } from "../config";
import { HttpError } from "../lib/errors";
import { sha256 } from "../lib/hash";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";

const accessPayload = (user: { id: string; role: Role }) => ({ sub: user.id, role: user.role });

const refreshCookieName = "refreshToken";

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: config.nodeEnv === "production",
  path: "/",
  maxAge: config.jwtRefreshTtlSeconds * 1000
};

export const clearCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: config.nodeEnv === "production",
  path: "/"
};

export async function registerUser(
  input: { username: string; password: string },
  context: { ip?: string; userAgent?: string }
) {
  const existing = await prisma.user.findUnique({ where: { username: input.username } });
  if (existing) {
    throw new HttpError(409, "username_taken", "Username already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, config.bcryptSaltRounds);
  const user = await prisma.user.create({
    data: {
      username: input.username,
      passwordHash,
      role: Role.user
    }
  });

  return issueTokens(user, context);
}

export async function loginUser(
  input: { username: string; password: string },
  context: { ip?: string; userAgent?: string }
) {
  const user = await prisma.user.findUnique({ where: { username: input.username } });
  if (!user) {
    throw new HttpError(401, "invalid_credentials", "Invalid username or password");
  }
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new HttpError(401, "invalid_credentials", "Invalid username or password");
  }
  return issueTokens(user, context);
}

async function issueTokens(
  user: { id: string; role: Role; username: string },
  context: { ip?: string; userAgent?: string }
) {
  const jti = randomUUID();
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role, jti });
  const tokenHash = sha256(jti);
  const expiresAt = new Date(Date.now() + config.jwtRefreshTtlSeconds * 1000);

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt,
      createdByIp: context.ip,
      userAgent: context.userAgent
    }
  });

  const accessToken = signAccessToken(accessPayload(user));
  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  };
}

export async function refreshTokens(refreshTokenRaw: string | undefined, context: { ip?: string; userAgent?: string }) {
  if (!refreshTokenRaw) {
    throw new HttpError(401, "unauthorized", "Refresh token missing");
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshTokenRaw);
  } catch (err) {
    throw new HttpError(401, "unauthorized", "Invalid or expired refresh token");
  }

  if (!payload.jti) {
    throw new HttpError(401, "unauthorized", "Malformed refresh token");
  }

  const tokenHash = sha256(payload.jti);
  const tokenRecord = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!tokenRecord) {
    throw new HttpError(401, "unauthorized", "Refresh session not found");
  }

  if (tokenRecord.revokedAt || tokenRecord.replacedByTokenHash) {
    await revokeAllUserTokens(tokenRecord.userId);
    throw new HttpError(401, "unauthorized", "Refresh token was already used");
  }

  if (tokenRecord.expiresAt.getTime() <= Date.now()) {
    await revokeTokenByHash(tokenRecord.tokenHash);
    throw new HttpError(401, "unauthorized", "Refresh token expired");
  }

  const user = await prisma.user.findUnique({ where: { id: tokenRecord.userId } });
  if (!user) {
    await revokeAllUserTokens(tokenRecord.userId);
    throw new HttpError(401, "unauthorized", "User not found");
  }

  const newJti = randomUUID();
  const newTokenHash = sha256(newJti);
  const newRefreshToken = signRefreshToken({ sub: user.id, role: user.role, jti: newJti });
  const expiresAt = new Date(Date.now() + config.jwtRefreshTtlSeconds * 1000);

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { tokenHash },
      data: {
        revokedAt: new Date(),
        replacedByTokenHash: newTokenHash
      }
    }),
    prisma.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        userId: user.id,
        expiresAt,
        createdByIp: context.ip,
        userAgent: context.userAgent
      }
    })
  ]);

  const accessToken = signAccessToken(accessPayload(user));
  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshTokenRaw: string | undefined) {
  if (!refreshTokenRaw) {
    return;
  }
  try {
    const payload = verifyRefreshToken(refreshTokenRaw);
    if (!payload.jti) return;
    await revokeTokenByHash(sha256(payload.jti));
  } catch (err) {
    // ignore invalid token during logout
    return;
  }
}

async function revokeTokenByHash(tokenHash: string) {
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revokedAt: new Date() }
  });
}

async function revokeAllUserTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() }
  });
}

export function getRefreshCookieName() {
  return refreshCookieName;
}
