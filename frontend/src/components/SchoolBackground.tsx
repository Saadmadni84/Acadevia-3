// components/SchoolBackground.tsx
import React from 'react';
import Image from 'next/image';

interface SchoolBackgroundProps {
  children: React.ReactNode;
  overlay?: boolean;
}

const SchoolBackground: React.FC<SchoolBackgroundProps> = ({ 
  children, 
  overlay = true 
}) => {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/school-background.png"
          alt="School building background"
          fill
          className="object-cover"
          priority
        />
      </div>
      
      {overlay && (
        <div className="fixed inset-0 z-10 bg-white/80 backdrop-blur-sm" />
      )}
      
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
};

export default SchoolBackground;
