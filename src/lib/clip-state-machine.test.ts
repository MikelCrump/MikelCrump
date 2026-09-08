import { describe, expect, it } from "vitest";
import {
  canRetry,
  mapProviderStatus,
  transitionClipStatus,
} from "@/lib/clip-state-machine";

describe("clip status state machine", () => {
  it("advances queued → running → succeeded", () => {
    const running = transitionClipStatus("QUEUED", { type: "start" });
    expect(running).toBe("RUNNING");
    expect(transitionClipStatus(running, { type: "succeed" })).toBe("SUCCEEDED");
  });

  it("allows fail from queued or running, and retry back to queued", () => {
    expect(transitionClipStatus("QUEUED", { type: "fail" })).toBe("FAILED");
    expect(transitionClipStatus("RUNNING", { type: "fail" })).toBe("FAILED");
    expect(transitionClipStatus("FAILED", { type: "retry" })).toBe("QUEUED");
    expect(transitionClipStatus("SUCCEEDED", { type: "retry" })).toBe("QUEUED");
  });

  it("rejects illegal transitions", () => {
    expect(() => transitionClipStatus("SUCCEEDED", { type: "start" })).toThrow(
      /Invalid clip transition/,
    );
    expect(() => transitionClipStatus("QUEUED", { type: "succeed" })).toThrow();
  });

  it("maps provider statuses and retry eligibility", () => {
    expect(mapProviderStatus("running")).toEqual({ type: "start" });
    expect(mapProviderStatus("failed")).toEqual({ type: "fail" });
    expect(canRetry("FAILED")).toBe(true);
    expect(canRetry("QUEUED")).toBe(false);
  });
});
