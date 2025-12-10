import mongoose from 'mongoose';
import { createClient } from 'redis';
import config from './env';
import logger from '../utils/logger';

// MongoDB Connection
export const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    logger.info('✅ MongoDB connected successfully');
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Redis Connection
export const redisClient = createClient({
  url: config.REDIS_URL,
  socket: {
    reconnectStrategy: false, // Disable auto-reconnect
  },
});

let redisErrorLogged = false;

redisClient.on('error', (err) => {
  if (!redisErrorLogged) {
    logger.error('❌ Redis Client Error:', { message: err.message });
    redisErrorLogged = true;
  }
});

redisClient.on('connect', () => {
  logger.info('✅ Redis connected successfully');
  redisErrorLogged = false;
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (error: any) {
    logger.warn('⚠️  Redis not available. Continuing without caching.');
    logger.info('💡 To enable caching, install Redis or use Redis Cloud (see START_SERVICES.md)');
  }
};
