import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { AssignmentStatus } from "@prisma/client";
import { getPaginationParams } from "../lib/pagination";

const router = Router();

const createReviewSchema = z.object({
  assignmentId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional()
});

const updateReviewSchema = createReviewSchema.partial().extend({ assignmentId: z.never().optional() });

async function recalcVolunteerStats(volunteerId: string) {
  await prisma.$transaction(async (tx) => {
    const [reviewsAgg, completedCount] = await Promise.all([
      tx.review.aggregate({
        where: { volunteerId },
        _avg: { rating: true },
        _count: { _all: true }
      }),
      tx.assignment.count({ where: { volunteerId, status: AssignmentStatus.completed } })
    ]);

    await tx.volunteerProfile.updateMany({
      where: { userId: volunteerId },
      data: {
        rating: reviewsAgg._avg.rating ?? 0,
        totalHelps: completedCount
      }
    });
  });
}

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { limit, offset } = getPaginationParams(req.query);
    const volunteerId = typeof req.query.volunteerId === "string" ? req.query.volunteerId : undefined;

    const where = volunteerId ? { volunteerId } : {};

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.review.count({ where })
    ]);

    res.status(200).json({ status: "ok", data: { items, total, limit, offset } });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUser = req.user!;
    const data = createReviewSchema.parse(req.body);

    const assignment = await prisma.assignment.findUnique({
      where: { id: data.assignmentId },
      include: { request: true }
    });
    if (!assignment) throw new AppError(404, "Assignment not found", "not_found");
    if (assignment.status !== AssignmentStatus.completed) {
      throw new AppError(400, "Assignment is not completed", "invalid_state");
    }
    if (assignment.request.userId !== currentUser.id && currentUser.role !== "admin") {
      throw new AppError(403, "Forbidden", "forbidden");
    }

    const existingReview = await prisma.review.findUnique({ where: { assignmentId: data.assignmentId } });
    if (existingReview) throw new AppError(409, "Review already exists", "conflict");

    const review = await prisma.review.create({
      data: {
        assignmentId: data.assignmentId,
        rating: data.rating,
        comment: data.comment,
        userId: currentUser.id,
        volunteerId: assignment.volunteerId
      }
    });

    await recalcVolunteerStats(assignment.volunteerId);

    res.status(201).json({ status: "ok", data: review });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) throw new AppError(404, "Review not found", "not_found");

    const currentUser = req.user!;
    const isAdmin = currentUser.role === "admin";
    const isOwner = review.userId === currentUser.id;
    const isVolunteer = review.volunteerId === currentUser.id;

    if (!isAdmin && !isOwner && !isVolunteer) throw new AppError(403, "Forbidden", "forbidden");

    res.status(200).json({ status: "ok", data: review });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = updateReviewSchema.parse(req.body);
    const currentUser = req.user!;

    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) throw new AppError(404, "Review not found", "not_found");

    const isAdmin = currentUser.role === "admin";
    const isOwner = review.userId === currentUser.id;
    if (!isAdmin && !isOwner) throw new AppError(403, "Forbidden", "forbidden");

    const updated = await prisma.review.update({
      where: { id: review.id },
      data: {
        rating: data.rating ?? review.rating,
        comment: data.comment ?? review.comment
      }
    });

    await recalcVolunteerStats(review.volunteerId);

    res.status(200).json({ status: "ok", data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUser = req.user!;
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) throw new AppError(404, "Review not found", "not_found");

    const isAdmin = currentUser.role === "admin";
    const isOwner = review.userId === currentUser.id;
    if (!isAdmin && !isOwner) throw new AppError(403, "Forbidden", "forbidden");

    await prisma.review.delete({ where: { id: review.id } });
    await recalcVolunteerStats(review.volunteerId);

    res.status(200).json({ status: "ok", data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
});

export default router;
