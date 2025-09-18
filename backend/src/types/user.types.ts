// types/user.types.ts
export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  isVerified: boolean; // Add this property
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  role: 'student' | 'instructor' | 'admin';
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
  };
  gameProfile: {
    level: number;
    experience: number;
    points: number;
    badges: string[];
    achievements: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Or if using a class-based approach
export class UserEntity {
  id: string;
  email: string;
  username: string;
  isVerified: boolean = false; // Default to false
  // ... other properties
}
