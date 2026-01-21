import { Router } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { requireAuth } from '../../common/middleware/auth';
import { cancelBooking, createBooking, rescheduleBooking } from './bookings.controller';

export const bookingsRouter = Router();

bookingsRouter.post('/', requireAuth, asyncHandler(createBooking));
bookingsRouter.post('/:id/cancel', requireAuth, asyncHandler(cancelBooking));
bookingsRouter.post('/:id/reschedule', requireAuth, asyncHandler(rescheduleBooking));
