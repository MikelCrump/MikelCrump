import Image from "next/image";
import { cn } from "@/lib/utils";

/** Official C + orange-dot mark extracted from the CRUMP360 wordmark. */
export function Crump360Mark({
  className = "h-8 w-8",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
  /** @deprecated ignored — mark is the official raster */
  animate?: boolean;
  /** @deprecated ignored — mark ships on black plate */
  tone?: "light" | "dark";
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

/** Official CRUMP360 wordmark lockup. */
export function Crump360Wordmark({
  className = "h-8 w-auto",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/crump360-wordmark.png"
      alt="CRUMP360"
      width={2473}
      height={330}
      className={cn("object-contain object-left", className)}
      priority={priority}
    />
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
