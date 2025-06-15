import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().trim().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z
    .string()
    .trim()
    .min(1, "BETTER_AUTH_SECRET is required"),
  GOOGLE_CLIENT_ID: z.string().trim().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z
    .string()
    .trim()
    .min(1, "GOOGLE_CLIENT_SECRET is required"),
  GITHUB_CLIENT_ID: z.string().trim().min(1, "GITHUB_CLIENT_ID is required"),
  GITHUB_CLIENT_SECRET: z
    .string()
    .trim()
    .min(1, "GITHUB_CLIENT_SECRET is required"),
  NEXT_PUBLIC_STREAM_API_KEY: z
    .string()
    .trim()
    .min(1, "NEXT_PUBLIC_STREAM_API_KEY is required"),
  STREAM_API_SECRET: z.string().trim().min(1, "STREAM_API_SECRET is required"),
  OPENAI_API_KEY: z.string().trim().min(1, "OPENAI_API_KEY is required"),
});

export const env = envSchema.parse(process.env);
