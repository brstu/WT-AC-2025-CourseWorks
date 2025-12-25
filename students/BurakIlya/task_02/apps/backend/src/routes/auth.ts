import { Router } from "express";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../lib/hash";
import {
  generateJti,
  getRefreshExpiryDate,
  hashJti,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../lib/jwt";
import { AppError } from "../middleware/error-handler";
import { z } from "zod";
import type { Role } from "@prisma/client";
import type { Response } from "express";

const router = Router();

const REFRESH_COOKIE_NAME = "refreshToken";
const refreshCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/"
};

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, { ...refreshCookieOptions, expires: getRefreshExpiryDate() });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
}

async function createRefreshSession(userId: string, role: Role) {
  const jti = generateJti();
  const jtiHash = hashJti(jti);
  const refreshToken = signRefreshToken({ userId, role, jti });
  await prisma.refreshToken.create({ data: { userId, jtiHash, expiresAt: getRefreshExpiryDate() } });
  return refreshToken;
}

async function issueTokens(res: Response, user: { id: string; role: Role }) {
  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = await createRefreshSession(user.id, user.role);
  setRefreshCookie(res, refreshToken);
  return accessToken;
}

async function revokeAllUserRefreshTokens(userId: string) {
  await prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
}

async function handleCompromised(res: Response, userId: string) {
  await revokeAllUserRefreshTokens(userId);
  clearRefreshCookie(res);
  throw new AppError(401, "Invalid refresh token", "refresh_invalid");
}

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
      select: { id: true }
    });

    if (existing) {
      throw new AppError(409, "User already exists", "user_exists");
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash,
        role: "user"
      },
      select: { id: true, email: true, username: true, role: true }
    });

    const accessToken = await issueTokens(res, { id: user.id, role: user.role });

    return res.status(201).json({ status: "ok", data: { user, accessToken } });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, email: true, username: true, role: true, passwordHash: true }
    });

    if (!user) {
      throw new AppError(401, "Invalid credentials", "invalid_credentials");
    }

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, "Invalid credentials", "invalid_credentials");
    }

    const accessToken = await issueTokens(res, { id: user.id, role: user.role });
    const { passwordHash, ...safeUser } = user;

    return res.status(200).json({ status: "ok", data: { user: safeUser, accessToken } });
  } catch (err) {
    next(err);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!token) {
      throw new AppError(401, "Unauthorized", "unauthorized");
    }

    const payload = (() => {
      try {
        return verifyRefreshToken(token);
      } catch (err) {
        clearRefreshCookie(res);
        throw new AppError(401, "Unauthorized", "unauthorized");
      }
    })();
    const now = new Date();
    const jtiHash = hashJti(payload.jti);

    const existing = await prisma.refreshToken.findUnique({ where: { jtiHash } });
    if (!existing) {
      return await handleCompromised(res, payload.userId);
    }

    if (existing.revokedAt) {
      return await handleCompromised(res, payload.userId);
    }

    if (existing.userId !== payload.userId) {
      return await handleCompromised(res, payload.userId);
    }

    if (existing.expiresAt <= now) {
      await revokeAllUserRefreshTokens(payload.userId);
      clearRefreshCookie(res);
      throw new AppError(401, "Refresh token expired", "refresh_expired");
    }

    const newJti = generateJti();
    const newRefreshToken = signRefreshToken({ userId: payload.userId, role: payload.role, jti: newJti });
    const newJtiHash = hashJti(newJti);

    await prisma.$transaction([
      prisma.refreshToken.update({ where: { id: existing.id }, data: { revokedAt: now } }),
      prisma.refreshToken.create({ data: { userId: payload.userId, jtiHash: newJtiHash, expiresAt: getRefreshExpiryDate() } })
    ]);

    const accessToken = signAccessToken({ userId: payload.userId, role: payload.role });
    setRefreshCookie(res, newRefreshToken);

    return res.status(200).json({ status: "ok", data: { accessToken } });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    clearRefreshCookie(res);

    if (token) {
      try {
        const payload = verifyRefreshToken(token);
        const jtiHash = hashJti(payload.jti);
        await prisma.refreshToken.updateMany({ where: { jtiHash, revokedAt: null }, data: { revokedAt: new Date() } });
      } catch (err) {
        // ignore token parsing errors on logout
      }
    }

    res.status(200).json({ status: "ok", data: { message: "logged_out" } });
  } catch (err) {
    next(err);
  }
});

export default router;
