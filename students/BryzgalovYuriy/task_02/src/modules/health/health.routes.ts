import { Router } from 'express';
import { healthz } from './health.controller';

export const healthRouter = Router();

healthRouter.get('/', healthz);
