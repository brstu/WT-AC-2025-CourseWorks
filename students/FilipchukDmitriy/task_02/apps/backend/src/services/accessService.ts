import { Permission, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/errors";

export async function ensureNotebookAccess(user: { id: string; role: Role }, notebookId: string, required: "read" | "write" | "owner" = "read") {
  const notebook = await prisma.notebook.findUnique({ where: { id: notebookId } });
  if (!notebook) {
    throw new HttpError(404, "not_found", "Notebook not found");
  }

  if (user.role === Role.admin) {
    return { notebook, permission: Permission.write as Permission };
  }

  if (notebook.ownerId === user.id) {
    return { notebook, permission: Permission.write as Permission };
  }

  const share = await prisma.share.findUnique({ where: { notebookId_userId: { notebookId, userId: user.id } } });
  if (!share) {
    throw new HttpError(403, "forbidden", "Access denied to notebook");
  }

  if (required === "write" && share.permission !== Permission.write) {
    throw new HttpError(403, "forbidden", "Write permission required");
  }

  if (required === "owner") {
    throw new HttpError(403, "forbidden", "Owner permission required");
  }

  return { notebook, permission: share.permission };
}

export async function ensureNoteAccess(user: { id: string; role: Role }, noteId: string, required: "read" | "write" = "read") {
  const note = await prisma.note.findUnique({ where: { id: noteId }, include: { notebook: true } });
  if (!note) {
    throw new HttpError(404, "not_found", "Note not found");
  }
  await ensureNotebookAccess(user, note.notebookId, required === "write" ? "write" : "read");
  return note;
}

export function assertAdmin(user: { role: Role }) {
  if (user.role !== Role.admin) {
    throw new HttpError(403, "forbidden", "Admin privileges required");
  }
}
