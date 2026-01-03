import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { companiesRouter } from './routes/companies';
import { jobsRouter } from './routes/jobs';
import { stagesRouter } from './routes/stages';
import { notesRouter } from './routes/notes';
import { remindersRouter } from './routes/reminders';
import { kanbanRouter } from './routes/kanban';
import { errorHandler } from './middleware/error-handler';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/stages', stagesRouter);
app.use('/api/notes', notesRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/kanban', kanbanRouter);

app.use(errorHandler);

export { app };
