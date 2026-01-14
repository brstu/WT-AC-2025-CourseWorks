import type { Request, Response } from "express";
import { createEventSchema, updateEventSchema } from "./calendar.schemas.js";
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent } from "./calendar.service.js";

export const listEvents = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const userId = req.user!.id;
  const { page, pageSize, startDate, endDate } = req.query;
  const result = await getEvents(groupId, userId, page as string, pageSize as string, startDate as string, endDate as string);
  res.json({ status: "ok", data: result.items, meta: { total: result.total, page: Number(page) || 1, pageSize: Number(pageSize) || 20 } });
};

export const getEventById = async (req: Request, res: Response) => {
  const { groupId, id } = req.params;
  const userId = req.user!.id;
  const event = await getEvent(groupId, id, userId);
  res.json({ status: "ok", data: event });
};

export const createEventHandler = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const userId = req.user!.id;
  const data = createEventSchema.parse(req.body);
  const event = await createEvent(groupId, userId, data);
  res.status(201).json({ status: "ok", data: event });
};

export const updateEventHandler = async (req: Request, res: Response) => {
  const { groupId, id } = req.params;
  const userId = req.user!.id;
  const data = updateEventSchema.parse(req.body);
  const event = await updateEvent(groupId, id, userId, data);
  res.json({ status: "ok", data: event });
};

export const deleteEventHandler = async (req: Request, res: Response) => {
  const { groupId, id } = req.params;
  const userId = req.user!.id;
  await deleteEvent(groupId, id, userId);
  res.json({ status: "ok" });
};

