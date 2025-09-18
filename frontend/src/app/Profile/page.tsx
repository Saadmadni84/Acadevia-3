'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import ProfileForm from '@/components/forms/ProfileForm'

const ProfilePage = () => {
  const router = useRouter()

  const mockUserData = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Passionate learner exploring new technologies and gamified learning experiences.',
    avatar: '',
    level: 8,
    xp: 1750,
    totalXp: 2000,
    learningStreak: 12,
    preferredTopics: ['Programming', 'Mathematics', 'Science'],
    learningGoals: ['Complete 10 courses this year', 'Maintain a 30-day learning streak', 'Earn 5 skill badges'],
    achievementBadges: ['First Course', 'Quick Learner', 'Streak Master', 'Problem Solver'],
    joinDate: '2024-01-15'
  }

  const handleSaveProfile = async (data: any) => {
    try {
      console.log('Saving profile data:', data)
      
      // Simulate API call with loading
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Show success message
      alert('Profile saved successfully! 🎉')
      
      // Optionally redirect
      // router.push('/')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile. Please try again.')
    }
  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <ProfileForm
          initialData={mockUserData}
          onSave={handleSaveProfile}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}

export default ProfilePage
