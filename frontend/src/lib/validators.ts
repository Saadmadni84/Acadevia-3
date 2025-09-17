// validators.ts - Form validation utilities for gamified learning platform

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  type?: 'error' | 'warning' | 'info';
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => ValidationResult;
}

// Base validation function
export const validate = (value: any, rules: ValidationRule): ValidationResult => {
  // Check required field
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return { isValid: false, message: 'This field is required', type: 'error' };
  }

  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: true };
  }

  // Check minimum length
  if (rules.minLength && value.length < rules.minLength) {
    return { 
      isValid: false, 
      message: `Must be at least ${rules.minLength} characters long`, 
      type: 'error' 
    };
  }

  // Check maximum length
  if (rules.maxLength && value.length > rules.maxLength) {
    return { 
      isValid: false, 
      message: `Must be no more than ${rules.maxLength} characters long`, 
      type: 'error' 
    };
  }

  // Check pattern
  if (rules.pattern && !rules.pattern.test(value)) {
    return { isValid: false, message: 'Invalid format', type: 'error' };
  }

  // Run custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return { isValid: true };
};

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!email || email.trim() === '') {
    return { isValid: false, message: 'Email is required', type: 'error' };
  }

  if (!emailPattern.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address', type: 'error' };
  }

  return { isValid: true };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: 'Password is required', type: 'error' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long', type: 'error' };
  }

  if (password.length > 128) {
    return { isValid: false, message: 'Password must be no more than 128 characters long', type: 'error' };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter', type: 'error' };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter', type: 'error' };
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number', type: 'error' };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character', type: 'error' };
  }

  return { isValid: true };
};

// Confirm password validation
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, message: 'Please confirm your password', type: 'error' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match', type: 'error' };
  }

  return { isValid: true };
};

// Username validation for learning platform
export const validateUsername = (username: string): ValidationResult => {
  if (!username || username.trim() === '') {
    return { isValid: false, message: 'Username is required', type: 'error' };
  }

  const trimmedUsername = username.trim();

  if (trimmedUsername.length < 3) {
    return { isValid: false, message: 'Username must be at least 3 characters long', type: 'error' };
  }

  if (trimmedUsername.length > 20) {
    return { isValid: false, message: 'Username must be no more than 20 characters long', type: 'error' };
  }

  // Allow letters, numbers, underscores, and hyphens
  const usernamePattern = /^[a-zA-Z0-9_-]+$/;
  if (!usernamePattern.test(trimmedUsername)) {
    return { 
      isValid: false, 
      message: 'Username can only contain letters, numbers, underscores, and hyphens', 
      type: 'error' 
    };
  }

  // Check for inappropriate words (basic filter)
  const inappropriateWords = ['admin', 'root', 'test', 'null', 'undefined'];
  if (inappropriateWords.some(word => trimmedUsername.toLowerCase().includes(word))) {
    return { isValid: false, message: 'This username is not allowed', type: 'error' };
  }

  return { isValid: true };
};

// Course name validation
export const validateCourseName = (courseName: string): ValidationResult => {
  if (!courseName || courseName.trim() === '') {
    return { isValid: false, message: 'Course name is required', type: 'error' };
  }

  const trimmedName = courseName.trim();

  if (trimmedName.length < 5) {
    return { isValid: false, message: 'Course name must be at least 5 characters long', type: 'error' };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, message: 'Course name must be no more than 100 characters long', type: 'error' };
  }

  return { isValid: true };
};

// Learning goal validation
export const validateLearningGoal = (goal: string): ValidationResult => {
  if (!goal || goal.trim() === '') {
    return { isValid: false, message: 'Learning goal is required', type: 'error' };
  }

  const trimmedGoal = goal.trim();

  if (trimmedGoal.length < 10) {
    return { isValid: false, message: 'Learning goal must be at least 10 characters long', type: 'error' };
  }

  if (trimmedGoal.length > 500) {
    return { isValid: false, message: 'Learning goal must be no more than 500 characters long', type: 'error' };
  }

  return { isValid: true };
};

// XP value validation
export const validateXP = (xp: number | string): ValidationResult => {
  const xpNumber = typeof xp === 'string' ? parseInt(xp, 10) : xp;

  if (isNaN(xpNumber)) {
    return { isValid: false, message: 'XP must be a valid number', type: 'error' };
  }

  if (xpNumber < 0) {
    return { isValid: false, message: 'XP cannot be negative', type: 'error' };
  }

  if (xpNumber > 1000000) {
    return { isValid: false, message: 'XP cannot exceed 1,000,000', type: 'error' };
  }

  return { isValid: true };
};

// Level validation
export const validateLevel = (level: number | string): ValidationResult => {
  const levelNumber = typeof level === 'string' ? parseInt(level, 10) : level;

  if (isNaN(levelNumber)) {
    return { isValid: false, message: 'Level must be a valid number', type: 'error' };
  }

  if (levelNumber < 1) {
    return { isValid: false, message: 'Level must be at least 1', type: 'error' };
  }

  if (levelNumber > 100) {
    return { isValid: false, message: 'Level cannot exceed 100', type: 'error' };
  }

  return { isValid: true };
};

// Quiz score validation
export const validateQuizScore = (score: number | string, maxScore: number = 100): ValidationResult => {
  const scoreNumber = typeof score === 'string' ? parseFloat(score) : score;

  if (isNaN(scoreNumber)) {
    return { isValid: false, message: 'Score must be a valid number', type: 'error' };
  }

  if (scoreNumber < 0) {
    return { isValid: false, message: 'Score cannot be negative', type: 'error' };
  }

  if (scoreNumber > maxScore) {
    return { isValid: false, message: `Score cannot exceed ${maxScore}`, type: 'error' };
  }

  return { isValid: true };
};

// Bio validation
export const validateBio = (bio: string): ValidationResult => {
  if (!bio) {
    return { isValid: true }; // Bio is optional
  }

  const trimmedBio = bio.trim();

  if (trimmedBio.length > 500) {
    return { isValid: false, message: 'Bio must be no more than 500 characters long', type: 'error' };
  }

  return { isValid: true };
};

// Age validation
export const validateAge = (age: number | string): ValidationResult => {
  const ageNumber = typeof age === 'string' ? parseInt(age, 10) : age;

  if (isNaN(ageNumber)) {
    return { isValid: false, message: 'Age must be a valid number', type: 'error' };
  }

  if (ageNumber < 13) {
    return { isValid: false, message: 'You must be at least 13 years old to use this platform', type: 'error' };
  }

  if (ageNumber > 120) {
    return { isValid: false, message: 'Please enter a valid age', type: 'error' };
  }

  return { isValid: true };
};

// URL validation
export const validateURL = (url: string): ValidationResult => {
  if (!url || url.trim() === '') {
    return { isValid: true }; // URL is optional in most cases
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, message: 'Please enter a valid URL', type: 'error' };
  }
};

// Phone number validation
export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return { isValid: true }; // Phone is usually optional
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length < 10) {
    return { isValid: false, message: 'Phone number must be at least 10 digits long', type: 'error' };
  }

  if (digitsOnly.length > 15) {
    return { isValid: false, message: 'Phone number must be no more than 15 digits long', type: 'error' };
  }

  return { isValid: true };
};

// Learning streak validation
export const validateLearningStreak = (streak: number | string): ValidationResult => {
  const streakNumber = typeof streak === 'string' ? parseInt(streak, 10) : streak;

  if (isNaN(streakNumber)) {
    return { isValid: false, message: 'Streak must be a valid number', type: 'error' };
  }

  if (streakNumber < 0) {
    return { isValid: false, message: 'Streak cannot be negative', type: 'error' };
  }

  if (streakNumber > 365) {
    return { isValid: false, message: 'Streak cannot exceed 365 days', type: 'error' };
  }

  return { isValid: true };
};

// Study time validation (in minutes)
export const validateStudyTime = (time: number | string): ValidationResult => {
  const timeNumber = typeof time === 'string' ? parseInt(time, 10) : time;

  if (isNaN(timeNumber)) {
    return { isValid: false, message: 'Study time must be a valid number', type: 'error' };
  }

  if (timeNumber < 0) {
    return { isValid: false, message: 'Study time cannot be negative', type: 'error' };
  }

  if (timeNumber > 1440) { // 24 hours in minutes
    return { isValid: false, message: 'Study time cannot exceed 24 hours per day', type: 'error' };
  }

  return { isValid: true };
};

// Subject selection validation
export const validateSubjectSelection = (subjects: string[]): ValidationResult => {
  if (!subjects || subjects.length === 0) {
    return { isValid: false, message: 'Please select at least one subject', type: 'error' };
  }

  if (subjects.length > 10) {
    return { isValid: false, message: 'You can select a maximum of 10 subjects', type: 'error' };
  }

  return { isValid: true };
};

// Difficulty level validation
export const validateDifficultyLevel = (difficulty: string): ValidationResult => {
  const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  
  if (!difficulty) {
    return { isValid: false, message: 'Difficulty level is required', type: 'error' };
  }

  if (!validLevels.includes(difficulty.toLowerCase())) {
    return { 
      isValid: false, 
      message: 'Difficulty level must be one of: beginner, intermediate, advanced, expert', 
      type: 'error' 
    };
  }

  return { isValid: true };
};

// Form validation helper
export const validateForm = (formData: Record<string, any>, validationRules: Record<string, ValidationRule>): Record<string, ValidationResult> => {
  const results: Record<string, ValidationResult> = {};

  for (const [field, rules] of Object.entries(validationRules)) {
    results[field] = validate(formData[field], rules);
  }

  return results;
};

// Check if form is valid
export const isFormValid = (validationResults: Record<string, ValidationResult>): boolean => {
  return Object.values(validationResults).every(result => result.isValid);
};

// Get first error message from validation results
export const getFirstError = (validationResults: Record<string, ValidationResult>): string | null => {
  for (const result of Object.values(validationResults)) {
    if (!result.isValid && result.message) {
      return result.message;
    }
  }
  return null;
};

// Export all validators as a collection
export const validators = {
  email: validateEmail,
  password: validatePassword,
  confirmPassword: validateConfirmPassword,
  username: validateUsername,
  courseName: validateCourseName,
  learningGoal: validateLearningGoal,
  xp: validateXP,
  level: validateLevel,
  quizScore: validateQuizScore,
  bio: validateBio,
  age: validateAge,
  url: validateURL,
  phoneNumber: validatePhoneNumber,
  learningStreak: validateLearningStreak,
  studyTime: validateStudyTime,
  subjectSelection: validateSubjectSelection,
  difficultyLevel: validateDifficultyLevel,
  form: validateForm,
  isFormValid,
  getFirstError,
};

export default validators;
