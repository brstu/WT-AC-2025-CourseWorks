import type { Request, Response } from 'express';
import { ServiceModel } from '../_models/service.model';
import { HttpError } from '../../common/utils/httpError';
import { isValidObjectId } from '../../common/utils/validateObjectId';

function parseBool(v: unknown): boolean | undefined {
  if (typeof v !== 'string') return undefined;
  if (v === 'true') return true;
  if (v === 'false') return false;
  return undefined;
}

export async function listServices(req: Request, res: Response) {
  const includeInactive = parseBool(req.query.includeInactive);

  const filter: Record<string, unknown> = {};
  if (!includeInactive) filter.isActive = true;

  const items = await ServiceModel.find(filter).sort({ name: 1 }).lean();
  res.json({ items });
}

export async function createService(req: Request, res: Response) {
  const { name, price, durationMin, description, isActive } = req.body ?? {};

  if (typeof name !== 'string' || !name.trim()) throw new HttpError(400, 'name is required');
  if (typeof price !== 'number' || !Number.isFinite(price) || price < 0)
    throw new HttpError(400, 'price must be a non-negative number');
  if (typeof durationMin !== 'number' || !Number.isFinite(durationMin) || durationMin < 5)
    throw new HttpError(400, 'durationMin must be >= 5');

  const doc = await ServiceModel.create({
    name: name.trim(),
    price,
    durationMin,
    description: typeof description === 'string' ? description.trim() : '',
    isActive: typeof isActive === 'boolean' ? isActive : true,
  });

  res.status(201).json({ item: doc.toObject() });
}

export async function patchService(req: Request, res: Response) {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new HttpError(400, 'invalid id');

  const patch: Record<string, unknown> = {};

  if ('name' in (req.body ?? {})) {
    if (typeof req.body.name !== 'string' || !req.body.name.trim())
      throw new HttpError(400, 'name must be a non-empty string');
    patch.name = req.body.name.trim();
  }

  if ('price' in (req.body ?? {})) {
    if (typeof req.body.price !== 'number' || !Number.isFinite(req.body.price) || req.body.price < 0)
      throw new HttpError(400, 'price must be a non-negative number');
    patch.price = req.body.price;
  }

  if ('durationMin' in (req.body ?? {})) {
    if (
      typeof req.body.durationMin !== 'number' ||
      !Number.isFinite(req.body.durationMin) ||
      req.body.durationMin < 5
    )
      throw new HttpError(400, 'durationMin must be >= 5');
    patch.durationMin = req.body.durationMin;
  }

  if ('description' in (req.body ?? {})) {
    if (typeof req.body.description !== 'string') throw new HttpError(400, 'description must be a string');
    patch.description = req.body.description.trim();
  }

  if ('isActive' in (req.body ?? {})) {
    if (typeof req.body.isActive !== 'boolean') throw new HttpError(400, 'isActive must be boolean');
    patch.isActive = req.body.isActive;
  }

  const updated = await ServiceModel.findByIdAndUpdate(id, patch, { new: true }).lean();
  if (!updated) throw new HttpError(404, 'service not found');

  res.json({ item: updated });
}
