import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./lib/env";
import { authRouter } from "./routes/auth";
import { usersRouter } from "./routes/users";
import { roomsRouter } from "./routes/rooms";
import { bookingsRouter } from "./routes/bookings";
import { scheduleRouter } from "./routes/schedule";
import { statisticsRouter } from "./routes/statistics";
import { errorHandler } from "./middleware/error-handler";

export function createApp() {
  const app = express();

  const origins = env.CORS_ORIGIN.split(",").map((o) => o.trim());

  app.use(helmet());
  app.use(
    cors({
      origin: origins.length === 1 ? origins[0] : origins,
      credentials: true
    })
  );
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/auth", authRouter);
  app.use("/users", usersRouter);
  app.use("/rooms", roomsRouter);
  app.use("/bookings", bookingsRouter);
  app.use("/schedule", scheduleRouter);
  app.use("/statistics", statisticsRouter);

  app.use(errorHandler);

  return app;
}
