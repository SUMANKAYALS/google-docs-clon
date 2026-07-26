"use client";

import React from "react";
import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { Cloud, FileText, Users, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans selection:bg-blue-500 selection:text-white transition-colors duration-300">
      
      {/* Dynamic Animated Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -50, 30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 size-[450px] rounded-full bg-blue-500/20 dark:bg-blue-600/15 blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -40, 30, 0],
            y: [0, 40, -40, 0],
            scale: [1, 0.9, 1.05, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 -right-32 size-[500px] rounded-full bg-purple-500/20 dark:bg-purple-600/15 blur-[140px]"
        />
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, 30, 20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 size-[350px] rounded-full bg-indigo-500/15 dark:bg-indigo-500/10 blur-[130px]"
        />
      </div>

      {/* Left Panel: Desktop Hero Product Showcase (Hidden on Mobile/Tablet) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative z-10 border-r border-zinc-200/60 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md">
        
        {/* Top Header Logo */}
        <div className="flex items-center gap-2.5">
          <div className="size-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1px] shadow-md shadow-blue-500/20 flex items-center justify-center">
            <div className="size-full rounded-[11px] bg-white dark:bg-zinc-950 flex items-center justify-center">
              <Cloud className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight">
            Clouds<span className="text-blue-600 dark:text-blue-400">Docs</span>
          </span>
        </div>

        {/* Hero Interactive Mockup Showcase */}
        <div className="my-auto max-w-lg space-y-8">
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80 shadow-sm">
              <Sparkles className="size-3.5 text-blue-500" />
              <span>Real-Time Collaboration Engine</span>
            </div>

            <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.15]">
              Document editing, <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                reimagined for teams.
              </span>
            </h2>

            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Experience ultra-fast, multiplayer document collaboration with AI assistance, live cursor presence, and enterprise security.
            </p>
          </div>

          {/* Interactive Hero Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xl p-6 backdrop-blur-xl space-y-4 overflow-hidden"
          >
            {/* Window Dots */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-rose-400" />
                <div className="size-2.5 rounded-full bg-amber-400" />
                <div className="size-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                <FileText className="size-3 text-blue-500" />
                <span>Q3 Product Strategy Proposal.docx</span>
              </div>
            </div>

            {/* Document Lines Simulation */}
            <div className="space-y-2.5 pt-1">
              <div className="h-4 w-3/4 bg-zinc-200/80 dark:bg-zinc-800/80 rounded-md animate-pulse" />
              <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-md" />
              <div className="h-3 w-5/6 bg-zinc-100 dark:bg-zinc-800/50 rounded-md" />
            </div>

            {/* Simulated Live Collaborator Cursors */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-xs font-semibold text-blue-600 dark:text-blue-400 shadow-sm">
                <Users className="size-3.5" />
                <span>3 collaborators active</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="size-3.5" />
                <span>Auto-saved to cloud</span>
              </div>
            </div>
          </motion.div>

          {/* Feature Bullets */}
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-blue-500" />
              <span>End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-indigo-500" />
              <span>AI Writing Assistant</span>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-xs text-zinc-400 dark:text-zinc-500">
          &copy; 2026 Clouds Docs Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Form Card Container */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 relative z-10 overflow-y-auto">
        
        {/* Top Right Controls */}
        <div className="flex items-center justify-end w-full max-w-md mx-auto mb-4">
          <ThemeToggle />
        </div>

        {/* Main Content Area */}
        <div className="my-auto flex items-center justify-center w-full">
          {children}
        </div>

        {/* Mobile Footer */}
        <div className="text-center text-xs text-zinc-400 dark:text-zinc-500 mt-6 lg:hidden">
          &copy; 2026 Clouds Docs Inc.
        </div>

      </div>

    </div>
  );
}
