import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types/auth.types';

export class UserController {
  // GET /user/profile
  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          points: true,
          level: true,
          streakDays: true,
          completedCourses: true,
          createdAt: true,
          enrolledCourses: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  thumbnail: true,
                  category: true
                }
              }
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // PUT /user/profile
  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const { name, email, phone, avatar } = req.body;
      
      const user = await prisma.user.update({
        where: { id: req.userId },
        data: { name, email, phone, avatar },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          points: true,
          level: true
        }
      });

      res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // GET /user/progress
  static async getLearningProgress(req: AuthRequest, res: Response) {
    try {
      const progress = await prisma.progress.findMany({
        where: { userId: req.userId },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnail: true,
              duration: true
            }
          },
          lectureProgress: {
            where: { isCompleted: true },
            include: {
              lecture: {
                select: {
                  title: true,
                  duration: true
                }
              }
            }
          }
        }
      });

      const stats = {
        totalCourses: progress.length,
        completedCourses: progress.filter(p => p.isCompleted).length,
        totalHours: Math.round(progress.reduce((acc, p) => acc + p.timeSpent, 0) / 60),
        averageProgress: progress.length > 0 
          ? Math.round(progress.reduce((acc, p) => acc + p.progressPercentage, 0) / progress.length)
          : 0
      };

      res.status(200).json({
        success: true,
        progress,
        stats
      });
    } catch (error) {
      console.error('Get progress error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // GET /user/leaderboard
  static async getLeaderboard(req: AuthRequest, res: Response) {
    try {
      const { limit = 10, type = 'points' } = req.query;
      
      let orderBy: any = { points: 'desc' };
      if (type === 'level') orderBy = { level: 'desc' };
      if (type === 'courses') orderBy = { completedCourses: 'desc' };

      const leaderboard = await prisma.user.findMany({
        where: { isVerified: true },
        select: {
          id: true,
          name: true,
          avatar: true,
          points: true,
          level: true,
          completedCourses: true
        },
        orderBy,
        take: parseInt(limit as string)
      });

      // Get current user rank
      const currentUser = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          id: true,
          name: true,
          avatar: true,
          points: true,
          level: true,
          completedCourses: true
        }
      });
      
      const fieldName = type === 'level' ? 'level' : type === 'courses' ? 'completedCourses' : 'points';
      const userRank = await prisma.user.count({
        where: {
          isVerified: true,
          [fieldName]: { gt: currentUser?.[fieldName as keyof typeof currentUser] }
        }
      }) + 1;

      res.status(200).json({
        success: true,
        leaderboard: leaderboard.map((user, index) => ({
          ...user,
          rank: index + 1
        })),
        currentUser: currentUser ? {
          ...currentUser,
          rank: userRank
        } : null
      });
    } catch (error) {
      console.error('Get leaderboard error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}
