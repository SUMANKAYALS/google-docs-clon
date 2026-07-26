"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, AlertCircle } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthInput } from "@/components/auth/AuthInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { SocialLoginButton } from "@/components/auth/SocialLoginButton";
import { Divider } from "@/components/auth/Divider";
import { loginSchema } from "@/lib/validations/auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/documents";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setLoading(true);

    try {
      console.log("[Client Login] Initiating signIn credentials request...");
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("[Client Login Response]", res);

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else if (res?.ok) {
        console.log("[Client Login Success] Redirecting to:", callbackUrl);
        // Hard window navigation ensures Next.js App Router cache is purged and cookies are synced
        window.location.href = callbackUrl;
      } else {
        setError("Sign in failed. Please check your credentials.");
        setLoading(false);
      }
    } catch (err) {
      console.error("[Client Login Error]", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <AuthCard>
      <AuthHeader
        title="Welcome Back"
        subtitle="Sign in to your account to access your workspace and collaborative documents."
        badgeText="Next.js 15 Fast Auth"
      />

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertCircle className="size-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Social Google Login */}
      <SocialLoginButton onClick={handleGoogleSignIn} label="Sign in with Google" />

      <Divider />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address */}
        <AuthInput
          id="email"
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password Input */}
        <PasswordInput
          id="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Options Row: Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <label className="flex items-center gap-2 font-medium text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-4 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500/20 bg-zinc-50 dark:bg-zinc-950 transition-colors"
            />
            <span>Remember me</span>
          </label>

          <Link
            href="/forgot-password"
            className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <SubmitButton loading={loading} loadingText="Signing in...">
            Sign In to Account
          </SubmitButton>
        </div>
      </form>

      {/* Footer Switcher Link */}
      <div className="mt-8 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:underline"
        >
          Create account
        </Link>
      </div>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="w-full max-w-md h-96 rounded-3xl bg-zinc-200/50 dark:bg-zinc-800/50 animate-pulse" />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
