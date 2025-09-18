import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/database';
import { AuthRequest } from '../types/auth.types';
import { EmailService } from '../services/email.service';
import { SMSService } from '../services/sms.service';
import { RedisService } from '../config/redis';
import { generateOTP, isValidPhoneNumber, isValidEmail } from '../utils/helpers';
import { logger } from '../utils/logger';

interface OTPData {
  otp: string;
  expiryTime: Date;
  attempts: number;
  isVerified: boolean;
}

export class OTPController {
  // POST /otp/send
  static async sendOTP(req: Request, res: Response) {
    try {
      const { identifier, type = 'verification', method = 'auto' } = req.body;

      // Validate input
      if (!identifier) {
        return res.status(400).json({
          success: false,
          message: 'Email or phone number is required'
        });
      }

      // Determine if identifier is email or phone
      const isEmail = isValidEmail(identifier);
      const isPhone = isValidPhoneNumber(identifier);

      if (!isEmail && !isPhone) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email or phone number'
        });
      }

      // Check rate limiting (max 3 OTPs per 15 minutes)
      const rateLimitKey = `otp_rate_limit:${identifier}`;
      const isRateLimited = await RedisService.isRateLimited(rateLimitKey, 3, 900); // 15 minutes

      if (isRateLimited) {
        return res.status(429).json({
          success: false,
          message: 'Too many OTP requests. Please try again after 15 minutes.'
        });
      }

      // Check if user exists (for verification type)
      let user = null;
      if (type === 'verification' || type === 'login') {
        user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: isEmail ? identifier : undefined },
              { phone: isPhone ? identifier : undefined }
            ]
          }
        });

        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found with this email/phone number'
          });
        }
      }

      // Generate OTP
      const otp = generateOTP(6); // 6-digit OTP
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP data in Redis with expiry
      const otpData: OTPData = {
        otp,
        expiryTime,
        attempts: 0,
        isVerified: false
      };

      const otpKey = `otp:${identifier}:${type}`;
      await RedisService.set(otpKey, otpData, 600); // 10 minutes

      // Determine sending method
      let sendMethod = method;
      if (method === 'auto') {
        sendMethod = isEmail ? 'email' : 'sms';
      }

      // Send OTP
      let deliverySuccess = false;
      let deliveryMethod = '';

      try {
        if (sendMethod === 'email' && isEmail) {
          await EmailService.sendOTPEmail(identifier, otp, type);
          deliverySuccess = true;
          deliveryMethod = 'email';
        } else if (sendMethod === 'sms' && isPhone) {
          await SMSService.sendOTPSMS(identifier, otp, type);
          deliverySuccess = true;
          deliveryMethod = 'sms';
        } else if (sendMethod === 'both') {
          // Send to both if user has both email and phone
          if (user?.email && user?.phone) {
            await Promise.all([
              EmailService.sendOTPEmail(user.email, otp, type),
              SMSService.sendOTPSMS(user.phone, otp, type)
            ]);
            deliverySuccess = true;
            deliveryMethod = 'both';
          } else {
            throw new Error('User does not have both email and phone');
          }
        }
      } catch (deliveryError) {
        logger.error('OTP delivery failed:', deliveryError);
        
        // If primary method fails, try alternative
        if (!deliverySuccess && user) {
          try {
            if (sendMethod === 'email' && user.phone) {
              await SMSService.sendOTPSMS(user.phone, otp, type);
              deliverySuccess = true;
              deliveryMethod = 'sms (fallback)';
            } else if (sendMethod === 'sms' && user.email) {
              await EmailService.sendOTPEmail(user.email, otp, type);
              deliverySuccess = true;
              deliveryMethod = 'email (fallback)';
            }
          } catch (fallbackError) {
            logger.error('OTP fallback delivery failed:', fallbackError);
          }
        }
      }

      if (!deliverySuccess) {
        // Clean up stored OTP on delivery failure
        await RedisService.del(otpKey);
        
        return res.status(500).json({
          success: false,
          message: 'Failed to send OTP. Please try again.'
        });
      }

      // Update user's OTP info in database (if user exists)
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            otp,
            otpExpiry: expiryTime
          }
        });
      }

      // Log OTP sending
      logger.info(`OTP sent successfully: ${identifier} via ${deliveryMethod}`);

      res.status(200).json({
        success: true,
        message: `OTP sent successfully via ${deliveryMethod}`,
        data: {
          identifier: identifier.replace(/(.{2}).*(.{2})/, '$1***$2'), // Mask identifier
          expiresIn: 600, // seconds
          deliveryMethod,
          canResendAfter: 60 // seconds
        }
      });

    } catch (error) {
      logger.error('Send OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP'
      });
    }
  }

  // POST /otp/verify
  static async verifyOTP(req: Request, res: Response) {
    try {
      const { identifier, otp, type = 'verification' } = req.body;

      // Validate input
      if (!identifier || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Identifier and OTP are required'
        });
      }

      // Get OTP data from Redis
      const otpKey = `otp:${identifier}:${type}`;
      const otpData = await RedisService.get<OTPData>(otpKey);

      if (!otpData) {
        return res.status(400).json({
          success: false,
          message: 'OTP not found or expired. Please request a new one.'
        });
      }

      // Check if already verified
      if (otpData.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'OTP already used'
        });
      }

      // Check expiry
      if (new Date() > new Date(otpData.expiryTime)) {
        await RedisService.del(otpKey);
        return res.status(400).json({
          success: false,
          message: 'OTP expired. Please request a new one.'
        });
      }

      // Check attempt limit (max 5 attempts)
      if (otpData.attempts >= 5) {
        await RedisService.del(otpKey);
        return res.status(400).json({
          success: false,
          message: 'Too many failed attempts. Please request a new OTP.'
        });
      }

      // Verify OTP
      if (otpData.otp !== otp) {
        // Increment attempt count
        otpData.attempts += 1;
        await RedisService.set(otpKey, otpData, 600);

        return res.status(400).json({
          success: false,
          message: 'Invalid OTP',
          attemptsLeft: 5 - otpData.attempts
        });
      }

      // Mark as verified
      otpData.isVerified = true;
      await RedisService.set(otpKey, otpData, 600);

      // Update user verification status if applicable
      let user = null;
      if (type === 'verification') {
        const isEmail = isValidEmail(identifier);
        const isPhone = isValidPhoneNumber(identifier);

        user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: isEmail ? identifier : undefined },
              { phone: isPhone ? identifier : undefined }
            ]
          }
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              isVerified: true,
              otp: null,
              otpExpiry: null,
              ...(isEmail && { emailVerified: true }),
              ...(isPhone && { phoneVerified: true })
            }
          });

          // Award verification points
          await prisma.user.update({
            where: { id: user.id },
            data: {
              points: { increment: 25 } // Verification bonus
            }
          });
        }
      }

      // Log successful verification
      logger.info(`OTP verified successfully: ${identifier}`);

      res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        data: {
          verified: true,
          type,
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            isVerified: true
          } : null
        }
      });

    } catch (error) {
      logger.error('Verify OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify OTP'
      });
    }
  }

  // POST /otp/resend
  static async resendOTP(req: Request, res: Response) {
    try {
      const { identifier, type = 'verification' } = req.body;

      // Check if there's an existing OTP
      const otpKey = `otp:${identifier}:${type}`;
      const existingOTP = await RedisService.get<OTPData>(otpKey);

      if (!existingOTP) {
        return res.status(400).json({
          success: false,
          message: 'No active OTP found. Please request a new one.'
        });
      }

      // Check resend cooldown (60 seconds)
      const resendKey = `otp_resend:${identifier}`;
      const lastResendTime = await RedisService.get<number>(resendKey);
      
      if (lastResendTime) {
        const cooldownRemaining = 60 - Math.floor((Date.now() - lastResendTime) / 1000);
        if (cooldownRemaining > 0) {
          return res.status(429).json({
            success: false,
            message: `Please wait ${cooldownRemaining} seconds before requesting another OTP`,
            cooldownRemaining
          });
        }
      }

      // Generate new OTP
      const newOTP = generateOTP(6);
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000);

      // Update OTP data
      const updatedOTPData: OTPData = {
        otp: newOTP,
        expiryTime,
        attempts: 0,
        isVerified: false
      };

      await RedisService.set(otpKey, updatedOTPData, 600);
      await RedisService.set(resendKey, Date.now(), 60);

      // Send new OTP
      const isEmail = isValidEmail(identifier);
      const isPhone = isValidPhoneNumber(identifier);

      let deliverySuccess = false;
      let deliveryMethod = '';

      try {
        if (isEmail) {
          await EmailService.sendOTPEmail(identifier, newOTP, type);
          deliverySuccess = true;
          deliveryMethod = 'email';
        } else if (isPhone) {
          await SMSService.sendOTPSMS(identifier, newOTP, type);
          deliverySuccess = true;
          deliveryMethod = 'sms';
        }
      } catch (error) {
        logger.error('OTP resend failed:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to resend OTP'
        });
      }

      if (!deliverySuccess) {
        return res.status(500).json({
          success: false,
          message: 'Failed to resend OTP'
        });
      }

      logger.info(`OTP resent successfully: ${identifier} via ${deliveryMethod}`);

      res.status(200).json({
        success: true,
        message: `OTP sent successfully via ${deliveryMethod}`,
        data: {
          identifier: identifier.replace(/(.{2}).*(.{2})/, '$1***$2'),
          expiresIn: 600,
          deliveryMethod,
          canResendAfter: 60
        }
      });

    } catch (error) {
      logger.error('Resend OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend OTP'
      });
    }
  }

  // GET /otp/status
  static async getOTPStatus(req: Request, res: Response) {
    try {
      const { identifier, type = 'verification' } = req.query;

      if (!identifier) {
        return res.status(400).json({
          success: false,
          message: 'Identifier is required'
        });
      }

      const otpKey = `otp:${identifier}:${type}`;
      const otpData = await RedisService.get<OTPData>(otpKey);

      if (!otpData) {
        return res.status(200).json({
          success: true,
          data: {
            status: 'not_requested',
            message: 'No active OTP found'
          }
        });
      }

      const now = new Date();
      const expiryTime = new Date(otpData.expiryTime);
      const timeRemaining = Math.max(0, Math.floor((expiryTime.getTime() - now.getTime()) / 1000));

      let status = 'active';
      if (otpData.isVerified) {
        status = 'verified';
      } else if (timeRemaining <= 0) {
        status = 'expired';
      } else if (otpData.attempts >= 5) {
        status = 'blocked';
      }

      res.status(200).json({
        success: true,
        data: {
          status,
          timeRemaining,
          attemptsLeft: Math.max(0, 5 - otpData.attempts),
          isVerified: otpData.isVerified,
          canResend: timeRemaining > 0 && !otpData.isVerified
        }
      });

    } catch (error) {
      logger.error('Get OTP status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get OTP status'
      });
    }
  }

  // DELETE /otp/cancel
  static async cancelOTP(req: Request, res: Response) {
    try {
      const { identifier, type = 'verification' } = req.body;

      if (!identifier) {
        return res.status(400).json({
          success: false,
          message: 'Identifier is required'
        });
      }

      const otpKey = `otp:${identifier}:${type}`;
      const deleted = await RedisService.del(otpKey);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'No active OTP found to cancel'
        });
      }

      res.status(200).json({
        success: true,
        message: 'OTP cancelled successfully'
      });

    } catch (error) {
      logger.error('Cancel OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel OTP'
      });
    }
  }
}
