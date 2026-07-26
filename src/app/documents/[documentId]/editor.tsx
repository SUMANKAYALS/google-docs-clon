"use client";

import React, { useCallback, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "@tiptap/extension-font-family";
import Link from "@tiptap/extension-link";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import {
    useEditor,
    EditorContent,
    type Editor as TipTapEditor,
    type Extension,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

import { useEditorStore } from "@/store/use-editor-store";
import { IndentParagraph } from "@/extensions/indent";
import { Ruler } from "./ruler";
import { FontSizeExtension } from "@/extensions/font-size";
import { LineHeightExtension } from "@/extensions/line-height";
import { LiveMousePointers } from "@/components/live-mouse-pointers";
import { SelectionMenu } from "@/components/ai/selection-menu";

interface EditorProps {
    initialContent?: string;
    onContentChange?: (content: string) => void;
    onReady?: () => void;
    yDoc?: Y.Doc | null;
    provider?: WebsocketProvider | null;
    currentUser?: {
        id: string;
        name: string;
        color: string;
        image?: string;
    } | null;
    isEditable?: boolean;
    onAIAction?: (action: "rewrite" | "improve" | "summarize" | "translate" | "expand" | "shorten" | "explain" | "continue", selection: string) => void;
    leftMargin?: number;
    rightMargin?: number;
    onMarginsChange?: (left: number, right: number) => void;
}

export const Editor = React.memo(({
    initialContent = "",
    onContentChange,
    onReady,
    yDoc,
    provider,
    currentUser,
    isEditable = true,
    onAIAction,
    leftMargin = 56,
    rightMargin = 56,
    onMarginsChange = () => {},
}: EditorProps) => {
    const setEditor = useEditorStore((state) => state.setEditor);
    const pageTheme = useEditorStore((state) => state.pageTheme);
    const setPageTheme = useEditorStore((state) => state.setPageTheme);
    const [selectionText, setSelectionText] = useState("");

    React.useEffect(() => {
        const saved = localStorage.getItem("clouds-docs-page-theme");
        if (saved === "light" || saved === "dark") {
            setPageTheme(saved);
        }
    }, [setPageTheme]);

    const parsedContent = React.useMemo(() => {
        if (!initialContent || initialContent.trim() === "") return "";
        try {
            return JSON.parse(initialContent);
        } catch {
            return initialContent; // Fallback to HTML/text
        }
    }, [initialContent]);

    React.useEffect(() => {
        console.log("[Editor] Initial content received (length):", initialContent?.length || 0);
        console.log("[Editor] Parsed content:", parsedContent);
    }, [initialContent, parsedContent]);

    const handleEditorUpdate = useCallback(
        ({ editor }: { editor: TipTapEditor }) => {
            setEditor(editor);
            if (onContentChange) {
                const jsonString = JSON.stringify(editor.getJSON());
                onContentChange(jsonString);
            }
        },
        [setEditor, onContentChange]
    );

    const handleSelectionUpdate = useCallback(
        ({ editor }: { editor: TipTapEditor }) => {
            setEditor(editor);
            const { from, to } = editor.state.selection;
            setSelectionText(from !== to ? editor.state.doc.textBetween(from, to).trim() : "");
        },
        [setEditor]
    );

    const extensions = [
        StarterKit.configure({
            history: yDoc ? false : {},
            paragraph: false,
        }),
        IndentParagraph,
        yDoc
            ? Collaboration.configure({
                document: yDoc,
                field: "default",
            })
            : null,
        provider && currentUser
            ? CollaborationCursor.configure({
                provider: provider,
                user: {
                    name: currentUser.name,
                    color: currentUser.color,
                },
            })
            : null,
        LineHeightExtension.configure({
            types: ["heading", "paragraph"],
            defaultLineHeight: "normal",
        }),
        FontSizeExtension,
        TextAlign.configure({
            types: ["heading", "paragraph"],
        }),
        Link.configure({
            openOnClick: false,
            autolink: true,
            defaultProtocol: "https",
        }),
        Color,
        Highlight.configure({
            multicolor: true,
        }),
        FontFamily,
        TextStyle,
        Underline,
        Image,
        Table.configure({
            resizable: true,
        }),
        TableCell,
        TableHeader,
        TableRow,
        TaskItem.configure({
            nested: true,
        }),
        TaskList,
    ].filter(Boolean) as Extension[];

    const editor = useEditor({
        editable: isEditable,
        onCreate({ editor }) {
            setEditor(editor);
        },
        onDestroy() {
            setEditor(null);
        },
        onUpdate: handleEditorUpdate,
        onSelectionUpdate: handleSelectionUpdate,
        onTransaction: ({ editor }) => setEditor(editor),
        onFocus: ({ editor }) => setEditor(editor),
        onBlur: ({ editor }) => setEditor(editor),
        editorProps: {
            attributes: {
                style: "padding-left: 56px; padding-right: 56px;",
                class: "focus:outline-none print:border-0 bg-[var(--editor-paper)] border border-[#C7C7C7] dark:border-zinc-850 text-[var(--editor-text)] flex flex-col min-h-[1054px] w-[816px] pt-10 pr-14 pb-10 cursor-text shadow-sm",
            },
        },
        extensions,
        content: parsedContent || "<p></p>",
        immediatelyRender: false,
    }, [yDoc, provider]);

    const hasInitializedRef = React.useRef(false);

    React.useEffect(() => {
        if (provider && yDoc && editor) {
            const handleSync = () => {
                if (hasInitializedRef.current) {
                    if (onReady) onReady();
                    return;
                }
                const fragment = yDoc.getXmlFragment("default");
                console.log(`[Editor Sync] Sync complete. Fragment length: ${fragment.length}`);
                if (fragment.length === 0 && parsedContent) {
                    console.log(`[Editor Sync] Yjs is empty, initializing with parsedContent.`);
                    editor.commands.setContent(parsedContent);
                }
                hasInitializedRef.current = true;
                if (onReady) {
                    onReady();
                }
            };

            if (provider.synced) {
                handleSync();
            } else {
                provider.on("sync", handleSync);
            }

            return () => {
                provider.off("sync", handleSync);
            };
        } else if (!provider && editor) {
            if (!hasInitializedRef.current) {
                hasInitializedRef.current = true;
                if (onReady) {
                    onReady();
                }
            }
        }
    }, [provider, yDoc, editor, parsedContent, onReady]);

    const containerRef = React.useRef<HTMLDivElement | null>(null);

    return (
        <div className="size-full overflow-x-auto bg-[var(--editor-workspace)] px-4 print:p-0 print:bg-white print:overflow-visible flex flex-col items-center">
            <style dangerouslySetInnerHTML={{__html: `
                .tiptap {
                    padding-left: ${leftMargin}px !important;
                    padding-right: ${rightMargin}px !important;
                }
                @media print {
                    .tiptap {
                        padding-left: 0px !important;
                        padding-right: 0px !important;
                    }
                }
            `}} />

            <div className="w-[816px] shrink-0 mt-4">
                <Ruler leftMargin={leftMargin} rightMargin={rightMargin} onMarginsChange={onMarginsChange} />
            </div>

            <div
                ref={containerRef}
                className="relative min-w-max flex justify-center w-[816px] pb-4 pt-1 print:py-0 mx-auto print:w-full print:min-w-0"
            >
                <LiveMousePointers
                    containerRef={containerRef}
                    provider={provider || null}
                    currentUser={currentUser}
                />
                <SelectionMenu selection={selectionText} onAction={(action) => onAIAction?.(action, selectionText)} />
                <div className={pageTheme === "light" ? "page-theme-light" : "page-theme-dark"}>
                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    );
});

Editor.displayName = "Editor";