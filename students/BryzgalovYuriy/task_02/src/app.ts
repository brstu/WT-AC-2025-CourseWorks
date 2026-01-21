import './types/express';
import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { requestLogger } from './common/middleware/requestLogger';
import { notFound } from './common/middleware/notFound';
import { errorHandler } from './common/middleware/errorHandler';

import { healthRouter } from './modules/health/health.routes';
import { authRouter } from './modules/auth/auth.routes';
import { servicesRouter } from './modules/services/services.routes';
import { mastersRouter } from './modules/masters/masters.routes';
import { slotsRouter } from './modules/slots/slots.routes';
import { bookingsRouter } from './modules/bookings/bookings.routes';
import { reviewsRouter } from './modules/reviews/reviews.routes';
import { paymentsRouter } from './modules/payments/payments.routes';

const app = express();

app.disable('x-powered-by');

app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

// Routes
app.use('/healthz', healthRouter);
app.use('/auth', authRouter);
app.use('/services', servicesRouter);
app.use('/masters', mastersRouter);
app.use('/slots', slotsRouter);
app.use('/bookings', bookingsRouter);
app.use('/reviews', reviewsRouter);
app.use('/payments', paymentsRouter);

// 404 + error
app.get('/favicon.ico', (_req, res) => res.status(204).end());
app.use(notFound);
app.use(errorHandler);

export default app;
