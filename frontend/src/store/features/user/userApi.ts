import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from 'src/store/store'; //

// User interfaces for the learning platform
export interface IUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  role: 'student' | 'instructor' | 'admin';
  // Gamification properties
  level: number;
  xp: number;
  totalXP: number;
  badges: IBadge[];
  achievements: IAchievement[];
  learningStreak: number;
  lastLoginDate: string;
  // Learning preferences
  learningGoals?: string;
  preferredSubjects: string[];
  difficultyPreference: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  studyTimeGoal: number; // minutes per day
  // Progress tracking
  coursesEnrolled: string[];
  coursesCompleted: string[];
  totalStudyTime: number; // in minutes
  createdAt: string;
  updatedAt: string;
}

export interface IBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earnedAt: string;
}

export interface IAchievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  unlockedAt: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  preferredSubjects: string[];
}

export interface IUpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  learningGoals?: string;
  preferredSubjects?: string[];
  difficultyPreference?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  studyTimeGoal?: number;
}

export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface IGenericResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  user: IUser;
  token: string;
  refreshToken: string;
}

export interface IProgressUpdate {
  courseId: string;
  lessonId: string;
  xpEarned: number;
  timeSpent: number;
  completed: boolean;
}

export interface ILeaderboardEntry {
  user: Pick<IUser, 'id' | 'username' | 'avatar' | 'level' | 'xp'>;
  rank: number;
}

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// RTK Query API definition
export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/users`,
    prepareHeaders: (headers, { getState }) => {
      // ✅ Fix: Change from user.token to auth.token
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['User', 'Profile', 'Badges', 'Achievements', 'Leaderboard'],
  endpoints: (builder) => ({
    // Authentication endpoints
    login: builder.mutation<IAuthResponse, ILoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),

    register: builder.mutation<IAuthResponse, IRegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),

    logout: builder.mutation<IGenericResponse, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Profile', 'Badges', 'Achievements'],
    }),

    refreshToken: builder.mutation<{ token: string; refreshToken: string }, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
    }),

    // Profile management
    getCurrentUser: builder.query<IUser, void>({
      query: () => '/profile',
      providesTags: ['User', 'Profile'],
    }),

    updateProfile: builder.mutation<IUser, IUpdateProfileRequest>({
      query: (updateData) => ({
        url: '/profile',
        method: 'PATCH',
        body: updateData,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),

    changePassword: builder.mutation<IGenericResponse, IChangePasswordRequest>({
      query: (passwordData) => ({
        url: '/profile/change-password',
        method: 'POST',
        body: passwordData,
      }),
    }),

    uploadAvatar: builder.mutation<{ avatarUrl: string }, FormData>({
      query: (formData) => ({
        url: '/profile/avatar',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),

    // Gamification endpoints
    updateProgress: builder.mutation<{ user: IUser; newBadges: IBadge[]; newAchievements: IAchievement[] }, IProgressUpdate>({
      query: (progressData) => ({
        url: '/progress',
        method: 'POST',
        body: progressData,
      }),
      invalidatesTags: ['User', 'Profile', 'Badges', 'Achievements'],
    }),

    getUserBadges: builder.query<IBadge[], string>({
      query: (userId) => `/badges/${userId}`,
      providesTags: ['Badges'],
    }),

    getUserAchievements: builder.query<IAchievement[], string>({
      query: (userId) => `/achievements/${userId}`,
      providesTags: ['Achievements'],
    }),

    // Leaderboard endpoints
    getGlobalLeaderboard: builder.query<ILeaderboardEntry[], { limit?: number; offset?: number }>({
      query: ({ limit = 50, offset = 0 }) => `/leaderboard/global?limit=${limit}&offset=${offset}`,
      providesTags: ['Leaderboard'],
    }),

    getSubjectLeaderboard: builder.query<ILeaderboardEntry[], { subject: string; limit?: number; offset?: number }>({
      query: ({ subject, limit = 50, offset = 0 }) => `/leaderboard/subject/${subject}?limit=${limit}&offset=${offset}`,
      providesTags: ['Leaderboard'],
    }),

    getFriendsLeaderboard: builder.query<ILeaderboardEntry[], string>({
      query: (userId) => `/leaderboard/friends/${userId}`,
      providesTags: ['Leaderboard'],
    }),

    // User statistics
    getUserStats: builder.query<{
      totalStudyTime: number;
      coursesCompleted: number;
      currentStreak: number;
      averageScore: number;
      weeklyProgress: number[];
      subjectProgress: Record<string, number>;
    }, string>({
      query: (userId) => `/stats/${userId}`,
      providesTags: ['Profile'],
    }),

    // Social features
    searchUsers: builder.query<Pick<IUser, 'id' | 'username' | 'avatar' | 'level'>[], { query: string; limit?: number }>({
      query: ({ query, limit = 20 }) => `/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    }),

    followUser: builder.mutation<IGenericResponse, string>({
      query: (userId) => ({
        url: `/follow/${userId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Profile'],
    }),

    unfollowUser: builder.mutation<IGenericResponse, string>({
      query: (userId) => ({
        url: `/follow/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Profile'],
    }),

    // Account management
    deleteAccount: builder.mutation<IGenericResponse, { password: string }>({
      query: ({ password }) => ({
        url: '/account',
        method: 'DELETE',
        body: { password },
      }),
    }),

    requestPasswordReset: builder.mutation<IGenericResponse, { email: string }>({
      query: ({ email }) => ({
        url: '/auth/reset-password-request',
        method: 'POST',
        body: { email },
      }),
    }),

    resetPassword: builder.mutation<IGenericResponse, { token: string; newPassword: string }>({
      query: ({ token, newPassword }) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: { token, newPassword },
      }),
    }),
  }),
});

// Export hooks for usage in components
export const {
  // Authentication
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  // Profile
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
  // Gamification
  useUpdateProgressMutation,
  useGetUserBadgesQuery,
  useGetUserAchievementsQuery,
  // Leaderboard
  useGetGlobalLeaderboardQuery,
  useGetSubjectLeaderboardQuery,
  useGetFriendsLeaderboardQuery,
  // Stats
  useGetUserStatsQuery,
  // Social
  useSearchUsersQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  // Account
  useDeleteAccountMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
} = userApi;
