"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onCropApply: (cropArea: CropArea) => void;
  currentCrop: CropArea | null;
}

const ASPECT_RATIOS = [
  { label: "Free", value: null },
  { label: "16:9", value: 16 / 9 },
  { label: "9:16", value: 9 / 16 },
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
];

export function CropModal({
  open,
  onOpenChange,
  videoRef,
  onCropApply,
  currentCrop,
}: CropModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [crop, setCrop] = useState<CropArea>({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<"move" | "resize" | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [frameDataUrl, setFrameDataUrl] = useState<string | null>(null);

  // Capture video frame when modal opens
  useEffect(() => {
    if (!open) {
      setFrameDataUrl(null);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    // Wait a bit for video to be ready
    const captureFrame = () => {
      if (video.videoWidth && video.videoHeight) {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setFrameDataUrl(canvas.toDataURL("image/png"));
        }
      }
    };

    // Try immediately, then with delay if video not ready
    if (video.readyState >= 2) {
      captureFrame();
    } else {
      const timer = setTimeout(captureFrame, 100);
      return () => clearTimeout(timer);
    }

    // Initialize crop
    if (currentCrop) {
      setCrop(currentCrop);
    } else {
      setCrop({ x: 0, y: 0, width: 100, height: 100 });
    }
  }, [open, videoRef, currentCrop]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, type: "move" | "resize") => {
      e.preventDefault();
      setIsDragging(true);
      setDragType(type);
      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const dx = ((e.clientX - dragStart.x) / rect.width) * 100;
      const dy = ((e.clientY - dragStart.y) / rect.height) * 100;

      setCrop((prev) => {
        if (dragType === "move") {
          return {
            ...prev,
            x: Math.max(0, Math.min(100 - prev.width, prev.x + dx)),
            y: Math.max(0, Math.min(100 - prev.height, prev.y + dy)),
          };
        } else if (dragType === "resize") {
          let newWidth = Math.max(10, Math.min(100 - prev.x, prev.width + dx));
          let newHeight = Math.max(
            10,
            Math.min(100 - prev.y, prev.height + dy),
          );

          if (selectedRatio) {
            const containerRatio = rect.width / rect.height;
            const targetRatio = selectedRatio / containerRatio;
            newHeight = newWidth / targetRatio;
            if (prev.y + newHeight > 100) {
              newHeight = 100 - prev.y;
              newWidth = newHeight * targetRatio;
            }
          }

          return { ...prev, width: newWidth, height: newHeight };
        }
        return prev;
      });

      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isDragging, dragType, dragStart, selectedRatio],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
  }, []);

  const handleApply = () => {
    onCropApply(crop);
    onOpenChange(false);
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0, width: 100, height: 100 });
    setSelectedRatio(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop Video</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          {ASPECT_RATIOS.map((ratio) => (
            <Button
              key={ratio.label}
              variant={selectedRatio === ratio.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRatio(ratio.value)}
            >
              {ratio.label}
            </Button>
          ))}
        </div>

        {/* Crop Preview */}
        <div
          ref={containerRef}
          className="relative bg-black rounded-lg overflow-hidden select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {frameDataUrl ? (
            <img
              src={frameDataUrl}
              alt="Video frame"
              className="w-full"
              draggable={false}
            />
          ) : (
            <div className="w-full aspect-video flex items-center justify-center text-muted-foreground">
              Loading frame...
            </div>
          )}

          {/* Darkened overlay outside crop area */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(to right, 
                rgba(0,0,0,0.7) ${crop.x}%, 
                transparent ${crop.x}%, 
                transparent ${crop.x + crop.width}%, 
                rgba(0,0,0,0.7) ${crop.x + crop.width}%)`,
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${crop.x}%`,
              width: `${crop.width}%`,
              top: 0,
              height: `${crop.y}%`,
              background: "rgba(0,0,0,0.7)",
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${crop.x}%`,
              width: `${crop.width}%`,
              top: `${crop.y + crop.height}%`,
              bottom: 0,
              background: "rgba(0,0,0,0.7)",
            }}
          />

          <div
            className="absolute border-2 border-primary cursor-move"
            style={{
              left: `${crop.x}%`,
              top: `${crop.y}%`,
              width: `${crop.width}%`,
              height: `${crop.height}%`,
            }}
            onMouseDown={(e) => handleMouseDown(e, "move")}
          >
            {/* Grid lines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>

            {/* Resize handle */}
            <div
              className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary rounded-full cursor-se-resize"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, "resize");
              }}
            />
          </div>
        </div>

        {/* Crop dimensions */}
        <div className="text-sm text-muted-foreground text-center">
          Crop: {Math.round(crop.width)}% × {Math.round(crop.height)}% (at{" "}
          {Math.round(crop.x)}%, {Math.round(crop.y)}%)
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Crop</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
