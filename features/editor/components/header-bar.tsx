"use client";

import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowTurnBackwardIcon,
  ArrowTurnForwardIcon,
  MoreVerticalCircle01Icon,
} from "@hugeicons/core-free-icons";

interface HeaderBarProps {
  title: string;
  onExport?: () => void;
  isExporting?: boolean;
}

export function HeaderBar({
  title,
  onExport,
  isExporting = false,
}: HeaderBarProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
      {/* Left: Menu */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm">
          <HugeiconsIcon icon={MoreVerticalCircle01Icon} strokeWidth={2} />
        </Button>
      </div>

      {/* Center: Title & Undo/Redo */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm">
          <HugeiconsIcon icon={ArrowTurnBackwardIcon} strokeWidth={2} />
        </Button>

        <span className="text-sm font-medium text-zinc-300">{title}</span>

        <Button variant="ghost" size="icon-sm">
          <HugeiconsIcon icon={ArrowTurnForwardIcon} strokeWidth={2} />
        </Button>
      </div>

      {/* Right: Presets & Export */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          Presets
        </Button>
        <Button
          size="sm"
          onClick={onExport}
          disabled={isExporting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Export
        </Button>
      </div>
    </header>
  );
}
