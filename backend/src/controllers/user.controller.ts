import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AuthRequest } from '../types/auth.types';
import { uploadToS3 } from '../config/aws';

export class UserController {
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
          level: true,
          xp: true,
          coins: true,
          streak: true,
          createdAt: true,
          enrollments: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  thumbnail: true,
                },
              },
            },
          },
          achievements: {
            include: {
              achievement: true,
            },
          },
          badges: {
            include: {
              badge: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { firstName, lastName, username } = req.body;

      // Check if username is already taken
      if (username) {
        const existingUser = await prisma.user.findFirst({
          where: {
            username,
            NOT: { id: userId },
          },
        });

        if (existingUser) {
          return res.status(400).json({ error: 'Username already taken' });
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          username,
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
          level: true,
          xp: true,
          coins: true,
        },
      });

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async uploadAvatar(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Upload to S3
      const key = `avatars/${userId}/${Date.now()}-${file.originalname}`;
      const uploadResult = await uploadToS3(file, key);

      // Update user avatar
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatar: uploadResult.Location },
        select: {
          id: true,
          avatar: true,
        },
      });

      res.json({
        message: 'Avatar uploaded successfully',
        avatar: updatedUser.avatar,
      });
    } catch (error) {
      console.error('Upload avatar error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async changePassword(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;

      // Get user's current password
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getLeaderboard(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const users = await prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          level: true,
          xp: true,
        },
        orderBy: [
          { level: 'desc' },
          { xp: 'desc' },
        ],
        skip,
        take: Number(limit),
      });

      const total = await prisma.user.count({
        where: { isActive: true },
      });

      res.json({
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Get leaderboard error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUserProgress(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const progress = await prisma.progress.findMany({
        where: { userId },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnail: true,
            },
          },
          lesson: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      const stats = await prisma.progress.aggregate({
        where: { userId },
        _count: {
          id: true,
        },
        _sum: {
          timeSpent: true,
        },
      });

      const completedLessons = await prisma.progress.count({
        where: {
          userId,
          isComplete: true,
        },
      });

      res.json({
        progress,
        stats: {
          totalLessons: stats._count.id,
          completedLessons,
          totalTimeSpent: stats._sum.timeSpent || 0,
          completionRate: stats._count.id > 0 ? (completedLessons / stats._count.id) * 100 : 0,
        },
      });
    } catch (error) {
      console.error('Get user progress error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new UserController();
