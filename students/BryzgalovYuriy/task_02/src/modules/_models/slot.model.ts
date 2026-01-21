import { Schema, model, type InferSchemaType } from 'mongoose';

const SlotSchema = new Schema(
  {
    masterId: { type: Schema.Types.ObjectId, ref: 'Master', required: true, index: true },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['available', 'held', 'booked'],
      required: true,
      default: 'available',
      index: true,
    },
    holdUntil: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

// чтобы не было дублей слотов
SlotSchema.index({ masterId: 1, startAt: 1 }, { unique: true });

export type SlotDoc = InferSchemaType<typeof SlotSchema>;
export const SlotModel = model('Slot', SlotSchema);
