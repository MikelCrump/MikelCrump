import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  VIDEO_PROVIDER: z
    .enum(["mock", "runway", "kling", "veo", "pika"])
    .default("mock"),
  AUDIO_PROVIDER: z.enum(["mock", "elevenlabs"]).default("mock"),
  ELEVENLABS_API_KEY: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    VIDEO_PROVIDER: process.env.VIDEO_PROVIDER,
    AUDIO_PROVIDER: process.env.AUDIO_PROVIDER,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || undefined,
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
