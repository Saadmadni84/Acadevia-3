'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  X, Menu, Home, BookOpen, BarChart3, Trophy, User, 
  Settings, LogOut, ChevronDown, ChevronRight, 
  Play, Award, Target, Users, Bell, Search
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

interface MenuItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<any>
  badge?: string
  children?: MenuItem[]
}

export default function Sidebar({ isOpen, onClose, className = '' }: SidebarProps) {
  const pathname = usePathname()
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  // Navigation menu items
  const menuItems: MenuItem[] = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
      icon: Home
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/student',
      icon: BarChart3
    },
    {
      id: 'courses',
      label: 'Courses',
      href: '/student/courses',
      icon: BookOpen,
      badge: 'New',
      children: [
        { id: 'all-courses', label: 'All Courses', href: '/courses', icon: BookOpen },
        { id: 'my-courses', label: 'My Courses', href: '/student/courses', icon: User },
        { id: 'completed', label: 'Completed', href: '/student/courses/completed', icon: Award }
      ]
    },
    {
      id: 'progress',
      label: 'Progress',
      href: '/progress',
      icon: Target
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      href: '/leaderboard',
      icon: Trophy
    },
    {
      id: 'profile',
      label: 'Profile',
      href: '/Profile',
      icon: User
    }
  ]

  const toggleExpandedMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    )
  }

  const isMenuExpanded = (menuId: string) => expandedMenus.includes(menuId)
  
  const isActive = (href: string) => {
    if (!pathname) return false
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-80 lg:w-72
        ${className}
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">GameLearn</h2>
              <p className="text-sm text-gray-500">Learning Platform</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <div key={item.id}>
                {/* Main Menu Item */}
                <div className="group">
                  {item.children ? (
                    // Parent menu with children
                    <button
                      onClick={() => toggleExpandedMenu(item.id)}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
                        ${isActive(item.href) 
                          ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                        }
                        group-hover:shadow-sm
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-blue-600' : 'text-gray-500'}`} />
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {isMenuExpanded(item.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  ) : (
                    // Direct menu link
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                        ${isActive(item.href) 
                          ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                        }
                        group-hover:shadow-sm
                      `}
                    >
                      <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}
                </div>

                {/* Submenu Items */}
                {item.children && isMenuExpanded(item.id) && (
                  <div className="ml-4 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        onClick={onClose}
                        className={`
                          flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
                          ${isActive(child.href) 
                            ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-400' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                          }
                        `}
                      >
                        <child.icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">John Doe</p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
            <button className="p-1 rounded-lg hover:bg-gray-100">
              <Bell className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">12</div>
              <div className="text-xs text-gray-500">Courses</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">85%</div>
              <div className="text-xs text-gray-500">Progress</div>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-600">24</div>
              <div className="text-xs text-gray-500">Badges</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Play className="w-4 h-4" />
              <span className="text-sm font-medium">Continue Learning</span>
            </button>
            
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
              <span className="text-sm">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
