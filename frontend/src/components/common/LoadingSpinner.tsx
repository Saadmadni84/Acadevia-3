// components/LoadingSpinner.tsx
import React from 'react';
import { cn } from '@/utils/helpers';
import { Trophy, BookOpen, Target } from 'lucide-react';

export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Color variant */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'white';
  /** Spinner variant */
  variant?: 'default' | 'dots' | 'pulse' | 'bounce' | 'gamified';
  /** Loading text to display */
  text?: string;
  /** Whether to show the spinner */
  isLoading?: boolean;
  /** Custom className */
  className?: string;
  /** Center the spinner */
  center?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  variant = 'default',
  text,
  isLoading = true,
  className,
  center = false,
}) => {
  if (!isLoading) return null;

  // Size configurations
  const sizeClasses = {
    sm: {
      spinner: 'w-4 h-4',
      text: 'text-xs',
      gap: 'gap-2',
      icon: 'w-3 h-3',
    },
    md: {
      spinner: 'w-6 h-6',
      text: 'text-sm',
      gap: 'gap-3',
      icon: 'w-4 h-4',
    },
    lg: {
      spinner: 'w-8 h-8',
      text: 'text-base',
      gap: 'gap-4',
      icon: 'w-6 h-6',
    },
    xl: {
      spinner: 'w-12 h-12',
      text: 'text-lg',
      gap: 'gap-5',
      icon: 'w-8 h-8',
    },
  };

  // Color configurations
  const colorClasses = {
    primary: {
      spinner: 'text-blue-600',
      fill: 'fill-blue-600',
      text: 'text-blue-600',
      dots: 'bg-blue-600',
    },
    secondary: {
      spinner: 'text-gray-600',
      fill: 'fill-gray-600',
      text: 'text-gray-600',
      dots: 'bg-gray-600',
    },
    success: {
      spinner: 'text-green-600',
      fill: 'fill-green-600',
      text: 'text-green-600',
      dots: 'bg-green-600',
    },
    warning: {
      spinner: 'text-yellow-600',
      fill: 'fill-yellow-600',
      text: 'text-yellow-600',
      dots: 'bg-yellow-600',
    },
    error: {
      spinner: 'text-red-600',
      fill: 'fill-red-600',
      text: 'text-red-600',
      dots: 'bg-red-600',
    },
    white: {
      spinner: 'text-white',
      fill: 'fill-white',
      text: 'text-white',
      dots: 'bg-white',
    },
  };

  const currentSize = sizeClasses[size];
  const currentColor = colorClasses[color];

  // Default SVG Spinner
  const DefaultSpinner = () => (
    <svg
      className={cn('animate-spin', currentSize.spinner, currentColor.spinner)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // Dots Spinner
  const DotsSpinner = () => (
    <div className={cn('flex space-x-1', currentSize.gap)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-pulse',
            currentSize.spinner,
            currentColor.dots
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s',
          }}
        />
      ))}
    </div>
  );

  // Pulse Spinner
  const PulseSpinner = () => (
    <div
      className={cn(
        'rounded-full animate-ping',
        currentSize.spinner,
        currentColor.dots
      )}
    />
  );

  // Bounce Spinner
  const BounceSpinner = () => (
    <div className={cn('flex space-x-1', currentSize.gap)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-bounce',
            currentSize.spinner,
            currentColor.dots
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );

  // Gamified Spinner with Icons
  const GamifiedSpinner = () => {
    const icons = [Trophy, BookOpen, Target];
    const IconComponent = icons[Math.floor(Date.now() / 1000) % icons.length];
    
    return (
      <div className="relative">
        <div
          className={cn(
            'rounded-full border-2 border-transparent animate-spin',
            currentSize.spinner
          )}
          style={{
            background: `conic-gradient(from 0deg, ${
              color === 'primary' ? '#3b82f6' : 
              color === 'success' ? '#10b981' : 
              color === 'warning' ? '#f59e0b' : 
              color === 'error' ? '#ef4444' : '#6b7280'
            }, transparent)`,
          }}
        />
        <IconComponent
          className={cn(
            'absolute inset-0 m-auto animate-pulse',
            currentSize.icon,
            currentColor.text
          )}
        />
      </div>
    );
  };

  // Render spinner based on variant
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <DotsSpinner />;
      case 'pulse':
        return <PulseSpinner />;
      case 'bounce':
        return <BounceSpinner />;
      case 'gamified':
        return <GamifiedSpinner />;
      default:
        return <DefaultSpinner />;
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center',
        currentSize.gap,
        center && 'justify-center min-h-[200px]',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={text || 'Loading content'}
    >
      {renderSpinner()}
      {text && (
        <span className={cn('font-medium', currentSize.text, currentColor.text)}>
          {text}
        </span>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
