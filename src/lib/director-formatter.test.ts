import { describe, expect, it } from "vitest";
import { formatShot } from "@/lib/director-formatter";
import type { SceneShot } from "@/lib/scene-script";

describe("formatShot", () => {
  it("produces a stable semantic string for a typical MCU push-in", () => {
    const shot: SceneShot = {
      lens: "35mm",
      focalLengthMm: 35,
      angle: "eye-level",
      movement: "slow push-in",
      framing: "MCU",
      depthOfField: "shallow",
    };

    expect(formatShot(shot)).toMatchSnapshot();
    expect(formatShot(shot)).toBe(
      "35mm lens, eye-level angle, slow push-in, medium close-up, shallow depth of field, consistent studio lighting",
    );
  });

  it("omits depth of field when unset, keeps lighting coda", () => {
    const shot: SceneShot = {
      lens: "85mm portrait",
      focalLengthMm: 85,
      angle: "over-the-shoulder",
      movement: "orbit",
      framing: "CU",
    };

    expect(formatShot(shot)).toMatchSnapshot();
  });

  it("is deterministic across framing codes", () => {
    const base: Omit<SceneShot, "framing"> = {
      lens: "24mm wide",
      focalLengthMm: 24,
      angle: "high-angle",
      movement: "pan-left",
      depthOfField: "deep",
    };

    const frames = ["ECU", "CU", "MCU", "MS", "MWS", "WS", "EWS"] as const;
    expect(frames.map((framing) => formatShot({ ...base, framing }))).toMatchSnapshot();
  });

  it("keeps enum order: lens → angle → movement → framing → dof → lighting", () => {
    const shot: SceneShot = {
      lens: "18mm ultra-wide",
      focalLengthMm: 18,
      angle: "top-down",
      movement: "handheld",
      framing: "EWS",
      depthOfField: "medium",
    };
    const out = formatShot(shot);
    const lensIdx = out.indexOf("18mm ultra-wide lens");
    const angleIdx = out.indexOf("top-down angle");
    const moveIdx = out.indexOf("handheld");
    const frameIdx = out.indexOf("extreme wide shot");
    const dofIdx = out.indexOf("medium depth of field");
    const lightIdx = out.indexOf("consistent studio lighting");
    expect([lensIdx, angleIdx, moveIdx, frameIdx, dofIdx, lightIdx].every((i) => i >= 0)).toBe(
      true,
    );
    expect(lensIdx).toBeLessThan(angleIdx);
    expect(angleIdx).toBeLessThan(moveIdx);
    expect(moveIdx).toBeLessThan(frameIdx);
    expect(frameIdx).toBeLessThan(dofIdx);
    expect(dofIdx).toBeLessThan(lightIdx);
  });
});
