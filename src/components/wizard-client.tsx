"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatShot } from "@/lib/director-formatter";
import type { SceneScript, SceneShot } from "@/lib/scene-script";
import {
  ANGLES,
  DOFS,
  FRAMINGS,
  LENSES,
  MOVEMENTS,
  emptySceneScript,
  sortScenes,
  type CharacterOption,
  type ModuleOption,
  updateSceneShot,
  upsertSceneCharacter,
} from "@/lib/wizard-helpers";
import {
  WizardProductionSteps,
  type ClipView,
} from "@/components/wizard-production-steps";

const STEPS = [
  "LMS",
  "Script",
  "Character",
  "Director",
  "Review",
  "Generate",
  "Audio",
  "Publish",
] as const;

type WizardClientProps = {
  projectId: string;
  title: string;
  status: string;
  courseId: string | null;
  sourceLlm: string | null;
  initialScript: SceneScript | null;
  initialRawPayload: unknown;
  modules: ModuleOption[];
  characters: CharacterOption[];
  initialClips: ClipView[];
  joinedAudioUrl: string | null;
};

export function WizardClient({
  projectId,
  title,
  status,
  courseId,
  sourceLlm,
  initialScript,
  initialRawPayload,
  modules,
  characters,
  initialClips,
  joinedAudioUrl,
}: WizardClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState(courseId);
  const [source, setSource] = useState<"claude" | "chatgpt" | "grok" | "cursor">(
    (sourceLlm as "claude" | "chatgpt" | "grok" | "cursor") || "claude",
  );
  const [rawText, setRawText] = useState(
    initialRawPayload
      ? JSON.stringify(initialRawPayload, null, 2)
      : JSON.stringify(
          {
            projectId,
            beats: [
              {
                id: "beat_1",
                narration: "Paste or import an LLM script payload here.",
                camera: {
                  lens: "35mm",
                  angle: "eye-level",
                  movement: "slow push-in",
                  framing: "MCU",
                  depth_of_field: "shallow",
                },
              },
            ],
          },
          null,
          2,
        ),
  );
  const [script, setScript] = useState<SceneScript>(
    initialScript ?? emptySceneScript(projectId),
  );
  const [jsonDraft, setJsonDraft] = useState(
    JSON.stringify(initialScript ?? emptySceneScript(projectId), null, 2),
  );
  const [characterId, setCharacterId] = useState<string | null>(
    initialScript?.scenes[0]?.lecturerCharacterId ?? null,
  );

  const selectedModule = useMemo(() => {
    return modules.find((module) =>
      module.courses.some((course) => course.id === selectedCourseId),
    );
  }, [modules, selectedCourseId]);

  const selectedCharacter = characters.find((c) => c.id === characterId);

  async function patchProject(body: Record<string, unknown>) {
    setError(null);
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? "Update failed");
    }
    router.refresh();
    return data;
  }

  async function saveCourse() {
    startTransition(async () => {
      try {
        await patchProject({ courseId: selectedCourseId });
        setStep(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  async function runNormalize() {
    startTransition(async () => {
      try {
        const payload = JSON.parse(rawText) as unknown;
        const res = await fetch("/api/adapter/normalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source,
            payload: {
              ...(typeof payload === "object" && payload
                ? (payload as object)
                : {}),
              projectId,
            },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Normalize failed");
        const next = data as SceneScript;
        setScript(next);
        setJsonDraft(JSON.stringify(next, null, 2));
        await patchProject({
          sourceLlm: source,
          rawPayload: payload,
          sceneScript: next,
          status: "NORMALIZED",
        });
        setStep(2);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Normalize failed");
      }
    });
  }

  async function saveCharacter() {
    startTransition(async () => {
      try {
        const next = upsertSceneCharacter(script, characterId);
        setScript(next);
        setJsonDraft(JSON.stringify(next, null, 2));
        await patchProject({ sceneScript: next });
        setStep(3);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  async function saveDirector() {
    startTransition(async () => {
      try {
        await patchProject({ sceneScript: script });
        setJsonDraft(JSON.stringify(script, null, 2));
        setStep(4);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  async function saveReview() {
    startTransition(async () => {
      try {
        const parsed = JSON.parse(jsonDraft) as SceneScript;
        setScript(parsed);
        await patchProject({ sceneScript: parsed, status: "NORMALIZED" });
        setStep(5);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid SceneScript JSON");
      }
    });
  }

  function onShotChange(sceneId: string, patch: Partial<SceneShot>) {
    const scene = script.scenes.find((s) => s.id === sceneId);
    if (!scene) return;
    const shot = { ...scene.shot, ...patch };
    const semanticPrompt = formatShot(shot);
    const next = updateSceneShot(script, sceneId, shot, semanticPrompt);
    setScript(next);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 sm:px-10">
      <div>
        <p className="text-sm text-[var(--ink-muted)]">
          Linear Wizard · {title} · {status}
        </p>
        <ol className="mt-4 flex flex-wrap gap-2">
          {STEPS.map((label, index) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => setStep(index)}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  step === index
                    ? "bg-[var(--accent)] text-white"
                    : "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)]"
                }`}
              >
                {index + 1}. {label}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      {step === 0 ? (
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
          <h2 className="text-xl" style={{ fontFamily: "var(--font-display), serif" }}>
            Step 1 · Pick LMS module + course
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {modules.map((module) => (
              <div key={module.id} className="rounded-xl border border-[var(--line)] p-4">
                <p className="text-xs tracking-wide text-[var(--accent)] uppercase">
                  {module.code}
                </p>
                <p className="mt-1 font-medium">{module.name}</p>
                <ul className="mt-3 space-y-2">
                  {module.courses.map((course) => (
                    <li key={course.id}>
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="course"
                          checked={selectedCourseId === course.id}
                          onChange={() => setSelectedCourseId(course.id)}
                        />
                        {course.title}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-[var(--ink-muted)]">
            Selected:{" "}
            {selectedModule
              ? `${selectedModule.code} · ${selectedModule.courses.find((c) => c.id === selectedCourseId)?.title}`
              : "None"}
          </p>
          <button
            type="button"
            disabled={pending || !selectedCourseId}
            onClick={saveCourse}
            className="mt-5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            Save & continue
          </button>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
          <h2 className="text-xl" style={{ fontFamily: "var(--font-display), serif" }}>
            Step 2 · Import script
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["claude", "chatgpt", "grok", "cursor"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSource(option)}
                className={`rounded-lg px-3 py-1.5 text-sm capitalize ${
                  source === option
                    ? "bg-[var(--accent)] text-white"
                    : "border border-[var(--line)]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={16}
            className="mt-4 w-full rounded-xl border border-[var(--line)] bg-white/70 p-3 font-mono text-xs"
          />
          <button
            type="button"
            disabled={pending}
            onClick={runNormalize}
            className="mt-5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            Normalize via /api/adapter/normalize
          </button>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
          <h2 className="text-xl" style={{ fontFamily: "var(--font-display), serif" }}>
            Step 3 · Assign lecturer
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {characters.map((character) => (
              <button
                key={character.id}
                type="button"
                onClick={() => setCharacterId(character.id)}
                className={`rounded-xl border p-4 text-left ${
                  characterId === character.id
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--line)]"
                }`}
              >
                <p className="font-medium">{character.name}</p>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">
                  Soul ID · {character.soulId}
                </p>
                <p className="mt-2 text-sm text-[var(--ink-muted)]">
                  {character.description}
                </p>
                <div className="mt-3 flex gap-2">
                  {character.referenceImages.slice(0, 2).map((image) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={image.id}
                      src={image.url}
                      alt={image.kind ?? character.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs text-[var(--ink-muted)]">
                  Active LoRA:{" "}
                  {character.loraWeights.find((l) => l.isActive)?.label ?? "none"}
                </p>
              </button>
            ))}
          </div>
          {selectedCharacter ? (
            <p className="mt-4 text-sm">
              Binding <strong>{selectedCharacter.name}</strong> to all scenes.
            </p>
          ) : null}
          <button
            type="button"
            disabled={pending}
            onClick={saveCharacter}
            className="mt-5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            Save character binding
          </button>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="space-y-4">
          <h2 className="text-xl" style={{ fontFamily: "var(--font-display), serif" }}>
            Step 4 · Director options
          </h2>
          {sortScenes(script.scenes).map((scene) => (
            <div
              key={scene.id}
              className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"
            >
              <p className="text-sm font-medium">
                Scene {scene.order + 1} · {scene.id}
              </p>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">{scene.dialogue}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="text-sm">
                  Lens
                  <select
                    className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-2 py-2"
                    value={scene.shot.lens}
                    onChange={(e) =>
                      onShotChange(scene.id, {
                        lens: e.target.value as SceneShot["lens"],
                      })
                    }
                  >
                    {LENSES.map((lens) => (
                      <option key={lens} value={lens}>
                        {lens}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  Angle
                  <select
                    className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-2 py-2"
                    value={scene.shot.angle}
                    onChange={(e) =>
                      onShotChange(scene.id, {
                        angle: e.target.value as SceneShot["angle"],
                      })
                    }
                  >
                    {ANGLES.map((angle) => (
                      <option key={angle} value={angle}>
                        {angle}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  Movement
                  <select
                    className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-2 py-2"
                    value={scene.shot.movement}
                    onChange={(e) =>
                      onShotChange(scene.id, {
                        movement: e.target.value as SceneShot["movement"],
                      })
                    }
                  >
                    {MOVEMENTS.map((movement) => (
                      <option key={movement} value={movement}>
                        {movement}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  Framing
                  <select
                    className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-2 py-2"
                    value={scene.shot.framing}
                    onChange={(e) =>
                      onShotChange(scene.id, {
                        framing: e.target.value as SceneShot["framing"],
                      })
                    }
                  >
                    {FRAMINGS.map((framing) => (
                      <option key={framing} value={framing}>
                        {framing}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  Depth of field
                  <select
                    className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-2 py-2"
                    value={scene.shot.depthOfField ?? ""}
                    onChange={(e) =>
                      onShotChange(scene.id, {
                        depthOfField: (e.target.value ||
                          undefined) as SceneShot["depthOfField"],
                      })
                    }
                  >
                    <option value="">(none)</option>
                    {DOFS.map((dof) => (
                      <option key={dof} value={dof}>
                        {dof}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="mt-4 rounded-xl bg-black/5 px-3 py-2 font-mono text-xs">
                {scene.semanticPrompt ?? formatShot(scene.shot)}
              </p>
            </div>
          ))}
          <button
            type="button"
            disabled={pending || script.scenes.length === 0}
            onClick={saveDirector}
            className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            Save director options
          </button>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <h2 className="text-xl" style={{ fontFamily: "var(--font-display), serif" }}>
              Step 5 · Form view
            </h2>
            <ul className="mt-4 space-y-3">
              {sortScenes(script.scenes).map((scene) => (
                <li key={scene.id} className="rounded-xl border border-[var(--line)] p-3 text-sm">
                  <p className="font-medium">
                    #{scene.order + 1} {scene.id}
                  </p>
                  <p className="mt-1 text-[var(--ink-muted)]">{scene.dialogue}</p>
                  <p className="mt-2 font-mono text-xs">{scene.semanticPrompt}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <h2 className="text-xl" style={{ fontFamily: "var(--font-display), serif" }}>
              Editable JSON
            </h2>
            <textarea
              value={jsonDraft}
              onChange={(e) => setJsonDraft(e.target.value)}
              rows={22}
              className="mt-4 w-full rounded-xl border border-[var(--line)] bg-white/70 p-3 font-mono text-xs"
            />
            <button
              type="button"
              disabled={pending}
              onClick={saveReview}
              className="mt-4 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              Save SceneScript & continue
            </button>
          </div>
        </section>
      ) : null}

      {step >= 5 ? (
        <WizardProductionSteps
          key={`${projectId}-${status}-${initialClips.map((c) => `${c.id}:${c.status}:${c.attempts}`).join("|")}-${joinedAudioUrl ?? ""}`}
          projectId={projectId}
          step={step}
          initialClips={initialClips}
          joinedAudioUrl={joinedAudioUrl}
          onError={setError}
        />
      ) : null}
    </div>
  );
}
