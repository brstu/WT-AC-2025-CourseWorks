import { Router } from "express";
import {
  listPolls,
  getPollById,
  createPollHandler,
  voteHandler,
  deletePollHandler
} from "./polls.controller.js";
import { asyncHandler } from "../../lib/asyncHandler.js";

const router = Router({ mergeParams: true });

router.get("/", asyncHandler(listPolls));
router.get("/:pollId", asyncHandler(getPollById));
router.post("/", asyncHandler(createPollHandler));
router.post("/:pollId/votes", asyncHandler(voteHandler));
router.delete("/:pollId", asyncHandler(deletePollHandler));

export const pollsRouter = router;
