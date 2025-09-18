'use client'

import { useState, useEffect, useCallback } from 'react'

interface User {
  id: string
  name: string
  email: string
  role?: string
  avatar?: string
}

interface LoginCredentials {
  email: string
  password: string
}

interface AuthContextType {
  user: User | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const userData = localStorage.getItem('userData')
        
        if (token && userData) {
          // Simulate API call to verify token
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Clear invalid data
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Login function
  const login = useCallback(async ({ email, password }: LoginCredentials) => {
    setIsLoading(true)
    
    try {
      // Mock authentication - replace with real API call
      const mockUsers = [
        { id: '1', email: 'john@example.com', password: 'password', name: 'John Doe', role: 'student' },
        { id: '2', email: 'admin@gamelearn.com', password: 'admin123', name: 'Admin User', role: 'admin' },
        { id: '3', email: 'teacher@gamelearn.com', password: 'teacher123', name: 'Teacher', role: 'teacher' }
      ]

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const foundUser = mockUsers.find(u => u.email === email && u.password === password)
      
      if (!foundUser) {
        throw new Error('Invalid email or password')
      }

      // Create user object without password
      const authenticatedUser: User = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        avatar: `/images/avatars/${foundUser.id}.jpg`
      }

      // Store auth data
      const mockToken = `mock-token-${Date.now()}`
      localStorage.setItem('authToken', mockToken)
      localStorage.setItem('userData', JSON.stringify(authenticatedUser))
      
      setUser(authenticatedUser)
      
      // In a real app, you might want to redirect here or trigger a callback
      console.log('Login successful:', authenticatedUser)
      
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Logout function
  const logout = useCallback(() => {
    try {
      // Clear storage
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      
      // Clear user state
      setUser(null)
      
      console.log('Logout successful')
      
      // In a real app, you might want to redirect to login page
      // window.location.href = '/login'
      
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [])

  const isAuthenticated = !!user

  return {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated
  }
}

export default useAuth
