import { api } from './http';

export type Booking = {
  _id: string;
  userId: string;
  masterId: string;
  serviceId: string;
  slotId: string;
  status: 'confirmed' | 'rescheduled' | 'canceled';
};

export function createBooking(body: { slotId: string; serviceId: string }) {
  return api<{ item: Booking }>('/bookings', { method: 'POST', body, auth: true });
}

export function rescheduleBooking(bookingId: string, newSlotId: string) {
  return api<{ item: Booking }>(`/bookings/${bookingId}/reschedule`, { method: 'POST', body: { newSlotId }, auth: true });
}
