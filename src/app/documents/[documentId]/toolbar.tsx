"use client";

import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/use-editor-store";
import { Separator } from "@/components/ui/separator"
import { BoldIcon, ItalicIcon, ListTodoIcon, LucideIcon, MessageSquarePlusIcon, PrinterIcon, Redo2Icon, RemoveFormattingIcon, SpellCheck, SpellCheckIcon, UnderlineIcon, Undo2Icon } from "lucide-react";

interface ToolbarButtonProps {
    onClick?: () => void;
    isActive?: boolean;
    icon: LucideIcon;
};

const ToolbarButton = ({
    onClick,
    isActive,
    icon: Icon,
}: ToolbarButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "text-sm h-7 min-w-7 flex items-center justify-center rounded-sm hover:bg-neutral-200/80",
                isActive && "bg-neutral-200/80"
            )}
        >
            <Icon className="size-4" />
        </button>
    );
}



export const Toolbar = () => {
    const { editor } = useEditorStore();
    console.log("toolber editor", { editor });



    const section: {
        label: string;
        icon: LucideIcon;
        onClick: () => void;
        isActive?: boolean
    }[][] = [
            [
                {
                    label: "Undo",
                    icon: Undo2Icon,
                    onClick: () => editor?.chain().focus().undo().run(),
                },
                {
                    label: "Redo",
                    icon: Redo2Icon,
                    onClick: () => editor?.chain().focus().redo().run(),
                },
                {
                    label: "Print",
                    icon: PrinterIcon,
                    onClick: () => window.print(),
                },
                {
                    label: "Spell check",
                    icon: SpellCheckIcon,
                    onClick: () => {
                        const current = editor?.view.dom.getAttribute("spellcheck");
                        editor?.view.dom.setAttribute("spellcheck", current === "false" ? "true" : "false")
                    },
                },
            ],
            [
                {
                    label: "Bold",
                    icon: BoldIcon,
                    isActive: editor?.isActive("bold"),
                    onClick: () => editor?.chain().focus().toggleBold().run(),
                },
                {
                    label: "Italic",
                    icon: ItalicIcon,
                    isActive: editor?.isActive("italic"),
                    onClick: () => editor?.chain().focus().toggleItalic().run(),
                },
                {
                    label: "UnderLine",
                    icon: UnderlineIcon,
                    isActive: editor?.isActive("underline"),
                    onClick: () => editor?.chain().focus().toggleUnderline().run(),
                },
            ],
            [
                {
                    label: "Comment",
                    icon: MessageSquarePlusIcon,
                    onClick: () => console.log("todo: Comment"),
                    isActive: false, // todo: Enable this functionality
                },
                {
                    label: "List Todo",
                    icon: ListTodoIcon,
                    onClick: () => editor?.chain().focus().toggleTaskList().run(),
                    isActive: editor?.isActive("taskList"),
                },
                {
                    label: "Remove Formatting",
                    icon: RemoveFormattingIcon,
                    onClick: () => editor?.chain().focus().unsetAllMarks().run(),
                    // isActive: editor?.isActive("taskList"),
                },
            ],
        ];


    return (
        <div className="bg-[#F1F4F9] px-2.5 py-0.5 rounded-[24px] min-h-[40px] flex items-center gap-x-0.5 overflow-x-auto">
            {
                section[0].map((item) => (
                    <ToolbarButton key={item.label} {...item} />
                ))
            }
            <Separator orientation="vertical" className="h-6 bg-neutral-300" />
            {/* todo:  font family */}
            <Separator orientation="vertical" className="h-6 bg-neutral-300" />
            {/* todo: heading */}
            <Separator orientation="vertical" className="h-6 bg-neutral-300" />
            {/* todo: font size */}
            <Separator orientation="vertical" className="h-6 bg-neutral-300" />

            {
                section[1].map((item) => (
                    <ToolbarButton key={item.label} {...item} />
                ))
            }
            {/* todo: text color */}
            {/* todo: highlight color */}
            <Separator orientation="vertical" className="h-6 bg-neutral-300" />
            {/* todo: link */}
            {/* todo: image */}
            {/* todo: align */}
            {/* todo: line height */}
            {/* todo: list */}

            {
                section[2].map((item) => (
                    <ToolbarButton key={item.label} {...item} />
                ))
            }
        </div>
    );
};