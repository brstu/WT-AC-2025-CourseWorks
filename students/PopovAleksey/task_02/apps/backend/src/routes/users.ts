import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { toPublicUser } from "../services/auth";

const router = Router();

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    return res.json({ user: toPublicUser(user) });
  } catch (err) {
    return next(err);
  }
});

export { router as usersRouter };
