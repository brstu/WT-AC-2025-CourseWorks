import { Router } from "express";
import { listFiles, getFileById, createFileHandler, deleteFileHandler } from "./files.controller.js";
import { asyncHandler } from "../../lib/asyncHandler.js";

const router = Router({ mergeParams: true });

router.get("/", asyncHandler(listFiles));
router.get("/:id", asyncHandler(getFileById));
router.post("/", asyncHandler(createFileHandler));
router.delete("/:id", asyncHandler(deleteFileHandler));

export const filesRouter = router;
