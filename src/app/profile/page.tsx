"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Loader2, ArrowLeft, Camera, Check, AlertCircle, Sparkles, CheckCircle2, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserAvatarMenu } from "@/components/user-avatar-menu";
import { getUserProfileAction, updateProfileAction } from "@/actions/auth-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  jobTitle: string;
  company: string;
  phoneNumber: string;
  timezone: string;
  language: string;
  defaultFont: string;
  defaultFontSize: string;
  pageSize: string;
  autoSaveEnabled: boolean;
  aiEnabled: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
}

const DICEBEAR_STYLES = [
  "initials",
  "adventurer",
  "avataaars",
  "bottts",
  "fun-emoji",
  "lorelei",
  "thumbs",
  "shapes"
];

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile data state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);
  const [isCustomAvatar, setIsCustomAvatar] = useState(false);

  // App UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal and picker states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState("");

  // Custom image cropper states
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropDimensions, setCropDimensions] = useState({ width: 0, height: 0, left: 0, top: 0 });

  // Load profile data on mount
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const res = await getUserProfileAction();
      if (res.success && res.user) {
        setProfile(res.user);
        setOriginalProfile(res.user);

        // Detect if user has a custom avatar (i.e. not empty and not a DiceBear URL)
        const hasCustom = !!res.user.image && !res.user.image.startsWith("https://api.dicebear.com");
        setIsCustomAvatar(hasCustom);
      } else {
        setError(res.error || "Failed to load profile");
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  // Generate 24 DiceBear avatars based on style and name seeds (8 styles x 3 variations)
  const dicebearAvatars = useMemo(() => {
    if (!profile) return [];
    const nameSeed = profile.name.trim() || "User";
    const seeds = [nameSeed, `${nameSeed}-1`, `${nameSeed}-2`].map(s => encodeURIComponent(s));

    const list: string[] = [];
    DICEBEAR_STYLES.forEach((style) => {
      seeds.forEach((seed) => {
        list.push(`https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`);
      });
    });
    return list;
  }, [profile]);

  if (!session || !session.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-[#0c0a09]">
        <Loader2 className="size-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0c0a09] flex flex-col justify-center items-center">
        <div className="flex flex-col items-center gap-y-4">
          <Loader2 className="size-8 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-neutral-500 dark:text-zinc-400">Loading account data...</span>
        </div>
      </div>
    );
  }

  // Get active avatar URL representation
  const displayAvatarUrl = isCustomAvatar && profile.image
    ? profile.image
    : profile.image || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(profile.name.trim() || "User")}`;

  // Check if there are unsaved changes
  const hasChanges = profile.name !== originalProfile?.name || profile.image !== originalProfile?.image;

  // Name change handler
  const handleNameChange = (newName: string) => {
    setProfile(prev => {
      if (!prev) return null;
      const updated = { ...prev, name: newName };
      // If not custom, image updates dynamically to match the name seed
      if (!isCustomAvatar) {
        updated.image = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(newName.trim() || "User")}`;
      }
      return updated;
    });
  };

  // Custom Cropper Touch / Mouse Interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (uploading) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || uploading) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (uploading) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || uploading) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Custom File Selection (PNG, JPG, WEBP)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
        setError("Please select PNG, JPG, or WEBP images only.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size cannot exceed 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // HTML5 Canvas crop and upload base64 to Cloudinary
  const handleSaveCrop = () => {
    if (!imageSrc) return;
    setUploading(true);

    const img = new Image();
    img.src = imageSrc;
    img.onload = async () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 280;
        canvas.height = 280;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not construct 2D context");

        // Canvas background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 280, 280);

        // Fit image
        const scale = Math.max(280 / img.naturalWidth, 280 / img.naturalHeight);
        const renderWidth = img.naturalWidth * scale;
        const renderHeight = img.naturalHeight * scale;

        // Viewport is centered 140px inside 280px crop area (70px boundary)
        // Canvas output scale is 2x
        const drawX = (70 + offset.x - (renderWidth * zoom) / 2) * 2;
        const drawY = (70 + offset.y - (renderHeight * zoom) / 2) * 2;
        const drawWidth = renderWidth * zoom * 2;
        const drawHeight = renderHeight * zoom * 2;

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        const croppedBase64 = canvas.toDataURL("image/webp", 0.9);
        await uploadToCloudinary(croppedBase64);
      } catch (err: unknown) {
        console.error("Canvas crop error:", err);
        const msg = err instanceof Error ? err.message : "Error generating cropped avatar.";
        setError(msg);
        setUploading(false);
      }
    };
  };

  // Upload crop to Cloudinary
  const uploadToCloudinary = async (base64Image: string) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset || cloudName === "your_cloud_name_here" || uploadPreset === "your_unsigned_preset_here") {
      setError("Cloudinary is not configured. Please add cloud keys to your .env.local file.");
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", base64Image);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image. Verify your upload preset is configured as unsigned.");
      }

      const data = await response.json();
      if (data.secure_url) {
        setProfile(prev => prev ? { ...prev, image: data.secure_url } : null);
        setIsCustomAvatar(true);
        // Reset crop/picker modal
        setIsModalOpen(false);
        setIsCropping(false);
        setImageSrc(null);
      } else {
        throw new Error("Cloudinary did not return a secure URL.");
      }
    } catch (err: unknown) {
      console.error("Cloudinary upload error:", err);
      const msg = err instanceof Error ? err.message : "An error occurred during Cloudinary upload.";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  // Save selected DiceBear avatar in picker
  const handleSaveDiceBearAvatar = () => {
    if (selectedAvatarUrl) {
      setProfile(prev => prev ? { ...prev, image: selectedAvatarUrl } : null);
      setIsCustomAvatar(false);
      setIsModalOpen(false);
    }
  };

  // Save changes (Name & AvatarUrl) to MongoDB
  const handleSaveChanges = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    const res = await updateProfileAction(profile);
    setSaving(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Account information updated successfully!");
      setOriginalProfile(profile);

      // Update NextAuth session
      await update({
        ...session,
        user: {
          ...session.user,
          name: profile.name,
          image: profile.image,
        },
      });

      setTimeout(() => setSuccess(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0c0a09] flex flex-col text-neutral-900 dark:text-zinc-100 transition-colors duration-300">

      {/* Navigation Header */}
      <header className="h-16 bg-white dark:bg-[#18181b] border-b border-[#e0e0e0] dark:border-zinc-800 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/documents" className="flex items-center text-neutral-600 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-100 transition-colors">
              <ArrowLeft className="size-4 mr-2" />
              Back to Docs
            </Link>
          </Button>
          <span className="h-4 w-px bg-neutral-200 dark:bg-zinc-800" />
          <h1 className="text-sm font-semibold text-neutral-500 dark:text-zinc-400 flex items-center gap-x-2">
            <Sparkles className="size-4 text-blue-600 dark:text-blue-400" />
            Docs Account
          </h1>
        </div>
        <div className="flex items-center gap-x-3">
          <ThemeToggle />
          <UserAvatarMenu />
        </div>
      </header>

      {/* Main Google Docs Styled Centered Layout */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[550px] transition-all duration-300">

          {/* Settings Profile Card */}
          <div className="bg-white dark:bg-[#18181b] rounded-[20px] border border-[#e0e0e0] dark:border-zinc-800/80 shadow-[0_1px_3px_0_rgba(60,64,67,0.3),_0_4px_8px_3px_rgba(60,64,67,0.15)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] p-8 md:p-12 transition-all duration-300">

            {/* Header section with Large Avatar (140px) */}
            <div className="flex flex-col items-center text-center pb-8 border-b border-[#f1f3f4] dark:border-zinc-800">

              {/* Circular Avatar Display */}
              <div className="relative w-[140px] h-[140px] rounded-full border border-[#e0e0e0] dark:border-zinc-800 shadow-sm bg-[#f8f9fa] dark:bg-zinc-900 flex items-center justify-center overflow-hidden transition-all duration-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayAvatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Verified Badge and context details */}
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-zinc-100 mt-4 leading-tight tracking-tight">
                {profile.name || "Unnamed User"}
              </h2>

              <div className="flex items-center justify-center flex-wrap gap-2 mt-2">
                <span className="text-sm font-medium text-neutral-500 dark:text-zinc-400">
                  {profile.email}
                </span>

                {/* Elegant Verified badge */}
                <span className="flex items-center gap-x-1 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[11px] font-semibold rounded-full select-none border border-blue-200/50 dark:border-blue-800/30">
                  <CheckCircle2 className="size-3.5 fill-blue-600 dark:fill-blue-400 text-white dark:text-zinc-950" />
                  Verified
                </span>
              </div>

              {/* Change Avatar trigger button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedAvatarUrl(profile.image || "");
                  setIsModalOpen(true);
                }}
                className="mt-5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-950/20 px-5 py-2.5 rounded-full transition-all duration-200 border border-[#dadce0] dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 flex items-center gap-x-1.5 shadow-sm active:scale-[0.98]"
              >
                <Camera className="size-4" />
                Change Avatar
              </button>
            </div>

            {/* Profile Input fields */}
            <div className="space-y-6 pt-8">

              {/* Notification Alerts */}
              {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-2xl text-xs font-medium text-rose-800 dark:text-rose-300 flex items-start gap-x-2.5">
                  <AlertCircle className="size-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/30 rounded-2xl text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-x-2.5 animate-in fade-in zoom-in-95">
                  <Check className="size-4 text-emerald-500 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Full Name field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider pl-1" htmlFor="full-name">
                  Full Name
                </label>
                <Input
                  id="full-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={profile.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="bg-[#f8f9fa] dark:bg-zinc-900 border-[#dadce0] dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 h-12 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-4"
                  aria-label="Full Name Input"
                />
              </div>

              {/* Email Address Read Only field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 dark:text-zinc-500 uppercase tracking-wider pl-1" htmlFor="email-address">
                  Email Address
                </label>
                <Input
                  id="email-address"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-neutral-100 dark:bg-zinc-800/40 border-[#dadce0] dark:border-zinc-700/80 cursor-not-allowed h-12 text-sm rounded-xl text-neutral-400 dark:text-zinc-500 pl-4"
                  aria-label="Email address read-only"
                />
                <span className="text-[10px] text-neutral-400 dark:text-zinc-500 pl-2 block">
                  Email address is linked to authentication credentials and remains read-only.
                </span>
              </div>

              {/* Save Button action */}
              <div className="pt-4">
                <Button
                  type="button"
                  onClick={handleSaveChanges}
                  disabled={saving || !hasChanges}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 h-12 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.99] disabled:opacity-50 disabled:scale-100"
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Interactive Avatar Picker & Cropper Dialog */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) {
          setIsCropping(false);
          setImageSrc(null);
        }
      }}>
        <DialogContent className="max-w-[480px] w-full bg-white dark:bg-[#18181b] border border-[#e0e0e0] dark:border-zinc-800 rounded-[20px] p-6 shadow-2xl transition-all duration-300">

          <DialogHeader className="pb-4 border-b border-neutral-100 dark:border-zinc-800">
            <DialogTitle className="text-lg font-bold text-neutral-900 dark:text-zinc-100 flex items-center gap-x-2">
              <Sparkles className="size-5 text-blue-600 dark:text-blue-400" />
              {isCropping ? "Crop Custom Photo" : "Choose an Avatar"}
            </DialogTitle>
          </DialogHeader>

          {/* Avatar selection workflow */}
          {!isCropping ? (
            <div className="space-y-5 pt-4">

              {/* Grid of 24 generated DiceBear avatars */}
              <div className="h-[280px] overflow-y-auto pr-1 select-none">
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pb-2">
                  {dicebearAvatars.map((url, idx) => {
                    const isSelected = selectedAvatarUrl === url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatarUrl(url)}
                        className={`aspect-square w-full rounded-xl overflow-hidden bg-neutral-50 dark:bg-zinc-900 flex items-center justify-center p-1.5 transition-all duration-200 hover:scale-105 active:scale-95 border-2 ${isSelected
                            ? "border-blue-600 dark:border-blue-500 ring-2 ring-blue-600/30 shadow-md scale-[1.03]"
                            : "border-transparent hover:border-neutral-200 dark:hover:border-zinc-700"
                          }`}
                        title={`DiceBear Option ${idx + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Avatar Option ${idx}`}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload image control & action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 rounded-full border-[#dadce0] dark:border-zinc-700 hover:bg-neutral-50 dark:hover:bg-zinc-800 text-xs font-semibold h-11 flex items-center justify-center gap-x-2"
                >
                  <Upload className="size-4 text-neutral-500" />
                  Upload custom photo
                </Button>

                <Button
                  type="button"
                  onClick={handleSaveDiceBearAvatar}
                  disabled={!selectedAvatarUrl}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 rounded-full text-xs font-semibold h-11 disabled:opacity-50 disabled:scale-100"
                >
                  Save Avatar
                </Button>
              </div>

            </div>
          ) : (
            /* Custom Image Draggable Cropper step */
            <div className="flex flex-col items-center gap-y-4 pt-4">
              <div className="text-xs font-semibold text-neutral-500 dark:text-zinc-400 text-center">
                Drag to reposition and zoom inside circular viewport
              </div>

              {/* Cropper mask area wrapper */}
              <div
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative w-[280px] h-[280px] overflow-hidden bg-neutral-50 dark:bg-zinc-900 rounded-2xl border border-neutral-200 dark:border-zinc-800 cursor-move select-none"
              >
                {/* Circular mask overlay */}
                <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                  <div className="absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] w-[140px] h-[140px] rounded-full left-[70px] top-[70px] border border-white/80" />
                </div>

                {/* Draggable photo */}
                {imageSrc && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageSrc}
                    alt="Cropper preview"
                    draggable={false}
                    className="absolute max-w-none select-none transition-none"
                    style={{
                      width: `${cropDimensions.width}px`,
                      height: `${cropDimensions.height}px`,
                      left: `${cropDimensions.left + offset.x}px`,
                      top: `${cropDimensions.top + offset.y}px`,
                      transform: `scale(${zoom})`,
                      transformOrigin: "center center",
                    }}
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      const scale = Math.max(280 / img.naturalWidth, 280 / img.naturalHeight);
                      const w = img.naturalWidth * scale;
                      const h = img.naturalHeight * scale;
                      setCropDimensions({
                        width: w,
                        height: h,
                        left: (280 - w) / 2,
                        top: (280 - h) / 2,
                      });
                    }}
                  />
                )}
              </div>

              {/* Slider scale controller */}
              <div className="w-full max-w-[280px] flex items-center gap-x-3 pt-2">
                <span className="text-xs font-semibold text-neutral-400 dark:text-zinc-500">Zoom</span>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.02"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  disabled={uploading}
                  className="w-full accent-blue-600 dark:accent-blue-500 h-1.5 bg-neutral-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Cropper controls */}
              <div className="flex gap-x-3 w-full max-w-[280px] pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setImageSrc(null);
                    setIsCropping(false);
                  }}
                  disabled={uploading}
                  className="flex-1 rounded-full text-xs font-semibold h-11"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveCrop}
                  disabled={uploading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 rounded-full text-xs font-semibold h-11 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Saving crop...
                    </>
                  ) : (
                    "Save Crop"
                  )}
                </Button>
              </div>

            </div>
          )}

        </DialogContent>
      </Dialog>

    </div>
  );
}
