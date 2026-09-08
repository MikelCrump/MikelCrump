import type {
  GenerateClipInput,
  GenerateClipResult,
  GetClipResult,
  VideoProvider,
} from "@/providers/video/types";

/**
 * Stub — wire Runway Gen API later with RUNWAY_API_KEY.
 * Selected via VIDEO_PROVIDER=runway.
 */
export class RunwayVideoProvider implements VideoProvider {
  readonly id = "runway";

  constructor(private readonly apiKey?: string) {}

  async generateClip(input: GenerateClipInput): Promise<GenerateClipResult> {
    void input;
    this.assertConfigured();
    throw new Error(
      "RunwayVideoProvider stub: API integration not wired yet. Use VIDEO_PROVIDER=mock until Phase 5+.",
    );
  }

  async getClip(jobId: string): Promise<GetClipResult> {
    void jobId;
    this.assertConfigured();
    throw new Error(
      "RunwayVideoProvider stub: API integration not wired yet. Use VIDEO_PROVIDER=mock until Phase 5+.",
    );
  }

  private assertConfigured() {
    if (!this.apiKey) {
      throw new Error(
        "RUNWAY_API_KEY is missing. Add it to .env or set VIDEO_PROVIDER=mock.",
      );
    }
  }
}
