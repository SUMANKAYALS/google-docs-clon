"use client";

import React, { useState, useEffect } from "react";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useEditorStore } from "@/store/use-editor-store";

export const FontSizeButton = React.memo(() => {
    const editor = useEditorStore((state) => state.editor);
    const currentFontSizeAttr = editor?.getAttributes("textStyle").fontSize;

    const currentFontSize = currentFontSizeAttr
        ? currentFontSizeAttr.replace("px", "")
        : "16";

    const [fontSize, setFontSize] = useState(currentFontSize);
    const [inputValue, setInputValue] = useState(fontSize);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setFontSize(currentFontSize);
        setInputValue(currentFontSize);
    }, [currentFontSize]);

    const updateFontSize = (newSize: string) => {
        const size = parseInt(newSize, 10);
        if (!isNaN(size) && size > 0) {
            editor?.chain().focus().setFontSize(`${size}px`).run();
            setFontSize(newSize);
            setInputValue(newSize);
            setIsEditing(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
        updateFontSize(inputValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            updateFontSize(inputValue);
            editor?.commands.focus();
        }
    };

    const increment = () => {
        const newSize = parseInt(fontSize, 10) + 1;
        updateFontSize(newSize.toString());
    };

    const decrement = () => {
        const newSize = parseInt(fontSize, 10) - 1;
        if (newSize > 0) {
            updateFontSize(newSize.toString());
        }
    };

    return (
        <div className="flex items-center gap-x-0.5">
            <button
                type="button"
                onClick={decrement}
                aria-label="Decrease font size"
                title="Decrease font size"
                className="h-7 w-7 shrink-0 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 dark:hover:bg-zinc-700/80 text-gray-700 dark:text-zinc-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
            >
                <MinusIcon className="size-4" />
            </button>
            {isEditing ? (
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    aria-label="Font size input"
                    className="h-7 w-10 text-sm text-center border border-neutral-400 dark:border-zinc-700 rounded-sm bg-transparent text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-ring"
                />
            ) : (
                <button
                    type="button"
                    onClick={() => {
                        setIsEditing(true);
                        setFontSize(currentFontSize);
                    }}
                    aria-label={`Font size ${currentFontSize}`}
                    title="Font size"
                    className="h-7 w-10 text-sm rounded-sm text-center border border-neutral-400 dark:border-zinc-700 hover:bg-neutral-200/80 dark:hover:bg-zinc-700/80 text-gray-900 dark:text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
                >
                    {currentFontSize}
                </button>
            )}
            <button
                type="button"
                onClick={increment}
                aria-label="Increase font size"
                title="Increase font size"
                className="h-7 w-7 shrink-0 flex items-center justify-center rounded-sm hover:bg-neutral-200/80 dark:hover:bg-zinc-700/80 text-gray-700 dark:text-zinc-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
            >
                <PlusIcon className="size-4" />
            </button>
        </div>
    );
});

FontSizeButton.displayName = "FontSizeButton";
