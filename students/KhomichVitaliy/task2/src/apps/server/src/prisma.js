import { PrismaClient } from '@prisma/client';
import { logger } from './middlewares/logger.js';

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
});

if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Params: ${e.params}`);
    logger.debug(`Duration: ${e.duration}ms`);
  });
  
  prisma.$on('error', (e) => {
    logger.error(`Prisma Error: ${e.message}`);
  });
}

export const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

export const disconnectDB = async () => {
  await prisma.$disconnect();
  logger.info('Database disconnected');
};

process.on('beforeExit', async () => {
  await disconnectDB();
});

export { prisma };