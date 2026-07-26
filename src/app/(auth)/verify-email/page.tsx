"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Loader2, Check, AlertCircle, ArrowLeft, RefreshCw, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  // Format seconds to MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

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
      setSuccess("Email verified successfully! Please log in.");
      // Short delay to let user see the message before redirecting
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
    <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl shadow-md p-8 md:p-10 transition-all duration-300">
      
      {/* Verify Email Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="size-14 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-inner">
          <Mail className="size-7" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Verify your Email</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 max-w-[280px]">
          We sent a 6-digit verification code to
        </p>
        <span className="text-sm font-semibold text-neutral-800 dark:text-zinc-350 mt-1 select-all break-all">
          {email}
        </span>
      </div>

      {/* Dynamic Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-300 text-xs font-semibold rounded-xl flex items-start gap-x-2">
          <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-x-2 animate-in fade-in zoom-in-95">
          <Check className="size-4 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Code Input Form */}
      <form onSubmit={handleVerify} className="space-y-6">
        
        {/* Verification Inputs Grid */}
        <div className="flex justify-between gap-x-2 select-none" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              disabled={loading || expiryTimer <= 0}
              className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-neutral-300 dark:border-zinc-700 bg-neutral-50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all disabled:opacity-50"
              aria-label={`OTP Code digit ${idx + 1}`}
            />
          ))}
        </div>

        {/* Expiry Expiration Timer */}
        {expiryTimer > 0 ? (
          <div className="text-center text-xs font-medium text-neutral-400 dark:text-zinc-500">
            Code expires in: <span className="font-bold text-neutral-600 dark:text-zinc-350">{formatTime(expiryTimer)}</span>
          </div>
        ) : (
          <div className="text-center text-xs font-bold text-rose-500">
            Verification code has expired.
          </div>
        )}

        {/* Submit Verify Button */}
        <Button
          type="submit"
          disabled={loading || otp.join("").length !== 6 || expiryTimer <= 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 h-11 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.99] disabled:opacity-50 disabled:scale-100"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </Button>
      </form>

      {/* Extra Action Buttons */}
      <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-zinc-800 flex items-center justify-between text-xs select-none">
        
        {/* Resend OTP */}
        {resendTimer > 0 ? (
          <span className="text-neutral-400 dark:text-zinc-500 font-medium">
            Resend in {resendTimer}s
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold hover:underline flex items-center gap-x-1"
          >
            <RefreshCw className="size-3.5" />
            Resend OTP
          </button>
        )}

        {/* Change Email */}
        <Link
          href="/register"
          className="text-neutral-500 hover:text-neutral-700 dark:text-zinc-400 dark:hover:text-zinc-300 font-bold hover:underline flex items-center gap-x-1"
        >
          <Edit2 className="size-3.5" />
          Change Email
        </Link>
      </div>

    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#f8f9fa] dark:bg-[#0c0a09] px-4 transition-colors duration-300">
      <Suspense fallback={<Loader2 className="size-8 text-blue-600 animate-spin" />}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
