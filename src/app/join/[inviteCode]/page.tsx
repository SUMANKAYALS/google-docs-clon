import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getInviteDetailsAction } from "@/actions/sharing-actions";
import { JoinClient } from "./join-client";

export const dynamic = "force-dynamic";

interface JoinPageProps {
  params: Promise<{
    inviteCode: string;
  }>;
}

export default async function JoinPage({ params }: JoinPageProps) {
  const session = await auth();
  const { inviteCode } = await params;

  if (!session || !session.user?.id) {
    redirect(`/login?callbackUrl=/join/${inviteCode}`);
  }

  const res = await getInviteDetailsAction(inviteCode);

  if (!res.success || !res.document) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--editor-workspace)] px-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="size-12 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <span className="font-bold text-lg">!</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Invalid Invite Link</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {res.error || "This document invite link is invalid or has expired."}
          </p>
          <Link
            href="/documents"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Back to Documents
          </Link>
        </div>
      </div>
    );
  }

  return <JoinClient inviteCode={inviteCode} document={res.document} />;
}
