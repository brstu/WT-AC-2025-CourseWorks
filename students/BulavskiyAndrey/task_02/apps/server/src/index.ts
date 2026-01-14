import { buildApp } from "./app.js";
import { config } from "./lib/config.js";
import { logger } from "./lib/logger.js";

const app = buildApp();

app.listen(config.port, config.host, () => {
  logger.info(`API server running at http://${config.host}:${config.port}`);
});


