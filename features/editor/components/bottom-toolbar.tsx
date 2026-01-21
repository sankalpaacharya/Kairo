"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Backward01Icon,
  Forward01Icon,
  PlayIcon,
  PauseIcon,
  RecordIcon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";

export type AspectRatioOption = "16:9" | "9:16" | "4:3" | "1:1" | "auto";

export interface AspectRatioConfig {
  label: string;
  value: AspectRatioOption;
  ratio: number | null; // null for auto
}

export const ASPECT_RATIOS: AspectRatioConfig[] = [
  { label: "Wide", value: "16:9", ratio: 16 / 9 },
  { label: "Portrait", value: "9:16", ratio: 9 / 16 },
  { label: "Standard", value: "4:3", ratio: 4 / 3 },
  { label: "Square", value: "1:1", ratio: 1 },
  { label: "Auto", value: "auto", ratio: null },
];

interface BottomToolbarProps {
  isPlaying: boolean;
  currentTime: string;
  duration: string;
  aspectRatio: AspectRatioOption;
  onPlay: () => void;
  onPause: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onAspectRatioChange: (ratio: AspectRatioOption) => void;
  onNewRecording?: () => void;
  onCropClick?: () => void;
}

export function BottomToolbar({
  isPlaying,
  currentTime,
  duration,
  aspectRatio,
  onPlay,
  onPause,
  onSkipForward,
  onSkipBackward,
  onAspectRatioChange,
  onNewRecording,
  onCropClick,
}: BottomToolbarProps) {
  const currentRatioConfig =
    ASPECT_RATIOS.find((r) => r.value === aspectRatio) || ASPECT_RATIOS[0];

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card/50">
      {/* Left: Aspect ratio & Crop */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <span className="text-xs">{currentRatioConfig.label}</span>
              <span className="text-xs text-muted-foreground">
                {currentRatioConfig.value}
              </span>
              <HugeiconsIcon icon={ArrowDown01Icon} size={14} strokeWidth={2} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {ASPECT_RATIOS.map((ratio) => (
              <DropdownMenuItem
                key={ratio.value}
                onClick={() => onAspectRatioChange(ratio.value)}
                className={aspectRatio === ratio.value ? "bg-accent" : ""}
              >
                <span className="font-medium">{ratio.label}</span>
                <span className="ml-2 text-muted-foreground">
                  {ratio.value}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="sm" onClick={onCropClick}>
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
