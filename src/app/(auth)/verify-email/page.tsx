"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { OTPInput } from "@/components/auth/OTPInput";
import { AlertCircle, CheckCircle2 } from "lucide-react";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";

  // 6 separate digits for OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  
  // App UI states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  // Timer states
  const [resendTimer, setResendTimer] = useState(60);
  const [expiryTimer, setExpiryTimer] = useState(600); // 10 minutes in seconds

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect to register if no email is provided
  useEffect(() => {
    if (!email) {
      router.push("/register");
    }
  }, [email, router]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Expiry and resend countdown timers ticking
  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      setExpiryTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Keyboard navigation & numeric inputs control
  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Numeric characters only

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Keep last char
    setOtp(newOtp);

    // Auto advance focus
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Regression backspace to focus previous box
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Paste support of entire 6 digits
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  // Verify OTP submission
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");

    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    if (expiryTimer <= 0) {
      setError("Verification code has expired. Please click Resend OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: fullOtp }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to verify code");
      }

      // Show success message and redirect to login page
      setSuccess("Email verified successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 1500);

    } catch (err: unknown) {
      console.error("Verification error:", err);
      const msg = err instanceof Error ? err.message : "Invalid code. Please try again.";
      setError(msg);
      setLoading(false);
    }
  };

  // Resend OTP action
  const handleResend = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to resend code");
      }

      setSuccess("A new verification code has been sent!");
      setOtp(["", "", "", "", "", ""]);
      setResendTimer(60);
      setExpiryTimer(600); // Reset to 10 minutes
      
      // Focus first input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);

    } catch (err: unknown) {
      console.error("Resend error:", err);
      const msg = err instanceof Error ? err.message : "Error resending OTP.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <AuthHeader
        title="Verify Your Email"
        subtitle="We sent a 6-digit verification code to your email address."
        badgeText="Security Verification"
      />

      {/* Target Email Banner */}
      <div className="mb-6 p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/50 text-center">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">Code sent to: </span>
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 select-all break-all">
          {email}
        </span>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertCircle className="size-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* OTP Input Form Component */}
      <OTPInput
        otp={otp}
        inputRefs={inputRefs}
        loading={loading}
        resendTimer={resendTimer}
        expiryTimer={expiryTimer}
        onInputChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onVerify={handleVerify}
        onResend={handleResend}
      />
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="w-full max-w-md h-96 rounded-3xl bg-zinc-200/50 dark:bg-zinc-800/50 animate-pulse" />}>
        <VerifyEmailForm />
      </Suspense>
    </AuthLayout>
  );
}
