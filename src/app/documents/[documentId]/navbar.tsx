"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  FileTextIcon,
  StarIcon,
  CloudCheckIcon,
  CloudUploadIcon,
  AlertCircleIcon,
  CloudOffIcon,
  RefreshCwIcon,
} from "lucide-react";
import { UserAvatarMenu } from "@/components/user-avatar-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { InvitationsDropdown } from "@/components/notifications/invitations-dropdown";
import {
  CollaborationPresence,
  type CollaboratorUser,
} from "@/components/collaboration-presence";
import { ShareDialog } from "@/components/documents/share-dialog";
import {
  updateDocumentTitleAction,
  toggleFavoriteDocumentAction,
} from "@/actions/document-actions";
import { type UserRole } from "@/types";
import { Toolbar } from "./toolbar";
import { ActionToolbar } from "./toolbar/action-toolbar";

export type SaveStatus = "saved" | "saving" | "error" | "offline";

interface NavbarProps {
  documentId: string;
  initialTitle: string;
  initialIsFavorite: boolean;
  saveStatus?: SaveStatus;
  lastSavedTime?: string;
  onRetrySave?: () => void;
  collaborators?: CollaboratorUser[];
  connectionStatus?: "connected" | "connecting" | "disconnected";
  currentUserRole?: UserRole;
  onLeaveCollaboration?: () => void;
  onOpenAIAssistant?: () => void;
}

export const Navbar = React.memo(({
  documentId,
  initialTitle,
  initialIsFavorite,
  saveStatus = "saved",
  lastSavedTime,
  onRetrySave,
  collaborators = [],
  connectionStatus = "connected",
  currentUserRole = "viewer",
  onLeaveCollaboration,
  onOpenAIAssistant,
}: NavbarProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [isEditing, setIsEditing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  const handleTitleSubmit = async () => {
    setIsEditing(false);
    if (title.trim() && title.trim() !== initialTitle) {
      await updateDocumentTitleAction(documentId, title.trim());
    }
  };

  const handleFavoriteToggle = async () => {
    setIsFavorite((prev) => !prev);
    await toggleFavoriteDocumentAction(documentId);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--header-bg)] print:hidden">
      <div className="flex flex-col gap-3 px-3 py-3 lg:px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link href="/documents" title="Back to documents" className="shrink-0">
              <div className="flex size-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700">
                <ArrowLeftIcon className="size-4" />
              </div>
            </Link>

            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shadow-sm">
              <FileTextIcon className="size-5" />
            </div>

            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleSubmit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleTitleSubmit();
                      }
                    }}
                    className="min-w-0 rounded border border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 px-1 text-base font-semibold text-gray-900 dark:text-zinc-100 focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <h1
                    onClick={() => setIsEditing(true)}
                    className="cursor-pointer rounded px-1 text-base font-semibold text-gray-900 dark:text-zinc-100 transition-colors hover:bg-neutral-100 dark:hover:bg-zinc-800"
                  >
                    {title}
                  </h1>
                )}

                <button
                  type="button"
                  onClick={handleFavoriteToggle}
                  aria-label={isFavorite ? "Unstar document" : "Star document"}
                  className="rounded p-1 transition-colors hover:bg-neutral-100 dark:hover:bg-zinc-800"
                >
                  <StarIcon
                    className={`size-4 ${isFavorite ? "fill-amber-400 text-amber-400" : "text-gray-400"
                      }`}
                  />
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
                {saveStatus === "saving" && (
                  <span className="flex items-center font-medium text-amber-600">
                    <CloudUploadIcon className="mr-1 size-3.5 animate-pulse" />
                    Saving...
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span className="flex items-center font-medium text-gray-500">
                    <CloudCheckIcon className="mr-1 size-3.5 text-emerald-600" />
                    {lastSavedTime ? `Saved at ${lastSavedTime}` : "Saved"}
                  </span>
                )}
                {saveStatus === "offline" && (
                  <span className="flex items-center rounded bg-amber-50 px-2 py-0.5 font-medium text-amber-700">
                    <CloudOffIcon className="mr-1 size-3.5" />
                    Offline
                  </span>
                )}
                {saveStatus === "error" && (
                  <div className="flex items-center gap-2 rounded bg-red-50 px-2 py-0.5 font-medium text-red-600">
                    <span className="flex items-center">
                      <AlertCircleIcon className="mr-1 size-3.5" />
                      Save Failed
                    </span>
                    {onRetrySave && (
                      <button
                        type="button"
                        onClick={onRetrySave}
                        className="flex items-center underline transition-colors hover:text-red-900"
                      >
                        <RefreshCwIcon className="mr-0.5 size-3" /> Retry
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <ActionToolbar documentId={documentId} documentTitle={title} />
            <CollaborationPresence
              collaborators={collaborators}
              connectionStatus={connectionStatus}
            />
            <ShareDialog
              documentId={documentId}
              documentTitle={title}
              currentUserRole={currentUserRole}
              onLeaveCollaboration={onLeaveCollaboration}
            />
            <InvitationsDropdown />
            <ThemeToggle />
            <UserAvatarMenu />
          </div>
        </div>

        <div className="flex w-full items-center justify-center overflow-x-auto pb-1">
          <Toolbar onOpenAIAssistant={onOpenAIAssistant} />
        </div>
      </div>
    </header>
  );
});

Navbar.displayName = "Navbar";
