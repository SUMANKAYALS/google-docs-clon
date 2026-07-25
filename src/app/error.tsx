"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFBFD] px-4 text-center">
      <div className="size-16 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
        <AlertTriangleIcon className="size-8" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h1>
      <p className="text-sm text-gray-600 max-w-md mb-6">
        An unexpected error occurred while loading this page. Our team has been notified.
      </p>
      <div className="flex items-center gap-x-3">
        <Button onClick={reset} variant="default" className="flex items-center gap-x-2">
          <RefreshCwIcon className="size-4" />
          Try Again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
