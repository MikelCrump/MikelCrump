import { EventCard } from "@/components/catalog/cards";
import { events } from "@/lib/data";

export const metadata = {
  title: "Events",
};

export default function EventsPage() {
  return (
    <div>
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">
          Events management
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">
          Gather with intention
        </h1>
        <p className="mt-4 text-ink-soft">
          Summits, field labs, clinics, and retreats — each wired back to a learning path.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
