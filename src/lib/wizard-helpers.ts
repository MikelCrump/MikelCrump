import {
  CameraAngleSchema,
  CameraMovementSchema,
  DepthOfFieldSchema,
  LensSchema,
  ShotFramingSchema,
  type Scene,
  type SceneScript,
  type SceneShot,
} from "@/lib/scene-script";

export const LENSES = LensSchema.options;
export const ANGLES = CameraAngleSchema.options;
export const MOVEMENTS = CameraMovementSchema.options;
export const FRAMINGS = ShotFramingSchema.options;
export const DOFS = DepthOfFieldSchema.options;

export function emptySceneScript(projectId: string): SceneScript {
  return { version: 1, projectId, scenes: [] };
}

export function upsertSceneCharacter(
  script: SceneScript,
  characterId: string | null,
): SceneScript {
  return {
    ...script,
    scenes: script.scenes.map((scene) => ({
      ...scene,
      lecturerCharacterId: characterId,
    })),
  };
}

export function updateSceneShot(
  script: SceneScript,
  sceneId: string,
  shot: SceneShot,
  semanticPrompt: string,
): SceneScript {
  return {
    ...script,
    scenes: script.scenes.map((scene) =>
      scene.id === sceneId ? { ...scene, shot, semanticPrompt } : scene,
    ),
  };
}

export function updateSceneDialogue(
  script: SceneScript,
  sceneId: string,
  dialogue: string,
): SceneScript {
  return {
    ...script,
    scenes: script.scenes.map((scene) =>
      scene.id === sceneId ? { ...scene, dialogue } : scene,
    ),
  };
}

export type CharacterOption = {
  id: string;
  name: string;
  soulId: string;
  description: string | null;
  referenceImages: { id: string; url: string; kind: string | null }[];
  loraWeights: {
    id: string;
    label: string;
    isActive: boolean;
    baseModel: string;
    trigger: string | null;
  }[];
};

export type ModuleOption = {
  id: string;
  name: string;
  code: string;
  courses: { id: string; title: string; needsAssets: boolean }[];
};

export function sortScenes(scenes: Scene[]): Scene[] {
  return [...scenes].sort((a, b) => a.order - b.order);
}
