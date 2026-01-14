import { Router } from "express";
import {
  listEvents,
  getEventById,
  createEventHandler,
  updateEventHandler,
  deleteEventHandler
} from "./calendar.controller.js";
import { asyncHandler } from "../../lib/asyncHandler.js";

const router = Router({ mergeParams: true });

router.get("/", asyncHandler(listEvents));
router.get("/:id", asyncHandler(getEventById));
router.post("/", asyncHandler(createEventHandler));
router.put("/:id", asyncHandler(updateEventHandler));
router.delete("/:id", asyncHandler(deleteEventHandler));

export const calendarRouter = router;
