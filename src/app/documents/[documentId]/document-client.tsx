"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useSession } from "next-auth/react";
import { type DocumentItem } from "@/types";
import { getDocumentCollaboratorsAction } from "@/actions/sharing-actions";
import { getRandomColor } from "@/constants/collaboration";
import { type CollaboratorUser } from "@/components/collaboration-presence";
import dynamic from "next/dynamic";
import { useEditorStore } from "@/store/use-editor-store";
import { Navbar, SaveStatus } from "./navbar";
import { Editor } from "./editor";

const AISidebar = dynamic(() => import("@/components/ai/ai-sidebar").then((mod) => mod.AISidebar), {
  ssr: false,
});

interface DocumentClientProps {
  document: DocumentItem;
}

export function DocumentClient({ document: initialDocument }: DocumentClientProps) {
  const { data: session } = useSession();

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connecting");
  const [collaborators, setCollaborators] = useState<CollaboratorUser[]>([]);
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const [aiPromptPrefill, setAiPromptPrefill] = useState("");
  const [aiModePrefill, setAiModePrefill] = useState<"continue" | "rewrite" | "grammar" | "improve" | "summarize" | "expand" | "shorten" | "translate" | "explain" | "table" | "meeting-notes" | "email" | "report" | "resume" | "brainstorm">("continue");
  const [aiContext, setAiContext] = useState<{ selectedText?: string; currentParagraph?: string; headings?: string[] }>({});

  const [yDoc, setYDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleEditorReady = useCallback(() => {
    setIsLoaded(true);
    console.log("[Autosave] Editor is ready. Autosave enabled.");
  }, []);

  const lastSavedContentRef = useRef(initialDocument.content);
  const pendingContentRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveInFlightRef = useRef(false);
  const saveQueueRef = useRef<string[]>([]);
  const saveRetryRef = useRef(0);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const presenceRosterRef = useRef<CollaboratorUser[]>([]);
  const yDocRef = useRef<Y.Doc | null>(null);
  const cleanupCollaborationRef = useRef<(() => void) | null>(null);

  const isEditable = initialDocument.userRole !== "viewer";

  const [anonId] = useState(() => Math.random().toString(36).substring(2, 9));

  const editor = useEditorStore((state) => state.editor);

  const currentUser = React.useMemo(() => {
    const name = session?.user?.name || "Anonymous Collaborator";
    const id = session?.user?.id || anonId;
    const color = getRandomColor(id);
    const image = session?.user?.image || undefined;
    return { id, name, color, image };
  }, [session, anonId]);

  const flushSaveQueue = useCallback(async () => {
    if (!isEditable || saveInFlightRef.current) {
      return;
    }

    const contentToSave = saveQueueRef.current[0] ?? pendingContentRef.current;
    if (!contentToSave || contentToSave === lastSavedContentRef.current) {
      pendingContentRef.current = null;
      saveQueueRef.current = [];
      setSaveStatus("saved");
      return;
    }

    if (!navigator.onLine) {
      setSaveStatus("offline");
      return;
    }

    saveInFlightRef.current = true;
    setSaveStatus("saving");

    try {
      const response = await fetch(`/api/documents/${initialDocument.id}/autosave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contentToSave }),
      });

      const payload = await response.json().catch(() => null);

      if (response.ok && payload?.success) {
        lastSavedContentRef.current = contentToSave;
        pendingContentRef.current = null;
        saveQueueRef.current = saveQueueRef.current.filter((item) => item !== contentToSave);
        saveRetryRef.current = 0;
        setSaveStatus("saved");
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } else {
        throw new Error(payload?.error || "Save failed");
      }
    } catch (err) {
      console.error("Auto-save Exception:", err);
      saveRetryRef.current += 1;
      if (saveRetryRef.current <= 3) {
        window.setTimeout(() => {
          saveInFlightRef.current = false;
          flushSaveQueue();
        }, 1000 * saveRetryRef.current);
      } else {
        setSaveStatus("error");
        saveInFlightRef.current = false;
      }
    } finally {
      saveInFlightRef.current = false;
    }
  }, [initialDocument.id, isEditable]);

  const scheduleSave = useCallback((contentToSave: string) => {
    if (!isEditable) return;

    if (pendingContentRef.current !== contentToSave) {
      pendingContentRef.current = contentToSave;
      saveQueueRef.current = Array.from(new Set([contentToSave, ...saveQueueRef.current]));
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      flushSaveQueue();
    }, 900);
  }, [flushSaveQueue, isEditable]);

  const buildEditorContext = useCallback(() => {
    if (!editor) {
      return { selectedText: "", currentParagraph: "", headings: [] as string[] };
    }

    const { from, to } = editor.state.selection;
    const selectedText = from !== to ? editor.state.doc.textBetween(from, to).trim() : "";

    const headings: string[] = [];
    editor.state.doc.descendants((node) => {
      if (node.type.name === "heading") {
        const headingText = node.textContent.trim();
        if (headingText) {
          headings.push(headingText);
        }
      }
    });

    const currentParagraph = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
    ).trim() || editor.getText().trim();

    return {
      selectedText,
      currentParagraph,
      headings,
    };
  }, [editor]);

  const openAIAssistant = useCallback((options?: { prompt?: string; mode?: typeof aiModePrefill; selectedText?: string }) => {
    const context = buildEditorContext();
    setAiContext({
      selectedText: options?.selectedText || context.selectedText,
      currentParagraph: context.currentParagraph,
      headings: context.headings,
    });
    setAiPromptPrefill(options?.prompt || "");
    setAiModePrefill(options?.mode || "continue");
    setIsAISidebarOpen(true);
  }, [buildEditorContext]);

  const handleAIInsert = useCallback((content: string, mode: "replace-selection" | "insert-below" | "append" | "insert-at-cursor") => {
    if (!editor) return;

    const insertion = content.trim();
    if (!insertion) return;

    const selection = editor.state.selection;
    const hasSelection = selection.from !== selection.to;
    const selectionIsValid = selection.$from.parent.type.name !== "doc" && selection.$to.parent.type.name !== "doc";

    if (!selectionIsValid) {
      editor.chain().focus().insertContent({ type: "paragraph", content: [{ type: "text", text: "" }] }).run();
    }

    const chain = editor.chain().focus();

    if (mode === "append") {
      const end = editor.state.doc.content.size;
      chain.setTextSelection(end).insertContent(insertion).run();
    } else if (mode === "insert-below") {
      chain.insertContent(`${insertion}\n`).run();
    } else {
      if (hasSelection && selectionIsValid) {
        chain.deleteSelection().insertContent(insertion).run();
      } else {
        chain.insertContent(insertion).run();
      }
    }

    editor.commands.focus();
  }, [editor]);

  const cleanupCollaboration = useCallback(() => {
    const providerInstance = providerRef.current;
    const yDocInstance = yDocRef.current;

    if (providerInstance?.awareness) {
      providerInstance.awareness.setLocalStateField("user", null);
      providerInstance.awareness.setLocalStateField("isTyping", false);
      providerInstance.awareness.setLocalStateField("pointer", null);
    }

    providerRef.current = null;
    yDocRef.current = null;
    cleanupCollaborationRef.current = null;
    setProvider(null);
    setYDoc(null);
    setCollaborators([]);

    if (providerInstance) {
      try {
        providerInstance.disconnect();
        providerInstance.destroy();
      } catch {
        // Ignore provider cleanup issues during teardown.
      }
    }

    if (yDocInstance) {
      try {
        yDocInstance.destroy();
      } catch {
        // Ignore Y.Doc cleanup issues during teardown.
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPresenceRoster = async () => {
      const res = await getDocumentCollaboratorsAction(initialDocument.id);
      if (!isMounted || !res.success) {
        return;
      }

      const roster: CollaboratorUser[] = [];
      if (res.owner) {
        roster.push({
          id: res.owner.userId,
          name: res.owner.name || "Owner",
          image: res.owner.image,
          color: getRandomColor(res.owner.userId),
          isOnline: false,
        });
      }

      if (Array.isArray(res.collaborators)) {
        res.collaborators.forEach((member) => {
          roster.push({
            id: member.userId,
            name: member.name || "Collaborator",
            image: member.image,
            color: getRandomColor(member.userId),
            isOnline: false,
          });
        });
      }

      presenceRosterRef.current = roster;
      setCollaborators((prev) => {
        const merged = new Map<string, CollaboratorUser>();
        roster.forEach((user) => merged.set(user.id, { ...user }));
        prev.forEach((user) => {
          if (!merged.has(user.id)) {
            merged.set(user.id, { ...user });
          }
        });
        return Array.from(merged.values());
      });
    };

    loadPresenceRoster();

    return () => {
      isMounted = false;
    };
  }, [initialDocument.id]);

  // Setup Yjs CRDT Document & WebSocket / Awareness Provider with Resilient Connection Lifecycle
  useEffect(() => {
    const doc = new Y.Doc();
    yDocRef.current = doc;
    setYDoc(doc);

    const wsUrl = process.env.NEXT_PUBLIC_COLLAB_WS_URL || "ws://localhost:1234";
    let wsProvider: WebsocketProvider | null = null;
    let isDestroyed = false;

    try {
      wsProvider = new WebsocketProvider(wsUrl, initialDocument.id, doc, {
        connect: true,
      });

      providerRef.current = wsProvider;
      setProvider(wsProvider);

      const handleStatus = (event: { status: "connected" | "connecting" | "disconnected" }) => {
        if (!isDestroyed) {
          setConnectionStatus(event.status);
        }
      };

      const handleConnectionError = () => {
        if (!isDestroyed) {
          setConnectionStatus("disconnected");
        }
      };

      wsProvider.on("status", handleStatus);
      wsProvider.on("connection-error", handleConnectionError);

      const awareness = wsProvider.awareness;

      const updateCollaborators = () => {
        if (isDestroyed) return;
        const states = awareness.getStates();
        const activeUserMap = new Map<string, CollaboratorUser>();

        states.forEach((state: Record<string, unknown>) => {
          const userObj = state.user as {
            id?: string;
            name?: string;
            color?: string;
            image?: string;
          } | undefined;

          if (userObj && userObj.id) {
            const userId = userObj.id;
            const isTyping = (state.isTyping as boolean) || false;
            const existing = activeUserMap.get(userId);

            if (!existing) {
              activeUserMap.set(userId, {
                id: userId,
                name: userObj.name || "Collaborator",
                color: userObj.color || "#1565C0",
                image: userObj.image,
                isTyping,
                isOnline: true,
                isPointerActive: Boolean(state.pointer),
                lastActiveAt: (state.lastActiveAt as number | undefined) ?? (state.pointer as { timestamp?: number } | undefined)?.timestamp,
              });
            } else {
              existing.isTyping = existing.isTyping || isTyping;
              existing.isPointerActive = existing.isPointerActive || Boolean(state.pointer);
              existing.lastActiveAt = Math.max(
                existing.lastActiveAt ?? 0,
                (state.lastActiveAt as number | undefined) ?? (state.pointer as { timestamp?: number } | undefined)?.timestamp ?? 0
              );
            }
          }
        });

        const mergedUsers = new Map<string, CollaboratorUser>();
        presenceRosterRef.current.forEach((user) => {
          mergedUsers.set(user.id, { ...user, isOnline: false });
        });
        activeUserMap.forEach((user, id) => {
          mergedUsers.set(id, { ...mergedUsers.get(id), ...user, isOnline: true });
        });

        setCollaborators(Array.from(mergedUsers.values()));
      };

      cleanupCollaborationRef.current = cleanupCollaboration;
      awareness.on("change", updateCollaborators);
      updateCollaborators();
    } catch (err) {
      console.warn("[Yjs Collaboration] Connection fallback mode:", err);
      setConnectionStatus("disconnected");
    }

    return () => {
      isDestroyed = true;
      if (cleanupCollaborationRef.current) {
        cleanupCollaborationRef.current();
      }
    };
  }, [cleanupCollaboration, initialDocument.id]);

  // Sync awareness user info when currentUser changes
  useEffect(() => {
    if (provider && provider.awareness && currentUser) {
      provider.awareness.setLocalStateField("user", {
        id: currentUser.id,
        name: currentUser.name,
        color: currentUser.color,
        image: currentUser.image,
      });
    }
  }, [provider, currentUser]);

  // Offline / Online Status Monitoring
  useEffect(() => {
    const handleOnline = () => {
      if (pendingContentRef.current && pendingContentRef.current !== lastSavedContentRef.current) {
        setSaveStatus("saving");
        flushSaveQueue();
      } else {
        setSaveStatus("saved");
      }
    };

    const handleOffline = () => {
      setSaveStatus("offline");
      setConnectionStatus("disconnected");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) {
      setSaveStatus("offline");
      setConnectionStatus("disconnected");
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [flushSaveQueue]);

  // Prevent accidental navigation/tab-close while auto-saving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (
        saveStatus === "saving" ||
        (pendingContentRef.current && pendingContentRef.current !== lastSavedContentRef.current)
      ) {
        e.preventDefault();
        e.returnValue = "You have unsaved document edits!";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleContentChange = useCallback(
    (newContent: string) => {
      if (!isLoaded || !isEditable || newContent === lastSavedContentRef.current) {
        return;
      }

      if (provider && provider.awareness) {
        provider.awareness.setLocalStateField("isTyping", true);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          if (provider && provider.awareness) {
            provider.awareness.setLocalStateField("isTyping", false);
          }
        }, 1500);
      }

      pendingContentRef.current = newContent;

      if (!navigator.onLine) {
        setSaveStatus("offline");
        return;
      }

      setSaveStatus("saving");

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      scheduleSave(newContent);
    },
    [scheduleSave, isEditable, provider, isLoaded]
  );

  const handleRetrySave = useCallback(() => {
    if (pendingContentRef.current && isEditable) {
      saveInFlightRef.current = false;
      setSaveStatus("saving");
      flushSaveQueue();
    }
  }, [flushSaveQueue, isEditable]);

  const handleLeaveCollaboration = useCallback(() => {
    cleanupCollaboration();
  }, [cleanupCollaboration]);

  return (
    <div className="min-h-screen bg-[#FAFBFD] flex flex-col">
      <Navbar
        documentId={initialDocument.id}
        initialTitle={initialDocument.title}
        initialIsFavorite={initialDocument.isFavorite}
        saveStatus={saveStatus}
        lastSavedTime={lastSavedTime}
        onRetrySave={handleRetrySave}
        collaborators={collaborators}
        connectionStatus={connectionStatus}
        currentUserRole={initialDocument.userRole}
        onLeaveCollaboration={handleLeaveCollaboration}
        onOpenAIAssistant={() => openAIAssistant()}
      />
      <Editor
        initialContent={initialDocument.content}
        onContentChange={handleContentChange}
        onReady={handleEditorReady}
        yDoc={yDoc}
        provider={provider}
        currentUser={currentUser}
        isEditable={isEditable}
        onAIAction={(action, selection) => {
          openAIAssistant({
            prompt: `Help me ${action} this text: ${selection}`,
            mode: action === "rewrite" ? "rewrite" : action === "improve" ? "improve" : action === "summarize" ? "summarize" : action === "translate" ? "translate" : action === "expand" ? "expand" : action === "shorten" ? "shorten" : action === "explain" ? "explain" : "continue",
            selectedText: selection,
          });
        }}
      />
      <AISidebar
        isOpen={isAISidebarOpen}
        onClose={() => setIsAISidebarOpen(false)}
        documentTitle={initialDocument.title}
        selectedText={aiContext.selectedText}
        currentParagraph={aiContext.currentParagraph}
        headings={aiContext.headings}
        onInsert={handleAIInsert}
        initialPrompt={aiPromptPrefill}
        initialMode={aiModePrefill}
      />
    </div>
  );
}
