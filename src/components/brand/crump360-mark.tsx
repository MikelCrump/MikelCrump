import Image from "next/image";
import { cn } from "@/lib/utils";

/** Geometric C + orange focal mark (SVG for crisp UI use). */
export function Crump360Mark({
  className = "h-8 w-8",
  animate = false,
  tone = "light",
}: {
  className?: string;
  animate?: boolean;
  tone?: "light" | "dark";
}) {
  const stroke = tone === "dark" ? "#E8E9ED" : "#191A21";

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className, animate && "pulse-orbit")}
      aria-hidden
    >
      <path
        d="M50.2 18.4A22 22 0 1 0 50.2 45.6"
        stroke={stroke}
        strokeWidth="10"
        strokeLinecap="butt"
      />
      <circle
        cx="52"
        cy="32"
        r="5.2"
        fill="#E68A2C"
        className={animate ? "pulse-orbit" : undefined}
      />
    </svg>
  );
}

/** Official raster mark — best on black / navy panels (asset has black pad). */
export function Crump360MarkImage({
  className = "h-12 w-12",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/crump360-mark.png"
      alt=""
      width={128}
      height={128}
      className={cn("object-contain", className)}
      priority={priority}
    />
  );
}

/**
 * Text wordmark for UI: CRUMP (navy/white) + 360 (blue) + orange C-dot.
 * Prefer this over the PNG (which includes a black plate).
 */
export function Crump360WordmarkText({
  className = "",
  size = "lg",
  tone = "light",
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "light" | "dark";
}) {
  const sizes = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-5xl sm:text-6xl",
    xl: "text-5xl sm:text-6xl md:text-7xl",
  };
  const crump = tone === "dark" ? "text-cloud" : "text-navy";

  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <Crump360Mark
        tone={tone}
        animate
        className={cn(
          size === "xl" || size === "lg" ? "h-12 w-12 sm:h-14 sm:w-14" : "h-8 w-8"
        )}
      />
      <span
        className={cn(
          "font-display font-bold tracking-tight",
          sizes[size],
          crump
        )}
      >
        CRUMP<span className="text-blue">360</span>
      </span>
    </div>
  );
}

/** Official wordmark PNG (black plate) — use only on dark full-bleed panels. */
export function Crump360Wordmark({
  className = "h-10 w-auto",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/crump360-wordmark.png"
      alt="CRUMP360"
      width={640}
      height={160}
      className={cn("object-contain object-left", className)}
      priority={priority}
    />
  );
}
