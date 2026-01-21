import type { Request, Response } from 'express';
import { MasterModel } from '../_models/master.model';
import { ServiceModel } from '../_models/service.model';
import { HttpError } from '../../common/utils/httpError';
import { isValidObjectId } from '../../common/utils/validateObjectId';

function parseBool(v: unknown): boolean | undefined {
  if (typeof v !== 'string') return undefined;
  if (v === 'true') return true;
  if (v === 'false') return false;
  return undefined;
}

function normalizeServices(input: unknown): string[] {
  if (!Array.isArray(input)) throw new HttpError(400, 'services must be an array of ids');
  const ids: string[] = [];
  for (const v of input) {
    if (typeof v !== 'string' || !isValidObjectId(v)) throw new HttpError(400, 'services contains invalid id');
    ids.push(v);
  }
  if (ids.length === 0) throw new HttpError(400, 'services must not be empty');
  return ids;
}

export async function listMasters(req: Request, res: Response) {
  const includeInactive = parseBool(req.query.includeInactive);

  const filter: Record<string, unknown> = {};
  if (!includeInactive) filter.isActive = true;

  const items = await MasterModel.find(filter)
    .populate('services')
    .sort({ name: 1 })
    .lean();

  res.json({ items });
}

export async function getMaster(req: Request, res: Response) {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new HttpError(400, 'invalid id');

  const item = await MasterModel.findById(id).populate('services').lean();
  if (!item) throw new HttpError(404, 'master not found');

  res.json({ item });
}

export async function createMaster(req: Request, res: Response) {
  const { name, bio, services, isActive } = req.body ?? {};

  if (typeof name !== 'string' || !name.trim()) throw new HttpError(400, 'name is required');

  const serviceIds = normalizeServices(services);

  const count = await ServiceModel.countDocuments({ _id: { $in: serviceIds } });
  if (count !== serviceIds.length) throw new HttpError(400, 'some services not found');

  const doc = await MasterModel.create({
    name: name.trim(),
    bio: typeof bio === 'string' ? bio.trim() : '',
    services: serviceIds,
    isActive: typeof isActive === 'boolean' ? isActive : true,
  });

  const item = await MasterModel.findById(doc._id).populate('services').lean();
  res.status(201).json({ item });
}

export async function patchMaster(req: Request, res: Response) {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new HttpError(400, 'invalid id');

  const patch: Record<string, unknown> = {};

  if ('name' in (req.body ?? {})) {
    if (typeof req.body.name !== 'string' || !req.body.name.trim())
      throw new HttpError(400, 'name must be a non-empty string');
    patch.name = req.body.name.trim();
  }

  if ('bio' in (req.body ?? {})) {
    if (typeof req.body.bio !== 'string') throw new HttpError(400, 'bio must be a string');
    patch.bio = req.body.bio.trim();
  }

  if ('services' in (req.body ?? {})) {
    const serviceIds = normalizeServices(req.body.services);
    const count = await ServiceModel.countDocuments({ _id: { $in: serviceIds } });
    if (count !== serviceIds.length) throw new HttpError(400, 'some services not found');
    patch.services = serviceIds;
  }

  if ('isActive' in (req.body ?? {})) {
    if (typeof req.body.isActive !== 'boolean') throw new HttpError(400, 'isActive must be boolean');
    patch.isActive = req.body.isActive;
  }

  const updated = await MasterModel.findByIdAndUpdate(id, patch, { new: true }).populate('services').lean();
  if (!updated) throw new HttpError(404, 'master not found');

  res.json({ item: updated });
}
