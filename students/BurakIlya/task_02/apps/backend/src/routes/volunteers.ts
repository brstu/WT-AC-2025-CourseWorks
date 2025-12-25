import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { getPaginationParams } from "../lib/pagination";

const router = Router();

const volunteerSchema = z.object({
  userId: z.string().uuid().optional(),
  bio: z.string().max(2000).optional(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional()
});

router.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { limit, offset } = getPaginationParams(req.query);
    const ratingGte = typeof req.query.rating === "string" ? Number(req.query.rating) : undefined;

    const where = ratingGte && Number.isFinite(ratingGte) ? { rating: { gte: ratingGte } } : {};

    const [items, total] = await Promise.all([
      prisma.volunteerProfile.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { rating: "desc" },
        include: { user: { select: { id: true, email: true, username: true } } }
      }),
      prisma.volunteerProfile.count({ where })
    ]);

    res.status(200).json({ status: "ok", data: { items, total, limit, offset } });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUser = req.user!;
    const data = volunteerSchema.parse(req.body);

    const targetUserId = currentUser.role === "admin" && data.userId ? data.userId : currentUser.id;

    const existingProfile = await prisma.volunteerProfile.findUnique({ where: { userId: targetUserId } });
    if (existingProfile) throw new AppError(409, "Volunteer profile already exists", "conflict");

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new AppError(404, "User not found", "not_found");

    const profile = await prisma.volunteerProfile.create({
      data: {
        userId: targetUserId,
        bio: data.bio,
        locationLat: data.locationLat,
        locationLng: data.locationLng
      }
    });

    res.status(201).json({ status: "ok", data: profile });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const profile = await prisma.volunteerProfile.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, email: true, username: true } } }
    });
    if (!profile) throw new AppError(404, "Volunteer not found", "not_found");
    res.status(200).json({ status: "ok", data: profile });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = volunteerSchema.parse(req.body);
    const currentUser = req.user!;

    const profile = await prisma.volunteerProfile.findUnique({ where: { id: req.params.id } });
    if (!profile) throw new AppError(404, "Volunteer not found", "not_found");

    const isOwner = profile.userId === currentUser.id;
    const isAdmin = currentUser.role === "admin";
    if (!isOwner && !isAdmin) throw new AppError(403, "Forbidden", "forbidden");

    const updated = await prisma.volunteerProfile.update({
      where: { id: req.params.id },
      data: {
        bio: data.bio,
        locationLat: data.locationLat,
        locationLng: data.locationLng
      }
    });

    res.status(200).json({ status: "ok", data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUser = req.user!;
    const profile = await prisma.volunteerProfile.findUnique({ where: { id: req.params.id } });
    if (!profile) throw new AppError(404, "Volunteer not found", "not_found");

    const isOwner = profile.userId === currentUser.id;
    const isAdmin = currentUser.role === "admin";
    if (!isOwner && !isAdmin) throw new AppError(403, "Forbidden", "forbidden");

    await prisma.volunteerProfile.delete({ where: { id: req.params.id } });
    res.status(200).json({ status: "ok", data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
});

export default router;
