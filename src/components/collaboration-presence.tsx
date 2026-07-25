"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface CollaboratorUser {
  id: string;
  name: string;
  image?: string;
  color: string;
  isTyping?: boolean;
  isOnline?: boolean;
  isPointerActive?: boolean;
  lastActiveAt?: number;
}

interface CollaborationPresenceProps {
  collaborators: CollaboratorUser[];
  connectionStatus: "connected" | "connecting" | "disconnected";
}

export const CollaborationPresence = React.memo(({
  collaborators,
  connectionStatus,
}: CollaborationPresenceProps) => {
  const activeCollaborators = collaborators.filter((user) => user.isOnline !== false);
  const inactiveCollaborators = collaborators.filter((user) => user.isOnline === false);

  const formatLastActive = (timestamp?: number) => {
    if (!timestamp) return "just now";
    const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return `${Math.floor(diffSeconds / 3600)}h ago`;
  };

  return (
    <div className="flex items-center gap-x-2 select-none">
      {/* Status indicator badge */}
      <div className="flex items-center gap-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 border border-neutral-200">
        <span
          className={`size-2 rounded-full ${connectionStatus === "connected"
            ? "bg-emerald-500 animate-pulse"
            : connectionStatus === "connecting"
              ? "bg-amber-500 animate-ping"
              : "bg-red-500"
            }`}
        />
        <span className="text-gray-700 capitalize">
          {connectionStatus === "connected"
            ? "Live Sync"
            : connectionStatus === "connecting"
              ? "Connecting..."
              : "Offline"}
        </span>
      </div>

      {/* Collaborator Avatars Stack */}
      <div className="flex items-center -space-x-2 overflow-hidden">
        {activeCollaborators.map((user, idx) => {
          const initials = user.name
            ? user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
            : "U";

          return (
            <div
              key={user.id ? `${user.id}-${idx}` : `collab-${idx}`}
              className="relative transition-transform hover:z-10 hover:scale-110 cursor-pointer"
              title={`${user.name}${user.isTyping ? " (Typing...)" : ""}${user.isPointerActive ? " • Mouse activity" : ""}${user.lastActiveAt ? ` • ${formatLastActive(user.lastActiveAt)}` : ""}`}
            >
              <Avatar
                className="size-8 border-2 shadow-sm transition-all"
                style={{ borderColor: user.color }}
              >
                <AvatarImage src={user.image || undefined} alt={user.name} />
                <AvatarFallback
                  className="text-white text-xs font-bold"
                  style={{ backgroundColor: user.color }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>

            </div>
          );
        })}
      </div>

      {inactiveCollaborators.length > 0 && (
        <div className="flex items-center gap-x-1 text-[11px] text-gray-500">
          <span className="size-2 rounded-full bg-gray-300" />
          <span>{inactiveCollaborators.length} offline</span>
        </div>
      )}
    </div>
  );
});

CollaborationPresence.displayName = "CollaborationPresence";
