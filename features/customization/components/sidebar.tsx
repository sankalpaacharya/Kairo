"use client";

import { useState } from "react";
import { WallpaperPicker } from "./wallpaper-picker";
import { ImagePicker } from "./image-picker";
import { PaddingControl } from "./padding-control";
import type { BackgroundType } from "../constants";

interface SidebarProps {
  background: { colors: string[]; id: string } | null;
  backgroundImage: string | null;
  onBackgroundChange: (id: string, colors: readonly string[]) => void;
  onImageChange: (path: string) => void;
  padding: number;
  onPaddingChange: (value: number) => void;
  blur: number;
  onBlurChange: (value: number) => void;
}

const TABS: { id: BackgroundType; label: string }[] = [
  { id: "wallpaper", label: "Wallpaper" },
  { id: "image", label: "Image" },
];

export function Sidebar({
  background,
  backgroundImage,
  onBackgroundChange,
  onImageChange,
  padding,
  onPaddingChange,
  blur,
  onBlurChange,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<BackgroundType>("wallpaper");

  return (
    <aside className="w-72 bg-card border-l border-border p-4 space-y-6 overflow-y-auto">
      {/* Background Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            Background
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all
                ${
                  activeTab === tab.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "wallpaper" && (
          <WallpaperPicker
            selected={background?.id ?? null}
            onSelect={onBackgroundChange}
          />
        )}

        {activeTab === "image" && (
          <ImagePicker selected={backgroundImage} onSelect={onImageChange} />
        )}
      </div>

      {/* Background Blur */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">
            Background blur
          </h4>
          <span className="text-xs text-muted-foreground">{blur}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={blur}
          onChange={(e) => onBlurChange(Number(e.target.value))}
          className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>

      {/* Shape - Padding */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Shape</h4>
        <PaddingControl value={padding} onChange={onPaddingChange} />
      </div>
    </aside>
  );
}
