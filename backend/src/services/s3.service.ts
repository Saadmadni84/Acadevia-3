import AWS from 'aws-sdk';

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

interface UploadParams {
  buffer: Buffer;
  key: string;
  contentType: string;
  acl?: string;
}

export class S3Service {
  private static bucketName = process.env.AWS_S3_BUCKET!;

  static async uploadFile({ buffer, key, contentType, acl = 'public-read' }: UploadParams) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: acl as AWS.S3.ObjectCannedACL
      };

      const result = await s3.upload(params).promise();
      
      return {
        url: result.Location,
        key: result.Key,
        bucket: result.Bucket
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  static async deleteFile(key: string) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key
      };

      await s3.deleteObject(params).promise();
      return { success: true };
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  static async getPresignedUrl(key: string, contentType: string, expiresIn = 3600) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
        ACL: 'public-read',
        Expires: expiresIn
      };

      const url = await s3.getSignedUrlPromise('putObject', params);
      return url;
    } catch (error) {
      console.error('S3 presigned URL error:', error);
      throw new Error('Failed to generate presigned URL');
    }
  }

  static async initiateMultipartUpload(key: string, contentType: string) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
        ACL: 'public-read'
      };

      const result = await s3.createMultipartUpload(params).promise();
      return result;
    } catch (error) {
      console.error('S3 initiate multipart upload error:', error);
      throw new Error('Failed to initiate multipart upload');
    }
  }

  static async completeMultipartUpload(key: string, uploadId: string, parts: any[]) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts
        }
      };

      const result = await s3.completeMultipartUpload(params).promise();
      return result;
    } catch (error) {
      console.error('S3 complete multipart upload error:', error);
      throw new Error('Failed to complete multipart upload');
    }
  }

  static async listFiles(prefix?: string, maxKeys = 1000) {
    try {
      const params: AWS.S3.ListObjectsV2Request = {
        Bucket: this.bucketName,
        MaxKeys: maxKeys
      };

      if (prefix) {
        params.Prefix = prefix;
      }

      const result = await s3.listObjectsV2(params).promise();
      return result.Contents || [];
    } catch (error) {
      console.error('S3 list files error:', error);
      throw new Error('Failed to list files from S3');
    }
  }

  static async getFileMetadata(key: string) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key
      };

      const result = await s3.headObject(params).promise();
      return result;
    } catch (error) {
      console.error('S3 get file metadata error:', error);
      throw new Error('Failed to get file metadata from S3');
    }
  }
}
