"use client";

import { useState, useRef, useCallback } from "react";

interface UseRecordingTimerReturn {
  time: number;
  formatted: string;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useRecordingTimer(): UseRecordingTimerReturn {
  const [time, setTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const start = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    setTime(0);
  }, [stop]);

  return {
    time,
    formatted: formatTime(time),
    start,
    stop,
    reset,
  };
}
