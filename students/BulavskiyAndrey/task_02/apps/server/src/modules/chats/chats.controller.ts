import type { Request, Response } from "express";
import { createChatSchema, createMessageSchema, updateMessageSchema } from "./chats.schemas.js";
import {
  getChats,
  getChat,
  createChat,
  getMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  deleteChat
} from "./chats.service.js";

export const listChats = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const userId = req.user!.id;
  const { page, pageSize } = req.query;
  const result = await getChats(groupId, userId, page as string, pageSize as string);
  res.json({ status: "ok", data: result.items, meta: { total: result.total, page: Number(page) || 1, pageSize: Number(pageSize) || 20 } });
};

export const getChatById = async (req: Request, res: Response) => {
  const { groupId, id } = req.params;
  const userId = req.user!.id;
  const chat = await getChat(groupId, id, userId);
  res.json({ status: "ok", data: chat });
};

export const createChatHandler = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const userId = req.user!.id;
  const data = createChatSchema.parse(req.body);
  const chat = await createChat(groupId, userId, data);
  res.status(201).json({ status: "ok", data: chat });
};

export const listMessages = async (req: Request, res: Response) => {
  const { groupId, chatId } = req.params;
  const userId = req.user!.id;
  const { page, pageSize } = req.query;
  const result = await getMessages(groupId, chatId, userId, page as string, pageSize as string);
  res.json({ status: "ok", data: result.items, meta: { total: result.total, page: Number(page) || 1, pageSize: Number(pageSize) || 20 } });
};

export const sendMessageHandler = async (req: Request, res: Response) => {
  const { groupId, chatId } = req.params;
  const userId = req.user!.id;
  const data = createMessageSchema.parse(req.body);
  const message = await sendMessage(groupId, chatId, userId, data);
  res.status(201).json({ status: "ok", data: message });
};

export const updateMessageHandler = async (req: Request, res: Response) => {
  const { groupId, chatId, messageId } = req.params;
  const userId = req.user!.id;
  const data = updateMessageSchema.parse(req.body);
  const message = await updateMessage(groupId, chatId, messageId, userId, data);
  res.json({ status: "ok", data: message });
};

export const deleteMessageHandler = async (req: Request, res: Response) => {
  const { groupId, chatId, messageId } = req.params;
  const userId = req.user!.id;
  await deleteMessage(groupId, chatId, messageId, userId);
  res.json({ status: "ok" });
};

export const deleteChatHandler = async (req: Request, res: Response) => {
  const { groupId, id } = req.params;
  const userId = req.user!.id;
  await deleteChat(groupId, id, userId);
  res.json({ status: "ok" });
};

