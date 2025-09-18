import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const otpSendSchema = Joi.object({
  identifier: Joi.string().required(),
  type: Joi.string().valid('verification', 'login', 'password_reset', 'phone_verification').default('verification'),
  method: Joi.string().valid('email', 'sms', 'both', 'auto').default('auto')
});

const otpVerifySchema = Joi.object({
  identifier: Joi.string().required(),
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
  type: Joi.string().valid('verification', 'login', 'password_reset', 'phone_verification').default('verification')
});

export const validateOTPSend = (req: Request, res: Response, next: NextFunction) => {
  const { error } = otpSendSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details[0].message
    });
  }
  
  next();
};

export const validateOTPVerify = (req: Request, res: Response, next: NextFunction) => {
  const { error } = otpVerifySchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details[0].message
    });
  }
  
  next();
};
