import { Router, Response } from "express";
import cookieParser from "cookie-parser";
import ms from "ms";
import type { StringValue } from "ms";
import { z } from "zod";
import { env, isProduction } from "../lib/env";
import { ApiError, unauthorized } from "../lib/errors";
import { loginUser, logout, refreshSession, registerUser } from "../services/auth";

const router = Router();
router.use(cookieParser());

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(100)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

function buildRefreshCookie(refreshToken: string) {
  return {
    name: "refreshToken",
    value: refreshToken,
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: isProduction,
      domain: env.COOKIE_DOMAIN,
      path: "/",
      maxAge: ms(env.JWT_REFRESH_TTL as unknown as StringValue)
    }
  };
}

function clearRefreshCookie(res: Response) {
  const cookie = buildRefreshCookie("");
  res.clearCookie(cookie.name, { ...cookie.options, maxAge: 0 });
}

router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const { user, tokens } = await registerUser({ ...data });
    const cookie = buildRefreshCookie(tokens.refreshToken);
    res.cookie(cookie.name, cookie.value, cookie.options);
    return res.status(201).json({ accessToken: tokens.accessToken, user });
  } catch (err) {
    return next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const { user, tokens } = await loginUser(data.email, data.password);
    const cookie = buildRefreshCookie(tokens.refreshToken);
    res.cookie(cookie.name, cookie.value, cookie.options);
    return res.status(200).json({ accessToken: tokens.accessToken, user });
  } catch (err) {
    return next(err);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      throw unauthorized("Missing refresh token");
    }
    const result = await refreshSession(token as string);
    const cookie = buildRefreshCookie(result.newRefreshToken.refreshToken);
    res.cookie(cookie.name, cookie.value, cookie.options);
    return res.status(200).json({ accessToken: result.accessToken });
  } catch (err) {
    clearRefreshCookie(res);
    return next(err);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken as string | undefined;
    if (token) {
      await logout(token);
      clearRefreshCookie(res);
    }
    return res.status(204).send();
  } catch (err) {
    clearRefreshCookie(res);
    return next(err);
  }
});

export { router as authRouter };
