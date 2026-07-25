export type AssistantMode =
    | "continue"
    | "rewrite"
    | "grammar"
    | "improve"
    | "summarize"
    | "expand"
    | "shorten"
    | "translate"
    | "explain"
    | "table"
    | "meeting-notes"
    | "email"
    | "report"
    | "resume"
    | "brainstorm";

export interface AIRequestPayload {
    prompt: string;
    mode: AssistantMode;
    documentTitle: string;
    selectedText?: string;
    currentParagraph?: string;
    headings?: string[];
}

export interface AIUsage {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
}

export interface AIStreamEvent {
    type: "chunk" | "done" | "error";
    delta?: string;
    usage?: AIUsage;
    error?: string;
}

export async function streamAssistantResponse(
    payload: AIRequestPayload,
    onEvent: (event: AIStreamEvent) => void,
    signal?: AbortSignal
) {
    const retries = 2;
    let attempt = 0;

    while (attempt <= retries) {
        try {
            const response = await fetch("/api/ai/groq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal,
            });

            if (!response.ok) {
                let errorMessage = "The AI service is unavailable right now.";

                try {
                    const parsed = await response.json();
                    if (typeof parsed?.message === "string") {
                        errorMessage = parsed.message;
                    } else if (typeof parsed?.error === "string") {
                        errorMessage = parsed.error;
                    }
                } catch {
                    const fallback = await response.text().catch(() => "");
                    if (fallback) {
                        errorMessage = fallback;
                    }
                }

                throw new Error(errorMessage);
            }

            if (!response.body) {
                throw new Error("The AI service did not return a response body.");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed.startsWith("data:")) {
                        continue;
                    }

                    const data = trimmed.slice(5).trim();
                    if (!data) {
                        continue;
                    }

                    if (data === "[DONE]") {
                        onEvent({ type: "done" });
                        return;
                    }

                    try {
                        const parsed = JSON.parse(data) as AIStreamEvent;
                        onEvent(parsed);
                    } catch {
                        // Ignore malformed stream payloads.
                    }
                }
            }

            if (buffer.trim()) {
                const data = buffer.trim().slice(5).trim();
                if (data && data !== "[DONE]") {
                    try {
                        const parsed = JSON.parse(data) as AIStreamEvent;
                        onEvent(parsed);
                    } catch {
                        // Ignore malformed stream payloads.
                    }
                }
            }

            return;
        } catch (error) {
            if (signal?.aborted) {
                throw error;
            }

            attempt += 1;
            if (attempt > retries) {
                throw error;
            }

            await new Promise((resolve) => window.setTimeout(resolve, 400 * attempt));
        }
    }

    throw new Error("AI request failed after retries.");
}

export function sanitizeAIText(content: string) {
    return content
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replace(/\u0000/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

export function getDiffPreview(original: string, updated: string) {
    const originalText = sanitizeAIText(original || "").trim();
    const updatedText = sanitizeAIText(updated || "").trim();

    return {
        removed: originalText ? [originalText] : [],
        added: updatedText ? [updatedText] : [],
    };
}
