import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createAudioProvider } from "@/providers/audio";
import { getProject, readSceneScript } from "@/server/services/project-service";

export const AudioProjectSchema = z.object({
  projectId: z.string().min(1),
});

export async function synthesizeProjectAudio(projectId: string) {
  const project = await getProject(projectId);
  const script = readSceneScript(project);
  if (!script) {
    throw new Error("Project has no SceneScript");
  }

  const provider = createAudioProvider();
  const clips = await prisma.videoClip.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
  });

  if (clips.length === 0) {
    // Create clip rows from scenes if generate hasn't run yet
    for (const scene of script.scenes) {
      await prisma.videoClip.create({
        data: {
          projectId,
          order: scene.order,
          characterId: scene.lecturerCharacterId,
          dialogue: scene.dialogue,
          promptSettings: {
            semanticPrompt: scene.semanticPrompt,
          } as Prisma.InputJsonValue,
          cameraSettings: scene.shot as unknown as Prisma.InputJsonValue,
          videoModel: scene.generation.model,
          status: "QUEUED",
        },
      });
    }
  }

  const latestClips = await prisma.videoClip.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
  });

  const updated = [];
  for (const clip of latestClips) {
    const scene = script.scenes.find((item) => item.order === clip.order);
    const text = scene?.dialogue ?? clip.dialogue;
    const voiceId = scene?.voice.voiceId ?? "default";
    const style = scene?.voice.style;
    const result = await provider.synthesize({ text, voiceId, style });
    const next = await prisma.videoClip.update({
      where: { id: clip.id },
      data: { audioUrl: result.url },
    });
    updated.push(next);
  }

  await prisma.videoProject.update({
    where: { id: projectId },
    data: { status: "AUDIO" },
  });

  return { projectId, clips: updated };
}

export async function joinProjectAudio(projectId: string) {
  const clips = await prisma.videoClip.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
  });
  const urls = clips.map((clip) => clip.audioUrl).filter(Boolean) as string[];
  if (urls.length === 0) {
    throw new Error("No clip audioUrl values to join. Run synthesize first.");
  }

  const provider = createAudioProvider();
  const joined = await provider.join(urls);

  const project = await prisma.videoProject.update({
    where: { id: projectId },
    data: {
      joinedAudioUrl: joined.url,
      status: "REVIEW",
    },
    include: {
      clips: { orderBy: { order: "asc" } },
    },
  });

  return project;
}
