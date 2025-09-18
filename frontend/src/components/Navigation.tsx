'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Home, BookOpen, BarChart3, Trophy } from 'lucide-react'

const Navigation = () => {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/courses', label: 'Courses', icon: BookOpen },
    { href: '/progress', label: 'Progress', icon: BarChart3 },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ]

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            GameLearn Platform
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  pathname === href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            
            {/* Profile Button */}
            <Link
              href="/profile"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ml-4 ${
                pathname === '/profile'
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Link
              href="/profile"
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
