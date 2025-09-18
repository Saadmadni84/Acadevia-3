import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { uploadMiddleware } from '../middlewares/upload.middleware';

const router = Router();

// All upload routes require authentication
router.use(authenticateToken);

// Single file uploads
router.post('/avatar', 
  uploadMiddleware.single('avatar'), 
  UploadController.uploadAvatar
);

router.post('/course-thumbnail', 
  uploadMiddleware.single('thumbnail'), 
  UploadController.uploadCourseThumbnail
);

router.post('/lecture-video', 
  uploadMiddleware.single('video'), 
  UploadController.uploadLectureVideo
);

router.post('/lecture-thumbnail', 
  uploadMiddleware.single('thumbnail'), 
  UploadController.uploadLectureThumbnail
);

router.post('/document', 
  uploadMiddleware.single('document'), 
  UploadController.uploadDocument
);

// Multiple file uploads
router.post('/multiple-images', 
  uploadMiddleware.array('images', 10), 
  UploadController.uploadMultipleImages
);

// File management
router.delete('/:key', UploadController.deleteFile);
router.get('/presigned-url', UploadController.getPresignedUrl);
router.post('/complete-multipart', UploadController.completeMultipartUpload);

export default router;
