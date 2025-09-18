'use client'

import React, { useState, useEffect } from 'react'
import { User, Camera, Save, X, Trophy, Star, BookOpen, Target } from 'lucide-react'
import Image from 'next/image'

interface UserProfile {
  id: string
  name: string
  email: string
  bio: string
  avatar: string
  level: number
  xp: number
  totalXp: number
  learningStreak: number
  preferredTopics: string[]
  learningGoals: string[]
  achievementBadges: string[]
  joinDate: string
}

interface ProfileFormProps {
  initialData?: Partial<UserProfile>
  onSave: (data: Partial<UserProfile>) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    email: '',
    bio: '',
    avatar: '',
    preferredTopics: [],
    learningGoals: [],
    ...initialData
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewAvatar, setPreviewAvatar] = useState<string>('')
  const [isDirty, setIsDirty] = useState(false)

  const availableTopics = [
    'Mathematics', 'Science', 'Programming', 'Languages', 'History',
    'Literature', 'Art', 'Music', 'Philosophy', 'Psychology'
  ]

  const learningGoalOptions = [
    'Complete 10 courses this year',
    'Maintain a 30-day learning streak',
    'Earn 5 skill badges',
    'Join study groups',
    'Master a new language',
    'Improve problem-solving skills'
  ]

  useEffect(() => {
    setPreviewAvatar(formData.avatar || '')
  }, [formData.avatar])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleTopicToggle = (topic: string) => {
    const currentTopics = formData.preferredTopics || []
    const updatedTopics = currentTopics.includes(topic)
      ? currentTopics.filter(t => t !== topic)
      : [...currentTopics, topic]
    
    handleInputChange('preferredTopics', updatedTopics)
  }

  const handleGoalToggle = (goal: string) => {
    const currentGoals = formData.learningGoals || []
    const updatedGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal]
    
    handleInputChange('learningGoals', updatedGoals)
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreviewAvatar(result)
        handleInputChange('avatar', result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await onSave(formData)
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
  }

  const getXpPercentage = () => {
    if (!initialData?.totalXp || !initialData?.xp) return 0
    return (initialData.xp / initialData.totalXp) * 100
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Profile Settings</h2>
        <p className="text-gray-600">Customize your learning profile and track your progress</p>
      </div>

      {initialData?.level && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <span className="text-sm font-medium">Level</span>
            </div>
            <div className="text-2xl font-bold">{initialData.level}</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              <span className="text-sm font-medium">XP</span>
            </div>
            <div className="text-2xl font-bold">{initialData.xp}</div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${getXpPercentage()}%` }}
              />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <span className="text-sm font-medium">Streak</span>
            </div>
            <div className="text-2xl font-bold">{initialData.learningStreak} days</div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium">Badges</span>
            </div>
            <div className="text-2xl font-bold">{initialData.achievementBadges?.length || 0}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
              {previewAvatar ? (
                <Image
                  src={previewAvatar}
                  alt="Profile avatar"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer transition-colors">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-sm text-gray-500">Click the camera icon to upload a new avatar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
              errors.bio ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Tell us about yourself and your learning journey..."
          />
          <div className="mt-1 flex justify-between text-sm text-gray-500">
            <span>{errors.bio || 'Share your interests and goals'}</span>
            <span>{formData.bio?.length || 0}/500</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preferred Learning Topics
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {availableTopics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handleTopicToggle(topic)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  formData.preferredTopics?.includes(topic)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Learning Goals
          </label>
          <div className="space-y-2">
            {learningGoalOptions.map((goal) => (
              <label key={goal} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.learningGoals?.includes(goal) || false}
                  onChange={() => handleGoalToggle(goal)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">{goal}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
          <button
            type="submit"
            disabled={isLoading || !isDirty}
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfileForm
