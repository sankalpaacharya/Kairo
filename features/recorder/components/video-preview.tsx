"use client";

import { type RefObject } from "react";

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface VideoPreviewProps {
  videoUrl: string | null;
  isRecording: boolean;
  videoRef?: RefObject<HTMLVideoElement | null>;
  className?: string;
  cropArea?: CropArea | null;
}

export function VideoPreview({
  videoUrl,
  isRecording,
  videoRef,
  className = "",
  cropArea,
}: VideoPreviewProps) {
  // Calculate crop styles using CSS clip-path
  const getCropStyles = (): React.CSSProperties => {
    if (
      !cropArea ||
      (cropArea.x === 0 &&
        cropArea.y === 0 &&
        cropArea.width === 100 &&
        cropArea.height === 100)
    ) {
      return {};
    }

    // Use inset clip-path: inset(top right bottom left)
    const top = cropArea.y;
    const left = cropArea.x;
    const bottom = 100 - (cropArea.y + cropArea.height);
    const right = 100 - (cropArea.x + cropArea.width);

    return {
      clipPath: `inset(${top}% ${right}% ${bottom}% ${left}%)`,
    };
  };

  if (!videoUrl && !isRecording) {
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
        style={getCropStyles()}
        playsInline
        preload="auto"
      />
    </div>
  );
}
