import { Router } from "express";
import { healthRouter } from "./health.js";
import { authRouter } from "../modules/auth/auth.router.js";
import { announcementsRouter } from "../modules/announcements/announcements.router.js";
import { filesRouter } from "../modules/files/files.router.js";
import { calendarRouter } from "../modules/calendar/calendar.router.js";
import { pollsRouter } from "../modules/polls/polls.router.js";
import { chatsRouter } from "../modules/chats/chats.router.js";
import { authenticate } from "../middleware/auth.js";
import { requireGroupAccess } from "../middleware/groupAccess.js";

const router = Router();

router.use("/auth", authRouter);
router.use(healthRouter);

// Базовый префикс /groups/:groupId для всех основных ресурсов
// Все роуты требуют аутентификации и проверки доступа к группе
router.use("/groups/:groupId/announcements", authenticate, requireGroupAccess(), announcementsRouter);
router.use("/groups/:groupId/files", authenticate, requireGroupAccess(), filesRouter);
router.use("/groups/:groupId/calendar", authenticate, requireGroupAccess(), calendarRouter);
router.use("/groups/:groupId/polls", authenticate, requireGroupAccess(), pollsRouter);
router.use("/groups/:groupId/chats", authenticate, requireGroupAccess(), chatsRouter);

export const apiRouter = router;


