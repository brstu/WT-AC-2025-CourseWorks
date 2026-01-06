import { Router } from "express";
import { getMeHandler } from "../controllers/userController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/me", requireAuth, getMeHandler);

export default router;
