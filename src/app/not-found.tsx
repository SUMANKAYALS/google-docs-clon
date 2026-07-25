import React from "react";
import Link from "next/link";
import { FileQuestionIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFBFD] px-4 text-center">
      <div className="size-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-blue-600">
        <FileQuestionIcon className="size-8" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">404 - Document Not Found</h1>
      <p className="text-sm text-gray-600 max-w-md mb-6">
        The document or page you are looking for does not exist or may have been moved.
      </p>
      <Button asChild className="bg-blue-600 hover:bg-blue-700">
        <Link href="/">Back to Documents</Link>
      </Button>
    </div>
  );
}
