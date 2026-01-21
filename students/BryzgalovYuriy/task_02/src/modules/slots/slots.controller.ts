import type { Request, Response } from 'express';
import { SlotModel } from '../_models/slot.model';
import { MasterModel } from '../_models/master.model';
import { HttpError } from '../../common/utils/httpError';
import { isValidObjectId } from '../../common/utils/validateObjectId';

function parseIsoDate(v: unknown, field: string): Date {
  if (typeof v !== 'string' || !v.trim()) throw new HttpError(400, `${field} is required (ISO string)`);
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) throw new HttpError(400, `${field} must be a valid ISO date string`);
  return d;
}

function parseIntPositive(v: unknown, fallback: number, field: string): number {
  if (v === undefined) return fallback;
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new HttpError(400, `${field} must be a number`);
  const n = Math.trunc(v);
  if (n <= 0) throw new HttpError(400, `${field} must be > 0`);
  return n;
}

function parseIntNonNegative(v: unknown, fallback: number, field: string): number {
  if (v === undefined) return fallback;
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new HttpError(400, `${field} must be a number`);
  const n = Math.trunc(v);
  if (n < 0) throw new HttpError(400, `${field} must be >= 0`);
  return n;
}


function floorToDayUTC(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function addMinutes(d: Date, minutes: number): Date {
  return new Date(d.getTime() + minutes * 60_000);
}

export async function listSlots(req: Request, res: Response) {
  const { masterId, from, to } = req.query;

  if (typeof masterId !== 'string' || !isValidObjectId(masterId))
    throw new HttpError(400, 'masterId is required and must be a valid id');

  const filter: Record<string, unknown> = { masterId };

  if (typeof from === 'string' && from.trim()) {
    const d = new Date(from);
    if (Number.isNaN(d.getTime())) throw new HttpError(400, 'from must be a valid ISO date string');
    filter.startAt = { ...(filter.startAt as object), $gte: d };
  }

  if (typeof to === 'string' && to.trim()) {
    const d = new Date(to);
    if (Number.isNaN(d.getTime())) throw new HttpError(400, 'to must be a valid ISO date string');
    filter.startAt = { ...(filter.startAt as object), $lt: d };
  }

  const items = await SlotModel.find(filter).sort({ startAt: 1 }).lean();
  res.json({ items });
}

export async function generateSlots(req: Request, res: Response) {
  const { masterId, from, to, dayStartHour, dayEndHour, slotMinutes, breakMinutes } = req.body ?? {};

  if (typeof masterId !== 'string' || !isValidObjectId(masterId))
    throw new HttpError(400, 'masterId is required and must be a valid id');

  const masterExists = await MasterModel.exists({ _id: masterId });
  if (!masterExists) throw new HttpError(404, 'master not found');

  const fromDate = parseIsoDate(from, 'from');
  const toDate = parseIsoDate(to, 'to');

  if (toDate <= fromDate) throw new HttpError(400, 'to must be greater than from');

  const startHour = parseIntPositive(dayStartHour, 10, 'dayStartHour');
  const endHour = parseIntPositive(dayEndHour, 19, 'dayEndHour'); // 19:00
  if (startHour < 0 || startHour > 23) throw new HttpError(400, 'dayStartHour must be 0..23');
  if (endHour < 1 || endHour > 24) throw new HttpError(400, 'dayEndHour must be 1..24');
  if (endHour <= startHour) throw new HttpError(400, 'dayEndHour must be greater than dayStartHour');

  const slotM = parseIntPositive(slotMinutes, 30, 'slotMinutes');
  const breakM = parseIntNonNegative(breakMinutes, 0, 'breakMinutes');

  // генерим по дням (UTC, чтобы не ловить локальные DST приколы)
  let day = floorToDayUTC(fromDate);
  const endDay = floorToDayUTC(toDate);

  const ops: any[] = [];

  while (day <= endDay) {
    const dayStart = new Date(day);
    dayStart.setUTCHours(startHour, 0, 0, 0);

    const dayEnd = new Date(day);
    // если endHour=24 — это следующий день 00:00
    if (endHour === 24) {
      dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
      dayEnd.setUTCHours(0, 0, 0, 0);
    } else {
      dayEnd.setUTCHours(endHour, 0, 0, 0);
    }

    // не лезем раньше fromDate и позже toDate
    let cursor = dayStart < fromDate ? new Date(fromDate) : dayStart;

    // округлим cursor вверх до ближайшей сетки slotMinutes от dayStart
    const deltaMin = Math.ceil((cursor.getTime() - dayStart.getTime()) / 60_000);
    const step = slotM + breakM;
    const offset = deltaMin % step === 0 ? 0 : step - (deltaMin % step);
    cursor = addMinutes(cursor, offset);

    while (addMinutes(cursor, slotM) <= dayEnd && cursor < toDate) {
      const startAt = cursor;
      const endAt = addMinutes(cursor, slotM);

      if (endAt <= fromDate || startAt >= toDate) break;

      ops.push({
        updateOne: {
          filter: { masterId, startAt },
          update: {
            $setOnInsert: {
              masterId,
              startAt,
              endAt,
              status: 'available',
              holdUntil: null,
            },
          },
          upsert: true,
        },
      });

      cursor = addMinutes(cursor, step);
    }

    day = addMinutes(day, 24 * 60);
  }

  if (ops.length === 0) {
    return res.json({ createdOrExisting: 0, message: 'No slots generated for given window' });
  }

  const result = await SlotModel.bulkWrite(ops, { ordered: false });

  // upsertedCount = сколько реально создали, matchedCount = сколько уже было
  res.json({
    upserted: result.upsertedCount ?? 0,
    matchedExisting: result.matchedCount ?? 0,
    totalOps: ops.length,
  });
  
}
const HOLD_MINUTES_DEFAULT = 10;

export async function holdSlot(req: Request, res: Response) {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new HttpError(400, 'invalid slot id');

  const minutesRaw = req.body?.minutes;
  const minutes =
    minutesRaw === undefined
      ? HOLD_MINUTES_DEFAULT
      : (() => {
          if (typeof minutesRaw !== 'number' || !Number.isFinite(minutesRaw)) {
            throw new HttpError(400, 'minutes must be a number');
          }
          const m = Math.trunc(minutesRaw);
          if (m <= 0 || m > 60) throw new HttpError(400, 'minutes must be in range 1..60');
          return m;
        })();

  const now = new Date();
  const holdUntil = new Date(now.getTime() + minutes * 60_000);

  // Удерживаем только если:
  // - слот available
  // - или held, но holdUntil уже истёк
  const updated = await SlotModel.findOneAndUpdate(
    {
      _id: id,
      $or: [
        { status: 'available' },
        { status: 'held', holdUntil: { $lte: now } },
        { status: 'held', holdUntil: null }
      ]
    },
    { $set: { status: 'held', holdUntil } },
    { new: true }
  ).lean();

  if (!updated) throw new HttpError(409, 'slot is not available');

  res.json({ item: updated });
}

