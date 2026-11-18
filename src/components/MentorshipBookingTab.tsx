import { useState } from "react";
import { CalendarDays, Clock, CheckCircle2, Video } from "lucide-react";
import { sendMentorshipBookingEmail } from "../lib/email";

type Booking = {
  id: string;
  date: string;
  timeSlot: string;
  topic: string;
  notes?: string;
  bookedAt: string;
};

const TIME_SLOTS = [
  "10:00 AM",
  "12:00 PM",
  "2:00 PM",
  "4:00 PM",
  "7:00 PM",
];

const TOPICS = [
  "Institutional Order Flow Review",
  "Trade Journal & Risk Audit",
  "Prop Firm Challenge Prep",
  "Live Market Breakdown",
];

export default function MentorshipBookingTab({
  userId,
  userEmail,
  userName,
}: {
  userId: string;
  userEmail: string;
  userName: string;
}) {
  const storageKey = `gamat.mentorship_bookings.${userId}`;
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [date, setDate] = useState(tomorrow);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[1]);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !timeSlot) return;
    setSubmitting(true);
    setFeedback(null);

    const res = await sendMentorshipBookingEmail({
      to: userEmail,
      name: userName,
      date,
      timeSlot,
      topic,
      notes: notes.trim() || undefined,
    });

    const entry: Booking = {
      id: `bk_${Date.now()}`,
      date,
      timeSlot,
      topic,
      notes: notes.trim() || undefined,
      bookedAt: new Date().toISOString(),
    };
    const next = [entry, ...bookings];
    setBookings(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}

    setSubmitting(false);
    setNotes("");
    setFeedback(
      res.ok
        ? `Session booked for ${date} at ${timeSlot}! A confirmation email has been sent.`
        : `Session saved for ${date} at ${timeSlot}.`
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-brand" />
          <h2 className="font-display text-lg font-bold text-ink">Book a 1-on-1 Mentorship Session</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Pick a convenient date and time slot (WAT) to review your charts and progress with a GAMAT mentor.
        </p>

        {feedback && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        <form onSubmit={handleBook} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Session Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Preferred Date</label>
            <input
              type="date"
              min={tomorrow}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-muted">Available Time Slots (WAT)</label>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTimeSlot(slot)}
                  className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                    timeSlot === slot
                      ? "border-brand bg-brand text-white"
                      : "border-line bg-cream/50 text-ink hover:border-brand/50"
                  }`}
                >
                  <Clock className="mr-1 inline h-3.5 w-3.5" />
                  {slot}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-muted">Questions / Pairs to Review (optional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Share what you'd like to focus on..."
              className="w-full rounded-xl border border-line bg-cream/40 p-3 text-sm text-ink outline-none focus:border-brand"
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto disabled:opacity-60">
              <CalendarDays className="h-4 w-4" />
              {submitting ? "Booking session..." : "Confirm 1-on-1 Session"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-line bg-white overflow-hidden shadow-xs">
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-display text-base font-bold text-ink">Your Booked Sessions</h3>
        </div>
        {bookings.length ? (
          <div className="divide-y divide-line">
            {bookings.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-sm">
                <div>
                  <p className="font-bold text-ink">{b.topic}</p>
                  <p className="text-xs text-muted">
                    {b.date} · {b.timeSlot} WAT {b.notes ? `— ${b.notes}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  Confirmed
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-6 text-center text-sm text-muted">No 1-on-1 sessions booked yet.</p>
        )}
      </div>
    </div>
  );
}
