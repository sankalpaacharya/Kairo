"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseVideoPlayerReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  formattedCurrentTime: string;
  formattedDuration: string;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  seekByPercent: (percent: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function useVideoPlayer(): UseVideoPlayerReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration || 0);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("loadedmetadata", handleDurationChange);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("loadedmetadata", handleDurationChange);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const play = useCallback(() => {
    videoRef.current?.play();
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

  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(time, duration));
    }
  }, [duration]);

  const seekByPercent = useCallback((percent: number) => {
    if (videoRef.current && duration > 0) {
      videoRef.current.currentTime = (percent / 100) * duration;
    }
  }, [duration]);

  const skipForward = useCallback((seconds = 5) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.currentTime + seconds,
        duration
      );
    }
  }, [duration]);

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
    play,
    pause,
    toggle,
    seek,
    seekByPercent,
    skipForward,
    skipBackward,
  };
}
