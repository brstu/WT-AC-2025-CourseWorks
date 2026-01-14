import type { Request, Response } from "express";

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ status: "error", error: { code: "not_found", message: "Route not found" } });
};

