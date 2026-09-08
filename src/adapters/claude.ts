import { z } from "zod";
import type { LlmAdapter } from "@/adapters/types";
import { normalizeLooseScenes, requireProjectId } from "@/adapters/shared";
import type { SceneScript } from "@/lib/scene-script";

/**
 * Claude-style export: { projectId, module, beats: [{ id, narration, camera, ... }] }
 */
const ClaudePayloadSchema = z.object({
  projectId: z.string().optional(),
  project_id: z.string().optional(),
  module: z.string().optional(),
  beats: z
    .array(
      z.object({
        id: z.string().optional(),
        order: z.number().optional(),
        narration: z.string().optional(),
        dialogue: z.string().optional(),
        character_id: z.string().nullable().optional(),
        lecturerCharacterId: z.string().nullable().optional(),
        camera: z
          .object({
            lens: z.string().optional(),
            focal_length_mm: z.number().optional(),
            angle: z.string().optional(),
            movement: z.string().optional(),
            framing: z.string().optional(),
            depth_of_field: z.string().optional(),
          })
          .optional(),
        voice: z
          .object({
            provider: z.string().optional(),
            voice_id: z.string().optional(),
            style: z.string().optional(),
          })
          .optional(),
        background: z.string().optional(),
        notes: z.string().optional(),
        generation: z
          .object({
            model: z.string().optional(),
            duration_sec: z.number().optional(),
            aspect_ratio: z.string().optional(),
            seed: z.number().optional(),
          })
          .optional(),
      }),
    )
    .default([]),
});

export class ClaudeAdapter implements LlmAdapter {
  readonly source = "claude" as const;

  normalize(rawPayload: unknown): SceneScript {
    const payload = ClaudePayloadSchema.parse(rawPayload);
    const projectId = requireProjectId(payload as Record<string, unknown>);

    const scenes = payload.beats.map((beat) => ({
      id: beat.id,
      order: beat.order,
      lecturerCharacterId: beat.lecturerCharacterId ?? beat.character_id ?? null,
      dialogue: beat.dialogue ?? beat.narration ?? "",
      voice: beat.voice
        ? {
            provider: beat.voice.provider,
            voiceId: beat.voice.voice_id,
            style: beat.voice.style,
          }
        : undefined,
      shot: beat.camera
        ? {
            lens: beat.camera.lens,
            focalLengthMm: beat.camera.focal_length_mm,
            angle: beat.camera.angle,
            movement: beat.camera.movement,
            framing: beat.camera.framing,
            depthOfField: beat.camera.depth_of_field,
          }
        : undefined,
      background: beat.background,
      notes: beat.notes ?? (payload.module ? `Module: ${payload.module}` : undefined),
      generation: beat.generation
        ? {
            model: beat.generation.model,
            durationSec: beat.generation.duration_sec,
            aspectRatio: beat.generation.aspect_ratio,
            seed: beat.generation.seed,
          }
        : undefined,
    }));

    return normalizeLooseScenes(scenes, { projectId });
  }
}
