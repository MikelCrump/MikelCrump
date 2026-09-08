import type { ClipStatus } from "@prisma/client";

export type ClipEvent =
  | { type: "enqueue" }
  | { type: "start" }
  | { type: "succeed" }
  | { type: "fail" }
  | { type: "retry" };

const TRANSITIONS: Record<ClipStatus, Partial<Record<ClipEvent["type"], ClipStatus>>> = {
  QUEUED: {
    start: "RUNNING",
    fail: "FAILED",
  },
  RUNNING: {
    succeed: "SUCCEEDED",
    fail: "FAILED",
  },
  SUCCEEDED: {
    retry: "QUEUED",
  },
  FAILED: {
    retry: "QUEUED",
  },
};

export function transitionClipStatus(
  current: ClipStatus,
  event: ClipEvent,
): ClipStatus {
  const next = TRANSITIONS[current]?.[event.type];
  if (!next) {
    throw new Error(`Invalid clip transition: ${current} + ${event.type}`);
  }
  return next;
}

export function mapProviderStatus(
  status: "queued" | "running" | "succeeded" | "failed",
): ClipEvent {
  switch (status) {
    case "queued":
      return { type: "enqueue" };
    case "running":
      return { type: "start" };
    case "succeeded":
      return { type: "succeed" };
    case "failed":
      return { type: "fail" };
  }
}

export function canRetry(status: ClipStatus): boolean {
  return status === "FAILED" || status === "SUCCEEDED";
}
