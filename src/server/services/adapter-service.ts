import { z } from "zod";
import { normalizeFromSource, type LlmSource } from "@/adapters";
import type { SceneScript } from "@/lib/scene-script";

export const NormalizeInputSchema = z.object({
  source: z.enum(["claude", "chatgpt", "grok", "cursor"]),
  payload: z.unknown(),
});

export type NormalizeInput = z.infer<typeof NormalizeInputSchema>;

export function normalizeAdapterPayload(input: NormalizeInput): SceneScript {
  return normalizeFromSource(input.source as LlmSource, input.payload);
}
