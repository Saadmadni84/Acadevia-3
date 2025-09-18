import { Request, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../types/auth.types';
import { S3Service } from '../services/s3.service';
import prisma from '../config/database';

interface UploadedFile extends Express.Multer.File {
  location?: string;
  key?: string;
}

export class UploadController {
  // POST /upload/avatar
  static async uploadAvatar(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const file = req.file as UploadedFile;
      
      // Validate file type
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          message: 'Only image files are allowed for avatar'
        });
      }

      // Resize and compress image
      const resizedBuffer = await sharp(file.buffer)
        .resize(300, 300)
        .jpeg({ quality: 80 })
        .toBuffer();

      // Upload to S3
      const fileName = `avatars/${req.userId}/${uuidv4()}.jpg`;
      const uploadResult = await S3Service.uploadFile({
        buffer: resizedBuffer,
        key: fileName,
        contentType: 'image/jpeg'
      });

      // Update user avatar in database
      const user = await prisma.user.update({
        where: { id: req.userId! },
        data: { avatar: uploadResult.url },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true
        }
      });

      res.status(200).json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          url: uploadResult.url,
          user
        }
      });
    } catch (error) {
      console.error('Upload avatar error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload avatar'
      });
    }
  }

  // POST /upload/course-thumbnail
  static async uploadCourseThumbnail(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { courseId } = req.body;
      const file = req.file as UploadedFile;
      
      // Validate file type
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          message: 'Only image files are allowed for course thumbnail'
        });
      }

      // Verify course exists and user has permission
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
          instructorId: req.userId!
        }
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found or no permission'
        });
      }

      // Resize image for thumbnail (16:9 aspect ratio)
      const resizedBuffer = await sharp(file.buffer)
        .resize(640, 360)
        .jpeg({ quality: 85 })
        .toBuffer();

      // Upload to S3
      const fileName = `courses/${courseId}/thumbnail-${uuidv4()}.jpg`;
      const uploadResult = await S3Service.uploadFile({
        buffer: resizedBuffer,
        key: fileName,
        contentType: 'image/jpeg'
      });

      // Update course thumbnail in database
      const updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: { thumbnail: uploadResult.url },
        select: {
          id: true,
          title: true,
          thumbnail: true
        }
      });

      res.status(200).json({
        success: true,
        message: 'Course thumbnail uploaded successfully',
        data: {
          url: uploadResult.url,
          course: updatedCourse
        }
      });
    } catch (error) {
      console.error('Upload course thumbnail error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload course thumbnail'
      });
    }
  }

  // POST /upload/lecture-video
  static async uploadLectureVideo(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { lectureId, courseId } = req.body;
      const file = req.file as UploadedFile;
      
      // Validate file type
      if (!file.mimetype.startsWith('video/')) {
        return res.status(400).json({
          success: false,
          message: 'Only video files are allowed'
        });
      }

      // Validate file size (500MB max)
      if (file.size > 500 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'Video file size must be less than 500MB'
        });
      }

      // Verify lecture exists and user has permission
      const lecture = await prisma.lecture.findFirst({
        where: {
          id: lectureId,
          course: {
            id: courseId,
            instructorId: req.userId!
          }
        }
      });

      if (!lecture) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found or no permission'
        });
      }

      // Upload video to S3
      const fileName = `courses/${courseId}/lectures/${lectureId}/video-${uuidv4()}${path.extname(file.originalname)}`;
      const uploadResult = await S3Service.uploadFile({
        buffer: file.buffer,
        key: fileName,
        contentType: file.mimetype
      });

      // Update lecture video URL in database
      const updatedLecture = await prisma.lecture.update({
        where: { id: lectureId },
        data: { videoUrl: uploadResult.url },
        select: {
          id: true,
          title: true,
          videoUrl: true,
          course: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      res.status(200).json({
        success: true,
        message: 'Lecture video uploaded successfully',
        data: {
          url: uploadResult.url,
          lecture: updatedLecture
        }
      });
    } catch (error) {
      console.error('Upload lecture video error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload lecture video'
      });
    }
  }

  // POST /upload/lecture-thumbnail
  static async uploadLectureThumbnail(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { lectureId, courseId } = req.body;
      const file = req.file as UploadedFile;
      
      // Validate file type
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          message: 'Only image files are allowed for lecture thumbnail'
        });
      }

      // Verify lecture exists and user has permission
      const lecture = await prisma.lecture.findFirst({
        where: {
          id: lectureId,
          course: {
            id: courseId,
            instructorId: req.userId!
          }
        }
      });

      if (!lecture) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found or no permission'
        });
      }

      // Resize image for thumbnail
      const resizedBuffer = await sharp(file.buffer)
        .resize(480, 270)
        .jpeg({ quality: 80 })
        .toBuffer();

      // Upload to S3
      const fileName = `courses/${courseId}/lectures/${lectureId}/thumbnail-${uuidv4()}.jpg`;
      const uploadResult = await S3Service.uploadFile({
        buffer: resizedBuffer,
        key: fileName,
        contentType: 'image/jpeg'
      });

      // Update lecture thumbnail in database
      const updatedLecture = await prisma.lecture.update({
        where: { id: lectureId },
        data: { thumbnail: uploadResult.url },
        select: {
          id: true,
          title: true,
          thumbnail: true
        }
      });

      res.status(200).json({
        success: true,
        message: 'Lecture thumbnail uploaded successfully',
        data: {
          url: uploadResult.url,
          lecture: updatedLecture
        }
      });
    } catch (error) {
      console.error('Upload lecture thumbnail error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload lecture thumbnail'
      });
    }
  }

  // POST /upload/document
  static async uploadDocument(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { type, courseId, lectureId } = req.body;
      const file = req.file as UploadedFile;
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain'
      ];

      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'File type not allowed. Please upload PDF, DOC, DOCX, PPT, PPTX, or TXT files.'
        });
      }

      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'File size must be less than 50MB'
        });
      }

      let folderPath = `documents/${type}`;
      if (courseId) folderPath += `/${courseId}`;
      if (lectureId) folderPath += `/${lectureId}`;

      // Upload to S3
      const fileName = `${folderPath}/${uuidv4()}-${file.originalname}`;
      const uploadResult = await S3Service.uploadFile({
        buffer: file.buffer,
        key: fileName,
        contentType: file.mimetype
      });

      res.status(200).json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          url: uploadResult.url,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype
        }
      });
    } catch (error) {
      console.error('Upload document error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload document'
      });
    }
  }

  // POST /upload/multiple-images
  static async uploadMultipleImages(req: AuthRequest, res: Response) {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const files = req.files as UploadedFile[];
      const { type, courseId } = req.body;

      // Validate file count (max 10 images)
      if (files.length > 10) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 10 images allowed'
        });
      }

      const uploadPromises = files.map(async (file) => {
        // Validate file type
        if (!file.mimetype.startsWith('image/')) {
          throw new Error(`Invalid file type: ${file.originalname}`);
        }

        // Resize and compress image
        const resizedBuffer = await sharp(file.buffer)
          .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();

        // Upload to S3
        const fileName = `images/${type}/${courseId || 'general'}/${uuidv4()}.jpg`;
        const uploadResult = await S3Service.uploadFile({
          buffer: resizedBuffer,
          key: fileName,
          contentType: 'image/jpeg'
        });

        return {
          originalName: file.originalname,
          url: uploadResult.url,
          size: resizedBuffer.length
        };
      });

      const uploadResults = await Promise.all(uploadPromises);

      res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        data: {
          images: uploadResults,
          count: uploadResults.length
        }
      });
    } catch (error) {
      console.error('Upload multiple images error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload images'
      });
    }
  }

  // DELETE /upload/:key
  static async deleteFile(req: AuthRequest, res: Response) {
    try {
      const { key } = req.params;
      
      if (!key) {
        return res.status(400).json({
          success: false,
          message: 'File key is required'
        });
      }

      // Delete from S3
      await S3Service.deleteFile(key);

      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete file'
      });
    }
  }

  // GET /upload/presigned-url
  static async getPresignedUrl(req: AuthRequest, res: Response) {
    try {
      const { fileName, contentType, folder = 'uploads' } = req.query;

      if (!fileName || !contentType) {
        return res.status(400).json({
          success: false,
          message: 'fileName and contentType are required'
        });
      }

      const key = `${folder}/${req.userId}/${uuidv4()}-${fileName}`;
      const presignedUrl = await S3Service.getPresignedUrl(key as string, contentType as string);

      res.status(200).json({
        success: true,
        data: {
          presignedUrl,
          key,
          expiresIn: 3600 // 1 hour
        }
      });
    } catch (error) {
      console.error('Get presigned URL error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate presigned URL'
      });
    }
  }

  // POST /upload/complete-multipart
  static async completeMultipartUpload(req: AuthRequest, res: Response) {
    try {
      const { key, uploadId, parts } = req.body;

      if (!key || !uploadId || !parts) {
        return res.status(400).json({
          success: false,
          message: 'key, uploadId, and parts are required'
        });
      }

      const result = await S3Service.completeMultipartUpload(key, uploadId, parts);

      res.status(200).json({
        success: true,
        message: 'Multipart upload completed successfully',
        data: {
          url: result.Location,
          key: result.Key
        }
      });
    } catch (error) {
      console.error('Complete multipart upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete multipart upload'
      });
    }
  }
}
