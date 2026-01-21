"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowTurnBackwardIcon,
  ArrowTurnForwardIcon,
  MoreVerticalCircle01Icon,
  Idea01Icon,
  Bug01Icon,
} from "@hugeicons/core-free-icons";

interface HeaderBarProps {
  title: string;
  onTitleChange?: (newTitle: string) => void;
  onExport?: () => void;
  isExporting?: boolean;
}

export function HeaderBar({
  title,
  onTitleChange,
  onExport,
  isExporting = false,
}: HeaderBarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleTitleClick = () => {
    setEditValue(title);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && onTitleChange) {
      onTitleChange(trimmedValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  const handleFeatureRequest = () => {
    window.open(
      "https://github.com/your-repo/issues/new?labels=enhancement&template=feature_request.md",
      "_blank",
    );
  };

  const handleBugReport = () => {
    window.open(
      "https://github.com/your-repo/issues/new?labels=bug&template=bug_report.md",
      "_blank",
    );
  };

  return (
    <header className="relative flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
      {/* Left: Menu */}
      <div className="flex items-center gap-2 z-10">
        <Button variant="ghost" size="icon-sm">
          <HugeiconsIcon icon={MoreVerticalCircle01Icon} strokeWidth={2} />
        </Button>
      </div>

      {/* Center: Title & Undo/Redo - Absolutely positioned for true center */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
        <Button variant="ghost" size="icon-sm">
          <HugeiconsIcon icon={ArrowTurnBackwardIcon} strokeWidth={2} />
        </Button>

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="text-sm font-medium text-foreground bg-muted px-2 py-1 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary min-w-[150px] text-center"
          />
        ) : (
          <button
            onClick={handleTitleClick}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-text px-2 py-1 rounded hover:bg-muted/50"
            title="Click to rename"
          >
            {title}
          </button>
        )}

        <Button variant="ghost" size="icon-sm">
          <HugeiconsIcon icon={ArrowTurnForwardIcon} strokeWidth={2} />
        </Button>
      </div>

      {/* Right: Feedback & Export */}
      <div className="flex items-center gap-2 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFeatureRequest}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <HugeiconsIcon icon={Idea01Icon} size={16} strokeWidth={2} />
          <span className="hidden sm:inline">Feature</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBugReport}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <HugeiconsIcon icon={Bug01Icon} size={16} strokeWidth={2} />
          <span className="hidden sm:inline">Report</span>
        </Button>
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
