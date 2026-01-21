import { Router } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { createMaster, getMaster, listMasters, patchMaster } from './masters.controller';

export const mastersRouter = Router();

mastersRouter.get('/', asyncHandler(listMasters));
mastersRouter.get('/:id', asyncHandler(getMaster));
mastersRouter.post('/', asyncHandler(createMaster));
mastersRouter.patch('/:id', asyncHandler(patchMaster));
