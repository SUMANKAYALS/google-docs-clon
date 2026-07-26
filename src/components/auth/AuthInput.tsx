"use client";

import React, { useState } from "react";
import { LucideIcon } from "lucide-react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon?: LucideIcon;
  error?: string;
  hint?: string;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ id, label, icon: Icon, error, hint, className = "", value, onChange, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== undefined && value !== null && String(value).length > 0;

    return (
      <div className="w-full space-y-1.5">
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 select-none"
        >
          {label}
        </label>
        
        <div className="relative flex items-center">
          {Icon && (
            <Icon
              className={`absolute left-3.5 size-4 transition-colors duration-200 pointer-events-none ${
                error
                  ? "text-rose-500"
                  : isFocused
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-zinc-400 dark:text-zinc-500"
              }`}
            />
          )}

          <input
            id={id}
            ref={ref}
            value={value}
            onChange={onChange}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            className={`w-full h-11 text-sm font-medium rounded-xl bg-zinc-50/70 dark:bg-zinc-950/70 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 border transition-all duration-200 focus:outline-none ${
              Icon ? "pl-10" : "pl-3.5"
            } pr-3.5 ${
              error
                ? "border-rose-400 dark:border-rose-800 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                : "border-zinc-200 dark:border-zinc-800 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20"
            } ${className}`}
            {...props}
          />
        </div>

        {error ? (
          <p className="text-xs font-medium text-rose-500 dark:text-rose-400 animate-in fade-in slide-in-from-top-1 duration-150">
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
