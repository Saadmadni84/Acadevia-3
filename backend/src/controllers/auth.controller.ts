import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from './database';

interface JWTPayload {
  id: string;
  username: string;
}

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload: JWTPayload = {
      id: user.id,
      username: user.username,
    };

    // Sign token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET as string, // Type assertion to ensure it's a string
      {
        expiresIn: '7d',
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};