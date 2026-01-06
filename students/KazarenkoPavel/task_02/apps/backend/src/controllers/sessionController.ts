import { Request, Response, NextFunction } from "express";
import { createSession, deleteSession, listSessions, pauseSession, resumeSession, updateSession } from "../services/sessionService";
import { sessionQuerySchema } from "../schemas/sessionSchemas";
import { HttpError } from "../utils/httpError";

export async function listSessionsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized", "unauthorized");
    const parsed = sessionQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fields[issue.path.join(".") || "root"] = issue.message;
      }
      return next({ status: 400, code: "validation_failed", message: "Validation failed", fields });
    }
    const sessions = await listSessions(req.user, parsed.data);
    res.json({ status: "ok", data: sessions });
  } catch (err) {
    next(err);
  }
}

export async function createSessionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized", "unauthorized");
    const session = await createSession(req.user, req.body);
    res.status(201).json({ status: "ok", data: session });
  } catch (err) {
    next(err);
  }
}

export async function updateSessionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized", "unauthorized");
    const session = await updateSession(req.user, req.params.id, req.body);
    res.json({ status: "ok", data: session });
  } catch (err) {
    next(err);
  }
}

export async function pauseSessionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized", "unauthorized");
    const session = await pauseSession(req.user, req.params.id);
    res.json({ status: "ok", data: session });
  } catch (err) {
    next(err);
  }
}

export async function resumeSessionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized", "unauthorized");
    const session = await resumeSession(req.user, req.params.id);
    res.json({ status: "ok", data: session });
  } catch (err) {
    next(err);
  }
}

export async function deleteSessionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized", "unauthorized");
    await deleteSession(req.user, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
