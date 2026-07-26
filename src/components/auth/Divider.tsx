"use client";

import React from "react";

interface DividerProps {
  label?: string;
}

export function Divider({ label = "Or continue with" }: DividerProps) {
  return (
    <div className="relative flex items-center justify-center my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-zinc-200/80 dark:border-zinc-800/80" />
      </div>
      <div className="relative px-3 bg-white dark:bg-zinc-900 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 rounded-full">
        {label}
      </div>
    </div>
  );
}
