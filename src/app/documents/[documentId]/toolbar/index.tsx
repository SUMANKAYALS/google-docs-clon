"use client";

import React from "react";
import {
    BoldIcon,
    ItalicIcon,
    Redo2Icon,
    SparklesIcon,
    UnderlineIcon,
    Undo2Icon,
} from "lucide-react";
import { useEditorStore } from "@/store/use-editor-store";
import { Separator } from "@/components/ui/separator";

import { ToolbarButton } from "./toolbar-button";
import { FontFamilyButton } from "./font-family-button";
import { HeadingLevelButton } from "./heading-level-button";
import { FontSizeButton } from "./font-size-button";
import { LinkButton } from "./link-button";
import { ImageButton } from "./image-button";
import { TableButton } from "./table-button";
import { AlignButton } from "./align-button";
import { ListButton } from "./list-button";
import { TextColorButton } from "./text-color-button";
import { HighlightColorButton } from "./highlight-color-button";

interface ToolbarProps {
    onOpenAIAssistant?: () => void;
}

export const Toolbar = React.memo(({ onOpenAIAssistant }: ToolbarProps) => {
    const editor = useEditorStore((state) => state.editor);

    return (
        <div
            role="toolbar"
            aria-label="Editor toolbar"
            className="flex min-h-[40px] items-center gap-1 overflow-x-auto rounded-full border border-[var(--border)] bg-[var(--toolbar-bg)] px-1.5 py-1 shadow-sm print:hidden text-gray-700 dark:text-zinc-350"
        >
            <button type="button" onClick={onOpenAIAssistant} className="flex h-7 items-center gap-1 rounded-sm border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/30 px-2 text-sm font-medium text-blue-700 dark:text-blue-450 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/30">
                <SparklesIcon className="size-4" />
                <span className="hidden md:inline">AI Assistant</span>
            </button>
            <Separator orientation="vertical" className="mx-0.5 h-6 bg-[var(--border)]" />
            <ToolbarButton
                label="Undo"
                icon={Undo2Icon}
                onClick={() => editor?.chain().focus().undo().run()}
            />
            <ToolbarButton
                label="Redo"
                icon={Redo2Icon}
                onClick={() => editor?.chain().focus().redo().run()}
            />
            <Separator orientation="vertical" className="mx-0.5 h-6 bg-[var(--border)]" />
            <ToolbarButton
                label="Bold"
                icon={BoldIcon}
                isActive={editor?.isActive("bold")}
                onClick={() => editor?.chain().focus().toggleBold().run()}
            />
            <ToolbarButton
                label="Italic"
                icon={ItalicIcon}
                isActive={editor?.isActive("italic")}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
            />
            <ToolbarButton
                label="Underline"
                icon={UnderlineIcon}
                isActive={editor?.isActive("underline")}
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
            />
            <TextColorButton />
            <HighlightColorButton />
            <Separator orientation="vertical" className="mx-0.5 h-6 bg-[var(--border)]" />
            <FontFamilyButton />
            <HeadingLevelButton />
            <FontSizeButton />
            <Separator orientation="vertical" className="mx-0.5 h-6 bg-[var(--border)]" />
            <AlignButton />
            <ListButton />
            <Separator orientation="vertical" className="mx-0.5 h-6 bg-[var(--border)]" />
            <LinkButton />
            <ImageButton />
            <TableButton />
        </div>
    );
});

Toolbar.displayName = "Toolbar";
