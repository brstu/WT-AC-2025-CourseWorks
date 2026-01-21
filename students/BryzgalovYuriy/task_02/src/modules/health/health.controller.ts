import type { Request, Response } from 'express';
import mongoose from 'mongoose';

export function healthz(_req: Request, res: Response) {
  const dbState = mongoose.connection.readyState; // 0=disconnected 1=connected 2=connecting 3=disconnecting
  const ok = dbState === 1;

  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'degraded',
    db: ok ? 'connected' : 'not_connected',
    timestamp: new Date().toISOString(),
  });
}
