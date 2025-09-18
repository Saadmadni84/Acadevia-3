import { Request, Response, NextFunction } from 'express';
import { createClient, RedisClientType } from 'redis';

// Rate limiter configuration interface
export interface RateLimiterConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  statusCode?: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  enableHeaders?: boolean;
  store?: 'memory' | 'redis';
  redisClient?: RedisClientType;
  onLimitReached?: (req: Request, res: Response) => void;
  skip?: (req: Request, res: Response) => boolean;
}

// Rate limiter response interface
interface RateLimiterResponse {
  success: boolean;
  totalHits: number;
  remainingRequests: number;
  resetTime: Date;
  retryAfter?: number;
}

// In-memory store interface
interface MemoryStoreRecord {
  totalHits: number;
  resetTime: number;
}

// Rate limiter class
export class RateLimiter {
  private config: Required<RateLimiterConfig>;
  private memoryStore: Map<string, MemoryStoreRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: RateLimiterConfig) {
    this.config = {
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      message: config.message || 'Too many requests, please try again later',
      statusCode: config.statusCode || 429,
      keyGenerator: config.keyGenerator || this.defaultKeyGenerator,
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
      enableHeaders: config.enableHeaders !== false,
      store: config.store || 'memory',
      redisClient: config.redisClient,
      onLimitReached: config.onLimitReached || (() => {}),
      skip: config.skip || (() => false)
    };

    // Start cleanup interval for memory store
    if (this.config.store === 'memory') {
      this.startCleanupInterval();
    }
  }

  private defaultKeyGenerator = (req: Request): string => {
    const userId = (req as any).user?.id;
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return userId ? `user:${userId}` : `ip:${ip}`;
  };

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.memoryStore.entries()) {
        if (record.resetTime <= now) {
          this.memoryStore.delete(key);
        }
      }
    }, this.config.windowMs);
  }

  private async incrementMemoryStore(key: string): Promise<RateLimiterResponse> {
    const now = Date.now();
    const resetTime = now + this.config.windowMs;
    
    const existing = this.memoryStore.get(key);
    
    if (!existing || existing.resetTime <= now) {
      // New window or expired window
      const record: MemoryStoreRecord = {
        totalHits: 1,
        resetTime
      };
      this.memoryStore.set(key, record);
      
      return {
        success: true,
        totalHits: 1,
        remainingRequests: this.config.maxRequests - 1,
        resetTime: new Date(resetTime)
      };
    }
    
    // Existing valid window
    existing.totalHits++;
    const remainingRequests = Math.max(0, this.config.maxRequests - existing.totalHits);
    const success = existing.totalHits <= this.config.maxRequests;
    
    return {
      success,
      totalHits: existing.totalHits,
      remainingRequests,
      resetTime: new Date(existing.resetTime),
      retryAfter: success ? undefined : Math.ceil((existing.resetTime - now) / 1000)
    };
  }

  private async incrementRedisStore(key: string): Promise<RateLimiterResponse> {
    if (!this.config.redisClient) {
      throw new Error('Redis client not provided for Redis store');
    }

    const now = Date.now();
    const windowStart = Math.floor(now / this.config.windowMs) * this.config.windowMs;
    const redisKey = `rate_limit:${key}:${windowStart}`;
    
    try {
      const pipeline = this.config.redisClient.multi();
      pipeline.incr(redisKey);
      pipeline.expire(redisKey, Math.ceil(this.config.windowMs / 1000));
      
      const results = await pipeline.exec();
      const totalHits = results?.[0] as number || 1;
      
      const remainingRequests = Math.max(0, this.config.maxRequests - totalHits);
      const success = totalHits <= this.config.maxRequests;
      const resetTime = new Date(windowStart + this.config.windowMs);
      
      return {
        success,
        totalHits,
        remainingRequests,
        resetTime,
        retryAfter: success ? undefined : Math.ceil((resetTime.getTime() - now) / 1000)
      };
    } catch (error) {
      console.error('Redis rate limiter error:', error);
      // Fallback to allowing the request if Redis fails
      return {
        success: true,
        totalHits: 1,
        remainingRequests: this.config.maxRequests - 1,
        resetTime: new Date(now + this.config.windowMs)
      };
    }
  }

  private async increment(key: string): Promise<RateLimiterResponse> {
    if (this.config.store === 'redis') {
      return this.incrementRedisStore(key);
    }
    return this.incrementMemoryStore(key);
  }

  private setHeaders(res: Response, result: RateLimiterResponse): void {
    if (!this.config.enableHeaders) return;

    // Standard headers
    res.set('X-RateLimit-Limit', this.config.maxRequests.toString());
    res.set('X-RateLimit-Remaining', result.remainingRequests.toString());
    res.set('X-RateLimit-Reset', Math.ceil(result.resetTime.getTime() / 1000).toString());
    
    if (result.retryAfter) {
      res.set('Retry-After', result.retryAfter.toString());
    }
  }

  public middleware() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        // Skip if configured to skip
        if (this.config.skip(req, res)) {
          return next();
        }

        const key = this.config.keyGenerator(req);
        const result = await this.increment(key);

        // Set headers
        this.setHeaders(res, result);

        if (!result.success) {
          // Rate limit exceeded
          this.config.onLimitReached(req, res);
          
          res.status(this.config.statusCode).json({
            success: false,
            error: {
              message: this.config.message,
              code: 'RATE_LIMIT_EXCEEDED',
              statusCode: this.config.statusCode,
              details: {
                limit: this.config.maxRequests,
                windowMs: this.config.windowMs,
                totalHits: result.totalHits,
                remainingRequests: result.remainingRequests,
                resetTime: result.resetTime,
                retryAfter: result.retryAfter
              },
              timestamp: new Date().toISOString(),
              path: req.path
            }
          });
          return;
        }

        // Continue to next middleware
        next();
      } catch (error) {
        console.error('Rate limiter middleware error:', error);
        // In case of error, allow the request to continue
        next();
      }
    };
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Predefined rate limiter configurations for different endpoints
export const RateLimitConfigs = {
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later'
  },

  // Password reset
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 attempts per hour
    message: 'Too many password reset attempts, please try again later'
  },

  // API endpoints - authenticated users
  apiAuthenticated: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute for authenticated users
    message: 'API rate limit exceeded for authenticated user'
  },

  // API endpoints - unauthenticated users
  apiUnauthenticated: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 requests per minute for unauthenticated users
    message: 'API rate limit exceeded, please login for higher limits'
  },

  // File uploads
  fileUpload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 uploads per minute
    message: 'File upload rate limit exceeded'
  },

  // Quiz submissions
  quizSubmission: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10, // 10 quiz submissions per 5 minutes
    message: 'Quiz submission rate limit exceeded'
  },

  // Achievement claims
  achievementClaim: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 achievement claims per minute
    message: 'Achievement claim rate limit exceeded'
  },

  // Leaderboard updates
  leaderboardUpdate: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 leaderboard updates per minute
    message: 'Leaderboard update rate limit exceeded'
  },

  // Course enrollment
  courseEnrollment: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 enrollments per hour
    message: 'Course enrollment rate limit exceeded'
  },

  // Chat/messaging
  messaging: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 messages per minute
    message: 'Messaging rate limit exceeded'
  }
};

