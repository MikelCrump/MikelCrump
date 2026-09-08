"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminStore } from "@/lib/admin-store";
import type { SiteSettings } from "@/lib/admin-types";

export default function AdminSitePage() {
  const site = useAdminStore((s) => s.site);
  const updateSite = useAdminStore((s) => s.updateSite);
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState<SiteSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => setReady(true), []);
  useEffect(() => setDraft(site), [site]);

  if (!ready || !draft) return <p className="text-ink-soft">Loading settings…</p>;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">
          General
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink">Site settings</h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Control brand copy, announcements, and operational toggles for CRUMP360.com.
        </p>
      </div>

      <section className="grid gap-4 rounded-xl border border-line bg-cloud p-5 md:grid-cols-2">
        <Field label="Site name">
          <Input
            value={draft.siteName}
            onChange={(e) => setDraft({ ...draft, siteName: e.target.value })}
          />
        </Field>
        <Field label="Brand URL">
          <Input
            value={draft.brandUrl}
            onChange={(e) => setDraft({ ...draft, brandUrl: e.target.value })}
          />
        </Field>
        <Field label="Tagline">
          <Input
            value={draft.tagline}
            onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
          />
        </Field>
        <Field label="Support email">
          <Input
            value={draft.supportEmail}
            onChange={(e) =>
              setDraft({ ...draft, supportEmail: e.target.value })
            }
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="Hero headline">
            <Input
              value={draft.heroHeadline}
              onChange={(e) =>
                setDraft({ ...draft, heroHeadline: e.target.value })
              }
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Hero supporting sentence">
            <textarea
              className="min-h-24 w-full rounded-md border border-line bg-cloud px-3 py-2 text-sm"
              value={draft.heroSupport}
              onChange={(e) =>
                setDraft({ ...draft, heroSupport: e.target.value })
              }
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Announcement banner">
            <Input
              value={draft.announcement}
              onChange={(e) =>
                setDraft({ ...draft, announcement: e.target.value })
              }
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={draft.maintenanceMode}
            onChange={(e) =>
              setDraft({ ...draft, maintenanceMode: e.target.checked })
            }
          />
          Maintenance mode
        </label>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => {
            updateSite(draft);
            setSaved(true);
            setTimeout(() => setSaved(false), 1800);
          }}
        >
          Save settings
        </Button>
        {saved ? (
          <p className="text-sm font-medium text-sea">Saved locally.</p>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
