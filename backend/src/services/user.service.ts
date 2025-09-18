// services/user.service.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail } from './email.service';
import { sendWelcomeSMS } from './sms.service';

const prisma = new PrismaClient();

// User interfaces for type safety
export interface CreateUserData {
  email?: string;
  phone?: string;
  name: string;
  password: string;
  avatar?: string;
  preferences?: UserPreferences;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    achievements?: boolean;
    courseReminders?: boolean;
    weeklyDigest?: boolean;
  };
  privacy?: {
    showProfile?: boolean;
    showProgress?: boolean;
    showAchievements?: boolean;
  };
}

export interface LoginData {
  email?: string;
  phone?: string;
  password: string;
}

export interface UserStats {
  totalPoints: number;
  currentLevel: number;
  totalCoursesCompleted: number;
  totalAchievements: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number;
  averageScore: number;
}

export interface FindUserParams {
  email?: string | null;
  phone?: string | null;
  id?: string | null;
}

// Utility function to check for valid values
const isValidValue = (value: string | null | undefined): value is string => {
  return value !== null && value !== undefined && value.trim() !== '';
};

// Find existing user by email, phone, or ID
export const findExistingUser = async (params: FindUserParams) => {
  const { email, phone, id } = params;
  
  const searchConditions = [];
  
  if (isValidValue(email)) {
    searchConditions.push({ email: email.trim().toLowerCase() });
  }
  
  if (isValidValue(phone)) {
    searchConditions.push({ phone: phone.trim() });
  }
  
  if (isValidValue(id)) {
    searchConditions.push({ id: id.trim() });
  }
  
  if (searchConditions.length === 0) {
    return null;
  }
  
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: searchConditions
      },
      include: {
        profile: true,
        achievements: true,
        enrollments: {
          include: {
            course: true
          }
        }
      }
    });
    
    return existingUser;
  } catch (error) {
    console.error('Error finding user:', error);
    throw new Error('Failed to search for existing user');
  }
};

