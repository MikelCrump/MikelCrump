import { env } from "@/env";
import { MockAudioProvider } from "@/providers/audio/mock";
import { ElevenLabsAudioProvider } from "@/providers/audio/elevenlabs";
import type { AudioProvider } from "@/providers/audio/types";

export type AudioProviderId = "mock" | "elevenlabs";

export function createAudioProvider(
  id: AudioProviderId = env.AUDIO_PROVIDER,
): AudioProvider {
  switch (id) {
    case "mock":
      return new MockAudioProvider();
    case "elevenlabs":
      return new ElevenLabsAudioProvider(env.ELEVENLABS_API_KEY);
    default: {
      const _exhaustive: never = id;
      throw new Error(`Unknown AUDIO_PROVIDER: ${String(_exhaustive)}`);
    }
  }
}

export type {
  AudioProvider,
  SynthesizeAudioInput,
  SynthesizeAudioResult,
  JoinAudioResult,
} from "@/providers/audio/types";
export { MockAudioProvider } from "@/providers/audio/mock";
export { ElevenLabsAudioProvider } from "@/providers/audio/elevenlabs";
