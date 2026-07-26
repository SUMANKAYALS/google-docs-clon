"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface OTPInputProps {
  otp: string[];
  setOtp: React.Dispatch<React.SetStateAction<string[]>>;
  disabled?: boolean;
  hasError?: boolean;
  onComplete?: (code: string) => void;
}

export function OTPInput({ otp, setOtp, disabled = false, hasError = false, onComplete }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto advance focus
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit trigger if all 6 filled
    const fullCode = newOtp.join("");
    if (fullCode.length === 6 && onComplete) {
      onComplete(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      if (onComplete) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <motion.div
      animate={hasError ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="flex justify-between gap-2 sm:gap-3 select-none"
      onPaste={handlePaste}
    >
      {otp.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          className={`size-12 sm:size-14 text-center text-xl font-bold rounded-2xl border transition-all duration-200 focus:outline-none ${
            hasError
              ? "border-rose-400 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 focus:ring-4 focus:ring-rose-500/20"
              : digit
              ? "border-blue-500/80 dark:border-blue-500/80 bg-blue-50/40 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 focus:ring-4 focus:ring-blue-500/20"
              : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
          } disabled:opacity-50`}
          aria-label={`Digit ${idx + 1}`}
        />
      ))}
    </motion.div>
  );
}
