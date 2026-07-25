"use client";

import React from "react";
import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon } from "lucide-react";
import { useEditorStore } from "@/store/use-editor-store";
import { TEXT_ALIGNMENTS } from "@/constants/editor";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AlignButton = React.memo(() => {
    const editor = useEditorStore((state) => state.editor);

    const iconMap = {
        left: AlignLeftIcon,
        center: AlignCenterIcon,
        right: AlignRightIcon,
        justify: AlignJustifyIcon,
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Text alignment"
                    title="Text alignment"
                    className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 overflow-hidden text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
                >
                    <AlignLeftIcon className="size-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-1 flex flex-col gap-y-1 z-50">
                {TEXT_ALIGNMENTS.map(({ label, value }) => {
                    const Icon = iconMap[value as keyof typeof iconMap];
                    return (
                        <button
                            type="button"
                            key={value}
                            onClick={() => editor?.chain().focus().setTextAlign(value).run()}
                            className={cn(
                                "flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80 w-full text-left text-sm transition-colors",
                                editor?.isActive({ textAlign: value }) && "bg-neutral-200/80 font-medium"
                            )}
                        >
                            <Icon className="size-4 shrink-0" />
                            <span>{label}</span>
                        </button>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
});

AlignButton.displayName = "AlignButton";
