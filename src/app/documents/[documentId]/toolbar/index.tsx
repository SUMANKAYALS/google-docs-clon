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

interface ToolbarProps {
    onOpenAIAssistant?: () => void;
}

export const Toolbar = React.memo(({ onOpenAIAssistant }: ToolbarProps) => {
    const editor = useEditorStore((state) => state.editor);

    return (
        <div
            role="toolbar"
            aria-label="Editor toolbar"
            className="flex min-h-[40px] items-center gap-1 overflow-x-auto rounded-full border border-neutral-200 bg-neutral-50/90 px-1.5 py-1 shadow-sm print:hidden"
        >
            <button type="button" onClick={onOpenAIAssistant} className="flex h-7 items-center gap-1 rounded-sm border border-blue-200 bg-blue-50 px-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100">
                <SparklesIcon className="size-4" />
                <span className="hidden md:inline">AI Assistant</span>
            </button>
            <Separator orientation="vertical" className="mx-0.5 h-6 bg-neutral-300" />
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
            <Separator orientation="vertical" className="mx-0.5 h-6 bg-neutral-300" />
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
            <Separator orientation="vertical" className="mx-0.5 h-6 bg-neutral-300" />
            <FontFamilyButton />
            <HeadingLevelButton />
            <FontSizeButton />
            <Separator orientation="vertical" className="mx-0.5 h-6 bg-neutral-300" />
            <AlignButton />
            <ListButton />
            <Separator orientation="vertical" className="mx-0.5 h-6 bg-neutral-300" />
            <LinkButton />
            <ImageButton />
            <TableButton />
        </div>
    );
});

Toolbar.displayName = "Toolbar";
