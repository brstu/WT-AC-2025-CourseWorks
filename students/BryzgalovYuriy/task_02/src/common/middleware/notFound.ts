import type { NextFunction, Request, Response } from 'express';

export function notFound(req: Request, res: Response, _next: NextFunction) {
  res.status(404).json({
    error: {
      message: 'Not found',
      path: req.originalUrl,
    },
  });
}
