"use client";

import { useEffect, useState } from "react";
import { MediaPlayer } from "@/components/media/media-player";
import {
  getMediaBlob,
  isLocalMediaRef,
  localMediaId,
} from "@/lib/media-storage";

export function ResolvingMediaPlayer({
  src,
  poster,
  title,
  kind = "video",
}: {
  src: string;
  poster?: string;
  title: string;
  kind?: "video" | "audio" | "live";
}) {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(
    isLocalMediaRef(src) ? null : src
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function resolve() {
      setError(null);
      if (!isLocalMediaRef(src)) {
        setResolvedSrc(src);
        return;
      }

      setResolvedSrc(null);
      try {
        const blob = await getMediaBlob(localMediaId(src));
        if (!blob) {
          if (!cancelled) setError("Uploaded media not found in this browser.");
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setResolvedSrc(objectUrl);
      } catch {
        if (!cancelled) setError("Could not load uploaded media.");
      }
    }

    void resolve();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (error) {
    return (
      <div className="rounded-xl border border-line bg-mist/50 p-6 text-sm text-ink-soft">
        {error}
      </div>
    );
  }

  if (!resolvedSrc) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border border-line bg-ink text-sm text-cloud/80">
        Loading media…
      </div>
    );
  }

  return (
    <MediaPlayer src={resolvedSrc} poster={poster} title={title} kind={kind} />
  );
}
