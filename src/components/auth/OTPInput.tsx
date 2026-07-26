"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Edit2 } from "lucide-react";
import Link from "next/link";
import { SubmitButton } from "./SubmitButton";

export interface OTPInputProps {
  otp: string[];
  inputRefs?: React.MutableRefObject<(HTMLInputElement | null)[]>;
  loading?: boolean;
  disabled?: boolean;
  hasError?: boolean;
  resendTimer?: number;
  expiryTimer?: number;
  onInputChange?: (index: number, value: string) => void;
  onKeyDown?: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onVerify?: (e?: React.FormEvent) => void;
  onResend?: () => void;
  setOtp?: React.Dispatch<React.SetStateAction<string[]>>;
  onComplete?: (code: string) => void;
}

export function OTPInput({
  otp,
  inputRefs: externalInputRefs,
  loading = false,
  disabled = false,
  hasError = false,
  resendTimer = 0,
  expiryTimer = 600,
  onInputChange,
  onKeyDown,
  onPaste,
  onVerify,
  onResend,
  setOtp,
  onComplete,
}: OTPInputProps) {
  const internalInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const refs = externalInputRefs || internalInputRefs;

  useEffect(() => {
    if (refs.current[0]) {
      refs.current[0].focus();
    }
  }, [refs]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChange = (index: number, value: string) => {
    if (onInputChange) {
      onInputChange(index, value);
    } else if (setOtp) {
      if (!/^\d*$/.test(value)) return;
      const newOtp = [...otp];
      newOtp[index] = value.substring(value.length - 1);
      setOtp(newOtp);
      if (value && index < 5) {
        refs.current[index + 1]?.focus();
      }
      const fullCode = newOtp.join("");
      if (fullCode.length === 6 && onComplete) {
        onComplete(fullCode);
      }
    }
  };

  const handleKeyDownInternal = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) {
      onKeyDown(index, e);
    } else {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        refs.current[index - 1]?.focus();
      }
    }
  };

  const handlePasteInternal = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (onPaste) {
      onPaste(e);
    } else if (setOtp) {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text").trim();
      if (/^\d{6}$/.test(pastedData)) {
        const newOtp = pastedData.split("");
        setOtp(newOtp);
        refs.current[5]?.focus();
        if (onComplete) {
          onComplete(pastedData);
        }
      }
    }
  };

  const isComplete = otp.join("").length === 6;

  return (
    <form onSubmit={onVerify} className="space-y-6">
      {/* 6 Digit Input Grid */}
      <motion.div
        animate={hasError ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex justify-between gap-2 sm:gap-3 select-none"
        onPaste={handlePasteInternal}
      >
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              refs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            disabled={disabled || loading || expiryTimer <= 0}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDownInternal(idx, e)}
            className={`size-12 sm:size-14 text-center text-xl font-bold rounded-2xl border transition-all duration-200 focus:outline-none ${
              hasError
                ? "border-rose-400 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 focus:ring-4 focus:ring-rose-500/20"
                : digit
                ? "border-blue-500/80 dark:border-blue-500/80 bg-blue-50/40 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 focus:ring-4 focus:ring-blue-500/20"
                : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
            } disabled:opacity-50`}
            aria-label={`OTP Code digit ${idx + 1}`}
          />
        ))}
      </motion.div>

      {/* Countdown Timer */}
      {expiryTimer > 0 ? (
        <div className="text-center text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Code expires in:{" "}
          <span className="font-bold text-zinc-800 dark:text-zinc-200">
            {formatTime(expiryTimer)}
          </span>
        </div>
      ) : (
        <div className="text-center text-xs font-bold text-rose-500">
          Verification code has expired.
        </div>
      )}

      {/* Submit Button */}
      {onVerify && (
        <SubmitButton
          loading={loading}
          loadingText="Verifying email..."
          disabled={loading || !isComplete || expiryTimer <= 0}
        >
          Verify Email
        </SubmitButton>
      )}

      {/* Action Footer Links */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs select-none">
        {resendTimer > 0 ? (
          <span className="text-zinc-400 dark:text-zinc-500 font-medium">
            Resend in {resendTimer}s
          </span>
        ) : (
          <button
            type="button"
            onClick={onResend}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold hover:underline flex items-center gap-1.5"
          >
            <RefreshCw className="size-3.5" />
            <span>Resend OTP</span>
          </button>
        )}

        <Link
          href="/register"
          className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 font-bold hover:underline flex items-center gap-1.5"
        >
          <Edit2 className="size-3.5" />
          <span>Change Email</span>
        </Link>
      </div>
    </form>
  );
}
