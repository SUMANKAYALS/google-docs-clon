"use client";

import React, { useState } from "react";
import { Link2Icon } from "lucide-react";
import { useEditorStore } from "@/store/use-editor-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const LinkButton = React.memo(() => {
    const editor = useEditorStore((state) => state.editor);
    const [value, setValue] = useState(editor?.getAttributes("link").href || "");

    const onChange = (href: string) => {
        editor?.chain().focus().extendMarkRange("link").setLink({ href }).run();
        setValue("");
    };

    return (
        <DropdownMenu
            onOpenChange={(open) => {
                if (open) {
                    setValue(editor?.getAttributes("link").href || "");
                }
            }}
        >
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Insert link"
                    title="Insert link"
                    className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 dark:hover:bg-zinc-700/80 text-gray-700 dark:text-zinc-300 overflow-hidden text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
                >
                    <Link2Icon className="size-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2.5 flex items-center gap-x-2 z-50">
                <Input
                    placeholder="https://example.com"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onChange(value);
                        }
                    }}
                    aria-label="Link URL input"
                />
                <Button size="sm" onClick={() => onChange(value)}>
                    Apply
                </Button>
            </DropdownMenuContent>
        </DropdownMenu>
    );
});

LinkButton.displayName = "LinkButton";
