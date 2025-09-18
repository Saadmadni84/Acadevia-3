// backend/src/config/database.ts
import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Database configuration options for the learning platform
const prismaOptions = {
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] as const
    : ['error'] as const,
  
  // Error formatting for better debugging
  errorFormat: 'pretty' as const,
  
  // Connection pool settings optimized for learning platform
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};

// Singleton pattern to prevent multiple Prisma instances
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // In production, create a single instance
  prisma = new PrismaClient(prismaOptions);
} else {
  // In development, use global variable to prevent hot reload issues
  if (!global.__prisma) {
    global.__prisma = new PrismaClient(prismaOptions);
  }
  prisma = global.__prisma;
}

// Graceful shutdown handling
process.on('beforeExit', async () => {
  console.log('🔌 Disconnecting from database...');
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  console.log('🔌 Received SIGINT, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔌 Received SIGTERM, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

// Connection health check utility
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection is healthy');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Database initialization for learning platform
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing database connection...');
    
    // Check connection
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }
    
    // Run any initialization queries if needed
    console.log('✅ Database initialized successfully');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Utility functions for the learning platform

/**
 * Execute database operations with automatic retry
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error);
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};

/**
 * Transaction wrapper with error handling
 */
export const executeTransaction = async <T>(
  transactionFn: (tx: Parameters<typeof prisma.$transaction>[0]) => Promise<T>
): Promise<T> => {
  return await withRetry(async () => {
    return await prisma.$transaction(transactionFn, {
      maxWait: 10000, // 10 seconds
      timeout: 30000, // 30 seconds
      isolationLevel: 'ReadCommitted', // Good for learning platform operations
    });
  });
};

/**
 * Batch operations for bulk data processing
 */
export const batchOperation = async <T>(
  items: T[],
  batchSize: number = 100,
  processBatch: (batch: T[]) => Promise<void>
): Promise<void> => {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await processBatch(batch);
    
    // Small delay to prevent overwhelming the database
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
};

/**
 * Database cleanup utilities for maintenance
 */
export const cleanup = {
  // Clean expired OTPs
  cleanExpiredOTPs: async (): Promise<number> => {
    const result = await prisma.user.updateMany({
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
    
    console.log(`🧹 Cleaned ${result.count} expired OTPs`);
    return result.count;
  },
  
  // Clean old sessions (if you implement session management)
  cleanOldSessions: async (daysOld: number = 30): Promise<number> => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    // This is a placeholder - adjust based on your session table structure
    console.log(`🧹 Would clean sessions older than ${cutoffDate.toISOString()}`);
    return 0;
  },
  
  // Vacuum analyze for PostgreSQL performance
  optimizeDatabase: async (): Promise<void> => {
    try {
      if (process.env.DATABASE_URL?.includes('postgresql')) {
        await prisma.$executeRaw`VACUUM ANALYZE`;
        console.log('🔧 Database optimization completed');
      }
    } catch (error) {
      console.warn('⚠️ Database optimization failed:', error);
    }
  }
};

/**
 * Database statistics for monitoring
 */
export const getStats = {
  // Get user statistics
  userStats: async () => {
    const [totalUsers, verifiedUsers, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          OR: [
            { isEmailVerified: true },
            { isPhoneVerified: true }
          ]
        }
      }),
      prisma.user.count({
        where: {
          lastActiveAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    ]);
    
    return {
      totalUsers,
      verifiedUsers,
      activeUsers,
      verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers * 100).toFixed(2) : '0'
    };
  },
  
  // Get learning platform specific stats
  learningStats: async () => {
    try {
      const [totalCourses, totalEnrollments, completedCourses] = await Promise.all([
        prisma.course?.count() || 0,
        prisma.enrollment?.count() || 0,
        prisma.enrollment?.count({
          where: {
            completedAt: { not: null }
          }
        }) || 0
      ]);
      
      return {
        totalCourses,
        totalEnrollments,
        completedCourses,
        completionRate: totalEnrollments > 0 ? (completedCourses / totalEnrollments * 100).toFixed(2) : '0'
      };
    } catch (error) {
      console.warn('Learning stats not available yet (tables might not exist)');
      return {
        totalCourses: 0,
        totalEnrollments: 0,
        completedCourses: 0,
        completionRate: '0'
      };
    }
  }
};

// Export the Prisma instance as default
export default prisma;

// Export specific utilities
export {
  prisma,
  prismaOptions,
  checkDatabaseConnection as healthCheck
};
