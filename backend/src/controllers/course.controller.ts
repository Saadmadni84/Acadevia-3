import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types/auth.types';

export class CourseController {
  // GET /courses
  static async getAllCourses(req: Request, res: Response) {
    try {
      const { 
        category, 
        level, 
        search, 
        page = 1, 
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const where: any = {};
      
      if (category) where.category = category;
      if (level) where.level = level;
      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      const orderBy: any = {};
      orderBy[sortBy as string] = sortOrder === 'desc' ? 'desc' : 'asc';

      const courses = await prisma.course.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          thumbnail: true,
          category: true,
          level: true,
          duration: true,
          price: true,
          rating: true,
          totalStudents: true,
          instructor: {
            select: {
              name: true,
              avatar: true
            }
          }
        },
        orderBy,
        take: parseInt(limit as string),
        skip: (parseInt(page as string) - 1) * parseInt(limit as string)
      });

      const total = await prisma.course.count({ where });

      res.status(200).json({
        success: true,
        courses,
        pagination: {
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
          page: parseInt(page as string),
          limit: parseInt(limit as string)
        }
      });
    } catch (error) {
      console.error('Get courses error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // GET /courses/:id
  static async getCourseDetails(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          lectures: {
            select: {
              id: true,
              title: true,
              description: true,
              duration: true,
              order: true,
              thumbnail: true
            },
            orderBy: { order: 'asc' }
          },
          instructor: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      });

      if (!course) {
        return res.status(404).json({ 
          success: false, 
          message: 'Course not found' 
        });
      }

      // Check if user is enrolled
      let isEnrolled = false;
      let progress = null;

      if (req.userId) {
        const enrollment = await prisma.courseEnrollment.findUnique({
          where: {
            userId_courseId: {
              userId: req.userId,
              courseId: id
            }
          }
        });
        isEnrolled = !!enrollment;

        if (isEnrolled) {
          progress = await prisma.progress.findUnique({
            where: {
              userId_courseId: {
                userId: req.userId,
                courseId: id
              }
            }
          });
        }
      }

      res.status(200).json({
        success: true,
        course,
        isEnrolled,
        progress
      });
    } catch (error) {
      console.error('Get course details error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // POST /courses/enroll/:id
  static async enrollInCourse(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const course = await prisma.course.findUnique({
        where: { id }
      });

      if (!course) {
        return res.status(404).json({ 
          success: false, 
          message: 'Course not found' 
        });
      }

      // Check if already enrolled
      const existingEnrollment = await prisma.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId: req.userId!,
            courseId: id
          }
        }
      });

      if (existingEnrollment) {
        return res.status(400).json({ 
          success: false, 
          message: 'Already enrolled in this course' 
        });
      }

      // Create enrollment and progress in transaction
      await prisma.$transaction(async (tx) => {
        // Create enrollment
        await tx.courseEnrollment.create({
          data: {
            userId: req.userId!,
            courseId: id
          }
        });

        // Create progress entry
        await tx.progress.create({
          data: {
            userId: req.userId!,
            courseId: id,
            progressPercentage: 0,
            timeSpent: 0,
            isCompleted: false
          }
        });

        // Update course student count
        await tx.course.update({
          where: { id },
          data: {
            totalStudents: {
              increment: 1
            }
          }
        });
      });

      res.status(200).json({
        success: true,
        message: 'Successfully enrolled in course'
      });
    } catch (error) {
      console.error('Enroll course error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // GET /courses/:id/lectures
  static async getCourseLectures(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      // Check if user is enrolled
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId: req.userId!,
            courseId: id
          }
        }
      });

      if (!enrollment) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not enrolled in this course' 
        });
      }

      const lectures = await prisma.lecture.findMany({
        where: { courseId: id },
        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          order: true,
          videoUrl: true,
          thumbnail: true
        },
        orderBy: { order: 'asc' }
      });

      res.status(200).json({
        success: true,
        lectures
      });
    } catch (error) {
      console.error('Get course lectures error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // POST /courses/:id/complete-lecture/:lectureId
  static async completeLecture(req: AuthRequest, res: Response) {
    try {
      const { id, lectureId } = req.params;
      
      // Get progress
      const progress = await prisma.progress.findUnique({
        where: {
          userId_courseId: {
            userId: req.userId!,
            courseId: id
          }
        }
      });

      if (!progress) {
        return res.status(404).json({ 
          success: false, 
          message: 'Progress not found' 
        });
      }

      // Check if lecture progress exists
      const existingLectureProgress = await prisma.lectureProgress.findUnique({
        where: {
          progressId_lectureId: {
            progressId: progress.id,
            lectureId
          }
        }
      });

      if (existingLectureProgress?.isCompleted) {
        return res.status(400).json({ 
          success: false, 
          message: 'Lecture already completed' 
        });
      }

      // Get total lectures in course
      const totalLectures = await prisma.lecture.count({
        where: { courseId: id }
      });

      // Update or create lecture progress
      await prisma.$transaction(async (tx) => {
        // Mark lecture as completed
        await tx.lectureProgress.upsert({
          where: {
            progressId_lectureId: {
              progressId: progress.id,
              lectureId
            }
          },
          update: {
            isCompleted: true,
            completedAt: new Date()
          },
          create: {
            progressId: progress.id,
            lectureId,
            isCompleted: true,
            completedAt: new Date()
          }
        });

        // Get completed lectures count
        const completedLectures = await tx.lectureProgress.count({
          where: {
            progressId: progress.id,
            isCompleted: true
          }
        });

        // Calculate progress percentage
        const progressPercentage = (completedLectures / totalLectures) * 100;
        const isCompleted = progressPercentage === 100;

        // Update course progress
        await tx.progress.update({
          where: { id: progress.id },
          data: {
            progressPercentage,
            isCompleted,
            completedAt: isCompleted ? new Date() : null
          }
        });

        // Award points if course completed
        if (isCompleted) {
          await tx.user.update({
            where: { id: req.userId! },
            data: {
              points: { increment: 100 },
              completedCourses: { increment: 1 }
            }
          });
        } else {
          // Award points for lecture completion
          await tx.user.update({
            where: { id: req.userId! },
            data: {
              points: { increment: 10 }
            }
          });
        }
      });

      res.status(200).json({
        success: true,
        message: 'Lecture marked as completed',
        progress: Math.round((await prisma.lectureProgress.count({
          where: {
            progressId: progress.id,
            isCompleted: true
          }
        }) / totalLectures) * 100)
      });
    } catch (error) {
      console.error('Complete lecture error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}
