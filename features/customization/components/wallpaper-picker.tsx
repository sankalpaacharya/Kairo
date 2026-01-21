"use client";

import { PRESET_GRADIENTS } from "../constants";

interface WallpaperPickerProps {
  selected: string | null;
  onSelect: (gradientId: string, colors: readonly string[]) => void;
}

export function WallpaperPicker({ selected, onSelect }: WallpaperPickerProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground">Wallpaper</h4>
      <div className="grid grid-cols-4 gap-2">
        {PRESET_GRADIENTS.map((gradient) => (
          <button
            key={gradient.id}
            onClick={() => onSelect(gradient.id, gradient.colors)}
            className={`
              aspect-square rounded-lg transition-all
              ${selected === gradient.id ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : "hover:scale-105"}
            `}
            style={{
              background: `linear-gradient(135deg, ${gradient.colors[0]}, ${gradient.colors[1]})`,
            }}
            title={gradient.name}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Background gradients were created by{" "}
        <a href="#" className="text-primary hover:underline">
          raycatt.com
        </a>
      </p>
    </div>
  );
}
