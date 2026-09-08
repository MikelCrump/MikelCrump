import { z } from "zod";
import { prisma } from "@/lib/db";
import { formatShot } from "@/lib/director-formatter";
import {
  SceneShotSchema,
  SceneScriptSchema,
  type Scene,
  type SceneScript,
} from "@/lib/scene-script";
import {
  createProject,
  getProject,
  listCharacters,
  readSceneScript,
  updateProject,
} from "@/server/services/project-service";
import { generateClips } from "@/server/services/generate-service";

export async function mcpListCharacters() {
  return listCharacters();
}

export async function mcpCreateProject(input: {
  title: string;
  moduleId?: string;
  courseId?: string;
}) {
  let courseId = input.courseId;
  if (!courseId && input.moduleId) {
    const course = await prisma.course.findFirst({
      where: { moduleId: input.moduleId },
      orderBy: { title: "asc" },
    });
    courseId = course?.id;
  }

  const project = await createProject({
    title: input.title,
    courseId,
  });

  return { projectId: project.id };
}

const PushSceneSchema = z.object({
  projectId: z.string().min(1),
  scenePrompt: z.string().min(1),
  cameraSettings: SceneShotSchema,
  characterId: z.string().optional(),
});

export async function mcpPushScene(raw: z.infer<typeof PushSceneSchema>) {
  const input = PushSceneSchema.parse(raw);
  const project = await getProject(input.projectId);
  const existing =
    readSceneScript(project) ??
    ({
      version: 1,
      projectId: input.projectId,
      scenes: [],
    } satisfies SceneScript);

  const order = existing.scenes.length;
  const shot = input.cameraSettings;
  const semanticPrompt = formatShot(shot);
  const scene: Scene = {
    id: `scene_${order + 1}`,
    order,
    lecturerCharacterId: input.characterId ?? null,
    dialogue: input.scenePrompt,
    voice: {
      provider: "mock",
      voiceId: "default",
    },
    shot,
    generation: {
      model: "mock-v1",
      durationSec: 6,
      aspectRatio: "16:9",
    },
    semanticPrompt,
    notes: `MCP push_scene · ${semanticPrompt}`,
  };

  const nextScript = SceneScriptSchema.parse({
    ...existing,
    projectId: input.projectId,
    scenes: [...existing.scenes, scene],
  });

  await updateProject(input.projectId, {
    sceneScript: nextScript,
    status: "NORMALIZED",
  });

  return scene;
}

export async function mcpGenerateClip(input: {
  projectId: string;
  sceneId: string;
  model?: string;
}) {
  return generateClips(input);
}

export async function mcpGetProjectStatus(projectId: string) {
  const project = await getProject(projectId);
  return {
    projectId: project.id,
    status: project.status,
    clips: project.clips.map((clip) => ({
      id: clip.id,
      order: clip.order,
      status: clip.status,
      attempts: clip.attempts,
      lastError: clip.lastError,
      outputUrl: clip.outputUrl,
      audioUrl: clip.audioUrl,
    })),
    joinedAudioUrl: project.joinedAudioUrl,
    sceneCount: readSceneScript(project)?.scenes.length ?? 0,
  };
}

export { PushSceneSchema };
