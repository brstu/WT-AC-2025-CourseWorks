import type { Request, Response } from "express";
import { createPollSchema, voteSchema } from "./polls.schemas.js";
import { getPolls, getPoll, createPoll, vote, deletePoll } from "./polls.service.js";

export const listPolls = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const userId = req.user!.id;
  const { page, pageSize } = req.query;
  const result = await getPolls(groupId, userId, page as string, pageSize as string);
  res.json({ status: "ok", data: result.items, meta: { total: result.total, page: Number(page) || 1, pageSize: Number(pageSize) || 20 } });
};

export const getPollById = async (req: Request, res: Response) => {
  const { groupId, id } = req.params;
  const userId = req.user!.id;
  const poll = await getPoll(groupId, id, userId);
  res.json({ status: "ok", data: poll });
};

export const createPollHandler = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const userId = req.user!.id;
  const data = createPollSchema.parse(req.body);
  const poll = await createPoll(groupId, userId, data);
  res.status(201).json({ status: "ok", data: poll });
};

export const voteHandler = async (req: Request, res: Response) => {
  const { groupId, pollId } = req.params;
  const userId = req.user!.id;
  const { choiceIds } = voteSchema.parse(req.body);
  const poll = await vote(groupId, pollId, userId, choiceIds);
  res.json({ status: "ok", data: poll });
};

export const deletePollHandler = async (req: Request, res: Response) => {
  const { groupId, id } = req.params;
  const userId = req.user!.id;
  await deletePoll(groupId, id, userId);
  res.json({ status: "ok" });
};

