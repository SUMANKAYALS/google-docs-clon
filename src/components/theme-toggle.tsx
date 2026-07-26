"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop, FileText, Check } from "lucide-react";
import { useEditorStore } from "@/store/use-editor-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { pageTheme, setPageTheme } = useEditorStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Hydrate pageTheme client side from localStorage
    const saved = localStorage.getItem("clouds-docs-page-theme");
    if (saved === "light" || saved === "dark") {
      setPageTheme(saved);
    }
  }, [setPageTheme]);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-9 rounded-full opacity-0" disabled>
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-full text-neutral-600 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {theme === "light" && <Sun className="size-4 text-amber-500" />}
          {theme === "dark" && <Moon className="size-4 text-indigo-400" />}
          {theme === "system" && <Laptop className="size-4 text-emerald-500" />}
          {theme !== "light" && theme !== "dark" && theme !== "system" && (
            <Laptop className="size-4 text-neutral-500 dark:text-zinc-400" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 z-50 rounded-xl shadow-xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800">
        <div className="px-2.5 py-1.5 text-[10px] font-bold text-gray-500 dark:text-zinc-400 select-none uppercase tracking-wider">
          App Theme
        </div>
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center justify-between cursor-pointer text-xs"
        >
          <div className="flex items-center gap-x-2">
            <Sun className="size-4 text-amber-500" />
            <span>Light</span>
          </div>
          {theme === "light" && <Check className="size-3.5 text-blue-600 dark:text-blue-400" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center justify-between cursor-pointer text-xs"
        >
          <div className="flex items-center gap-x-2">
            <Moon className="size-4 text-indigo-400" />
            <span>Dark</span>
          </div>
          {theme === "dark" && <Check className="size-3.5 text-blue-600 dark:text-blue-400" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center justify-between cursor-pointer text-xs"
        >
          <div className="flex items-center gap-x-2">
            <Laptop className="size-4 text-emerald-500" />
            <span>System</span>
          </div>
          {theme === "system" && <Check className="size-3.5 text-blue-600 dark:text-blue-400" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-neutral-100 dark:bg-zinc-800" />

        <div className="px-2.5 py-1.5 text-[10px] font-bold text-gray-500 dark:text-zinc-400 select-none uppercase tracking-wider">
          Page Contrast
        </div>
        <DropdownMenuItem
          onClick={() => setPageTheme("light")}
          className="flex items-center justify-between cursor-pointer text-xs"
        >
          <div className="flex items-center gap-x-2">
            <FileText className="size-4 text-blue-600 dark:text-blue-450" />
            <span>Light Page</span>
          </div>
          {pageTheme === "light" && <Check className="size-3.5 text-blue-600 dark:text-blue-400" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setPageTheme("dark")}
          className="flex items-center justify-between cursor-pointer text-xs"
        >
          <div className="flex items-center gap-x-2">
            <FileText className="size-4 text-gray-400 dark:text-zinc-500" />
            <span>Dark Page</span>
          </div>
          {pageTheme === "dark" && <Check className="size-3.5 text-blue-600 dark:text-blue-400" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
