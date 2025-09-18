'use client'

import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Users, Star } from 'lucide-react';

interface BarData {
  label: string;
  value: number;
  color?: string;
  students?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  rating?: number;
}

interface BarchartProps {
  data?: BarData[];
  title?: string;
  maxHeight?: number;
  showPercentages?: boolean;
  animated?: boolean;
  showTooltip?: boolean;
  gamified?: boolean;
}

export function BarChart({ 
  data,
  title = "Course Completion Rates",
  maxHeight = 200,
  showPercentages = true,
  animated = true,
  showTooltip = true,
  gamified = true
}: BarchartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animatedValues, setAnimatedValues] = useState<number[]>([]);

  // Gamified learning platform data
  const defaultData: BarData[] = [
    { 
      label: 'React Basics', 
      value: 85, 
      color: '#3B82F6',
      students: 1250,
      difficulty: 'Easy',
      rating: 4.8
    },
    { 
      label: 'JavaScript Advanced', 
      value: 92, 
      color: '#10B981',
      students: 980,
      difficulty: 'Hard',
      rating: 4.9
    },
    { 
      label: 'CSS Mastery', 
      value: 78, 
      color: '#F59E0B',
      students: 1100,
      difficulty: 'Medium',
      rating: 4.6
    },
    { 
      label: 'Node.js Backend', 
      value: 88, 
      color: '#EF4444',
      students: 760,
      difficulty: 'Hard',
      rating: 4.7
    },
    { 
      label: 'TypeScript', 
      value: 95, 
      color: '#8B5CF6',
      students: 890,
      difficulty: 'Medium',
      rating: 4.9
    },
    { 
      label: 'Next.js', 
      value: 73, 
      color: '#EC4899',
      students: 650,
      difficulty: 'Medium',
      rating: 4.5
    }
  ];

  const chartData = data || defaultData;
  const maxValue = Math.max(...chartData.map(item => item.value));

  // Animation effect
  useEffect(() => {
    if (animated) {
      setAnimatedValues(new Array(chartData.length).fill(0));
      const timer = setTimeout(() => {
        setAnimatedValues(chartData.map(item => item.value));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [chartData, animated]);

  const getBarHeight = (value: number, index: number) => {
    const actualValue = animated ? animatedValues[index] || 0 : value;
    return (actualValue / maxValue) * maxHeight;
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-600">{rating}</span>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        {title && (
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            {gamified && <Trophy className="w-5 h-5 text-yellow-500" />}
            {title}
          </h3>
        )}
        {gamified && (
          <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <TrendingUp className="w-4 h-4 mr-1" />
            +12% this week
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="flex items-end justify-center space-x-3 mb-6" style={{ height: maxHeight + 60 }}>
        {chartData.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center group cursor-pointer relative"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Tooltip */}
            {showTooltip && hoveredIndex === index && (
              <div className="absolute bottom-full mb-4 bg-gray-900 text-white p-3 rounded-lg shadow-xl z-10 min-w-48">
                <div className="font-semibold mb-1">{item.label}</div>
                <div className="text-sm space-y-1">
                  <div>Completion: {item.value}%</div>
                  {item.students && (
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {item.students} students
                    </div>
                  )}
                  {item.difficulty && (
                    <div className={`inline-flex px-2 py-0.5 rounded-full text-xs ${getDifficultyColor(item.difficulty)}`}>
                      {item.difficulty}
                    </div>
                  )}
                  {item.rating && renderStars(item.rating)}
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            )}

            {/* Value Display */}
            <div className={`mb-2 transition-all duration-300 ${
              hoveredIndex === index ? 'opacity-100 scale-110' : 'opacity-0 scale-95'
            }`}>
              <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg font-semibold">
                {showPercentages ? `${animated ? animatedValues[index] || 0 : item.value}%` : item.value}
              </span>
            </div>

            {/* Bar */}
            <div
              className={`w-10 rounded-t-lg transition-all duration-500 hover:shadow-lg relative overflow-hidden ${
                animated ? 'transform hover:scale-105' : ''
              }`}
              style={{
                height: `${getBarHeight(item.value, index)}px`,
                backgroundColor: item.color || '#3B82F6',
                minHeight: '8px'
              }}
            >
              {/* Shine effect on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
                animated ? 'group-hover:animate-pulse' : ''
              }`} />
            </div>

            {/* Label */}
            <div className="mt-3 text-xs font-medium text-gray-600 text-center max-w-16">
              <span className="block leading-tight">{item.label}</span>
              {gamified && item.students && (
                <span className="block text-gray-400 mt-1">{item.students}+ enrolled</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Statistics Footer */}
      <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4">
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span>Total Courses: {chartData.length}</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span>Avg: {Math.round(chartData.reduce((acc, item) => acc + item.value, 0) / chartData.length)}%</span>
          </div>
        </div>
        
        {gamified && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-green-600">
              <Trophy className="w-4 h-4 mr-1" />
              <span className="font-semibold">Gamified</span>
            </div>
            <div className="text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BarChart;
