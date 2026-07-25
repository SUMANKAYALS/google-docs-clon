import React from "react";
import { Loader2Icon } from "lucide-react";

export default function DocumentLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFD]">
      {/* Toolbar Skeleton */}
      <div className="h-10 bg-[#F1F4F9] mx-4 my-2 rounded-[24px] animate-pulse flex items-center px-4 gap-x-2">
        <div className="h-5 w-16 bg-neutral-300 rounded" />
        <div className="h-5 w-24 bg-neutral-300 rounded" />
        <div className="h-5 w-16 bg-neutral-300 rounded" />
        <div className="h-5 w-20 bg-neutral-300 rounded" />
      </div>

      {/* Editor Skeleton */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <Loader2Icon className="size-8 text-blue-600 animate-spin mb-2" />
        <p className="text-sm font-medium text-gray-500">Opening document...</p>
      </div>
    </div>
  );
}
