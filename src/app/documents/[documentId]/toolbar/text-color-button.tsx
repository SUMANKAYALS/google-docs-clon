"use client";

import React, { useEffect, useState } from "react";
import { type ColorResult, SketchPicker } from "react-color";
import { useEditorStore } from "@/store/use-editor-store";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";

const THEME_COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff",
  "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff",
  "#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc",
  "#dd7e6b", "#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#a4c2f4", "#9fc5e8", "#b4a7d6", "#d5a6bd",
  "#cc4125", "#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#76a5b9", "#8e7cc3", "#c27ba0",
  "#a61c00", "#cc0000", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3c78d8", "#3d85c6", "#674ea7", "#a64d79",
  "#85200c", "#990000", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#1155cc", "#0b5394", "#351c75", "#741b47",
  "#5b0f00", "#660000", "#783f04", "#7f6000", "#274e13", "#0c343d", "#1c4587", "#073763", "#20124d", "#4c1130"
];

const STANDARD_COLORS = [
  "#000000", "#ffffff", "#4a86e8", "#00ffff", "#00ff00", "#ffff00", "#ff9900", "#ff0000", "#9900ff", "#ff00ff"
];

export const TextColorButton = React.memo(() => {
    const editor = useEditorStore((state) => state.editor);
    const [recentColors, setRecentColors] = useState<string[]>([]);
    const [showCustomPicker, setShowCustomPicker] = useState(false);

    const value = editor?.getAttributes("textStyle").color || "#000000";

    useEffect(() => {
        const saved = localStorage.getItem("clouds-docs-recent-colors");
        if (saved) {
            try {
                setRecentColors(JSON.parse(saved));
            } catch {
                // Ignore errors
            }
        }
    }, []);

    const applyColor = (colorHex: string) => {
        editor?.chain().focus().setColor(colorHex).run();
        
        // Save to recents
        if (!recentColors.includes(colorHex)) {
            const updated = [colorHex, ...recentColors.slice(0, 7)];
            setRecentColors(updated);
            localStorage.setItem("clouds-docs-recent-colors", JSON.stringify(updated));
        }
    };

    const handleClear = () => {
        editor?.chain().focus().unsetColor().run();
    };

    const handleCustomChange = (color: ColorResult) => {
        applyColor(color.hex);
    };

    return (
        <DropdownMenu onOpenChange={() => setShowCustomPicker(false)}>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Text color"
                    title="Text color"
                    className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 overflow-hidden text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors px-1"
                >
                    <span className="text-sm font-semibold">A</span>
                    <div className="h-0.5 w-4 rounded-full" style={{ backgroundColor: value }} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-3 w-64 z-50 rounded-xl shadow-xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 flex flex-col gap-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 select-none uppercase tracking-wider">Text Color</span>
                    <Button variant="ghost" size="sm" onClick={handleClear} className="h-6 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 px-2">
                        Reset
                    </Button>
                </div>

                {/* Theme Colors Palette */}
                <div className="flex flex-col gap-y-1">
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-zinc-500 select-none uppercase tracking-wide">Theme Colors</span>
                    <div className="grid grid-cols-10 gap-1">
                        {THEME_COLORS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                className="size-4.5 rounded-sm border border-black/10 dark:border-white/10 relative transition-transform hover:scale-110 flex items-center justify-center"
                                style={{ backgroundColor: color }}
                                onClick={() => applyColor(color)}
                                title={color}
                            >
                                {value === color && <Check className="size-2.5 text-white mix-blend-difference" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Standard Colors Palette */}
                <div className="flex flex-col gap-y-1">
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-zinc-500 select-none uppercase tracking-wide">Standard</span>
                    <div className="grid grid-cols-10 gap-1">
                        {STANDARD_COLORS.map((color) => (
                            <button
                                key={`std-${color}`}
                                type="button"
                                className="size-4.5 rounded-sm border border-black/10 dark:border-white/10 relative transition-transform hover:scale-110 flex items-center justify-center"
                                style={{ backgroundColor: color }}
                                onClick={() => applyColor(color)}
                                title={color}
                            >
                                {value === color && <Check className="size-2.5 text-white mix-blend-difference" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Colors */}
                {recentColors.length > 0 && (
                    <div className="flex flex-col gap-y-1">
                        <span className="text-[10px] font-semibold text-gray-400 dark:text-zinc-500 select-none uppercase tracking-wide">Recent</span>
                        <div className="flex flex-wrap gap-1">
                            {recentColors.map((color) => (
                                <button
                                    key={`rec-${color}`}
                                    type="button"
                                    className="size-4.5 rounded-full border border-black/10 dark:border-white/10 relative transition-transform hover:scale-110 flex items-center justify-center"
                                    style={{ backgroundColor: color }}
                                    onClick={() => applyColor(color)}
                                    title={color}
                                >
                                    {value === color && <Check className="size-2.5 text-white mix-blend-difference" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Custom Color Selector */}
                <div className="border-t border-neutral-100 dark:border-zinc-800 pt-2 flex flex-col gap-y-2">
                    <button
                        type="button"
                        onClick={() => setShowCustomPicker(!showCustomPicker)}
                        className="flex items-center justify-center gap-x-1.5 w-full py-1 rounded text-xs font-medium bg-neutral-50 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-neutral-100 dark:hover:bg-zinc-700/80 transition-colors"
                    >
                        <Plus className="size-3" />
                        <span>Custom Color</span>
                    </button>

                    {showCustomPicker && (
                        <div className="mt-1 flex justify-center w-full max-w-[230px] overflow-hidden rounded border border-neutral-200 dark:border-zinc-800 bg-white">
                            <SketchPicker
                                color={value}
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

TextColorButton.displayName = "TextColorButton";
