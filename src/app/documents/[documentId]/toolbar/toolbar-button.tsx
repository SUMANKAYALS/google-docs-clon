"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { type ToolbarButtonProps } from "@/types";

export const ToolbarButton = React.memo(({
    onClick,
    isActive,
    icon: Icon,
    label,
}: ToolbarButtonProps) => {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            aria-pressed={isActive}
            className={cn(
                "text-sm h-7 min-w-7 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors",
                isActive && "bg-neutral-200/80 text-primary"
            )}
        >
            <Icon className="size-4 shrink-0" />
        </button>
    );
});

ToolbarButton.displayName = "ToolbarButton";
