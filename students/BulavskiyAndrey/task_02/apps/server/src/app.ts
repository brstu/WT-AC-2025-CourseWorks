import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import { existsSync } from "node:fs";
import { requestLogger } from "./middleware/requestLogger.js";
import { apiRouter } from "./routes/index.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { config } from "./lib/config.js";
import {
  httpRequestDuration,
  httpRequestsTotal,
  register as metricsRegistry
} from "./lib/metrics.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine correct path: dev (src/) vs production (dist/src/)
const devPath = join(__dirname, "..", "openapi.yaml");
const prodPath = join(__dirname, "..", "..", "openapi.yaml");
const openapiPath = existsSync(devPath) ? devPath : prodPath;
const openapiDocument = YAML.parse(readFileSync(openapiPath, "utf8"));

export const buildApp = () => {
  const app = express();

  app.use((req, res, next) => {
    const end = httpRequestDuration.startTimer();

    res.on("finish", () => {
      const labels = {
        method: req.method,
        path: (req.route?.path as string | undefined) || req.path,
        status: res.statusCode.toString()
      };

      httpRequestsTotal.inc(labels);
      end(labels);
    });

    next();
  });

  app.use(requestLogger);
  app.use(
    cors({
      origin: config.corsOrigins.length > 0 ? config.corsOrigins : false,
      credentials: true
    })
  );
  app.use(helmet());
  app.use(express.json());
  app.use(cookieParser());

  app.get("/metrics", async (_req, res) => {
    res.set("Content-Type", metricsRegistry.contentType);
    res.end(await metricsRegistry.metrics());
  });

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));
  app.get("/api-docs.json", (_req, res) => res.json(openapiDocument));

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};


