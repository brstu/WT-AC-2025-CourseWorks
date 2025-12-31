import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { roleGuard } from "../../middlewares/roleGuard";
import * as controller from "./queues.controller";

const router = Router();

// GET /queues (admin, agent, user)
router.get("/", authGuard, roleGuard(["ADMIN", "AGENT", "USER"]), controller.list);

// Agents management (admin)
router.get(
	"/:id/agents",
	authGuard,
	roleGuard(["ADMIN"]),
	controller.listAgents
);

router.post(
	"/:id/agents",
	authGuard,
	roleGuard(["ADMIN"]),
	controller.addAgent
);

router.delete(
	"/:id/agents/:userId",
	authGuard,
	roleGuard(["ADMIN"]),
	controller.removeAgent
);

// GET /queues/:id (admin, agent, user)
router.get("/:id", authGuard, roleGuard(["ADMIN", "AGENT", "USER"]), controller.getById);

// POST /queues (admin)
router.post("/", authGuard, roleGuard(["ADMIN"]), controller.create);

// PUT /queues/:id (admin)
router.put("/:id", authGuard, roleGuard(["ADMIN"]), controller.update);

// DELETE /queues/:id (admin)
router.delete("/:id", authGuard, roleGuard(["ADMIN"]), controller.remove);

export default router;
