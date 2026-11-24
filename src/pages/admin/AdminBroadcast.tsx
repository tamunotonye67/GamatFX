import { useEffect, useMemo, useState } from "react";
import { Send, Users, BookOpen, CalendarDays, CheckCircle2, AlertCircle } from "lucide-react";
import { AdminShell, Card, StatCard, Select, Field } from "./AdminShell";
import { useStore } from "../../lib/store";
import { COURSES, COURSE_ALIASES } from "../../lib/courses";
import { sendBroadcastEmail } from "../../lib/email";
import { fetchSupabaseBroadcastLogs, saveSupabaseBroadcastLog } from "../../lib/supabaseServices";

type BroadcastLog = {
  id: string;
  subject: string;
  audience: string;
  count: number;
  sentAt: string;
};

const LOG_KEY = "gamat.broadcast_logs.v1";

export function AdminBroadcast() {
  const { admin, events = [], managedCourses = [] } = useStore();
  const [audience, setAudience] = useState<"all_students" | "enrolled" | "events" | "unconfirmed_seats" | "custom">("all_students");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [customEmails, setCustomEmails] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [ctaLabel, setCtaLabel] = useState("Open Dashboard");
  const [ctaUrl, setCtaUrl] = useState("https://gamatfxacademy.com/#/dashboard");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [logs, setLogs] = useState<BroadcastLog[]>(() => {
    try {
      const raw = localStorage.getItem(LOG_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    fetchSupabaseBroadcastLogs().then((remote) => {
      if (!remote.length) return;
      setLogs((prev) => {
        const merged = new Map<string, BroadcastLog>();
        [...remote, ...prev].forEach((item) => {
          if (item?.id) merged.set(item.id, item);
        });
        const sorted = Array.from(merged.values())
          .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
          .slice(0, 20);
        try {
          localStorage.setItem(LOG_KEY, JSON.stringify(sorted));
        } catch {}
        return sorted;
      });
    });
  }, []);

  const allCourses = useMemo(() => {
    const map = new Map<string, { id: string; title: string }>();
    COURSES.forEach((c) => map.set(c.id, { id: c.id, title: c.title }));
    managedCourses.forEach((m) => {
      if (!map.has(m.id)) map.set(m.id, { id: m.id, title: m.title });
    });
    return Array.from(map.values());
  }, [managedCourses]);

  const recipients = useMemo(() => {
    if (audience === "all_students") {
      return Array.from(
        new Set(
          admin.accounts
            .filter((a) => a.status === "active" && a.email)
            .map((a) => a.email.trim().toLowerCase())
        )
      );
    }
    if (audience === "enrolled") {
      const enrolledIds = new Set(
        admin.enrollments
          .filter((e) => {
            if (selectedCourseId === "all") return true;
            return e.courseId === selectedCourseId || COURSE_ALIASES[e.courseId] === selectedCourseId;
          })
          .map((e) => e.userId)
      );
      return Array.from(
        new Set(
          admin.accounts
            .filter((a) => enrolledIds.has(a.id) && a.email)
            .map((a) => a.email.trim().toLowerCase())
        )
      );
    }
    if (audience === "events" || audience === "unconfirmed_seats") {
      return Array.from(
        new Set(
          admin.registrations
            .filter(
              (r) =>
                r.status === "confirmed" &&
                (audience === "events" || !r.seatConfirmed) &&
                r.email &&
                (selectedEventId === "all" || r.eventId === selectedEventId)
            )
            .map((r) => r.email.trim().toLowerCase())
        )
      );
    }
    return Array.from(
      new Set(
        customEmails
          .split(/[\s,;]+/)
          .map((e) => e.trim().toLowerCase())
          .filter((e) => e.includes("@"))
      )
    );
  }, [audience, selectedCourseId, selectedEventId, customEmails, admin.accounts, admin.enrollments, admin.registrations]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipients.length) {
      setStatus({ ok: false, text: "No valid recipients found for the selected audience." });
      return;
    }
    if (!subject.trim() || !message.trim()) {
      setStatus({ ok: false, text: "Please enter both a subject and message." });
      return;
    }
    setSending(true);
    setStatus(null);
    const res = await sendBroadcastEmail({
      recipients,
      subject: subject.trim(),
      message: message.trim(),
      ctaLabel: ctaLabel.trim() || undefined,
      ctaUrl: ctaUrl.trim() || undefined,
    });
    setSending(false);
    if (!res.ok) {
      setStatus({ ok: false, text: res.error || "Failed to send broadcast." });
      return;
    }
    const entry: BroadcastLog = {
      id: `bc_${Date.now()}`,
      subject: subject.trim(),
      audience,
      count: res.sent ?? recipients.length,
      sentAt: new Date().toISOString(),
    };
    const nextLogs = [entry, ...logs].slice(0, 20);
    setLogs(nextLogs);
    try {
      localStorage.setItem(LOG_KEY, JSON.stringify(nextLogs));
    } catch {}
    saveSupabaseBroadcastLog(entry);
    setStatus({ ok: true, text: `Broadcast sent to ${entry.count} recipient(s).` });
    setSubject("");
    setMessage("");
  };

  return (
    <AdminShell
      title="Email Broadcast"
      subtitle="Send announcements, market updates, and event promos to your students via Resend."
    >
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-3">
        <StatCard icon={Users} label="Active students" value={admin.accounts.filter((a) => a.status === "active").length} />
        <StatCard icon={BookOpen} label="Course enrollees" value={new Set(admin.enrollments.map((e) => e.userId)).size} />
        <StatCard icon={CalendarDays} label="Event attendees" value={new Set(admin.registrations.filter((r) => r.status === "confirmed").map((r) => r.email.toLowerCase())).size} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-ink">Compose Announcement</h2>
          <form onSubmit={handleSend} className="mt-5 space-y-4">
            {status && (
              <div
                className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-sm ${
                  status.ok
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-brand/30 bg-brand-light text-ink"
                }`}
              >
                {status.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand" />}
                <span>{status.text}</span>
              </div>
            )}

            <Select
              label="Audience"
              value={audience}
              onChange={(v) => setAudience(v as typeof audience)}
              options={[
                { v: "all_students", l: "All Active Accounts" },
                { v: "enrolled", l: "Enrolled Course Students" },
                { v: "events", l: "Confirmed Event Registrants" },
                { v: "unconfirmed_seats", l: "Event Registrants — Seat Not Confirmed" },
                { v: "custom", l: "Custom Email List" },
              ]}
            />

            {audience === "enrolled" && (
              <Select
                label="Select Course"
                value={selectedCourseId}
                onChange={setSelectedCourseId}
                options={[
                  {
                    v: "all",
                    l: `All Courses (${new Set(admin.enrollments.map((e) => e.userId)).size} enrolled)`,
                  },
                  ...allCourses.map((c) => {
                    const count = new Set(
                      admin.enrollments
                        .filter((e) => e.courseId === c.id || COURSE_ALIASES[e.courseId] === c.id)
                        .map((e) => e.userId)
                    ).size;
                    return {
                      v: c.id,
                      l: `${c.title} (${count} enrolled)`,
                    };
                  }),
                ]}
              />
            )}

            {(audience === "events" || audience === "unconfirmed_seats") && (
              <Select
                label="Select Event"
                value={selectedEventId}
                onChange={setSelectedEventId}
                options={[
                  {
                    v: "all",
                    l: `All Events (${new Set(admin.registrations.filter((r) => r.status === "confirmed" && r.email).map((r) => r.email.trim().toLowerCase())).size} confirmed)`,
                  },
                  ...(events ?? []).map((ev) => {
                    const count = new Set(
                      admin.registrations
                        .filter((r) => r.status === "confirmed" && r.email && r.eventId === ev.id)
                        .map((r) => r.email.trim().toLowerCase())
                    ).size;
                    return {
                      v: ev.id,
                      l: `${ev.title} (${count} confirmed)`,
                    };
                  }),
                ]}
              />
            )}

            {audience === "custom" && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Recipient Emails (comma or line separated)
                </label>
                <textarea
                  rows={3}
                  value={customEmails}
                  onChange={(e) => setCustomEmails(e.target.value)}
                  placeholder="trader1@example.com, trader2@example.com"
                  className="w-full rounded-xl border border-line bg-white p-3 text-sm text-ink outline-none focus:border-brand"
                />
              </div>
            )}

            <p className="text-xs font-semibold text-muted">
              Selected recipients: <span className="text-brand">{recipients.length}</span>
            </p>

            <Field label="Email Subject" value={subject} onChange={setSubject} ph="Weekly Market Outlook & Live Session" />

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Message
              </label>
              <textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your announcement here..."
                className="w-full rounded-xl border border-line bg-white p-3 text-sm text-ink outline-none focus:border-brand"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Button Text (optional)" value={ctaLabel} onChange={setCtaLabel} ph="Open Dashboard" />
              <Field label="Button Link (optional)" value={ctaUrl} onChange={setCtaUrl} ph="https://gamatfxacademy.com/#/dashboard" />
            </div>

            <button
              type="submit"
              disabled={sending || recipients.length === 0}
              className="btn-primary w-full disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {sending ? "Sending broadcast..." : `Send to ${recipients.length} recipient(s)`}
            </button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-ink">Recent Broadcasts</h2>
          {logs.length ? (
            <div className="mt-4 divide-y divide-line">
              {logs.map((l) => (
                <div key={l.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="font-semibold text-sm text-ink">{l.subject}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {l.count} recipient(s) · {new Date(l.sentAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">No broadcasts sent yet.</p>
          )}
        </Card>
      </div>
    </AdminShell>
  );
}
