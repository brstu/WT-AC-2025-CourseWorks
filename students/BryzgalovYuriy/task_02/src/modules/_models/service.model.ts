import { Schema, model, type InferSchemaType } from 'mongoose';

const ServiceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    price: { type: Number, required: true, min: 0 },
    durationMin: { type: Number, required: true, min: 5 },
    description: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export type ServiceDoc = InferSchemaType<typeof ServiceSchema>;
export const ServiceModel = model('Service', ServiceSchema);
