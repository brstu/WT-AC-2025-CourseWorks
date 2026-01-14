import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/errors.js";
import { sha256 } from "../../lib/hash.js";
import { logger } from "../../lib/logger.js";
import { config } from "../../lib/config.js";
import { signAccessToken, signRefreshToken, ttlToMs, verifyRefreshToken } from "../../lib/jwt.js";
import { authAttemptsTotal } from "../../lib/metrics.js";

const SALT_ROUNDS = 10;
const REFRESH_COOKIE_NAME = "refresh_token";

type AuthContext = {
  ip?: string;
  userAgent?: string;
};

export const setRefreshCookie = (res: import("express").Response, token: string) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: config.cookieSameSite,
    secure: config.cookieSecure,
    maxAge: ttlToMs(config.refreshTokenTtl),
    path: "/"
  });
};

export const clearRefreshCookie = (res: import("express").Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: config.cookieSameSite,
    secure: config.cookieSecure,
    path: "/"
  });
};

const buildTokens = (user: { id: string; email: string }, jti: string) => {
  const accessToken = signAccessToken({ sub: user.id, role: "user" });
  const refreshToken = signRefreshToken({ sub: user.id, role: "user", jti });
  return { accessToken, refreshToken };
};

const saveRefreshSession = async (
  userId: string,
  tokenHash: string,
  expiresAt: Date,
  ctx: AuthContext,
  replacedByTokenId?: string
) => {
  return prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
      createdByIp: ctx.ip,
      userAgent: ctx.userAgent,
      replacedByTokenId
    },
    select: { id: true, tokenHash: true }
  });
};

const revokeTokenByHash = async (tokenHash: string, replacedByTokenId?: string) => {
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date(), replacedByTokenId }
  });
};

const revokeAllTokensForUser = async (userId: string) => {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() }
  });
};

const createSessionRecord = async (
  userId: string,
  jti: string,
  ctx: AuthContext,
  replacedByTokenId?: string
) => {
  const expiresAt = new Date(Date.now() + ttlToMs(config.refreshTokenTtl));
  const tokenHash = sha256(jti);
  const session = await saveRefreshSession(userId, tokenHash, expiresAt, ctx, replacedByTokenId);
  return { session, expiresAt };
};

const recordAuthAttempt = (type: "login" | "register" | "refresh", success: boolean) => {
  authAttemptsTotal.inc({ type, success: success ? "true" : "false" });
};

export const register = async (
  input: { email: string; name: string; password: string },
  ctx: AuthContext
) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    recordAuthAttempt("register", false);
    throw new AppError(409, "User with provided email already exists", "conflict");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash
    }
  });

  const jti = randomUUID();
  const { accessToken, refreshToken } = buildTokens(user, jti);
  await createSessionRecord(user.id, jti, ctx);
  recordAuthAttempt("register", true);
  logger.info({ userId: user.id }, "user registered");

  return { user, accessToken, refreshToken };
};

export const login = async (input: { email: string; password: string }, ctx: AuthContext) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    recordAuthAttempt("login", false);
    throw new AppError(401, "Invalid credentials", "unauthorized");
  }

  const match = await bcrypt.compare(input.password, user.passwordHash);
  if (!match) {
    recordAuthAttempt("login", false);
    throw new AppError(401, "Invalid credentials", "unauthorized");
  }

  const jti = randomUUID();
  const { accessToken, refreshToken } = buildTokens(user, jti);
  await createSessionRecord(user.id, jti, ctx);
  recordAuthAttempt("login", true);
  logger.info({ userId: user.id }, "user logged in");

  return { user, accessToken, refreshToken };
};

export const refresh = async (token: string | undefined, ctx: AuthContext) => {
  if (!token) {
    recordAuthAttempt("refresh", false);
    throw new AppError(401, "Refresh token missing", "unauthorized");
  }

  let payload: ReturnType<typeof verifyRefreshToken>;
  try {
    payload = verifyRefreshToken(token);
  } catch (_err) {
    recordAuthAttempt("refresh", false);
    throw new AppError(401, "Invalid or expired refresh token", "unauthorized");
  }

  if (!payload.jti) {
    recordAuthAttempt("refresh", false);
    throw new AppError(401, "Refresh token jti missing", "unauthorized");
  }

  const hashed = sha256(payload.jti);
  const session = await prisma.refreshToken.findUnique({ where: { tokenHash: hashed } });

  if (!session || session.revokedAt) {
    await revokeAllTokensForUser(payload.sub);
    recordAuthAttempt("refresh", false);
    throw new AppError(401, "Refresh token revoked", "unauthorized");
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await revokeTokenByHash(hashed);
    recordAuthAttempt("refresh", false);
    throw new AppError(401, "Refresh token expired", "unauthorized");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    await revokeAllTokensForUser(payload.sub);
    recordAuthAttempt("refresh", false);
    throw new AppError(401, "User not found", "unauthorized");
  }

  const newJti = randomUUID();
  const { accessToken, refreshToken } = buildTokens(user, newJti);
  const { session: newSession } = await createSessionRecord(user.id, newJti, ctx, session.id);
  await revokeTokenByHash(hashed, newSession.id);
  recordAuthAttempt("refresh", true);
  logger.info({ userId: user.id }, "refresh token rotated");

  return { accessToken, refreshToken, user };
};

export const logout = async (token: string | undefined) => {
  if (!token) return;
  try {
    const payload = verifyRefreshToken(token);
    if (!payload.jti) return;
    const hashed = sha256(payload.jti);
    await revokeTokenByHash(hashed);
    logger.info({ userId: payload.sub }, "refresh token revoked on logout");
  } catch (_err) {
    return;
  }
};

export const getCookieName = () => REFRESH_COOKIE_NAME;

