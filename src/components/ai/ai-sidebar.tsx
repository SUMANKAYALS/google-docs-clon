"use client";

import React, { useEffect, useRef, useState } from "react";
import { BotIcon, SparklesIcon, XIcon } from "lucide-react";
import {
    streamAssistantResponse,
    sanitizeAIText,
    type AIStreamEvent,
    type AssistantMode,
} from "@/lib/ai/service";

interface AISidebarProps {
    isOpen: boolean;
    onClose: () => void;
    documentTitle: string;
    selectedText?: string;
    currentParagraph?: string;
    headings?: string[];
    onInsert: (content: string, mode: "replace-selection" | "insert-below" | "append" | "insert-at-cursor") => void;
    initialPrompt?: string;
    initialMode?: AssistantMode;
}

interface ChatMessage {
    id: string;
    role: "assistant" | "user";
    content: string;
}

const quickActions: Array<{ label: string; mode: AssistantMode }> = [
    { label: "Continue writing", mode: "continue" },
    { label: "Rewrite paragraph", mode: "rewrite" },
    { label: "Fix grammar", mode: "grammar" },
    { label: "Improve writing", mode: "improve" },
    { label: "Summarize selection", mode: "summarize" },
    { label: "Expand content", mode: "expand" },
    { label: "Shorten content", mode: "shorten" },
    { label: "Translate", mode: "translate" },
];

