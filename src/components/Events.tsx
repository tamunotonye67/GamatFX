import { useReveal } from "../lib/useReveal";
import { MapPin, CalendarDays, ArrowUpRight } from "lucide-react";
import { navigate } from "../lib/router";

const event = {
  month: "August",
  day: "10",
  year: "2026",
  type: "Physical",
  title: "Join Our Forex Mentorship Class For August 2026",
  body: "Get the knowledge, support, and experience needed to succeed in forex. Limited seats available — secure yours today.",
  location: "Skillerville Gleetech, Rumuologu, Choba-Ozouba Road, Port Harcourt",
};

export default function Events() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="events" className="section bg-cream">
      <div ref={ref} className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center">Don't miss out</span>
          <h2 className="section-title mt-4">Events</h2>
          <p className="mt-4 text-muted">Ongoing events for this month.</p>
        </div>

        <div
          className={`mx-auto mt-12 max-w-3xl reveal ${visible ? "is-visible" : ""}`}
        >
          <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_22px_60px_-30px_rgba(22,24,28,0.4)]">
            <div className="grid sm:grid-cols-[auto_1fr]">
              <div className="flex flex-col items-center justify-center bg-ink px-8 py-7 text-white sm:px-10">
                <span className="text-sm font-semibold uppercase tracking-widest text-brand-light">
                  {event.month}
                </span>
                <span className="font-display text-5xl font-extrabold leading-none">
                  {event.day}
                </span>
                <span className="text-sm text-white/60">{event.year}</span>
              </div>

              <div className="p-7">
                <span className="chip">{event.type}</span>
                <h3 className="mt-3 font-display text-xl font-bold text-ink">
                  {event.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{event.body}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-brand" /> {event.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-brand" /> Seats filling fast
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/events")}
                  className="btn-primary mt-6"
                >
                  Register Now <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
