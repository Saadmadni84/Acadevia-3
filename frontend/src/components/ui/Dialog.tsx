'use client'

import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Dialog({ 
  open, 
  onOpenChange, 
  children, 
  className = '',
  title,
  description,
  size = 'md'
}: DialogProps) {
  // Handle escape key and body scroll
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, onOpenChange])

  if (!open) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div 
          className={`
            relative bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} 
            transform transition-all duration-200 scale-100 opacity-100
            ${className}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 pb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                {description && (
                  <p className="text-sm text-gray-500 mt-1">{description}</p>
                )}
              </div>
              
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}

          {!title && (
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}

          {/* Content */}
          <div className={`px-6 ${title ? 'pb-6' : 'py-6'}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// Additional Dialog components for better composition
export function DialogHeader({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  )
}

export function DialogTitle({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <h2 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h2>
  )
}

export function DialogDescription({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <p className={`text-sm text-gray-500 ${className}`}>
      {children}
    </p>
  )
}

export function DialogFooter({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`flex justify-end space-x-2 mt-6 pt-4 border-t ${className}`}>
      {children}
    </div>
  )
}

// Default export for flexibility
export default Dialog
