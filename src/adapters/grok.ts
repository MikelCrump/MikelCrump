import { z } from "zod";
import type { LlmAdapter } from "@/adapters/types";
import { normalizeLooseScenes, requireProjectId } from "@/adapters/shared";
import type { SceneScript } from "@/lib/scene-script";

/**
 * Grok-style export: { project_id, cuts: [{ line, cam: "35mm|eye|push|MCU|shallow", ... }] }
 */
const GrokPayloadSchema = z.object({
  project_id: z.string().optional(),
  projectId: z.string().optional(),
  cuts: z
    .array(
      z.object({
        cut_id: z.string().optional(),
        n: z.number().optional(),
        line: z.string().optional(),
        soul: z.string().nullable().optional(),
        cam: z.string().optional(),
        bg: z.string().optional(),
        note: z.string().optional(),
        voice: z.string().optional(),
        style: z.string().optional(),
        model: z.string().optional(),
        secs: z.number().optional(),
        ar: z.string().optional(),
        seed: z.number().optional(),
      }),
    )
    .default([]),
});

function parseCam(cam: string | undefined) {
  if (!cam) return undefined;
  const [lens, angle, movement, framing, depthOfField] = cam
    .split("|")
    .map((part) => part.trim());
  return {
    lens,
    angle,
    movement,
    framing,
    depthOfField,
  };
}

export class GrokAdapter implements LlmAdapter {
  readonly source = "grok" as const;

  normalize(rawPayload: unknown): SceneScript {
    const payload = GrokPayloadSchema.parse(rawPayload);
    const projectId = requireProjectId(payload as Record<string, unknown>);

    const scenes = payload.cuts.map((cut) => ({
      id: cut.cut_id,
      order: cut.n,
      lecturerCharacterId: cut.soul ?? null,
      dialogue: cut.line ?? "",
      voice: {
        provider: "mock",
        voiceId: cut.voice ?? "default",
        style: cut.style,
      },
      shot: parseCam(cut.cam),
      background: cut.bg,
      notes: cut.note,
      generation: {
        model: cut.model,
        durationSec: cut.secs,
        aspectRatio: cut.ar,
        seed: cut.seed,
      },
    }));

    return normalizeLooseScenes(scenes, { projectId });
  }
}
