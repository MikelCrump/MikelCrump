export type TeslaCommandKind =
  | "button"
  | "temp"
  | "percent"
  | "amps"
  | "keeper"
  | "trunk"
  | "window"
  | "seat_heat"
  | "bool"
  | "cop_temp"
  | "volume"
  | "pin"
  | "text";

export type TeslaCommandDef = {
  action: string;
  /** Fleet API command path segment after /command/ (or special wake) */
  endpoint: string | "wake_up";
  label: string;
  hint: string;
  section:
    | "Power"
    | "Climate"
    | "Charging"
    | "Security"
    | "Access"
    | "Media"
    | "Navigation"
    | "Speed & parental"
    | "Software & misc";
  kind: TeslaCommandKind;
  /** Whether wake-before-send should run (false only for wake itself). */
  wakeFirst?: boolean;
  /** Ask the user to confirm (shows this message) before sending. */
  confirm?: string;
};

/** Full Fleet vehicle-command catalog exposed in Life Ops. */
export const TESLA_COMMANDS: TeslaCommandDef[] = [
  // Power
  {
    action: "wake",
    endpoint: "wake_up",
    label: "Wake vehicle",
    hint: "Bring the car online from sleep",
    section: "Power",
    kind: "button",
    wakeFirst: false,
  },
  {
    action: "remote_start_drive",
    endpoint: "remote_start_drive",
    label: "Remote start",
    hint: "Enable keyless driving",
    section: "Power",
    kind: "button",
  },

  // Climate
  {
    action: "climate_on",
    endpoint: "auto_conditioning_start",
    label: "Start climate",
    hint: "Precondition cabin",
    section: "Climate",
    kind: "button",
  },
  {
    action: "climate_off",
    endpoint: "auto_conditioning_stop",
    label: "Stop climate",
    hint: "Turn HVAC off",
    section: "Climate",
    kind: "button",
  },
  {
    action: "set_temps",
    endpoint: "set_temps",
    label: "Set cabin temp",
    hint: "Driver & passenger °F",
    section: "Climate",
    kind: "temp",
  },
  {
    action: "set_climate_keeper_mode",
    endpoint: "set_climate_keeper_mode",
    label: "Climate keeper",
    hint: "Off / Keep / Dog / Camp",
    section: "Climate",
    kind: "keeper",
  },
  {
    action: "set_preconditioning_max",
    endpoint: "set_preconditioning_max",
    label: "Max precondition",
    hint: "Toggle preconditioning max",
    section: "Climate",
    kind: "bool",
  },
  {
    action: "set_cabin_overheat_protection",
    endpoint: "set_cabin_overheat_protection",
    label: "Cabin overheat protection",
    hint: "Enable/disable COP",
    section: "Climate",
    kind: "bool",
  },
  {
    action: "set_cop_temp",
    endpoint: "set_cop_temp",
    label: "COP temperature",
    hint: "Low / Medium / High",
    section: "Climate",
    kind: "cop_temp",
  },
  {
    action: "remote_seat_heater_request",
    endpoint: "remote_seat_heater_request",
    label: "Seat heat",
    hint: "Seat + level 0–3",
    section: "Climate",
    kind: "seat_heat",
  },
  {
    action: "remote_auto_seat_climate_request",
    endpoint: "remote_auto_seat_climate_request",
    label: "Auto seat climate",
    hint: "Auto seat heat",
    section: "Climate",
    kind: "bool",
  },
  {
    action: "remote_steering_wheel_heater_request",
    endpoint: "remote_steering_wheel_heater_request",
    label: "Steering heat",
    hint: "If equipped",
    section: "Climate",
    kind: "bool",
  },
  {
    action: "remote_auto_steering_wheel_heat_climate_request",
    endpoint: "remote_auto_steering_wheel_heat_climate_request",
    label: "Auto steering heat",
    hint: "Auto steering wheel heat",
    section: "Climate",
    kind: "bool",
  },
  {
    action: "add_precondition_schedule",
    endpoint: "add_precondition_schedule",
    label: "Add precondition schedule",
    hint: "JSON schedule body via value",
    section: "Climate",
    kind: "text",
  },
  {
    action: "remove_precondition_schedule",
    endpoint: "remove_precondition_schedule",
    label: "Remove precondition schedule",
    hint: "Schedule id",
    section: "Climate",
    kind: "text",
  },

  // Charging
  {
    action: "charge_start",
    endpoint: "charge_start",
    label: "Start charge",
    hint: "Begin charging if plugged in",
    section: "Charging",
    kind: "button",
  },
  {
    action: "charge_stop",
    endpoint: "charge_stop",
    label: "Stop charge",
    hint: "Pause charging",
    section: "Charging",
    kind: "button",
  },
  {
    action: "set_charge_limit",
    endpoint: "set_charge_limit",
    label: "Charge limit",
    hint: "Battery % limit",
    section: "Charging",
    kind: "percent",
  },
  {
    action: "set_charging_amps",
    endpoint: "set_charging_amps",
    label: "Charging amps",
    hint: "Set charge current",
    section: "Charging",
    kind: "amps",
  },
  {
    action: "charge_port_door_open",
    endpoint: "charge_port_door_open",
    label: "Open charge port",
    hint: "Open charge port door",
    section: "Charging",
    kind: "button",
  },
  {
    action: "charge_port_door_close",
    endpoint: "charge_port_door_close",
    label: "Close charge port",
    hint: "Close charge port door",
    section: "Charging",
    kind: "button",
  },
  {
    action: "add_charge_schedule",
    endpoint: "add_charge_schedule",
    label: "Add charge schedule",
    hint: "JSON schedule body via value",
    section: "Charging",
    kind: "text",
  },
  {
    action: "remove_charge_schedule",
    endpoint: "remove_charge_schedule",
    label: "Remove charge schedule",
    hint: "Schedule id",
    section: "Charging",
    kind: "text",
  },
  {
    action: "set_scheduled_charging",
    endpoint: "set_scheduled_charging",
    label: "Scheduled charging",
    hint: "Legacy: minutes after midnight",
    section: "Charging",
    kind: "text",
  },
  {
    action: "set_scheduled_departure",
    endpoint: "set_scheduled_departure",
    label: "Scheduled departure",
    hint: "Legacy departure schedule JSON",
    section: "Charging",
    kind: "text",
  },

  // Security
  {
    action: "lock",
    endpoint: "door_lock",
    label: "Lock",
    hint: "Lock doors",
    section: "Security",
    kind: "button",
  },
  {
    action: "unlock",
    endpoint: "door_unlock",
    label: "Unlock",
    hint: "Unlock doors",
    section: "Security",
    kind: "button",
  },
  {
    action: "flash_lights",
    endpoint: "flash_lights",
    label: "Flash lights",
    hint: "Brief headlight flash",
    section: "Security",
    kind: "button",
  },
  {
    action: "honk_horn",
    endpoint: "honk_horn",
    label: "Honk horn",
    hint: "Honk (must be in park)",
    section: "Security",
    kind: "button",
  },
  {
    action: "set_sentry_mode",
    endpoint: "set_sentry_mode",
    label: "Sentry mode",
    hint: "Enable/disable Sentry",
    section: "Security",
    kind: "bool",
  },
  {
    action: "set_valet_mode",
    endpoint: "set_valet_mode",
    label: "Valet mode",
    hint: "on + 4-digit PIN",
    section: "Security",
    kind: "pin",
  },
  {
    action: "reset_valet_pin",
    endpoint: "reset_valet_pin",
    label: "Reset valet PIN",
    hint: "Clear valet PIN (valet off)",
    section: "Security",
    kind: "button",
  },
  {
    action: "set_pin_to_drive",
    endpoint: "set_pin_to_drive",
    label: "PIN to Drive",
    hint: "on + 4-digit PIN",
    section: "Security",
    kind: "pin",
  },
  {
    action: "reset_pin_to_drive_pin",
    endpoint: "reset_pin_to_drive_pin",
    label: "Reset PIN to Drive",
    hint: "Remove PIN to Drive",
    section: "Security",
    kind: "button",
  },
  {
    action: "clear_pin_to_drive_admin",
    endpoint: "clear_pin_to_drive_admin",
    label: "Clear PIN to Drive (admin)",
    hint: "Owner/fleet admin clear",
    confirm: "Clear the PIN to Drive using the admin override?",
    section: "Security",
    kind: "button",
  },
  {
    action: "guest_mode",
    endpoint: "guest_mode",
    label: "Guest mode",
    hint: "Enable/disable guest UI limits",
    section: "Security",
    kind: "bool",
  },
  {
    action: "erase_user_data",
    endpoint: "erase_user_data",
    label: "Erase user data",
    hint: "Guest mode + parked",
    confirm: "Erase all personal data from the car (profiles, nav, Bluetooth)? This cannot be undone.",
    section: "Security",
    kind: "button",
  },

  // Access
  {
    action: "actuate_trunk",
    endpoint: "actuate_trunk",
    label: "Frunk / trunk",
    hint: "Front or rear trunk",
    section: "Access",
    kind: "trunk",
  },
  {
    action: "trigger_homelink",
    endpoint: "trigger_homelink",
    label: "HomeLink",
    hint: "Garage / HomeLink (if equipped)",
    section: "Access",
    kind: "button",
  },

  // Access (windows)
  {
    action: "window_control",
    endpoint: "window_control",
    label: "Windows",
    hint: "Vent or close",
    section: "Access",
    kind: "window",
  },

  // Media
  {
    action: "media_toggle_playback",
    endpoint: "media_toggle_playback",
    label: "Play / pause",
    hint: "Toggle media playback",
    section: "Media",
    kind: "button",
  },
  {
    action: "media_next_track",
    endpoint: "media_next_track",
    label: "Next track",
    hint: "Skip forward",
    section: "Media",
    kind: "button",
  },
  {
    action: "media_prev_track",
    endpoint: "media_prev_track",
    label: "Previous track",
    hint: "Skip back",
    section: "Media",
    kind: "button",
  },
  {
    action: "media_next_fav",
    endpoint: "media_next_fav",
    label: "Next favorite",
    hint: "Next favorite station/track",
    section: "Media",
    kind: "button",
  },
  {
    action: "media_prev_fav",
    endpoint: "media_prev_fav",
    label: "Previous favorite",
    hint: "Previous favorite",
    section: "Media",
    kind: "button",
  },
  {
    action: "media_volume_up",
    endpoint: "media_volume_up",
    label: "Volume up",
    hint: "+1 volume",
    section: "Media",
    kind: "button",
  },
  {
    action: "media_volume_down",
    endpoint: "media_volume_down",
    label: "Volume down",
    hint: "−1 volume",
    section: "Media",
    kind: "button",
  },
  {
    action: "adjust_volume",
    endpoint: "adjust_volume",
    label: "Set volume",
    hint: "Absolute volume level",
    section: "Media",
    kind: "volume",
  },

  // Navigation
  {
    action: "navigation_request",
    endpoint: "navigation_request",
    label: "Navigate to place",
    hint: "Address or place text",
    section: "Navigation",
    kind: "text",
  },
  {
    action: "navigation_gps_request",
    endpoint: "navigation_gps_request",
    label: "Navigate to GPS",
    hint: "lat,lon JSON",
    section: "Navigation",
    kind: "text",
  },
  {
    action: "navigation_sc_request",
    endpoint: "navigation_sc_request",
    label: "Navigate to Supercharger",
    hint: "Supercharger id/order JSON",
    section: "Navigation",
    kind: "text",
  },
  {
    action: "navigation_waypoints_request",
    endpoint: "navigation_waypoints_request",
    label: "Send waypoints",
    hint: "Waypoint list JSON",
    section: "Navigation",
    kind: "text",
  },

  // Speed & parental
  {
    action: "speed_limit_set_limit",
    endpoint: "speed_limit_set_limit",
    label: "Speed limit MPH",
    hint: "Max MPH for speed limit mode",
    section: "Speed & parental",
    kind: "amps",
  },
  {
    action: "speed_limit_activate",
    endpoint: "speed_limit_activate",
    label: "Activate speed limit",
    hint: "4-digit PIN",
    section: "Speed & parental",
    kind: "pin",
  },
  {
    action: "speed_limit_deactivate",
    endpoint: "speed_limit_deactivate",
    label: "Deactivate speed limit",
    hint: "Current PIN",
    section: "Speed & parental",
    kind: "pin",
  },
  {
    action: "speed_limit_clear_pin",
    endpoint: "speed_limit_clear_pin",
    label: "Clear speed limit PIN",
    hint: "PIN required",
    section: "Speed & parental",
    kind: "pin",
  },
  {
    action: "speed_limit_clear_pin_admin",
    endpoint: "speed_limit_clear_pin_admin",
    label: "Clear speed limit PIN (admin)",
    hint: "Owner/fleet admin",
    confirm: "Clear the speed limit PIN using the admin override?",
    section: "Speed & parental",
    kind: "button",
  },
  {
    action: "parental_controls_activate",
    endpoint: "parental_controls_activate",
    label: "Activate parental controls",
    hint: "4-digit PIN",
    section: "Speed & parental",
    kind: "pin",
  },
  {
    action: "parental_controls_deactivate",
    endpoint: "parental_controls_deactivate",
    label: "Deactivate parental controls",
    hint: "Current PIN",
    section: "Speed & parental",
    kind: "pin",
  },
  {
    action: "parental_controls_enable_setting",
    endpoint: "parental_controls_enable_setting",
    label: "Parental setting",
    hint: "JSON {setting, enable}",
    section: "Speed & parental",
    kind: "text",
  },
  {
    action: "parental_controls_set_speed_limit",
    endpoint: "parental_controls_set_speed_limit",
    label: "Parental speed limit",
    hint: "MPH",
    section: "Speed & parental",
    kind: "amps",
  },
  {
    action: "parental_controls_clear_pin_admin",
    endpoint: "parental_controls_clear_pin_admin",
    label: "Clear parental PIN (admin)",
    hint: "Owner/fleet admin",
    confirm: "Clear the parental controls PIN using the admin override?",
    section: "Speed & parental",
    kind: "button",
  },

  // Software & misc
  {
    action: "schedule_software_update",
    endpoint: "schedule_software_update",
    label: "Schedule software update",
    hint: "Offset seconds",
    section: "Software & misc",
    kind: "text",
  },
  {
    action: "cancel_software_update",
    endpoint: "cancel_software_update",
    label: "Cancel software update",
    hint: "Cancel pending OTA",
    section: "Software & misc",
    kind: "button",
  },
  {
    action: "set_vehicle_name",
    endpoint: "set_vehicle_name",
    label: "Rename vehicle",
    hint: "New display name",
    section: "Software & misc",
    kind: "text",
  },
  {
    action: "remote_boombox",
    endpoint: "remote_boombox",
    label: "Boombox",
    hint: "Sound id (0 random, 2000 ping)",
    section: "Software & misc",
    kind: "text",
  },
  {
    action: "upcoming_calendar_entries",
    endpoint: "upcoming_calendar_entries",
    label: "Push calendar entries",
    hint: "Calendar JSON payload",
    section: "Software & misc",
    kind: "text",
  },
];

