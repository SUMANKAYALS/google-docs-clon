import { notFound } from "next/navigation";
import { getDocumentByIdAction } from "@/actions/document-actions";
import { isValidObjectId } from "@/lib/db";
import { DocumentClient } from "./document-client";

export const dynamic = "force-dynamic";

interface DocumentIdPageProps {
  params: Promise<{ documentId: string }>;
}

export async function generateMetadata({ params }: DocumentIdPageProps) {
  const { documentId } = await params;

  if (!isValidObjectId(documentId)) {
    return {
      title: "Document Not Found - Clouds Docs",
    };
  }

  const result = await getDocumentByIdAction(documentId);

  if (!result.success || !result.document) {
    return {
      title: "Document Not Found - Clouds Docs",
    };
  }

  return {
    title: `${result.document.title} - Clouds Docs`,
    description: `Edit ${result.document.title} on Clouds Docs`,
  };
}

export default async function DocumentIdPage({ params }: DocumentIdPageProps) {
  const { documentId } = await params;

  if (!isValidObjectId(documentId)) {
    notFound();
  }

  const result = await getDocumentByIdAction(documentId);

  if (!result.success || !result.document) {
    notFound();
  }

  return <DocumentClient document={result.document} />;
}