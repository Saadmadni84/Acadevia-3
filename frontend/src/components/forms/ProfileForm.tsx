'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProfileFormProps {
  onSuccess: () => void
  onCancel?: () => void
}

export default function ProfileForm({ onSuccess, onCancel }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    dateOfBirth: '',
    location: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
      newErrors.email = 'Email is invalid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
    // Clear error for this field when user starts typing
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock successful update
      console.log('Profile updated successfully:', formData)
      
      // Call onSuccess callback to close dialog
      onSuccess()
    } catch (error) {
      console.error('Profile update failed:', error)
      // Handle error (you could set an error state here)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
            placeholder="Enter your first name"
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
            placeholder="Enter your last name"
            className={errors.lastName ? 'border-red-500' : ''}
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          placeholder="Enter your email address"
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange('phone')}
          placeholder="Enter your phone number"
        />
      </div>

      {/* Date of Birth */}
      <div>
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleInputChange('dateOfBirth')}
        />
      </div>

      {/* Location */}
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          type="text"
          value={formData.location}
          onChange={handleInputChange('location')}
          placeholder="Enter your location"
        />
      </div>

      {/* Bio */}
      <div>
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          value={formData.bio}
          onChange={handleInputChange('bio')}
          placeholder="Tell us about yourself..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            'Save Profile'
          )}
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        * Required fields
      </p>
    </form>
  )
}
