import { getUserDocumentsAction } from "@/actions/document-actions";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Documents - Clouds Docs Workspace",
  description: "Manage your documents, starred items, and collaborative workspace",
};

export default async function DocumentsPage() {
  const result = await getUserDocumentsAction();
  const documents = result.documents || [];

  return <DashboardClient initialDocuments={documents} />;
}