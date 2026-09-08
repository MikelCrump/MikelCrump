import { env } from "@/env";
import { MockVideoProvider } from "@/providers/video/mock";
import { RunwayVideoProvider } from "@/providers/video/runway";
import { KlingVideoProvider } from "@/providers/video/kling";
import { VeoVideoProvider } from "@/providers/video/veo";
import { PikaVideoProvider } from "@/providers/video/pika";
import type { VideoProvider } from "@/providers/video/types";

export type VideoProviderId = "mock" | "runway" | "kling" | "veo" | "pika";

export function createVideoProvider(
  id: VideoProviderId = env.VIDEO_PROVIDER,
): VideoProvider {
  switch (id) {
    case "mock":
      return new MockVideoProvider();
    case "runway":
      return new RunwayVideoProvider(env.RUNWAY_API_KEY);
    case "kling":
      return new KlingVideoProvider(
        env.KLING_API_KEY,
        env.KLING_ACCESS_KEY,
        env.KLING_SECRET_KEY,
      );
    case "veo":
      return new VeoVideoProvider(env.GOOGLE_VEO_API_KEY);
    case "pika":
      return new PikaVideoProvider(env.PIKA_API_KEY);
    default: {
      const _exhaustive: never = id;
      throw new Error(`Unknown VIDEO_PROVIDER: ${String(_exhaustive)}`);
    }
  }
}

export type {
  VideoProvider,
  GenerateClipInput,
  GenerateClipResult,
  GetClipResult,
  ClipJobStatus,
} from "@/providers/video/types";
export { MockVideoProvider } from "@/providers/video/mock";
export { RunwayVideoProvider } from "@/providers/video/runway";
export { KlingVideoProvider } from "@/providers/video/kling";
export { VeoVideoProvider } from "@/providers/video/veo";
export { PikaVideoProvider } from "@/providers/video/pika";
