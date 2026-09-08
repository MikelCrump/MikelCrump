import { z } from "zod";
import { formatShot } from "@/lib/director-formatter";
import {
  AspectRatioSchema,
  DepthOfFieldSchema,
  SceneScriptSchema,
  VoiceProviderSchema,
  type Scene,
  type SceneScript,
  type SceneShot,
  type Lens,
  type CameraAngle,
  type CameraMovement,
  type ShotFraming,
} from "@/lib/scene-script";

const FOCAL_FROM_LENS: Record<Lens, number> = {
  "18mm ultra-wide": 18,
  "24mm wide": 24,
  "35mm": 35,
  "50mm": 50,
  "85mm portrait": 85,
  "135mm tele": 135,
};

const LENS_ALIASES: Record<string, Lens> = {
  "18mm": "18mm ultra-wide",
  "18mm ultra-wide": "18mm ultra-wide",
  "24mm": "24mm wide",
  "24mm wide": "24mm wide",
  "35mm": "35mm",
  "50mm": "50mm",
  "85mm": "85mm portrait",
  "85mm portrait": "85mm portrait",
  "135mm": "135mm tele",
  "135mm tele": "135mm tele",
};

const ANGLE_ALIASES: Record<string, CameraAngle> = {
  "eye-level": "eye-level",
  eye: "eye-level",
  "low-angle": "low-angle",
  low: "low-angle",
  "high-angle": "high-angle",
  high: "high-angle",
  dutch: "dutch",
  "over-the-shoulder": "over-the-shoulder",
  ots: "over-the-shoulder",
  "top-down": "top-down",
};

const MOVEMENT_ALIASES: Record<string, CameraMovement> = {
  static: "static",
  "slow push-in": "slow push-in",
  "push-in": "slow push-in",
  push: "slow push-in",
  "pull-out": "pull-out",
  pull: "pull-out",
  "pan-left": "pan-left",
  "pan-right": "pan-right",
  handheld: "handheld",
  orbit: "orbit",
};

const FRAMING_ALIASES: Record<string, ShotFraming> = {
  ECU: "ECU",
  CU: "CU",
  MCU: "MCU",
  MS: "MS",
  MWS: "MWS",
  WS: "WS",
  EWS: "EWS",
};

function alias<T extends string>(
  value: string | undefined,
  map: Record<string, T>,
  fallback: T,
): T {
  if (!value) return fallback;
  return map[value] ?? map[value.toLowerCase()] ?? fallback;
}

const LooseShotSchema = z.object({
  lens: z.string().optional(),
  focalLengthMm: z.number().positive().optional(),
  angle: z.string().optional(),
  movement: z.string().optional(),
  framing: z.string().optional(),
  depthOfField: z.string().optional(),
});

const LooseVoiceSchema = z.object({
  provider: z.string().optional(),
  voiceId: z.string().optional(),
  style: z.string().optional(),
});

const LooseGenerationSchema = z.object({
  model: z.string().optional(),
  durationSec: z.number().positive().optional(),
  aspectRatio: z.string().optional(),
  seed: z.number().int().optional(),
});

const LooseSceneSchema = z.object({
  id: z.string().optional(),
  order: z.number().int().nonnegative().optional(),
  lecturerCharacterId: z.string().nullable().optional(),
  characterId: z.string().nullable().optional(),
  dialogue: z.string().optional(),
  voice: LooseVoiceSchema.optional(),
  shot: LooseShotSchema.optional(),
  background: z.string().optional(),
  notes: z.string().optional(),
  generation: LooseGenerationSchema.optional(),
  semanticPrompt: z.string().optional(),
});

export type NormalizeContext = {
  projectId: string;
};

function normalizeShot(raw: z.infer<typeof LooseShotSchema> | undefined): SceneShot {
  const shot = LooseShotSchema.parse(raw ?? {});
  const lens = alias(shot.lens, LENS_ALIASES, "35mm");
  const dofParsed = DepthOfFieldSchema.safeParse(shot.depthOfField);

  return {
    lens,
    focalLengthMm: shot.focalLengthMm ?? FOCAL_FROM_LENS[lens],
    angle: alias(shot.angle, ANGLE_ALIASES, "eye-level"),
    movement: alias(shot.movement, MOVEMENT_ALIASES, "static"),
    framing: alias(shot.framing, FRAMING_ALIASES, "MCU"),
    depthOfField: dofParsed.success ? dofParsed.data : undefined,
  };
}

function normalizeVoice(raw: z.infer<typeof LooseVoiceSchema> | undefined) {
  const voice = LooseVoiceSchema.parse(raw ?? {});
  const providerParsed = VoiceProviderSchema.safeParse(voice.provider);
  return {
    provider: providerParsed.success ? providerParsed.data : "mock",
    voiceId: voice.voiceId?.trim() || "default",
    style: voice.style,
  };
}

function normalizeGeneration(
  raw: z.infer<typeof LooseGenerationSchema> | undefined,
) {
  const generation = LooseGenerationSchema.parse(raw ?? {});
  const aspect = AspectRatioSchema.safeParse(generation.aspectRatio);
  return {
    model: generation.model?.trim() || "mock-v1",
    durationSec: generation.durationSec ?? 6,
    aspectRatio: aspect.success ? aspect.data : "16:9",
    seed: generation.seed,
  };
}

export function normalizeLooseScenes(
  scenes: unknown[],
  ctx: NormalizeContext,
): SceneScript {
  const normalized: Scene[] = scenes.map((raw, index) => {
    const scene = LooseSceneSchema.parse(raw ?? {});
    const shot = normalizeShot(scene.shot);
    const voice = normalizeVoice(scene.voice);
    const generation = normalizeGeneration(scene.generation);
    const semanticPrompt = scene.semanticPrompt ?? formatShot(shot);

    return {
      id: scene.id ?? `scene_${index + 1}`,
      order: scene.order ?? index,
      lecturerCharacterId:
        scene.lecturerCharacterId ?? scene.characterId ?? null,
      dialogue: scene.dialogue ?? "",
      voice,
      shot,
      background: scene.background,
      notes: scene.notes,
      generation,
      semanticPrompt,
    };
  });

  return SceneScriptSchema.parse({
    version: 1,
    projectId: ctx.projectId,
    scenes: normalized,
  });
}

export function requireProjectId(payload: Record<string, unknown>): string {
  const projectId =
    (typeof payload.projectId === "string" && payload.projectId) ||
    (typeof payload.project_id === "string" && payload.project_id) ||
    "unassigned";
  return projectId;
}
