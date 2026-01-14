import pino from "pino";
import { config } from "./config.js";

export const logger = pino({
  level: config.logLevel || (config.env === "development" ? "debug" : "info"),
  formatters: {
    level: (label) => ({ level: label })
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport:
    config.env !== "production"
      ? {
          target: "pino-pretty",
          options: { colorize: true }
        }
      : undefined
});

