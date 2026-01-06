import { Request, Response, NextFunction } from "express";
import { env, isProduction } from "../config/env";
import { refreshTokenTtlMs } from "../lib/tokens";
import { login, logout, register, rotateRefreshToken } from "../services/authService";
import { HttpError } from "../utils/httpError";

function getClientMeta(req: Request) {
  return {
    ip: req.ip,
    userAgent: req.get("user-agent") ?? undefined
  };
}

function setRefreshCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: refreshTokenTtlMs,
    expires: expiresAt,
    path: "/"
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(env.REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/"
  });
}

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await register(req.body, getClientMeta(req));
    setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
    res.status(201).json({ status: "ok", data: { accessToken: result.accessToken, user: result.user } });
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await login(req.body, getClientMeta(req));
    setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
    res.json({ status: "ok", data: { accessToken: result.accessToken, user: result.user } });
  } catch (err) {
    next(err);
  }
}

export async function refreshHandler(req: Request, res: Response, next: NextFunction) {
  const refreshToken = req.cookies?.[env.REFRESH_TOKEN_COOKIE_NAME];
  if (!refreshToken) {
    return next(new HttpError(401, "Refresh token missing", "unauthorized"));
  }

  try {
    const result = await rotateRefreshToken(refreshToken, getClientMeta(req));
    setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
    res.json({ status: "ok", data: { accessToken: result.accessToken } });
  } catch (err) {
    if (err instanceof HttpError && err.status === 401) {
      clearRefreshCookie(res);
    }
    next(err);
  }
}

export async function logoutHandler(req: Request, res: Response, next: NextFunction) {
  const refreshToken = req.cookies?.[env.REFRESH_TOKEN_COOKIE_NAME];
  try {
    await logout(refreshToken);
    clearRefreshCookie(res);
    res.json({ status: "ok", data: { message: "Logged out" } });
  } catch (err) {
    next(err);
  }
}
