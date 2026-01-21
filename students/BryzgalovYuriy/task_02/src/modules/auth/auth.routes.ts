import { Router } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { login, register } from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(register));
authRouter.post('/login', asyncHandler(login));
