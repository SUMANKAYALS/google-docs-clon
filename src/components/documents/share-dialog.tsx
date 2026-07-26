"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Share2Icon,
  CopyIcon,
  CheckIcon,
  UsersIcon,
  ShieldIcon,
  Trash2Icon,
  Loader2Icon,
  EyeIcon,
  Edit3Icon,
  SearchIcon,
  UserPlusIcon,
  RefreshCwIcon,
  LogOutIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getInviteCodeAction,
  getDocumentCollaboratorsAction,
  updateCollaboratorRoleAction,
  removeCollaboratorAction,
} from "@/actions/sharing-actions";
import { leaveDocumentAction, deleteDocumentPermanentlyAction } from "@/actions/document-actions";
import {
  searchUsersAction,
  sendUserInvitationAction,
  regenerateInviteCodeAction,
} from "@/actions/invitation-actions";
import {
  type CollaboratorMemberDetails,
  type SearchedUserItem,
  type UserRole,
} from "@/types";

interface ShareDialogProps {
  documentId: string;
  documentTitle: string;
  currentUserRole?: UserRole;
  onLeaveCollaboration?: () => void;
}

export function ShareDialog({
  documentId,
  documentTitle,
  currentUserRole = "viewer",
  onLeaveCollaboration,
}: ShareDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [inviteCode, setInviteCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [owner, setOwner] = useState<{ userId: string; name: string; email: string; image?: string } | null>(null);
  const [collaborators, setCollaborators] = useState<CollaboratorMemberDetails[]>([]);

  // User search & direct invite state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchedUserItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"editor" | "viewer">("editor");
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState("");
  const [inviteErrorMsg, setInviteErrorMsg] = useState("");
  const [invitingUserId, setInvitingUserId] = useState<string | null>(null);

  const isOwner = currentUserRole === "owner";

  const loadSharingData = useCallback(async () => {
    setLoading(true);
    const codeRes = await getInviteCodeAction(documentId);
    if (codeRes.success && codeRes.inviteCode) {
      setInviteCode(codeRes.inviteCode);
    }

    const collabRes = await getDocumentCollaboratorsAction(documentId);
    if (collabRes.success) {
      if (collabRes.owner) setOwner(collabRes.owner);
      if (collabRes.collaborators) setCollaborators(collabRes.collaborators);
      if (collabRes.inviteCode) setInviteCode(collabRes.inviteCode);
    }
    setLoading(false);
  }, [documentId]);

  useEffect(() => {
    if (open) {
      loadSharingData();
    }
  }, [open, loadSharingData]);

  // Debounced User Search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchUsersAction(searchQuery, documentId);
      setIsSearching(false);
      if (res.success && res.users) {
        setSearchResults(res.users);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, documentId]);

  const getShareUrl = () => {
    if (typeof window === "undefined" || !inviteCode) return "";
    return `${window.location.origin}/join/${inviteCode}`;
  };

  const handleCopyLink = () => {
    const url = getShareUrl();
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateCode = async () => {
    const res = await regenerateInviteCodeAction(documentId);
    if (res.success && res.inviteCode) {
      setInviteCode(res.inviteCode);
    }
  };

  const handleSendInvite = async (targetUserId: string) => {
    setInviteErrorMsg("");
    setInviteSuccessMsg("");
    setInvitingUserId(targetUserId);

    const res = await sendUserInvitationAction(documentId, targetUserId, selectedRole);
    setInvitingUserId(null);

    if (res.error) {
      setInviteErrorMsg(res.error);
    } else {
      setInviteSuccessMsg("Invitation sent successfully!");
      setSearchResults((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, isPendingInvite: true } : u))
      );
      setTimeout(() => setInviteSuccessMsg(""), 3000);
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: "editor" | "viewer") => {
    setCollaborators((prev) =>
      prev.map((c) => (c.userId === targetUserId ? { ...c, role: newRole } : c))
    );
    await updateCollaboratorRoleAction(documentId, targetUserId, newRole);
  };

  const handleRemoveCollaborator = async (targetUserId: string) => {
    setCollaborators((prev) => prev.filter((c) => c.userId !== targetUserId));
    await removeCollaboratorAction(documentId, targetUserId);
  };

  const handleConfirmLeave = async () => {
    setIsLeaving(true);
    if (onLeaveCollaboration) {
      onLeaveCollaboration();
    }
    const res = await leaveDocumentAction(documentId);
    setIsLeaving(false);
    if (res.success) {
      setOpen(false);
      setLeaveConfirmOpen(false);
      router.push("/documents");
    }
  };

  const handleDeleteDocument = async () => {
    const res = await deleteDocumentPermanentlyAction(documentId);
    if (res.success) {
      setOpen(false);
      router.push("/documents");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 shadow-sm flex items-center gap-x-2 rounded-full"
          >
            <Share2Icon className="size-4" />
            <span>Share</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-x-2 text-gray-900">
              <UsersIcon className="size-5 text-blue-600" />
              Share &quot;{documentTitle}&quot;
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center text-gray-500 gap-y-2">
              <Loader2Icon className="size-6 text-blue-600 animate-spin" />
              <span className="text-xs font-medium">Loading permissions...</span>
            </div>
          ) : (
            <div className="space-y-6 mt-2">
              {/* Search Registered Users Section (Owner Only) */}
              {isOwner && (
                <div className="space-y-3 bg-neutral-50 dark:bg-zinc-850/50 p-3.5 rounded-xl border border-neutral-200 dark:border-zinc-800">
                  <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider block">
                    Add People
                  </span>

                  <div className="flex items-center gap-x-2">
                    <div className="relative flex-1">
                      <SearchIcon className="absolute left-3 top-2.5 size-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white dark:bg-zinc-900 border-neutral-200 dark:border-zinc-755 text-xs text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-555"
                      />
                    </div>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as "editor" | "viewer")}
                      className="text-xs border border-neutral-200 dark:border-zinc-700 rounded-md px-2 py-2 bg-white dark:bg-zinc-900 font-medium text-gray-700 dark:text-zinc-300 focus:outline-none"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>

                  {inviteSuccessMsg && (
                    <div className="text-xs text-emerald-700 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded font-medium">
                      {inviteSuccessMsg}
                    </div>
                  )}
                  {inviteErrorMsg && (
                    <div className="text-xs text-red-700 dark:text-red-450 bg-red-50 dark:bg-red-950/20 p-2 rounded font-medium">
                      {inviteErrorMsg}
                    </div>
                  )}

                  {/* Search Results */}
                  {isSearching ? (
                    <div className="py-3 text-center text-xs text-gray-500 dark:text-zinc-400 flex items-center justify-center">
                      <Loader2Icon className="size-3.5 animate-spin mr-1.5 text-blue-600 dark:text-blue-450" />
                      Searching workspace users...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pt-1">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-2 bg-white dark:bg-zinc-900 rounded-lg border border-neutral-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-900/40 transition-colors"
                        >
                          <div className="flex items-center gap-x-2.5">
                            <Avatar className="size-7 border dark:border-zinc-800">
                              <AvatarImage src={user.image} alt={user.name} />
                              <AvatarFallback className="bg-blue-600 text-white text-[10px] font-bold">
                                {user.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-gray-900 dark:text-zinc-100">{user.name}</span>
                              <span className="text-[10px] text-gray-500 dark:text-zinc-400">{user.email}</span>
                            </div>
                          </div>

                          {user.isCollaborator ? (
                            <span className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 bg-neutral-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                              Member
                            </span>
                          ) : user.isPendingInvite ? (
                            <span className="text-[10px] font-medium text-amber-700 dark:text-amber-450 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded">
                              Invited
                            </span>
                          ) : (
                            <Button
                              onClick={() => handleSendInvite(user.id)}
                              disabled={invitingUserId === user.id}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] h-7 px-3 rounded-md shadow-sm"
                            >
                              {invitingUserId === user.id ? (
                                <Loader2Icon className="size-3 animate-spin" />
                              ) : (
                                <>
                                  <UserPlusIcon className="size-3 mr-1" /> Invite
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}

              {/* Shareable Link Box */}
              <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                    Invite Link
                  </span>
                  <div className="flex items-center gap-x-2">
                    {inviteCode && (
                      <span className="text-xs font-mono font-semibold bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400 px-2 py-0.5 rounded">
                        Code: {inviteCode}
                      </span>
                    )}
                    {isOwner && (
                      <button
                        type="button"
                        onClick={handleRegenerateCode}
                        className="text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 rounded"
                        title="Regenerate link code"
                      >
                        <RefreshCwIcon className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-x-2">
                  <input
                    type="text"
                    readOnly
                    value={getShareUrl()}
                    className="flex-1 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-gray-700 dark:text-zinc-300 font-mono focus:outline-none select-all"
                  />
                  <Button
                    onClick={handleCopyLink}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 h-8 shrink-0"
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="size-3.5 mr-1" /> Copied
                      </>
                    ) : (
                      <>
                        <CopyIcon className="size-3.5 mr-1" /> Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Collaborators List */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  People with Access ({1 + collaborators.length})
                </span>

                {/* Owner Entry */}
                {owner && (
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-zinc-800 transition-colors">
                    <div className="flex items-center gap-x-3">
                      <Avatar className="size-8 border dark:border-zinc-850">
                        <AvatarImage src={owner.image} alt={owner.name} />
                        <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                          {owner.name?.slice(0, 2).toUpperCase() || "OW"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{owner.name} (Owner)</span>
                        <span className="text-xs text-gray-500 dark:text-zinc-400">{owner.email}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 px-2.5 py-1 rounded-full flex items-center gap-x-1">
                      <ShieldIcon className="size-3" /> Owner
                    </span>
                  </div>
                )}

                {/* Collaborator Members */}
                {collaborators.map((c) => {
                  const initials = c.name
                    ? c.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                    : "U";

                  return (
                    <div
                      key={c.userId}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-center gap-x-3">
                        <Avatar className="size-8 border dark:border-zinc-850">
                          <AvatarImage src={c.image} alt={c.name} />
                          <AvatarFallback className="bg-neutral-700 dark:bg-zinc-800 text-white text-xs font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 dark:text-zinc-100">{c.name}</span>
                          <span className="text-xs text-gray-500 dark:text-zinc-400">{c.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-x-2">
                        {isOwner ? (
                          <>
                            <select
                              value={c.role}
                              onChange={(e) =>
                                handleRoleChange(c.userId, e.target.value as "editor" | "viewer")
                              }
                              className="text-xs border border-neutral-300 dark:border-zinc-700 rounded px-2 py-1 bg-white dark:bg-zinc-900 font-medium text-gray-700 dark:text-zinc-300 focus:outline-none"
                            >
                              <option value="editor">Can Edit</option>
                              <option value="viewer">Can View</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => handleRemoveCollaborator(c.userId)}
                              className="p-1 text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                              title="Remove collaborator"
                            >
                              <Trash2Icon className="size-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-medium text-gray-600 dark:text-zinc-350 bg-neutral-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full flex items-center gap-x-1">
                            {c.role === "editor" ? (
                              <>
                                <Edit3Icon className="size-3 text-emerald-600 dark:text-emerald-450" /> Editor
                              </>
                            ) : (
                              <>
                                <EyeIcon className="size-3 text-blue-600" /> Viewer
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {isOwner ? (
                <div className="pt-4 border-t border-neutral-200 flex justify-end">
                  <Button
                    onClick={handleDeleteDocument}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 text-xs font-medium flex items-center gap-x-1.5"
                  >
                    <Trash2Icon className="size-3.5" />
                    <span>Delete Document</span>
                  </Button>
                </div>
              ) : (
                <div className="pt-4 border-t border-neutral-200 flex justify-end">
                  <Button
                    onClick={() => setLeaveConfirmOpen(true)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 text-xs font-medium flex items-center gap-x-1.5"
                  >
                    <LogOutIcon className="size-3.5" />
                    <span>Leave Collaboration</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal for Leaving Collaboration */}
      <Dialog open={leaveConfirmOpen} onOpenChange={setLeaveConfirmOpen}>
        <DialogContent className="sm:max-w-sm rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-x-2">
              <LogOutIcon className="size-5 text-red-600" />
              Leave Document Collaboration?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-xs text-gray-600 mt-2">
            <p>
              Are you sure you want to leave <strong>&quot;{documentTitle}&quot;</strong>?
            </p>
            <p className="bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-100">
              You will lose edit and view access to this document immediately until you are reinvited.
            </p>
            <div className="flex items-center justify-end gap-x-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLeaveConfirmOpen(false)}
                disabled={isLeaving}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmLeave}
                disabled={isLeaving}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-4"
              >
                {isLeaving ? (
                  <Loader2Icon className="size-3.5 animate-spin mr-1" />
                ) : (
                  <LogOutIcon className="size-3.5 mr-1" />
                )}
                Confirm Leave
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
