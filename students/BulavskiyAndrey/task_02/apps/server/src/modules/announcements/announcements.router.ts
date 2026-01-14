import { Router } from "express";
import {
  listAnnouncements,
  getAnnouncementById,
  createAnnouncementHandler,
  updateAnnouncementHandler,
  deleteAnnouncementHandler
} from "./announcements.controller.js";
import { asyncHandler } from "../../lib/asyncHandler.js";

const router = Router({ mergeParams: true });

router.get("/", asyncHandler(listAnnouncements));
router.get("/:id", asyncHandler(getAnnouncementById));
router.post("/", asyncHandler(createAnnouncementHandler));
router.put("/:id", asyncHandler(updateAnnouncementHandler));
router.delete("/:id", asyncHandler(deleteAnnouncementHandler));

export const announcementsRouter = router;
