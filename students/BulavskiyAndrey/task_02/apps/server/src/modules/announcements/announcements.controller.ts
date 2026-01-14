import type { Request, Response } from "express";
import { createAnnouncementSchema, updateAnnouncementSchema } from "./announcements.schemas.js";
import {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from "./announcements.service.js";

export const listAnnouncements = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const userId = req.user!.id;
  const { page, pageSize } = req.query;
  const result = await getAnnouncements(groupId, userId, page as string, pageSize as string);
  res.json({ status: "ok", data: result.items, meta: { total: result.total, page: Number(page) || 1, pageSize: Number(pageSize) || 20 } });
};

export const getAnnouncementById = async (req: Request, res: Response) => {
  const { groupId, id } = req.params;
  const userId = req.user!.id;
  const announcement = await getAnnouncement(groupId, id, userId);
  res.json({ status: "ok", data: announcement });
};

export const createAnnouncementHandler = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const userId = req.user!.id;
  const data = createAnnouncementSchema.parse(req.body);
  const announcement = await createAnnouncement(groupId, userId, data);
  res.status(201).json({ status: "ok", data: announcement });
};

export const updateAnnouncementHandler = async (req: Request, res: Response) => {
  const { groupId, id } = req.params;
  const userId = req.user!.id;
  const data = updateAnnouncementSchema.parse(req.body);
  const announcement = await updateAnnouncement(groupId, id, userId, data);
  res.json({ status: "ok", data: announcement });
};

export const deleteAnnouncementHandler = async (req: Request, res: Response) => {
  const { groupId, id } = req.params;
  const userId = req.user!.id;
  await deleteAnnouncement(groupId, id, userId);
  res.json({ status: "ok" });
};

