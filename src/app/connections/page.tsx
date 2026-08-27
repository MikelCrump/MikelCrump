"use client";

import { Link2, Lock } from "lucide-react";
import {
  CATEGORY_LABELS,
  INTEGRATIONS,
  type ConnectionStatus,
} from "@/lib/integrations";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function statusLabel(status: ConnectionStatus) {
  if (status === "connected") return "Connected";
  if (status === "ready") return "Ready to connect";
  return "Coming next";
}

export default function ConnectionsPage() {
  const categories = Array.from(
    new Set(INTEGRATIONS.map((i) => i.category))
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
      <header className="animate-steward-rise mb-8 max-w-2xl">
        <p className="text-sm font-medium text-[var(--accent)]">Integrations</p>
        <h1 className="font-display mt-2 text-4xl text-[var(--ink)]">
          Connections
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]/75">
          Wire these up one at a time. Nothing reaches your bank, car, or health
          data until you approve it — and only after Google + passkey / 2FA.
        </p>
      </header>

      <div className="mb-6 animate-steward-rise delay-1 flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-white/60 p-4">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
        <p className="text-xs leading-relaxed text-[var(--ink-soft)]/80">
          OAuth tokens will be stored encrypted server-side (Supabase). Preview
          tiles on Today use sample numbers only — not live accounts.
        </p>
      </div>

      <div className="space-y-8">
        {categories.map((category, idx) => (
          <section
            key={category}
            className={cn("animate-steward-rise", `delay-${Math.min(idx + 2, 6)}`)}
          >
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]/55">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {INTEGRATIONS.filter((i) => i.category === category).map(
                (item) => (
                  <article
                    key={item.id}
                    className="widget-panel flex flex-col p-5"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                          style={{ backgroundColor: item.accent }}
                        >
                          <Link2 className="h-4 w-4" />
                        </span>
                        <div>
                          <h3 className="font-semibold text-[var(--ink)]">
                            {item.name}
                          </h3>
                          <p className="text-[11px] font-medium text-[var(--ink-soft)]/60">
                            {statusLabel(item.status)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="flex-1 text-sm text-[var(--ink-soft)]/80">
                      {item.description}
                    </p>
                    <p className="mt-3 text-xs text-[var(--ink-soft)]/55">
                      {item.detail}
                    </p>
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-[var(--line)] bg-white/70"
                        disabled={item.status === "connected"}
                        onClick={() => {
                          window.alert(
                            `${item.name} connect flow will be added next. UI is ready.`
                          );
                        }}
                      >
                        {item.status === "connected"
                          ? "Connected"
                          : item.status === "ready"
                            ? "Connect"
                            : "Notify me when ready"}
                      </Button>
                    </div>
                  </article>
                )
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
