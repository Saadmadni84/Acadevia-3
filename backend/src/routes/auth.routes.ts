import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateSignup, validateLogin } from '../validations/auth.validation';

const router = Router();

router.post('/signup', validateSignup, AuthController.signup);
router.post('/login', validateLogin, AuthController.login);
router.post('/send-otp', AuthController.sendOTP);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/resend-otp', AuthController.sendOTP);
router.post('/logout', AuthController.logout);
router.post('/refresh-token', AuthController.refreshToken);

export default router;
