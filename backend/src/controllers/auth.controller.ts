// controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { generateOTP, isValidEmail, isValidPhone } from '../utils/helpers';
import { sendEmail } from '../services/email.service';
import { sendSMS } from '../services/sms.service';

export class AuthController {
  // POST /auth/signup
  static async signup(req: Request, res: Response) {
    try {
      const { name, email, phone, password } = req.body;
      
      // Input validation
      if (!name || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Name and password are required' 
        });
      }

      if (!email && !phone) {
        return res.status(400).json({ 
          success: false, 
          message: 'Either email or phone is required' 
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: 'Password must be at least 6 characters long' 
        });
      }

      // Check if user exists - FIXED VERSION
      const searchConditions = [];

      // Only add email condition if email exists and is valid
      if (email && email.trim()) {
        if (!isValidEmail(email.trim())) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid email format' 
          });
        }
        searchConditions.push({ email: email.trim().toLowerCase() });
      }

      // Only add phone condition if phone exists and is valid  
      if (phone && phone.trim()) {
        if (!isValidPhone(phone.trim())) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid phone format' 
          });
        }
        searchConditions.push({ phone: phone.trim() });
      }

      // Only query if we have valid search criteria
      let existingUser = null;
      if (searchConditions.length > 0) {
        existingUser = await prisma.user.findFirst({
          where: {
            OR: searchConditions
          }
        });
      }

      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'User already exists with this email or phone' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Generate OTP
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // FIXED: Create user with proper schema structure
      const user = await prisma.user.create({
        data: {
          name,
          email: email?.toLowerCase(),
          phone,
          password: hashedPassword,
          otp,
          otpExpiry,
          isEmailVerified: false,
          isPhoneVerified: false,
          profile: {
            create: {
              points: 0,
              level: 1,
              experience: 0,
              streak: 0,
              longestStreak: 0,
              totalStudyTime: 0,
              bio: '',
              preferences: {
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

      // Send OTP - FIXED VERSION
      try {
        const notifications = [];
        
        if (email) {
          const emailResult = await sendEmail({
            to: email,
            subject: '🔐 Verify Your Account - Learning Platform',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0;">Welcome ${name}! 🎉</h1>
                </div>
                <div style="padding: 30px; background-color: #f8f9fa;">
                  <h2 style="color: #333;">Verify Your Account</h2>
                  <p style="color: #666; line-height: 1.6;">
                    Thank you for joining our learning platform! Please use the verification code below to activate your account:
                  </p>
                  <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; color: #667eea; padding: 20px; background: #f8f9fa; border: 2px dashed #667eea; border-radius: 10px;">
                      ${otp}
                    </span>
                  </div>
                  <p style="color: #e53e3e; text-align: center; font-size: 14px;">
                    This code will expire in 10 minutes
                  </p>
                  <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    If you didn't create this account, please ignore this email.
                  </p>
                </div>
              </div>
            `,
            text: `Welcome ${name}! Your verification code is: ${otp}. This code will expire in 10 minutes.`
          });
          
          if (emailResult) {
            notifications.push('email');
          }
        }
        
        if (phone) {
          const smsResult = await sendSMS({
            to: phone,
            message: `🎉 Welcome ${name}! Your Learning Platform verification code: ${otp} (expires in 10 minutes). Start your learning journey today!`
          });
          
          if (smsResult) {
            notifications.push('SMS');
          }
        }

        // Response with notification status
        let message = 'User registered successfully.';
        if (notifications.length > 0) {
          message += ` Verification code sent via ${notifications.join(' and ')}.`;
        } else {
          message += ' Please note: verification code could not be sent.';
        }

        res.status(201).json({
          success: true,
          message,
          userId: user.id,
          verificationRequired: true,
          notificationsSent: notifications,
          otpExpiresAt: otpExpiry.toISOString()
        });

      } catch (notificationError) {
        console.error('Notification sending error:', notificationError);
        
        // Still return success for user creation, but note notification failure
        res.status(201).json({
          success: true,
          message: 'User registered successfully, but verification code could not be sent. Please request a new code.',
          userId: user.id,
          verificationRequired: true,
          notificationError: true
        });
      }

    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Registration failed. Please try again.' 
      });
    }
  }

  // POST /auth/login - FIXED VERSION
  static async login(req: Request, res: Response) {
    try {
      const { identifier, password } = req.body;
      
      // Input validation
      if (!identifier || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email/phone and password are required' 
        });
      }

      // Build proper search conditions
      const searchConditions = [];
      const trimmedIdentifier = identifier.trim();
      
      if (isValidEmail(trimmedIdentifier)) {
        searchConditions.push({ email: trimmedIdentifier.toLowerCase() });
      } else if (isValidPhone(trimmedIdentifier)) {
        searchConditions.push({ phone: trimmedIdentifier });
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email or phone format' 
        });
      }

      const user = await prisma.user.findFirst({
        where: {
          OR: searchConditions
        },
        include: {
          profile: true
        }
      });

      if (!user) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      // FIXED: Check verification status using correct fields
      const isEmailLogin = isValidEmail(trimmedIdentifier);
      const isPhoneLogin = isValidPhone(trimmedIdentifier);
      
      if (isEmailLogin && !user.isEmailVerified) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please verify your email first',
          requiresVerification: true,
          verificationType: 'email',
          userId: user.id
        });
      }
      
      if (isPhoneLogin && !user.isPhoneVerified) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please verify your phone first',
          requiresVerification: true,
          verificationType: 'phone',
          userId: user.id
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      // FIXED: Update last login with correct field name
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          lastLoginAt: new Date(),
          lastActiveAt: new Date()
        }
      });

      // Generate JWT tokens
      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          name: user.name
        }, 
        process.env.JWT_SECRET!, 
        { expiresIn: '7d' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_JWT_SECRET!,
        { expiresIn: '30d' }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          profile: {
            points: user.profile?.points || 0,
            level: user.profile?.level || 1,
            experience: user.profile?.experience || 0,
            streak: user.profile?.streak || 0,
            longestStreak: user.profile?.longestStreak || 0
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Login failed. Please try again.' 
      });
    }
  }

  // POST /auth/send-otp - FIXED VERSION
  static async sendOTP(req: Request, res: Response) {
    try {
      const { identifier, type } = req.body; // type: 'verification' | 'password-reset'
      
      if (!identifier) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email or phone is required' 
        });
      }

      // Build proper search conditions
      const searchConditions = [];
      const trimmedIdentifier = identifier.trim();
      
      if (isValidEmail(trimmedIdentifier)) {
        searchConditions.push({ email: trimmedIdentifier.toLowerCase() });
      } else if (isValidPhone(trimmedIdentifier)) {
        searchConditions.push({ phone: trimmedIdentifier });
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email or phone format' 
        });
      }

      const user = await prisma.user.findFirst({
        where: {
          OR: searchConditions
        }
      });

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: { otp, otpExpiry }
      });

      // FIXED: Send OTP using proper service functions
      try {
        const notifications = [];
        
        if (user.email && isValidEmail(trimmedIdentifier)) {
          const emailResult = await sendEmail({
            to: user.email,
            subject: type === 'password-reset' 
              ? '🔐 Password Reset Code' 
              : '🔐 Verification Code',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Hello ${user.name}!</h2>
                <p>Your ${type === 'password-reset' ? 'password reset' : 'verification'} code is:</p>
                <div style="text-align: center; margin: 20px 0;">
                  <span style="font-size: 32px; font-weight: bold; color: #667eea; padding: 20px; background: #f8f9fa; border-radius: 10px;">${otp}</span>
                </div>
                <p>This code will expire in 10 minutes.</p>
              </div>
            `
          });
          
          if (emailResult) {
            notifications.push('email');
          }
        }
        
        if (user.phone && isValidPhone(trimmedIdentifier)) {
          const smsResult = await sendSMS({
            to: user.phone,
            message: `🔐 Your ${type === 'password-reset' ? 'password reset' : 'verification'} code: ${otp} (expires in 10 minutes). Learning Platform.`
          });
          
          if (smsResult) {
            notifications.push('SMS');
          }
        }

        res.status(200).json({
          success: true,
          message: `OTP sent successfully via ${notifications.join(' and ')}`,
          expiresIn: 600
        });
        
      } catch (notificationError) {
        console.error('OTP notification error:', notificationError);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to send OTP. Please try again.' 
        });
      }

    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP. Please try again.' 
      });
    }
  }

  // POST /auth/verify-otp - FIXED VERSION
  static async verifyOTP(req: Request, res: Response) {
    try {
      const { identifier, otp, type } = req.body;
      
      if (!identifier || !otp) {
        return res.status(400).json({ 
          success: false, 
          message: 'Identifier and OTP are required' 
        });
      }

      // Build proper search conditions
      const searchConditions = [];
      const trimmedIdentifier = identifier.trim();
      
      if (isValidEmail(trimmedIdentifier)) {
        searchConditions.push({ email: trimmedIdentifier.toLowerCase() });
      } else if (isValidPhone(trimmedIdentifier)) {
        searchConditions.push({ phone: trimmedIdentifier });
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid identifier format' 
        });
      }

      const user = await prisma.user.findFirst({
        where: {
          AND: [
            { OR: searchConditions },
            { otp: otp.toString() },
            { otpExpiry: { gt: new Date() } }
          ]
        }
      });

      if (!user) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid or expired OTP' 
        });
      }

      // FIXED: Update verification status with correct field names
      const updateData: any = {
        otp: null,
        otpExpiry: null
      };

      if (type !== 'password-reset') {
        if (isValidEmail(trimmedIdentifier)) {
          updateData.isEmailVerified = true;
          updateData.emailVerifiedAt = new Date();
        }
        if (isValidPhone(trimmedIdentifier)) {
          updateData.isPhoneVerified = true;
          updateData.phoneVerifiedAt = new Date();
        }
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData
      });

      res.status(200).json({
        success: true,
        message: type === 'password-reset' 
          ? 'OTP verified. You can now reset your password.' 
          : 'Account verified successfully!',
        userId: user.id,
        canResetPassword: type === 'password-reset'
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Verification failed. Please try again.' 
      });
    }
  }

  // POST /auth/refresh-token
  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({ 
          success: false, 
          message: 'Refresh token is required' 
        });
      }

      const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET!) as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { profile: true }
      });

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid refresh token' 
        });
      }

      const newToken = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          name: user.name
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        success: true,
        token: newToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          profile: user.profile
        }
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired refresh token' 
      });
    }
  }

  // POST /auth/logout
  static async logout(req: Request, res: Response) {
    try {
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Logout failed' 
      });
    }
  }
}
