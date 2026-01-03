import { NextFunction, Request, Response } from 'express';

type RateLimitOptions = {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
};

// Simple in-memory fixed-window rate limiter per key.
// For MVP this is sufficient; per-process only.
const store = new Map<string, { count: number; windowStart: number }>();

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, keyGenerator } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = keyGenerator ? keyGenerator(req) : req.ip;

    const current = store.get(key);
    if (!current || now - current.windowStart >= windowMs) {
      store.set(key, { count: 1, windowStart: now });
      return next();
    }

    if (current.count < max) {
      current.count += 1;
      store.set(key, current);
      return next();
    }

    return res.status(429).json({
      status: 'error',
      error: {
        code: 'too_many_requests',
        message: 'Too many requests. Please try again later.',
      },
    });
  };
}
