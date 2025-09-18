'use client'

import Link from 'next/link'
import { Trophy, BarChart3, Users, User, BookOpen, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const handleStartLearning = () => {
    // Add your start learning logic here
    alert('Start Learning clicked! Redirecting to courses...')
    // You can replace this with: router.push('/courses')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Learn Through Gaming
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Transform your learning experience with our gamified platform. Earn 
            points, unlock achievements, and compete with friends!
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              onClick={handleStartLearning}
              className="btn-primary text-lg"
            >
              <BookOpen className="w-5 h-5" />
              Start Learning
            </button>
            
            <Link href="/courses" className="btn-secondary text-lg">
              View Courses
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Quick Access to Profile */}
          <div className="mb-16">
            <Link 
              href="/profile" 
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <User className="w-4 h-4" />
              Manage Profile
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Achievements Card */}
          <div className="card text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Achievements</h3>
            <p className="text-gray-600">
              Unlock badges and rewards as you progress through courses.
            </p>
          </div>

          {/* Progress Tracking Card */}
          <div className="card text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Progress Tracking</h3>
            <p className="text-gray-600">
              Monitor your learning journey with detailed analytics.
            </p>
          </div>

          {/* Social Learning Card */}
          <div className="card text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Social Learning</h3>
            <p className="text-gray-600">
              Compete with friends and join study groups.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
