import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  CameraAngleSchema,
  CameraMovementSchema,
  DepthOfFieldSchema,
  LensSchema,
  ShotFramingSchema,
} from "@/lib/scene-script";
import {
  mcpCreateProject,
  mcpGenerateClip,
  mcpGetProjectStatus,
  mcpListCharacters,
  mcpPushScene,
} from "@/server/services/mcp-tools";

function textResult(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function createCrumpMcpServer() {
  const server = new McpServer({
    name: "crump-studio",
    version: "0.1.0",
  });

  server.registerTool(
    "list_characters",
    {
      title: "List Characters",
      description: "List CharacterProfile records (Soul ID, refs, LoRAs).",
      inputSchema: {},
    },
    async () => textResult(await mcpListCharacters()),
  );

  server.registerTool(
    "create_project",
    {
      title: "Create Project",
      description: "Create a VideoProject. Optionally link LMS module/course.",
      inputSchema: {
        title: z.string().describe("Project title"),
        moduleId: z.string().optional().describe("LMS module id"),
        courseId: z.string().optional().describe("Course id"),
      },
    },
    async ({ title, moduleId, courseId }) =>
      textResult(await mcpCreateProject({ title, moduleId, courseId })),
  );

  server.registerTool(
    "push_scene",
    {
      title: "Push Scene",
      description:
        "Append a scene to project sceneScript, run Director Option Formatter, return the scene.",
      inputSchema: {
        projectId: z.string(),
        scenePrompt: z.string().describe("Dialogue / scene prompt text"),
        cameraSettings: z.object({
          lens: LensSchema,
          focalLengthMm: z.number().positive(),
          angle: CameraAngleSchema,
          movement: CameraMovementSchema,
          framing: ShotFramingSchema,
          depthOfField: DepthOfFieldSchema.optional(),
        }),
        characterId: z.string().optional(),
      },
    },
    async (args) => textResult(await mcpPushScene(args)),
  );

  server.registerTool(
    "generate_clip",
    {
      title: "Generate Clip",
      description: "Same path as POST /api/generate for one scene.",
      inputSchema: {
        projectId: z.string(),
        sceneId: z.string(),
        model: z.string().optional(),
      },
    },
    async ({ projectId, sceneId, model }) =>
      textResult(await mcpGenerateClip({ projectId, sceneId, model })),
  );

  server.registerTool(
    "get_project_status",
    {
      title: "Get Project Status",
      description: "Project status plus per-clip ClipStatus.",
      inputSchema: {
        projectId: z.string(),
      },
    },
    async ({ projectId }) => textResult(await mcpGetProjectStatus(projectId)),
  );

  return server;
}
