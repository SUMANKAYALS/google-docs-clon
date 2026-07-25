"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircleIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DocumentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Document Editor Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFBFD] px-4 text-center">
      <div className="size-16 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
        <AlertCircleIcon className="size-8" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Failed to load document</h1>
      <p className="text-sm text-gray-600 max-w-md mb-6">
        An error occurred while loading this document editor session.
      </p>
      <div className="flex items-center gap-x-3">
        <Button onClick={reset} variant="default" className="flex items-center gap-x-2">
          <RefreshCwIcon className="size-4" />
          Reload Editor
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
