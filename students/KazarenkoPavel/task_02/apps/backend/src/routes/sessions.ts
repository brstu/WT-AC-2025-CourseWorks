import { Router } from "express";
import {
  listSessionsHandler,
  createSessionHandler,
  updateSessionHandler,
  pauseSessionHandler,
  resumeSessionHandler,
  deleteSessionHandler
} from "../controllers/sessionController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createSessionSchema, updateSessionSchema } from "../schemas/sessionSchemas";

const router = Router();

router.use(requireAuth);
router.get("/", listSessionsHandler);
router.post("/", validate(createSessionSchema), createSessionHandler);
router.put("/:id", validate(updateSessionSchema), updateSessionHandler);
router.patch("/:id/pause", pauseSessionHandler);
router.patch("/:id/resume", resumeSessionHandler);
router.delete("/:id", deleteSessionHandler);

export default router;
