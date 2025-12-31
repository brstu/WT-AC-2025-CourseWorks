import { Request, Response } from "express";
import * as slaService from "./sla.service";

export async function list(req: Request, res: Response) {
  const user = (req as any).user as { userId: string; role: "ADMIN" | "AGENT" | "USER" };
  const rows =
    user.role === "AGENT"
      ? await slaService.listSlaForUser(user.userId)
      : await slaService.listSla();
  res.json({ status: "ok", data: rows });
}

export async function getById(req: Request, res: Response) {
  const user = (req as any).user as { userId: string; role: "ADMIN" | "AGENT" | "USER" };
  const row =
    user.role === "AGENT"
      ? await slaService.getSlaByIdForUser(req.params.id, user.userId)
      : await slaService.getSlaById(req.params.id);
  if (!row) {
    return res.status(404).json({ error: "SLA not found" });
  }
  res.json({ status: "ok", data: row });
}

export async function create(req: Request, res: Response) {
  const { queueId, reactionTimeMinutes, resolutionTimeMinutes } = req.body as {
    queueId?: string;
    reactionTimeMinutes?: number;
    resolutionTimeMinutes?: number;
  };

  if (!queueId) return res.status(400).json({ error: "QUEUE_ID_REQUIRED" });
  if (typeof reactionTimeMinutes !== "number" || reactionTimeMinutes <= 0) {
    return res.status(400).json({ error: "INVALID_REACTION_TIME" });
  }
  if (typeof resolutionTimeMinutes !== "number" || resolutionTimeMinutes <= 0) {
    return res.status(400).json({ error: "INVALID_RESOLUTION_TIME" });
  }

  try {
    const row = await slaService.createSla({
      queueId,
      reactionTimeMinutes,
      resolutionTimeMinutes,
    });
    res.status(201).json({ status: "ok", data: row });
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "SLA_ALREADY_EXISTS_FOR_QUEUE" });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "QUEUE_NOT_FOUND" });
    }
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function update(req: Request, res: Response) {
  const { reactionTimeMinutes, resolutionTimeMinutes } = req.body as {
    reactionTimeMinutes?: number;
    resolutionTimeMinutes?: number;
  };

  if (
    reactionTimeMinutes !== undefined &&
    (typeof reactionTimeMinutes !== "number" || reactionTimeMinutes <= 0)
  ) {
    return res.status(400).json({ error: "INVALID_REACTION_TIME" });
  }
  if (
    resolutionTimeMinutes !== undefined &&
    (typeof resolutionTimeMinutes !== "number" || resolutionTimeMinutes <= 0)
  ) {
    return res.status(400).json({ error: "INVALID_RESOLUTION_TIME" });
  }

  try {
    const row = await slaService.updateSla(req.params.id, {
      reactionTimeMinutes,
      resolutionTimeMinutes,
    });
    res.json({ status: "ok", data: row });
  } catch {
    res.status(404).json({ error: "SLA not found" });
  }
}
