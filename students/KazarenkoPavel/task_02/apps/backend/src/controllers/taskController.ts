import { Request, Response, NextFunction } from "express";
import { createTask, deleteTask, getTask, listTasks, updateTask } from "../services/taskService";
import { taskQuerySchema } from "../schemas/taskSchemas";
import { HttpError } from "../utils/httpError";

export async function listTasksHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized", "unauthorized");
    const parsed = taskQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fields[issue.path.join(".") || "root"] = issue.message;
      }
      return next({ status: 400, code: "validation_failed", message: "Validation failed", fields });
    }
    const tasks = await listTasks(req.user, parsed.data);
    res.json({ status: "ok", data: tasks });
  } catch (err) {
    next(err);
  }
}

export async function getTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized", "unauthorized");
    const task = await getTask(req.user, req.params.id);
    res.json({ status: "ok", data: task });
  } catch (err) {
    next(err);
  }
}

export async function createTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized", "unauthorized");
    const task = await createTask(req.user, req.body);
    res.status(201).json({ status: "ok", data: task });
  } catch (err) {
    next(err);
  }
}

export async function updateTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized", "unauthorized");
    const task = await updateTask(req.user, req.params.id, req.body);
    res.json({ status: "ok", data: task });
  } catch (err) {
    next(err);
  }
}

export async function deleteTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized", "unauthorized");
    await deleteTask(req.user, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
