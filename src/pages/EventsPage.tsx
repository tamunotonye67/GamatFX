import { useState } from "react";
import PageHero from "../components/PageHero";
import PageCta from "../components/PageCta";
import { useReveal } from "../lib/useReveal";
import { useStore, type EventItem, type Registration } from "../lib/store";
import { navigate } from "../lib/router";
import { naira } from "../lib/courses";
import { CONTACT } from "../lib/contact";
import {
  MapPin, CalendarDays, Clock, ArrowUpRight, Users, Video, Ticket,
  CheckCircle2, AlertCircle, Copy, Loader2, Ban,
} from "lucide-react";

const past = [
  { month: "July", day: "13", year: "2026", type: "Physical", title: "July Mentorship Intake Graduation", body: "38 students graduated from our July cohort.", location: "Port Harcourt, Nigeria" },
  { month: "June", day: "29", year: "2026", type: "Online", title: "Supply & Demand Masterclass", body: "Over 1,200 attendees joined this free live masterclass.", location: "Zoom" },
  { month: "May", day: "18", year: "2026", type: "Hybrid", title: "Traders Meetup Port Harcourt", body: "A community networking day with live analysis and Q&A.", location: "Port Harcourt, Nigeria" },
];

const typeStyles: Record<string, string> = {
  Physical: "bg-brand-light text-brand",
  Online: "bg-ink text-white",
  Hybrid: "bg-amber-100 text-amber-700",
};

/* ------------------------------ Event card ------------------------------ */

