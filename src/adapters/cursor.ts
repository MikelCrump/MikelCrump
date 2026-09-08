import { z } from "zod";
import type { LlmAdapter } from "@/adapters/types";
import { normalizeLooseScenes, requireProjectId } from "@/adapters/shared";
import type { SceneScript } from "@/lib/scene-script";

/**
 * Cursor agent-style export: nearly canonical SceneScript under `sceneScript`,
 * or a flat { projectId, scenes } already close to target.
 */
const CursorPayloadSchema = z.object({
  projectId: z.string().optional(),
  sceneScript: z
    .object({
      version: z.literal(1).optional(),
      projectId: z.string().optional(),
      scenes: z.array(z.record(z.string(), z.unknown())).optional(),
    })
    .optional(),
  scenes: z.array(z.record(z.string(), z.unknown())).optional(),
});

export class CursorAdapter implements LlmAdapter {
  readonly source = "cursor" as const;

  normalize(rawPayload: unknown): SceneScript {
    const payload = CursorPayloadSchema.parse(rawPayload);
    const nested = payload.sceneScript;
    const projectId = requireProjectId({
      projectId: nested?.projectId ?? payload.projectId,
    });
    const scenes = nested?.scenes ?? payload.scenes ?? [];
    return normalizeLooseScenes(scenes, { projectId });
  }
}
