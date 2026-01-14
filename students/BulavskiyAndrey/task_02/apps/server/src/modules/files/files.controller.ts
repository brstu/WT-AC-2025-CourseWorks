import type { Request, Response } from "express";
import { createFileSchema } from "./files.schemas.js";
import { getFiles, getFile, createFile, deleteFile } from "./files.service.js";

export const listFiles = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const userId = req.user!.id;
  const { page, pageSize, category } = req.query;
  const result = await getFiles(groupId, userId, page as string, pageSize as string, category as string);
  res.json({ status: "ok", data: result.items, meta: { total: result.total, page: Number(page) || 1, pageSize: Number(pageSize) || 20 } });
};

export const getFileById = async (req: Request, res: Response) => {
  const { groupId, id } = req.params;
  const userId = req.user!.id;
  const file = await getFile(groupId, id, userId);
  res.json({ status: "ok", data: file });
};

export const createFileHandler = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const userId = req.user!.id;
  const data = createFileSchema.parse(req.body);
  const file = await createFile(groupId, userId, data);
  res.status(201).json({ status: "ok", data: file });
};

export const deleteFileHandler = async (req: Request, res: Response) => {
  const { groupId, id } = req.params;
  const userId = req.user!.id;
  await deleteFile(groupId, id, userId);
  res.json({ status: "ok" });
};

