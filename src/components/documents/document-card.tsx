"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  FileTextIcon,
  MoreVerticalIcon,
  StarIcon,
  Trash2Icon,
  CopyIcon,
  Edit2Icon,
  RotateCcwIcon,
} from "lucide-react";
import { type DocumentItem } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface DocumentCardProps {
  document: DocumentItem;
  onFavoriteToggle: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDeletePermanently: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
}

export const DocumentCard = React.memo(({
  document,
  onFavoriteToggle,
  onArchive,
  onRestore,
  onDeletePermanently,
  onDuplicate,
  onRename,
}: DocumentCardProps) => {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(document.title);

  const formattedDate = formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true });

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onRename(document.id, newTitle.trim());
      setIsRenameOpen(false);
    }
  };

  return (
    <>
      <div className="group relative bg-white border border-neutral-200 rounded-xl hover:shadow-md transition-all flex flex-col justify-between p-4 overflow-hidden">
        <div>
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="size-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileTextIcon className="size-5" />
            </div>

            <div className="flex items-center gap-x-1">
              <button
                type="button"
                onClick={() => onFavoriteToggle(document.id)}
                aria-label={document.isFavorite ? "Unstar document" : "Star document"}
                className="p-1 rounded-full text-gray-400 hover:text-amber-500 hover:bg-neutral-100 transition-colors"
              >
                <StarIcon
                  className={`size-4 ${
                    document.isFavorite ? "fill-amber-400 text-amber-400" : ""
                  }`}
                />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Document options"
                    className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-neutral-100 transition-colors"
                  >
                    <MoreVerticalIcon className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 z-50">
                  <DropdownMenuItem onClick={() => setIsRenameOpen(true)}>
                    <Edit2Icon className="size-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(document.id)}>
                    <CopyIcon className="size-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />

                  {document.isArchived ? (
                    <>
                      <DropdownMenuItem onClick={() => onRestore(document.id)}>
                        <RotateCcwIcon className="size-4 mr-2" />
                        Restore
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeletePermanently(document.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2Icon className="size-4 mr-2" />
                        Delete Permanently
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => onArchive(document.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2Icon className="size-4 mr-2" />
                      Move to Trash
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Title Link */}
          <Link
            href={`/documents/${document.id}`}
            className="block text-base font-semibold text-gray-900 hover:text-blue-600 line-clamp-1 mb-1 transition-colors"
          >
            {document.title}
          </Link>
        </div>

        {/* Footer date info */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-gray-500">
          <span>Edited {formattedDate}</span>
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRenameSubmit} className="space-y-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Document title"
              required
              autoFocus
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRenameOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
});

DocumentCard.displayName = "DocumentCard";
