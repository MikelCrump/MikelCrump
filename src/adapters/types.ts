import type { SceneScript } from "@/lib/scene-script";

export type LlmSource = "claude" | "chatgpt" | "grok" | "cursor";

/**
 * Each inbound LLM payload adapter normalizes to the canonical SceneScript.
 * Concrete adapters (claude, chatgpt, grok, cursor) land in Phase 3.
 */
export interface LlmAdapter {
  readonly source: LlmSource;
  normalize(rawPayload: unknown): SceneScript;
}
