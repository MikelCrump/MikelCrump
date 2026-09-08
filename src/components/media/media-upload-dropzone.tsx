"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Film, FolderOpen, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteMediaFile,
  formatBytes,
  getMediaMeta,
  isLocalMediaRef,
  localMediaId,
  saveMediaFile,
  type StoredMediaMeta,
} from "@/lib/media-storage";
import { cn } from "@/lib/utils";

const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime,video/*,audio/mp3,audio/mpeg,audio/wav,audio/*";

export function MediaUploadDropzone({
  value,
  onChange,
  label = "Lesson video",
  className,
}: {
  value?: string;
  onChange: (next?: string) => void;
  label?: string;
  className?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<StoredMediaMeta | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!value || !isLocalMediaRef(value)) {
        setMeta(null);
        return;
      }
      const info = await getMediaMeta(localMediaId(value));
      if (!cancelled) setMeta(info);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [value]);

  const handleFiles = async (files: FileList | File[] | null) => {
    const file = files?.[0];
    if (!file) return;

    const isMedia =
      file.type.startsWith("video/") ||
      file.type.startsWith("audio/") ||
      /\.(mp4|webm|mov|m4v|mp3|wav|ogg)$/i.test(file.name);

    if (!isMedia) {
      setError("Please choose a video or audio file.");
      return;
    }

    // Soft guard for browser storage limits
    if (file.size > 200 * 1024 * 1024) {
      setError("Please keep uploads under 200MB for this demo storage.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      if (value && isLocalMediaRef(value)) {
        await deleteMediaFile(localMediaId(value));
      }
      const saved = await saveMediaFile(file);
      setMeta(saved);
      onChange(`idb:${saved.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const clearFile = async () => {
    if (value && isLocalMediaRef(value)) {
      await deleteMediaFile(localMediaId(value));
    }
    setMeta(null);
    onChange(undefined);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-ink">{label}</p>

      <div
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-xl border border-dashed px-4 py-8 text-center transition-colors",
          dragging
            ? "border-sea bg-sea/10"
            : "border-line bg-mist/40 hover:border-ink/30 hover:bg-mist/70"
        )}
      >
        <Upload className="mx-auto h-7 w-7 text-sea" strokeWidth={1.5} />
        <p className="mt-3 text-sm font-medium text-ink">
          Drag & drop a video here
        </p>
        <p className="mt-1 text-xs text-ink-soft">
          MP4, WebM, MOV, or audio · opens your folders via Choose file
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={VIDEO_ACCEPT}
            className="sr-only"
            onChange={(e) => void handleFiles(e.target.files)}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <FolderOpen className="h-4 w-4" />
            {busy ? "Uploading…" : "Choose file"}
          </Button>
        </div>
      </div>

      {meta ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-cloud px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <Film className="h-4 w-4 shrink-0 text-sea" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{meta.name}</p>
              <p className="text-xs text-ink-soft">
                {meta.type || "media"} · {formatBytes(meta.size)}
              </p>
            </div>
          </div>
          <Button type="button" size="icon" variant="ghost" onClick={() => void clearFile()}>
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
        </div>
      ) : value && !isLocalMediaRef(value) ? (
        <p className="truncate text-xs text-ink-soft">Linked URL: {value}</p>
      ) : null}

      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
