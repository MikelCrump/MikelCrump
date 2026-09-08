import type {
  AudioProvider,
  JoinAudioResult,
  SynthesizeAudioInput,
  SynthesizeAudioResult,
} from "@/providers/audio/types";

/**
 * Stub — wire ElevenLabs TTS + stitch later with ELEVENLABS_API_KEY.
 * Selected via AUDIO_PROVIDER=elevenlabs.
 */
export class ElevenLabsAudioProvider implements AudioProvider {
  readonly id = "elevenlabs";

  constructor(private readonly apiKey?: string) {}

  async synthesize(input: SynthesizeAudioInput): Promise<SynthesizeAudioResult> {
    void input;
    this.assertConfigured();
    throw new Error(
      "ElevenLabsAudioProvider stub: API integration not wired yet. Use AUDIO_PROVIDER=mock until Phase 6.",
    );
  }

  async join(urls: string[]): Promise<JoinAudioResult> {
    void urls;
    this.assertConfigured();
    throw new Error(
      "ElevenLabsAudioProvider stub: join not wired yet. Use AUDIO_PROVIDER=mock until Phase 6.",
    );
  }

  private assertConfigured() {
    if (!this.apiKey) {
      throw new Error(
        "ELEVENLABS_API_KEY is missing. Add it to .env or set AUDIO_PROVIDER=mock.",
      );
    }
  }
}
