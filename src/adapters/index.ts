import type { LlmAdapter, LlmSource } from "@/adapters/types";
import { ClaudeAdapter } from "@/adapters/claude";
import { ChatGptAdapter } from "@/adapters/chatgpt";
import { GrokAdapter } from "@/adapters/grok";
import { CursorAdapter } from "@/adapters/cursor";
import type { SceneScript } from "@/lib/scene-script";

const adapters: Record<LlmSource, LlmAdapter> = {
  claude: new ClaudeAdapter(),
  chatgpt: new ChatGptAdapter(),
  grok: new GrokAdapter(),
  cursor: new CursorAdapter(),
};

export function getLlmAdapter(source: LlmSource): LlmAdapter {
  const adapter = adapters[source];
  if (!adapter) {
    throw new Error(`Unknown LLM source: ${source}`);
  }
  return adapter;
}

export function normalizeFromSource(
  source: LlmSource,
  payload: unknown,
): SceneScript {
  return getLlmAdapter(source).normalize(payload);
}

export type { LlmAdapter, LlmSource } from "@/adapters/types";
export { ClaudeAdapter } from "@/adapters/claude";
export { ChatGptAdapter } from "@/adapters/chatgpt";
export { GrokAdapter } from "@/adapters/grok";
export { CursorAdapter } from "@/adapters/cursor";
