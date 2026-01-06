import { Router } from "express";
import {
  dailyReportHandler,
  weeklyReportHandler,
  monthlyReportHandler,
  byTagReportHandler,
  exportReportHandler
} from "../controllers/reportController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.get("/daily", dailyReportHandler);
router.get("/weekly", weeklyReportHandler);
router.get("/monthly", monthlyReportHandler);
router.get("/by-tag", byTagReportHandler);
router.get("/export", exportReportHandler);

export default router;
