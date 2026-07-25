"use client";

import React from "react";
import { ChevronDownIcon } from "lucide-react";
import { type Level } from "@tiptap/extension-heading";
import { useEditorStore } from "@/store/use-editor-store";
import { HEADING_LEVELS } from "@/constants/editor";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const HeadingLevelButton = React.memo(() => {
    const editor = useEditorStore((state) => state.editor);

    const getCurrentHeading = () => {
        for (let level = 1; level <= 5; level++) {
            if (editor?.isActive("heading", { level })) {
                return `Heading ${level}`;
            }
        }
        return "Normal text";
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Text style"
                    title="Text style"
                    className="h-7 min-w-7 px-1.5 shrink-0 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 overflow-hidden text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
                >
                    <span className="truncate">{getCurrentHeading()}</span>
                    <ChevronDownIcon className="ml-1 size-4 shrink-0" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-1 flex flex-col gap-y-1 z-50">
                {HEADING_LEVELS.map(({ label, value, fontSize }) => (
                    <button
                        type="button"
                        key={value}
                        style={{ fontSize }}
                        onClick={() => {
                            if (value === 0) {
                                editor?.chain().focus().setParagraph().run();
                            } else {
                                editor?.chain().focus().toggleHeading({ level: value as Level }).run();
                            }
                        }}
                        className={cn(
                            "flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80 text-left w-full transition-colors",
                            ((value === 0 && !editor?.isActive("heading")) ||
                                editor?.isActive("heading", { level: value })) &&
                                "bg-neutral-200/80 font-semibold"
                        )}
                    >
                        {label}
                    </button>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
});

HeadingLevelButton.displayName = "HeadingLevelButton";
