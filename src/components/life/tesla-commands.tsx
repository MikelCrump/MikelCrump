"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  TESLA_COMMAND_SECTIONS,
  TESLA_COMMANDS,
  type TeslaCommandDef,
} from "@/life/tesla-commands";
import type { ControlRequest } from "@/life/types";

type ControlFn = (body: ControlRequest) => Promise<{ ok: boolean; detail: string }>;
type Value = string | number | boolean;

/** Everyday controls shown as big tiles at the top; hidden from the section lists. */
const QUICK_ACTIONS: Array<{
  action: string;
  label: string;
  hint: string;
  value?: Value;
  primary?: boolean;
}> = [
  { action: "lock", label: "Lock", hint: "Secure the car", primary: true },
  { action: "unlock", label: "Unlock", hint: "Unlock doors", primary: true },
  { action: "climate_on", label: "Climate on", hint: "Precondition cabin" },
  { action: "climate_off", label: "Climate off", hint: "Stop HVAC" },
  { action: "actuate_trunk", label: "Frunk", hint: "Open front trunk", value: "front" },
  { action: "actuate_trunk", label: "Trunk", hint: "Open rear trunk", value: "rear" },
  { action: "charge_port_door_open", label: "Charge port", hint: "Open the port" },
  { action: "flash_lights", label: "Flash", hint: "Flash headlights" },
  { action: "honk_horn", label: "Honk", hint: "Sound the horn" },
  { action: "wake", label: "Wake", hint: "Bring car online" },
];

const QUICK_HIDDEN = new Set(
  QUICK_ACTIONS.filter((q) => q.action !== "actuate_trunk").map((q) => q.action),
);

/** Sections people rarely touch start collapsed. */
const OPEN_BY_DEFAULT = new Set(["Climate", "Charging", "Security", "Access"]);

const OPTIONS = {
  keeper: [
    [0, "Off"],
    [1, "Keep"],
    [2, "Dog"],
    [3, "Camp"],
  ],
  cop_temp: [
    [1, "Low"],
    [2, "Medium"],
    [3, "High"],
  ],
  trunk: [
    ["front", "Frunk"],
    ["rear", "Trunk"],
  ],
  window: [
    ["vent", "Vent"],
    ["close", "Close"],
  ],
} as const satisfies Record<string, ReadonlyArray<readonly [Value, string]>>;

