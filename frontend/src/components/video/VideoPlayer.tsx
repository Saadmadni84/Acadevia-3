'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react'

interface VideoPlayerProps {
  src: string
  poster?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  width?: number
  height?: number
}

export default function VideoPlayer({ 
  src, 
  poster, 
  className = '', 
  autoPlay = false, 
  muted = false, 
  loop = false,
  width,
  height
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(muted)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const time = (parseFloat(e.target.value) / 100) * duration
    videoRef.current.currentTime = time
    setCurrentTime(time)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const newVolume = parseFloat(e.target.value) / 100
    videoRef.current.volume = newVolume
    setVolume(newVolume)
  }

  const toggleFullscreen = () => {
    if (!videoRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      videoRef.current.requestFullscreen()
    }
  }

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime += seconds
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0

  return (
    <div 
      className={`relative group bg-black rounded-lg overflow-hidden ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        width={width}
        height={height}
        className="w-full h-full object-cover"
        onClick={togglePlay}
      />

      {/* Custom Controls Overlay */}
      {showControls && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 flex flex-col justify-end">
          {/* Play/Pause Button - Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="bg-black/50 hover:bg-black/70 text-white rounded-full p-4 transition-all duration-200 transform hover:scale-110"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </button>
          </div>

          {/* Bottom Controls */}
          <div className="p-4 space-y-2">
            {/* Progress Bar */}
            <div className="w-full">
              <input
                type="range"
                min="0"
                max="100"
                value={progressPercentage}
                onChange={handleSeek}
                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${progressPercentage}%, rgba(255,255,255,0.3) ${progressPercentage}%, rgba(255,255,255,0.3) 100%)`
                }}
              />
            </div>

            {/* Control Buttons Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Skip Back */}
                <button
                  onClick={() => skipTime(-10)}
                  className="text-white hover:text-blue-400 transition-colors"
                  title="Skip back 10s"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>

                {/* Skip Forward */}
                <button
                  onClick={() => skipTime(10)}
                  className="text-white hover:text-blue-400 transition-colors"
                  title="Skip forward 10s"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume * 100}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Time Display */}
                <div className="text-white text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              {/* Right Side Controls */}
              <div className="flex items-center gap-2">
                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-blue-400 transition-colors"
                  title="Fullscreen"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {duration === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  )
}
