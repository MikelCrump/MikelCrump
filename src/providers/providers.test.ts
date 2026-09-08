import { afterEach, describe, expect, it, vi } from "vitest";
import { MockVideoProvider, MOCK_PLACEHOLDER_MP4 } from "@/providers/video/mock";
import { MockAudioProvider, MOCK_PLACEHOLDER_AUDIO } from "@/providers/audio/mock";
import { RunwayVideoProvider } from "@/providers/video/runway";
import { ElevenLabsAudioProvider } from "@/providers/audio/elevenlabs";
import { createVideoProvider } from "@/providers/video";
import { createAudioProvider } from "@/providers/audio";

describe("MockVideoProvider", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a job id and advances to a placeholder mp4 after the fake delay", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-08T00:00:00.000Z"));

    const provider = new MockVideoProvider(1_000);
    const started = await provider.generateClip({
      prompt: "lecturer MCU",
      durationSec: 4,
      aspectRatio: "16:9",
    });

    expect(started.status).toBe("queued");
    expect(started.jobId.startsWith("mock_")).toBe(true);

    expect(await provider.getClip(started.jobId)).toEqual({ status: "queued" });

    vi.setSystemTime(new Date("2026-09-08T00:00:00.600Z"));
    expect(await provider.getClip(started.jobId)).toEqual({ status: "running" });

    vi.setSystemTime(new Date("2026-09-08T00:00:01.100Z"));
    expect(await provider.getClip(started.jobId)).toEqual({
      status: "succeeded",
      url: MOCK_PLACEHOLDER_MP4,
    });
  });

  it("fails unknown job ids", async () => {
    const provider = new MockVideoProvider();
    await expect(provider.getClip("not-a-mock-job")).resolves.toMatchObject({
      status: "failed",
    });
  });
});

describe("MockAudioProvider", () => {
  it("synthesizes and joins to placeholder audio urls", async () => {
    const audio = new MockAudioProvider();
    const clip = await audio.synthesize({
      text: "Hello class",
      voiceId: "voice_1",
    });
    expect(clip.url).toBe(MOCK_PLACEHOLDER_AUDIO);

    const joined = await audio.join([clip.url, clip.url]);
    expect(joined.url).toBe(MOCK_PLACEHOLDER_AUDIO);
  });
});

describe("provider stubs", () => {
  it("Runway stub refuses to run without a key", async () => {
    const runway = new RunwayVideoProvider(undefined);
    await expect(
      runway.generateClip({
        prompt: "x",
        durationSec: 4,
        aspectRatio: "16:9",
      }),
    ).rejects.toThrow(/RUNWAY_API_KEY/);
  });

  it("ElevenLabs stub refuses to run without a key", async () => {
    const eleven = new ElevenLabsAudioProvider(undefined);
    await expect(
      eleven.synthesize({ text: "hi", voiceId: "v" }),
    ).rejects.toThrow(/ELEVENLABS_API_KEY/);
  });

  it("factory defaults to mock providers from env", () => {
    expect(createVideoProvider("mock").id).toBe("mock");
    expect(createAudioProvider("mock").id).toBe("mock");
    expect(createVideoProvider("runway").id).toBe("runway");
    expect(createVideoProvider("kling").id).toBe("kling");
    expect(createVideoProvider("veo").id).toBe("veo");
    expect(createVideoProvider("pika").id).toBe("pika");
  });
});
