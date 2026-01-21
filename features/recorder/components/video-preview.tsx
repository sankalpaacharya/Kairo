"use client";

import { useMemo, useEffect, type RefObject } from "react";

interface VideoPreviewProps {
  recordedBlob: Blob | null;
  isRecording: boolean;
  videoRef?: RefObject<HTMLVideoElement | null>;
  className?: string;
}

export function VideoPreview({
  recordedBlob,
  isRecording,
  videoRef,
  className = "",
}: VideoPreviewProps) {
  const videoUrl = useMemo(() => {
    if (recordedBlob) {
      return URL.createObjectURL(recordedBlob);
    }
    return null;
  }, [recordedBlob]);

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  if (!recordedBlob && !isRecording) {
    return (
      <div
        className={`flex items-center justify-center bg-muted/50 rounded-2xl aspect-video ${className}`}
      >
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">No recording yet</p>
          <p className="text-sm mt-1">Click Start to begin recording</p>
        </div>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div
        className={`flex items-center justify-center bg-muted/80 rounded-2xl aspect-video ${className}`}
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="text-red-500 font-medium">Recording...</span>
          </div>
          <p className="text-sm text-muted-foreground">Recording your screen</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      <video
        ref={videoRef}
        src={videoUrl ?? undefined}
        className="w-full aspect-video bg-black"
      />
    </div>
  );
}
