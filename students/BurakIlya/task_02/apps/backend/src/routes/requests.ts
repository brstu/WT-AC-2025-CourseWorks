import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { getPaginationParams } from "../lib/pagination";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { HelpRequestStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";

const router = Router();

const createRequestSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(3).max(2000),
  categoryId: z.string().uuid(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  locationAddress: z.string().min(3).max(300)
});

const updateRequestSchema = createRequestSchema.partial().extend({
  status: z.nativeEnum(HelpRequestStatus).optional()
});

router.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { limit, offset } = getPaginationParams(req.query);
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
    const userIdQuery = typeof req.query.userId === "string" ? req.query.userId : undefined;

    const currentUser = req.user!;
    const isAdmin = currentUser.role === "admin";

    const volunteerProfile = await prisma.volunteerProfile.findUnique({ where: { userId: currentUser.id } });
    const filters: Prisma.HelpRequestWhereInput[] = [];

    if (status && Object.values(HelpRequestStatus).includes(status as HelpRequestStatus)) {
      filters.push({ status: status as HelpRequestStatus });
    }
    if (categoryId) filters.push({ categoryId });
    if (isAdmin && userIdQuery) filters.push({ userId: userIdQuery });

    if (isAdmin) {
      // no extra filter
    } else if (volunteerProfile) {
      filters.push({ OR: [{ userId: currentUser.id }, { status: HelpRequestStatus.new }] });
    } else {
      filters.push({ userId: currentUser.id });
    }

    const where: Prisma.HelpRequestWhereInput = filters.length ? { AND: filters } : {};

    const [items, total] = await Promise.all([
      prisma.helpRequest.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { category: true }
      }),
      prisma.helpRequest.count({ where })
    ]);

    res.status(200).json({ status: "ok", data: { items, total, limit, offset } });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = createRequestSchema.parse(req.body);
    const currentUser = req.user!;

    const request = await prisma.helpRequest.create({
      data: {
        ...data,
        userId: currentUser.id,
        status: HelpRequestStatus.new
      }
    });

    res.status(201).json({ status: "ok", data: request });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUser = req.user!;
    const request = await prisma.helpRequest.findUnique({
      where: { id: req.params.id },
      include: { assignments: true }
    });
    if (!request) throw new AppError(404, "Request not found", "not_found");

    const isAdmin = currentUser.role === "admin";
    const isOwner = request.userId === currentUser.id;
    const volunteerProfile = await prisma.volunteerProfile.findUnique({ where: { userId: currentUser.id } });
    const isAssignedVolunteer = request.assignments.some((a) => a.volunteerId === currentUser.id);

    const canView =
      isAdmin ||
      isOwner ||
      isAssignedVolunteer ||
      (volunteerProfile && request.status === HelpRequestStatus.new);

    if (!canView) throw new AppError(403, "Forbidden", "forbidden");

    res.status(200).json({ status: "ok", data: request });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUser = req.user!;
    const data = updateRequestSchema.parse(req.body);

    const existing = await prisma.helpRequest.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, "Request not found", "not_found");

    const isOwner = existing.userId === currentUser.id;
    const isAdmin = currentUser.role === "admin";
    if (!isOwner && !isAdmin) throw new AppError(403, "Forbidden", "forbidden");

    if (data.status && !isAdmin) {
      throw new AppError(403, "Only admin can change status", "forbidden");
    }

    const updated = await prisma.helpRequest.update({
      where: { id: req.params.id },
      data
    });

    res.status(200).json({ status: "ok", data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUser = req.user!;
    const request = await prisma.helpRequest.findUnique({ where: { id: req.params.id } });
    if (!request) throw new AppError(404, "Request not found", "not_found");

    const isOwner = request.userId === currentUser.id;
    const isAdmin = currentUser.role === "admin";

    if (!isAdmin && (!isOwner || request.status !== HelpRequestStatus.new)) {
      throw new AppError(403, "Only owner can delete new request", "forbidden");
    }

    await prisma.helpRequest.delete({ where: { id: req.params.id } });
    res.status(200).json({ status: "ok", data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
});

export default router;
