// src/utils/email.ts
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: Mail.Attachment[];
}

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email service (e.g., SendGrid, AWS SES)
    return nodemailer.createTransporter({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD,
      },
    });
  } else {
    // Development email service (e.g., Mailtrap)
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: Number(process.env.EMAIL_PORT) || 2525,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions: Mail.Options = {
    from: process.env.EMAIL_FROM || '"Your App" <noreply@yourapp.com>',
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    attachments: options.attachments,
  };

  await transporter.sendMail(mailOptions);
};

// Email templates
export const emailTemplates = {
  otpEmail: (otp: string) => ({
    subject: 'Your OTP Code',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #4CAF50; text-align: center; padding: 20px; background-color: #f5f5f5; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Your OTP Code</h1>
            <p>Use the following code to complete your verification:</p>
            <div class="otp-code">${otp}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        </body>
      </html>
    `,
    text: `Your OTP code is: ${otp}. This code will expire in 10 minutes.`,
  }),

  welcomeEmail: (username: string) => ({
    subject: 'Welcome to Our App!',
    html: `
      <h1>Welcome ${username}!</h1>
      <p>Thank you for joining us.</p>
    `,
  }),
};