import { describe, expect, it } from "vitest";
import { env } from "@/env";

describe("env bootstrap", () => {
  it("loads validated defaults for providers", () => {
    expect(env.VIDEO_PROVIDER).toBe("mock");
    expect(env.AUDIO_PROVIDER).toBe("mock");
    expect(env.AUTH_PROVIDER).toBe("clerk");
    expect(env.STORAGE_PROVIDER).toBe("blob");
    expect(env.DATABASE_URL?.length ?? 0).toBeGreaterThan(0);
  });
});
