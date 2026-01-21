import type { NextFunction, Request, Response } from 'express';

type AnyError = {
  status?: number;
  message?: string;
  stack?: string;
};

export function errorHandler(err: AnyError, _req: Request, res: Response, _next: NextFunction) {
  const status = typeof err?.status === 'number' ? err.status : 500;
  const message = err?.message ?? 'Internal server error';

  // eslint-disable-next-line no-console
  console.error('[error]', err);

  res.status(status).json({
    error: {
      message,
      status,
    },
  });
}
