"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  Handle,
  Position,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useRouter } from "next/navigation";
import { formatShot } from "@/lib/director-formatter";
import type { SceneScript } from "@/lib/scene-script";
import type { ClipView } from "@/components/wizard-production-steps";

type CanvasProps = {
  projectId: string;
  sourceLlm: string | null;
  status: string;
  initialScript: SceneScript | null;
  clips: ClipView[];
  joinedAudioUrl: string | null;
  videoModels: string[];
};

type StatusTone = "idle" | "queued" | "running" | "succeeded" | "failed";

function toneFromClips(clips: ClipView[]): StatusTone {
  if (clips.some((c) => c.status === "FAILED")) return "failed";
  if (clips.some((c) => c.status === "RUNNING")) return "running";
  if (clips.some((c) => c.status === "QUEUED")) return "queued";
  if (clips.length > 0 && clips.every((c) => c.status === "SUCCEEDED")) {
    return "succeeded";
  }
  return "idle";
}

function toneClass(tone: StatusTone) {
  switch (tone) {
    case "succeeded":
      return "border-[var(--accent)] bg-[var(--accent-soft)]";
    case "failed":
      return "border-red-300 bg-red-50";
    case "running":
      return "border-amber-300 bg-amber-50";
    case "queued":
      return "border-sky-300 bg-sky-50";
    default:
      return "border-[var(--line)] bg-[var(--surface)]";
  }
}

type StudioNodeData = {
  label: string;
  detail: string;
  tone: StatusTone;
  editable?: boolean;
  sceneId?: string;
  dialogue?: string;
  semanticPrompt?: string;
};

function StudioNode({ data }: NodeProps) {
  const nodeData = data as StudioNodeData;
  return (
    <div
      className={`min-w-[200px] max-w-[260px] rounded-xl border px-3 py-2 shadow-sm ${toneClass(nodeData.tone)}`}
    >
      <Handle type="target" position={Position.Left} className="!bg-[var(--accent)]" />
      <p className="text-xs tracking-wide text-[var(--ink-muted)] uppercase">
        {nodeData.label}
      </p>
      <p className="mt-1 text-sm font-medium">{nodeData.detail}</p>
      {nodeData.semanticPrompt ? (
        <p className="mt-2 line-clamp-3 font-mono text-[10px] text-[var(--ink-muted)]">
          {nodeData.semanticPrompt}
        </p>
      ) : null}
      <Handle type="source" position={Position.Right} className="!bg-[var(--accent)]" />
    </div>
  );
}

const nodeTypes = { studio: StudioNode };

