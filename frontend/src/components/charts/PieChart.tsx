'use client'

import React, { useState } from 'react';
import { PieChart as PieIcon, BookOpen } from 'lucide-react';

interface PieData {
  label?: string;
  subject?: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data?: PieData[];
  title?: string;
  size?: number;
  showPercentages?: boolean;
  animated?: boolean;
}

export function PieChart({
  data,
  title = "Subject Distribution",
  size = 200,
  showPercentages = true,
  animated = true
}: PieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Default data for subject distribution
  const defaultData: PieData[] = [
    { label: 'Programming', value: 30, color: '#3B82F6' },
    { label: 'Mathematics', value: 25, color: '#10B981' },
    { label: 'Science', value: 20, color: '#F59E0B' },
    { label: 'English', value: 15, color: '#EF4444' },
    { label: 'Art', value: 10, color: '#8B5CF6' }
  ];

  const chartData = data || defaultData;
  
  // Normalize data - handle both formats
  const normalizedData = chartData.map(item => ({
    label: item.label || item.subject || 'Unknown',
    value: item.value,
    color: item.color
  }));

  const total = normalizedData.reduce((sum, item) => sum + item.value, 0);

  // Calculate angles for each segment
  let currentAngle = 0;
  const segments = normalizedData.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    // Calculate path for SVG arc
    const radius = size / 2 - 20;
    const centerX = size / 2;
    const centerY = size / 2;

    const startX = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
    const startY = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
    const endX = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
    const endY = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`,
      'Z'
    ].join(' ');

    return {
      ...item,
      percentage,
      angle,
      pathData,
      index
    };
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-purple-500" />
          {title}
        </h3>
      </div>

      {/* Chart Container */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width={size} height={size} className="drop-shadow-sm">
            {/* Pie segments */}
            {segments.map((segment, index) => (
              <path
                key={index}
                d={segment.pathData}
                fill={segment.color}
                stroke="white"
                strokeWidth="2"
                className={`cursor-pointer transition-all duration-300 ${
                  hoveredIndex === index ? 'opacity-80 scale-105' : 'opacity-100'
                } ${animated ? 'hover:scale-105' : ''}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  transformOrigin: `${size / 2}px ${size / 2}px`,
                  filter: hoveredIndex === index ? 'brightness(1.1)' : 'none'
                }}
              />
            ))}

            {/* Center circle for donut effect */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size / 6}
              fill="white"
              stroke="#f0f0f0"
              strokeWidth="1"
            />

            {/* Center icon */}
            <foreignObject
              x={size / 2 - 12}
              y={size / 2 - 12}
              width="24"
              height="24"
            >
              <BookOpen className="w-6 h-6 text-gray-600" />
            </foreignObject>
          </svg>

          {/* Hover tooltip */}
          {hoveredIndex !== null && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg z-10">
              <div className="text-sm font-semibold">{segments[hoveredIndex].label}</div>
              <div className="text-xs">
                {segments[hoveredIndex].value} students ({segments[hoveredIndex].percentage.toFixed(1)}%)
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 space-y-2 w-full">
          {segments.map((segment, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                hoveredIndex === index ? 'bg-gray-50 scale-105' : 'hover:bg-gray-50'
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="font-medium text-gray-700">{segment.label}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">
                  {showPercentages ? `${segment.percentage.toFixed(1)}%` : segment.value}
                </div>
                <div className="text-xs text-gray-500">{segment.value} students</div>
              </div>
            </div>
          ))}
        </div>

        {/* Total students */}
        <div className="mt-4 text-center text-gray-600">
          <div className="text-2xl font-bold text-gray-800">{total}</div>
          <div className="text-sm">Total Students</div>
        </div>
      </div>
    </div>
  );
}

export default PieChart;
