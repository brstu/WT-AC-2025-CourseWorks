import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";
import { AuthUser } from "../types/jwt";
import { CreateSessionInput, SessionQueryInput, UpdateSessionInput } from "../schemas/sessionSchemas";
import { parsePagination } from "../utils/pagination";

function ensureOwnership(user: AuthUser, ownerId: string) {
  if (user.role !== "admin" && user.id !== ownerId) {
    throw new HttpError(403, "Forbidden", "forbidden");
  }
}

async function ensureTaskAccessible(taskId: string | undefined, user: AuthUser) {
  if (!taskId) return;
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new HttpError(404, "Task not found", "not_found");
  ensureOwnership(user, task.userId);
}

export async function listSessions(user: AuthUser, query: SessionQueryInput) {
  const { limit, offset } = parsePagination(query);
  const where: Prisma.SessionWhereInput = {};

  if (user.role !== "admin") {
    where.userId = user.id;
  }

  if (query.taskId) where.taskId = query.taskId;
  if (query.status) where.status = query.status;
  if (query.from || query.to) {
    where.startTime = {};
    if (query.from) (where.startTime as Prisma.DateTimeFilter).gte = new Date(query.from);
    if (query.to) (where.startTime as Prisma.DateTimeFilter).lte = new Date(query.to);
  }

  const sessions = await prisma.session.findMany({
    where,
    include: { task: true },
    orderBy: { startTime: "desc" },
    take: limit,
    skip: offset
  });

  return sessions;
}

export async function createSession(user: AuthUser, input: CreateSessionInput) {
  await ensureTaskAccessible(input.taskId, user);

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      taskId: input.taskId,
      startTime: new Date(),
      status: "running",
      sessionType: input.sessionType,
      duration: input.duration,
      totalPausedSeconds: 0
    }
  });

  return session;
}

export async function updateSession(user: AuthUser, id: string, input: UpdateSessionInput) {
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) throw new HttpError(404, "Session not found", "not_found");
  ensureOwnership(user, session.userId);

  const endTime = input.endTime ? new Date(input.endTime) : new Date();

  const updated = await prisma.session.update({
    where: { id },
    data: {
      status: input.status,
      endTime,
      duration: input.duration ?? session.duration
    }
  });

  return updated;
}

export async function pauseSession(user: AuthUser, id: string) {
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) throw new HttpError(404, "Session not found", "not_found");
  ensureOwnership(user, session.userId);

  if (session.status !== "running") {
    throw new HttpError(400, "Only running sessions can be paused", "invalid_state");
  }

  const updated = await prisma.session.update({
    where: { id },
    data: {
      status: "paused",
      pausedAt: new Date()
    }
  });

  return updated;
}

export async function resumeSession(user: AuthUser, id: string) {
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) throw new HttpError(404, "Session not found", "not_found");
  ensureOwnership(user, session.userId);

  if (session.status !== "paused" || !session.pausedAt) {
    throw new HttpError(400, "Only paused sessions can be resumed", "invalid_state");
  }

  const now = new Date();
  const pausedSeconds = Math.floor((now.getTime() - session.pausedAt.getTime()) / 1000);

  const updated = await prisma.session.update({
    where: { id },
    data: {
      status: "running",
      pausedAt: null,
      totalPausedSeconds: session.totalPausedSeconds + Math.max(pausedSeconds, 0)
    }
  });

  return updated;
}

export async function deleteSession(user: AuthUser, id: string) {
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) throw new HttpError(404, "Session not found", "not_found");
  ensureOwnership(user, session.userId);
  await prisma.session.delete({ where: { id } });
}
