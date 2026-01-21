"use client";

import { useRef, useEffect } from "react";

interface WebcamOverlayProps {
  stream: MediaStream | null;
  isActive: boolean;
  className?: string;
}

export function WebcamOverlay({
  stream,
  isActive,
  className = "",
}: WebcamOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!isActive || !stream) {
    return null;
  }

  return (
    <div
      className={`absolute bottom-4 left-4 w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-700 shadow-xl ${className}`}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover scale-x-[-1]"
      />
    </div>
  );
}
