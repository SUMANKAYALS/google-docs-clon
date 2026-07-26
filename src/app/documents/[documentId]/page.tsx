import { notFound } from "next/navigation";
import { getDocumentByIdAction } from "@/actions/document-actions";
import { isValidObjectId } from "@/lib/db";
import { DocumentClient } from "./document-client";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ documentId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  const documentId = params.documentId;

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

export default async function DocumentIdPage(props: Props) {
  const params = await props.params;
  const documentId = params.documentId;

  if (!isValidObjectId(documentId)) {
    notFound();
  }

  const result = await getDocumentByIdAction(documentId);

  if (!result.success || !result.document) {
    notFound();
  }

  return <DocumentClient document={result.document} />;
}