import { Schema, model, type InferSchemaType, Types } from 'mongoose';

const MasterSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    bio: { type: String, trim: true, default: '' },
    services: [{ type: Schema.Types.ObjectId, ref: 'Service', required: true }],
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

// полезно для TS подсказок
export type MasterDoc = InferSchemaType<typeof MasterSchema> & { services: Types.ObjectId[] };
export const MasterModel = model('Master', MasterSchema);
