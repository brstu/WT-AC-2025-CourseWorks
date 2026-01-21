import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { BookingModel } from '../_models/booking.model';
import { SlotModel } from '../_models/slot.model';
import { ServiceModel } from '../_models/service.model';
import { MasterModel } from '../_models/master.model';
import { HttpError } from '../../common/utils/httpError';
import { isValidObjectId } from '../../common/utils/validateObjectId';
 

type AuthedRequest = Request & { user?: { id: string; role: 'user' | 'admin' } };

export async function createBooking(req: Request, res: Response) {
  const userId = (req as AuthedRequest).user?.id;
  if (!userId) throw new HttpError(401, 'unauthorized');


  const { slotId, serviceId } = req.body ?? {};
  if (typeof slotId !== 'string' || !isValidObjectId(slotId)) throw new HttpError(400, 'slotId is required');
  if (typeof serviceId !== 'string' || !isValidObjectId(serviceId)) throw new HttpError(400, 'serviceId is required');

  const now = new Date();

  // 1) проверяем слот и мастера
  const slot = await SlotModel.findById(slotId).lean();
  if (!slot) throw new HttpError(404, 'slot not found');
  if (slot.status !== 'held') throw new HttpError(409, 'slot must be held before booking');
  if (slot.holdUntil && slot.holdUntil <= now) throw new HttpError(409, 'slot hold expired');

  const master = await MasterModel.findById(slot.masterId).lean();
  if (!master) throw new HttpError(404, 'master not found');

  const canDoService = (master.services as any[]).some((s) => String(s) === String(serviceId));
  if (!canDoService) throw new HttpError(400, 'master does not provide this service');

  const service = await ServiceModel.findById(serviceId).lean();
  if (!service || service.isActive === false) throw new HttpError(404, 'service not found');

  // 2) атомарно переводим слот held->booked (если не истёк)
  const bookedSlot = await SlotModel.findOneAndUpdate(
    {
      _id: slotId,
      status: 'held',
      $or: [{ holdUntil: null }, { holdUntil: { $gt: now } }],
    },
    { $set: { status: 'booked', holdUntil: null } },
    { new: true },
  ).lean();

  if (!bookedSlot) throw new HttpError(409, 'slot is not available');

  // 3) создаём booking (если вдруг гонка — уникальный индекс slotId даст дубль-ошибку)
  try {
    const booking = await BookingModel.create({
      userId,
      masterId: slot.masterId,
      serviceId,
      slotId,
      status: 'confirmed',
      priceSnapshot: service.price,
      durationMinSnapshot: service.durationMin,
    });

    res.status(201).json({ item: booking.toObject() });
  } catch (e: any) {
    // если booking не создался (например duplicate slotId) — откатываем слот обратно
    await SlotModel.updateOne(
      { _id: slotId, status: 'booked' },
      { $set: { status: 'available', holdUntil: null } },
    );

    // Mongo duplicate key
    if (e?.code === 11000) throw new HttpError(409, 'slot already booked');
    throw e;
  }
}

export async function cancelBooking(req: Request, res: Response) {
  const userId = (req as AuthedRequest).user?.id;

  if (!userId) throw new HttpError(401, 'unauthorized');

  const { id } = req.params;
  if (!isValidObjectId(id)) throw new HttpError(400, 'invalid booking id');

  const booking = await BookingModel.findById(id).lean();
  if (!booking) throw new HttpError(404, 'booking not found');

  if (String(booking.userId) !== String(userId)) throw new HttpError(403, 'forbidden');
  if (booking.status === 'canceled') throw new HttpError(409, 'booking already canceled');

  await BookingModel.updateOne({ _id: id }, { $set: { status: 'canceled' } });

  await SlotModel.updateOne(
    { _id: booking.slotId },
    { $set: { status: 'available', holdUntil: null } },
  );

  res.json({ ok: true });
}

export async function rescheduleBooking(req: Request, res: Response) {
  const userId = (req as AuthedRequest).user?.id;
  if (!userId) throw new HttpError(401, 'unauthorized');


  const { id } = req.params;
  const { newSlotId } = req.body ?? {};

  if (!isValidObjectId(id)) throw new HttpError(400, 'invalid booking id');
  if (typeof newSlotId !== 'string' || !isValidObjectId(newSlotId)) throw new HttpError(400, 'newSlotId is required');

  const now = new Date();

  const booking = await BookingModel.findById(id).lean();
  if (!booking) throw new HttpError(404, 'booking not found');

  if (String(booking.userId) !== String(userId)) throw new HttpError(403, 'forbidden');
  if (booking.status === 'canceled') throw new HttpError(409, 'cannot reschedule canceled booking');

  const newSlot = await SlotModel.findById(newSlotId).lean();
  if (!newSlot) throw new HttpError(404, 'new slot not found');

  if (newSlot.status !== 'held') throw new HttpError(409, 'new slot must be held');
  if (newSlot.holdUntil && newSlot.holdUntil <= now) throw new HttpError(409, 'new slot hold expired');

  if (String(newSlot.masterId) !== String(booking.masterId))
    throw new HttpError(400, 'new slot must belong to same master');

  // 1) атомарно переводим новый слот held->booked
  const bookedNew = await SlotModel.findOneAndUpdate(
    {
      _id: newSlotId,
      status: 'held',
      $or: [{ holdUntil: null }, { holdUntil: { $gt: now } }],
    },
    { $set: { status: 'booked', holdUntil: null } },
    { new: true },
  ).lean();

  if (!bookedNew) throw new HttpError(409, 'new slot is not available');

  // 2) обновляем booking
  const updated = await BookingModel.findByIdAndUpdate(
    id,
    { $set: { slotId: newSlotId, status: 'rescheduled' } },
    { new: true },
  ).lean();

  // 3) освобождаем старый слот
  await SlotModel.updateOne(
    { _id: booking.slotId },
    { $set: { status: 'available', holdUntil: null } },
  );

  res.json({ item: updated });
}
