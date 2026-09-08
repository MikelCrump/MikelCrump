import Image from "next/image";
import { cn } from "@/lib/utils";

/** Official C + orange-dot mark extracted from the CRUMP360 wordmark. */
export function Crump360Mark({
  className = "h-8 w-8",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
  animate?: boolean;
  tone?: "light" | "dark";
}) {
  return (
    <span className={cn("inline-flex bg-black", className)}>
      <Image
        src="/brand/crump360-mark.png"
        alt=""
        width={128}
        height={128}
        className="h-full w-full object-contain"
        priority={priority}
      />
    </span>
  );
}

/**
 * Official CRUMP360 wordmark lockup.
 * Always sits on pure black so charcoal "CRUMP" stays visible (logo design).
 */
export function Crump360Wordmark({
  className = "h-8 w-auto",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center bg-black px-2 py-1",
        className
      )}
    >
      <Image
        src="/brand/crump360-wordmark.png"
        alt="CRUMP360"
        width={2473}
        height={330}
        className="h-full w-auto max-w-full object-contain object-left"
        priority={priority}
      />
    </span>
  );
}

/** @deprecated Use Crump360Mark */
export const Crump360MarkImage = Crump360Mark;

/** @deprecated Use Crump360Wordmark */
export function Crump360WordmarkText({
  className = "",
  size = "lg",
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "light" | "dark";
}) {
  const heights = {
    sm: "h-7",
    md: "h-10",
    lg: "h-12 sm:h-14",
    xl: "h-14 sm:h-16 md:h-20",
  };
  return (
    <Crump360Wordmark
      className={cn(heights[size], "w-auto max-w-full", className)}
      priority
    />
  );
}
