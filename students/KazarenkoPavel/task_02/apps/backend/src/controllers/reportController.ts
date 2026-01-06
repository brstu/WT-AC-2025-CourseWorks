import { Request, Response, NextFunction } from "express";
import { byTagReport, dailyReport, exportReport, monthlyReport, weeklyReport } from "../services/reportService";
import { dateParamSchema, weekParamSchema, monthParamSchema, rangeParamSchema, exportQuerySchema } from "../schemas/reportSchemas";
import { HttpError } from "../utils/httpError";

function parseOrThrow<T>(schema: { safeParse: (data: unknown) => { success: true; data: T } | { success: false; error: any } }, payload: unknown, next: NextFunction) {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fields[issue.path.join(".") || "root"] = issue.message;
    }
    next({ status: 400, code: "validation_failed", message: "Validation failed", fields });
    return null;
  }
  return parsed.data as T;
}

export async function dailyReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized", "unauthorized");
    const parsed = parseOrThrow(dateParamSchema, req.query, next);
    if (!parsed) return;
    const date = new Date(parsed.date);
    const data = await dailyReport(req.user, date, parsed.userId);
    res.json({ status: "ok", data });
  } catch (err) {
    next(err);
  }
}

export async function weeklyReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized", "unauthorized");
    const parsed = parseOrThrow(weekParamSchema, req.query, next);
    if (!parsed) return;
    const weekStart = new Date(parsed.weekStart);
    const data = await weeklyReport(req.user, weekStart, parsed.userId);
    res.json({ status: "ok", data });
  } catch (err) {
    next(err);
  }
}

export async function monthlyReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized", "unauthorized");
    const parsed = parseOrThrow(monthParamSchema, req.query, next);
    if (!parsed) return;
    const data = await monthlyReport(req.user, parsed.month, parsed.userId);
    res.json({ status: "ok", data });
  } catch (err) {
    next(err);
  }
}

export async function byTagReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized", "unauthorized");
    const parsed = parseOrThrow(rangeParamSchema, req.query, next);
    if (!parsed) return;
    const from = new Date(parsed.from);
    const to = new Date(parsed.to);
    const data = await byTagReport(req.user, from, to, parsed.userId);
    res.json({ status: "ok", data });
  } catch (err) {
    next(err);
  }
}

export async function exportReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized", "unauthorized");
    const parsed = parseOrThrow(exportQuerySchema, req.query, next);
    if (!parsed) return;
    const result = await exportReport(req.user, parsed);

    if (result.format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.send(result.content);
      return;
    }

    res.json({ status: "ok", data: result.content });
  } catch (err) {
    next(err);
  }
}
