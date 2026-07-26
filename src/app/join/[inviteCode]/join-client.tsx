"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileTextIcon,
  UsersIcon,
  CheckCircle2Icon,
  Loader2Icon,
  AlertCircleIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { joinDocumentByInviteCodeAction } from "@/actions/sharing-actions";

interface JoinClientProps {
  inviteCode: string;
  document: {
    id: string;
    title: string;
    ownerName: string;
    ownerEmail: string;
    ownerImage?: string;
    collaboratorsCount: number;
    isAlreadyMember: boolean;
  };
}

export function JoinClient({ inviteCode, document }: JoinClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    setLoading(true);
    setError("");

    const res = await joinDocumentByInviteCodeAction(inviteCode);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  };

  const ownerInitials = document.ownerName
    ? document.ownerName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "OW";

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--editor-workspace)] px-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8 space-y-6">
        {/* Document Icon Header */}
        <div className="flex flex-col items-center text-center">
          <div className="size-16 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 shadow-inner">
            <FileTextIcon className="size-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 leading-snug">
            You are invited to collaborate
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Invite Code: <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{inviteCode}</span>
          </p>
        </div>

        {/* Document Information Card */}
        <div className="bg-neutral-50 dark:bg-zinc-800/40 border border-neutral-200/80 dark:border-zinc-750 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-zinc-700 pb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Document
            </span>
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2.5 py-0.5 rounded-full flex items-center gap-x-1">
              <ShieldCheckIcon className="size-3.5" /> Editor Access
            </span>
          </div>

          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 truncate">
            &quot;{document.title}&quot;
          </h2>

          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-zinc-300 pt-1">
            <div className="flex items-center gap-x-2">
              <Avatar className="size-6 border border-neutral-200 dark:border-zinc-700">
                <AvatarImage src={document.ownerImage} alt={document.ownerName} />
                <AvatarFallback className="bg-blue-600 text-white text-[10px] font-bold">
                  {ownerInitials}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-gray-800 dark:text-zinc-200">{document.ownerName}</span>
            </div>

            <div className="flex items-center gap-x-1 text-gray-500 dark:text-zinc-400 font-medium">
              <UsersIcon className="size-3.5 text-gray-400 dark:text-zinc-500" />
              <span>{document.collaboratorsCount} members</span>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs rounded-xl flex items-center gap-x-2">
            <AlertCircleIcon className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Interactive Join / Access Actions */}
        {document.isAlreadyMember ? (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-x-2 font-medium">
              <CheckCircle2Icon className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>You already have collaborator access to this document.</span>
            </div>

            <Button
              asChild
              className="w-full bg-blue-600 hover:bg-blue-700 font-medium h-11 rounded-xl shadow-sm text-white"
            >
              <Link href={`/documents/${document.id}`}>Open Document</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={handleJoin}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 rounded-xl shadow-sm text-sm"
            >
              {loading ? (
                <>
                  <Loader2Icon className="size-4 mr-2 animate-spin" />
                  Joining document...
                </>
              ) : (
                "Accept & Join Document"
              )}
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full border-neutral-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-neutral-50 dark:hover:bg-zinc-800 h-10 rounded-xl text-xs font-medium"
            >
              <Link href="/documents">
                <ArrowLeftIcon className="size-3.5 mr-1.5" /> Back to Dashboard
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
