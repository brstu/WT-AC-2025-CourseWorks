import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";

export async function getMeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized", "unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, email: true, role: true }
    });

    if (!user) {
      throw new HttpError(404, "User not found", "not_found");
    }

    res.json({ status: "ok", data: user });
  } catch (err) {
    next(err);
  }
}
