"use client";

import React from "react";
import Link from "next/link";
import { Cloud, Sparkles } from "lucide-react";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  badgeText?: string;
}

export function AuthHeader({ title, subtitle, badgeText }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center mb-8">
      {/* Brand Logo Container */}
      <Link
        href="/"
        className="group relative flex items-center gap-2 mb-6 focus:outline-none"
      >
        <div className="relative flex items-center justify-center size-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-blue-500/20 transition-transform duration-300 group-hover:scale-105">
          <div className="flex items-center justify-center size-full rounded-[15px] bg-white dark:bg-zinc-950 transition-colors duration-300">
            <Cloud className="size-6 text-blue-600 dark:text-blue-400 group-hover:animate-pulse" />
          </div>
        </div>
        <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white font-sans">
          Clouds<span className="text-blue-600 dark:text-blue-400">Docs</span>
        </span>
      </Link>

      {/* Optional Badge */}
      {badgeText && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 shadow-sm">
          <Sparkles className="size-3 text-blue-500 animate-spin-slow" />
          <span>{badgeText}</span>
        </div>
      )}

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
        {title}
      </h1>

      {/* Subtitle */}
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
}
