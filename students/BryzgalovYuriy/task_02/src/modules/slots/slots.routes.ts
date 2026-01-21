import { Router } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { generateSlots, holdSlot, listSlots } from './slots.controller';

export const slotsRouter = Router();

slotsRouter.get('/', asyncHandler(listSlots));
slotsRouter.post('/generate', asyncHandler(generateSlots));
slotsRouter.post('/:id/hold', asyncHandler(holdSlot));
