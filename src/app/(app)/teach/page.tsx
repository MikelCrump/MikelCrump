import { courses, events } from "@/lib/data";
import { formatEventRange, formatPrice, seatsLeft } from "@/lib/utils";

export const metadata = {
  title: "Teach",
};

export default function TeachPage() {
  const totalSeats = events.reduce((s, e) => s + e.capacity, 0);
  const totalRegistered = events.reduce((s, e) => s + e.registered, 0);
  const totalLearners = courses.reduce((s, c) => s + c.enrolled, 0);

  return (
    <div className="space-y-10">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">
          Instructor console
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink">Teach & produce</h1>
        <p className="mt-3 text-ink-soft">
          A calm ops view for events and courses — capacity, enrollment, and what needs
          attention.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Event fill rate", value: `${Math.round((totalRegistered / totalSeats) * 100)}%` },
          { label: "Active registrations", value: totalRegistered.toLocaleString() },
          { label: "Course learners", value: totalLearners.toLocaleString() },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-line bg-cloud p-5">
            <p className="font-display text-3xl text-ink">{stat.value}</p>
            <p className="mt-1 text-sm text-ink-soft">{stat.label}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Events pipeline</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-line bg-cloud">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-mist/60 text-xs uppercase tracking-[0.1em] text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-semibold">Event</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">When</th>
                <th className="px-4 py-3 font-semibold">Fill</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">Price</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {events.map((event) => {
                const left = seatsLeft(event.capacity, event.registered);
                const fill = Math.round((event.registered / event.capacity) * 100);
                return (
                  <tr key={event.id} className="hover:bg-mist/40">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{event.title}</p>
                      <p className="text-xs text-ink-soft">{event.city}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-ink-soft md:table-cell">
                      {formatEventRange(event.startsAt, event.endsAt)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{fill}%</p>
                      <p className="text-xs text-ink-soft">
                        {event.registered}/{event.capacity}
                        {left === 0 ? " · full" : ""}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 text-ink-soft sm:table-cell">
                      {formatPrice(event.price)}
                    </td>
                    <td className="px-4 py-3 capitalize text-ink-soft">
                      {event.status.replace("-", " ")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Course catalog health</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="rounded-xl border border-line bg-cloud p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sea">
                {course.level}
              </p>
              <p className="mt-1 font-display text-xl text-ink">{course.title}</p>
              <p className="mt-3 text-sm text-ink-soft">
                {course.enrolled.toLocaleString()} enrolled · {course.rating.toFixed(1)} rating
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                {course.modules.length} modules · {course.durationHours}h
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
