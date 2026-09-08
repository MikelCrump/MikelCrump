import { z } from "zod";
import type { ClipStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createVideoProvider } from "@/providers/video";
import {
  getProject,
  readSceneScript,
} from "@/server/services/project-service";
import {
  canRetry,
  transitionClipStatus,
} from "@/lib/clip-state-machine";
import { formatShot } from "@/lib/director-formatter";

export const GenerateInputSchema = z.object({
  projectId: z.string().min(1),
  sceneId: z.string().optional(),
  model: z.string().optional(),
});

export type GenerateInput = z.infer<typeof GenerateInputSchema>;

export async function generateClips(input: GenerateInput) {
  const project = await getProject(input.projectId);
  const script = readSceneScript(project);
  if (!script || script.scenes.length === 0) {
    throw new Error("Project has no SceneScript scenes to generate");
  }

  const scenes = input.sceneId
    ? script.scenes.filter((scene) => scene.id === input.sceneId)
    : script.scenes;

  if (scenes.length === 0) {
    throw new Error(`Scene not found: ${input.sceneId}`);
  }

  const provider = createVideoProvider();
  const clips = [];

  for (const scene of scenes) {
    const videoModel = input.model ?? scene.generation.model;
    const prompt =
      scene.semanticPrompt ?? formatShot(scene.shot);
    const promptSettings = {
      semanticPrompt: prompt,
      dialogue: scene.dialogue,
      voice: scene.voice,
      background: scene.background,
      notes: scene.notes,
    };
    const cameraSettings = scene.shot;

    const existing = await prisma.videoClip.findUnique({
      where: {
        projectId_order: {
          projectId: project.id,
          order: scene.order,
        },
      },
    });

    let clip =
      existing ??
      (await prisma.videoClip.create({
        data: {
          projectId: project.id,
          order: scene.order,
          characterId: scene.lecturerCharacterId,
          dialogue: scene.dialogue,
          promptSettings: promptSettings as Prisma.InputJsonValue,
          cameraSettings: cameraSettings as Prisma.InputJsonValue,
          videoModel,
          status: "QUEUED",
        },
      }));

    if (existing && canRetry(existing.status)) {
      clip = await prisma.videoClip.update({
        where: { id: existing.id },
        data: {
          status: transitionClipStatus(existing.status, { type: "retry" }),
          videoModel,
          dialogue: scene.dialogue,
          promptSettings: promptSettings as Prisma.InputJsonValue,
          cameraSettings: cameraSettings as Prisma.InputJsonValue,
          characterId: scene.lecturerCharacterId,
          lastError: null,
          outputUrl: null,
          jobId: null,
        },
      });
    }

    const requestPayload = {
      prompt,
      durationSec: scene.generation.durationSec,
      aspectRatio: scene.generation.aspectRatio,
      model: videoModel,
      seed: scene.generation.seed,
      characterSoulId: scene.lecturerCharacterId,
    };

    try {
      const result = await provider.generateClip(requestPayload);
      const attempt = clip.attempts + 1;
      clip = await prisma.videoClip.update({
        where: { id: clip.id },
        data: {
          jobId: result.jobId,
          status:
            result.status === "queued"
              ? "QUEUED"
              : result.status === "running"
                ? "RUNNING"
                : result.status === "succeeded"
                  ? "SUCCEEDED"
                  : "FAILED",
          attempts: attempt,
        },
      });

      await prisma.videoClipAttempt.create({
        data: {
          clipId: clip.id,
          attempt,
          status: clip.status,
          request: requestPayload as Prisma.InputJsonValue,
          response: result as unknown as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "generateClip failed";
      const attempt = clip.attempts + 1;
      const failedStatus: ClipStatus = "FAILED";
      clip = await prisma.videoClip.update({
        where: { id: clip.id },
        data: {
          status: failedStatus,
          attempts: attempt,
          lastError: message,
        },
      });
      await prisma.videoClipAttempt.create({
        data: {
          clipId: clip.id,
          attempt,
          status: failedStatus,
          request: requestPayload as Prisma.InputJsonValue,
          error: message,
        },
      });
    }

    clips.push(clip);
  }

  await prisma.videoProject.update({
    where: { id: project.id },
    data: { status: "GENERATING" },
  });

  return { projectId: project.id, clips };
}

export async function pollClip(clipId: string) {
  const clip = await prisma.videoClip.findUnique({
    where: { id: clipId },
    include: {
      attemptsLog: { orderBy: { attempt: "asc" } },
      project: true,
    },
  });
  if (!clip) {
    throw new Error(`Clip not found: ${clipId}`);
  }
  if (!clip.jobId) {
    return clip;
  }
  if (clip.status === "SUCCEEDED" || clip.status === "FAILED") {
    return clip;
  }

  const provider = createVideoProvider();
  const result = await provider.getClip(clip.jobId);
  const requestPayload = {
    jobId: clip.jobId,
    polledAt: new Date().toISOString(),
  };

  let nextStatus: ClipStatus = clip.status;
  let outputUrl = clip.outputUrl;
  let lastError = clip.lastError;

  if (result.status === "running" && clip.status === "QUEUED") {
    nextStatus = transitionClipStatus(clip.status, { type: "start" });
  } else if (result.status === "succeeded") {
    nextStatus =
      clip.status === "QUEUED"
        ? transitionClipStatus(
            transitionClipStatus(clip.status, { type: "start" }),
            { type: "succeed" },
          )
        : transitionClipStatus(clip.status, { type: "succeed" });
    outputUrl = result.url ?? outputUrl;
  } else if (result.status === "failed") {
    nextStatus =
      clip.status === "QUEUED"
        ? transitionClipStatus(clip.status, { type: "fail" })
        : transitionClipStatus(clip.status, { type: "fail" });
    lastError = result.error ?? "Provider reported failure";
  }

  const updated = await prisma.videoClip.update({
    where: { id: clip.id },
    data: {
      status: nextStatus,
      outputUrl,
      lastError,
      attempts: clip.attempts + (nextStatus !== clip.status ? 0 : 0),
    },
    include: {
      attemptsLog: { orderBy: { attempt: "asc" } },
    },
  });

  if (nextStatus !== clip.status) {
    await prisma.videoClipAttempt.create({
      data: {
        clipId: clip.id,
        attempt: updated.attempts,
        status: nextStatus,
        request: requestPayload as Prisma.InputJsonValue,
        response: result as unknown as Prisma.InputJsonValue,
        error: lastError,
      },
    });
  }

  const siblings = await prisma.videoClip.findMany({
    where: { projectId: clip.projectId },
  });
  const allDone = siblings.every(
    (item) => item.status === "SUCCEEDED" || item.status === "FAILED",
  );
  if (allDone) {
    await prisma.videoProject.update({
      where: { id: clip.projectId },
      data: { status: "REVIEW" },
    });
  }

  return prisma.videoClip.findUniqueOrThrow({
    where: { id: clip.id },
    include: {
      attemptsLog: { orderBy: { attempt: "asc" } },
    },
  });
}
