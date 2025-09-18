import Redis from 'ioredis';
import { logger } from '../utils/logger';

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  connectTimeout: 10000,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxLoadingTimeout: 5000,
};

// Create Redis client
export const redis = new Redis(redisConfig);

// Redis event listeners
redis.on('connect', () => {
  logger.info('🔴 Redis connected');
});

redis.on('ready', () => {
  logger.info('🔴 Redis ready');
});

redis.on('error', (error) => {
  logger.error('Redis error:', error);
});

redis.on('close', () => {
  logger.info('🔴 Redis connection closed');
});

redis.on('reconnecting', () => {
  logger.info('🔴 Redis reconnecting...');
});

// Redis utility functions
export class RedisService {
  // Cache with expiration
  static async set(key: string, value: any, expireInSeconds?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (expireInSeconds) {
        await redis.setex(key, expireInSeconds, serializedValue);
      } else {
        await redis.set(key, serializedValue);
      }
    } catch (error) {
      logger.error('Redis set error:', error);
      throw error;
    }
  }

  // Get cached value
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      if (value) {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  }

  // Delete key
  static async del(key: string): Promise<boolean> {
    try {
      const result = await redis.del(key);
      return result > 0;
    } catch (error) {
      logger.error('Redis delete error:', error);
      return false;
    }
  }

  // Check if key exists
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result > 0;
    } catch (error) {
      logger.error('Redis exists error:', error);
      return false;
    }
  }

  // Increment counter
  static async incr(key: string, expireInSeconds?: number): Promise<number> {
    try {
      const result = await redis.incr(key);
      if (expireInSeconds && result === 1) {
        await redis.expire(key, expireInSeconds);
      }
      return result;
    } catch (error) {
      logger.error('Redis incr error:', error);
      throw error;
    }
  }

  // Rate limiting
  static async isRateLimited(key: string, limit: number, windowInSeconds: number): Promise<boolean> {
    try {
      const count = await this.incr(key, windowInSeconds);
      return count > limit;
    } catch (error) {
      logger.error('Rate limit check error:', error);
      return false;
    }
  }

  // Health check
  static async isHealthy(): Promise<boolean> {
    try {
      const response = await redis.ping();
      return response === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }
}

export default redis;
