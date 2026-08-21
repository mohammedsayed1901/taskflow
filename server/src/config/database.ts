import mongoose from 'mongoose';

import { env } from './env.js';

const SERVER_SELECTION_TIMEOUT_MS = 5_000;

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
  });
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
}
