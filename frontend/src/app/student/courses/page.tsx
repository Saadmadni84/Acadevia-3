'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, Clock, Star, Trophy, Users, Play, Lock } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number // in minutes
  rating: number
  studentsEnrolled: number
  progress?: number // 0-100 for enrolled courses
  isEnrolled: boolean
  isLocked: boolean
  xpReward: number
  lessonsCount: number
  category: string
  instructor: string
}

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'enrolled' | 'available'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchCourses = async () => {
      // Simulated API call
      const mockCourses: Course[] = [
        {
          id: '1',
          title: 'JavaScript Fundamentals Quest',
          description: 'Master the basics of JavaScript through interactive challenges and coding battles.',
          thumbnail: '/images/javascript-course.jpg',
          difficulty: 'beginner',
          duration: 480,
          rating: 4.8,
          studentsEnrolled: 1250,
          progress: 65,
          isEnrolled: true,
          isLocked: false,
          xpReward: 500,
          lessonsCount: 12,
          category: 'Programming',
          instructor: 'Sarah Johnson'
        },
        {
          id: '2',
          title: 'React Hero Academy',
          description: 'Build dynamic web applications and earn badges while learning React.js.',
          thumbnail: '/images/react-course.jpg',
          difficulty: 'intermediate',
          duration: 720,
          rating: 4.9,
          studentsEnrolled: 890,
          progress: 0,
          isEnrolled: false,
          isLocked: false,
          xpReward: 750,
          lessonsCount: 18,
          category: 'Programming',
          instructor: 'Mike Chen'
        },
        {
          id: '3',
          title: 'Advanced Algorithm Arena',
          description: 'Compete in algorithmic challenges and climb the leaderboard.',
          thumbnail: '/images/algorithms-course.jpg',
          difficulty: 'advanced',
          duration: 960,
          rating: 4.7,
          studentsEnrolled: 456,
          progress: 0,
          isEnrolled: false,
          isLocked: true,
          xpReward: 1000,
          lessonsCount: 24,
          category: 'Computer Science',
          instructor: 'Dr. Emily Rodriguez'
        }
      ]
      
      setTimeout(() => {
        setCourses(mockCourses)
        setLoading(false)
      }, 1000)
    }

    fetchCourses()
  }, [])

  const filteredCourses = courses.filter(course => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'enrolled' && course.isEnrolled) ||
      (filter === 'available' && !course.isEnrolled && !course.isLocked)

    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesCategory && matchesSearch
  })

  const categories = ['all', ...Array.from(new Set(courses.map(c => c.category)))]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your learning adventure...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Learning Journey
          </h1>
          <p className="text-gray-600 text-lg">
            Discover courses, earn XP, and level up your skills!
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {['all', 'enrolled', 'available'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === filterOption
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Course Image */}
              <div className="relative h-48 bg-gradient-to-r from-purple-400 to-blue-500">
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-white opacity-70" />
                </div>
                {course.isLocked && (
                  <div className="absolute top-4 right-4">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="absolute bottom-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty}
                  </span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {course.description}
                </p>

                {/* Course Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{Math.floor(course.duration / 60)}h {course.duration % 60}m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.studentsEnrolled}</span>
                  </div>
                </div>

                {/* XP Reward */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {course.xpReward} XP
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {course.lessonsCount} lessons
                  </span>
                </div>

                {/* Progress Bar (for enrolled courses) */}
                {course.isEnrolled && course.progress !== undefined && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Link href={course.isLocked ? '#' : `/student/courses/${course.id}`}>
                  <button
                    disabled={course.isLocked}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      course.isLocked
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : course.isEnrolled
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {course.isLocked ? (
                      <>
                        <Lock className="w-4 h-4" />
                        Locked
                      </>
                    ) : course.isEnrolled ? (
                      <>
                        <Play className="w-4 h-4" />
                        Continue Learning
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4" />
                        Enroll Now
                      </>
                    )}
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No courses found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
