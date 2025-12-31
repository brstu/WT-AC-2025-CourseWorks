import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import * as controller from "./incidents.controller";

const router = Router();

// GET /incidents (admin/agent: all, user: own)
router.get("/", authGuard, controller.list);

// POST /incidents (admin/user)
router.post("/", authGuard, controller.create);

// GET /incidents/:id
router.get("/:id", authGuard, controller.getById);

// PUT /incidents/:id (admin/agent)
router.put("/:id", authGuard, controller.update);

// PATCH /incidents/:id (user: edit own title/description/priority; admin/agent: workflow updates)
router.patch("/:id", authGuard, controller.patch);

// DELETE /incidents/:id (admin)
router.delete("/:id", authGuard, controller.remove);

// Comments
router.get("/:id/comments", authGuard, controller.listComments);
router.post("/:id/comments", authGuard, controller.addComment);

export default router;
