import { z } from "zod";
import type { LlmAdapter } from "@/adapters/types";
import { normalizeLooseScenes, requireProjectId } from "@/adapters/shared";
import type { SceneScript } from "@/lib/scene-script";

/**
 * ChatGPT-style export: { meta: { projectId }, scenes: [{ spokenText, shotSettings, ... }] }
 */
const ChatGptPayloadSchema = z.object({
  meta: z
    .object({
      projectId: z.string().optional(),
      title: z.string().optional(),
    })
    .optional(),
  projectId: z.string().optional(),
  scenes: z
    .array(
      z.object({
        sceneId: z.string().optional(),
        index: z.number().optional(),
        spokenText: z.string().optional(),
        lecturerId: z.string().nullable().optional(),
        shotSettings: z
          .object({
            lens: z.string().optional(),
            focalLengthMm: z.number().optional(),
            cameraAngle: z.string().optional(),
            cameraMove: z.string().optional(),
            framing: z.string().optional(),
            dof: z.string().optional(),
          })
          .optional(),
        tts: z
          .object({
            engine: z.string().optional(),
            voice: z.string().optional(),
            style: z.string().optional(),
          })
          .optional(),
        set: z.string().optional(),
        directorNotes: z.string().optional(),
        render: z
          .object({
            model: z.string().optional(),
            seconds: z.number().optional(),
            aspect: z.string().optional(),
            seed: z.number().optional(),
          })
          .optional(),
      }),
    )
    .default([]),
});

export class ChatGptAdapter implements LlmAdapter {
  readonly source = "chatgpt" as const;

  normalize(rawPayload: unknown): SceneScript {
    const payload = ChatGptPayloadSchema.parse(rawPayload);
    const projectId = requireProjectId({
      projectId: payload.meta?.projectId ?? payload.projectId,
    });

    const scenes = payload.scenes.map((scene) => ({
      id: scene.sceneId,
      order: scene.index,
      lecturerCharacterId: scene.lecturerId ?? null,
      dialogue: scene.spokenText ?? "",
      voice: scene.tts
        ? {
            provider: scene.tts.engine,
            voiceId: scene.tts.voice,
            style: scene.tts.style,
          }
        : undefined,
      shot: scene.shotSettings
        ? {
            lens: scene.shotSettings.lens,
            focalLengthMm: scene.shotSettings.focalLengthMm,
            angle: scene.shotSettings.cameraAngle,
            movement: scene.shotSettings.cameraMove,
            framing: scene.shotSettings.framing,
            depthOfField: scene.shotSettings.dof,
          }
        : undefined,
      background: scene.set,
      notes: scene.directorNotes,
      generation: scene.render
        ? {
            model: scene.render.model,
            durationSec: scene.render.seconds,
            aspectRatio: scene.render.aspect,
            seed: scene.render.seed,
          }
        : undefined,
    }));

    return normalizeLooseScenes(scenes, { projectId });
  }
}
