"use client";

import { useCallback, useRef, useState } from "react";

interface TrimHandlesProps {
  duration: number;
  trimStart: number;
  trimEnd: number;
  onTrimStartChange: (time: number) => void;
  onTrimEndChange: (time: number) => void;
}

export function TrimHandles({
  duration,
  trimStart,
  trimEnd,
  onTrimStartChange,
  onTrimEndChange,
}: TrimHandlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"start" | "end" | null>(null);

  const getTimeFromPosition = useCallback(
    (clientX: number): number => {
      if (!containerRef.current || duration <= 0) return 0;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      return percent * duration;
    },
    [duration],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, handle: "start" | "end") => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(handle);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const time = getTimeFromPosition(moveEvent.clientX);
        if (handle === "start") {
          onTrimStartChange(time);
        } else {
          onTrimEndChange(time);
        }
      };

      const handleMouseUp = () => {
        setDragging(null);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [getTimeFromPosition, onTrimStartChange, onTrimEndChange],
  );

  const startPercent = duration > 0 ? (trimStart / duration) * 100 : 0;
  const endPercent = duration > 0 ? (trimEnd / duration) * 100 : 100;

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {/* Trimmed out regions (darkened) */}
      <div
        className="absolute top-0 bottom-0 left-0 bg-black/50 z-30"
        style={{ width: `${startPercent}%` }}
      />
      <div
        className="absolute top-0 bottom-0 right-0 bg-black/50 z-30"
        style={{ width: `${100 - endPercent}%` }}
      />

      {/* Left trim handle */}
      <div
        className="absolute top-0 bottom-0 z-40 pointer-events-auto cursor-ew-resize group"
        style={{ left: `${startPercent}%`, transform: "translateX(-50%)" }}
        onMouseDown={(e) => handleMouseDown(e, "start")}
      >
        <div
          className={`
            w-1 h-full bg-amber-500 rounded-full
            ${dragging === "start" ? "bg-amber-400" : "group-hover:bg-amber-400"}
          `}
        />
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 -left-1.5 w-4 h-8 
            bg-amber-500 rounded-sm flex items-center justify-center
            ${dragging === "start" ? "bg-amber-400" : "group-hover:bg-amber-400"}
          `}
        >
          <div className="flex flex-col gap-0.5">
            <div className="w-0.5 h-1 bg-amber-900/50 rounded-full" />
            <div className="w-0.5 h-1 bg-amber-900/50 rounded-full" />
            <div className="w-0.5 h-1 bg-amber-900/50 rounded-full" />
          </div>
        </div>
      </div>

      {/* Right trim handle */}
      <div
        className="absolute top-0 bottom-0 z-40 pointer-events-auto cursor-ew-resize group"
        style={{ left: `${endPercent}%`, transform: "translateX(-50%)" }}
        onMouseDown={(e) => handleMouseDown(e, "end")}
      >
        <div
          className={`
            w-1 h-full bg-amber-500 rounded-full
            ${dragging === "end" ? "bg-amber-400" : "group-hover:bg-amber-400"}
          `}
        />
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 -right-1.5 w-4 h-8 
            bg-amber-500 rounded-sm flex items-center justify-center
            ${dragging === "end" ? "bg-amber-400" : "group-hover:bg-amber-400"}
          `}
        >
          <div className="flex flex-col gap-0.5">
            <div className="w-0.5 h-1 bg-amber-900/50 rounded-full" />
            <div className="w-0.5 h-1 bg-amber-900/50 rounded-full" />
            <div className="w-0.5 h-1 bg-amber-900/50 rounded-full" />
          </div>
        </div>
      </div>

      {/* Active trim region border */}
      <div
        className="absolute top-0 bottom-0 border-t-2 border-b-2 border-amber-500/50 z-25"
        style={{
          left: `${startPercent}%`,
          width: `${endPercent - startPercent}%`,
        }}
      />
    </div>
  );
}