// Factory functions for creating rate limiters
export const createRateLimiter = (config: RateLimiterConfig): RateLimiter => {
  return new RateLimiter(config);
};

export const createAuthRateLimiter = (redisClient?: RedisClientType): RateLimiter => {
  return new RateLimiter({
    ...RateLimitConfigs.auth,
    store: redisClient ? 'redis' : 'memory',
    redisClient,
    keyGenerator: (req: Request) => {
      const email = req.body?.email || req.body?.username;
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      return email ? `auth:${email}` : `auth_ip:${ip}`;
    }
  });
};

export const createAPIRateLimiter = (redisClient?: RedisClientType): RateLimiter => {
  return new RateLimiter({
    ...RateLimitConfigs.apiAuthenticated,
    store: redisClient ? 'redis' : 'memory',
    redisClient,
    keyGenerator: (req: Request) => {
      const userId = (req as any).user?.id;
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      
      if (userId) {
        return `api_user:${userId}`;
      }
      return `api_ip:${ip}`;
    },
    maxRequests: (req: Request) => {
      const isAuthenticated = !!(req as any).user?.id;
      return isAuthenticated ? 100 : 20; // Higher limit for authenticated users
    }
  } as any);
};

export const createQuizRateLimiter = (redisClient?: RedisClientType): RateLimiter => {
  return new RateLimiter({
    ...RateLimitConfigs.quizSubmission,
    store: redisClient ? 'redis' : 'memory',
    redisClient,
    keyGenerator: (req: Request) => {
      const userId = (req as any).user?.id;
      const quizId = req.params?.quizId || req.body?.quizId;
      return `quiz:${userId}:${quizId}`;
    }
  });
};

export const createFileUploadRateLimiter = (redisClient?: RedisClientType): RateLimiter => {
  return new RateLimiter({
    ...RateLimitConfigs.fileUpload,
    store: redisClient ? 'redis' : 'memory',
    redisClient,
    keyGenerator: (req: Request) => {
      const userId = (req as any).user?.id;
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      return userId ? `upload_user:${userId}` : `upload_ip:${ip}`;
    }
  });
};

// Middleware wrapper for easy integration
export const rateLimiterMiddleware = (config: RateLimiterConfig) => {
  const limiter = new RateLimiter(config);
  return limiter.middleware();
};

// Global rate limiter instance (singleton pattern)
let globalRateLimiter: RateLimiter | null = null;

export const initializeGlobalRateLimiter = (config: RateLimiterConfig): void => {
  if (globalRateLimiter) {
    globalRateLimiter.destroy();
  }
  globalRateLimiter = new RateLimiter(config);
};

export const getGlobalRateLimiter = (): RateLimiter => {
  if (!globalRateLimiter) {
    throw new Error('Global rate limiter not initialized. Call initializeGlobalRateLimiter first.');
  }
  return globalRateLimiter;
};

// Custom key generators
export const KeyGenerators = {
  byIP: (req: Request): string => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },

  byUser: (req: Request): string => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new Error('User not found in request. Ensure authentication middleware runs first.');
    }
    return `user:${userId}`;
  },

  byUserOrIP: (req: Request): string => {
    const userId = (req as any).user?.id;
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return userId ? `user:${userId}` : `ip:${ip}`;
  },

  byEndpoint: (req: Request): string => {
    const userId = (req as any).user?.id;
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const endpoint = req.route?.path || req.path;
    const identifier = userId ? `user:${userId}` : `ip:${ip}`;
    return `${endpoint}:${identifier}`;
  }
};

export default RateLimiter;
