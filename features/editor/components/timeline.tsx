"use client";

import { useMemo, useRef, useCallback } from "react";

interface TimelineProps {
  duration: number;
  currentTime: number;
  isRecording?: boolean;
  onSeek?: (percent: number) => void;
}

export function Timeline({
  duration,
  currentTime,
  isRecording = false,
  onSeek,
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);

  // Generate a simple visual waveform pattern - always generate 120 bars
  const waveformBars = useMemo(() => {
    const bars: number[] = [];
    const barCount = 120;
    for (let i = 0; i < barCount; i++) {
      const height = Math.sin(i * 0.3) * 20 + Math.sin(i * 0.7) * 15 + 35;
      bars.push(Math.max(10, Math.min(70, height)));
    }
    return bars;
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!timelineRef.current || !onSeek || duration <= 0) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = (x / rect.width) * 100;
      onSeek(Math.max(0, Math.min(100, percent)));
    },
    [onSeek, duration],
  );

  return (
    <div className="bg-card border-t border-border px-4 py-3">
      {/* Waveform visualization */}
      <div
        ref={timelineRef}
        onClick={handleClick}
        className="relative h-16 min-h-[64px] bg-muted/50 rounded-lg overflow-hidden cursor-pointer"
      >
        {/* Played portion overlay - matches playhead exactly */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-primary/20 z-0"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Waveform bars - always visible */}
        <div className="absolute inset-0 flex items-end px-1 z-10">
          {waveformBars.map((height, index) => {
            const barCenterPercent =
              ((index + 0.5) / waveformBars.length) * 100;
            const isPlayed = barCenterPercent <= progressPercent;
            return (
              <div key={index} className="flex-1 flex justify-center pb-1">
                <div
                  className={`w-1 rounded-full ${
                    isRecording
                      ? "bg-amber-500/80"
                      : isPlayed
                        ? "bg-primary"
                        : "bg-muted-foreground/40"
                  }`}
                  style={{ height: `${height}%`, minHeight: "4px" }}
                />
              </div>
            );
          })}
        </div>

        {/* Playhead indicator - show when duration > 0 */}
        {!isRecording && duration > 0 && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-primary z-20 rounded-full shadow-lg"
            style={{
              left: `${progressPercent}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full border-2 border-background" />
          </div>
        )}
      </div>

      {/* Controls below timeline */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <div className="bg-muted rounded-full px-3 py-1 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Clip</span>
        </div>
        <div className="text-xs text-muted-foreground">7x @ 1x</div>
      </div>
    </div>
  );
}
