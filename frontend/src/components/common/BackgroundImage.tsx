// src/components/common/BackgroundImage.tsx
import Image from 'next/image'

interface BackgroundImageProps {
  src?: string
  overlay?: boolean
  overlayOpacity?: number
}

export default function SchoolBackground({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: "url('/images/school-bg.jpg')"
      }}
    >
      <div className="min-h-screen bg-white/20 backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}