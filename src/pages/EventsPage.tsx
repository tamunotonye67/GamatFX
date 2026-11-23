import { useEffect, useState } from "react";
import PageHero from "../components/PageHero";
import PageCta from "../components/PageCta";
import { useReveal } from "../lib/useReveal";
import { useStore, type EventItem, type Registration } from "../lib/store";
import { navigate } from "../lib/router";
import { naira } from "../lib/courses";
import { formatAccountName, formatStudentName } from "../lib/formatName";
import { CONTACT } from "../lib/contact";
import { generateTxRef, payWithBachs } from "../lib/bachs";
import {
  MapPin, CalendarDays, Clock, ArrowUpRight, Users, Video, Ticket,
  CheckCircle2, AlertCircle, Copy, Loader2, Ban, CalendarPlus, Download,
  Mail, CreditCard, Sparkles,
} from "lucide-react";

const MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

function parseEventTimes(ev?: EventItem): { start: Date; end: Date } {
  const now = new Date();
  const year = ev ? parseInt(ev.year, 10) || now.getFullYear() : now.getFullYear();
  const monthIdx = ev ? (MONTHS[ev.month.trim().toLowerCase()] ?? now.getMonth()) : now.getMonth();
  const day = ev ? parseInt(ev.day, 10) || 1 : 1;

  let startHour = 10;
  let startMin = 0;
  if (ev?.time) {
    const m = ev.time.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (m) {
      let h = parseInt(m[1], 10);
      const min = m[2] ? parseInt(m[2], 10) : 0;
      const ampm = m[3]?.toUpperCase();
      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      startHour = h;
      startMin = min;
    }
  }
  const start = new Date(year, monthIdx, day, startHour, startMin, 0);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  return { start, end };
}

function toIcsUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function googleCalendarUrl(ev: EventItem | undefined, ticket: Registration): string {
  const { start, end } = parseEventTimes(ev);
  const details = `Ticket: ${ticket.ticket}\nAttendee: ${ticket.name}\n\n${ev?.description || "GAMAT FX Academy Event"}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ticket.eventTitle,
    dates: `${toIcsUtc(start)}/${toIcsUtc(end)}`,
    details,
    location: ev?.location || "Port Harcourt / Online",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function downloadIcsFile(ev: EventItem | undefined, ticket: Registration) {
  const { start, end } = parseEventTimes(ev);
  const escapeIcs = (s: string) => s.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GAMAT FX Academy//Events//EN",
    "BEGIN:VEVENT",
    `UID:${ticket.id}@gamatfxacademy.com`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcs(ticket.eventTitle)}`,
    `LOCATION:${escapeIcs(ev?.location || "GAMAT FX Academy")}`,
    `DESCRIPTION:${escapeIcs(`Ticket: ${ticket.ticket} | Attendee: ${ticket.name}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gamatfx-${ticket.ticket.toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function sendEventConfirmationEmail(
  reg: Registration,
  ev?: EventItem
): Promise<{ status: "sent" | "skipped" | "error"; message?: string }> {
  try {
    const res = await fetch("/api/send-event-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: reg.email,
        name: reg.name,
        ticket: reg.ticket,
        eventTitle: reg.eventTitle,
        eventDate: reg.eventDate,
        eventTime: ev?.time || "",
        eventLocation: ev?.location || "",
        price: reg.amountPaid ?? ev?.price ?? 0,
        paymentRef: reg.paymentRef || "",
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) return { status: "sent" };
    if (data.skipped) return { status: "skipped", message: data.message };
    return { status: "error", message: data.message || "Could not send email." };
  } catch {
    return { status: "skipped", message: "Email service unavailable in local preview." };
  }
}

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
  const { seatsLeft, myRegistrations, confirmEventSeat, checkInWithCode } = useStore();
  const left = seatsLeft(e.id);
  const soldOut = left === 0;
  const mine = myRegistrations.find((r) => r.eventId === e.id && r.status === "confirmed");
  const pct = e.capacity ? Math.round(((e.capacity - left) / e.capacity) * 100) : 0;
  const hasEndDate = !!(e.endMonth || e.endDay || e.endYear);
  const [codeInput, setCodeInput] = useState("");
  const [codeErr, setCodeErr] = useState("");

  return (
    <div className={`overflow-hidden rounded-3xl border bg-white shadow-[0_18px_50px_-32px_rgba(22,24,28,0.35)] transition-all duration-300 hover:-translate-y-1.5 ${soldOut ? "border-line opacity-90" : "border-line"}`}>
      <div className="grid sm:grid-cols-[auto_1fr]">
        <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 bg-ink px-6 py-4 text-white sm:px-10 sm:py-7">
          <div className="flex sm:flex-col items-baseline sm:items-center gap-2 sm:gap-0">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-light">{e.month}</span>
            <span className="font-display text-3xl sm:text-5xl font-extrabold leading-none">{e.day}</span>
          </div>
          <span className="text-xs sm:text-sm text-white/60">
            {hasEndDate ? `to ${e.endMonth || e.month} ${e.endDay || e.day}, ${e.endYear || e.year}` : e.year}
          </span>
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 sm:px-4 sm:py-1.5 text-xs font-semibold uppercase tracking-wide ${typeStyles[e.type]}`}>
              {e.type === "Online" ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}{e.type}
            </span>
            <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-ink">
              {e.price ? naira(e.price) : "Free"}
            </span>
            {soldOut && <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">Sold out</span>}
            {mine && <span className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white"><CheckCircle2 className="h-3.5 w-3.5" /> Registered</span>}
          </div>

          <h3 className="mt-3 font-display text-lg sm:text-xl font-bold text-ink">{e.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{e.description}</p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
            <span className="inline-flex items-start gap-1.5"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" /> <span>{e.location}</span></span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-brand" /> {e.time}{e.endTime ? ` – ${e.endTime}` : ""}
            </span>
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
            <div className="mt-5 space-y-3 rounded-xl border border-brand/25 bg-brand-light p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Ticket className="h-5 w-5 text-brand" />
                <div>
                  <p className="text-xs text-muted">Your ticket</p>
                  <p className="font-display text-sm font-extrabold text-brand">{mine.ticket}</p>
                </div>
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  {mine.checkedIn ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white">
                      <CheckCircle2 className="h-3 w-3" /> Attended
                    </span>
                  ) : mine.seatConfirmed ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-[11px] font-bold text-amber-800">
                      <CheckCircle2 className="h-3 w-3" /> Seat Confirmed
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => confirmEventSeat(mine.id)}
                      className="rounded-full bg-ink px-3 py-1 text-[11px] font-bold text-white hover:bg-ink/90 transition cursor-pointer"
                    >
                      Confirm My Seat
                    </button>
                  )}
                  <button onClick={() => navigate("/dashboard")} className="text-xs font-bold text-brand hover:underline cursor-pointer">
                    Dashboard
                  </button>
                </div>
              </div>

              {mine.attendedSessions && mine.attendedSessions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {mine.attendedSessions.map((a) => (
                    <span key={a.sessionId} className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      <CheckCircle2 className="h-3 w-3" /> {a.label}
                    </span>
                  ))}
                </div>
              )}

              {((e.sessions && e.sessions.length > 0 && (mine.attendedSessions?.length || 0) < e.sessions.length) || (!e.sessions?.length && !mine.checkedIn)) && (
                <form
                  onSubmit={(evForm) => {
                    evForm.preventDefault();
                    setCodeErr("");
                    const res = checkInWithCode(e.id, mine.ticket, codeInput);
                    if (res.ok) {
                      setCodeInput("");
                    } else {
                      setCodeErr(res.error || "Invalid code");
                    }
                  }}
                  className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand/15"
                >
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(evIn) => setCodeInput(evIn.target.value.toUpperCase())}
                    placeholder={e.sessions?.length ? "Enter class session code" : "Enter live check-in code"}
                    className="flex-1 min-w-[150px] rounded-lg border border-brand/25 bg-white px-3 py-1.5 text-xs font-mono text-ink outline-none focus:border-brand"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-dark transition cursor-pointer"
                  >
                    Check In
                  </button>
                  {codeErr && <p className="w-full text-[11px] font-semibold text-rose-600">{codeErr}</p>}
                </form>
              )}
            </div>
          ) : (
            <button onClick={() => onRegister(e.id)} disabled={soldOut}
              className="btn-primary mt-6 w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-50">
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
  const { events, seatsLeft, canRegisterForEvent, registerForEvent, saveRegistrationSurvey, saveRegistrationFeedback, confirmEventSeat, checkInWithCode, findRegistration, myRegistrations, admin, user, isAuthed } = useStore();
  const [eventId, setEventId] = useState(preset || events[0]?.id || "");
  const [name, setName] = useState(user ? formatAccountName(user) : "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<Registration | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailState, setEmailState] = useState<"idle" | "sending" | "sent" | "skipped" | "error">("idle");
  const [qrFallback, setQrFallback] = useState(false);
  const [ticketCheckInCode, setTicketCheckInCode] = useState("");
  const [ticketCheckInErr, setTicketCheckInErr] = useState("");

  // Optional pre-event survey state
  const [experience, setExperience] = useState("Beginner (0–1 yr)");
  const [struggle, setStruggle] = useState("Risk Management");
  const [pair, setPair] = useState("Gold (XAUUSD)");
  const [question, setQuestion] = useState("");
  const [surveySaved, setSurveySaved] = useState(false);

  // Optional post-event feedback state
  const [fbRating, setFbRating] = useState(5);
  const [fbTakeaway, setFbTakeaway] = useState("");
  const [fbNextTopic, setFbNextTopic] = useState("");
  const [fbSaved, setFbSaved] = useState(false);

  // If user opens /events?ticket=... from their confirmation email, display their ticket
  useEffect(() => {
    const hashQuery = window.location.hash.includes("?") ? window.location.hash.split("?")[1] : "";
    const searchParams = new URLSearchParams(window.location.search || hashQuery);
    const ticketParam = searchParams.get("ticket")?.trim().toUpperCase();
    if (!ticketParam) return;
    const found =
      myRegistrations.find((r) => r.ticket.toUpperCase() === ticketParam) ||
      admin.registrations.find((r) => r.ticket.toUpperCase() === ticketParam);
    if (found) {
      setTicket(found);
      setEmailState("sent");
      if (found.survey?.submittedAt) setSurveySaved(true);
    }
  }, [myRegistrations, admin.registrations]);

  // keep the select in sync when a card button is pressed
  if (preset && preset !== eventId && !ticket && !busy) setEventId(preset);

  const chosen = events.find((e) => e.id === eventId);
  const left = chosen ? seatsLeft(chosen.id) : 0;
  const isPaid = !!(chosen && chosen.price > 0);

  const triggerEmail = async (reg: Registration, ev?: EventItem) => {
    setEmailState("sending");
    const result = await sendEventConfirmationEmail(reg, ev);
    setEmailState(result.status);
  };

  const finalizeRegistration = (paymentRef?: string, amountPaid?: number) => {
    const res = registerForEvent({
      eventId,
      name: formatStudentName(name.trim()),
      email,
      phone,
      paymentRef,
      amountPaid,
    });
    setBusy(false);
    if (!res.ok || !res.registration) {
      setError(res.error ?? "Registration failed.");
      return;
    }
    setQrFallback(false);
    setSurveySaved(false);
    setTicket(res.registration);
    void triggerEmail(res.registration, chosen);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const check = canRegisterForEvent({ eventId, email });
    if (!check.ok) {
      setError(check.error ?? "Unable to register for this event.");
      return;
    }

    setBusy(true);

    if (isPaid && chosen) {
      void payWithBachs({
        amount: chosen.price,
        currency: "NGN",
        email: email.trim(),
        name: formatStudentName(name.trim()),
        phone: phone.trim(),
        reference: generateTxRef("EVT"),
        metadata: {
          type: "event_registration",
          eventId: chosen.id,
          eventTitle: chosen.title,
        },
        onSuccess: (session) => {
          finalizeRegistration(session.reference, chosen.price);
        },
        onClose: () => {
          setBusy(false);
        },
        onError: (err) => {
          setBusy(false);
          setError(err.message || "Payment was not completed.");
        },
      });
      return;
    }

    window.setTimeout(() => {
      finalizeRegistration();
    }, 600);
  };

  if (ticket) {
    const ticketEvent = events.find((e) => e.id === ticket.eventId) || chosen;
    const ticketVerifyUrl = `https://gamatfxacademy.com/#/events?ticket=${encodeURIComponent(ticket.ticket)}`;
    const qrSrc = qrFallback
      ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&data=${encodeURIComponent(ticketVerifyUrl)}`
      : `/api/qr?ticket=${encodeURIComponent(ticket.ticket)}`;

    const handleSurveySubmit = (evForm: React.FormEvent) => {
      evForm.preventDefault();
      saveRegistrationSurvey(ticket.id, {
        experience,
        struggle,
        pair,
        question: question.trim() || undefined,
      });
      setSurveySaved(true);
    };

    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-8 text-center backdrop-blur-sm">
        <CheckCircle2 className="mx-auto h-14 w-14 text-brand" />
        <h3 className="mt-4 font-display text-2xl font-bold">You're registered!</h3>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm text-white/70">
          <Mail className="h-4 w-4 text-brand-light shrink-0" />
          {emailState === "sending" && <span>Sending confirmation email to <strong className="text-white">{ticket.email}</strong>…</span>}
          {emailState === "sent" && <span>Confirmation email sent to <strong className="text-white">{ticket.email}</strong>.</span>}
          {(emailState === "skipped" || emailState === "idle") && (
            <span>Ticket confirmed for <strong className="text-white">{ticket.email}</strong>.</span>
          )}
          {emailState === "error" && (
            <span>Ticket confirmed! Could not reach email server — save your ticket below.</span>
          )}
          {emailState !== "sending" && (
            <button
              type="button"
              onClick={() => void triggerEmail(ticket, ticketEvent)}
              className="text-xs font-semibold text-brand-light underline hover:text-white cursor-pointer"
            >
              Resend email
            </button>
          )}
        </div>

        {/* Ticket + QR Code */}
        <div className="mt-6 rounded-2xl border border-dashed border-brand/50 bg-brand/10 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <div className="shrink-0 rounded-xl bg-white p-2 shadow-md">
              <img
                src={qrSrc}
                alt={`QR code for ticket ${ticket.ticket}`}
                onError={() => { if (!qrFallback) setQrFallback(true); }}
                className="h-28 w-28 rounded-lg object-contain"
              />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-widest text-white/50">Your ticket number</p>
              <p className="mt-1.5 font-display text-2xl sm:text-3xl font-extrabold tracking-wider text-brand-light break-all">{ticket.ticket}</p>
              {ticket.paymentRef && (
                <p className="mt-1 text-[11px] text-emerald-300 font-semibold">
                  Paid {ticket.amountPaid ? naira(ticket.amountPaid) : ""} · Ref: {ticket.paymentRef}
                </p>
              )}
              <button
                type="button"
                onClick={() => { void navigator.clipboard?.writeText(ticket.ticket); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 transition hover:text-white cursor-pointer">
                <Copy className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy ticket"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-1 text-sm text-white/70">
          <p className="font-semibold text-white">{ticket.eventTitle}</p>
          <p>{ticket.eventDate}{ticketEvent?.time ? ` · ${ticketEvent.time}` : ""}</p>
          {ticketEvent?.location && <p className="text-xs text-white/50">{ticketEvent.location}</p>}
        </div>

        {/* Add to Calendar */}
        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          <a
            href={googleCalendarUrl(ticketEvent, ticket)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            <CalendarPlus className="h-3.5 w-3.5 text-brand-light" /> Add to Google Calendar
          </a>
          {ticket.seatConfirmed ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-4 py-2 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" /> Seat Confirmed
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                confirmEventSeat(ticket.id);
                setTicket({ ...ticket, seatConfirmed: true, seatConfirmedAt: Date.now() });
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-dark cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Confirm My Seat
            </button>
          )}
          <button
            type="button"
            onClick={() => downloadIcsFile(ticketEvent, ticket)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-brand-light" /> Download .ICS
          </button>
        </div>

        {/* Live Event Check-In */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4 text-left space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-light">Live Event Check-In</p>
          {ticket.attendedSessions && ticket.attendedSessions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {ticket.attendedSessions.map((a) => (
                <span key={a.sessionId} className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" /> {a.label}
                </span>
              ))}
            </div>
          )}
          {ticket.checkedIn && (!ticketEvent?.sessions?.length || (ticket.attendedSessions?.length || 0) >= ticketEvent.sessions.length) ? (
            <p className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <CheckCircle2 className="h-4 w-4" /> Attended ✓ — You are checked in!
            </p>
          ) : (
            <form
              onSubmit={(evForm) => {
                evForm.preventDefault();
                setTicketCheckInErr("");
                const res = checkInWithCode(ticket.eventId, ticket.ticket, ticketCheckInCode);
                if (res.ok) {
                  const updated = findRegistration(ticket.ticket);
                  setTicket(updated || { ...ticket, checkedIn: true, checkedInAt: Date.now(), checkInMethod: "code", seatConfirmed: true });
                  setTicketCheckInCode("");
                } else {
                  setTicketCheckInErr(res.error || "Invalid check-in code.");
                }
              }}
              className="flex flex-wrap items-center gap-2"
            >
              <input
                type="text"
                value={ticketCheckInCode}
                onChange={(evIn) => setTicketCheckInCode(evIn.target.value.toUpperCase())}
                placeholder={ticketEvent?.sessions?.length ? "Enter class session code" : "Enter live check-in code"}
                className="flex-1 min-w-[160px] rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-mono text-white placeholder:text-white/40 outline-none focus:border-brand"
              />
              <button
                type="submit"
                className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white hover:bg-brand-dark transition cursor-pointer"
              >
                Check In
              </button>
              {ticketCheckInErr && <p className="w-full text-[11px] font-semibold text-rose-400">{ticketCheckInErr}</p>}
            </form>
          )}
        </div>

        {/* Optional Pre-Event Survey */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5 text-left">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-light">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Quick Pre-Event Survey (Optional)</span>
          </div>
          {surveySaved || ticket.survey ? (
            <p className="mt-2 text-xs sm:text-sm text-emerald-300 font-medium">
              Thanks! Your survey responses are saved for the desk team.
            </p>
          ) : (
            <form onSubmit={handleSurveySubmit} className="mt-3 space-y-3">
              <p className="text-xs text-white/60">
                Help Chief Mentor Tonye &amp; the desk tailor this session to you.
              </p>
              <div className="grid sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-white/60">Trading experience</label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-brand"
                  >
                    <option value="Beginner (0–1 yr)" className="bg-ink">Beginner (0–1 yr)</option>
                    <option value="Intermediate (1–3 yrs)" className="bg-ink">Intermediate (1–3 yrs)</option>
                    <option value="Advanced (3+ yrs)" className="bg-ink">Advanced (3+ yrs)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-white/60">Biggest struggle</label>
                  <select
                    value={struggle}
                    onChange={(e) => setStruggle(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-brand"
                  >
                    <option value="Risk Management" className="bg-ink">Risk Management</option>
                    <option value="Entries & Timing" className="bg-ink">Entries &amp; Timing</option>
                    <option value="Market Structure & Liquidity" className="bg-ink">Market Structure &amp; Liquidity</option>
                    <option value="Trading Psychology & Discipline" className="bg-ink">Trading Psychology &amp; Discipline</option>
                    <option value="Overtrading / Revenge Trading" className="bg-ink">Overtrading / Revenge Trading</option>
                    <option value="Passing Prop Firm Challenges" className="bg-ink">Passing Prop Firm Challenges</option>
                    <option value="Exit Strategy & Take Profit" className="bg-ink">Exit Strategy &amp; Take Profit</option>
                    <option value="Consistency & Trade Plan" className="bg-ink">Consistency &amp; Trade Plan</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-white/60">Favorite market / pair</label>
                  <select
                    value={pair}
                    onChange={(e) => setPair(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-brand"
                  >
                    <option value="Gold (XAUUSD)" className="bg-ink">Gold (XAUUSD)</option>
                    <option value="EURUSD" className="bg-ink">EURUSD</option>
                    <option value="GBPUSD" className="bg-ink">GBPUSD</option>
                    <option value="USDJPY" className="bg-ink">USDJPY</option>
                    <option value="GBPJPY" className="bg-ink">GBPJPY</option>
                    <option value="NAS100 / US30 (Indices)" className="bg-ink">NAS100 / US30 (Indices)</option>
                    <option value="Synthetic Indices (V75, Boom/Crash)" className="bg-ink">Synthetic Indices (V75, Boom/Crash)</option>
                    <option value="Crypto (BTC, ETH)" className="bg-ink">Crypto (BTC, ETH)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-white/60">One question you want answered live?</label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Optional — e.g. How to spot London session traps?"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/35 outline-none focus:border-brand"
                />
              </div>
              <button type="submit" className="btn-primary !py-2 !px-4 text-xs">
                Submit Survey
              </button>
            </form>
          )}
        </div>

        {/* Post-Event Feedback (shown after Check-In) */}
        {ticket.checkedIn && (
          <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-950/30 p-4 sm:p-5 text-left">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Post-Event Feedback</span>
            </div>
            {fbSaved || ticket.feedback ? (
              <p className="mt-2 text-xs sm:text-sm text-emerald-300 font-medium">
                Thank you for rating this session! Your feedback helps us improve.
              </p>
            ) : (
              <form
                onSubmit={(evForm) => {
                  evForm.preventDefault();
                  saveRegistrationFeedback(ticket.id, {
                    rating: fbRating,
                    takeaway: fbTakeaway.trim() || undefined,
                    nextTopic: fbNextTopic.trim() || undefined,
                  });
                  setFbSaved(true);
                }}
                className="mt-3 space-y-3"
              >
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-white/70">Rate today&apos;s session (1–5)</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setFbRating(n)}
                        className={`h-8 w-8 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          fbRating >= n
                            ? "bg-amber-400 text-ink border-amber-300"
                            : "bg-white/5 text-white/60 border-white/15"
                        }`}
                      >
                        {n}★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-white/70">Biggest takeaway today?</label>
                  <input
                    type="text"
                    value={fbTakeaway}
                    onChange={(e) => setFbTakeaway(e.target.value)}
                    placeholder="e.g. Waiting for liquidity sweep before entry"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/35 outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-white/70">What topic should we cover next?</label>
                  <input
                    type="text"
                    value={fbNextTopic}
                    onChange={(e) => setFbNextTopic(e.target.value)}
                    placeholder="Optional — e.g. Gold NY session scalping"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/35 outline-none focus:border-brand"
                  />
                </div>
                <button type="submit" className="btn-primary !py-2 !px-4 text-xs">
                  Send Feedback
                </button>
              </form>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {isAuthed ? (
            <button type="button" onClick={() => navigate("/dashboard")} className="btn-primary">View in Dashboard</button>
          ) : (
            <button type="button" onClick={() => navigate("/signup")} className="btn-primary">Create an Account</button>
          )}
          <button
            type="button"
            onClick={() => {
              setTicket(null);
              setName("");
              setEmail("");
              setPhone("");
              setEmailState("idle");
              setSurveySaved(false);
              setQuestion("");
            }}
            className="btn-ghost"
          >
            Register someone else
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-8 backdrop-blur-sm">
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
          {busy ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> {isPaid ? "Opening secure checkout…" : "Reserving your seat…"}</>
          ) : isPaid && chosen ? (
            <><CreditCard className="h-4 w-4" /> Proceed to Payment • {naira(chosen.price)}</>
          ) : (
            <><Ticket className="h-4 w-4" /> Confirm Registration</>
          )}
        </button>
        <p className="text-center text-xs text-white/40">
          {isPaid
            ? "Your seat & ticket are issued immediately after payment confirmation."
            : isAuthed
              ? "This ticket will be saved to your dashboard."
              : "Registering as a guest — create an account to track your tickets."}
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
  const { events, pastEvents, allEvents, admin, findRegistration, confirmEventSeat, checkInWithCode } = useStore();
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [preset, setPreset] = useState("");
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupResult, setLookupResult] = useState<Registration | null>(null);
  const [lookupNotFound, setLookupNotFound] = useState(false);
  const [lookupCode, setLookupCode] = useState("");
  const [lookupCodeErr, setLookupCodeErr] = useState("");

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

          {/* Ticket Lookup & Guest Check-In Bar */}
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-line bg-white p-4 sm:p-5 shadow-xs">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setLookupNotFound(false);
                setLookupCodeErr("");
                const found = findRegistration(lookupQuery);
                if (found) {
                  setLookupResult(found);
                } else {
                  setLookupResult(null);
                  setLookupNotFound(true);
                }
              }}
              className="flex flex-wrap items-center gap-2.5"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-ink shrink-0">
                <Ticket className="h-4 w-4 text-brand" />
                <span>Already registered?</span>
              </div>
              <input
                type="text"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                placeholder="Enter your email or ticket (e.g. GAMAT-1234)"
                className="flex-1 min-w-[200px] rounded-xl border border-line bg-cream/60 px-3.5 py-2 text-xs text-ink outline-none focus:border-brand focus:bg-white"
              />
              <button type="submit" className="btn-primary !py-2 !px-4 text-xs">
                Find Ticket
              </button>
            </form>

            {lookupNotFound && (
              <p className="mt-2.5 text-xs font-medium text-rose-600">
                No confirmed registration found for "{lookupQuery}".
              </p>
            )}

            {lookupResult && (() => {
              const evObj = allEvents.find((ev) => ev.id === lookupResult.eventId);
              return (
                <div className="mt-4 rounded-xl border border-brand/25 bg-brand-light/40 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-ink">{lookupResult.name} · <code className="text-brand">{lookupResult.ticket}</code></p>
                      <p className="text-xs text-muted">{lookupResult.eventTitle} ({lookupResult.eventDate})</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {lookupResult.checkedIn ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white">
                          <CheckCircle2 className="h-3 w-3" /> Attended ✓
                        </span>
                      ) : lookupResult.seatConfirmed ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-[11px] font-bold text-amber-800">
                          <CheckCircle2 className="h-3 w-3" /> Seat Confirmed
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            confirmEventSeat(lookupResult.id);
                            setLookupResult({ ...lookupResult, seatConfirmed: true, seatConfirmedAt: Date.now() });
                          }}
                          className="rounded-full bg-ink px-3 py-1 text-[11px] font-bold text-white hover:bg-ink/90 transition cursor-pointer"
                        >
                          Confirm My Seat
                        </button>
                      )}
                    </div>
                  </div>

                  {lookupResult.attendedSessions && lookupResult.attendedSessions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {lookupResult.attendedSessions.map((a) => (
                        <span key={a.sessionId} className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3" /> {a.label}
                        </span>
                      ))}
                    </div>
                  )}

                  {((evObj?.sessions && evObj.sessions.length > 0 && (lookupResult.attendedSessions?.length || 0) < evObj.sessions.length) || (!evObj?.sessions?.length && !lookupResult.checkedIn)) && (
                    <form
                      onSubmit={(evForm) => {
                        evForm.preventDefault();
                        setLookupCodeErr("");
                        const res = checkInWithCode(lookupResult.eventId, lookupResult.ticket, lookupCode);
                        if (res.ok) {
                          const refreshed = findRegistration(lookupResult.ticket);
                          setLookupResult(refreshed || { ...lookupResult, checkedIn: true, checkedInAt: Date.now(), seatConfirmed: true });
                          setLookupCode("");
                        } else {
                          setLookupCodeErr(res.error || "Invalid check-in code.");
                        }
                      }}
                      className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand/15"
                    >
                      <input
                        type="text"
                        value={lookupCode}
                        onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
                        placeholder={evObj?.sessions?.length ? "Enter class session code" : "Enter live check-in code"}
                        className="flex-1 min-w-[150px] rounded-lg border border-brand/25 bg-white px-3 py-1.5 text-xs font-mono text-ink outline-none focus:border-brand"
                      />
                      <button type="submit" className="rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-dark transition cursor-pointer">
                        Check In
                      </button>
                      {lookupCodeErr && <p className="w-full text-[11px] font-semibold text-rose-600">{lookupCodeErr}</p>}
                    </form>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="mx-auto mt-10 max-w-4xl space-y-6">
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
            {pastEvents.map((e) => (
              <div key={e.id} className="flex flex-wrap items-center gap-5 rounded-2xl border border-line bg-white p-5 opacity-80">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-line/60">
                  <span className="text-[10px] font-bold uppercase text-muted">{e.month.slice(0, 3)}</span>
                  <span className="font-display text-lg font-extrabold text-ink">{e.day}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base font-bold text-ink">{e.title}</h3>
                  <p className="text-sm text-muted">{e.description}</p>
                </div>
                <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-muted">Completed</span>
              </div>
            ))}
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
