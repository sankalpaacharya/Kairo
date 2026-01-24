"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseVideoPlayerReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  formattedCurrentTime: string;
  formattedDuration: string;
  error: string | null;
  isLoading: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  seekByPercent: (percent: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
}

export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function getErrorMessage(code: number, src?: string): string {
  switch (code) {
    case 1:
      return "Video loading was aborted";
    case 2:
      return "Network error while loading video. Check your connection.";
    case 3:
      return "Video decoding failed. The file may be corrupted.";
    case 4:
      const fileName = src ? src.split('/').pop() : 'file';
      return `Video format not supported. ${fileName} cannot be played. Please use MP4 format.`;
    default:
      return "Unknown video error occurred";
  }
}

export function useVideoPlayer(videoSrc?: string | null): UseVideoPlayerReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loopRef = useRef<() => void>(undefined);

  const updateTime = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
    if (loopRef.current) {
      animationFrameRef.current = requestAnimationFrame(loopRef.current);
    }
  }, []);

  useEffect(() => {
    loopRef.current = updateTime;
  }, [updateTime]);

  // Reset state when video source changes
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    setIsLoading(!!videoSrc);
  }, [videoSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleDurationChange = () => {
      const dur = video.duration;
      if (isFinite(dur) && !isNaN(dur) && dur > 0) {
        setDuration(dur);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (loopRef.current) {
        animationFrameRef.current = requestAnimationFrame(loopRef.current);
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    const handleSeeked = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedData = () => {
      setIsLoading(false);
      const dur = video.duration;
      if (isFinite(dur) && !isNaN(dur) && dur > 0) {
        setDuration(dur);
      }
      setCurrentTime(video.currentTime);
    };

    const handleError = () => {
      if (video.error) {
        const errorMessage = getErrorMessage(video.error.code, videoSrc || undefined);
        setError(errorMessage);
        setIsLoading(false);

        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Video playback error:', {
            code: video.error.code,
            message: video.error.message,
            src: videoSrc,
            suggestedFix: video.error.code === 4
              ? 'Convert video to MP4 (H.264) format or ensure you are creating a blob URL for uploaded files using URL.createObjectURL(file)'
              : 'Check console for details'
          });
        }
      }
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("loadedmetadata", handleDurationChange);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("error", handleError);
    video.addEventListener("loadstart", handleLoadStart);

    if (video.duration && isFinite(video.duration)) {
      setDuration(video.duration);
    }

    return () => {
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("loadedmetadata", handleDurationChange);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("error", handleError);
      video.removeEventListener("loadstart", handleLoadStart);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateTime, videoSrc]);

  const play = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn("Error playing video:", err);
        }
        setError(`Playback failed: ${err.message}`);
      });
    }
  }, []);

  const pause = useCallback(() => {
    videoRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback(
    (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.max(0, Math.min(time, duration));
      }
    },
    [duration]
  );

  const seekByPercent = useCallback(
    (percent: number) => {
      if (videoRef.current && duration > 0) {
        videoRef.current.currentTime = (percent / 100) * duration;
      }
    },
    [duration]
  );

  const skipForward = useCallback(
    (seconds = 5) => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.min(
          videoRef.current.currentTime + seconds,
          duration
        );
      }
    },
    [duration]
  );

  const skipBackward = useCallback((seconds = 5) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        videoRef.current.currentTime - seconds,
        0
      );
    }
  }, []);

  return {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    formattedCurrentTime: formatTime(currentTime),
    formattedDuration: formatTime(duration),
    error,
    isLoading,
    play,
    pause,
    toggle,
    seek,
    seekByPercent,
    skipForward,
    skipBackward,
  };
}