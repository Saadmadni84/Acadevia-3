import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { loginSchema, registerSchema } from '../validations/auth.validation';
import {
  sendOTPEmail,
  sendOTPSMS,
  verifyOTP,
  resendOTP,
  validateResetOTP,
} from '../controllers/otpController';


const router = Router();
router.post('/send-email', sendOTPEmail);
router.post('/send-sms', sendOTPSMS);
router.post('/verify', verifyOTP);
router.post('/resend', resendOTP);
router.post('/validate-reset', validateResetOTP);


router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.post('/refresh-token', authMiddleware, authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
