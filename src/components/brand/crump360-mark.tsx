import Image from "next/image";
import { cn } from "@/lib/utils";

/** Geometric C + orange focal mark (SVG for crisp UI use). */
export function Crump360Mark({
  className = "h-8 w-8",
  animate = false,
}: {
  className?: string;
  animate?: boolean;
}) {
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
        stroke="#191A21"
        strokeWidth="10"
        strokeLinecap="butt"
      />
      <circle cx="52" cy="32" r="5.2" fill="#E68A2C" className={animate ? "pulse-orbit" : undefined} />
    </svg>
  );
}

/** Official raster mark for hero / dark panels. */
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

/** Official wordmark: CRUMP (navy) + 360 (blue) with orange C-dot. */
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
