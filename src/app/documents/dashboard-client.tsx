"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FilePlusIcon,
  SearchIcon,
  StarIcon,
  Trash2Icon,
  FileTextIcon,
  ArrowUpDownIcon,
  Loader2Icon,
} from "lucide-react";
import { type DocumentItem } from "@/types";
import { UserAvatarMenu } from "@/components/user-avatar-menu";
import { InvitationsDropdown } from "@/components/notifications/invitations-dropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocumentCard } from "@/components/documents/document-card";
import { EmptyState } from "@/components/documents/empty-state";
import {
  createDocumentAction,
  archiveDocumentAction,
  restoreDocumentAction,
  deleteDocumentPermanentlyAction,
  duplicateDocumentAction,
  toggleFavoriteDocumentAction,
  updateDocumentTitleAction,
} from "@/actions/document-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardClientProps {
  initialDocuments: DocumentItem[];
}

export function DashboardClient({ initialDocuments }: DashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "favorites" | "trash">("all");
  const [sortBy, setSortBy] = useState<"updatedAt" | "title" | "createdAt">("updatedAt");
  const [isCreating, setIsCreating] = useState(false);

  // Filtered documents
  const filteredDocuments = documents
    .filter((doc) => {
      if (filterTab === "trash") return doc.isArchived;
      if (filterTab === "favorites") return !doc.isArchived && doc.isFavorite;
      return !doc.isArchived;
    })
    .filter((doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
    )
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "createdAt") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const handleCreateDocument = async () => {
    setIsCreating(true);
    const res = await createDocumentAction("Untitled Document");
    setIsCreating(false);

    if (res.success && res.document) {
      router.push(`/documents/${res.document.id}`);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, isFavorite: !doc.isFavorite } : doc
      )
    );
    await toggleFavoriteDocumentAction(id);
    startTransition(() => router.refresh());
  };

  const handleArchive = async (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, isArchived: true } : doc))
    );
    await archiveDocumentAction(id);
    startTransition(() => router.refresh());
  };

  const handleRestore = async (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, isArchived: false } : doc))
    );
    await restoreDocumentAction(id);
    startTransition(() => router.refresh());
  };

  const handleDeletePermanently = async (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    await deleteDocumentPermanentlyAction(id);
    startTransition(() => router.refresh());
  };

  const handleDuplicate = async (id: string) => {
    const res = await duplicateDocumentAction(id);
    if (res.success && res.document) {
      setDocuments((prev) => [res.document!, ...prev]);
      startTransition(() => router.refresh());
    }
  };

  const handleRename = async (id: string, newTitle: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, title: newTitle } : doc))
    );
    await updateDocumentTitleAction(id, newTitle);
    startTransition(() => router.refresh());
  };

  return (
    <div className="min-h-screen bg-[#FAFBFD] flex flex-col">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-x-3">
          <div className="size-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <FileTextIcon className="size-5" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Clouds Docs Workspace</h1>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-2.5 size-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search documents by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-neutral-50 border-neutral-200 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-x-3">
          <InvitationsDropdown />
          <UserAvatarMenu />
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {/* Template / Create section banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Start a new document</h2>
            <p className="text-sm text-gray-600 mt-0.5">
              Create a clean rich-text document with tables, images, and collaborative formatting tools.
            </p>
          </div>
          <Button
            onClick={handleCreateDocument}
            disabled={isCreating}
            className="bg-blue-600 hover:bg-blue-700 h-11 px-6 shadow-sm"
          >
            {isCreating ? (
              <>
                <Loader2Icon className="size-5 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FilePlusIcon className="size-5 mr-2" />
                Blank Document
              </>
            )}
          </Button>
        </div>

        {/* Filter Bar & Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-neutral-200 pb-4">
          <div className="flex items-center gap-x-2">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterTab === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-neutral-200/70"
              }`}
            >
              All Documents ({documents.filter((d) => !d.isArchived).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("favorites")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-x-1.5 transition-colors ${
                filterTab === "favorites"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-neutral-200/70"
              }`}
            >
              <StarIcon className="size-4" />
              Starred ({documents.filter((d) => !d.isArchived && d.isFavorite).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("trash")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-x-1.5 transition-colors ${
                filterTab === "trash"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-neutral-200/70"
              }`}
            >
              <Trash2Icon className="size-4" />
              Trash ({documents.filter((d) => d.isArchived).length})
            </button>
          </div>

          <div className="flex items-center gap-x-3">
            {isPending && <Loader2Icon className="size-4 text-blue-600 animate-spin" />}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-x-2">
                  <ArrowUpDownIcon className="size-4 text-gray-500" />
                  <span>
                    Sort: {sortBy === "updatedAt" ? "Last Modified" : sortBy === "title" ? "Title" : "Date Created"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50">
                <DropdownMenuItem onClick={() => setSortBy("updatedAt")}>
                  Last Modified
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("title")}>
                  Title
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("createdAt")}>
                  Date Created
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Document Cards Grid / Empty States */}
        {filteredDocuments.length === 0 ? (
          <EmptyState
            type={searchQuery ? "no-search-results" : "no-documents"}
            searchQuery={searchQuery}
            onCreateDocument={handleCreateDocument}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onFavoriteToggle={handleToggleFavorite}
                onArchive={handleArchive}
                onRestore={handleRestore}
                onDeletePermanently={handleDeletePermanently}
                onDuplicate={handleDuplicate}
                onRename={handleRename}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
