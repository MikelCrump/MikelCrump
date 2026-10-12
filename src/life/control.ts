import { controlGovee } from "@/life/adapters/govee";
import { controlMedia } from "@/life/adapters/media";
import { controlResideo } from "@/life/adapters/resideo";
import { controlTesla } from "@/life/adapters/tesla";
import { toggleAutomation } from "@/life/automations-store";
import type { ControlRequest } from "@/life/types";

export async function runControl(req: ControlRequest) {
  switch (req.target) {
    case "govee":
      if (!req.deviceId) return { ok: false, detail: "deviceId required" };
      return controlGovee(req.deviceId, req.action, req.value);
    case "tesla":
      return controlTesla(req.action);
    case "resideo":
      return controlResideo(req.action, req.value);
    case "apple_tv":
      return controlMedia("apple_tv", req.action, req.deviceId);
    case "roku":
      return controlMedia("roku", req.action, req.deviceId);
    case "automation": {
      if (!req.deviceId) return { ok: false, detail: "automation id required" };
      const updated = toggleAutomation(
        req.deviceId,
        typeof req.value === "boolean" ? req.value : undefined,
      );
      return updated
        ? { ok: true, detail: `${updated.name} → ${updated.enabled ? "on" : "off"}` }
        : { ok: false, detail: "Automation not found" };
    }
    default:
      return { ok: false, detail: "Unknown target" };
  }
}
