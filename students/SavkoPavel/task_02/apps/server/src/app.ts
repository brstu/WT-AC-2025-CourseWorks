import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { authRouter } from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import queuesRoutes from "./modules/queues/queues.routes";
import slaRoutes from "./modules/sla/sla.routes";
import incidentsRoutes from "./modules/incidents/incidents.routes";
import { openApiSpec } from "./openapi";

export const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use("/auth", authRouter);
app.use("/users", usersRoutes);
app.use("/queues", queuesRoutes);
app.use("/sla", slaRoutes);
app.use("/incidents", incidentsRoutes);

// OpenAPI / Swagger (bonus)
app.get("/openapi.json", (_req, res) => {
  res.json(openApiSpec);
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
