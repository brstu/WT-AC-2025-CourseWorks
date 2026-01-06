import { Request, Response, NextFunction } from "express";
import { listTags, createTag, updateTag, deleteTag } from "../services/tagService";
import { HttpError } from "../utils/httpError";

export async function listTagsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized", "unauthorized");
    const tags = await listTags(req.user);
    res.json({ status: "ok", data: tags });
  } catch (err) {
    next(err);
  }
}

export async function createTagHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized", "unauthorized");
    const tag = await createTag(req.user, req.body);
    res.status(201).json({ status: "ok", data: tag });
  } catch (err) {
    next(err);
  }
}

export async function updateTagHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized", "unauthorized");
    const tag = await updateTag(req.user, req.params.id, req.body);
    res.json({ status: "ok", data: tag });
  } catch (err) {
    next(err);
  }
}

export async function deleteTagHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized", "unauthorized");
    await deleteTag(req.user, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
