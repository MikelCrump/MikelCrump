"use client";

import { useState } from "react";
import {
  TESLA_COMMAND_SECTIONS,
  TESLA_COMMANDS,
  type TeslaCommandDef,
} from "@/life/tesla-commands";
import type { ControlRequest } from "@/life/types";

type ControlFn = (body: ControlRequest) => Promise<{ ok: boolean; detail: string }>;

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

  function send(value?: string | number | boolean) {
    return control({ target: "tesla", action: cmd.action, value });
  }

  const shell =
    "rounded-xl border border-[var(--life-line)] bg-white/50 px-4 py-3 text-left";

  if (cmd.kind === "button") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => send()}
        className={`${shell} transition hover:border-[var(--life-accent)]/40`}
      >
        <p className="text-sm font-semibold">{cmd.label}</p>
        <p className="mt-1 text-xs text-[var(--life-muted)]">{cmd.hint}</p>
      </button>
    );
  }

  if (cmd.kind === "bool") {
    return (
      <div className={shell}>
        <p className="text-sm font-semibold">{cmd.label}</p>
        <p className="mt-1 text-xs text-[var(--life-muted)]">{cmd.hint}</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={pending}
            className="life-btn life-btn-on"
            onClick={() => send(true)}
          >
            On
          </button>
          <button
            type="button"
            disabled={pending}
            className="life-btn"
            onClick={() => send(false)}
          >
            Off
          </button>
        </div>
      </div>
    );
  }

  if (cmd.kind === "temp") {
    return (
      <div className={shell}>
        <p className="text-sm font-semibold">{cmd.label}</p>
        <p className="mt-1 text-xs text-[var(--life-muted)]">{cmd.hint}</p>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min={60}
            max={90}
            value={temp}
            onChange={(e) => setTemp(Number(e.target.value))}
            className="life-input w-20"
          />
          <span className="text-xs text-[var(--life-muted)]">°F</span>
          <button
            type="button"
            disabled={pending}
            className="life-btn"
            onClick={() => send(temp)}
          >
            Set
          </button>
        </div>
      </div>
    );
  }

  if (cmd.kind === "percent") {
    return (
      <div className={shell}>
        <p className="text-sm font-semibold">{cmd.label}</p>
        <p className="mt-1 text-xs text-[var(--life-muted)]">{cmd.hint}</p>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="range"
            min={50}
            max={100}
            value={percent}
            onChange={(e) => setPercent(Number(e.target.value))}
            className="flex-1"
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
        </div>
      </div>
    );
  }

  if (cmd.kind === "amps") {
    return (
      <div className={shell}>
        <p className="text-sm font-semibold">{cmd.label}</p>
        <p className="mt-1 text-xs text-[var(--life-muted)]">{cmd.hint}</p>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={200}
            value={amps}
            onChange={(e) => setAmps(Number(e.target.value))}
            className="life-input w-20"
          />
          <button
            type="button"
            disabled={pending}
            className="life-btn"
            onClick={() => send(amps)}
          >
            Set
          </button>
        </div>
      </div>
    );
  }

  if (cmd.kind === "volume") {
    return (
      <div className={shell}>
        <p className="text-sm font-semibold">{cmd.label}</p>
        <p className="mt-1 text-xs text-[var(--life-muted)]">{cmd.hint}</p>
        <div className="mt-3 flex items-center gap-2">
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
        </div>
      </div>
    );
  }

  if (cmd.kind === "keeper") {
    return (
      <div className={shell}>
        <p className="text-sm font-semibold">{cmd.label}</p>
        <p className="mt-1 text-xs text-[var(--life-muted)]">{cmd.hint}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              [0, "Off"],
              [1, "Keep"],
              [2, "Dog"],
              [3, "Camp"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              disabled={pending}
              className="life-btn"
              onClick={() => send(mode)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (cmd.kind === "cop_temp") {
    return (
      <div className={shell}>
        <p className="text-sm font-semibold">{cmd.label}</p>
        <p className="mt-1 text-xs text-[var(--life-muted)]">{cmd.hint}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              [1, "Low"],
              [2, "Medium"],
              [3, "High"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              disabled={pending}
              className="life-btn"
              onClick={() => send(mode)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (cmd.kind === "trunk") {
    return (
      <div className={shell}>
        <p className="text-sm font-semibold">{cmd.label}</p>
        <p className="mt-1 text-xs text-[var(--life-muted)]">{cmd.hint}</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={pending}
            className="life-btn"
            onClick={() => send("front")}
          >
            Frunk
          </button>
          <button
            type="button"
            disabled={pending}
            className="life-btn"
            onClick={() => send("rear")}
          >
            Trunk
          </button>
        </div>
      </div>
    );
  }

  if (cmd.kind === "window") {
    return (
      <div className={shell}>
        <p className="text-sm font-semibold">{cmd.label}</p>
        <p className="mt-1 text-xs text-[var(--life-muted)]">{cmd.hint}</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={pending}
            className="life-btn"
            onClick={() => send("vent")}
          >
            Vent
          </button>
          <button
            type="button"
            disabled={pending}
            className="life-btn"
            onClick={() => send("close")}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (cmd.kind === "sunroof") {
    return (
      <div className={shell}>
        <p className="text-sm font-semibold">{cmd.label}</p>
        <p className="mt-1 text-xs text-[var(--life-muted)]">{cmd.hint}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["vent", "open", "close"] as const).map((state) => (
            <button
              key={state}
              type="button"
              disabled={pending}
              className="life-btn"
              onClick={() => send(state)}
            >
              {state[0]!.toUpperCase() + state.slice(1)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (cmd.kind === "seat_heat" || cmd.kind === "seat_cool") {
    return (
      <div className={shell}>
        <p className="text-sm font-semibold">{cmd.label}</p>
        <p className="mt-1 text-xs text-[var(--life-muted)]">{cmd.hint}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            className="life-input"
            value={seat}
            onChange={(e) => setSeat(Number(e.target.value))}
          >
            <option value={0}>Driver</option>
            <option value={1}>Passenger</option>
            <option value={2}>Rear left</option>
            <option value={5}>Rear right</option>
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
            onClick={() =>
              send(JSON.stringify({ seat_position: seat, level }))
            }
          >
            Apply
          </button>
        </div>
      </div>
    );
  }

  if (cmd.kind === "pin") {
    const needsOnToggle =
      cmd.action === "set_valet_mode" || cmd.action === "set_pin_to_drive";
    return (
      <div className={shell}>
        <p className="text-sm font-semibold">{cmd.label}</p>
        <p className="mt-1 text-xs text-[var(--life-muted)]">{cmd.hint}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="life-input w-24"
          />
          {needsOnToggle ? (
            <>
              <button
                type="button"
                disabled={pending || pin.length !== 4}
                className="life-btn life-btn-on"
                onClick={() =>
                  send(JSON.stringify({ on: true, password: pin }))
                }
              >
                Enable
              </button>
              <button
                type="button"
                disabled={pending || pin.length !== 4}
                className="life-btn"
                onClick={() =>
                  send(JSON.stringify({ on: false, password: pin }))
                }
              >
                Disable
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={pending || pin.length !== 4}
              className="life-btn"
              onClick={() => send(JSON.stringify({ pin }))}
            >
              Send
            </button>
          )}
        </div>
      </div>
    );
  }

  // text
  return (
    <div className={shell}>
      <p className="text-sm font-semibold">{cmd.label}</p>
      <p className="mt-1 text-xs text-[var(--life-muted)]">{cmd.hint}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
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
      </div>
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
  return (
    <div className="space-y-6">
      {TESLA_COMMAND_SECTIONS.map((section) => {
        const cmds = TESLA_COMMANDS.filter((c) => c.section === section);
        if (!cmds.length) return null;
        return (
          <section key={section}>
            <h3
              className="mb-3 text-sm font-semibold tracking-wide text-[var(--life-muted)] uppercase"
              style={{ fontFamily: "var(--font-life-display), sans-serif" }}
            >
              {section}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {cmds.map((cmd) => (
                <CommandCard
                  key={cmd.action}
                  cmd={cmd}
                  pending={pending}
                  control={control}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
