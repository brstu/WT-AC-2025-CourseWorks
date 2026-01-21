import { api } from './http';

export type Slot = {
  _id: string;
  masterId: string;
  startAt: string;
  endAt: string;
  status: 'available' | 'held' | 'booked';
  holdUntil?: string | null;
};

export type SlotsResponse = { items: Slot[] };

export function getSlots(masterId: string, from?: string, to?: string) {
  const params = new URLSearchParams({ masterId });
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  return api<SlotsResponse>(`/slots?${params.toString()}`);
}

export function holdSlot(slotId: string, minutes = 10) {
  return api<{ item: Slot }>(`/slots/${slotId}/hold`, { method: 'POST', body: { minutes }, auth: false });
}
