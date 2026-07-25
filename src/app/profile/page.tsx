"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeftIcon, CheckIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAvatarMenu } from "@/components/user-avatar-menu";
import { updateProfileAction } from "@/actions/auth-actions";
import { updateProfileSchema } from "@/lib/validations/auth";

export default function ProfilePage() {
  const { data: session, update } = useSession();

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setImage(session.user.image || "");
    }
  }, [session]);

  if (!session || !session.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFD]">
        <Loader2Icon className="size-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validation = updateProfileSchema.safeParse({ name, image });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setLoading(true);

    const res = await updateProfileAction({ name, image });
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Profile updated successfully!");
      await update({
        ...session,
        user: {
          ...session.user,
          name,
          image,
        },
      });
    }
  };

  const initials = name
    ? name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-[#FAFBFD] flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/documents" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeftIcon className="size-4 mr-2" />
              Back to Document
            </Link>
          </Button>
          <h1 className="text-lg font-semibold text-gray-900 border-l border-neutral-300 pl-4">
            Account Profile
          </h1>
        </div>
        <UserAvatarMenu />
      </header>

      {/* Main Form Container */}
      <div className="flex-1 max-w-2xl w-full mx-auto p-6">
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-x-6 mb-8 pb-6 border-b border-neutral-200">
            <Avatar className="size-20 border-2 border-blue-500 shadow-sm">
              <AvatarImage src={image || undefined} alt={name} />
              <AvatarFallback className="bg-blue-600 text-white text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{session.user.name}</h2>
              <p className="text-sm text-gray-500">{session.user.email}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                Authenticated User
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center">
              <CheckIcon className="size-4 mr-2" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="profile-name">
                Full Name
              </label>
              <Input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="profile-email">
                Email Address
              </label>
              <Input
                id="profile-email"
                type="email"
                value={session.user.email || ""}
                disabled
                className="bg-neutral-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email address cannot be changed.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="profile-image">
                Avatar Image URL
              </label>
              <Input
                id="profile-image"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">Enter a public image URL for your profile picture.</p>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-200">
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? (
                  <>
                    <Loader2Icon className="size-4 mr-2 animate-spin" />
                    Saving changes...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
