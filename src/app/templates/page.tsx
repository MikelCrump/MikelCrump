"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { templates } from "@/lib/data";
import { useArrivalStore } from "@/lib/store";

export default function TemplatesPage() {
  const events = useArrivalStore((s) => s.events);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">
          Check-in kit
        </p>
        <h1 className="mt-1 font-display text-4xl text-ink">Templates</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Badge, kiosk, email QR, and session-gate layouts you can assign per
          event. UI-first previews — ready to wire to printers next.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((tpl) => {
          const usedBy = events.filter((e) => e.templateId === tpl.id);
          return (
            <article
              key={tpl.id}
              className="overflow-hidden rounded-[1.5rem] border border-line/80 bg-cloud"
            >
              <div
                className="relative h-36 p-5 text-cloud"
                style={{
                  background: `linear-gradient(135deg, ${tpl.accent} 0%, #132a3e 100%)`,
                }}
              >
                <Badge variant="star">{tpl.kind}</Badge>
                <p className="mt-6 font-display text-3xl">{tpl.previewLabel}</p>
                <div className="absolute bottom-4 right-4 h-16 w-16 rounded-lg border border-white/30 bg-white/10" />
              </div>
              <div className="p-5">
                <h2 className="font-display text-2xl text-ink">{tpl.name}</h2>
                <p className="mt-2 text-sm text-ink-soft">{tpl.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tpl.fields.map((field) => (
                    <Badge key={field} variant="outline">
                      {field}
                    </Badge>
                  ))}
                </div>
                {usedBy.length > 0 && (
                  <p className="mt-4 text-xs text-ink-soft">
                    Used by {usedBy.map((e) => e.title).join(", ")}
                  </p>
                )}
                <Button asChild className="mt-5" variant="secondary">
                  <Link href={usedBy[0] ? `/events/${usedBy[0].id}` : "/events"}>
                    Preview on event
                  </Link>
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
