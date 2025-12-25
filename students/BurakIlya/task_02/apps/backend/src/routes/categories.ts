import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { getPaginationParams } from "../lib/pagination";

const router = Router();

const categorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  icon: z.string().max(200).optional()
});

router.get("/", async (req, res, next) => {
  try {
    const { limit, offset } = getPaginationParams(req.query);
    const [items, total] = await Promise.all([
      prisma.category.findMany({ skip: offset, take: limit, orderBy: { name: "asc" } }),
      prisma.category.count()
    ]);
    res.status(200).json({ status: "ok", data: { items, total, limit, offset } });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requireRole("admin"), async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = categorySchema.parse(req.body);
    const category = await prisma.category.create({ data });
    res.status(201).json({ status: "ok", data: category });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!category) throw new AppError(404, "Category not found", "not_found");
    res.status(200).json({ status: "ok", data: category });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    const data = categorySchema.partial().parse(req.body);
    const category = await prisma.category.update({ where: { id: req.params.id }, data });
    res.status(200).json({ status: "ok", data: category });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res, next) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(200).json({ status: "ok", data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
});

export default router;
