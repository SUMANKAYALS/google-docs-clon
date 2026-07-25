"use client";

import React from "react";
import { FilePlusIcon, SearchXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  type: "no-documents" | "no-search-results";
  onCreateDocument?: () => void;
  searchQuery?: string;
}

export const EmptyState = React.memo(({
  type,
  onCreateDocument,
  searchQuery,
}: EmptyStateProps) => {
  if (type === "no-search-results") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-neutral-200 rounded-xl my-6">
        <div className="size-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <SearchXIcon className="size-7" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No documents found</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          No document matches your search for &quot;{searchQuery}&quot;. Try checking for typos or clear your search query.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-neutral-200 rounded-xl my-6">
      <div className="size-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
        <FilePlusIcon className="size-7" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">No documents yet</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        Create your first document to start writing, formatting, and collaborating.
      </p>
      {onCreateDocument && (
        <Button onClick={onCreateDocument} className="bg-blue-600 hover:bg-blue-700">
          <FilePlusIcon className="size-4 mr-2" />
          Create New Document
        </Button>
      )}
    </div>
  );
});

EmptyState.displayName = "EmptyState";
