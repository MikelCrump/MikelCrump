import type { SceneShot, ShotFraming } from "@/lib/scene-script";

const FRAMING_LABELS: Record<ShotFraming, string> = {
  ECU: "extreme close-up",
  CU: "close-up",
  MCU: "medium close-up",
  MS: "medium shot",
  MWS: "medium wide shot",
  WS: "wide shot",
  EWS: "extreme wide shot",
};

/**
 * Turns structured director options into ONE stable semantic string for
 * generation engines. Ordering is deterministic and snapshot-tested:
 * lens → angle → movement → framing → depth of field → lighting coda.
 */
export function formatShot(shot: SceneShot): string {
  const parts: string[] = [
    `${shot.lens} lens`,
    `${shot.angle} angle`,
    shot.movement,
    FRAMING_LABELS[shot.framing],
  ];

  if (shot.depthOfField) {
    parts.push(`${shot.depthOfField} depth of field`);
  }

  parts.push("consistent studio lighting");

  return parts.join(", ");
}
