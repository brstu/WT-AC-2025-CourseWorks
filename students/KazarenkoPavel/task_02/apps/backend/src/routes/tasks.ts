import { Router } from "express";
import {
  listTasksHandler,
  createTaskHandler,
  getTaskHandler,
  updateTaskHandler,
  deleteTaskHandler
} from "../controllers/taskController";
import { validate } from "../middleware/validate";
import { createTaskSchema, updateTaskSchema } from "../schemas/taskSchemas";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/", listTasksHandler);
router.post("/", validate(createTaskSchema), createTaskHandler);
router.get("/:id", getTaskHandler);
router.put("/:id", validate(updateTaskSchema), updateTaskHandler);
router.delete("/:id", deleteTaskHandler);

export default router;
