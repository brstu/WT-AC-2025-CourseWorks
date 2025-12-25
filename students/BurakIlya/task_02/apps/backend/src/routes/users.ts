import { Router } from "express";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.get("/me", requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  return res.status(200).json({ status: "ok", data: { user } });
});

export default router;
