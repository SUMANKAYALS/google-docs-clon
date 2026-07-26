"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BellIcon,
  CheckIcon,
  XIcon,
  Loader2Icon,
  FileTextIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  getUserInvitationsAction,
  acceptInvitationAction,
  rejectInvitationAction,
} from "@/actions/invitation-actions";
import { type InvitationItem } from "@/types";

export function InvitationsDropdown() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    const res = await getUserInvitationsAction();
    if (res.success && res.invitations) {
      setInvitations(res.invitations);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleAccept = async (invitationId: string) => {
    setActionLoadingId(invitationId);
    const res = await acceptInvitationAction(invitationId);
    setActionLoadingId(null);

    if (res.success && res.documentId) {
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
      router.push(`/documents/${res.documentId}`);
    }
  };

  const handleReject = async (invitationId: string) => {
    setActionLoadingId(invitationId);
    const res = await rejectInvitationAction(invitationId);
    setActionLoadingId(null);

    if (res.success) {
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors text-gray-600 dark:text-zinc-400 focus:outline-none"
          title="Document Invitations"
        >
          <BellIcon className="size-5" />
          {invitations.length > 0 && (
            <span className="absolute top-1 right-1 size-4 bg-blue-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-sm">
              {invitations.length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2 z-50 rounded-2xl shadow-xl border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-x-2">
            <BellIcon className="size-4 text-blue-600 dark:text-blue-450" /> Notifications
          </span>
          {invitations.length > 0 && (
            <span className="text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
              {invitations.length} pending
            </span>
          )}
        </div>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="py-6 flex items-center justify-center text-gray-500 dark:text-zinc-400 text-xs">
            <Loader2Icon className="size-4 animate-spin mr-2 text-blue-600 dark:text-blue-450" />
            Loading notifications...
          </div>
        ) : invitations.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-zinc-400 text-xs space-y-1">
            <FileTextIcon className="size-6 text-gray-300 dark:text-zinc-600 mx-auto" />
            <p className="font-medium text-gray-700 dark:text-zinc-300">No pending invites</p>
            <p className="text-gray-400 dark:text-zinc-500">You are all caught up!</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-2 p-1">
            {invitations.map((inv) => {
              const initials = inv.sender.name
                ? inv.sender.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                : "IN";

              const isLoading = actionLoadingId === inv.id;

              return (
                <div
                  key={inv.id}
                  className="bg-neutral-50/80 dark:bg-zinc-850/85 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 p-3 rounded-xl border border-neutral-100 dark:border-zinc-800 transition-colors space-y-2"
                >
                  <div className="flex items-start gap-x-2.5">
                    <Avatar className="size-8 border dark:border-zinc-800 mt-0.5">
                      <AvatarImage src={inv.sender.image} alt={inv.sender.name} />
                      <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-900 dark:text-zinc-100 font-semibold truncate">
                        {inv.sender.name} invited you to edit
                      </p>
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate mt-0.5">
                        &quot;{inv.document.title}&quot;
                      </p>
                      <span className="text-[10px] text-gray-400 dark:text-zinc-550 capitalize block mt-1">
                        Role: {inv.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-x-2 pt-1">
                    <Button
                      onClick={() => handleAccept(inv.id)}
                      disabled={isLoading}
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 rounded-lg shadow-sm"
                    >
                      {isLoading ? (
                        <Loader2Icon className="size-3.5 animate-spin" />
                      ) : (
                        <>
                          <CheckIcon className="size-3.5 mr-1" /> Accept
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleReject(inv.id)}
                      disabled={isLoading}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-gray-700 dark:text-zinc-300 hover:bg-neutral-100 dark:hover:bg-zinc-800 border-neutral-250 dark:border-zinc-700 bg-transparent text-xs h-7 rounded-lg"
                    >
                      <XIcon className="size-3.5 mr-1" /> Decline
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
