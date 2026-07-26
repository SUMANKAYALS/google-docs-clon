"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileTextIcon, Loader2Icon, LockIcon, MailIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema } from "@/lib/validations/auth";
import { registerUserAction } from "@/actions/auth-actions";

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

    const res = await registerUserAction({ name, email, password });
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Account created successfully! Redirecting to sign in...");
      setTimeout(() => {
        router.push(`/verify-email?email=${email}`);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#FAFBFD] px-4">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-xl shadow-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="size-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
            <FileTextIcon className="size-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your Account</h1>
          <p className="text-sm text-gray-500 mt-1">Start collaborating with Clouds Docs</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 size-4 text-gray-400" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <MailIcon className="absolute left-3 top-2.5 size-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <LockIcon className="absolute left-3 top-2.5 size-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 font-medium h-10"
          >
            {loading ? (
              <>
                <Loader2Icon className="size-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
