import type { Metadata } from "next";
import { StartCheckout } from "@/components/start/start-checkout";
import { Crump360Wordmark } from "@/components/brand/crump360-mark";
import { marketingHomeUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Start — Choose your plan",
  description:
    "Subscribe to CRUMP360. Pick a plan, choose seats, and get events plus learning on one path.",
};

export default function StartPage() {
  return (
    <div className="min-h-screen bg-page">
      <header className="border-b border-line bg-navy text-cloud">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5 md:px-8">
          <Crump360Wordmark className="h-8 w-auto" priority />
          <a
            href={marketingHomeUrl()}
            className="text-sm font-semibold text-cloud/70 transition hover:text-orange"
          >
            About CRUMP360
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue">
            Get started
          </p>
          <h1 className="mt-3 font-display text-4xl text-navy text-balance md:text-5xl">
            Choose a plan. Add seats. Run your next gathering.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
            CRUMP360 is the product for events and learning on one path.
            Pricing below is placeholder — we&apos;ll lock numbers with you
            later.
          </p>
        </div>

        <StartCheckout />
      </main>
    </div>
  );
}
