import { z } from "zod";
import type { Prisma, ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { normalizeAdapterPayload } from "@/server/services/adapter-service";
import {
  SceneScriptSchema,
  type SceneScript,
} from "@/lib/scene-script";
import { formatShot } from "@/lib/director-formatter";

export const CreateProjectSchema = z.object({
  title: z.string().min(1),
  courseId: z.string().optional(),
  ownerId: z.string().optional(),
  source: z.enum(["claude", "chatgpt", "grok", "cursor"]).optional(),
  payload: z.unknown().optional(),
});

export const UpdateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  courseId: z.string().nullable().optional(),
  status: z
    .enum([
      "DRAFT",
      "NORMALIZED",
      "GENERATING",
      "AUDIO",
      "REVIEW",
      "PUBLISHED",
    ])
    .optional(),
  sourceLlm: z.enum(["claude", "chatgpt", "grok", "cursor"]).nullable().optional(),
  rawPayload: z.unknown().optional(),
  sceneScript: SceneScriptSchema.optional(),
  joinedAudioUrl: z.string().nullable().optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

const projectInclude = {
  owner: true,
  course: { include: { module: true } },
  clips: {
    orderBy: { order: "asc" as const },
    include: {
      character: true,
      attemptsLog: { orderBy: { attempt: "asc" as const } },
    },
  },
} satisfies Prisma.VideoProjectInclude;

export type ProjectDetail = Prisma.VideoProjectGetPayload<{
  include: typeof projectInclude;
}>;

async function resolveOwnerId(ownerId?: string) {
  if (ownerId) return ownerId;
  const owner = await prisma.teamMember.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (!owner) {
    throw new Error("No team member found. Run pnpm db:seed first.");
  }
  return owner.id;
}

function withResolvedSemanticPrompts(script: SceneScript): SceneScript {
  return {
    ...script,
    scenes: script.scenes.map((scene) => ({
      ...scene,
      semanticPrompt: scene.semanticPrompt ?? formatShot(scene.shot),
    })),
  };
}

export async function listProjects() {
  return prisma.videoProject.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      owner: true,
      course: { include: { module: true } },
      _count: { select: { clips: true } },
    },
  });
}

export async function getProject(projectId: string): Promise<ProjectDetail> {
  const project = await prisma.videoProject.findUnique({
    where: { id: projectId },
    include: projectInclude,
  });
  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }
  return project;
}

export async function createProject(input: CreateProjectInput) {
  const ownerId = await resolveOwnerId(input.ownerId);

  const project = await prisma.videoProject.create({
    data: {
      title: input.title,
      ownerId,
      courseId: input.courseId,
      status: "DRAFT",
      sourceLlm: input.source,
      rawPayload:
        input.payload === undefined
          ? undefined
          : (input.payload as Prisma.InputJsonValue),
    },
  });

  if (input.source && input.payload !== undefined) {
    const sceneScript = withResolvedSemanticPrompts(
      normalizeAdapterPayload({
        source: input.source,
        payload: {
          ...(typeof input.payload === "object" && input.payload
            ? (input.payload as Record<string, unknown>)
            : {}),
          projectId: project.id,
        },
      }),
    );

    return prisma.videoProject.update({
      where: { id: project.id },
      data: {
        sceneScript: sceneScript as unknown as Prisma.InputJsonValue,
        status: "NORMALIZED",
        sourceLlm: input.source,
        rawPayload: input.payload as Prisma.InputJsonValue,
      },
      include: projectInclude,
    });
  }

  return getProject(project.id);
}

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput,
) {
  await getProject(projectId);

  const data: Prisma.VideoProjectUpdateInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.status !== undefined) data.status = input.status as ProjectStatus;
  if (input.sourceLlm !== undefined) data.sourceLlm = input.sourceLlm;
  if (input.joinedAudioUrl !== undefined) {
    data.joinedAudioUrl = input.joinedAudioUrl;
  }
  if (input.courseId !== undefined) {
    data.course =
      input.courseId === null
        ? { disconnect: true }
        : { connect: { id: input.courseId } };
  }
  if (input.rawPayload !== undefined) {
    data.rawPayload = input.rawPayload as Prisma.InputJsonValue;
  }
  if (input.sceneScript !== undefined) {
    const script = withResolvedSemanticPrompts({
      ...input.sceneScript,
      projectId,
    });
    data.sceneScript = script as unknown as Prisma.InputJsonValue;
    if (!input.status) {
      data.status = "NORMALIZED";
    }
  }

  return prisma.videoProject.update({
    where: { id: projectId },
    data,
    include: projectInclude,
  });
}

export async function listLmsCatalog() {
  return prisma.lmsModule.findMany({
    orderBy: { code: "asc" },
    include: { courses: { orderBy: { title: "asc" } } },
  });
}

export async function listCharacters() {
  return prisma.characterProfile.findMany({
    orderBy: { name: "asc" },
    include: {
      referenceImages: true,
      loraWeights: true,
    },
  });
}

export function readSceneScript(
  project: Pick<ProjectDetail, "id" | "sceneScript">,
): SceneScript | null {
  if (!project.sceneScript) return null;
  const parsed = SceneScriptSchema.safeParse(project.sceneScript);
  if (!parsed.success) return null;
  return { ...parsed.data, projectId: project.id };
}
