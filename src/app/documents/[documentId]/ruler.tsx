"use client";

import React, { useState, useEffect } from "react";
import { useEditorStore } from "@/store/use-editor-store";

interface RulerProps {
  leftMargin: number;
  rightMargin: number;
  onMarginsChange: (left: number, right: number) => void;
}

type DragType = "leftMargin" | "rightMargin" | "leftIndent" | "firstLineIndent" | "rightIndent" | null;

export const Ruler = React.memo(({ leftMargin, rightMargin, onMarginsChange }: RulerProps) => {
    const editor = useEditorStore((state) => state.editor);
    const [dragState, setDragState] = useState<{
        type: DragType;
        startX: number;
        startVal: number;
        currentVal: number;
    }>({ type: null, startX: 0, startVal: 0, currentVal: 0 });

    // Retrieve active paragraph attributes
    const attrs = editor?.getAttributes("paragraph") || {};
    
    const parsePx = (val: string | null | undefined): number => {
        if (!val) return 0;
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
    };

    const leftIndent = parsePx(attrs.indentLeft);
    const rightIndent = parsePx(attrs.indentRight);
    const firstLineIndent = parsePx(attrs.firstLineIndent);

    const startDrag = (e: React.MouseEvent, type: DragType) => {
        e.preventDefault();
        let startVal = 0;
        if (type === "leftMargin") startVal = leftMargin;
        else if (type === "rightMargin") startVal = rightMargin;
        else if (type === "leftIndent") startVal = leftIndent;
        else if (type === "firstLineIndent") startVal = firstLineIndent;
        else if (type === "rightIndent") startVal = rightIndent;

        setDragState({
            type,
            startX: e.clientX,
            startVal,
            currentVal: startVal
        });
    };

    useEffect(() => {
        if (!dragState.type) return;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - dragState.startX;
            let newVal = dragState.startVal;

            if (dragState.type === "leftMargin" || dragState.type === "rightMargin") {
                // Margins: ensure at least 2 inches (192px) of printable width remains
                if (dragState.type === "leftMargin") {
                    newVal = Math.max(24, Math.min(384, dragState.startVal + deltaX));
                    if (816 - newVal - rightMargin < 192) {
                        newVal = 816 - rightMargin - 192;
                    }
                } else {
                    newVal = Math.max(24, Math.min(384, dragState.startVal - deltaX));
                    if (816 - leftMargin - newVal < 192) {
                        newVal = 816 - leftMargin - 192;
                    }
                }
            } else {
                // Indents: keep markers within active printable document boundaries
                const maxIndent = 816 - leftMargin - rightMargin;
                if (dragState.type === "leftIndent") {
                    newVal = Math.max(0, Math.min(maxIndent - 24, dragState.startVal + deltaX));
                } else if (dragState.type === "firstLineIndent") {
                    // Hanging indent can go negative, but absolute indent position must be >= 0
                    newVal = Math.max(-leftIndent, Math.min(maxIndent - leftIndent - 24, dragState.startVal + deltaX));
                } else if (dragState.type === "rightIndent") {
                    newVal = Math.max(0, Math.min(maxIndent - 24, dragState.startVal - deltaX));
                }
            }

            setDragState(prev => ({ ...prev, currentVal: newVal }));

            // Apply style dynamically on drag:
            if (dragState.type === "leftMargin") {
                onMarginsChange(newVal, rightMargin);
            } else if (dragState.type === "rightMargin") {
                onMarginsChange(leftMargin, newVal);
            } else {
                if (editor) {
                    const l = dragState.type === "leftIndent" ? `${newVal}px` : `${leftIndent}px`;
                    const r = dragState.type === "rightIndent" ? `${newVal}px` : `${rightIndent}px`;
                    const f = dragState.type === "firstLineIndent" ? `${newVal}px` : `${firstLineIndent}px`;
                    editor.commands.setParagraphIndent(l, r, f);
                }
            }
        };

        const handleMouseUp = () => {
            if (dragState.type === "leftMargin" || dragState.type === "rightMargin") {
                onMarginsChange(
                    dragState.type === "leftMargin" ? dragState.currentVal : leftMargin,
                    dragState.type === "rightMargin" ? dragState.currentVal : rightMargin
                );
            }
            setDragState({ type: null, startX: 0, startVal: 0, currentVal: 0 });
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [dragState, leftMargin, rightMargin, leftIndent, rightIndent, firstLineIndent, onMarginsChange, editor]);

    // Build scales & numbers
    const renderTicks = () => {
        const ticks = [];
        for (let i = 0; i <= 816; i += 12) {
            const isMajor = i % 96 === 0;
            const isHalf = i % 48 === 0 && !isMajor;
            const isQuarter = i % 24 === 0 && !isHalf && !isMajor;
            
            let height = 4;
            if (isMajor) height = 10;
            else if (isHalf) height = 7;
            else if (isQuarter) height = 5;

            ticks.push(
                <div
                    key={`tick-${i}`}
                    className="absolute bg-neutral-300 dark:bg-zinc-650"
                    style={{
                        left: `${i}px`,
                        bottom: 0,
                        width: "1px",
                        height: `${height}px`,
                    }}
                >
                    {isMajor && i > 0 && i < 816 && (
                        <span className="absolute bottom-3.5 -translate-x-1/2 text-[9px] font-bold text-neutral-400 dark:text-zinc-500 select-none">
                            {i / 96}
                        </span>
                    )}
                </div>
            );
        }
        return ticks;
    };

    // Calculate absolute guide coordinate
    let guideX: number | null = null;
    if (dragState.type === "leftMargin") guideX = dragState.currentVal;
    else if (dragState.type === "rightMargin") guideX = 816 - dragState.currentVal;
    else if (dragState.type === "leftIndent") guideX = leftMargin + dragState.currentVal;
    else if (dragState.type === "firstLineIndent") guideX = leftMargin + leftIndent + dragState.currentVal;
    else if (dragState.type === "rightIndent") guideX = 816 - rightMargin - dragState.currentVal;

    return (
        <div className="relative w-[816px] h-9 bg-neutral-50 dark:bg-zinc-900 border-b border-neutral-200 dark:border-zinc-800 flex items-end select-none print:hidden">
            {/* Ticks scale */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {renderTicks()}
            </div>

            {/* Left Margin Overlay */}
            <div
                style={{ width: `${leftMargin}px` }}
                className="absolute left-0 top-0 bottom-0 bg-neutral-200/50 dark:bg-zinc-800/40 border-r border-neutral-300 dark:border-zinc-700 pointer-events-none"
            />

            {/* Right Margin Overlay */}
            <div
                style={{ width: `${rightMargin}px` }}
                className="absolute right-0 top-0 bottom-0 bg-neutral-200/50 dark:bg-zinc-800/40 border-l border-neutral-300 dark:border-zinc-700 pointer-events-none"
            />

            {/* Left Margin edge handler */}
            <div
                style={{ left: `${leftMargin - 3}px` }}
                className="absolute top-0 w-1.5 h-full cursor-col-resize hover:bg-blue-500/25 active:bg-blue-500/40 z-20 transition-colors"
                onMouseDown={(e) => startDrag(e, "leftMargin")}
                title="Left Margin"
            />

            {/* Right Margin edge handler */}
            <div
                style={{ left: `${816 - rightMargin - 3}px` }}
                className="absolute top-0 w-1.5 h-full cursor-col-resize hover:bg-blue-500/25 active:bg-blue-500/40 z-20 transition-colors"
                onMouseDown={(e) => startDrag(e, "rightMargin")}
                title="Right Margin"
            />

            {/* First Line Indent (rectangle) */}
            <div
                style={{ left: `${leftMargin + leftIndent + firstLineIndent - 5}px` }}
                className="absolute top-1.5 w-2.5 h-1 bg-blue-500 dark:bg-blue-400 rounded-sm cursor-col-resize hover:bg-blue-600 active:bg-blue-700 z-30 shadow-sm"
                onMouseDown={(e) => startDrag(e, "firstLineIndent")}
                title="First Line Indent"
            />

            {/* Left Indent (upward triangle) */}
            <div
                style={{ left: `${leftMargin + leftIndent - 5}px` }}
                className="absolute top-3 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[7px] border-b-blue-500 dark:border-b-blue-400 cursor-col-resize hover:border-b-blue-600 active:border-b-blue-700 z-30"
                onMouseDown={(e) => startDrag(e, "leftIndent")}
                title="Left Indent"
            />

            {/* Right Indent (upward triangle) */}
            <div
                style={{ left: `${816 - rightMargin - rightIndent - 5}px` }}
                className="absolute top-3 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[7px] border-b-blue-500 dark:border-b-blue-400 cursor-col-resize hover:border-b-blue-600 active:border-b-blue-700 z-30"
                onMouseDown={(e) => startDrag(e, "rightIndent")}
                title="Right Indent"
            />

            {/* Drag guide line */}
            {guideX !== null && (
                <div
                    className="absolute top-0 w-px border-l border-dashed border-blue-500 dark:border-blue-400 z-40 pointer-events-none"
                    style={{
                        left: `${guideX}px`,
                        height: "1200px",
                    }}
                />
            )}

            {/* Drag floating tooltip */}
            {dragState.type && guideX !== null && (
                <div
                    className="absolute -top-7 bg-zinc-800 dark:bg-zinc-950 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-lg pointer-events-none -translate-x-1/2 z-50 whitespace-nowrap border border-zinc-700 dark:border-zinc-800"
                    style={{
                        left: `${guideX}px`,
                    }}
                >
                    {dragState.type === "leftMargin" && `Left Margin: ${(dragState.currentVal / 96).toFixed(2)}"`}
                    {dragState.type === "rightMargin" && `Right Margin: ${(dragState.currentVal / 96).toFixed(2)}"`}
                    {dragState.type === "leftIndent" && `Left Indent: ${(dragState.currentVal / 96).toFixed(2)}"`}
                    {dragState.type === "firstLineIndent" && `First Line Indent: ${(dragState.currentVal / 96).toFixed(2)}"`}
                    {dragState.type === "rightIndent" && `Right Indent: ${(dragState.currentVal / 96).toFixed(2)}"`}
                </div>
            )}
        </div>
    );
});

Ruler.displayName = "Ruler";