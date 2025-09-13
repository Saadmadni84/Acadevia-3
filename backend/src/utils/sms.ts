// src/utils/sms.ts
import twilio from 'twilio';

interface SMSOptions {
  to: string;
  message: string;
}

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const sendSMS = async ({ to, message }: SMSOptions): Promise<void> => {
  try {
    await twilioClient.messages.create({
      body: message,
      to,
      from: process.env.TWILIO_PHONE_NUMBER!,
    });
    console.log(`SMS sent to ${to}`);
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw new Error('Failed to send SMS');
  }
};

// SMS templates
export const smsTemplates = {
  otpSMS: (otp: string) => 
    `Your verification code is: ${otp}. Valid for 10 minutes.`,
  
  welcomeSMS: (name: string) => 
    `Welcome to our app, ${name}! We're glad to have you.`,
  
  reminderSMS: (appointment: string) => 
    `Reminder: You have an appointment ${appointment}`,
};