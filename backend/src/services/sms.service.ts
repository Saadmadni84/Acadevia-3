import twilio from 'twilio';
import { config } from '../config/env';

const client = twilio(config.twilio.accountSid, config.twilio.authToken);

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (phoneNumber: string, otp: string): Promise<void> => {
  try {
    await client.messages.create({
      body: `Your verification code is: ${otp}. This code will expire in 5 minutes.`,
      from: config.twilio.phoneNumber,
      to: phoneNumber,
    });
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw new Error('Failed to send SMS');
  }
};

export const sendNotification = async (phoneNumber: string, message: string): Promise<void> => {
  try {
    await client.messages.create({
      body: message,
      from: config.twilio.phoneNumber,
      to: phoneNumber,
    });
  } catch (error) {
    console.error('SMS notification failed:', error);
    throw new Error('Failed to send notification');
  }
};
