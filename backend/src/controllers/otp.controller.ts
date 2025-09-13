// src/controllers/otpController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/database';
import { sendEmail, emailTemplates } from '../utils/email';
import { sendSMS, smsTemplates } from '../utils/sms';
import { generateOTP } from '../utils/helpers';
import { isValidEmail, isValidPhone } from '../utils/validation';
import logger from '../utils/logger';

export const sendOTPEmail = async (req: Request, res: Response) => {
  try {
    const { email, purpose = 'verification' } = req.body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Send email using template
    await sendEmail({
      to: email,
      ...emailTemplates.otpEmail(otp),
    });

    logger.info(`OTP sent to email: ${email}`);
    
    // Rest of your code...
  } catch (error) {
    logger.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};