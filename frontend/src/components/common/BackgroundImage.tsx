'use client'

import React from 'react'
import Image from 'next/image'

interface BackgroundImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
}

export default function BackgroundImage({ 
  src, 
  alt, 
  className = '',
  priority = false 
}: BackgroundImageProps) {
  return (
    <div className={`relative ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
        sizes="100vw"
      />
    </div>
  )
}
