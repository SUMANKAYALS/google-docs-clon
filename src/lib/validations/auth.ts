import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  image: z.string().optional().nullable(),
  username: z.string().max(30).optional().or(z.literal("")),
  bio: z.string().max(200).optional().or(z.literal("")),
  location: z.string().max(50).optional().or(z.literal("")),
  website: z.string().url("Please enter a valid website URL").or(z.literal("")).optional().nullable(),
  jobTitle: z.string().max(50).optional().or(z.literal("")),
  company: z.string().max(50).optional().or(z.literal("")),
  phoneNumber: z.string().max(20).optional().or(z.literal("")),
  timezone: z.string().max(50).optional().or(z.literal("")),
  language: z.string().max(30).optional().or(z.literal("")),
  defaultFont: z.string().max(50).optional().or(z.literal("")),
  defaultFontSize: z.string().max(20).optional().or(z.literal("")),
  pageSize: z.string().max(20).optional().or(z.literal("")),
  autoSaveEnabled: z.boolean().optional(),
  aiEnabled: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