function Frame({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-[var(--life-line)] bg-white/55 px-4 py-3">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-0.5 text-xs text-[var(--life-muted)]">{hint}</p>
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}

function Choices({
  options,
  pending,
  onPick,
}: {
  options: ReadonlyArray<readonly [Value, string]>;
  pending: boolean;
  onPick: (value: Value) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([value, label]) => (
        <button
          key={String(value)}
          type="button"
          disabled={pending}
          className="life-btn"
          onClick={() => onPick(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function CommandCard({
  cmd,
  pending,
  control,
}: {
  cmd: TeslaCommandDef;
  pending: boolean;
  control: ControlFn;
}) {
  const [temp, setTemp] = useState(72);
  const [percent, setPercent] = useState(80);
  const [amps, setAmps] = useState(32);
  const [volume, setVolume] = useState(5);
  const [text, setText] = useState("");
  const [pin, setPin] = useState("");
  const [seat, setSeat] = useState(0);
  const [level, setLevel] = useState(1);

  function send(value?: Value) {
    if (cmd.confirm && !window.confirm(cmd.confirm)) return;
    return control({ target: "tesla", action: cmd.action, value });
  }

  const frame = (children?: ReactNode) => (
    <Frame title={cmd.label} hint={cmd.hint}>
      {children}
    </Frame>
  );

  switch (cmd.kind) {
    case "button":
      return (
        <button
          type="button"
          disabled={pending}
          onClick={() => send()}
          className="rounded-xl border border-[var(--life-line)] bg-white/55 px-4 py-3 text-left transition hover:border-[var(--life-accent)] disabled:opacity-50"
        >
          <p className="text-sm font-semibold">{cmd.label}</p>
          <p className="mt-0.5 text-xs text-[var(--life-muted)]">{cmd.hint}</p>
        </button>
      );

    case "bool":
      return frame(
        <Choices
          pending={pending}
          onPick={send}
          options={[
            [true, "On"],
            [false, "Off"],
          ]}
        />,
      );

    case "keeper":
    case "cop_temp":
    case "trunk":
    case "window":
      return frame(<Choices options={OPTIONS[cmd.kind]} pending={pending} onPick={send} />);

    case "temp":
      return frame(
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={60}
            max={90}
            value={temp}
            onChange={(e) => setTemp(Number(e.target.value))}
            className="life-input w-20"
          />
          <span className="text-xs text-[var(--life-muted)]">°F</span>
          <button type="button" disabled={pending} className="life-btn" onClick={() => send(temp)}>
            Set
          </button>
        </div>,
      );

    case "percent":
      return frame(
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={50}
            max={100}
            value={percent}
            onChange={(e) => setPercent(Number(e.target.value))}
            className="flex-1 accent-[var(--life-accent)]"
          />
          <span className="w-10 text-sm tabular-nums">{percent}%</span>
          <button
            type="button"
            disabled={pending}
            className="life-btn"
            onClick={() => send(percent)}
          >
            Set
          </button>
        </div>,
      );

    case "amps":
      return frame(
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={200}
            value={amps}
            onChange={(e) => setAmps(Number(e.target.value))}
            className="life-input w-20"
          />
          <button type="button" disabled={pending} className="life-btn" onClick={() => send(amps)}>
            Set
          </button>
        </div>,
      );

    case "volume":
      return frame(
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={11}
            step={0.5}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="life-input w-20"
          />
          <button
            type="button"
            disabled={pending}
            className="life-btn"
            onClick={() => send(volume)}
          >
            Set
          </button>
        </div>,
      );

    case "seat_heat":
      return frame(
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="life-input"
            value={seat}
            onChange={(e) => setSeat(Number(e.target.value))}
          >
            <option value={0}>Driver</option>
            <option value={1}>Passenger</option>
          </select>
          <select
            className="life-input"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
          >
            <option value={0}>Off</option>
            <option value={1}>Low</option>
            <option value={2}>Med</option>
            <option value={3}>High</option>
          </select>
          <button
            type="button"
            disabled={pending}
            className="life-btn"
            onClick={() => send(JSON.stringify({ seat_position: seat, level }))}
          >
            Apply
          </button>
        </div>,
      );

    case "pin": {
      const hasToggle = cmd.action === "set_valet_mode" || cmd.action === "set_pin_to_drive";
      const ready = pin.length === 4;
      return frame(
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="life-input w-24"
          />
          {hasToggle ? (
            <>
              <button
                type="button"
                disabled={pending || !ready}
                className="life-btn life-btn-on"
                onClick={() => send(JSON.stringify({ on: true, password: pin }))}
              >
                Enable
              </button>
              <button
                type="button"
                disabled={pending || !ready}
                className="life-btn"
                onClick={() => send(JSON.stringify({ on: false, password: pin }))}
              >
                Disable
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={pending || !ready}
              className="life-btn"
              onClick={() => send(JSON.stringify({ pin }))}
            >
              Send
            </button>
          )}
        </div>,
      );
    }

    default:
      return frame(
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={cmd.hint}
            className="life-input min-w-0 flex-1"
          />
          <button
            type="button"
            disabled={pending || !text.trim()}
            className="life-btn"
            onClick={() => send(text.trim())}
          >
            Send
          </button>
        </div>,
      );
  }
}

function QuickActions({ pending, control }: { pending: boolean; control: ControlFn }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
      {QUICK_ACTIONS.map((q) => (
        <button
          key={`${q.action}:${String(q.value ?? "")}`}
          type="button"
          disabled={pending}
          onClick={() => control({ target: "tesla", action: q.action, value: q.value })}
          className={`rounded-xl border px-3 py-3 text-left transition disabled:opacity-50 ${
            q.primary
              ? "border-[var(--life-ink)] bg-[var(--life-ink)] text-white hover:opacity-90"
              : "border-[var(--life-line)] bg-white/70 hover:border-[var(--life-accent)]"
          }`}
        >
          <p className="text-sm font-semibold">{q.label}</p>
          <p className={`text-xs ${q.primary ? "text-white/70" : "text-[var(--life-muted)]"}`}>
            {q.hint}
          </p>
        </button>
      ))}
    </div>
  );
}

export function TeslaCommandsPanel({
  pending,
  control,
}: {
  pending: boolean;
  control: ControlFn;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const sections = useMemo(
    () =>
      TESLA_COMMAND_SECTIONS.map((section) => ({
        section,
        cmds: TESLA_COMMANDS.filter(
          (c) =>
            c.section === section &&
            !QUICK_HIDDEN.has(c.action) &&
            (!q || `${c.label} ${c.hint}`.toLowerCase().includes(q)),
        ),
      })).filter((s) => s.cmds.length > 0),
    [q],
  );

  return (
    <div className="space-y-5">
      {q ? null : <QuickActions pending={pending} control={control} />}

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search controls (charge, seat, valet…)"
        className="life-input w-full"
        aria-label="Search Tesla controls"
      />

      {sections.length === 0 ? (
        <p className="text-sm text-[var(--life-muted)]">No controls match “{query}”.</p>
      ) : null}

      <div className="space-y-3">
        {sections.map(({ section, cmds }) => (
          <details
            key={`${section}:${q ? "q" : "all"}`}
            open={Boolean(q) || OPEN_BY_DEFAULT.has(section)}
            className="group rounded-2xl border border-[var(--life-line)] bg-white/30 p-3"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between px-1 py-1">
              <span
                className="text-sm font-semibold tracking-wide text-[var(--life-muted)] uppercase"
                style={{ fontFamily: "var(--font-life-display), sans-serif" }}
              >
                {section}
              </span>
              <span className="flex items-center gap-2 text-xs text-[var(--life-muted)]">
                {cmds.length}
                <span aria-hidden className="transition group-open:rotate-180">
                  ▾
                </span>
              </span>
            </summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {cmds.map((cmd) => (
                <CommandCard key={cmd.action} cmd={cmd} pending={pending} control={control} />
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
