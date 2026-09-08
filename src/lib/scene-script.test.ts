import { describe, expect, it } from "vitest";
import {
  SceneScriptSchema,
  parseSceneScript,
  safeParseSceneScript,
  type SceneScript,
} from "@/lib/scene-script";

const validScript: SceneScript = {
  version: 1,
  projectId: "proj_123",
  scenes: [
    {
      id: "scene_1",
      order: 0,
      lecturerCharacterId: "char_ava",
      dialogue: "Welcome to leading through ambiguity.",
      voice: {
        provider: "mock",
        voiceId: "voice_ava",
        style: "warm lecture",
      },
      shot: {
        lens: "35mm",
        focalLengthMm: 35,
        angle: "eye-level",
        movement: "slow push-in",
        framing: "MCU",
        depthOfField: "shallow",
      },
      background: "neutral studio cyclorama",
      notes: "Hold eye line to camera A",
      generation: {
        model: "mock-v1",
        durationSec: 6,
        aspectRatio: "16:9",
        seed: 42,
      },
      semanticPrompt:
        "35mm lens, eye-level angle, slow push-in, medium close-up, shallow depth of field, consistent studio lighting",
    },
  ],
};

describe("SceneScriptSchema", () => {
  it("accepts a canonical SceneScript", () => {
    expect(SceneScriptSchema.parse(validScript)).toEqual(validScript);
  });

  it("rejects wrong version", () => {
    const result = safeParseSceneScript({ ...validScript, version: 2 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid lens enum", () => {
    expect(() =>
      parseSceneScript({
        ...validScript,
        scenes: [
          {
            ...validScript.scenes[0],
            shot: { ...validScript.scenes[0].shot, lens: "20mm" },
          },
        ],
      }),
    ).toThrow();
  });

  it("allows null lecturerCharacterId and optional fields omitted", () => {
    const minimal = {
      version: 1 as const,
      projectId: "proj_min",
      scenes: [
        {
          id: "s1",
          order: 0,
          lecturerCharacterId: null,
          dialogue: "Hello",
          voice: { provider: "elevenlabs" as const, voiceId: "v1" },
          shot: {
            lens: "50mm" as const,
            focalLengthMm: 50,
            angle: "low-angle" as const,
            movement: "static" as const,
            framing: "CU" as const,
          },
          generation: {
            model: "mock",
            durationSec: 4,
            aspectRatio: "9:16" as const,
          },
        },
      ],
    };
    expect(parseSceneScript(minimal).scenes[0].lecturerCharacterId).toBeNull();
  });
});
