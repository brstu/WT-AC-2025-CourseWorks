import { Router } from "express";
import { loginSchema, registerSchema } from "../lib/validation";
import { HttpError } from "../lib/errors";
import {
  clearCookieOptions,
  cookieOptions,
  getRefreshCookieName,
  loginUser,
  logout,
  refreshTokens,
  registerUser
} from "../services/authService";
import { asyncHandler } from "../lib/asyncHandler";

const router = Router();

router.post("/register", asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "validation_failed", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const { accessToken, refreshToken, user } = await registerUser(parsed.data, {
    ip: req.ip,
    userAgent: req.get("user-agent") ?? undefined
  });

  res.cookie(getRefreshCookieName(), refreshToken, cookieOptions);
  res.status(201).json({ status: "ok", data: { accessToken, user } });
}));

router.post("/login", asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "validation_failed", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const { accessToken, refreshToken, user } = await loginUser(parsed.data, {
    ip: req.ip,
    userAgent: req.get("user-agent") ?? undefined
  });

  res.cookie(getRefreshCookieName(), refreshToken, cookieOptions);
  res.status(200).json({ status: "ok", data: { accessToken, user } });
}));

router.post("/refresh", asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[getRefreshCookieName()];
  const { accessToken, refreshToken: newRefreshToken } = await refreshTokens(refreshToken, {
    ip: req.ip,
    userAgent: req.get("user-agent") ?? undefined
  });
  res.cookie(getRefreshCookieName(), newRefreshToken, cookieOptions);
  res.status(200).json({ status: "ok", data: { accessToken } });
}));

router.post("/logout", asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[getRefreshCookieName()];
  await logout(refreshToken);
  res.clearCookie(getRefreshCookieName(), clearCookieOptions);
  res.status(200).json({ status: "ok" });
}));

export { router };
