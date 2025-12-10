import { redisClient } from '../config/database';
import logger from '../utils/logger';

export class CacheService {
  private isConnected: boolean = false;

  constructor() {
    redisClient.on('ready', () => {
      this.isConnected = true;
    });
    redisClient.on('error', () => {
      this.isConnected = false;
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;
    
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache get error:', { key, error });
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error('Cache set error:', { key, error });
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error('Cache del error:', { key, error });
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      logger.error('Cache delPattern error:', { pattern, error });
    }
  }
}

export const cacheService = new CacheService();
