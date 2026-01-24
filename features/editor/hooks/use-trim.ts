"use client";

import { useState, useCallback, useMemo } from "react";

export interface TrimState {
  trimStart: number;
  trimEnd: number;
}

export interface UseTrimReturn {
  trimStart: number;
  trimEnd: number;
  trimmedDuration: number;
  isTrimmed: boolean;
  setTrimStart: (time: number) => void;
  setTrimEnd: (time: number) => void;
  setTrimRange: (start: number, end: number) => void;
  resetTrim: (duration: number) => void;
}

export function useTrim(initialDuration: number = 0): UseTrimReturn {
  const [trimStart, setTrimStartState] = useState(0);
  const [trimEnd, setTrimEndState] = useState(initialDuration || 0);

  const setTrimStart = useCallback(
    (time: number) => {
      // Ensure start doesn't exceed end - 0.1 seconds minimum
      setTrimStartState(Math.max(0, Math.min(time, trimEnd - 0.1)));
    },
    [trimEnd],
  );

  const setTrimEnd = useCallback(
    (time: number) => {
      // Ensure end doesn't go below start + 0.1 seconds minimum
      setTrimEndState(Math.max(trimStart + 0.1, time));
    },
    [trimStart],
  );

  const setTrimRange = useCallback((start: number, end: number) => {
    if (end > start + 0.1) {
      setTrimStartState(Math.max(0, start));
      setTrimEndState(end);
    }
  }, []);

  const resetTrim = useCallback((duration: number) => {
    setTrimStartState(0);
    setTrimEndState(duration);
  }, []);

  const trimmedDuration = useMemo(() => {
    return Math.max(0, trimEnd - trimStart);
  }, [trimStart, trimEnd]);

  const isTrimmed = useMemo(() => {
    return trimStart > 0 || (trimEnd > 0 && trimEnd < initialDuration);
  }, [trimStart, trimEnd, initialDuration]);

  return {
    trimStart,
    trimEnd,
    trimmedDuration,
    isTrimmed,
    setTrimStart,
    setTrimEnd,
    setTrimRange,
    resetTrim,
  };
}
