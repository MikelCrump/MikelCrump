# Crump Studio MCP

Internal agents can drive Crump Studio through the Model Context Protocol.

## Transports

| Transport | How |
| --- | --- |
| **stdio** (local agents) | `pnpm mcp` |
| **HTTP bridge** (serverless) | `POST/GET/DELETE /api/mcp` — Streamable HTTP, JSON responses, stateless |

Tools reuse the same service layer as the REST routes (`src/server/services/*`). No duplicated business logic.

## Tools

| Tool | Args | Behavior |
| --- | --- | --- |
| `list_characters` | — | CharacterProfile[] with refs + LoRAs |
| `create_project` | `title`, optional `moduleId`, `courseId` | `{ projectId }` |
| `push_scene` | `projectId`, `scenePrompt`, `cameraSettings`, optional `characterId` | Appends scene, runs `formatShot`, returns scene |
| `generate_clip` | `projectId`, `sceneId`, optional `model` | Same path as `POST /api/generate` |
| `get_project_status` | `projectId` | Status + per-clip ClipStatus |

`cameraSettings` matches SceneScript shot fields: `lens`, `focalLengthMm`, `angle`, `movement`, `framing`, optional `depthOfField`.

## Example agent call (HTTP)

Initialize (JSON-RPC over Streamable HTTP):

```bash
curl -s http://localhost:3000/api/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": { "name": "docs-agent", "version": "0.0.1" }
    }
  }'
```

Create a project + push a scene (tool call shape):

```bash
curl -s http://localhost:3000/api/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "create_project",
      "arguments": {
        "title": "MCP demo — Ambiguity intro"
      }
    }
  }'
```

Then `push_scene`:

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "push_scene",
    "arguments": {
      "projectId": "PROJECT_ID_FROM_CREATE",
      "scenePrompt": "Ambiguity is not the enemy of leadership — avoidance is.",
      "cameraSettings": {
        "lens": "35mm",
        "focalLengthMm": 35,
        "angle": "eye-level",
        "movement": "slow push-in",
        "framing": "MCU",
        "depthOfField": "shallow"
      }
    }
  }
}
```

## Example Cursor / Claude Desktop (stdio)

```json
{
  "mcpServers": {
    "crump-studio": {
      "command": "pnpm",
      "args": ["mcp"],
      "cwd": "/absolute/path/to/crump-studio",
      "env": {
        "DATABASE_URL": "postgresql://crump:crump@localhost:5432/crump_studio?schema=public",
        "VIDEO_PROVIDER": "mock",
        "AUDIO_PROVIDER": "mock"
      }
    }
  }
}
```

## Notes

- Keep `VIDEO_PROVIDER=mock` until real API keys are plugged in.
- Long jobs stay poll-based (`generate_clip` queues; agents should call `get_project_status` or REST `GET /api/generate/:clipId`).
