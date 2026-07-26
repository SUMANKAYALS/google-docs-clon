"use client";

import React, { useEffect, useState } from "react";
import { SparklesIcon } from "lucide-react";

interface SelectionMenuProps {
    selection: string;
    onAction: (action: "rewrite" | "improve" | "summarize" | "translate" | "expand" | "shorten" | "explain" | "continue") => void;
}

export function SelectionMenu({ selection, onAction }: SelectionMenuProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(Boolean(selection?.trim()));
    }, [selection]);

    if (!visible || !selection.trim()) return null;

    return (
        <div className="fixed z-[60] rounded-full border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-2 shadow-lg">
            <div className="flex items-center gap-1">
                <div className="rounded-full bg-blue-50 dark:bg-blue-950/40 p-1.5 text-blue-600 dark:text-blue-400">
                    <SparklesIcon className="size-3.5" />
                </div>
                {[
                    { label: "Rewrite", value: "rewrite" },
                    { label: "Improve", value: "improve" },
                    { label: "Summarize", value: "summarize" },
                    { label: "Translate", value: "translate" },
                    { label: "Expand", value: "expand" },
                    { label: "Shorten", value: "shorten" },
                    { label: "Explain", value: "explain" },
                    { label: "Continue", value: "continue" },
                ].map((action) => (
                    <button key={action.value} type="button" onClick={() => onAction(action.value as never)} className="rounded-full px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-zinc-300 transition hover:bg-neutral-100 dark:hover:bg-zinc-800">
                        {action.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
