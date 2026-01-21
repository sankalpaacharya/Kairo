"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseWebcamReturn {
  stream: MediaStream | null;
  isActive: boolean;
  toggle: () => Promise<void>;
  stop: () => void;
}

export function useWebcam(): UseWebcamReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const toggle = useCallback(async () => {
    if (isActive && streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
      setIsActive(false);
    } else {
      try {
        const webcamStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: "user" },
          audio: false,
        });
        streamRef.current = webcamStream;
        setStream(webcamStream);
        setIsActive(true);
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    }
  }, [isActive]);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
      setIsActive(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return { stream, isActive, toggle, stop };
}
