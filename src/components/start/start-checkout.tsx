"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TierId = "starter" | "team" | "campus";

const tiers: {
  id: TierId;
  name: string;
  price: number;
  blurb: string;
  features: string[];
  highlighted?: boolean;
}[] = [
  {
    id: "starter",
    name: "Starter",
    price: 99,
    blurb: "For a single program or cohort getting oriented.",
    features: [
      "1 workspace",
      "Up to 25 learner seats",
      "Events + course catalog",
      "Basic progress tracking",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: 249,
    blurb: "For ops teams running recurring clinics and summits.",
    features: [
      "3 workspaces",
      "Up to 100 learner seats",
      "Seat management",
      "Quiz bank + media lessons",
      "Priority onboarding",
    ],
    highlighted: true,
  },
  {
    id: "campus",
    name: "Campus",
    price: 599,
    blurb: "For multi-site orgs that need volume and control.",
    features: [
      "Unlimited workspaces",
      "Custom seat packs",
      "Admin portal + roles",
      "SSO-ready (coming soon)",
      "Dedicated success contact",
    ],
  },
];

const includedSeats: Record<TierId, number> = {
  starter: 25,
  team: 100,
  campus: 250,
};

const extraSeatPrice: Record<TierId, number> = {
  starter: 8,
  team: 6,
  campus: 4,
};

export function StartCheckout() {
  const [tierId, setTierId] = useState<TierId>("team");
  const [extraSeats, setExtraSeats] = useState(0);

  const tier = tiers.find((t) => t.id === tierId)!;
  const baseSeats = includedSeats[tierId];
  const totalSeats = baseSeats + extraSeats;
  const monthly = useMemo(
    () => tier.price + extraSeats * extraSeatPrice[tierId],
    [tier.price, extraSeats, tierId]
  );

  return (
    <div className="mt-12 space-y-10">
      <section className="grid gap-4 md:grid-cols-3">
        {tiers.map((t) => {
          const active = t.id === tierId;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTierId(t.id);
                setExtraSeats(0);
              }}
              className={cn(
                "rounded-2xl border p-5 text-left transition",
                active
                  ? "border-blue bg-blue/5 shadow-[0_12px_40px_-24px_rgba(46,65,222,0.55)]"
                  : "border-line bg-surface hover:border-navy/25",
                t.highlighted && !active && "ring-1 ring-orange/40"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-xl text-navy">{t.name}</p>
                {t.highlighted ? (
                  <span className="rounded-md bg-orange/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                    Popular
                  </span>
                ) : null}
              </div>
              <p className="mt-3 font-display text-3xl text-navy">
                ${t.price}
                <span className="text-sm font-semibold text-muted">/mo</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t.blurb}</p>
              <ul className="mt-4 space-y-2">
                {t.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-navy"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </section>

      <section className="grid gap-6 rounded-2xl border border-line bg-surface p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
        <div>
          <h2 className="font-display text-2xl text-navy">Seats</h2>
          <p className="mt-2 text-sm text-muted">
            {tier.name} includes <strong>{baseSeats}</strong> seats. Add more
            now if you already know your headcount — adjustable later.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <p className="text-sm font-semibold text-navy">Extra seats</p>
            <div className="inline-flex items-center gap-2 rounded-lg border border-line bg-page p-1">
              <button
                type="button"
                aria-label="Fewer seats"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-mist disabled:opacity-40"
                disabled={extraSeats <= 0}
                onClick={() => setExtraSeats((n) => Math.max(0, n - 5))}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-12 text-center font-display text-lg tabular-nums text-navy">
                {extraSeats}
              </span>
              <button
                type="button"
                aria-label="More seats"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-mist"
                onClick={() => setExtraSeats((n) => n + 5)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted">
              +${extraSeatPrice[tierId]}/seat · total{" "}
              <span className="font-semibold text-navy">{totalSeats}</span> seats
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-navy p-5 text-cloud">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange">
            Summary
          </p>
          <p className="mt-3 font-display text-2xl">{tier.name}</p>
          <p className="mt-1 text-sm text-cloud/70">{totalSeats} seats</p>
          <p className="mt-6 font-display text-4xl">
            ${monthly}
            <span className="text-base font-semibold text-cloud/60">/mo</span>
          </p>
          <p className="mt-2 text-xs text-cloud/55">
            Placeholder pricing — not charged yet.
          </p>
          <Button asChild size="lg" variant="star" className="mt-6 w-full">
            <Link href="/dashboard">Continue to platform</Link>
          </Button>
          <p className="mt-3 text-center text-xs text-cloud/50">
            Checkout wiring comes next. This saves your selection in-session for
            now.
          </p>
        </div>
      </section>
    </div>
  );
}
