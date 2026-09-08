import { notFound } from "next/navigation";
import { ProjectHeader } from "@/components/project-header";
import { WizardClient } from "@/components/wizard-client";
import type { ClipView } from "@/components/wizard-production-steps";
import {
  getProject,
  listCharacters,
  listLmsCatalog,
  readSceneScript,
} from "@/server/services/project-service";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function WizardPage({ params }: PageProps) {
  const { id } = await params;

  let project;
  try {
    project = await getProject(id);
  } catch {
    notFound();
  }

  const [modules, characters] = await Promise.all([
    listLmsCatalog(),
    listCharacters(),
  ]);

  const initialClips: ClipView[] = project.clips.map((clip) => ({
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

  return (
    <main className="min-h-full">
      <ProjectHeader
        projectId={project.id}
        title={project.title}
        status={project.status}
      />
      <WizardClient
        projectId={project.id}
        title={project.title}
        status={project.status}
        courseId={project.courseId}
        sourceLlm={project.sourceLlm}
        initialScript={readSceneScript(project)}
        initialRawPayload={project.rawPayload}
        modules={modules}
        characters={characters}
        initialClips={initialClips}
        joinedAudioUrl={project.joinedAudioUrl}
      />
    </main>
  );
}
