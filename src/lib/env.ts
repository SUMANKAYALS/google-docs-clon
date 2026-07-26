import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required").default("mongodb://127.0.0.1:27017/clouds-docs"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required").default("clouds-docs-super-secret-key-change-in-production-12345"),
  NEXTAUTH_URL: z.string().optional().default("http://127.0.0.1:3000"),
  NEXT_PUBLIC_WS_URL: z.string().optional().default("ws://127.0.0.1:1234"),
});

export const env = envSchema.parse({
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/clouds-docs",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "clouds-docs-super-secret-key-change-in-production-12345",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://127.0.0.1:3000",
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:1234",
});

