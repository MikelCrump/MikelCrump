import { describe, expect, it } from "vitest";
import { normalizeFromSource } from "@/adapters";
import claudeFixture from "@/adapters/fixtures/claude.sample.json";
import chatgptFixture from "@/adapters/fixtures/chatgpt.sample.json";
import grokFixture from "@/adapters/fixtures/grok.sample.json";
import cursorFixture from "@/adapters/fixtures/cursor.sample.json";
import { SceneScriptSchema } from "@/lib/scene-script";

describe("LlmAdapter.normalize", () => {
  it("normalizes Claude beats into SceneScript", () => {
    const script = normalizeFromSource("claude", claudeFixture);
    expect(SceneScriptSchema.parse(script).projectId).toBe("proj_claude_demo");
    expect(script.scenes).toHaveLength(2);
    expect(script.scenes[0]?.dialogue).toContain("Ambiguity");
    expect(script.scenes[0]?.semanticPrompt).toContain("35mm lens");
    expect(script.scenes[0]?.semanticPrompt).toContain("medium close-up");
  });

  it("normalizes ChatGPT scenes into SceneScript", () => {
    const script = normalizeFromSource("chatgpt", chatgptFixture);
    expect(script.projectId).toBe("proj_chatgpt_demo");
    expect(script.scenes[0]?.shot.lens).toBe("85mm portrait");
    expect(script.scenes[0]?.voice.voiceId).toBe("marcus_calm");
    expect(script.scenes[0]?.semanticPrompt).toMatchSnapshot();
  });

  it("normalizes Grok cut shorthand into SceneScript", () => {
    const script = normalizeFromSource("grok", grokFixture);
    expect(script.projectId).toBe("proj_grok_demo");
    expect(script.scenes).toHaveLength(2);
    expect(script.scenes[0]?.shot.movement).toBe("slow push-in");
    expect(script.scenes[0]?.shot.lens).toBe("24mm wide");
    expect(script.scenes[1]?.shot.movement).toBe("static");
    expect(script.scenes[1]?.shot.framing).toBe("MCU");
  });

  it("normalizes Cursor near-canonical payloads", () => {
    const script = normalizeFromSource("cursor", cursorFixture);
    expect(script.version).toBe(1);
    expect(script.scenes[0]?.generation.aspectRatio).toBe("1:1");
    expect(script.scenes[0]?.semanticPrompt).toContain("consistent studio lighting");
  });
});
