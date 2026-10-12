import { describe, expect, it } from "vitest";
import {
  actionForControl,
  resolveSignedControl,
} from "@/life/tesla-command/signed";
import {
  TESLA_COMMANDS,
  TESLA_COMMAND_SECTIONS,
  buildTeslaCommandBody,
  getTeslaCommand,
} from "@/life/tesla-commands";

describe("tesla command catalog", () => {
  it("covers every section with unique actions", () => {
    const actions = new Set(TESLA_COMMANDS.map((c) => c.action));
    expect(actions.size).toBe(TESLA_COMMANDS.length);
    expect(TESLA_COMMANDS.length).toBeGreaterThanOrEqual(60);
    for (const section of TESLA_COMMAND_SECTIONS) {
      expect(TESLA_COMMANDS.some((c) => c.section === section)).toBe(true);
    }
  });

  it("builds bodies for parameterized commands", () => {
    expect(buildTeslaCommandBody("set_temps", 72)).toEqual({
      driver_temp: expect.any(Number),
      passenger_temp: expect.any(Number),
    });
    expect(buildTeslaCommandBody("set_charge_limit", 80)).toEqual({
      percent: 80,
    });
    expect(buildTeslaCommandBody("actuate_trunk", "front")).toEqual({
      which_trunk: "front",
    });
    expect(buildTeslaCommandBody("window_control", "close")).toEqual({
      command: "close",
      lat: undefined,
      lon: undefined,
    });
    expect(getTeslaCommand("climate_on")?.endpoint).toBe(
      "auto_conditioning_start",
    );
  });

  it("maps core actions to signed payloads", () => {
    expect(resolveSignedControl("lock")?.domain).toBe("vehicle_security");
    expect(resolveSignedControl("unlock")?.domain).toBe("vehicle_security");
    expect(resolveSignedControl("actuate_trunk", "front")?.domain).toBe(
      "vehicle_security",
    );
    expect(resolveSignedControl("climate_on")?.domain).toBe("infotainment");
    expect(actionForControl("climate_on")).toEqual({
      hvacAutoAction: { powerOn: true, manualOverride: true },
    });
    expect(actionForControl("charge_start")).toEqual({
      chargingStartStopAction: { start: {} },
    });
    expect(actionForControl("set_charge_limit", 80)).toEqual({
      chargingSetLimitAction: { percent: 80 },
    });
    expect(actionForControl("set_sentry_mode", false)).toEqual({
      vehicleControlSetSentryModeAction: { on: false },
    });
    expect(actionForControl("media_volume_up")).toEqual({
      mediaUpdateVolume: { volumeDelta: 1 },
    });
  });

  it("queues every catalog action under mock", async () => {
    process.env.LIFE_FORCE_MOCK = "1";
    const { controlTesla } = await import("@/life/adapters/tesla");
    for (const cmd of TESLA_COMMANDS) {
      const result = await controlTesla(cmd.action, 1);
      expect(result.ok).toBe(true);
    }
  });
});
