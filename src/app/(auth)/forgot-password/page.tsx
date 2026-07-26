"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthInput } from "@/components/auth/AuthInput";
import { SubmitButton } from "@/components/auth/SubmitButton";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      setSuccess("A password reset code has been sent to your email.");
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        {/* Top Key Icon */}
        <div className="flex justify-center mb-4">
          <div className="size-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-md shadow-indigo-500/10">
            <KeyRound className="size-7" />
          </div>
        </div>

        <AuthHeader
          title="Forgot Password?"
          subtitle="No worries, enter your account email and we'll dispatch a recovery verification code."
        />

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle className="size-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-start gap-3 animate-in fade-in zoom-in-95 duration-200">
              <CheckCircle2 className="size-5 shrink-0 text-emerald-500 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">{success}</p>
                <p className="text-zinc-600 dark:text-zinc-400 font-normal">
                  Please check your inbox (and spam folder) for instructions.
                </p>
              </div>
            </div>

            <Link
              href={`/reset-password?email=${encodeURIComponent(email)}`}
              className="w-full h-11 px-4 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 transition-all duration-200 shadow-md"
            >
              Continue to Enter Code
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              id="email"
              label="Account Email"
              type="email"
              placeholder="name@company.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="pt-2">
              <SubmitButton loading={loading} loadingText="Sending code...">
                Send Recovery Code
              </SubmitButton>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
