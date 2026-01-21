"use client";

interface PaddingControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function PaddingControl({
  value,
  onChange,
  min = 0,
  max = 100,
}: PaddingControlProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Padding</h4>
        <span className="text-xs text-muted-foreground">{value}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
      />
    </div>
  );
}
