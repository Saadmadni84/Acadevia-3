// services/email.service.ts
import nodemailer from 'nodemailer';

// Email interfaces for type safety
export interface EmailData {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface WelcomeEmailData {
  email: string;
  name: string;
  loginUrl?: string;
}

export interface PasswordResetData {
  email: string;
  name: string;
  resetUrl: string;
  expiryTime?: string;
}

export interface AchievementEmailData {
  email: string;
  name: string;
  achievementName: string;
  badgeUrl?: string;
  points: number;
}

export interface CourseCompletionData {
  email: string;
  name: string;
  courseName: string;
  certificateUrl?: string;
  completionDate: string;
}

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Generic email sending function
export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: emailData.from || process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Welcome email for new users
export const sendWelcomeEmail = async (data: WelcomeEmailData): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome to Our Learning Platform! 🎉</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f8f9fa;">
        <h2 style="color: #333;">Hello ${data.name}!</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Welcome to our gamified learning platform! We're excited to have you join our community of learners.
        </p>
        
        <p style="color: #666; line-height: 1.6;">
          Get ready to:
        </p>
        
        <ul style="color: #666; line-height: 1.8;">
          <li>📚 Access interactive courses</li>
          <li>🏆 Earn achievements and badges</li>
          <li>⭐ Collect points and level up</li>
          <li>🤝 Connect with fellow learners</li>
        </ul>
        
        ${data.loginUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.loginUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold;">
              Start Learning Now
            </a>
          </div>
        ` : ''}
        
        <p style="color: #666; margin-top: 30px;">
          Happy learning!<br>
          The Learning Platform Team
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: data.email,
    subject: '🎉 Welcome to Our Learning Platform!',
    html,
  });
};

// Password reset email
export const sendPasswordResetEmail = async (data: PasswordResetData): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f56565; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Password Reset Request 🔐</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f8f9fa;">
        <h2 style="color: #333;">Hello ${data.name},</h2>
        
        <p style="color: #666; line-height: 1.6;">
          We received a request to reset your password. Click the button below to create a new password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resetUrl}" 
             style="background: #f56565; 
                    color: white; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 25px; 
                    font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        ${data.expiryTime ? `
          <p style="color: #e53e3e; text-align: center; font-size: 14px;">
            This link will expire in ${data.expiryTime}
          </p>
        ` : ''}
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          If you didn't request this password reset, please ignore this email or contact support if you have concerns.
        </p>
        
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          For security reasons, this link can only be used once.
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: data.email,
    subject: '🔐 Password Reset Request',
    html,
  });
};

// Achievement unlock email
export const sendAchievementEmail = async (data: AchievementEmailData): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%); padding: 20px; text-align: center;">
        <h1 style="color: #333; margin: 0;">🏆 Achievement Unlocked! 🏆</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f8f9fa; text-align: center;">
        <h2 style="color: #333;">Congratulations ${data.name}!</h2>
        
        ${data.badgeUrl ? `
          <div style="margin: 20px 0;">
            <img src="${data.badgeUrl}" alt="Achievement Badge" style="max-width: 120px; height: auto;">
          </div>
        ` : ''}
        
        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h3 style="color: #333; margin: 0 0 10px 0;">${data.achievementName}</h3>
          <p style="color: #ffd700; font-size: 24px; font-weight: bold; margin: 0;">+${data.points} Points!</p>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          You've earned this achievement through your dedication and hard work. Keep up the excellent progress!
        </p>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%); 
                    color: #333; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 25px; 
                    font-weight: bold;">
            View Dashboard
          </a>
        </div>
      </div>
    </div>
  `;

  return await sendEmail({
    to: data.email,
    subject: `🏆 Achievement Unlocked: ${data.achievementName}`,
    html,
  });
};

// Course completion email
export const sendCourseCompletionEmail = async (data: CourseCompletionData): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">🎓 Course Completed! 🎓</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f8f9fa;">
        <h2 style="color: #333;">Excellent work, ${data.name}!</h2>
        
        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h3 style="color: #48bb78; margin: 0 0 10px 0;">📚 ${data.courseName}</h3>
          <p style="color: #666; margin: 0;">Completed on ${data.completionDate}</p>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          Congratulations on completing this course! Your commitment to learning is truly inspiring.
        </p>
        
        ${data.certificateUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.certificateUrl}" 
               style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold;">
              Download Certificate
            </a>
          </div>
        ` : ''}
        
        <p style="color: #666; margin-top: 30px;">
          Ready for your next challenge? Explore more courses on your dashboard!
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: data.email,
    subject: `🎓 Congratulations! You completed ${data.courseName}`,
    html,
  });
};

// Utility function to validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
