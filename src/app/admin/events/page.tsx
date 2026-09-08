"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminStore } from "@/lib/admin-store";
import type { AdminEventDraft } from "@/lib/admin-types";
import { formatEventRange, formatPrice } from "@/lib/utils";

export default function AdminEventsPage() {
  const events = useAdminStore((s) => s.events);
  const upsertEvent = useAdminStore((s) => s.upsertEvent);
  const deleteEvent = useAdminStore((s) => s.deleteEvent);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState<AdminEventDraft | null>(null);

  useEffect(() => setReady(true), []);

  if (!ready) return <p className="text-ink-soft">Loading events…</p>;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">
          Gatherings
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink">Events</h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Manage event details, capacity, pricing, and publish state for the public
          catalog.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-cloud">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-mist/60 text-xs uppercase tracking-[0.1em] text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-semibold">Event</th>
              <th className="hidden px-4 py-3 font-semibold md:table-cell">When</th>
              <th className="px-4 py-3 font-semibold">Fill</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-mist/30">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{event.title}</p>
                  <p className="text-xs text-ink-soft">
                    {event.city} · {formatPrice(event.price)}
                  </p>
                </td>
                <td className="hidden px-4 py-3 text-ink-soft md:table-cell">
                  {formatEventRange(event.startsAt, event.endsAt)}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {event.registered}/{event.capacity}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-sm border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                      event.published
                        ? "border-sea/25 bg-sea/10 text-sea"
                        : "border-line bg-mist text-ink-soft"
                    }`}
                  >
                    {event.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditing(event)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Delete “${event.title}”?`)) {
                          deleteEvent(event.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-cloud p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-ink">Edit event</h2>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Close
              </Button>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Title">
                <Input
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                />
              </Field>
              <Field label="City">
                <Input
                  value={editing.city}
                  onChange={(e) =>
                    setEditing({ ...editing, city: e.target.value })
                  }
                />
              </Field>
              <Field label="Subtitle">
                <Input
                  value={editing.subtitle}
                  onChange={(e) =>
                    setEditing({ ...editing, subtitle: e.target.value })
                  }
                />
              </Field>
              <Field label="Category">
                <Input
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({ ...editing, category: e.target.value })
                  }
                />
              </Field>
              <Field label="Capacity">
                <Input
                  type="number"
                  value={editing.capacity}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      capacity: Number(e.target.value) || 0,
                    })
                  }
                />
              </Field>
              <Field label="Registered">
                <Input
                  type="number"
                  value={editing.registered}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      registered: Number(e.target.value) || 0,
                    })
                  }
                />
              </Field>
              <Field label="Price (USD)">
                <Input
                  type="number"
                  value={editing.price}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      price: Number(e.target.value) || 0,
                    })
                  }
                />
              </Field>
              <Field label="Status">
                <select
                  className="h-10 w-full rounded-md border border-line bg-cloud px-3 text-sm"
                  value={editing.status}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      status: e.target.value as AdminEventDraft["status"],
                    })
                  }
                >
                  <option value="open">open</option>
                  <option value="almost-full">almost-full</option>
                  <option value="waitlist">waitlist</option>
                  <option value="closed">closed</option>
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Description">
                  <textarea
                    className="min-h-28 w-full rounded-md border border-line bg-cloud px-3 py-2 text-sm"
                    value={editing.description}
                    onChange={(e) =>
                      setEditing({ ...editing, description: e.target.value })
                    }
                  />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={editing.published}
                  onChange={(e) =>
                    setEditing({ ...editing, published: e.target.checked })
                  }
                />
                Published
              </label>
            </div>
            <Button
              className="mt-6"
              onClick={() => {
                upsertEvent(editing);
                setEditing(null);
              }}
            >
              Save event
            </Button>
          </div>
        </div>
      ) : null}
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
