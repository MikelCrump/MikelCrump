import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  value === "" || value === undefined || value === null ? undefined : value;

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Locked Phase 2 decisions
  AUTH_PROVIDER: z.enum(["clerk"]).default("clerk"),
  STORAGE_PROVIDER: z.enum(["blob"]).default("blob"),

  VIDEO_PROVIDER: z
    .enum(["mock", "runway", "kling", "veo", "pika"])
    .default("mock"),
  AUDIO_PROVIDER: z.enum(["mock", "elevenlabs"]).default("mock"),

  // Clerk (wire keys when enabling auth UI)
  CLERK_SECRET_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),

  // Vercel Blob
  BLOB_READ_WRITE_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),

  // Video provider API keys (optional until plugged in)
  RUNWAY_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  KLING_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  KLING_ACCESS_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  KLING_SECRET_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  GOOGLE_VEO_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  PIKA_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),

  // Audio
  ELEVENLABS_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_PROVIDER: process.env.AUTH_PROVIDER,
    STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
    VIDEO_PROVIDER: process.env.VIDEO_PROVIDER,
    AUDIO_PROVIDER: process.env.AUDIO_PROVIDER,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    RUNWAY_API_KEY: process.env.RUNWAY_API_KEY,
    KLING_API_KEY: process.env.KLING_API_KEY,
    KLING_ACCESS_KEY: process.env.KLING_ACCESS_KEY,
    KLING_SECRET_KEY: process.env.KLING_SECRET_KEY,
    GOOGLE_VEO_API_KEY: process.env.GOOGLE_VEO_API_KEY,
    PIKA_API_KEY: process.env.PIKA_API_KEY,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${details}`);
  }

  return parsed.data;
}

export const env = loadEnv();
