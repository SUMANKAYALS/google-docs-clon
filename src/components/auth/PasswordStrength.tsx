"use client";

import React from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const requirements = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "Contains uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", pass: /[a-z]/.test(password) },
    { label: "Contains number or symbol", pass: /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];

  const passedCount = requirements.filter((r) => r.pass).length;

  const getStrengthLabel = () => {
    if (password.length === 0) return { label: "", color: "bg-zinc-200 dark:bg-zinc-800" };
    if (passedCount <= 1) return { label: "Weak", color: "bg-rose-500" };
    if (passedCount === 2) return { label: "Fair", color: "bg-amber-500" };
    if (passedCount === 3) return { label: "Good", color: "bg-blue-500" };
    return { label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getStrengthLabel();

  if (!password) return null;

  return (
    <div className="space-y-2.5 mt-2 p-3.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 transition-all duration-300">
      {/* Visual meter bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 flex gap-1.5 h-1.5">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`flex-1 rounded-full h-full transition-all duration-300 ${
                passedCount >= level ? strength.color : "bg-zinc-200 dark:bg-zinc-800"
              }`}
            />
          ))}
        </div>
        {strength.label && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            {strength.label}
          </span>
        )}
      </div>

      {/* Requirement Checklist */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {requirements.map((req, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
            {req.pass ? (
              <Check className="size-3 text-emerald-500 shrink-0" />
            ) : (
              <X className="size-3 text-zinc-300 dark:text-zinc-700 shrink-0" />
            )}
            <span className={req.pass ? "text-zinc-900 dark:text-zinc-200" : ""}>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
