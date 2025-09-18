// services/sms.service.ts
import twilio from 'twilio';

// SMS interfaces for type safety
export interface SMSData {
  to: string | string[];
  message: string;
  from?: string;
}

export interface WelcomeSMSData {
  phoneNumber: string;
  name: string;
  loginCode?: string;
}

export interface VerificationSMSData {
  phoneNumber: string;
  verificationCode: string;
  expiryMinutes?: number;
}

export interface AchievementSMSData {
  phoneNumber: string;
  name: string;
  achievementName: string;
  points: number;
}

export interface CourseReminderData {
  phoneNumber: string;
  name: string;
  courseName: string;
  reminderType: 'start' | 'continue' | 'deadline';
}

// Create Twilio client
const createTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials are not configured');
  }
  
  return twilio(accountSid, authToken);
};

// Generic SMS sending function
export const sendSMS = async (smsData: SMSData): Promise<boolean> => {
  try {
    const client = createTwilioClient();
    
    const recipients = Array.isArray(smsData.to) ? smsData.to : [smsData.to];
    
    for (const recipient of recipients) {
      const messageOptions = {
        body: smsData.message,
        from: smsData.from || process.env.TWILIO_PHONE_NUMBER,
        to: recipient,
      };

      const message = await client.messages.create(messageOptions);
      console.log(`SMS sent successfully to ${recipient}. SID: ${message.sid}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

// Welcome SMS for new users
export const sendWelcomeSMS = async (data: WelcomeSMSData): Promise<boolean> => {
  const message = `🎉 Welcome to our Learning Platform, ${data.name}! 
Start your learning journey and earn points, badges, and achievements. 
${data.loginCode ? `Your login code: ${data.loginCode}` : ''}
Happy learning! 📚✨`;

  return await sendSMS({
    to: data.phoneNumber,
    message: message.trim(),
  });
};

// Phone verification SMS
export const sendVerificationSMS = async (data: VerificationSMSData): Promise<boolean> => {
  const expiryText = data.expiryMinutes ? ` (expires in ${data.expiryMinutes} minutes)` : '';
  const message = `🔐 Your verification code for Learning Platform: ${data.verificationCode}${expiryText}
Please do not share this code with anyone.`;

  return await sendSMS({
    to: data.phoneNumber,
    message,
  });
};

// Achievement notification SMS
export const sendAchievementSMS = async (data: AchievementSMSData): Promise<boolean> => {
  const message = `🏆 Congrats ${data.name}! You've unlocked: "${data.achievementName}"
+${data.points} points earned! 🎯
Keep up the great work! 💪`;

  return await sendSMS({
    to: data.phoneNumber,
    message,
  });
};

// Course reminder SMS
export const sendCourseReminderSMS = async (data: CourseReminderData): Promise<boolean> => {
  let message = '';
  
  switch (data.reminderType) {
    case 'start':
      message = `📚 Hi ${data.name}! Ready to start "${data.courseName}"? 
Your learning adventure awaits! 🚀`;
      break;
    case 'continue':
      message = `⏰ Hey ${data.name}! Don't forget to continue "${data.courseName}"
You're doing great - keep the momentum going! 💪`;
      break;
    case 'deadline':
      message = `⚡ Reminder for ${data.name}: "${data.courseName}" deadline approaching! 
Finish strong and earn those points! 🎯`;
      break;
  }

  return await sendSMS({
    to: data.phoneNumber,
    message,
  });
};

// Bulk SMS for announcements
export const sendBulkSMS = async (
  phoneNumbers: string[], 
  message: string
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;
  
  for (const phoneNumber of phoneNumbers) {
    const result = await sendSMS({
      to: phoneNumber,
      message,
    });
    
    if (result) {
      success++;
    } else {
      failed++;
    }
    
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return { success, failed };
};

// Utility functions
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Add + prefix if not present and number looks like international format
  if (digits.length > 10 && !phoneNumber.startsWith('+')) {
    return '+' + digits;
  }
  
  return phoneNumber;
};

export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  // Basic validation for international phone numbers
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(formatPhoneNumber(phoneNumber));
};

// Alternative SMS service using a different provider (if needed)
export const sendSMSAlternative = async (smsData: SMSData): Promise<boolean> => {
  try {
    // Example with a REST API SMS provider
    const response = await fetch(`${process.env.SMS_API_URL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SMS_API_TOKEN}`,
      },
      body: JSON.stringify({
        to: smsData.to,
        message: smsData.message,
        from: smsData.from || process.env.SMS_FROM_NUMBER,
      }),
    });
    
    if (response.ok) {
      console.log('SMS sent successfully via alternative service');
      return true;
    } else {
      console.error('Failed to send SMS via alternative service');
      return false;
    }
  } catch (error) {
    console.error('Error with alternative SMS service:', error);
    return false;
  }
};
