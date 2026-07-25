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
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#FAFBFD] px-4">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-xl p-8 space-y-6">
        {/* Document Icon Header */}
        <div className="flex flex-col items-center text-center">
          <div className="size-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-inner">
            <FileTextIcon className="size-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 leading-snug">
            You are invited to collaborate
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Invite Code: <span className="font-mono font-semibold text-blue-600">{inviteCode}</span>
          </p>
        </div>

        {/* Document Information Card */}
        <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Document
            </span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full flex items-center gap-x-1">
              <ShieldCheckIcon className="size-3.5" /> Editor Access
            </span>
          </div>

          <h2 className="text-lg font-bold text-gray-900 truncate">
            &quot;{document.title}&quot;
          </h2>

          <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
            <div className="flex items-center gap-x-2">
              <Avatar className="size-6 border">
                <AvatarImage src={document.ownerImage} alt={document.ownerName} />
                <AvatarFallback className="bg-blue-600 text-white text-[10px] font-bold">
                  {ownerInitials}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-gray-800">{document.ownerName}</span>
            </div>

            <div className="flex items-center gap-x-1 text-gray-500 font-medium">
              <UsersIcon className="size-3.5 text-gray-400" />
              <span>{document.collaboratorsCount} members</span>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-x-2">
            <AlertCircleIcon className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Interactive Join / Access Actions */}
        {document.isAlreadyMember ? (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-x-2 font-medium">
              <CheckCircle2Icon className="size-4 text-emerald-600 shrink-0" />
              <span>You already have collaborator access to this document.</span>
            </div>

            <Button
              asChild
              className="w-full bg-blue-600 hover:bg-blue-700 font-medium h-11 rounded-xl shadow-sm"
            >
              <Link href={`/documents/${document.id}`}>Open Document</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={handleJoin}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 font-semibold h-11 rounded-xl shadow-sm text-sm"
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
              className="w-full border-neutral-200 text-gray-700 hover:bg-neutral-50 h-10 rounded-xl text-xs font-medium"
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
