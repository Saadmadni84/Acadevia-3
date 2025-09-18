'use client'

import React from 'react'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward, 
  Maximize,
  Settings,
  Download
} from 'lucide-react'

interface VideoControlsProps {
  className?: string
  isPlaying?: boolean
  isMuted?: boolean
  volume?: number
  currentTime?: number
  duration?: number
  onPlayPause?: () => void
  onMuteToggle?: () => void
  onVolumeChange?: (volume: number) => void
  onSeek?: (time: number) => void
  onSkip?: (seconds: number) => void
  onFullscreen?: () => void
  onDownload?: () => void
  showAdvanced?: boolean
}

export default function VideoControls({
  className = '',
  isPlaying = false,
  isMuted = false,
  volume = 100,
  currentTime = 0,
  duration = 0,
  onPlayPause,
  onMuteToggle,
  onVolumeChange,
  onSeek,
  onSkip,
  onFullscreen,
  onDownload,
  showAdvanced = false
}: VideoControlsProps) {

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={`bg-gray-900/90 backdrop-blur text-white ${className}`}>
      {/* Progress Bar */}
      <div className="w-full px-4 py-2">
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercentage}
            onChange={(e) => {
              if (onSeek && duration > 0) {
                const seekTime = (parseInt(e.target.value) / 100) * duration
                onSeek(seekTime)
              }
            }}
            className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${progressPercentage}%, rgba(255,255,255,0.3) ${progressPercentage}%, rgba(255,255,255,0.3) 100%)`
            }}
          />
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left Controls */}
        <div className="flex items-center space-x-3">
          {/* Skip Back */}
          {showAdvanced && onSkip && (
            <button
              onClick={() => onSkip(-10)}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title="Skip back 10s"
            >
              <SkipBack className="w-5 h-5" />
            </button>
          )}

          {/* Play/Pause */}
          <button
            onClick={onPlayPause}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>

          {/* Skip Forward */}
          {showAdvanced && onSkip && (
            <button
              onClick={() => onSkip(10)}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title="Skip forward 10s"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          )}

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onMuteToggle}
              className="p-1 rounded hover:bg-white/20 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            
            {/* Volume Slider */}
            <div className="hidden sm:block">
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange?.(parseInt(e.target.value))}
                className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Time Display */}
          <div className="text-sm font-mono text-white/80">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          {/* Download */}
          {onDownload && (
            <button
              onClick={onDownload}
              className="p-2 rounded hover:bg-white/20 transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Settings */}
          {showAdvanced && (
            <button
              className="p-2 rounded hover:bg-white/20 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Fullscreen */}
          {onFullscreen && (
            <button
              onClick={onFullscreen}
              className="p-2 rounded hover:bg-white/20 transition-colors"
              title="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
