'use client'

import Link from 'next/link'
import { Trophy, BarChart3, Users, User, BookOpen, ArrowRight, Star, Play, Award } from 'lucide-react'
import { BarChart } from '@/components/charts/Barchart'
import { LineChart } from '@/components/charts/LineChart'
import { PieChart } from '@/components/charts/PieChart'

export default function HomePage() {
  return (
    <>
      {/* REMOVED Header and Navigation from here - they're in layout.tsx */}
      
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: "url('/images/school-bg.jpg')"
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="min-h-screen bg-black/40">
          
          {/* Hero Section */}
          <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 pt-32">
            <div className="max-w-4xl mx-auto text-white">
              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Learn Through Gaming
              </h1>
              <p className="text-xl mb-8 text-gray-200 max-w-2xl mx-auto">
                Transform your learning experience with our gamified platform. Earn points, unlock 
                achievements, and compete with friends!
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
                <Link href="/student/courses" className="group">
                  <button className="bg-blue-600 text-white px-8 py-4 rounded-xl flex items-center gap-3 hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
                    <BookOpen className="w-6 h-6" /> 
                    Start Learning
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link href="/student/courses" className="group">
                  <button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-xl hover:bg-white/30 flex items-center gap-3 transform hover:scale-105 transition-all duration-200">
                    <Play className="w-5 h-5" />
                    View Demo
                  </button>
                </Link>
              </div>
              
              {/* Profile Management */}
              <Link href="/student" className="group inline-block">
                <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 flex items-center gap-2 mx-auto transform hover:scale-105 transition-all duration-200 shadow-lg">
                  <User className="w-5 h-5" /> 
                  Manage Profile
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose Our Platform?</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Experience learning like never before with our innovative gamification features
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Trophy className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-800">Achievements</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Unlock badges, earn certificates, and level up your profile through consistent learning.
              </p>
              <Link href="/student/progress" className="text-blue-600 hover:text-blue-800 font-semibold">
                View Progress →
              </Link>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-full">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-800">Progress Tracking</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Monitor your learning journey with detailed analytics and personalized insights.
              </p>
              <Link href="/student/progress" className="text-blue-600 hover:text-blue-800 font-semibold">
                View Analytics →
              </Link>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-800">Leaderboards</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Compete with peers, climb rankings, and showcase your learning achievements.
              </p>
              <Link href="/leaderboard" className="text-blue-600 hover:text-blue-800 font-semibold">
                View Rankings →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Charts */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Platform Statistics</h2>
            <p className="text-gray-600 text-lg">See how students are excelling on our platform</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <BarChart />
            <LineChart />
            <PieChart />
          </div>
        </div>
      </section>

      {/* Quick Access Navigation */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Quick Access</h2>
            <p className="text-blue-100">Jump directly to your favorite sections</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Link href="/student/courses" className="group">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-center hover:bg-white/20 transition-all duration-200 transform hover:scale-105">
                <BookOpen className="w-12 h-12 text-white mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Courses</h3>
                <p className="text-blue-100 text-sm">Browse all courses</p>
              </div>
            </Link>

            <Link href="/student" className="group">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-center hover:bg-white/20 transition-all duration-200 transform hover:scale-105">
                <User className="w-12 h-12 text-white mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Profile</h3>
                <p className="text-blue-100 text-sm">Manage account</p>
              </div>
            </Link>

            <Link href="/progress" className="group">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-center hover:bg-white/20 transition-all duration-200 transform hover:scale-105">
                <BarChart3 className="w-12 h-12 text-white mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Progress</h3>
                <p className="text-blue-100 text-sm">Track learning</p>
              </div>
            </Link>

            <Link href="/leaderboard" className="group">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-center hover:bg-white/20 transition-all duration-200 transform hover:scale-105">
                <Award className="w-12 h-12 text-white mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Leaderboard</h3>
                <p className="text-blue-100 text-sm">View rankings</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
