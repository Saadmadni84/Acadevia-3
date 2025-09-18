import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import courseRoutes from './course.routes';
import paymentRoutes from './payment.routes';
import uploadRoutes from './upload.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/courses', courseRoutes);
router.use('/payments', paymentRoutes);
router.use('/upload', uploadRoutes);

export default router;