export function CanvasClient({
  projectId,
  sourceLlm,
  status,
  initialScript,
  clips,
  joinedAudioUrl,
  videoModels,
}: CanvasProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [script, setScript] = useState<SceneScript | null>(initialScript);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(
    initialScript?.scenes[0]?.id ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const clipTone = toneFromClips(clips);

  const { nodes, edges } = useMemo(() => {
    const models =
      videoModels.length > 0
        ? videoModels
        : Array.from(new Set(clips.map((c) => c.videoModel).filter(Boolean)));
    const forgeModels = models.length > 0 ? models : ["mock-v1"];

    const nextNodes: Node[] = [
      {
        id: "script",
        type: "studio",
        position: { x: 0, y: 120 },
        data: {
          label: "Script Source",
          detail: sourceLlm ?? "unassigned",
          tone: script ? "succeeded" : "idle",
        },
      },
      {
        id: "adapter",
        type: "studio",
        position: { x: 240, y: 120 },
        data: {
          label: "Adapter / Normalizer",
          detail: script ? `${script.scenes.length} scenes` : "waiting",
          tone: script ? "succeeded" : "idle",
        },
      },
      {
        id: "character",
        type: "studio",
        position: { x: 480, y: 40 },
        data: {
          label: "Character Binding",
          detail:
            script?.scenes[0]?.lecturerCharacterId ??
            "no character bound",
          tone: script?.scenes[0]?.lecturerCharacterId ? "succeeded" : "idle",
        },
      },
      {
        id: "director",
        type: "studio",
        position: { x: 480, y: 200 },
        data: {
          label: "Director Formatter",
          detail: selectedSceneId
            ? `editing ${selectedSceneId}`
            : "select a scene",
          tone: script ? "succeeded" : "idle",
          semanticPrompt: script?.scenes.find((s) => s.id === selectedSceneId)
            ?.semanticPrompt,
        },
      },
      ...forgeModels.map((model, index) => ({
        id: `forge-${model}`,
        type: "studio",
        position: { x: 760, y: 40 + index * 110 },
        data: {
          label: "Generation Forge",
          detail: model,
          tone: clipTone,
        },
      })),
      {
        id: "audio",
        type: "studio",
        position: { x: 1040, y: 80 },
        data: {
          label: "Audio (ElevenLabs / Mock)",
          detail: clips.some((c) => c.audioUrl)
            ? "scene audio ready"
            : "not synthesized",
          tone: clips.some((c) => c.audioUrl) ? "succeeded" : "idle",
        },
      },
      {
        id: "joiner",
        type: "studio",
        position: { x: 1280, y: 80 },
        data: {
          label: "Audio Joiner",
          detail: joinedAudioUrl ? "joined track ready" : "waiting",
          tone: joinedAudioUrl ? "succeeded" : "idle",
        },
      },
      {
        id: "output",
        type: "studio",
        position: { x: 1520, y: 120 },
        data: {
          label: "Output",
          detail: status,
          tone:
            status === "PUBLISHED"
              ? "succeeded"
              : status === "GENERATING"
                ? "running"
                : "idle",
        },
      },
    ];

    const statusEdge = (id: string, source: string, target: string): Edge => ({
      id,
      source,
      target,
      animated: clipTone === "running" || clipTone === "queued",
      style: {
        stroke:
          clipTone === "failed"
            ? "#9b2c2c"
            : clipTone === "succeeded"
              ? "#0f6b5c"
              : "#8a7f6d",
      },
      label: clipTone === "idle" ? undefined : clipTone,
    });

    const nextEdges: Edge[] = [
      statusEdge("e1", "script", "adapter"),
      statusEdge("e2", "adapter", "character"),
      statusEdge("e3", "adapter", "director"),
      ...forgeModels.map((model) =>
        statusEdge(`e-dir-${model}`, "director", `forge-${model}`),
      ),
      ...forgeModels.map((model) =>
        statusEdge(`e-char-${model}`, "character", `forge-${model}`),
      ),
      ...forgeModels.map((model) =>
        statusEdge(`e-forge-${model}`, `forge-${model}`, "audio"),
      ),
      statusEdge("e7", "audio", "joiner"),
      statusEdge("e8", "joiner", "output"),
    ];

    return { nodes: nextNodes, edges: nextEdges };
  }, [
    clipTone,
    clips,
    joinedAudioUrl,
    script,
    selectedSceneId,
    sourceLlm,
    status,
    videoModels,
  ]);

  const selectedScene = script?.scenes.find((scene) => scene.id === selectedSceneId);

  const saveScript = useCallback(
    (next: SceneScript) => {
      startTransition(async () => {
        setError(null);
        try {
          const res = await fetch(`/api/projects/${projectId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sceneScript: next }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Save failed");
          setScript(data.sceneScript);
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Save failed");
        }
      });
    },
    [projectId, router],
  );

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            className="text-2xl"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            Visual Canvas
          </h2>
          <p className="text-sm text-[var(--ink-muted)]">
            Shared VideoProject graph — edits write back to the same sceneScript
            the wizard reads.
          </p>
        </div>
        {pending ? (
          <span className="text-xs text-[var(--ink-muted)]">Saving…</span>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <div className="h-[520px] overflow-hidden rounded-2xl border border-[var(--line)] bg-[#f7f3ea]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          onNodeClick={(_event, node) => {
            if (node.id === "director" && script?.scenes[0]) {
              setSelectedSceneId(script.scenes[0].id);
            }
          }}
        >
          <Background gap={18} color="#d9d0bf" />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <h3 className="font-medium">Edit scene (writes sceneScript)</h3>
        {!script || script.scenes.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            No SceneScript yet — run the wizard import step first.
          </p>
        ) : (
          <div className="mt-3 grid gap-4 lg:grid-cols-[200px_1fr]">
            <ul className="space-y-1">
              {script.scenes.map((scene) => (
                <li key={scene.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedSceneId(scene.id)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                      selectedSceneId === scene.id
                        ? "bg-[var(--accent)] text-white"
                        : "border border-[var(--line)]"
                    }`}
                  >
                    #{scene.order + 1} {scene.id}
                  </button>
                </li>
              ))}
            </ul>
            {selectedScene ? (
              <div className="space-y-3">
                <label className="block text-sm">
                  Dialogue
                  <textarea
                    className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white/70 p-3 text-sm"
                    rows={4}
                    value={selectedScene.dialogue}
                    onChange={(event) => {
                      if (!script) return;
                      const next: SceneScript = {
                        ...script,
                        scenes: script.scenes.map((scene) =>
                          scene.id === selectedScene.id
                            ? { ...scene, dialogue: event.target.value }
                            : scene,
                        ),
                      };
                      setScript(next);
                    }}
                  />
                </label>
                <label className="block text-sm">
                  Movement
                  <select
                    className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
                    value={selectedScene.shot.movement}
                    onChange={(event) => {
                      if (!script) return;
                      const shot = {
                        ...selectedScene.shot,
                        movement: event.target
                          .value as typeof selectedScene.shot.movement,
                      };
                      const next: SceneScript = {
                        ...script,
                        scenes: script.scenes.map((scene) =>
                          scene.id === selectedScene.id
                            ? {
                                ...scene,
                                shot,
                                semanticPrompt: formatShot(shot),
                              }
                            : scene,
                        ),
                      };
                      setScript(next);
                    }}
                  >
                    {[
                      "static",
                      "slow push-in",
                      "pull-out",
                      "pan-left",
                      "pan-right",
                      "handheld",
                      "orbit",
                    ].map((movement) => (
                      <option key={movement} value={movement}>
                        {movement}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="rounded-xl bg-black/5 px-3 py-2 font-mono text-xs">
                  {selectedScene.semanticPrompt ?? formatShot(selectedScene.shot)}
                </p>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => script && saveScript(script)}
                  className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  Save to shared sceneScript
                </button>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
