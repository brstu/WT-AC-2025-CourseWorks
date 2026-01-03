import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

interface AppError {
  status?: number;
  code?: string;
  message?: string;
  fields?: Record<string, string>;
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    err.issues.forEach((issue) => {
      if (issue.path.length) {
        fields[issue.path.join('.')] = issue.message;
      }
    });
    return res
      .status(400)
      .json({
        status: 'error',
        error: { code: 'validation_failed', message: 'Validation failed', fields },
      });
  }

  const status = err.status || 500;
  const code = err.code || (status >= 500 ? 'internal_error' : 'bad_request');
  const message = err.message || 'Internal server error';

  res
    .status(status)
    .json({
      status: 'error',
      error: { code, message, ...(err.fields ? { fields: err.fields } : {}) },
    });
}
