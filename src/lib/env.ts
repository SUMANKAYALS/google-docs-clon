import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required").default("mongodb://localhost:27017/clouds-docs"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required").default("clouds-docs-super-secret-key-change-in-production-12345"),
  NEXTAUTH_URL: z.string().optional().default("http://localhost:3000"),
});

export const env = envSchema.parse({
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/clouds-docs",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "clouds-docs-super-secret-key-change-in-production-12345",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
});
