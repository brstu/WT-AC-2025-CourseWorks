import mongoose from 'mongoose';
import { env } from './env';

export async function connectDb(): Promise<void> {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
  });

  // eslint-disable-next-line no-console
  console.log('[db] connected');
}

export async function disconnectDb(): Promise<void> {
  try {
    await mongoose.disconnect();
    // eslint-disable-next-line no-console
    console.log('[db] disconnected');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[db] disconnect error:', err);
  }
}
