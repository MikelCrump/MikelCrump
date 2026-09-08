import { notFound } from "next/navigation";
import { ProjectHeader } from "@/components/project-header";
import { CanvasClient } from "@/components/canvas-client";
import type { ClipView } from "@/components/wizard-production-steps";
import {
  getProject,
  readSceneScript,
} from "@/server/services/project-service";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CanvasPage({ params }: PageProps) {
  const { id } = await params;

  let project;
  try {
    project = await getProject(id);
  } catch {
    notFound();
  }

  const script = readSceneScript(project);
  const clips: ClipView[] = project.clips.map((clip) => ({
    id: clip.id,
    order: clip.order,
    dialogue: clip.dialogue,
    status: clip.status,
    attempts: clip.attempts,
    lastError: clip.lastError,
    outputUrl: clip.outputUrl,
    audioUrl: clip.audioUrl,
    videoModel: clip.videoModel,
    attemptsLog: clip.attemptsLog.map((attempt) => ({
      id: attempt.id,
      attempt: attempt.attempt,
      status: attempt.status,
      error: attempt.error,
    })),
  }));

  const videoModels = Array.from(
    new Set(
      [
        ...(script?.scenes.map((scene) => scene.generation.model) ?? []),
        ...clips.map((clip) => clip.videoModel),
      ].filter(Boolean),
    ),
  );

  return (
    <main className="min-h-full">
      <ProjectHeader
        projectId={project.id}
        title={project.title}
        status={project.status}
      />
      <CanvasClient
        projectId={project.id}
        sourceLlm={project.sourceLlm}
        status={project.status}
        initialScript={script}
        clips={clips}
        joinedAudioUrl={project.joinedAudioUrl}
        videoModels={videoModels}
      />
    </main>
  );
}
