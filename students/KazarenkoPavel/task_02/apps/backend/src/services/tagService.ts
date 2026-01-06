import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";
import { AuthUser } from "../types/jwt";
import { CreateTagInput, UpdateTagInput } from "../schemas/tagSchemas";

function ensureOwnership(user: AuthUser, ownerId: string) {
  if (user.role !== "admin" && user.id !== ownerId) {
    throw new HttpError(403, "Forbidden", "forbidden");
  }
}

export async function listTags(user: AuthUser) {
  const where = user.role === "admin" ? {} : { userId: user.id };
  const tags = await prisma.tag.findMany({ where, orderBy: { createdAt: "desc" } });
  return tags;
}

export async function createTag(user: AuthUser, input: CreateTagInput) {
  const tag = await prisma.tag.create({
    data: {
      name: input.name,
      color: input.color,
      userId: user.id
    }
  });
  return tag;
}

export async function updateTag(user: AuthUser, id: string, input: UpdateTagInput) {
  const tag = await prisma.tag.findUnique({ where: { id } });
  if (!tag) throw new HttpError(404, "Tag not found", "not_found");
  ensureOwnership(user, tag.userId);

  const updated = await prisma.tag.update({
    where: { id },
    data: {
      name: input.name ?? tag.name,
      color: input.color ?? tag.color
    }
  });
  return updated;
}

export async function deleteTag(user: AuthUser, id: string) {
  const tag = await prisma.tag.findUnique({ where: { id } });
  if (!tag) throw new HttpError(404, "Tag not found", "not_found");
  ensureOwnership(user, tag.userId);
  await prisma.tag.delete({ where: { id } });
}
