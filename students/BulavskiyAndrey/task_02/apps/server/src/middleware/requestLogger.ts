import pinoHttp from "pino-http";
import { logger } from "../lib/logger.js";

const pinoHttpMiddleware = pinoHttp as unknown as typeof pinoHttp.default;

export const requestLogger = pinoHttpMiddleware({
  logger,
  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
  customErrorMessage: (req, res, err) =>
    err?.message ? `${req.method} ${req.url} failed: ${err.message}` : "request errored",
  redact: ["req.headers.authorization", "req.headers.cookie"],
  customProps: (req, res) => ({
    req: {
      method: req.method,
      url: req.url,
      userId: (req as any).user?.id
    },
    res: {
      statusCode: res.statusCode
    }
  })
});

