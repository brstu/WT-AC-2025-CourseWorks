import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".") || "root";
        fields[path] = issue.message;
      }
      return next({ status: 400, code: "validation_failed", message: "Validation failed", fields });
    }
    req.body = result.data as unknown as Request["body"];
    next();
  };
}
