import type {
  GenerateClipInput,
  GenerateClipResult,
  GetClipResult,
  VideoProvider,
} from "@/providers/video/types";

/** Public-domain-ish sample MP4 used as a placeholder output. */
export const MOCK_PLACEHOLDER_MP4 =
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

const DEFAULT_DELAY_MS = 2_000;

function encodeJobId(startedAtMs: number, delayMs: number): string {
  return `mock_${startedAtMs}_${delayMs}_${Math.random().toString(36).slice(2, 10)}`;
}

function parseJobId(jobId: string): { startedAtMs: number; delayMs: number } | null {
  const match = /^mock_(\d+)_(\d+)_/.exec(jobId);
  if (!match) return null;
  return {
    startedAtMs: Number(match[1]),
    delayMs: Number(match[2]),
  };
}

/**
 * Serverless-safe mock: job timing is encoded in the jobId so cold starts
 * do not lose in-memory state. getClip advances queued → running → succeeded.
 */
export class MockVideoProvider implements VideoProvider {
  readonly id = "mock";

  constructor(private readonly delayMs: number = DEFAULT_DELAY_MS) {}

  async generateClip(input: GenerateClipInput): Promise<GenerateClipResult> {
    void input;
    const jobId = encodeJobId(Date.now(), this.delayMs);
    return { jobId, status: "queued" };
  }

  async getClip(jobId: string): Promise<GetClipResult> {
    const parsed = parseJobId(jobId);
    if (!parsed) {
      return {
        status: "failed",
        error: `Unknown mock job id: ${jobId}`,
      };
    }

    const elapsed = Date.now() - parsed.startedAtMs;
    if (elapsed < parsed.delayMs / 2) {
      return { status: "queued" };
    }
    if (elapsed < parsed.delayMs) {
      return { status: "running" };
    }
    return { status: "succeeded", url: MOCK_PLACEHOLDER_MP4 };
  }
}
