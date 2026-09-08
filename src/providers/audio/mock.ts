import type {
  AudioProvider,
  JoinAudioResult,
  SynthesizeAudioInput,
  SynthesizeAudioResult,
} from "@/providers/audio/types";

/** Short public sample used as a stand-in for synthesized / joined audio. */
export const MOCK_PLACEHOLDER_AUDIO =
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

export class MockAudioProvider implements AudioProvider {
  readonly id = "mock";

  async synthesize(input: SynthesizeAudioInput): Promise<SynthesizeAudioResult> {
    void input;
    return { url: MOCK_PLACEHOLDER_AUDIO };
  }

  async join(urls: string[]): Promise<JoinAudioResult> {
    if (urls.length === 0) {
      throw new Error("MockAudioProvider.join requires at least one audio URL");
    }
    // Mock "join" returns the same placeholder; real join lands in Phase 6.
    return { url: MOCK_PLACEHOLDER_AUDIO };
  }
}
