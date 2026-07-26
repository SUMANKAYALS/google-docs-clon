"use client";

import React from "react";
import { ChevronDownIcon } from "lucide-react";
import { useEditorStore } from "@/store/use-editor-store";
import { FONT_FAMILIES } from "@/constants/editor";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const FontFamilyButton = React.memo(() => {
    const editor = useEditorStore((state) => state.editor);

    const currentFont = editor?.getAttributes("textStyle").fontFamily || "Arial";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Font family"
                    title="Font family"
                    className="h-7 w-[120px] shrink-0 flex items-center justify-between px-1.5 rounded-sm hover:bg-neutral-200/80 dark:hover:bg-zinc-700/80 text-gray-700 dark:text-zinc-300 overflow-hidden text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
                >
                    <span className="truncate">{currentFont}</span>
                    <ChevronDownIcon className="ml-1 size-4 shrink-0" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-1 flex flex-col gap-y-1 z-50">
                {FONT_FAMILIES.map(({ label, value }) => (
                    <button
                        type="button"
                        key={value}
                        onClick={() => editor?.chain().focus().setFontFamily(value).run()}
                        className={cn(
                            "flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-neutral-200/80 dark:hover:bg-zinc-700/80 text-left text-sm w-full transition-colors text-gray-700 dark:text-zinc-300",
                            editor?.getAttributes("textStyle").fontFamily === value && "bg-neutral-200/80 dark:bg-zinc-700/80 font-medium text-gray-900 dark:text-zinc-100"
                        )}
                        style={{ fontFamily: value }}
                    >
                        <span>{label}</span>
                    </button>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
});

FontFamilyButton.displayName = "FontFamilyButton";
