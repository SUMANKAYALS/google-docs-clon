"use client";

import React from "react";
import { ListCollapseIcon } from "lucide-react";
import { useEditorStore } from "@/store/use-editor-store";
import { LINE_HEIGHTS } from "@/constants/editor";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const LineHeightButton = React.memo(() => {
    const editor = useEditorStore((state) => state.editor);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Line height"
                    title="Line height"
                    className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 overflow-hidden text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
                >
                    <ListCollapseIcon className="size-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-1 flex flex-col gap-y-1 z-50">
                {LINE_HEIGHTS.map(({ label, value }) => (
                    <button
                        type="button"
                        key={value}
                        onClick={() => editor?.chain().focus().setLineHeight(value).run()}
                        className={cn(
                            "flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80 text-left text-sm w-full transition-colors",
                            editor?.getAttributes("paragraph").lineHeight === value && "bg-neutral-200/80 font-medium"
                        )}
                    >
                        <span className="text-sm">{label}</span>
                    </button>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
});

LineHeightButton.displayName = "LineHeightButton";
