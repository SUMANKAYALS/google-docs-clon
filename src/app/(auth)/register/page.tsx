"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthInput } from "@/components/auth/AuthInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { SocialLoginButton } from "@/components/auth/SocialLoginButton";
import { Divider } from "@/components/auth/Divider";
import { registerSchema } from "@/lib/validations/auth";
import { registerUserAction } from "@/actions/auth-actions";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validation = registerSchema.safeParse({ name, email, password });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setLoading(true);

    try {
      const res = await registerUserAction({ name, email, password });
      setLoading(false);

      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess("Account created successfully! Redirecting to verification...");
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        }, 1500);
      }
    } catch (err) {
      console.error("[Register Error]", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    signIn("google", { callbackUrl: "/documents" });
  };

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Create Your Account"
          subtitle="Start collaborating in real-time with your team on Clouds Docs."
          badgeText="Free Tier Included"
        />

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle className="size-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}

        {/* Google Signup Button */}
        <SocialLoginButton onClick={handleGoogleSignUp} label="Sign up with Google" />

        <Divider />

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <AuthInput
            id="name"
            label="Full Name"
            type="text"
            placeholder="John Doe"
            icon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* Email Address */}
          <AuthInput
            id="email"
            label="Work Email"
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
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Password Strength Meter */}
          <PasswordStrength password={password} />

          {/* Submit CTA Button */}
          <div className="pt-2">
            <SubmitButton loading={loading} loadingText="Creating account...">
              Create Account
            </SubmitButton>
          </div>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:underline"
          >
            Sign in
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
