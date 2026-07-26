"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldAlert, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { OTPInput } from "@/components/auth/OTPInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { SubmitButton } from "@/components/auth/SubmitButton";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit verification code sent to your email.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify your entries.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      // First verify the code
      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Invalid verification code.");
      }

      setSuccess("Verification successful! Redirecting to sign in...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to reset password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      {/* Icon Badge */}
      <div className="flex justify-center mb-4">
        <div className="size-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/80 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-md shadow-purple-500/10">
          <ShieldAlert className="size-7" />
        </div>
      </div>

      <AuthHeader
        title="Reset Password"
        subtitle="Enter the 6-digit verification code sent to your email and select your new password."
      />

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertCircle className="size-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-200">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* OTP Code Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
            6-Digit Verification Code
          </label>
          <OTPInput otp={otp} setOtp={setOtp} disabled={loading} hasError={!!error} />
        </div>

        {/* New Password */}
        <div>
          <PasswordInput
            id="newPassword"
            label="New Password"
            placeholder="Create strong new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <PasswordStrength password={newPassword} />
        </div>

        {/* Confirm New Password */}
        <PasswordInput
          id="confirmPassword"
          label="Confirm New Password"
          placeholder="Repeat new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {/* Submit Button */}
        <div className="pt-2">
          <SubmitButton loading={loading} loadingText="Resetting password...">
            Reset Password
          </SubmitButton>
        </div>
      </form>

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
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="w-full max-w-md h-96 rounded-3xl bg-zinc-200/50 dark:bg-zinc-800/50 animate-pulse" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
