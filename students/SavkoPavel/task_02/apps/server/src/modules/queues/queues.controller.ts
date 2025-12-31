import { Request, Response } from "express";
import * as queuesService from "./queues.service";
import { prisma } from "../../lib/prisma";

export async function list(req: Request, res: Response) {
  const user = (req as any).user as { userId: string; role: "ADMIN" | "AGENT" | "USER" };

  const queues =
    user.role === "AGENT"
      ? await queuesService.listQueuesForUser(user.userId)
      : await queuesService.listQueues();
  res.json({ status: "ok", data: queues });
}

export async function getById(req: Request, res: Response) {
  const user = (req as any).user as { userId: string; role: "ADMIN" | "AGENT" | "USER" };

  const queue =
    user.role === "AGENT"
      ? await queuesService.getQueueByIdForUser(req.params.id, user.userId)
      : await queuesService.getQueueById(req.params.id);
  if (!queue) {
    return res.status(404).json({ error: "Queue not found" });
  }
  res.json({ status: "ok", data: queue });
}

export async function create(req: Request, res: Response) {
  const { name, description } = req.body as { name?: string; description?: string };
  if (!name) {
    return res.status(400).json({ error: "NAME_REQUIRED" });
  }

  const queue = await queuesService.createQueue({ name, description });
  res.status(201).json({ status: "ok", data: queue });
}

export async function update(req: Request, res: Response) {
  const { name, description } = req.body as { name?: string; description?: string | null };

  try {
    const queue = await queuesService.updateQueue(req.params.id, { name, description });
    res.json({ status: "ok", data: queue });
  } catch {
    res.status(404).json({ error: "Queue not found" });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const deleted = await queuesService.deleteQueue(req.params.id);
    res.json({ status: "ok", data: deleted });
  } catch (err: any) {
    // например, если на очередь есть инциденты (FK RESTRICT)
    if (err.code === "P2003") {
      return res.status(409).json({ error: "QUEUE_HAS_INCIDENTS" });
    }
    res.status(404).json({ error: "Queue not found" });
  }
}

export async function listAgents(req: Request, res: Response) {
  const rows = await queuesService.listQueueAgents(req.params.id);
  res.json({ status: "ok", data: rows });
}

export async function addAgent(req: Request, res: Response) {
  const { userId } = req.body as { userId?: string };
  if (!userId) {
    return res.status(400).json({ error: "USER_ID_REQUIRED" });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
  if (!user) {
    return res.status(404).json({ error: "USER_NOT_FOUND" });
  }
  if (user.role !== "AGENT") {
    return res.status(400).json({ error: "USER_MUST_BE_AGENT" });
  }

  try {
    const row = await queuesService.addAgentToQueue(req.params.id, userId);
    return res.status(201).json({ status: "ok", data: row });
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "AGENT_ALREADY_IN_QUEUE" });
    }
    if (err.code === "P2003") {
      return res.status(404).json({ error: "QUEUE_NOT_FOUND" });
    }
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function removeAgent(req: Request, res: Response) {
  const userId = req.params.userId;
  const result = await queuesService.removeAgentFromQueue(req.params.id, userId);
  if (result.count === 0) {
    return res.status(404).json({ error: "MEMBERSHIP_NOT_FOUND" });
  }
  return res.json({ status: "ok" });
}
