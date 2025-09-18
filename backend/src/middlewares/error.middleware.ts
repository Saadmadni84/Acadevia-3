import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// Custom error classes
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

// Error response interface
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    details?: any;
    stack?: string;
    timestamp: string;
    path: string;
  };
}

// Helper function to handle Zod validation errors
const handleZodError = (error: ZodError): ErrorResponse => {
  const details = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));

  return {
    success: false,
    error: {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      details,
      timestamp: new Date().toISOString(),
      path: ''
    }
  };
};

// Helper function to handle JWT errors
const handleJWTError = (): ErrorResponse => ({
  success: false,
  error: {
    message: 'Invalid token. Please log in again',
    code: 'INVALID_TOKEN',
    statusCode: 401,
    timestamp: new Date().toISOString(),
    path: ''
  }
});

// Helper function to handle JWT expired errors
const handleJWTExpiredError = (): ErrorResponse => ({
  success: false,
  error: {
    message: 'Token has expired. Please log in again',
    code: 'TOKEN_EXPIRED',
    statusCode: 401,
    timestamp: new Date().toISOString(),
    path: ''
  }
});

// Helper function to handle MongoDB cast errors
const handleCastError = (error: any): ErrorResponse => ({
  success: false,
  error: {
    message: `Invalid ${error.path}: ${error.value}`,
    code: 'INVALID_ID',
    statusCode: 400,
    timestamp: new Date().toISOString(),
    path: ''
  }
});

// Helper function to handle MongoDB duplicate key errors
const handleDuplicateKeyError = (error: any): ErrorResponse => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  
  return {
    success: false,
    error: {
      message: `${field} '${value}' already exists`,
      code: 'DUPLICATE_KEY',
      statusCode: 409,
      timestamp: new Date().toISOString(),
      path: ''
    }
  };
};

// Main error handling middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error Stack:', err.stack);

  let errorResponse: ErrorResponse;

  // Handle specific error types
  if (err instanceof ZodError) {
    errorResponse = handleZodError(err);
  } else if (err.name === 'JsonWebTokenError') {
    errorResponse = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    errorResponse = handleJWTExpiredError();
  } else if (err.name === 'CastError') {
    errorResponse = handleCastError(err);
  } else if (err.code === 11000) {
    errorResponse = handleDuplicateKeyError(err);
  } else if (err instanceof AppError) {
    // Handle custom application errors
    errorResponse = {
      success: false,
      error: {
        message: err.message,
        code: err.code,
        statusCode: err.statusCode,
        timestamp: new Date().toISOString(),
        path: req.path
      }
    };
  } else {
    // Handle generic errors
    const statusCode = err.statusCode || err.status || 500;
    const message = statusCode === 500 ? 'Internal server error' : err.message;

    errorResponse = {
      success: false,
      error: {
        message,
        code: 'INTERNAL_ERROR',
        statusCode,
        timestamp: new Date().toISOString(),
        path: req.path
      }
    };
  }

  // Add stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // Add request details in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.details = {
      ...errorResponse.error.details,
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query
    };
  }

  res.status(errorResponse.error.statusCode).json(errorResponse);
};

// Async error handler wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler middleware
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

// Validation middleware factory
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Rate limiting error handler
export const handleRateLimitError = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(
    'Too many requests from this IP, please try again later',
    429,
    'RATE_LIMIT_EXCEEDED'
  );
  next(error);
};

// Gamification specific errors
export class GameProgressError extends AppError {
  constructor(message: string) {
    super(message, 400, 'GAME_PROGRESS_ERROR');
    this.name = 'GameProgressError';
  }
}

export class AchievementError extends AppError {
  constructor(message: string) {
    super(message, 400, 'ACHIEVEMENT_ERROR');
    this.name = 'AchievementError';
  }
}

export class LeaderboardError extends AppError {
  constructor(message: string) {
    super(message, 400, 'LEADERBOARD_ERROR');
    this.name = 'LeaderboardError';
  }
}

export class QuizError extends AppError {
  constructor(message: string) {
    super(message, 400, 'QUIZ_ERROR');
    this.name = 'QuizError';
  }
}

// Learning platform specific errors
export class CourseError extends AppError {
  constructor(message: string) {
    super(message, 400, 'COURSE_ERROR');
    this.name = 'CourseError';
  }
}

export class LessonError extends AppError {
  constructor(message: string) {
    super(message, 400, 'LESSON_ERROR');
    this.name = 'LessonError';
  }
}

export class EnrollmentError extends AppError {
  constructor(message: string) {
    super(message, 400, 'ENROLLMENT_ERROR');
    this.name = 'EnrollmentError';
  }
}
