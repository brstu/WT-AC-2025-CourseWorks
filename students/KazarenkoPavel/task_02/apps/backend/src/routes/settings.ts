import { Router } from "express";
import { getNotificationSettingsHandler, updateNotificationSettingsHandler } from "../controllers/settingsController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { updateNotificationSettingsSchema } from "../schemas/settingsSchemas";

const router = Router();

router.use(requireAuth);
router.get("/notifications", getNotificationSettingsHandler);
router.put("/notifications", validate(updateNotificationSettingsSchema), updateNotificationSettingsHandler);

export default router;
