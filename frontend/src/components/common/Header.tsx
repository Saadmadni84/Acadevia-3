// components/common/Header.tsx
import React from 'react';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800">GameLearn Platform</h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <a href="#" className="flex items-center text-blue-600 hover:text-blue-700">
              🏠 Home
            </a>
            <a href="#" className="flex items-center text-gray-600 hover:text-blue-600">
              📚 Courses
            </a>
            <a href="#" className="flex items-center text-gray-600 hover:text-blue-600">
              📊 Progress
            </a>
            <a href="#" className="flex items-center text-gray-600 hover:text-blue-600">
              🏆 Leaderboard
            </a>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              👤 Profile
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
