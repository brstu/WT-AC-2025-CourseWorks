import { Schema, model, type InferSchemaType } from 'mongoose';

const BookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    masterId: { type: Schema.Types.ObjectId, ref: 'Master', required: true, index: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true, index: true },
    slotId: { type: Schema.Types.ObjectId, ref: 'Slot', required: true, unique: true, index: true },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'canceled', 'rescheduled'],
      default: 'pending',
      index: true,
    },

    priceSnapshot: { type: Number, required: true, min: 0 },
    durationMinSnapshot: { type: Number, required: true, min: 5 },
  },
  { timestamps: true },
);

export type BookingDoc = InferSchemaType<typeof BookingSchema>;
export const BookingModel = model('Booking', BookingSchema);
