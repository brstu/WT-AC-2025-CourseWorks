import { Request, Response } from "express";
import * as authService from "./auth.service";

/* ===================== REGISTER ===================== */

export async function register(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await authService.register(email, password);

    res.status(201).json({
      status: "ok",
      data: user,
    });
  } catch (error: any) {
    if (error.message === "USER_ALREADY_EXISTS") {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    res.status(500).json({
      message: "Internal server error during registration",
    });
  }
}

/* ===================== LOGIN ===================== */

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.json({
      status: "ok",
      data: result,
    });
  } catch (error: any) {
    // ❗ бизнес-ошибка
    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // ❗ реальная серверная ошибка
    res.status(500).json({
      message: "Internal server error during login",
    });
  }
}
