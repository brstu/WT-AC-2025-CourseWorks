import { Router } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { createService, listServices, patchService } from './services.controller';

export const servicesRouter = Router();

servicesRouter.get('/', asyncHandler(listServices));
servicesRouter.post('/', asyncHandler(createService));
servicesRouter.patch('/:id', asyncHandler(patchService));
