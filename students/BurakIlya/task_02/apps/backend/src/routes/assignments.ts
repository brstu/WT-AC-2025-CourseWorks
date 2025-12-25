import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { AssignmentStatus, HelpRequestStatus } from "@prisma/client";
import { getPaginationParams } from "../lib/pagination";

const router = Router();

const createAssignmentSchema = z.object({
  requestId: z.string().uuid(),
  volunteerId: z.string().uuid().optional()
});

const updateAssignmentSchema = z.object({
  status: z.nativeEnum(AssignmentStatus)
});

router.post("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUser = req.user!;
    const data = createAssignmentSchema.parse(req.body);

    const request = await prisma.helpRequest.findUnique({ where: { id: data.requestId } });
    if (!request) throw new AppError(404, "Request not found", "not_found");

    const targetVolunteerId = data.volunteerId ?? currentUser.id;

    const volunteerProfile = await prisma.volunteerProfile.findUnique({ where: { userId: targetVolunteerId } });
    if (!volunteerProfile) throw new AppError(403, "Volunteer profile required", "forbidden");

    const isAdmin = currentUser.role === "admin";
    const isOwner = request.userId === currentUser.id;
    if (!isAdmin && currentUser.id !== targetVolunteerId) {
      throw new AppError(403, "Cannot assign other volunteers", "forbidden");
    }
    if (!isAdmin && isOwner) {
      throw new AppError(403, "Volunteer cannot take own request", "forbidden");
    }
    if (request.status !== "new") {
      throw new AppError(400, "Request is not available", "invalid_state");
    }

    const existingAssignment = await prisma.assignment.findFirst({ where: { requestId: request.id } });
    if (existingAssignment) throw new AppError(409, "Request already assigned", "conflict");

    const assignment = await prisma.$transaction(async (tx) => {
      const created = await tx.assignment.create({
        data: {
          requestId: request.id,
          volunteerId: targetVolunteerId,
          status: AssignmentStatus.assigned
        }
      });

      await tx.helpRequest.update({ where: { id: request.id }, data: { status: HelpRequestStatus.assigned } });
      return created;
    });

    res.status(201).json({ status: "ok", data: assignment });
  } catch (err) {
    next(err);
  }
});

router.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { limit, offset } = getPaginationParams(req.query);
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const requestId = typeof req.query.requestId === "string" ? req.query.requestId : undefined;
    const volunteerId = typeof req.query.volunteerId === "string" ? req.query.volunteerId : undefined;

    const currentUser = req.user!;
    const isAdmin = currentUser.role === "admin";

    const filters: any[] = [];
    if (status && Object.values(AssignmentStatus).includes(status as AssignmentStatus)) {
      filters.push({ status: status as AssignmentStatus });
    }
    if (requestId) filters.push({ requestId });
    if (isAdmin && volunteerId) filters.push({ volunteerId });

    if (isAdmin) {
      // no extra
    } else {
      filters.push({ OR: [{ volunteerId: currentUser.id }, { request: { userId: currentUser.id } }] });
    }

    const where = filters.length ? { AND: filters } : {};

    const [items, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { assignedAt: "desc" },
        include: { request: true }
      }),
      prisma.assignment.count({ where })
    ]);

    res.status(200).json({ status: "ok", data: { items, total, limit, offset } });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: req.params.id },
      include: { request: true }
    });
    if (!assignment) throw new AppError(404, "Assignment not found", "not_found");

    const currentUser = req.user!;
    const isAdmin = currentUser.role === "admin";
    const isVolunteer = assignment.volunteerId === currentUser.id;
    const isRequestOwner = assignment.request.userId === currentUser.id;

    if (!isAdmin && !isVolunteer && !isRequestOwner) throw new AppError(403, "Forbidden", "forbidden");

    res.status(200).json({ status: "ok", data: assignment });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = updateAssignmentSchema.parse(req.body);
    const currentUser = req.user!;

    const assignment = await prisma.assignment.findUnique({
      where: { id: req.params.id },
      include: { request: true }
    });
    if (!assignment) throw new AppError(404, "Assignment not found", "not_found");

    const isAdmin = currentUser.role === "admin";
    const isVolunteer = assignment.volunteerId === currentUser.id;
    if (!isAdmin && !isVolunteer) throw new AppError(403, "Forbidden", "forbidden");

    const updated = await prisma.$transaction(async (tx) => {
      const saved = await tx.assignment.update({
        where: { id: assignment.id },
        data: { status: data.status }
      });

      const requestStatusMap: Record<AssignmentStatus, HelpRequestStatus> = {
        assigned: HelpRequestStatus.assigned,
        in_progress: HelpRequestStatus.in_progress,
        completed: HelpRequestStatus.completed,
        cancelled: HelpRequestStatus.cancelled
      };

      await tx.helpRequest.update({ where: { id: assignment.requestId }, data: { status: requestStatusMap[data.status] } });
      return saved;
    });

    res.status(200).json({ status: "ok", data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUser = req.user!;
    if (currentUser.role !== "admin") throw new AppError(403, "Forbidden", "forbidden");

    const assignment = await prisma.assignment.findUnique({
      where: { id: req.params.id },
      include: { request: true }
    });
    if (!assignment) throw new AppError(404, "Assignment not found", "not_found");

    await prisma.$transaction(async (tx) => {
      await tx.assignment.delete({ where: { id: assignment.id } });
      await tx.helpRequest.update({
        where: { id: assignment.requestId },
        data: { status: assignment.request.status === HelpRequestStatus.completed ? HelpRequestStatus.completed : HelpRequestStatus.new }
      });
    });

    res.status(200).json({ status: "ok", data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
});

export default router;
