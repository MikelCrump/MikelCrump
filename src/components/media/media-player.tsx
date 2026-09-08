"use client";

import { useEffect, useRef, useState } from "react";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MediaPlayer({
  src,
  poster,
  title,
  kind = "video",
  className,
}: {
  src: string;
  poster?: string;
  title: string;
  kind?: "video" | "audio" | "live";
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [hovering, setHovering] = useState(true);

  const isAudio = kind === "audio";

  const getMedia = () => (isAudio ? audioRef.current : videoRef.current);

  useEffect(() => {
    const media = getMedia();
    if (!media) return;

    const onTime = () => setCurrent(media.currentTime);
    const onMeta = () => setDuration(media.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);

    media.addEventListener("timeupdate", onTime);
    media.addEventListener("loadedmetadata", onMeta);
    media.addEventListener("durationchange", onMeta);
    media.addEventListener("play", onPlay);
    media.addEventListener("pause", onPause);
    media.addEventListener("ended", onEnded);

    return () => {
      media.removeEventListener("timeupdate", onTime);
      media.removeEventListener("loadedmetadata", onMeta);
      media.removeEventListener("durationchange", onMeta);
      media.removeEventListener("play", onPlay);
      media.removeEventListener("pause", onPause);
      media.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, isAudio]);

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const togglePlay = async () => {
    const media = getMedia();
    if (!media) return;
    if (media.paused) await media.play();
    else media.pause();
  };

  const seek = (value: number) => {
    const media = getMedia();
    if (!media) return;
    media.currentTime = value;
    setCurrent(value);
  };

  const toggleMute = () => {
    const media = getMedia();
    if (!media) return;
    media.muted = !media.muted;
    setMuted(media.muted);
  };

  const cycleRate = () => {
    const media = getMedia();
    if (!media) return;
    const next = rate === 1 ? 1.25 : rate === 1.25 ? 1.5 : rate === 1.5 ? 2 : 1;
    media.playbackRate = next;
    setRate(next);
  };

  const toggleFullscreen = async () => {
    const shell = shellRef.current;
    if (!shell) return;
    if (!document.fullscreenElement) await shell.requestFullscreen();
    else await document.exitFullscreen();
  };

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div
      ref={shellRef}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-navy/40 bg-navy text-cloud shadow-[0_20px_50px_-28px_rgba(25,26,33,0.65)]",
        className
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(playing ? false : true)}
    >
      {isAudio ? (
        <div className="relative flex min-h-[240px] flex-col justify-end bg-gradient-to-br from-navy via-[#1a1f3a] to-blue p-6 md:p-8">
          <audio ref={audioRef} src={src} preload="metadata" />
          <p className="relative z-10 text-xs font-bold uppercase tracking-[0.16em] text-orange">
            Audio lesson · CRUMP360
          </p>
          <p className="relative z-10 mt-2 max-w-xl font-display text-2xl leading-snug md:text-3xl">
            {title}
          </p>
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -right-8 top-6 h-40 w-40 rounded-full bg-orange/35 blur-2xl" />
            <div className="absolute bottom-4 left-10 h-28 w-28 rounded-full bg-blue/50 blur-2xl" />
          </div>
        </div>
      ) : (
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            preload="metadata"
            playsInline
            className="h-full w-full object-cover"
            onClick={togglePlay}
          />
          {kind === "live" ? (
            <span className="absolute left-3 top-3 rounded-sm bg-danger px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]">
              Replay
            </span>
          ) : null}
          {!playing ? (
            <button
              type="button"
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-ink/25 transition-opacity"
              aria-label="Play"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-ink/75 backdrop-blur-sm">
                <Play className="ml-0.5 h-7 w-7 fill-cloud text-cloud" />
              </span>
            </button>
          ) : null}
        </div>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy via-navy/90 to-transparent px-3 pb-3 pt-12 transition-opacity duration-300",
          hovering || !playing || isAudio
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100"
        )}
      >
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={current}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Seek"
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20"
          style={{
            background: `linear-gradient(to right, var(--orange) ${progress}%, rgba(255,255,255,0.2) ${progress}%)`,
          }}
        />

        <div className="mt-2 flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/10"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <Pause className="h-4 w-4 fill-cloud" />
            ) : (
              <Play className="h-4 w-4 fill-cloud" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/10"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <p className="ml-1 text-xs tabular-nums text-cloud/80">
            {formatTime(current)} / {formatTime(duration)}
          </p>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={cycleRate}
              className="h-8 rounded-md px-2 text-xs font-semibold tracking-wide hover:bg-white/10"
              aria-label="Playback speed"
            >
              {rate}x
            </button>
            {!isAudio ? (
              <button
                type="button"
                onClick={toggleFullscreen}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/10"
                aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {fullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
