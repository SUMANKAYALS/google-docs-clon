import React from "react";
import { Loader2Icon } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFBFD]">
      <Loader2Icon className="size-8 text-blue-600 animate-spin mb-3" />
      <p className="text-sm font-medium text-gray-500">Loading document workspace...</p>
    </div>
  );
}
