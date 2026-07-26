"use client";

import React, { useState } from "react";
import { HighlighterIcon, Check, Plus } from "lucide-react";
import { type ColorResult, SketchPicker } from "react-color";
import { useEditorStore } from "@/store/use-editor-store";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const PRESET_HIGHLIGHT_COLORS = [
  "#ffff00", // Yellow
  "#00ff00", // Green
  "#00ffff", // Blue/Cyan
  "#ff00ff", // Pink/Magenta
  "#ff9900", // Orange
  "#9900ff", // Purple
  "#b7b7b7", // Gray
  "#fff2cc", // Light Yellow
  "#d9ead3", // Light Green
  "#cfe2f3", // Light Blue
];

export const HighlightColorButton = React.memo(() => {
    const editor = useEditorStore((state) => state.editor);
    const [showCustomPicker, setShowCustomPicker] = useState(false);

    const value = editor?.getAttributes("highlight").color || "transparent";

    const applyHighlight = (colorHex: string) => {
        editor?.chain().focus().setHighlight({ color: colorHex }).run();
    };

    const handleClear = () => {
        editor?.chain().focus().unsetHighlight().run();
    };

    const handleCustomChange = (color: ColorResult) => {
        applyHighlight(color.hex);
    };

    return (
        <DropdownMenu onOpenChange={() => setShowCustomPicker(false)}>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Highlight color"
                    title="Highlight color"
                    className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 overflow-hidden text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors px-1"
                >
                    <HighlighterIcon className="size-4" />
                    <div className="h-0.5 w-4 rounded-full mt-0.5" style={{ backgroundColor: value === "transparent" ? "transparent" : value, border: value === "transparent" ? "1px solid currentColor" : "none" }} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-3 w-64 z-50 rounded-xl shadow-xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 flex flex-col gap-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 select-none uppercase tracking-wider">Highlight Color</span>
                    <Button variant="ghost" size="sm" onClick={handleClear} className="h-6 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 px-2">
                        None
                    </Button>
                </div>

                {/* Preset Highlighter Colors */}
                <div className="flex flex-col gap-y-1">
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-zinc-500 select-none uppercase tracking-wide">Presets</span>
                    <div className="grid grid-cols-5 gap-1.5">
                        {PRESET_HIGHLIGHT_COLORS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                className="h-8 rounded-md border border-black/10 dark:border-white/10 relative transition-transform hover:scale-105 flex items-center justify-center"
                                style={{ backgroundColor: color }}
                                onClick={() => applyHighlight(color)}
                                title={color}
                            >
                                {value === color && <Check className="size-3 text-white mix-blend-difference" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Color Selector */}
                <div className="border-t border-neutral-100 dark:border-zinc-800 pt-2 flex flex-col gap-y-2">
                    <button
                        type="button"
                        onClick={() => setShowCustomPicker(!showCustomPicker)}
                        className="flex items-center justify-center gap-x-1.5 w-full py-1 rounded text-xs font-medium bg-neutral-50 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-neutral-100 dark:hover:bg-zinc-700/80 transition-colors"
                    >
                        <Plus className="size-3" />
                        <span>Custom Highlight</span>
                    </button>

                    {showCustomPicker && (
                        <div className="mt-1 flex justify-center w-full max-w-[230px] overflow-hidden rounded border border-neutral-200 dark:border-zinc-800 bg-white">
                            <SketchPicker
                                color={value === "transparent" ? "#ffffff" : value}
                                onChange={handleCustomChange}
                                disableAlpha
                                width="220px"
                            />
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
});

HighlightColorButton.displayName = "HighlightColorButton";
