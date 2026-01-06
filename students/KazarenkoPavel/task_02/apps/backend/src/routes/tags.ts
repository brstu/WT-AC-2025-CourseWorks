import { Router } from "express";
import { listTagsHandler, createTagHandler, updateTagHandler, deleteTagHandler } from "../controllers/tagController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createTagSchema, updateTagSchema } from "../schemas/tagSchemas";

const router = Router();

router.use(requireAuth);
router.get("/", listTagsHandler);
router.post("/", validate(createTagSchema), createTagHandler);
router.put("/:id", validate(updateTagSchema), updateTagHandler);
router.delete("/:id", deleteTagHandler);

export default router;
