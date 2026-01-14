import { Router } from "express";
import {
  listChats,
  getChatById,
  createChatHandler,
  listMessages,
  sendMessageHandler,
  updateMessageHandler,
  deleteMessageHandler,
  deleteChatHandler
} from "./chats.controller.js";
import { asyncHandler } from "../../lib/asyncHandler.js";

const router = Router({ mergeParams: true });

router.get("/", asyncHandler(listChats));
router.get("/:chatId", asyncHandler(getChatById));
router.post("/", asyncHandler(createChatHandler));
router.get("/:chatId/messages", asyncHandler(listMessages));
router.post("/:chatId/messages", asyncHandler(sendMessageHandler));
router.put("/:chatId/messages/:messageId", asyncHandler(updateMessageHandler));
router.delete("/:chatId/messages/:messageId", asyncHandler(deleteMessageHandler));
router.delete("/:chatId", asyncHandler(deleteChatHandler));

export const chatsRouter = router;
