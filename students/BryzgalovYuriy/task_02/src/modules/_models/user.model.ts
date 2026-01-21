import { Schema, model, type InferSchemaType } from 'mongoose';

const UserSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, trim: true, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof UserSchema>;
export const UserModel = model('User', UserSchema);
