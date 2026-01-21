import { Router } from 'express';

export const paymentsRouter = Router();

paymentsRouter.post('/checkout', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
paymentsRouter.post('/:id/webhook', (_req, res) => res.status(501).json({ message: 'Not implemented' }));
