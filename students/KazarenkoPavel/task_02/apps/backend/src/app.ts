import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import healthRouter from "./routes/health";
import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import tasksRouter from "./routes/tasks";
import tagsRouter from "./routes/tags";
import sessionsRouter from "./routes/sessions";
import reportsRouter from "./routes/reports";
import settingsRouter from "./routes/settings";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true
  })
);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/tasks", tasksRouter);
app.use("/tags", tagsRouter);
app.use("/sessions", sessionsRouter);
app.use("/reports", reportsRouter);
app.use("/settings", settingsRouter);
app.use("/health", healthRouter);

app.use((_, res) => {
  res.status(404).json({ status: "error", error: { code: "not_found", message: "Route not found" } });
});

app.use(errorHandler);

export default app;
