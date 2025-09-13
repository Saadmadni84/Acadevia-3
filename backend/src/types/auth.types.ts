import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
    isActive: boolean;
  };
}

export interface JWTPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}
