import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL ??
        "postgresql://crump:crump@localhost:5432/crump_studio?schema=public",
      AUTH_PROVIDER: "clerk",
      STORAGE_PROVIDER: "blob",
      VIDEO_PROVIDER: process.env.VIDEO_PROVIDER ?? "mock",
      AUDIO_PROVIDER: process.env.AUDIO_PROVIDER ?? "mock",
      NODE_ENV: "test",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
