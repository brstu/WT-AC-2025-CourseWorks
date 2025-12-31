import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { roleGuard } from "../../middlewares/roleGuard";
import * as controller from "./sla.controller";

const router = Router();

// GET /sla (admin, agent)
router.get("/", authGuard, roleGuard(["ADMIN", "AGENT"]), controller.list);

// GET /sla/:id (admin, agent)
router.get("/:id", authGuard, roleGuard(["ADMIN", "AGENT"]), controller.getById);

// POST /sla (admin)
router.post("/", authGuard, roleGuard(["ADMIN"]), controller.create);

// PUT /sla/:id (admin)
router.put("/:id", authGuard, roleGuard(["ADMIN"]), controller.update);

export default router;
