import type {
  GenerateClipInput,
  GenerateClipResult,
  GetClipResult,
  VideoProvider,
} from "@/providers/video/types";

/**
 * Stub — wire Kling API later with KLING_API_KEY / access+secret pair.
 * Selected via VIDEO_PROVIDER=kling.
 */
export class KlingVideoProvider implements VideoProvider {
  readonly id = "kling";

  constructor(
    private readonly apiKey?: string,
    private readonly accessKey?: string,
    private readonly secretKey?: string,
  ) {}

  async generateClip(input: GenerateClipInput): Promise<GenerateClipResult> {
    void input;
    this.assertConfigured();
    throw new Error(
      "KlingVideoProvider stub: API integration not wired yet. Use VIDEO_PROVIDER=mock until Phase 5+.",
    );
  }

  async getClip(jobId: string): Promise<GetClipResult> {
    void jobId;
    this.assertConfigured();
    throw new Error(
      "KlingVideoProvider stub: API integration not wired yet. Use VIDEO_PROVIDER=mock until Phase 5+.",
    );
  }

  private assertConfigured() {
    const hasSingle = Boolean(this.apiKey);
    const hasPair = Boolean(this.accessKey && this.secretKey);
    if (!hasSingle && !hasPair) {
      throw new Error(
        "Kling credentials missing (KLING_API_KEY or KLING_ACCESS_KEY+KLING_SECRET_KEY). Use VIDEO_PROVIDER=mock.",
      );
    }
  }
}
