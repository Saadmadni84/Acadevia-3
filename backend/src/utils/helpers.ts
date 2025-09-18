// utils/helpers.ts

/**
 * Generate a 6-digit OTP (One-Time Password)
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Validate email address format using regex
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // RFC 5322 compliant email regex (simplified but robust)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email.trim());
};

/**
 * Validate phone number format (international format with country code)
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // International phone number format: +[country code][number]
  // Length: 7-15 digits after country code
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  
  return phoneRegex.test(phone.trim());
};

/**
 * Format phone number to international format
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Add + prefix if not present and number looks international
  if (digits.length > 10 && !phone.startsWith('+')) {
    return '+' + digits;
  }
  
  return phone;
};

/**
 * Generate random string for tokens
 */
export const generateRandomString = (length: number = 32): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

/**
 * Generate secure verification token
 */
export const generateVerificationToken = (): string => {
  return generateRandomString(64);
};

/**
 * Validate password strength for gamified learning platform
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;
  
  if (!password) {
    return {
      isValid: false,
      score: 0,
      feedback: ['Password is required']
    };
  }
  
  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password must be at least 8 characters long');
  }
  
  // Contains lowercase
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one lowercase letter');
  }
  
  // Contains uppercase
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one uppercase letter');
  }
  
  // Contains number
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one number');
  }
  
  // Contains special character
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one special character');
  }
  
  return {
    isValid: score >= 3, // At least 3 criteria met
    score,
    feedback
  };
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .substring(0, 1000); // Limit length
};

/**
 * Generate username suggestions from name
 */
export const generateUsernameFromName = (name: string): string[] => {
  if (!name) return [];
  
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const suggestions: string[] = [];
  
  // Basic username
  suggestions.push(cleanName);
  
  // With numbers
  for (let i = 1; i <= 5; i++) {
    suggestions.push(`${cleanName}${Math.floor(Math.random() * 1000)}`);
  }
  
  // With year
  const currentYear = new Date().getFullYear();
  suggestions.push(`${cleanName}${currentYear}`);
  
  return suggestions.slice(0, 5); // Return top 5 suggestions
};

/**
 * Calculate learning streak bonus points
 */
export const calculateStreakBonus = (currentStreak: number): number => {
  if (currentStreak < 3) return 0;
  if (currentStreak < 7) return 5;
  if (currentStreak < 30) return 10;
  if (currentStreak < 90) return 25;
  return 50; // 90+ day streak
};

/**
 * Format duration in minutes to human readable format
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}m` 
      : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0 
    ? `${days}d ${remainingHours}h` 
    : `${days}d`;
};

/**
 * Convert points to level (gamification)
 */
export const pointsToLevel = (points: number): number => {
  return Math.floor(Math.sqrt(points / 100)) + 1;
};

/**
 * Calculate points needed for next level
 */
export const pointsNeededForNextLevel = (currentPoints: number): number => {
  const currentLevel = pointsToLevel(currentPoints);
  const pointsForNextLevel = Math.pow(currentLevel, 2) * 100;
  return pointsForNextLevel - currentPoints;
};

/**
 * Generate achievement slug from name
 */
export const generateAchievementSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

