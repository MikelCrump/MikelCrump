export type ClipJobStatus = "queued" | "running" | "succeeded" | "failed";

export type GenerateClipInput = {
  prompt: string;
  durationSec: number;
  aspectRatio: "16:9" | "9:16" | "1:1";
  model?: string;
  seed?: number;
  characterSoulId?: string | null;
  referenceImageUrls?: string[];
  negativePrompt?: string;
};

export type GenerateClipResult = {
  jobId: string;
  status: ClipJobStatus;
};

export type GetClipResult = {
  status: ClipJobStatus;
  url?: string;
  error?: string;
};

export interface VideoProvider {
  readonly id: string;
  generateClip(input: GenerateClipInput): Promise<GenerateClipResult>;
  getClip(jobId: string): Promise<GetClipResult>;
}
