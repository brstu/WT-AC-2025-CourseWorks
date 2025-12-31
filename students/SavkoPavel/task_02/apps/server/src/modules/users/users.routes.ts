import { Router, Request, Response } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { roleGuard } from "../../middlewares/roleGuard";
import * as controller from "./users.controller";

const router = Router();

/**
 * GET /users/me
 * любой авторизованный пользователь
 */
router.get(
  "/me",
  authGuard,
  (req: Request, res: Response) => {
    res.json({
      status: "ok",
      data: (req as any).user,
    });
  }
);

/**
 * GET /users
 * только ADMIN
 */
router.get(
  "/",
  authGuard,
  roleGuard(["ADMIN"]),
  controller.listUsers
);

/**
 * POST /users
 * только ADMIN (создание user/agent/admin)
 */
router.post(
  "/",
  authGuard,
  roleGuard(["ADMIN"]),
  controller.createUser
);

/**
 * GET /users/:id
 * только ADMIN
 */
router.get(
  "/:id",
  authGuard,
  roleGuard(["ADMIN"]),
  controller.getUser
);

/**
 * PUT /users/:id
 * только ADMIN
 */
router.put(
  "/:id",
  authGuard,
  roleGuard(["ADMIN"]),
  controller.updateUser
);

/**
 * PATCH /users/:id/role
 * только ADMIN
 */
router.patch(
  "/:id/role",
  authGuard,
  roleGuard(["ADMIN"]),
  controller.changeRole
);

/**
 * DELETE /users/:id
 * только ADMIN
 */
router.delete(
  "/:id",
  authGuard,
  roleGuard(["ADMIN"]),
  controller.deleteUser
);

/**
 * GET /users/admin
 * только ADMIN
 */
router.get(
  "/admin",
  authGuard,
  roleGuard(["ADMIN"]),
  (req: Request, res: Response) => {
    res.json({ message: "Welcome admin" });
  }
);

export default router;
