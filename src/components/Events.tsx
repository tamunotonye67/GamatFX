import { useReveal } from "../lib/useReveal";
import { MapPin, CalendarDays, ArrowUpRight, Clock } from "lucide-react";
import { navigate } from "../lib/router";
import { useStore } from "../lib/store";

export default function Events() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const { allEvents, seatsLeft } = useStore();
  const featuredEvents = allEvents.filter((e) => e.status === "published" && e.featured);

  if (featuredEvents.length === 0) return null;

  return (
    <section id="events" className="section bg-cream overflow-hidden">
      <div ref={ref} className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center">Don't miss out</span>
          <h2 className="section-title mt-4">Featured Events</h2>
          <p className="mt-4 text-muted">Ongoing events for this month.</p>
        </div>

        <div
          className={`mx-auto mt-12 max-w-3xl space-y-6 reveal ${visible ? "is-visible" : ""}`}
        >
          {featuredEvents.map((ev) => {
            const left = seatsLeft(ev.id);
            const hasEndDate = !!(ev.endMonth || ev.endDay || ev.endYear);
            return (
              <div
                key={ev.id}
                className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_22px_60px_-30px_rgba(22,24,28,0.4)]"
              >
                <div className="grid sm:grid-cols-[auto_1fr]">
                  <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 bg-ink px-6 py-4 text-white sm:px-10 sm:py-7">
                    <div className="flex sm:flex-col items-baseline sm:items-center gap-2 sm:gap-0">
                      <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-brand-light">
                        {ev.month}
                      </span>
                      <span className="font-display text-3xl sm:text-5xl font-extrabold leading-none">
                        {ev.day}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-white/60">
                      {hasEndDate
                        ? `to ${ev.endMonth || ev.month} ${ev.endDay || ev.day}, ${ev.endYear || ev.year}`
                        : ev.year}
                    </span>
                  </div>

                  <div className="p-5 sm:p-7">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="chip">{ev.type}</span>
                      {ev.price > 0 ? (
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                          ₦{ev.price.toLocaleString()}
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                          Free
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 font-display text-lg sm:text-xl font-bold text-ink">
                      {ev.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{ev.description}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
                      <span className="inline-flex items-start gap-1.5">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" /> <span>{ev.location}</span>
                      </span>
                      {(ev.time || ev.endTime) && (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 shrink-0 text-brand" />{" "}
                          {ev.time}
                          {ev.endTime ? ` – ${ev.endTime}` : ""}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-brand" />{" "}
                        {left > 0 ? `${left} seat${left === 1 ? "" : "s"} left` : "Full"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/events")}
                      className="btn-primary mt-6 w-full sm:w-auto"
                    >
                      Register Now <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
