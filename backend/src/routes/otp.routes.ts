import { Router } from 'express';
import { OTPController } from '../controllers/otp.controller';
import { validateOTPSend, validateOTPVerify } from '../validations/otp.validation';
import { rateLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

// Rate limiting for OTP endpoints
const otpRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many OTP requests, please try again later'
});

// Apply rate limiting to all OTP routes
router.use(otpRateLimit);

router.post('/send', validateOTPSend, OTPController.sendOTP);
router.post('/verify', validateOTPVerify, OTPController.verifyOTP);
router.post('/resend', OTPController.resendOTP);
router.get('/status', OTPController.getOTPStatus);
router.delete('/cancel', OTPController.cancelOTP);

export default router;
