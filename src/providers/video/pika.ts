import type {
  GenerateClipInput,
  GenerateClipResult,
  GetClipResult,
  VideoProvider,
} from "@/providers/video/types";

/**
 * Stub — wire Pika API later with PIKA_API_KEY.
 * Selected via VIDEO_PROVIDER=pika.
 */
export class PikaVideoProvider implements VideoProvider {
  readonly id = "pika";

  constructor(private readonly apiKey?: string) {}

  async generateClip(input: GenerateClipInput): Promise<GenerateClipResult> {
    void input;
    this.assertConfigured();
    throw new Error(
      "PikaVideoProvider stub: API integration not wired yet. Use VIDEO_PROVIDER=mock until Phase 5+.",
    );
  }

  async getClip(jobId: string): Promise<GetClipResult> {
    void jobId;
    this.assertConfigured();
    throw new Error(
      "PikaVideoProvider stub: API integration not wired yet. Use VIDEO_PROVIDER=mock until Phase 5+.",
    );
  }

  private assertConfigured() {
    if (!this.apiKey) {
      throw new Error(
        "PIKA_API_KEY is missing. Add it to .env or set VIDEO_PROVIDER=mock.",
      );
    }
  }
}
