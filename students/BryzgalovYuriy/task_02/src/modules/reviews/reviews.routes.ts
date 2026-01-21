import { Router } from 'express';

export const reviewsRouter = Router();

reviewsRouter.get('/', (_req, res) => res.json({ items: [] }));
reviewsRouter.post('/', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