function EventCard({ e, onRegister }: { e: EventItem; onRegister: (id: string) => void }) {
  const { seatsLeft, myRegistrations } = useStore();
  const left = seatsLeft(e.id);
  const soldOut = left === 0;
  const mine = myRegistrations.find((r) => r.eventId === e.id && r.status === "confirmed");
  const pct = e.capacity ? Math.round(((e.capacity - left) / e.capacity) * 100) : 0;

  return (
    <div className={`overflow-hidden rounded-3xl border bg-white shadow-[0_18px_50px_-32px_rgba(22,24,28,0.35)] transition-all duration-300 hover:-translate-y-1.5 ${soldOut ? "border-line opacity-90" : "border-line"}`}>
      <div className="grid sm:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center justify-center bg-ink px-8 py-7 text-white sm:px-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-light">{e.month}</span>
          <span className="font-display text-5xl font-extrabold leading-none">{e.day}</span>
          <span className="text-sm text-white/60">{e.year}</span>
        </div>

        <div className="p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${typeStyles[e.type]}`}>
              {e.type === "Online" ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}{e.type}
            </span>
            <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-ink">
              {e.price ? naira(e.price) : "Free"}
            </span>
            {soldOut && <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">Sold out</span>}
            {mine && <span className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white"><CheckCircle2 className="h-3.5 w-3.5" /> Registered</span>}
          </div>

          <h3 className="mt-3 font-display text-xl font-bold text-ink">{e.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{e.description}</p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-brand" /> {e.location}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-brand" /> {e.time}</span>
          </div>

          {/* Seats */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-ink">{e.capacity - left} of {e.capacity} seats taken</span>
              <span className={`font-bold ${soldOut ? "text-brand" : "text-muted"}`}>{soldOut ? "Fully booked" : `${left} left`}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-brand transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {mine ? (
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-brand/25 bg-brand-light p-4">
              <Ticket className="h-5 w-5 text-brand" />
              <div>
                <p className="text-xs text-muted">Your ticket</p>
                <p className="font-display text-sm font-extrabold text-brand">{mine.ticket}</p>
              </div>
              <button onClick={() => navigate("/dashboard")} className="ml-auto text-xs font-bold text-brand hover:underline">
                View in dashboard
              </button>
            </div>
          ) : (
            <button onClick={() => onRegister(e.id)} disabled={soldOut}
              className="btn-primary mt-6 disabled:cursor-not-allowed disabled:opacity-50">
              {soldOut ? <><Ban className="h-4 w-4" /> Fully Booked</> : <>Register Now <ArrowUpRight className="h-4 w-4" /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Registration ------------------------------ */

function RegistrationForm({ preset }: { preset: string }) {
  const { events, seatsLeft, registerForEvent, user, isAuthed } = useStore();
  const [eventId, setEventId] = useState(preset || events[0]?.id || "");
  const [name, setName] = useState(user ? `${user.firstName} ${user.lastName}` : "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<Registration | null>(null);
  const [copied, setCopied] = useState(false);

  // keep the select in sync when a card button is pressed
  if (preset && preset !== eventId && !ticket && !busy) setEventId(preset);

  const chosen = events.find((e) => e.id === eventId);
  const left = chosen ? seatsLeft(chosen.id) : 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    window.setTimeout(() => {
      const res = registerForEvent({ eventId, name, email, phone });
      setBusy(false);
      if (!res.ok) { setError(res.error ?? "Registration failed."); return; }
      setTicket(res.registration!);
    }, 900);
  };

  if (ticket) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
        <CheckCircle2 className="mx-auto h-14 w-14 text-brand" />
        <h3 className="mt-5 font-display text-2xl font-bold">You're registered!</h3>
        <p className="mt-2 text-white/65">
          A confirmation has been sent to <strong className="text-white">{ticket.email}</strong>.
        </p>

        <div className="mt-6 rounded-2xl border border-dashed border-brand/50 bg-brand/10 p-6">
          <p className="text-xs uppercase tracking-widest text-white/50">Your ticket number</p>
          <p className="mt-2 font-display text-3xl font-extrabold tracking-wider text-brand-light">{ticket.ticket}</p>
          <button
            onClick={() => { void navigator.clipboard?.writeText(ticket.ticket); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 transition hover:text-white">
            <Copy className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy ticket"}
          </button>
        </div>

        <div className="mt-5 space-y-1 text-sm text-white/70">
          <p className="font-semibold text-white">{ticket.eventTitle}</p>
          <p>{ticket.eventDate}</p>
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {isAuthed ? (
            <button onClick={() => navigate("/dashboard")} className="btn-primary">View in Dashboard</button>
          ) : (
            <button onClick={() => navigate("/signup")} className="btn-primary">Create an Account</button>
          )}
          <button onClick={() => { setTicket(null); setName(""); setEmail(""); setPhone(""); }} className="btn-ghost">
            Register someone else
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
      <div className="space-y-4">
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-brand/40 bg-brand/15 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-light" />
            <p className="text-sm text-white/85">{error}</p>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/60">Choose an event</label>
          <select required value={eventId} onChange={(e) => { setEventId(e.target.value); setError(null); }}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-brand focus:bg-white/10">
            <option value="" disabled className="bg-ink">Select an event…</option>
            {events.map((e) => {
              const l = seatsLeft(e.id);
              return (
                <option key={e.id} value={e.id} disabled={l === 0} className="bg-ink">
                  {e.month} {e.day} — {e.title} {l === 0 ? "(SOLD OUT)" : `(${l} left)`}
                </option>
              );
            })}
          </select>
          {chosen && (
            <p className="mt-2 text-xs text-white/50">
              {chosen.location} · {chosen.time} · {chosen.price ? naira(chosen.price) : "Free"} · <span className="font-semibold text-brand-light">{left} seats left</span>
            </p>
          )}
        </div>

        <Input label="Full name" value={name} onChange={setName} ph="Jane Doe" />
        <Input label="Email address" type="email" value={email} onChange={setEmail} ph="jane@example.com" />
        <Input label="Phone / WhatsApp" type="tel" value={phone} onChange={setPhone} ph={CONTACT.phone} />

        <button type="submit" disabled={busy || left === 0} className="btn-primary w-full disabled:opacity-60">
          {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Reserving your seat…</> : <><Ticket className="h-4 w-4" /> Confirm Registration</>}
        </button>
        <p className="text-center text-xs text-white/40">
          {isAuthed ? "This ticket will be saved to your dashboard." : "Registering as a guest — create an account to track your tickets."}
        </p>
      </div>
    </form>
  );
}

function Input({ label, value, onChange, ph, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; ph: string; type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/60">{label}</label>
      <input required type={type} value={value} placeholder={ph} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition focus:border-brand focus:bg-white/10" />
    </div>
  );
}

/* --------------------------------- Page --------------------------------- */

export default function EventsPage() {
  const { events, allEvents, admin } = useStore();
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [preset, setPreset] = useState("");

  const scrollToForm = (id: string) => {
    setPreset(id);
    document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <PageHero
        crumb="Events"
        eyebrow="Events & intakes"
        image="/images/about-hero.jpg"
        title={<>Learn with us, <span className="text-brand">live and in person</span></>}
        subtitle="Physical mentorship intakes in Port Harcourt, free online webinars and live market workshops — reserve your seat in seconds."
      />

      <section className="border-b border-line bg-white py-12">
        <div className="container-x grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          {[
            { icon: CalendarDays, v: String(events.length), l: "Upcoming events" },
            { icon: Users, v: String(admin.registrations.filter(r => r.status === "confirmed").length), l: "People registered" },
            { icon: Video, v: String(events.filter(e => e.type !== "Physical").length), l: "Online sessions" },
            { icon: Ticket, v: String(allEvents.reduce((s, e) => s + e.capacity, 0)), l: "Total seats" },
          ].map((s) => (
            <div key={s.l}>
              <s.icon className="mx-auto h-6 w-6 text-brand" />
              <div className="mt-3 font-display text-2xl font-extrabold text-ink">{s.v}</div>
              <p className="mt-1 text-sm text-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming */}
      <section className="section bg-cream">
        <div ref={ref} className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">Don't miss out</span>
            <h2 className="section-title mt-4">Upcoming events</h2>
            <p className="mt-4 text-muted">Mentorship intakes, free webinars and live market workshops.</p>
          </div>
          <div className="mx-auto mt-12 max-w-4xl space-y-6">
            {events.length ? events.map((e, i) => (
              <div key={e.id} className={`reveal ${visible ? "is-visible" : ""}`} style={{ transitionDelay: `${i * 100}ms` }}>
                <EventCard e={e} onRegister={scrollToForm} />
              </div>
            )) : (
              <p className="rounded-2xl border border-dashed border-line bg-white p-12 text-center text-muted">
                No events scheduled right now — check back soon.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Register */}
      <section id="register" className="section bg-ink text-white">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="eyebrow text-brand-light">Reserve your spot</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight md:text-4xl">
              Register for an upcoming event
            </h2>
            <p className="mt-4 text-white/70">
              Choose your event, tell us who you are, and we'll issue your ticket instantly.
            </p>
            <ul className="mt-8 space-y-3">
              {["Instant ticket number on confirmation", "Live seat availability — no overbooking", "Free rescheduling to any future intake"].map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-white/70">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" /> {p}
                </li>
              ))}
            </ul>
          </div>
          <RegistrationForm preset={preset} />
        </div>
      </section>

      {/* Past */}
      <section className="section bg-cream">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">Archive</span>
            <h2 className="section-title mt-4">Past events</h2>
          </div>
          <div className="mx-auto mt-12 max-w-4xl space-y-4">
            {past.map((e) => (
              <div key={e.title} className="flex flex-wrap items-center gap-5 rounded-2xl border border-line bg-white p-5 opacity-80">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-line/60">
                  <span className="text-[10px] font-bold uppercase text-muted">{e.month.slice(0, 3)}</span>
                  <span className="font-display text-lg font-extrabold text-ink">{e.day}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base font-bold text-ink">{e.title}</h3>
                  <p className="text-sm text-muted">{e.body}</p>
                </div>
                <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-muted">Completed</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageCta tone="red" title="Can't make it to an event?"
        body="Every course is available online with lifetime access — start learning today, from anywhere."
        primaryLabel="Browse Courses" primaryTo="/courses" />
    </>
  );
}
