import { Request, Response } from "express";
import * as usersService from "./users.service";
import bcrypt from "bcrypt";

export async function listUsers(req: Request, res: Response) {
  const users = await usersService.getAllUsers();
  res.json({ status: "ok", data: users });
}

export async function getUser(req: Request, res: Response) {
  const user = await usersService.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({ status: "ok", data: user });
}

export async function changeRole(req: Request, res: Response) {
  const { role } = req.body;

  if (!["USER", "ADMIN", "AGENT"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const user = await usersService.updateUserRole(req.params.id, role);
    res.json({ status: "ok", data: user });
  } catch {
    res.status(404).json({ error: "User not found" });
  }
}

export async function createUser(req: Request, res: Response) {
  const { email, password, role } = req.body as {
    email?: string;
    password?: string;
    role?: "USER" | "ADMIN" | "AGENT";
  };

  if (!email || !password) {
    return res.status(400).json({ error: "EMAIL_AND_PASSWORD_REQUIRED" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "PASSWORD_TOO_SHORT" });
  }
  if (role && !["USER", "ADMIN", "AGENT"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await usersService.createUser({
      email,
      passwordHash,
      role: role ?? "USER",
    });
    res.status(201).json({ status: "ok", data: user });
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "USER_ALREADY_EXISTS" });
    }
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function updateUser(req: Request, res: Response) {
  const { email, role } = req.body as {
    email?: string;
    role?: "USER" | "ADMIN" | "AGENT";
  };

  if (role && !["USER", "ADMIN", "AGENT"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const user = await usersService.updateUser(req.params.id, { email, role });
    res.json({ status: "ok", data: user });
  } catch {
    res.status(404).json({ error: "User not found" });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const user = await usersService.deleteUser(req.params.id);
    res.json({ status: "ok", data: user });
  } catch {
    res.status(404).json({ error: "User not found" });
  }
}
