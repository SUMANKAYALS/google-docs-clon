"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

export interface SubmitButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function SubmitButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className = "",
  type = "submit",
  ...props
}: SubmitButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      disabled={disabled || loading}
      type={type}
      className={`relative w-full h-11 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 active:from-blue-700 active:to-purple-700 shadow-lg shadow-blue-500/25 dark:shadow-blue-600/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none focus:ring-4 focus:ring-blue-500/30 ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin text-white" />
          <span>{loadingText || "Processing..."}</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
