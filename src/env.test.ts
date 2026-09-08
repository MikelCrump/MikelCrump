import { describe, expect, it } from "vitest";
import { env } from "@/env";

describe("env bootstrap", () => {
  it("loads validated defaults for providers", () => {
    expect(env.VIDEO_PROVIDER).toBeDefined();
    expect(env.AUDIO_PROVIDER).toBeDefined();
    expect(env.DATABASE_URL.length).toBeGreaterThan(0);
  });
});
