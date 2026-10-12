import { describe, expect, it } from "vitest";
import { LIFE_SECTIONS, getSection } from "@/life/sections";

describe("life sections", () => {
  it("keeps a board home plus in-depth area routes", () => {
    expect(getSection("board").href).toBe("/life");
    const strip = LIFE_SECTIONS.filter((s) => s.inStrip).map((s) => s.id);
    expect(strip).toEqual([
      "day",
      "tesla",
      "home",
      "money",
      "health",
      "ai",
      "media",
      "servers",
    ]);
    for (const section of LIFE_SECTIONS) {
      expect(section.href.startsWith("/life")).toBe(true);
    }
  });
});
