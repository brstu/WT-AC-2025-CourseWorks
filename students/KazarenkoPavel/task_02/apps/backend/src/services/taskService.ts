import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";
import { AuthUser } from "../types/jwt";
import { CreateTaskInput, TaskQueryInput, UpdateTaskInput } from "../schemas/taskSchemas";
import { parsePagination } from "../utils/pagination";

function ensureOwnership(user: AuthUser, ownerId: string) {
  if (user.role !== "admin" && user.id !== ownerId) {
    throw new HttpError(403, "Forbidden", "forbidden");
  }
}

async function ensureTagsBelongToUser(tagIds: string[] | undefined, user: AuthUser, ownerId: string) {
  if (!tagIds || tagIds.length === 0) return;
  const count = await prisma.tag.count({ where: { id: { in: tagIds }, userId: ownerId } });
  if (count !== tagIds.length) {
    throw new HttpError(403, "One or more tags do not belong to the owner", "forbidden");
  }
}

export async function listTasks(user: AuthUser, query: TaskQueryInput) {
  const { limit, offset } = parsePagination(query);
  const where: Prisma.TaskWhereInput = {};

  if (user.role !== "admin") {
    where.userId = user.id;
  }

  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.tag) {
    where.tags = { some: { tagId: query.tag } };
  }

  const tasks = await prisma.task.findMany({
    where,
    include: { tags: { include: { tag: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset
  });

  return tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority,
    status: t.status,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    userId: t.userId,
    tags: t.tags.map((tt) => ({ id: tt.tag.id, name: tt.tag.name, color: tt.tag.color }))
  }));
}

export async function getTask(user: AuthUser, id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } }
  });
  if (!task) throw new HttpError(404, "Task not found", "not_found");
  ensureOwnership(user, task.userId);
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    userId: task.userId,
    tags: task.tags.map((tt) => ({ id: tt.tag.id, name: tt.tag.name, color: tt.tag.color }))
  };
}

export async function createTask(user: AuthUser, input: CreateTaskInput) {
  await ensureTagsBelongToUser(input.tagIds, user, user.id);

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      priority: input.priority ?? "medium",
      status: input.status ?? "pending",
      userId: user.id,
      tags: input.tagIds
        ? {
            create: input.tagIds.map((tagId) => ({
              tag: { connect: { id: tagId } }
            }))
          }
        : undefined
    },
    include: { tags: { include: { tag: true } } }
  });

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    userId: task.userId,
    tags: task.tags.map((tt) => ({ id: tt.tag.id, name: tt.tag.name, color: tt.tag.color }))
  };
}

export async function updateTask(user: AuthUser, id: string, input: UpdateTaskInput) {
  const task = await prisma.task.findUnique({ where: { id }, include: { tags: true } });
  if (!task) throw new HttpError(404, "Task not found", "not_found");
  ensureOwnership(user, task.userId);

  await ensureTagsBelongToUser(input.tagIds, user, task.userId);

  const updated = await prisma.task.update({
    where: { id },
    data: {
      title: input.title ?? task.title,
      description: input.description ?? task.description,
      priority: input.priority ?? task.priority,
      status: input.status ?? task.status,
      tags: input.tagIds
        ? {
            deleteMany: {},
            create: input.tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } }))
          }
        : undefined
    },
    include: { tags: { include: { tag: true } } }
  });

  return {
    id: updated.id,
    title: updated.title,
    description: updated.description,
    priority: updated.priority,
    status: updated.status,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    userId: updated.userId,
    tags: updated.tags.map((tt) => ({ id: tt.tag.id, name: tt.tag.name, color: tt.tag.color }))
  };
}

export async function deleteTask(user: AuthUser, id: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new HttpError(404, "Task not found", "not_found");
  ensureOwnership(user, task.userId);
  await prisma.task.delete({ where: { id } });
}
