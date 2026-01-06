import { Request, Response, NextFunction } from "express";
import { getNotificationSettings, updateNotificationSettings } from "../services/settingsService";
import { HttpError } from "../utils/httpError";

export async function getNotificationSettingsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized", "unauthorized");
    const settings = await getNotificationSettings(req.user);
    res.json({ status: "ok", data: settings });
  } catch (err) {
    next(err);
  }
}

export async function updateNotificationSettingsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized", "unauthorized");
    const settings = await updateNotificationSettings(req.user, req.body);
    res.json({ status: "ok", data: settings });
  } catch (err) {
    next(err);
  }
}
