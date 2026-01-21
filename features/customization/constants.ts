// Preset gradients matching Screen Studio aesthetic
export const PRESET_GRADIENTS = [
  { id: "purple-pink", colors: ["#7c3aed", "#ec4899"], name: "Purple Pink" },
  { id: "blue-cyan", colors: ["#3b82f6", "#06b6d4"], name: "Blue Cyan" },
  { id: "orange-red", colors: ["#f97316", "#ef4444"], name: "Orange Red" },
  { id: "green-teal", colors: ["#22c55e", "#14b8a6"], name: "Green Teal" },
  { id: "pink-rose", colors: ["#ec4899", "#f43f5e"], name: "Pink Rose" },
  { id: "indigo-purple", colors: ["#6366f1", "#a855f7"], name: "Indigo Purple" },
  { id: "cyan-blue", colors: ["#06b6d4", "#3b82f6"], name: "Cyan Blue" },
  { id: "amber-orange", colors: ["#f59e0b", "#f97316"], name: "Amber Orange" },
  { id: "violet-fuchsia", colors: ["#8b5cf6", "#d946ef"], name: "Violet Fuchsia" },
  { id: "emerald-cyan", colors: ["#10b981", "#06b6d4"], name: "Emerald Cyan" },
  { id: "rose-pink", colors: ["#f43f5e", "#ec4899"], name: "Rose Pink" },
  { id: "sky-indigo", colors: ["#0ea5e9", "#6366f1"], name: "Sky Indigo" },
] as const;

export const SOLID_COLORS = [
  { id: "black", color: "#000000", name: "Black" },
  { id: "zinc-900", color: "#18181b", name: "Dark Gray" },
  { id: "zinc-800", color: "#27272a", name: "Gray" },
  { id: "blue", color: "#3b82f6", name: "Blue" },
  { id: "purple", color: "#8b5cf6", name: "Purple" },
  { id: "pink", color: "#ec4899", name: "Pink" },
  { id: "green", color: "#22c55e", name: "Green" },
  { id: "orange", color: "#f97316", name: "Orange" },
] as const;

export type PresetGradient = (typeof PRESET_GRADIENTS)[number];
export type SolidColor = (typeof SOLID_COLORS)[number];

export type BackgroundType = "wallpaper" | "gradient" | "color" | "image";

export interface BackgroundConfig {
  type: BackgroundType;
  value: string | string[];
}
