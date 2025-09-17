// components/VideoControls.tsx
"use client"
import { useMemo } from 'react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/utils/helpers';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  BookOpen,
  Trophy,
  Star,
  Clock,
  Download,
  Share2,
  RotateCcw,
  RotateCw,
  Bookmark,
  Eye,
  EyeOff
} from 'lucide-react';

export interface VideoControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackRate: number;
  buffered: TimeRanges | null;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMute: () => void;
  onFullscreenToggle: () => void;
  onPlaybackRateChange: (rate: number) => void;
  onSkip: (seconds: number) => void;
  className?: string;
  // Gamified features
  progress?: number; // Course progress percentage
  achievements?: Array<{ id: string; title: string; unlocked: boolean }>;
  onBookmark?: (timestamp: number) => void;
  onTakeNote?: (timestamp: number) => void;
  onShare?: () => void;
  onDownload?: () => void;
  showGameElements?: boolean;
  lessonTitle?: string;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  videoRef,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  playbackRate,
  buffered,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onMute,
  onFullscreenToggle,
  onPlaybackRateChange,
  onSkip,
  className,
  progress = 0,
  achievements = [],
  onBookmark,
  onTakeNote,
  onShare,
  onDownload,
  showGameElements = true,
  lessonTitle,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    const resetHideTimer = () => {
      setIsVisible(true);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
      if (isPlaying) {
        hideControlsTimeoutRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }
    };

    resetHideTimer();
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle progress bar seeking
  const handleProgressClick = useCallback((e: React.MouseEvent) => {
    if (!progressRef.current || !duration) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    onSeek(Math.max(0, Math.min(newTime, duration)));
  }, [duration, onSeek]);

  // Handle progress bar dragging
  const handleProgressMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    handleProgressClick(e);
  }, [handleProgressClick]);

  const handleProgressMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !progressRef.current || !duration) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;
    onSeek(newTime);
  }, [isDragging, duration, onSeek]);

  const handleProgressMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleProgressMouseMove);
      document.addEventListener('mouseup', handleProgressMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleProgressMouseMove);
        document.removeEventListener('mouseup', handleProgressMouseUp);
      };
    }
  }, [isDragging, handleProgressMouseMove, handleProgressMouseUp]);

  // Volume control
  const handleVolumeClick = useCallback((e: React.MouseEvent) => {
    if (!volumeRef.current) return;
    
    const rect = volumeRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const percentage = 1 - (clickY / rect.height);
    onVolumeChange(Math.max(0, Math.min(1, percentage)));
  }, [onVolumeChange]);

  // Calculate progress percentage
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  
  // Calculate buffered percentage
  const bufferedPercentage = useMemo(() => {
    if (!buffered || !duration || buffered.length === 0) return 0;
    
    let bufferedEnd = 0;
    for (let i = 0; i < buffered.length; i++) {
      if (buffered.start(i) <= currentTime && buffered.end(i) > currentTime) {
        bufferedEnd = buffered.end(i);
        break;
      }
    }
    return (bufferedEnd / duration) * 100;
  }, [buffered, duration, currentTime]);

  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent',
        'transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => !isDragging && setIsVisible(true)}
    >
      {/* Achievement Notification */}
      {showGameElements && showAchievements && achievements.some(a => a.unlocked) && (
        <div className="absolute bottom-full left-4 mb-2 bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg animate-bounce">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            <span className="font-bold">Achievement Unlocked!</span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="px-4 pb-2">
        <div
          ref={progressRef}
          className="relative h-2 bg-white/20 rounded-full cursor-pointer group"
          onClick={handleProgressClick}
          onMouseDown={handleProgressMouseDown}
        >
          {/* Buffered Progress */}
          <div
            className="absolute top-0 left-0 h-full bg-white/40 rounded-full"
            style={{ width: `${bufferedPercentage}%` }}
          />
          
          {/* Current Progress */}
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
          
          {/* Progress Handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${progressPercentage}% - 8px)` }}
          />

          {/* Chapter/Bookmark Markers */}
          {showGameElements && (
            <div className="absolute top-0 left-1/3 w-1 h-full bg-yellow-400 rounded-full opacity-60" />
          )}
        </div>

        {/* Progress Indicators */}
        {showGameElements && (
          <div className="flex justify-between items-center mt-1 text-xs text-white/70">
            <span>Progress: {Math.round(progress)}%</span>
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-400" />
              {achievements.filter(a => a.unlocked).length}/{achievements.length}
            </span>
          </div>
        )}
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-between px-4 pb-4">
        {/* Left Controls */}
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="flex items-center justify-center w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 text-white" />
            ) : (
              <Play className="h-6 w-6 text-white ml-1" />
            )}
          </button>

          {/* Skip Controls */}
          <button
            onClick={() => onSkip(-10)}
            className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <RotateCcw className="h-5 w-5 text-white" />
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-white font-bold">10</span>
          </button>

          <button
            onClick={() => onSkip(10)}
            className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <RotateCw className="h-5 w-5 text-white" />
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-white font-bold">10</span>
          </button>

          {/* Volume */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <button
                onClick={onMute}
                onMouseEnter={() => setShowVolumeSlider(true)}
                className="flex items-center justify-center w-8 h-8 text-white hover:text-blue-400 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>

              {/* Volume Slider */}
              {showVolumeSlider && (
                <div
                  className="absolute bottom-full left-0 mb-2 p-2 bg-black/80 rounded"
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <div
                    ref={volumeRef}
                    className="relative w-2 h-20 bg-white/20 rounded-full cursor-pointer"
                    onClick={handleVolumeClick}
                  >
                    <div
                      className="absolute bottom-0 left-0 w-full bg-white rounded-full"
                      style={{ height: `${volume * 100}%` }}
                    />
                    <div
                      className="absolute w-3 h-3 bg-white rounded-full transform -translate-x-0.5"
                      style={{ bottom: `calc(${volume * 100}% - 6px)` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Time Display */}
          <div className="text-white text-sm font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Center Title (if provided) */}
        {lessonTitle && (
          <div className="hidden md:block text-white text-lg font-semibold max-w-md truncate">
            {lessonTitle}
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Learning Tools */}
          {showGameElements && (
            <>
              <button
                onClick={() => onBookmark?.(currentTime)}
                className="flex items-center justify-center w-8 h-8 text-white hover:text-yellow-400 transition-colors"
                title="Bookmark this moment"
              >
                <Bookmark className="h-5 w-5" />
              </button>

              <button
                onClick={() => onTakeNote?.(currentTime)}
                className="flex items-center justify-center w-8 h-8 text-white hover:text-green-400 transition-colors"
                title="Take note"
              >
                <BookOpen className="h-5 w-5" />
              </button>

              <button
                onClick={() => setShowAchievements(!showAchievements)}
                className="flex items-center justify-center w-8 h-8 text-white hover:text-yellow-400 transition-colors"
                title="View achievements"
              >
                <Trophy className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Share & Download */}
          {onShare && (
            <button
              onClick={onShare}
              className="flex items-center justify-center w-8 h-8 text-white hover:text-blue-400 transition-colors"
              title="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
          )}

          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center justify-center w-8 h-8 text-white hover:text-green-400 transition-colors"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </button>
          )}

          {/* Settings */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center justify-center w-8 h-8 text-white hover:text-gray-300 transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>

            {/* Settings Menu */}
            {showSettings && (
              <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg shadow-lg min-w-[160px]">
                <div className="p-2">
                  <div className="text-white text-sm font-medium mb-2">Playback Speed</div>
                  {playbackRates.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        onPlaybackRateChange(rate);
                        setShowSettings(false);
                      }}
                      className={cn(
                        'block w-full text-left px-3 py-1 text-sm rounded hover:bg-white/10 transition-colors',
                        playbackRate === rate ? 'text-blue-400' : 'text-white'
                      )}
                    >
                      {rate}x {rate === 1 ? '(Normal)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <button
            onClick={onFullscreenToggle}
            className="flex items-center justify-center w-8 h-8 text-white hover:text-gray-300 transition-colors"
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoControls;