export function AISidebar({
    isOpen,
    onClose,
    documentTitle,
    selectedText,
    currentParagraph,
    headings,
    onInsert,
    initialPrompt = "",
    initialMode = "continue",
}: AISidebarProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [prompt, setPrompt] = useState(initialPrompt);
    const [isStreaming, setIsStreaming] = useState(false);
    const [draft, setDraft] = useState("");
    const [error, setError] = useState("");
    const [tokenUsage, setTokenUsage] = useState(0);
    const [insertMode, setInsertMode] = useState<"replace-selection" | "insert-below" | "append" | "insert-at-cursor">("insert-at-cursor");
    const [activeMode, setActiveMode] = useState<AssistantMode>(initialMode);
    const abortRef = useRef<AbortController | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setPrompt(initialPrompt);
        setActiveMode(initialMode);
    }, [initialPrompt, initialMode]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, draft, isStreaming]);

    const sendPrompt = async (value: string, mode: AssistantMode) => {
        if (!value.trim() || isStreaming) return;

        const controller = new AbortController();
        abortRef.current = controller;

        const userMessage: ChatMessage = { id: `${Date.now()}-user`, role: "user", content: value };
        setMessages((prev) => [...prev, userMessage]);
        setDraft("");
        setError("");
        setIsStreaming(true);
        setActiveMode(mode);

        let fullDraft = "";

        try {
            await streamAssistantResponse(
                {
                    prompt: value,
                    mode,
                    documentTitle,
                    selectedText,
                    currentParagraph,
                    headings,
                },
                (event: AIStreamEvent) => {
                    if (event.type === "chunk" && event.delta) {
                        fullDraft += event.delta;
                        setDraft(fullDraft);
                        setTokenUsage((prev) => prev + 1);
                    }

                    if (event.type === "done") {
                        const assistantMessage: ChatMessage = {
                            id: `${Date.now()}-assistant`,
                            role: "assistant",
                            content: sanitizeAIText(fullDraft || ""),
                        };
                        setMessages((prev) => [...prev, assistantMessage]);
                        setDraft(fullDraft);
                        setIsStreaming(false);
                        setTokenUsage((prev) => prev + 1);
                    }

                    if (event.type === "error") {
                        setError(event.error || "The assistant could not complete the request.");
                        setIsStreaming(false);
                    }
                },
                controller.signal
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : "The assistant could not complete the request.");
            setIsStreaming(false);
        } finally {
            if (abortRef.current === controller) {
                abortRef.current = null;
            }
        }
    };

    const handleSubmit = async (event?: React.FormEvent) => {
        event?.preventDefault();
        const trimmed = prompt.trim();
        if (!trimmed) return;
        setPrompt("");
        await sendPrompt(trimmed, activeMode);
    };

    const rejectDraft = () => {
        setDraft("");
    };

    const acceptDraft = () => {
        if (!draft.trim()) return;
        onInsert(draft.trim(), insertMode);
        setDraft("");
    };

    if (!isOpen) return null;

    return (
        <aside className="fixed right-0 top-0 z-50 flex h-screen w-[360px] flex-col border-l border-neutral-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="rounded-full bg-blue-50 p-2 text-blue-600">
                        <SparklesIcon className="size-4" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">AI Assistant</p>
                        <p className="text-xs text-gray-500">Write, rewrite, and edit</p>
                    </div>
                </div>
                <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
                    <XIcon className="size-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-neutral-50 px-4 py-3">
                <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <BotIcon className="size-4 text-blue-600" />
                        Chat
                    </div>
                    <div className="space-y-2">
                        {messages.length === 0 && !draft && !isStreaming && (
                            <p className="text-sm text-gray-500">Ask the assistant to continue, rewrite, summarize, or improve your document.</p>
                        )}
                        {messages.map((message) => (
                            <div key={message.id} className={`rounded-xl p-3 text-sm ${message.role === "assistant" ? "bg-blue-50 text-gray-800" : "bg-neutral-100 text-gray-800"}`}>
                                {message.content}
                            </div>
                        ))}
                        {draft ? <div className="rounded-xl bg-amber-50 p-3 text-sm text-gray-800">{draft}</div> : null}
                        {isStreaming ? <div className="text-sm text-gray-500">Generating...</div> : null}
                    </div>
                    <div ref={bottomRef} />
                </div>

                <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
                    <p className="mb-2 text-sm font-semibold text-gray-700">Quick actions</p>
                    <div className="flex flex-wrap gap-2">
                        {quickActions.map((action) => (
                            <button key={action.mode} type="button" onClick={() => sendPrompt(action.label, action.mode)} className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-gray-700 transition hover:bg-neutral-100">
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
                    <p className="mb-2 text-sm font-semibold text-gray-700">Templates</p>
                    <div className="space-y-2 text-sm text-gray-600">
                        <button type="button" onClick={() => setPrompt("Write a polished paragraph that continues the document in a professional tone.")} className="block w-full rounded-lg border border-neutral-200 px-3 py-2 text-left hover:bg-neutral-100">Continue writing</button>
                        <button type="button" onClick={() => setPrompt("Rewrite the selected text to sound more concise and executive-friendly.")} className="block w-full rounded-lg border border-neutral-200 px-3 py-2 text-left hover:bg-neutral-100">Rewrite selection</button>
                        <button type="button" onClick={() => setPrompt("Generate a concise meeting summary with agenda, decisions, and action items.")} className="block w-full rounded-lg border border-neutral-200 px-3 py-2 text-left hover:bg-neutral-100">Meeting notes</button>
                    </div>
                </div>

                {draft ? (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 shadow-sm">
                        <p className="mb-2 text-sm font-semibold text-amber-800">Preview</p>
                        <p className="mb-3 text-sm text-gray-700">{draft}</p>
                        <div className="flex flex-wrap gap-2">
                            <div className="flex gap-1 rounded-full border border-neutral-200 bg-white p-1">
                                {[
                                    { label: "Cursor", value: "insert-at-cursor" },
                                    { label: "Replace", value: "replace-selection" },
                                    { label: "Below", value: "insert-below" },
                                    { label: "Append", value: "append" },
                                ].map((mode) => (
                                    <button key={mode.value} type="button" onClick={() => setInsertMode(mode.value as typeof insertMode)} className={`rounded-full px-2 py-1 text-xs ${insertMode === mode.value ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-neutral-100"}`}>
                                        {mode.label}
                                    </button>
                                ))}
                            </div>
                            <button type="button" onClick={acceptDraft} className="rounded-full bg-blue-600 px-3 py-1.5 text-sm text-white">Accept</button>
                            <button type="button" onClick={rejectDraft} className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm text-gray-700">Reject</button>
                        </div>
                    </div>
                ) : null}
            </div>

            <div className="border-t border-neutral-200 bg-white p-3">
                <form onSubmit={handleSubmit} className="space-y-2">
                    <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={3} className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="Ask the AI to continue writing, revise, or summarize..." />
                    {error ? <p className="text-sm text-red-600">{error}</p> : null}
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">Tokens: {tokenUsage}</div>
                        <button type="submit" className="rounded-full bg-blue-600 px-3 py-1.5 text-sm text-white">Generate</button>
                    </div>
                </form>
            </div>
        </aside>
    );
}
