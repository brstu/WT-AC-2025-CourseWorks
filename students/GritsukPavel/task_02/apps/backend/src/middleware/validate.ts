import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fields: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path.length) {
          fields[issue.path.join('.')] = issue.message;
        }
      });
      return next({ status: 400, code: 'validation_failed', message: 'Validation failed', fields });
    }
    req.body = result.data;
    next();
  };
}
