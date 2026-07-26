"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  SearchIcon,
  StarIcon,
  Trash2Icon,
  FileTextIcon,
  ArrowUpDownIcon,
  Loader2Icon,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { TEMPLATES, type Template } from "@/constants/templates";
import { type DocumentItem } from "@/types";
import { UserAvatarMenu } from "@/components/user-avatar-menu";
import { ThemeToggle } from "@/components/theme-toggle";
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

  const [searchTemplateQuery, setSearchTemplateQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([]);
  const [recentTemplates, setRecentTemplates] = useState<string[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [showGallery, setShowGallery] = useState(true);

  React.useEffect(() => {
    try {
      const favs = localStorage.getItem("clouds-docs-favorite-templates");
      if (favs) setFavoriteTemplates(JSON.parse(favs));

      const recents = localStorage.getItem("clouds-docs-recent-templates");
      if (recents) setRecentTemplates(JSON.parse(recents));
    } catch (e) {
      console.error("Error loading templates preferences:", e);
    }
  }, []);

  const toggleFavoriteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favoriteTemplates.includes(id)
      ? favoriteTemplates.filter((favId) => favId !== id)
      : [...favoriteTemplates, id];
    setFavoriteTemplates(updated);
    localStorage.setItem("clouds-docs-favorite-templates", JSON.stringify(updated));
  };

  const handleUseTemplate = async (template: Template) => {
    setIsCreating(true);
    const title = template.id === "blank" ? "Untitled Document" : template.name;
    const content = template.htmlContent;

    const res = await createDocumentAction(title, content);
    setIsCreating(false);

    if (res.success && res.document) {
      if (template.id !== "blank") {
        const filtered = recentTemplates.filter((rid) => rid !== template.id);
        const updated = [template.id, ...filtered.slice(0, 3)];
        setRecentTemplates(updated);
        localStorage.setItem("clouds-docs-recent-templates", JSON.stringify(updated));
      }
      router.push(`/documents/${res.document.id}`);
    }
  };

  const filteredTemplates = React.useMemo(() => {
    return TEMPLATES.filter((template) => {
      if (selectedCategory !== "all" && template.category !== selectedCategory) {
        return false;
      }
      if (searchTemplateQuery.trim()) {
        const query = searchTemplateQuery.toLowerCase().trim();
        const matchesName = template.name.toLowerCase().includes(query);
        const matchesCategory = template.category.toLowerCase().includes(query);
        const matchesTags = template.tags.some((tag) => tag.toLowerCase().includes(query));
        return matchesName || matchesCategory || matchesTags;
      }
      return true;
    }).sort((a, b) => {
      const aFav = favoriteTemplates.includes(a.id);
      const bFav = favoriteTemplates.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });
  }, [searchTemplateQuery, selectedCategory, favoriteTemplates]);

  const CATEGORIES = React.useMemo(() => [
    { id: "all", label: "All Templates" },
    { id: "work", label: "Work" },
    { id: "business", label: "Business" },
    { id: "education", label: "Education" },
    { id: "personal", label: "Personal" },
    { id: "developer", label: "Developer" },
    { id: "marketing", label: "Marketing" },
    { id: "finance", label: "Finance" }
  ], []);

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
    <div className="min-h-screen bg-[var(--editor-workspace)] flex flex-col">
      {/* Top Header */}
      <header className="h-16 bg-[var(--header-bg)] border-b border-[var(--border)] px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-x-3">
          <div className="size-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <FileTextIcon className="size-5" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Clouds Docs Workspace</h1>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-2.5 size-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search documents by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-neutral-50 dark:bg-zinc-800 border-neutral-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-x-3">
          <InvitationsDropdown />
          <ThemeToggle />
          <UserAvatarMenu />
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {/* Google Docs-Style Template Gallery */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-6 mb-8 print:hidden shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Start a new document</h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Choose from a variety of professionally designed layouts or a blank canvas.</p>
            </div>
            <button
              onClick={() => setShowGallery(!showGallery)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-x-1"
            >
              {showGallery ? "Hide templates" : "Show templates"}
              {showGallery ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          </div>

          {showGallery && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Search & Category Filter Bar */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-t border-neutral-100 dark:border-zinc-800 pt-4">
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        selectedCategory === cat.id
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-neutral-100 dark:bg-zinc-850 text-gray-600 dark:text-zinc-450 hover:bg-neutral-200/70 dark:hover:bg-zinc-750"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full lg:w-64 shrink-0">
                  <SearchIcon className="absolute left-3 top-2.5 size-3.5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTemplateQuery}
                    onChange={(e) => setSearchTemplateQuery(e.target.value)}
                    className="pl-9 h-9 text-xs bg-neutral-50 dark:bg-zinc-850 border-neutral-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900"
                  />
                </div>
              </div>

              {/* Recents Row (if any) */}
              {recentTemplates.length > 0 && !searchTemplateQuery && selectedCategory === "all" && (
                <div className="bg-neutral-50/50 dark:bg-zinc-950/20 p-3 rounded-xl border border-neutral-100 dark:border-zinc-850 animate-in fade-in duration-200">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">Recently Used Templates</span>
                  <div className="flex flex-wrap gap-3">
                    {recentTemplates.map((tid) => {
                      const tmpl = TEMPLATES.find((t) => t.id === tid);
                      if (!tmpl) return null;
                      return (
                        <button
                          key={`recent-tmpl-${tmpl.id}`}
                          onClick={() => handleUseTemplate(tmpl)}
                          className="flex items-center gap-x-2 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 hover:border-blue-500 hover:shadow-sm transition-all px-3 py-1.5 rounded-lg text-xs font-medium text-gray-800 dark:text-zinc-200"
                        >
                          <div className={`size-2.5 rounded-full bg-gradient-to-br ${tmpl.colorPreset}`} />
                          <span>{tmpl.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Grid / Horizontal List Container */}
              <div className="overflow-x-auto pb-2 flex gap-4 snap-x snap-mandatory scroll-smooth scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-zinc-700">
                {filteredTemplates.length === 0 ? (
                  <div className="w-full text-center py-8 text-sm text-gray-500 dark:text-zinc-400">
                    No templates found matching your search.
                  </div>
                ) : (
                  filteredTemplates.map((tmpl) => {
                    const isStarred = favoriteTemplates.includes(tmpl.id);
                    return (
                      <div
                        key={tmpl.id}
                        className="w-[160px] md:w-[170px] shrink-0 snap-start bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-500/80 transition-all flex flex-col group relative"
                      >
                        {/* Preview gradient header */}
                        <div
                          onClick={() => setPreviewTemplate(tmpl)}
                          className={`h-24 bg-gradient-to-br ${tmpl.colorPreset} flex items-center justify-center cursor-pointer relative group-hover:opacity-90 transition-opacity`}
                        >
                          {/* Stylized document layout icon representation */}
                          <div className="w-12 h-16 bg-white/95 dark:bg-zinc-900/95 rounded shadow-lg p-2 flex flex-col gap-y-1">
                            <div className="w-4 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-sm" />
                            <div className="w-8 h-1 bg-neutral-100 dark:bg-zinc-700 rounded-sm" />
                            <div className="w-6 h-1 bg-neutral-100 dark:bg-zinc-700 rounded-sm" />
                            <div className="w-7 h-1 bg-neutral-100 dark:bg-zinc-700 rounded-sm" />
                          </div>

                          {/* Hover Overlay preview prompt */}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold uppercase tracking-wider">
                            Preview
                          </div>
                        </div>

                        {/* Star / Favorite trigger */}
                        {tmpl.id !== "blank" && (
                          <button
                            type="button"
                            onClick={(e) => toggleFavoriteTemplate(tmpl.id, e)}
                            className="absolute top-2 right-2 p-1 rounded-full bg-white/90 dark:bg-zinc-900/90 shadow hover:scale-115 transition-all text-amber-500 z-10"
                            title={isStarred ? "Unstar template" : "Star template"}
                          >
                            <StarIcon className={`size-3 ${isStarred ? "fill-amber-400 text-amber-400" : "text-gray-400"}`} />
                          </button>
                        )}

                        {/* Details */}
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[8px] font-extrabold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                              {tmpl.category}
                            </span>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-zinc-100 truncate mt-0.5" title={tmpl.name}>
                              {tmpl.name}
                            </h4>
                            <p className="text-[10px] text-gray-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-normal h-8" title={tmpl.description}>
                              {tmpl.description}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => handleUseTemplate(tmpl)}
                            className="w-full mt-3 h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          >
                            Use
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Filter Bar & Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-neutral-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-x-2">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterTab === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-zinc-400 hover:bg-neutral-200/70 dark:hover:bg-zinc-800"
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
                  : "text-gray-600 dark:text-zinc-400 hover:bg-neutral-200/70 dark:hover:bg-zinc-800"
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
                  : "text-gray-600 dark:text-zinc-400 hover:bg-neutral-200/70 dark:hover:bg-zinc-800"
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

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left">
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-150 dark:border-zinc-800 flex items-start justify-between bg-white dark:bg-zinc-900">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full uppercase tracking-wider">
                  {previewTemplate.category}
                </span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mt-1">{previewTemplate.name}</h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">{previewTemplate.description}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setPreviewTemplate(null)}
                className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body: Document Preview Mockup */}
            <div className="flex-1 overflow-y-auto p-6 bg-neutral-50 dark:bg-zinc-950 flex justify-center">
              <div className="w-[500px] bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-850 rounded shadow-lg p-8 min-h-[500px] text-left text-xs prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: previewTemplate.htmlContent }} />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-150 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setPreviewTemplate(null)}
                className="text-gray-700 dark:text-zinc-350 hover:bg-neutral-200/50 dark:hover:bg-zinc-850"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const tmpl = previewTemplate;
                  setPreviewTemplate(null);
                  handleUseTemplate(tmpl);
                }}
                disabled={isCreating}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                Use Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
