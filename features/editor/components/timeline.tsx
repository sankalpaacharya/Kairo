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

  // Generate a simple visual waveform pattern
  const waveformBars = useMemo(() => {
    const bars = [];
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
        className="relative h-16 bg-muted/50 rounded-lg overflow-hidden cursor-pointer"
      >
        {/* Played portion overlay */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-primary/20 z-0"
          style={{ width: `${progressPercent}%` }}
        />

        <div className="absolute inset-0 flex items-end justify-around px-1 z-10">
          {waveformBars.map((height, index) => {
            const barPercent = (index / waveformBars.length) * 100;
            const isPlayed = barPercent <= progressPercent;
            return (
              <div
                key={index}
                className={`
                  w-1 rounded-full transition-colors
                  ${isRecording ? "bg-amber-500/80" : isPlayed ? "bg-primary" : "bg-muted-foreground/30"}
                `}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>

        {/* Playhead indicator */}
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
