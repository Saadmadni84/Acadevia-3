'use client'

<<<<<<< HEAD
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { 
  User, 
  Phone, 
  Mail, 
  GraduationCap, 
  Users, 
  BookOpen,
  Loader2,
  ChevronRight 
} from 'lucide-react';
import {authApi} from '@/app/api/auth/send-otp/route';
// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().regex(/^[+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  userType: z.enum(['student', 'parent', 'teacher']),
  grade: z.string().optional(),
  parentPhone: z.string().optional(),
  subject: z.string().optional(),
});
=======
import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
>>>>>>> e59b87da ("initial")

interface RegisterFormProps {
  onSuccess: () => void
  onSwitchToLogin?: () => void
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
<<<<<<< HEAD
      setIsLoading(true);
      
      // Register user
      await authApi.register(data);
      
      // Send OTP
      await authApi.sendOTP(data.phoneNumber, data.userType);
      
      toast.success('Registration successful! Please verify OTP');
      
      // Redirect to OTP verification with phone number
      router.push(`/auth/verify-otp?phone=${data.phoneNumber}&userType=${data.userType}`);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
=======
      // Mock API call - replace with your actual registration
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log('Registration successful:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      })

      // Call success callback to close dialog
      onSuccess()
    } catch (error) {
      setErrors({ general: 'Registration failed. Please try again.' })
>>>>>>> e59b87da ("initial")
    } finally {
      setIsLoading(false)
    }
  }

  return (
<<<<<<< HEAD
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full mx-auto"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  i <= step
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {i}
              </div>
            ))}
=======
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{errors.general}</p>
>>>>>>> e59b87da ("initial")
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              placeholder="First name"
              className={errors.firstName ? 'border-red-500' : ''}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              placeholder="Last name"
              className={errors.lastName ? 'border-red-500' : ''}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="register-email">Email Address</Label>
          <Input
            id="register-email"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder="Enter your email"
            className={errors.email ? 'border-red-500' : ''}
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

<<<<<<< HEAD
              <div className="space-y-4">
                {userTypes.map((type) => (
                  <motion.button
                    key={type.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedUserType(type.value);
                      setValue('userType', type.value as any);
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      selectedUserType === type.value
                        ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20`
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg bg-${type.color}-100 dark:bg-${type.color}-900/40`}>
                        <type.icon className={`w-6 h-6 text-${type.color}-600`} />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="font-semibold">{type.label}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {type.value === 'student' && 'Learn and earn rewards'}
                          {type.value === 'parent' && 'Track your child\'s progress'}
                          {type.value === 'teacher' && 'Create and manage courses'}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
=======
        {/* Password */}
        <div>
          <Label htmlFor="register-password">Password</Label>
          <Input
            id="register-password"
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            placeholder="Create a password"
            className={errors.password ? 'border-red-500' : ''}
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>
>>>>>>> e59b87da ("initial")

        {/* Confirm Password */}
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            placeholder="Confirm your password"
            className={errors.confirmPassword ? 'border-red-500' : ''}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>

        {onSwitchToLogin && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in here
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  )
}
