import { z } from "zod";

export const LensSchema = z.enum([
  "18mm ultra-wide",
  "24mm wide",
  "35mm",
  "50mm",
  "85mm portrait",
  "135mm tele",
]);
export type Lens = z.infer<typeof LensSchema>;

export const CameraAngleSchema = z.enum([
  "eye-level",
  "low-angle",
  "high-angle",
  "dutch",
  "over-the-shoulder",
  "top-down",
]);
export type CameraAngle = z.infer<typeof CameraAngleSchema>;

export const CameraMovementSchema = z.enum([
  "static",
  "slow push-in",
  "pull-out",
  "pan-left",
  "pan-right",
  "handheld",
  "orbit",
]);
export type CameraMovement = z.infer<typeof CameraMovementSchema>;

export const ShotFramingSchema = z.enum([
  "ECU",
  "CU",
  "MCU",
  "MS",
  "MWS",
  "WS",
  "EWS",
]);
export type ShotFraming = z.infer<typeof ShotFramingSchema>;

export const DepthOfFieldSchema = z.enum(["deep", "medium", "shallow"]);
export type DepthOfField = z.infer<typeof DepthOfFieldSchema>;

export const AspectRatioSchema = z.enum(["16:9", "9:16", "1:1"]);
export type AspectRatio = z.infer<typeof AspectRatioSchema>;

export const VoiceProviderSchema = z.enum(["mock", "elevenlabs"]);
export type VoiceProvider = z.infer<typeof VoiceProviderSchema>;

export const SceneShotSchema = z.object({
  lens: LensSchema,
  focalLengthMm: z.number().positive(),
  angle: CameraAngleSchema,
  movement: CameraMovementSchema,
  framing: ShotFramingSchema,
  depthOfField: DepthOfFieldSchema.optional(),
});
export type SceneShot = z.infer<typeof SceneShotSchema>;

export const SceneVoiceSchema = z.object({
  provider: VoiceProviderSchema,
  voiceId: z.string().min(1),
  style: z.string().optional(),
});
export type SceneVoice = z.infer<typeof SceneVoiceSchema>;

export const SceneGenerationSchema = z.object({
  model: z.string().min(1),
  durationSec: z.number().positive(),
  aspectRatio: AspectRatioSchema,
  seed: z.number().int().optional(),
});
export type SceneGeneration = z.infer<typeof SceneGenerationSchema>;

export const SceneSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().nonnegative(),
  lecturerCharacterId: z.string().nullable(),
  dialogue: z.string(),
  voice: SceneVoiceSchema,
  shot: SceneShotSchema,
  background: z.string().optional(),
  notes: z.string().optional(),
  generation: SceneGenerationSchema,
  semanticPrompt: z.string().optional(),
});
export type Scene = z.infer<typeof SceneSchema>;

export const SceneScriptSchema = z.object({
  version: z.literal(1),
  projectId: z.string().min(1),
  scenes: z.array(SceneSchema),
});
export type SceneScript = z.infer<typeof SceneScriptSchema>;

export function parseSceneScript(input: unknown): SceneScript {
  return SceneScriptSchema.parse(input);
}

export function safeParseSceneScript(input: unknown) {
  return SceneScriptSchema.safeParse(input);
}
