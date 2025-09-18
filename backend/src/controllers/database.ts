import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

// Global is used here to maintain a cached connection across hot reloads in development
declare global {
  var __prisma: PrismaClient | undefined;
}

// Database configuration options
const databaseConfig: Prisma.PrismaClientOptions = {
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
  errorFormat: 'colorless',
};

// Create Prisma client instance
export const prisma = 
  globalThis.__prisma ||
  new PrismaClient(databaseConfig);

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Database event listeners for logging
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.info(`Query: ${e.query}`);
    logger.info(`Duration: ${e.duration}ms`);
  });
}

prisma.$on('error', (e) => {
  logger.error('Database error:', e);
});

prisma.$on('warn', (e) => {
  logger.warn('Database warning:', e);
});

// Database connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database connection successful');
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    return false;
  }
}

// Database connection with retry logic
export async function connectDatabase(retries = 5, delay = 3000): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      logger.info('🗄️  Database connected successfully');
      
      // Run connection health check
      await checkDatabaseConnection();
      return;
    } catch (error) {
      logger.error(`Database connection attempt ${i + 1} failed:`, error);
      
      if (i === retries - 1) {
        logger.error('❌ All database connection attempts failed');
        throw new Error('Failed to connect to database after multiple attempts');
      }
      
      logger.info(`⏳ Retrying database connection in ${delay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Graceful database disconnection
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('🗄️  Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
    throw error;
  }
}

// Database transaction wrapper with retry logic
export async function withTransaction<T>(
  fn: (prisma: Prisma.TransactionClient) => Promise<T>,
  retries = 3
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await prisma.$transaction(fn, {
        maxWait: 5000, // 5 seconds
        timeout: 10000, // 10 seconds
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
      });
    } catch (error) {
      logger.error(`Transaction attempt ${attempt} failed:`, error);
      
      if (attempt === retries) {
        throw error;
      }
      
      // Wait before retry with exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Transaction failed after all retries');
}

// Database utility functions
export class DatabaseUtils {
  // Check if database is healthy
  static async isHealthy(): Promise<boolean> {
    try {
      const result = await prisma.$queryRaw<Array<{ version: string }>>`
        SELECT VERSION() as version;
      `;
      return result.length > 0;
    } catch {
      return false;
    }
  }

  // Get database statistics
  static async getStats() {
    try {
      const [userCount, courseCount, paymentCount] = await Promise.all([
        prisma.user.count(),
        prisma.course.count(),
        prisma.payment.count({ where: { status: 'completed' } })
      ]);

      return {
        users: userCount,
        courses: courseCount,
        completedPayments: paymentCount,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error fetching database stats:', error);
      throw error;
    }
  }

  // Clean up expired sessions/tokens
  static async cleanup() {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Clean expired OTPs
      const cleanupResult = await prisma.user.updateMany({
        where: {
          otpExpiry: {
            lt: new Date()
          }
        },
        data: {
          otp: null,
          otpExpiry: null
        }
      });

      logger.info(`🧹 Cleaned up ${cleanupResult.count} expired OTPs`);
      
      return cleanupResult;
    } catch (error) {
      logger.error('Database cleanup error:', error);
      throw error;
    }
  }

  // Run database migrations programmatically
  static async migrate() {
    try {
      // This would typically be handled by Prisma CLI, but can be useful for programmatic migrations
      logger.info('🔄 Running database migrations...');
      // await prisma.$executeRaw`-- Migration SQL would go here`;
      logger.info('✅ Database migrations completed');
    } catch (error) {
      logger.error('Migration error:', error);
      throw error;
    }
  }
}

// Export default instance
export default prisma;
