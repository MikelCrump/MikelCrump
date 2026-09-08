"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type ClipAttemptView = {
  id: string;
  attempt: number;
  status: string;
  error: string | null;
};

export type ClipView = {
  id: string;
  order: number;
  dialogue: string;
  status: string;
  attempts: number;
  lastError: string | null;
  outputUrl: string | null;
  audioUrl: string | null;
  videoModel: string;
  attemptsLog: ClipAttemptView[];
};

type WizardProductionStepsProps = {
  projectId: string;
  step: number;
  initialClips: ClipView[];
  joinedAudioUrl: string | null;
  onError: (message: string | null) => void;
};

function normalizeClips(clips: ClipView[]): ClipView[] {
  return clips.map((clip) => ({
    ...clip,
    attemptsLog: clip.attemptsLog ?? [],
  }));
}

export function WizardProductionSteps({
  projectId,
  step,
  initialClips,
  joinedAudioUrl,
  onError,
}: WizardProductionStepsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [clips, setClips] = useState(() => normalizeClips(initialClips));
  const [joinedUrl, setJoinedUrl] = useState(joinedAudioUrl);

  const refreshClip = useCallback(async (clipId: string) => {
    const res = await fetch(`/api/generate/${clipId}`);
    const data = await res.json();
    if (!res.ok) return null;
    return data as ClipView;
  }, []);

  useEffect(() => {
    if (step !== 5) return;
    const openIds = clips
      .filter((clip) => clip.status === "QUEUED" || clip.status === "RUNNING")
      .map((clip) => clip.id);
    if (openIds.length === 0) return;

    const timer = setInterval(() => {
      void (async () => {
        const updates = await Promise.all(openIds.map((id) => refreshClip(id)));
        setClips((prev) =>
          prev.map((clip) => {
            const updated = updates.find((item) => item?.id === clip.id);
            return updated ? { ...clip, ...normalizeClips([updated])[0] } : clip;
          }),
        );
        router.refresh();
      })();
    }, 1200);

    return () => clearInterval(timer);
  }, [clips, refreshClip, router, step]);

  function generate(sceneId?: string) {
    startTransition(async () => {
      onError(null);
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, sceneId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Generate failed");
        const next = normalizeClips(data.clips as ClipView[]);
        if (sceneId) {
          setClips((prev) => {
            const map = new Map(next.map((clip) => [clip.order, clip]));
            const merged = prev.map((clip) => map.get(clip.order) ?? clip);
            for (const clip of next) {
              if (!merged.some((item) => item.id === clip.id)) merged.push(clip);
            }
            return merged.sort((a, b) => a.order - b.order);
          });
        } else {
          setClips(next);
        }
        router.refresh();
      } catch (error) {
        onError(error instanceof Error ? error.message : "Generate failed");
      }
    });
  }

  function retryClip(clip: ClipView) {
    startTransition(async () => {
      onError(null);
      try {
        const projectRes = await fetch(`/api/projects/${projectId}`);
        const project = await projectRes.json();
        if (!projectRes.ok) throw new Error(project.error ?? "Load project failed");
        const scene = project.sceneScript?.scenes?.find(
          (item: { order: number; id: string }) => item.order === clip.order,
        );
        if (!scene?.id) throw new Error("Could not resolve scene for retry");

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, sceneId: scene.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Retry failed");
        const next = normalizeClips(data.clips as ClipView[]);
        setClips((prev) => {
          const map = new Map(next.map((item) => [item.order, item]));
          return prev.map((item) => map.get(item.order) ?? item);
        });
        router.refresh();
      } catch (error) {
        onError(error instanceof Error ? error.message : "Retry failed");
      }
    });
  }

  function synthesize() {
    startTransition(async () => {
      onError(null);
      try {
        const res = await fetch("/api/audio/synthesize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Synthesize failed");
        setClips(normalizeClips(data.clips as ClipView[]));
        router.refresh();
      } catch (error) {
        onError(error instanceof Error ? error.message : "Synthesize failed");
      }
    });
  }

  function joinAudio() {
    startTransition(async () => {
      onError(null);
      try {
        const res = await fetch("/api/audio/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Join failed");
        setJoinedUrl(data.joinedAudioUrl);
        router.refresh();
      } catch (error) {
        onError(error instanceof Error ? error.message : "Join failed");
      }
    });
  }

  function publish() {
    startTransition(async () => {
      onError(null);
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "PUBLISHED" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Publish failed");
        router.refresh();
      } catch (error) {
        onError(error instanceof Error ? error.message : "Publish failed");
      }
    });
  }

  if (step === 5) {
    const polling = clips.some(
      (clip) => clip.status === "QUEUED" || clip.status === "RUNNING",
    );
    return (
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl" style={{ fontFamily: "var(--font-display), serif" }}>
            Step 6 · Generate clips
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => generate()}
              className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              Generate all
            </button>
            {polling ? (
              <span className="text-xs text-[var(--ink-muted)]">Polling…</span>
            ) : null}
          </div>
        </div>

        {clips.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-4 py-8 text-sm text-[var(--ink-muted)]">
            No clips yet. Normalize a script first, then generate.
          </p>
        ) : (
          <ul className="space-y-3">
            {clips.map((clip) => (
              <li
                key={clip.id}
                className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      Clip #{clip.order + 1} · {clip.status}
                    </p>
                    <p className="mt-1 text-sm text-[var(--ink-muted)]">{clip.dialogue}</p>
                    <p className="mt-1 text-xs text-[var(--ink-muted)]">
                      Model {clip.videoModel} · attempts {clip.attempts}
                    </p>
                    {clip.lastError ? (
                      <p className="mt-2 text-sm text-[var(--danger)]">{clip.lastError}</p>
                    ) : null}
                    {clip.outputUrl ? (
                      <a
                        href={clip.outputUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-sm text-[var(--accent)] underline"
                      >
                        Open output
                      </a>
                    ) : null}
                  </div>
                  {(clip.status === "FAILED" || clip.status === "SUCCEEDED") && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => retryClip(clip)}
                      className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm"
                    >
                      Retry
                    </button>
                  )}
                </div>
                {clip.attemptsLog.length > 0 ? (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs text-[var(--ink-muted)]">
                      Attempt log ({clip.attemptsLog.length})
                    </summary>
                    <ul className="mt-2 space-y-1 font-mono text-xs">
                      {clip.attemptsLog.map((attempt) => (
                        <li key={attempt.id}>
                          #{attempt.attempt} {attempt.status}
                          {attempt.error ? ` — ${attempt.error}` : ""}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  if (step === 6) {
    return (
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
        <h2 className="text-xl" style={{ fontFamily: "var(--font-display), serif" }}>
          Step 7 · Synthesize + join audio
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={synthesize}
            className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            Synthesize per scene
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={joinAudio}
            className="rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm disabled:opacity-50"
          >
            Join audio track
          </button>
        </div>
        <ul className="mt-5 space-y-2 text-sm">
          {clips.map((clip) => (
            <li
              key={clip.id}
              className="flex justify-between gap-3 border-b border-[var(--line)] py-2"
            >
              <span>
                #{clip.order + 1} {clip.dialogue.slice(0, 64)}
              </span>
              <span className="text-[var(--ink-muted)]">
                {clip.audioUrl ? "audio ready" : "no audio"}
              </span>
            </li>
          ))}
        </ul>
        {joinedUrl ? (
          <p className="mt-4 text-sm">
            Joined track:{" "}
            <a
              href={joinedUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--accent)] underline"
            >
              open
            </a>
          </p>
        ) : null}
      </section>
    );
  }

  if (step === 7) {
    return (
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
        <h2 className="text-xl" style={{ fontFamily: "var(--font-display), serif" }}>
          Step 8 · Publish
        </h2>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          Marks the VideoProject as PUBLISHED. Clips and joined audio remain on
          the shared record for Canvas mode.
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={publish}
          className="mt-5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Mark PUBLISHED
        </button>
      </section>
    );
  }

  return null;
}
