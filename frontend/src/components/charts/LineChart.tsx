'use client'

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface DataPoint {
  label?: string;
  value?: number;
  day?: string;
  score?: number;
  date?: string;
}

interface LineChartProps {
  data?: DataPoint[];
  title?: string;
  height?: number;
  showGrid?: boolean;
  animated?: boolean;
  color?: string;
}

export function LineChart({
  data,
  title = "Learning Progress Over Time",
  height = 200,
  showGrid = true,
  animated = true,
  color = '#3B82F6'
}: LineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Default data for learning progress
  const defaultData: DataPoint[] = [
    { label: 'Week 1', value: 20, date: 'Sep 1' },
    { label: 'Week 2', value: 35, date: 'Sep 8' },
    { label: 'Week 3', value: 25, date: 'Sep 15' },
    { label: 'Week 4', value: 45, date: 'Sep 22' },
    { label: 'Week 5', value: 60, date: 'Sep 29' },
    { label: 'Week 6', value: 55, date: 'Oct 6' },
    { label: 'Week 7', value: 75, date: 'Oct 13' },
    { label: 'Week 8', value: 85, date: 'Oct 20' }
  ];

  const chartData = data || defaultData;
  
  // Normalize data - handle both formats
  const normalizedData = chartData.map(item => ({
    label: item.label || item.day || 'Day',
    value: item.value || item.score || 0,
    date: item.date || item.day || ''
  }));

  const maxValue = Math.max(...normalizedData.map(item => item.value));
  const minValue = Math.min(...normalizedData.map(item => item.value));

  // Calculate points for the line
  const points = normalizedData.map((item, index) => {
    const x = (index / (normalizedData.length - 1)) * 100;
    const y = 100 - ((item.value - minValue) / (maxValue - minValue)) * 80;
    return { x, y, value: item.value, label: item.label, date: item.date };
  });

  // Create path string for SVG
  const pathString = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');

  // Calculate trend
  const firstValue = normalizedData[0]?.value || 0;
  const lastValue = normalizedData[normalizedData.length - 1]?.value || 0;
  const trend = lastValue > firstValue ? 'up' : 'down';
  const trendPercentage = Math.abs(((lastValue - firstValue) / firstValue) * 100).toFixed(1);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          {title}
        </h3>
        <div className={`flex items-center text-sm px-3 py-1 rounded-full ${
          trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
        }`}>
          {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          {trendPercentage}%
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative" style={{ height: height + 40 }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          className="overflow-visible"
        >
          {/* Grid lines */}
          {showGrid && (
            <g stroke="#f0f0f0" strokeWidth="0.2">
              {/* Horizontal lines */}
              {[0, 25, 50, 75, 100].map(y => (
                <line key={`h-${y}`} x1="0" y1={y} x2="100" y2={y} />
              ))}
              {/* Vertical lines */}
              {points.map((_, index) => (
                <line
                  key={`v-${index}`}
                  x1={points[index].x}
                  y1="10"
                  x2={points[index].x}
                  y2="90"
                />
              ))}
            </g>
          )}

          {/* Area under the line */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.05 }} />
            </linearGradient>
          </defs>

          <path
            d={`${pathString} L 100 90 L 0 90 Z`}
            fill="url(#lineGradient)"
            className={animated ? "transition-all duration-1000" : ""}
          />

          {/* Main line */}
          <path
            d={pathString}
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={animated ? "transition-all duration-1000" : ""}
          />

          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredIndex === index ? "2.5" : "2"}
                fill={color}
                stroke="white"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-200 hover:r-3"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              
              {/* Tooltip on hover */}
              {hoveredIndex === index && (
                <>
                  <rect
                    x={point.x - 15}
                    y={point.y - 25}
                    width="30"
                    height="18"
                    fill="rgba(0,0,0,0.8)"
                    rx="4"
                  />
                  <text
                    x={point.x}
                    y={point.y - 12}
                    textAnchor="middle"
                    className="fill-white text-xs font-semibold"
                  >
                    {point.value}
                  </text>
                </>
              )}
            </g>
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {normalizedData.map((item, index) => (
            <div key={index} className="text-center">
              <div>{item.date || item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t text-sm text-gray-500">
        <div>
          <span className="font-medium">Peak:</span> {Math.max(...normalizedData.map(d => d.value))}
        </div>
        <div>
          <span className="font-medium">Average:</span> {Math.round(normalizedData.reduce((acc, d) => acc + d.value, 0) / normalizedData.length)}
        </div>
        <div>
          <span className="font-medium">Current:</span> {lastValue}
        </div>
      </div>
    </div>
  );
}

export default LineChart;
