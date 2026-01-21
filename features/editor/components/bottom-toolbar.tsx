"use client";

import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Backward01Icon,
  Forward01Icon,
  PlayIcon,
  PauseIcon,
  RecordIcon,
} from "@hugeicons/core-free-icons";

interface BottomToolbarProps {
  isPlaying: boolean;
  currentTime: string;
  duration: string;
  onPlay: () => void;
  onPause: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onNewRecording?: () => void;
}

export function BottomToolbar({
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onSkipForward,
  onSkipBackward,
  onNewRecording,
}: BottomToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card/50">
      {/* Left: Aspect ratio & Crop */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5">
          <span className="text-xs">Wide</span>
          <span className="text-xs text-muted-foreground">16:9</span>
        </Button>
        <Button variant="outline" size="sm">
          Crop
        </Button>
      </div>

      {/* Center: Playback Controls */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onSkipBackward}>
          <HugeiconsIcon icon={Backward01Icon} strokeWidth={2} />
        </Button>

        {isPlaying ? (
          <Button onClick={onPause} size="icon" variant="outline">
            <HugeiconsIcon icon={PauseIcon} strokeWidth={2} />
          </Button>
        ) : (
          <Button onClick={onPlay} size="icon">
            <HugeiconsIcon icon={PlayIcon} strokeWidth={2} />
          </Button>
        )}

        <Button variant="ghost" size="icon" onClick={onSkipForward}>
          <HugeiconsIcon icon={Forward01Icon} strokeWidth={2} />
        </Button>

        {onNewRecording && (
          <Button
            onClick={onNewRecording}
            variant="outline"
            size="icon"
            className="ml-2"
          >
            <HugeiconsIcon icon={RecordIcon} strokeWidth={2} />
          </Button>
        )}
      </div>

      {/* Right: Time & Speed */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground font-mono tabular-nums">
          {currentTime} / {duration}
        </span>
        <Button variant="outline" size="sm">
          1x
        </Button>
      </div>
    </div>
  );
}
