import type { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.schemas.js";
import { register, login, refresh, logout, setRefreshCookie, clearRefreshCookie } from "./auth.service.js";

export const registerHandler = async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);
  const result = await register(input, { ip: req.ip, userAgent: req.headers["user-agent"] });
  setRefreshCookie(res, result.refreshToken);
  res.status(201).json({
    status: "ok",
    data: {
      accessToken: result.accessToken,
      user: { id: result.user.id, email: result.user.email, name: result.user.name }
    }
  });
};

export const loginHandler = async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const result = await login(input, { ip: req.ip, userAgent: req.headers["user-agent"] });
  setRefreshCookie(res, result.refreshToken);
  res.json({
    status: "ok",
    data: {
      accessToken: result.accessToken,
      user: { id: result.user.id, email: result.user.email, name: result.user.name }
    }
  });
};

export const refreshHandler = async (req: Request, res: Response) => {
  const token = req.cookies?.refresh_token as string | undefined;
  const result = await refresh(token, { ip: req.ip, userAgent: req.headers["user-agent"] });
  setRefreshCookie(res, result.refreshToken);
  res.json({
    status: "ok",
    data: {
      accessToken: result.accessToken,
      user: { id: result.user.id, email: result.user.email, name: result.user.name }
    }
  });
};

export const logoutHandler = async (req: Request, res: Response) => {
  const token = req.cookies?.refresh_token as string | undefined;
  await logout(token);
  clearRefreshCookie(res);
  res.json({ status: "ok" });
};

