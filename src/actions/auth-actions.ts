"use client";

// Client wrapper calling API routes for authentication operations to avoid server action bundle issues in client forms.

import { type RegisterInput, type UpdateProfileInput } from "@/lib/validations/auth";

export async function registerUserAction(data: RegisterInput) {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to register account" };
    }

    return { success: true, message: result.message };
  } catch (error) {
    console.error("Register Action Error:", error);
    return { error: "An unexpected network error occurred" };
  }
}

export async function updateProfileAction(data: UpdateProfileInput) {
  try {
    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      return { error: result.error || "Failed to update profile" };
    }

    return { success: true, user: result.user };
  } catch (error) {
    console.error("Update Profile Error:", error);
    return { error: "An unexpected network error occurred" };
  }
}