export const TESLA_COMMAND_SECTIONS = [
  "Power",
  "Climate",
  "Charging",
  "Security",
  "Access",
  "Media",
  "Navigation",
  "Speed & parental",
  "Software & misc",
] as const;

export function getTeslaCommand(action: string) {
  return TESLA_COMMANDS.find((c) => c.action === action);
}

function asObject(value: string | number | boolean | undefined): Record<string, unknown> {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        /* fall through */
      }
    }
  }
  return {};
}

/** Build JSON body for Fleet command endpoints that need parameters. */
export function buildTeslaCommandBody(
  action: string,
  value?: string | number | boolean,
): Record<string, unknown> | undefined {
  const obj = asObject(value);

  switch (action) {
    case "set_temps": {
      // UI uses °F; Fleet set_temps expects °C.
      const tempF =
        typeof value === "number"
          ? value
          : Number(obj.driver_temp_f ?? obj.temp ?? obj.driver_temp ?? value);
      if (!Number.isFinite(tempF)) return undefined;
      const driverC = ((tempF - 32) * 5) / 9;
      const passF = Number(obj.passenger_temp_f ?? obj.passenger_temp ?? tempF);
      const passengerC = ((passF - 32) * 5) / 9;
      return {
        driver_temp: Math.round(driverC * 10) / 10,
        passenger_temp: Math.round(passengerC * 10) / 10,
      };
    }
    case "set_charge_limit": {
      const percent = typeof value === "number" ? value : Number(obj.percent ?? value);
      return Number.isFinite(percent) ? { percent } : undefined;
    }
    case "set_charging_amps": {
      const amps =
        typeof value === "number" ? value : Number(obj.charging_amps ?? value);
      return Number.isFinite(amps) ? { charging_amps: amps } : undefined;
    }
    case "set_climate_keeper_mode": {
      const mode =
        typeof value === "number"
          ? value
          : Number(obj.climate_keeper_mode ?? value);
      return Number.isFinite(mode) ? { climate_keeper_mode: mode } : undefined;
    }
    case "set_sentry_mode":
    case "set_preconditioning_max":
    case "guest_mode":
    case "remote_auto_seat_climate_request":
    case "remote_steering_wheel_heater_request":
    case "remote_auto_steering_wheel_heat_climate_request":
      return {
        on: typeof value === "boolean" ? value : value === "true" || value === 1 || value === "1",
      };
    case "set_cabin_overheat_protection":
      return {
        on: typeof value === "boolean" ? value : value !== "false" && value !== 0,
        fan_only: Boolean(obj.fan_only),
      };
    case "set_cop_temp": {
      const cop = typeof value === "number" ? value : Number(obj.cop_temp ?? value);
      return Number.isFinite(cop) ? { cop_temp: cop } : undefined;
    }
    case "actuate_trunk":
      return {
        which_trunk:
          typeof value === "string" && !value.startsWith("{")
            ? value
            : String(obj.which_trunk ?? "rear"),
      };
    case "window_control":
      return {
        command:
          typeof value === "string" && !value.startsWith("{")
            ? value
            : String(obj.command ?? "vent"),
        lat: obj.lat,
        lon: obj.lon,
      };
    case "remote_seat_heater_request":
      return {
        seat_position: Number(obj.seat_position ?? obj.seat ?? 0),
        level: Number(obj.level ?? obj.heater_level ?? value ?? 1),
      };
    case "adjust_volume": {
      const volume = typeof value === "number" ? value : Number(obj.volume ?? value);
      return Number.isFinite(volume) ? { volume } : undefined;
    }
    case "set_valet_mode":
      return {
        on: obj.on !== false,
        password: String(obj.password ?? obj.pin ?? value ?? ""),
      };
    case "set_pin_to_drive":
      return {
        on: obj.on !== false,
        password: String(obj.password ?? obj.pin ?? value ?? ""),
      };
    case "speed_limit_activate":
    case "speed_limit_deactivate":
    case "speed_limit_clear_pin":
    case "parental_controls_activate":
    case "parental_controls_deactivate":
      return { pin: String(obj.pin ?? value ?? "") };
    case "speed_limit_set_limit":
    case "parental_controls_set_speed_limit": {
      const limit_mph =
        typeof value === "number" ? value : Number(obj.limit_mph ?? obj.speed_limit_mph ?? value);
      return Number.isFinite(limit_mph) ? { limit_mph } : undefined;
    }
    case "navigation_request":
      return {
        type: "share_ext_content_raw",
        locale: "en-US",
        timestamp_ms: String(Date.now()),
        value: {
          "android.intent.extra.TEXT": String(obj.text ?? value ?? ""),
        },
      };
    case "remote_boombox": {
      const sound = typeof value === "number" ? value : Number(obj.sound ?? value ?? 0);
      return { sound };
    }
    case "set_vehicle_name":
      return { vehicle_name: String(obj.vehicle_name ?? value ?? "") };
    case "schedule_software_update": {
      const offset_sec =
        typeof value === "number" ? value : Number(obj.offset_sec ?? value ?? 0);
      return { offset_sec };
    }
    case "remove_charge_schedule":
    case "remove_precondition_schedule":
      return { id: Number(obj.id ?? value) };
    case "add_charge_schedule":
    case "add_precondition_schedule":
    case "set_scheduled_charging":
    case "set_scheduled_departure":
    case "navigation_gps_request":
    case "navigation_sc_request":
    case "navigation_waypoints_request":
    case "parental_controls_enable_setting":
    case "upcoming_calendar_entries":
    case "remote_steering_wheel_heat_level_request":
      return Object.keys(obj).length ? obj : undefined;
    default:
      return Object.keys(obj).length ? obj : undefined;
  }
}
