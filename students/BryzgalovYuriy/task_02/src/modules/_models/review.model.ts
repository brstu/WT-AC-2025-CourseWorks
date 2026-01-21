import { Schema, model, type InferSchemaType } from 'mongoose';

const ReviewSchema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true, index: true },
    masterId: { type: Schema.Types.ObjectId, ref: 'Master', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, trim: true, default: '' },
  },
  { timestamps: true },
);

export type ReviewDoc = InferSchemaType<typeof ReviewSchema>;
export const ReviewModel = model('Review', ReviewSchema);
