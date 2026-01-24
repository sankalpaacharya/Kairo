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

function getErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return "MEDIA_ERR_ABORTED - Video loading aborted";
    case 2:
      return "MEDIA_ERR_NETWORK - Network error while loading video";
    case 3:
      return "MEDIA_ERR_DECODE - Video decoding failed";
    case 4:
      return "MEDIA_ERR_SRC_NOT_SUPPORTED - Video format not supported";
    default:
      return "Unknown error";
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

  // Use requestAnimationFrame for smooth 60fps updates
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
      // Start animation loop on play
      if (loopRef.current) {
        animationFrameRef.current = requestAnimationFrame(loopRef.current);
      }
    };
    const handlePause = () => {
      setIsPlaying(false);
      // Stop animation loop on pause
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // Update final time
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
        const errorMessage = `Video error: ${video.error.code} - ${getErrorMessage(video.error.code)}`;
        setError(errorMessage);
        console.error(errorMessage);
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

    // Check if duration is already available
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
        console.error("Error playing video:", err);
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