// Create new user
export const createUser = async (userData: CreateUserData) => {
  try {
    // Check if user already exists
    const existingUser = await findExistingUser({
      email: userData.email,
      phone: userData.phone
    });
    
    if (existingUser) {
      throw new Error('User with this email or phone already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    // Create user with profile
    const newUser = await prisma.user.create({
      data: {
        email: userData.email?.toLowerCase(),
        phone: userData.phone,
        name: userData.name,
        password: hashedPassword,
        avatar: userData.avatar,
        profile: {
          create: {
            bio: '',
            points: 0,
            level: 1,
            experience: 0,
            streak: 0,
            longestStreak: 0,
            totalStudyTime: 0,
            preferences: userData.preferences || {
              theme: 'system',
              language: 'en',
              notifications: {
                email: true,
                sms: false,
                push: true,
                achievements: true,
                courseReminders: true,
                weeklyDigest: true
              },
              privacy: {
                showProfile: true,
                showProgress: true,
                showAchievements: true
              }
            }
          }
        }
      },
      include: {
        profile: true
      }
    });
    
    // Send welcome messages
    if (userData.email) {
      await sendWelcomeEmail({
        email: userData.email,
        name: userData.name,
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`
      });
    }
    
    if (userData.phone) {
      await sendWelcomeSMS({
        phoneNumber: userData.phone,
        name: userData.name
      });
    }
    
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Authenticate user login
export const authenticateUser = async (loginData: LoginData) => {
  try {
    const user = await findExistingUser({
      email: loginData.email,
      phone: loginData.phone
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        name: user.name 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        avatar: user.avatar,
        profile: user.profile,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified
      },
      token
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw error;
  }
};

// Get user by ID with full profile
export const getUserById = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        achievements: {
          include: {
            achievement: true
          }
        },
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                thumbnail: true,
                difficulty: true,
                category: true
              }
            }
          }
        },
        completedLessons: {
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                courseId: true
              }
            }
          }
        }
      }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// Update user profile
export const updateUser = async (userId: string, updateData: UpdateUserData) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: updateData.name,
        email: updateData.email?.toLowerCase(),
        phone: updateData.phone,
        avatar: updateData.avatar,
        profile: {
          update: {
            bio: updateData.bio,
            preferences: updateData.preferences
          }
        }
      },
      include: {
        profile: true
      }
    });
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Add points to user
export const addPointsToUser = async (userId: string, points: number, reason?: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });
    
    if (!user || !user.profile) {
      throw new Error('User not found');
    }
    
    const newPoints = user.profile.points + points;
    const newExperience = user.profile.experience + points;
    const newLevel = calculateLevel(newExperience);
    
    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: {
        points: newPoints,
        experience: newExperience,
        level: newLevel
      }
    });
    
    // Log points transaction
    await prisma.pointsTransaction.create({
      data: {
        userId,
        points,
        type: 'EARNED',
        reason: reason || 'Activity completion',
        balance: newPoints
      }
    });
    
    // Check for level up
    if (newLevel > user.profile.level) {
      await handleLevelUp(userId, newLevel);
    }
    
    return updatedProfile;
  } catch (error) {
    console.error('Error adding points:', error);
    throw error;
  }
};

// Calculate user level based on experience
export const calculateLevel = (experience: number): number => {
  // Level formula: level = floor(sqrt(experience / 100)) + 1
  return Math.floor(Math.sqrt(experience / 100)) + 1;
};

// Handle level up rewards and notifications
const handleLevelUp = async (userId: string, newLevel: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, phone: true }
    });
    
    if (!user) return;
    
    // Award level up achievement if it exists
    const levelUpAchievement = await prisma.achievement.findFirst({
      where: { 
        type: 'LEVEL_UP',
        criteria: { level: newLevel }
      }
    });
    
    if (levelUpAchievement) {
      await awardAchievement(userId, levelUpAchievement.id);
    }
    
    // Send congratulations
    if (user.email) {
      // Send level up email notification
      console.log(`User ${user.name} reached level ${newLevel}!`);
    }
  } catch (error) {
    console.error('Error handling level up:', error);
  }
};

// Award achievement to user
export const awardAchievement = async (userId: string, achievementId: string) => {
  try {
    // Check if user already has this achievement
    const existingAward = await prisma.userAchievement.findFirst({
      where: {
        userId,
        achievementId
      }
    });
    
    if (existingAward) {
      return existingAward;
    }
    
    // Award the achievement
    const userAchievement = await prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
        unlockedAt: new Date()
      },
      include: {
        achievement: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });
    
    // Add bonus points
    if (userAchievement.achievement.points > 0) {
      await addPointsToUser(
        userId, 
        userAchievement.achievement.points, 
        `Achievement: ${userAchievement.achievement.name}`
      );
    }
    
    return userAchievement;
  } catch (error) {
    console.error('Error awarding achievement:', error);
    throw error;
  }
};

// Update user streak
export const updateUserStreak = async (userId: string, isActive: boolean = true) => {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    });
    
    if (!profile) {
      throw new Error('User profile not found');
    }
    
    let newStreak = isActive ? profile.streak + 1 : 0;
    let newLongestStreak = Math.max(profile.longestStreak, newStreak);
    
    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: {
        streak: newStreak,
        longestStreak: newLongestStreak,
        lastActiveAt: new Date()
      }
    });
    
    // Check for streak achievements
    if (newStreak > 0 && (newStreak % 7 === 0 || newStreak % 30 === 0)) {
      const streakAchievement = await prisma.achievement.findFirst({
        where: {
          type: 'STREAK',
          criteria: { days: newStreak }
        }
      });
      
      if (streakAchievement) {
        await awardAchievement(userId, streakAchievement.id);
      }
    }
    
    return updatedProfile;
  } catch (error) {
    console.error('Error updating streak:', error);
    throw error;
  }
};

// Get user statistics
export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        achievements: true,
        enrollments: {
          where: { completedAt: { not: null } }
        },
        completedLessons: true,
        quizAttempts: {
          where: { isCompleted: true }
        }
      }
    });
    
    if (!user || !user.profile) {
      throw new Error('User not found');
    }
    
    const averageScore = user.quizAttempts.length > 0
      ? user.quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / user.quizAttempts.length
      : 0;
    
    return {
      totalPoints: user.profile.points,
      currentLevel: user.profile.level,
      totalCoursesCompleted: user.enrollments.length,
      totalAchievements: user.achievements.length,
      currentStreak: user.profile.streak,
      longestStreak: user.profile.longestStreak,
      totalStudyTime: user.profile.totalStudyTime,
      averageScore: Math.round(averageScore * 100) / 100
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

// Get user leaderboard position
export const getUserLeaderboardPosition = async (userId: string) => {
  try {
    const userRank = await prisma.$queryRaw`
      SELECT COUNT(*) + 1 as rank
      FROM UserProfile up1
      INNER JOIN UserProfile up2 ON up2.points > up1.points
      WHERE up1.userId = ${userId}
    `;
    
    return userRank;
  } catch (error) {
    console.error('Error getting leaderboard position:', error);
    throw error;
  }
};

// Verify user email
export const verifyUserEmail = async (userId: string) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date()
      }
    });
    
    return updatedUser;
  } catch (error) {
    console.error('Error verifying email:', error);
    throw error;
  }
};

// Verify user phone
export const verifyUserPhone = async (userId: string) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isPhoneVerified: true,
        phoneVerifiedAt: new Date()
      }
    });
    
    return updatedUser;
  } catch (error) {
    console.error('Error verifying phone:', error);
    throw error;
  }
};

// Delete user account
export const deleteUser = async (userId: string) => {
  try {
    // Delete in correct order due to foreign key constraints
    await prisma.$transaction([
      prisma.pointsTransaction.deleteMany({ where: { userId } }),
      prisma.userAchievement.deleteMany({ where: { userId } }),
      prisma.enrollment.deleteMany({ where: { userId } }),
      prisma.lessonProgress.deleteMany({ where: { userId } }),
      prisma.quizAttempt.deleteMany({ where: { userId } }),
      prisma.userProfile.delete({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } })
    ]);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Get user learning progress
export const getUserLearningProgress = async (userId: string) => {
  try {
    const progress = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            totalLessons: true,
            category: true,
            difficulty: true
          }
        },
        progress: {
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                order: true
              }
            }
          }
        }
      }
    });
    
    return progress.map(enrollment => ({
      course: enrollment.course,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      progress: enrollment.progress.length,
      totalLessons: enrollment.course.totalLessons,
      progressPercentage: Math.round((enrollment.progress.length / enrollment.course.totalLessons) * 100)
    }));
  } catch (error) {
    console.error('Error getting learning progress:', error);
    throw error;
  }
};

export default {
  findExistingUser,
  createUser,
  authenticateUser,
  getUserById,
  updateUser,
  addPointsToUser,
  calculateLevel,
  awardAchievement,
  updateUserStreak,
  getUserStats,
  getUserLeaderboardPosition,
  verifyUserEmail,
  verifyUserPhone,
  deleteUser,
  getUserLearningProgress
};
