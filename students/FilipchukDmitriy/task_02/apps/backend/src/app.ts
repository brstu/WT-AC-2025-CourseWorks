import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { router as healthRouter } from "./routes/health";
import { router as authRouter } from "./routes/auth";
import { router as usersRouter } from "./routes/users";
import { router as notebooksRouter } from "./routes/notebooks";
import { router as notesRouter } from "./routes/notes";
import { router as labelsRouter } from "./routes/labels";
import { router as sharesRouter } from "./routes/shares";
import { errorHandler } from "./middleware/errorHandler";
import { config } from "./config";

const app = express();

app.use(helmet());
app.use(
	cors({
		origin: config.corsOrigin,
		credentials: true
	})
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/notebooks", notebooksRouter);
app.use("/notes", notesRouter);
app.use("/labels", labelsRouter);
app.use("/shares", sharesRouter);

app.use(errorHandler);

export { app };
