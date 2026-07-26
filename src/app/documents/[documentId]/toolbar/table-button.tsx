"use client";

import React, { useState, useCallback } from "react";
import { TableIcon } from "lucide-react";
import { useEditorStore } from "@/store/use-editor-store";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

export const TableButton = React.memo(() => {
    const editor = useEditorStore((state) => state.editor);
    const [hoveredRow, setHoveredRow] = useState(0);
    const [hoveredCol, setHoveredCol] = useState(0);

    const isTableActive = editor?.isActive("table");

    const handleInsertTable = useCallback((rows: number, cols: number) => {
        editor?.chain().focus().insertTable({ rows, cols }).run();
        setHoveredRow(0);
        setHoveredCol(0);
    }, [editor]);

    const tableCommands = [
        { label: "Add Row Above", action: () => editor?.chain().focus().addRowBefore().run() },
        { label: "Add Row Below", action: () => editor?.chain().focus().addRowAfter().run() },
        { label: "Delete Row", action: () => editor?.chain().focus().deleteRow().run() },
        { type: "separator" },
        { label: "Add Column Left", action: () => editor?.chain().focus().addColumnBefore().run() },
        { label: "Add Column Right", action: () => editor?.chain().focus().addColumnAfter().run() },
        { label: "Delete Column", action: () => editor?.chain().focus().deleteColumn().run() },
        { type: "separator" },
        { label: "Merge Cells", action: () => editor?.chain().focus().mergeCells().run() },
        { label: "Split Cell", action: () => editor?.chain().focus().splitCell().run() },
        { type: "separator" },
        { label: "Toggle Header Row", action: () => editor?.chain().focus().toggleHeaderRow().run() },
        { label: "Toggle Header Column", action: () => editor?.chain().focus().toggleHeaderColumn().run() },
        { label: "Toggle Header Cell", action: () => editor?.chain().focus().toggleHeaderCell().run() },
        { type: "separator" },
        { label: "Delete Table", action: () => editor?.chain().focus().deleteTable().run(), isDestructive: true },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Table options"
                    title="Insert table"
                    className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 dark:hover:bg-zinc-700/80 text-gray-700 dark:text-zinc-300 overflow-hidden text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
                >
                    <TableIcon className="size-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 flex flex-col gap-y-1.5 z-50 min-w-[200px] bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 shadow-md rounded-md">
                <div className="px-1 text-[11px] font-semibold text-neutral-400 dark:text-zinc-500 select-none">
                    INSERT TABLE
                </div>
                <div
                    className="flex flex-col gap-1 p-1 bg-neutral-50 dark:bg-zinc-850 border border-neutral-200 dark:border-zinc-700 rounded-sm self-center"
                    onMouseLeave={() => {
                        setHoveredRow(0);
                        setHoveredCol(0);
                    }}
                >
                    {Array.from({ length: 10 }).map((_, rIdx) => {
                        const row = rIdx + 1;
                        return (
                            <div key={row} className="flex gap-1">
                                {Array.from({ length: 10 }).map((_, cIdx) => {
                                    const col = cIdx + 1;
                                    const isHighlighted = row <= hoveredRow && col <= hoveredCol;
                                    return (
                                        <button
                                            key={col}
                                            type="button"
                                            onMouseEnter={() => {
                                                setHoveredRow(row);
                                                setHoveredCol(col);
                                            }}
                                            onClick={() => handleInsertTable(row, col)}
                                            className={cn(
                                                "size-3.5 border rounded-[1px] transition-colors duration-75",
                                                isHighlighted
                                                    ? "bg-blue-400 border-blue-500"
                                                    : "bg-white dark:bg-zinc-900 border-neutral-300 dark:border-zinc-700 hover:border-neutral-400 dark:hover:border-zinc-555"
                                            )}
                                            aria-label={`Insert ${row}x${col} table`}
                                        />
                                    );
                                })}
                            </div>
                        );
                    })}
                    <div className="text-center text-xs text-neutral-600 dark:text-zinc-400 font-semibold pt-1 select-none">
                        {hoveredRow > 0 && hoveredCol > 0 ? `${hoveredRow} × ${hoveredCol}` : "Select size"}
                    </div>
                </div>

                <Separator className="my-1 bg-neutral-200 dark:bg-zinc-800" />
                <div className="px-1 text-[11px] font-semibold text-neutral-400 dark:text-zinc-500 select-none">
                    TABLE MODIFY
                </div>

                <div className="flex flex-col gap-y-0.5">
                    {tableCommands.map((cmd, idx) => {
                        if (cmd.type === "separator") {
                            return <Separator key={idx} className="my-1 bg-neutral-200 dark:bg-zinc-800" />;
                        }
                        return (
                            <button
                                key={idx}
                                type="button"
                                disabled={!isTableActive}
                                onClick={cmd.action}
                                className={cn(
                                    "flex items-center px-2 py-1 rounded-sm text-left text-xs transition-colors w-full focus-visible:outline-none focus-visible:bg-neutral-100 dark:focus-visible:bg-zinc-800",
                                    !isTableActive
                                        ? "opacity-40 cursor-not-allowed text-neutral-400 dark:text-zinc-650 hover:bg-transparent"
                                        : cmd.isDestructive
                                            ? "text-red-600 dark:text-red-450 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium"
                                            : "text-neutral-700 dark:text-zinc-300 hover:bg-neutral-100 dark:hover:bg-zinc-800"
                                )}
                            >
                                {cmd.label}
                            </button>
                        );
                    })}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
});

TableButton.displayName = "TableButton";
