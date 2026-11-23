import { useMemo, useState } from "react";
import { AdminShell, Card, StatCard, Badge, SearchBar, Modal, Field, Select, Empty, exportCsv, fmtDate, useAdminSearchTarget } from "./AdminShell";
import { Th, Td, IconBtn } from "./AdminMain";
import { useStore, type EventItem, type Payment, type Registration } from "../../lib/store";
import { naira, compactNaira } from "../../lib/courses";
import { sendBroadcastEmail } from "../../lib/email";
import { BillingDocument } from "./AdminInvoicesAndAssets";
import {
  Wallet, CreditCard, RotateCcw, Trash2, Download, Plus, Pencil, Ticket,
  CalendarDays, Users, CheckCircle2, XCircle, Save, AlertTriangle, Eye,
} from "lucide-react";

/* =============================== Payments =============================== */

export function AdminPayments() {
  const { admin } = useStore();
  const [q, setQ] = useAdminSearchTarget();
  const [status, setStatus] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [view, setView] = useState<Payment | null>(null);

  const rows = useMemo(() => admin.payments.filter((p) => {
    const mq = `${p.userName} ${p.userEmail} ${p.ref} ${p.courseTitle}`.toLowerCase().includes(q.toLowerCase());
    const isMentorship = p.courseId.startsWith("mentorship") || p.courseTitle.toLowerCase().includes("mentorship");
    const isCert = p.courseId.startsWith("cert-") || p.courseTitle.toLowerCase().includes("certificate");
    const matchType = typeFilter === "all"
      || (typeFilter === "mentorship" && isMentorship)
      || (typeFilter === "certificates" && isCert)
      || (typeFilter === "courses" && !isMentorship && !isCert);
    return mq && (status === "all" || p.status === status) && matchType;
  }), [admin.payments, q, status, typeFilter]);

  const sum = (s: Payment["status"]) => admin.payments.filter((p) => p.status === s).reduce((a, p) => a + p.amount, 0);

  return (
    <AdminShell title="Payments" subtitle="Every transaction processed through the academy."
      action={
        <button onClick={() => exportCsv("payments.csv", rows.map(p => ({
          Ref: p.ref, Student: p.userName, Email: p.userEmail, Course: p.courseTitle,
          Subtotal: p.subtotal, Discount: p.discount, VAT: p.vat, Total: p.amount,
          Method: p.method, Coupon: p.coupon ?? "", Status: p.status, Date: fmtDate(p.createdAt),
        })))} className="btn-outline-dark !py-2">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      }>
      <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
        <strong className="font-bold">Manual refunds only.</strong>{" "}
        Students cannot request an automatic refund from their dashboard. Use the refund action
        below solely to mark a payment after you have processed the payout yourself outside this app.
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Paid revenue"
          value={compactNaira(sum("paid"))}
          fullValue={naira(sum("paid"))}
        />
        <StatCard
          icon={RotateCcw}
          label="Manually refunded"
          value={compactNaira(sum("refunded"))}
          fullValue={naira(sum("refunded"))}
        />
        <StatCard icon={CreditCard} label="Transactions" value={admin.payments.length} />
        <StatCard icon={AlertTriangle} label="Pending / failed" value={admin.payments.filter(p => p.status === "pending" || p.status === "failed").length} />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <SearchBar value={q} onChange={setQ} placeholder="Search ref, student or course…" />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand font-semibold text-ink">
            <option value="all">All Item Types</option>
            <option value="courses">Video Courses Only</option>
            <option value="mentorship">Mentorship Packages Only</option>
            <option value="certificates">Certification Fees Only</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand">
            {["all", "paid", "pending", "refunded", "failed"].map(s => <option key={s} value={s}>{s === "all" ? "All statuses" : s}</option>)}
          </select>
          <span className="ml-auto text-sm text-muted">{rows.length} transaction(s)</span>
        </div>

        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <Th className="whitespace-nowrap">Reference</Th>
                  <Th className="w-[25%] min-w-[220px]">Student</Th>
                  <Th className="w-[30%] min-w-[240px]">Course / Mentorship</Th>
                  <Th className="whitespace-nowrap">Amount</Th>
                  <Th className="whitespace-nowrap">Method</Th>
                  <Th className="whitespace-nowrap">Status</Th>
                  <Th className="whitespace-nowrap">Date</Th>
                  <Th right className="whitespace-nowrap w-[240px] min-w-[240px]">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((p) => {
                  const isMentorship = p.courseId.startsWith("mentorship") || p.courseTitle.toLowerCase().includes("mentorship");
                  return (
                    <tr key={p.id} className="transition hover:bg-cream/60">
                      <Td className="whitespace-nowrap"><code className="rounded bg-cream px-2 py-1 text-xs font-bold text-brand">{p.ref}</code></Td>
                      <Td className="min-w-[220px]"><p className="font-semibold text-ink">{p.userName}</p><p className="text-xs text-muted truncate">{p.userEmail}</p></Td>
                      <Td className="min-w-[240px]">
                        <span className="text-ink/80 font-medium">{p.courseTitle}</span>
                        {isMentorship && (
                          <span className="ml-2 inline-block rounded bg-purple-100 px-2 py-0.5 text-[10px] font-extrabold text-purple-700 whitespace-nowrap">
                            Mentorship
                          </span>
                        )}
                      </Td>
                      <Td className="whitespace-nowrap"><span className="font-bold text-ink">{naira(p.amount)}</span>{p.discount > 0 && <p className="text-xs text-brand">−{naira(p.discount)}</p>}</Td>
                      <Td className="whitespace-nowrap"><span className="capitalize text-muted">{p.method}</span></Td>
                      <Td className="whitespace-nowrap"><Badge tone={p.status === "paid" ? "green" : p.status === "refunded" ? "amber" : p.status === "failed" ? "red" : "gray"}>{p.status}</Badge></Td>
                      <Td className="whitespace-nowrap"><span className="text-muted">{fmtDate(p.createdAt)}</span></Td>
                      <Td right className="whitespace-nowrap w-[240px] min-w-[240px]">
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setView(p)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-brand hover:text-brand whitespace-nowrap shrink-0"
                          >
                            <Eye className="h-3.5 w-3.5 shrink-0" /> Receipt
                          </button>
                          {p.status === "paid" && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(
                                  `Mark ${naira(p.amount)} for ${p.userName} as MANUALLY REFUNDED?\n\n` +
                                  `This will automatically REVOKE ${p.userName}'s access to "${p.courseTitle}".`
                                )) admin.setPaymentStatus(p.id, "refunded");
                              }}
                              className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-600 whitespace-nowrap shrink-0"
                            >
                              <RotateCcw className="h-3.5 w-3.5 shrink-0" /> Refund
                            </button>
                          )}
                          {p.status === "refunded" && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Undo refund status and mark this payment as paid again?")) {
                                  admin.setPaymentStatus(p.id, "paid");
                                }
                              }}
                              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-brand hover:text-brand whitespace-nowrap shrink-0"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Undo refund
                            </button>
                          )}
                          {p.status !== "paid" && p.status !== "refunded" && (
                            <button
                              type="button"
                              onClick={() => admin.setPaymentStatus(p.id, "paid")}
                              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500 whitespace-nowrap shrink-0"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Mark paid
                            </button>
                          )}
                          <button
                            type="button"
                            title="Delete transaction record"
                            onClick={() => { if (confirm("Delete this transaction record?")) admin.deletePayment(p.id); }}
                            className="inline-flex items-center justify-center h-8 w-8 shrink-0 rounded-full border border-line bg-white text-xs font-bold text-muted transition hover:border-red-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5 shrink-0" />
                          </button>
                        </div>
                      </Td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        ) : <Empty icon={CreditCard} title="No transactions" body="Payments will appear here as students enroll in courses." />}
      </Card>

      {view && (
        <BillingDocument
          kind="receipt"
          payment={view}
          onClose={() => setView(null)}
        />
      )}
    </AdminShell>
  );
}

/* ================================ Events ================================ */

const blankEvent = (): EventItem => ({
  id: `ev_${Date.now().toString(36)}`,
  title: "", description: "", type: "Physical",
  month: "January", day: "01", year: String(new Date().getFullYear()),
  time: "9:00 AM – 3:00 PM WAT", location: "", capacity: 50, price: 0,
  status: "published",
});

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export function AdminEvents() {
  const { admin, allEvents, seatsLeft } = useStore();
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [notifyBanner, setNotifyBanner] = useState<string | null>(null);

  return (
    <AdminShell title="Events" subtitle="Create and manage live classes, webinars and workshops."
      action={
        <div className="flex flex-wrap gap-3">
          <button onClick={() => exportCsv("events.csv", allEvents.map(e => ({
            Title: e.title, Type: e.type, Date: `${e.month} ${e.day} ${e.year}`, Time: e.time,
            Location: e.location, Capacity: e.capacity, SeatsLeft: seatsLeft(e.id), Price: e.price, Status: e.status,
          })))} className="btn-outline-dark !py-2.5"><Download className="h-4 w-4" /> Export</button>
          <button onClick={() => setEditing(blankEvent())} className="btn-primary !py-2.5"><Plus className="h-4 w-4" /> New Event</button>
        </div>
      }>
      {notifyBanner && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <span>{notifyBanner}</span>
          <button type="button" onClick={() => setNotifyBanner(null)} className="text-emerald-700 hover:underline cursor-pointer">Dismiss</button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={CalendarDays} label="Total events" value={allEvents.length} />
        <StatCard icon={CheckCircle2} label="Published" value={allEvents.filter(e => e.status === "published").length} />
        <StatCard icon={Ticket} label="Confirmed registrations" value={admin.registrations.filter(r => r.status === "confirmed").length} />
        <StatCard icon={Users} label="Total capacity" value={allEvents.reduce((s, e) => s + e.capacity, 0)} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {allEvents.map((e) => {
          const left = seatsLeft(e.id);
          const taken = e.capacity - left;
          const pct = e.capacity ? Math.round((taken / e.capacity) * 100) : 0;
          return (
            <Card key={e.id} className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3 sm:items-start sm:gap-4">
                  <div className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 flex-col items-center justify-center rounded-xl sm:rounded-2xl bg-ink text-white">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase text-brand-light">{e.month.slice(0, 3)}</span>
                    <span className="font-display text-lg sm:text-xl font-extrabold leading-none">{e.day}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <Badge tone={e.type === "Online" ? "ink" : e.type === "Hybrid" ? "amber" : "red"}>{e.type}</Badge>
                      <Badge tone={e.status === "published" ? "green" : "gray"}>{e.status}</Badge>
                      {e.featured && <Badge tone="red">featured</Badge>}
                      {e.sessions && e.sessions.length > 0 ? (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 border border-slate-200">
                          {e.sessions.length} session code{e.sessions.length === 1 ? "" : "s"}
                        </span>
                      ) : e.checkInCode ? (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 border border-slate-200">
                          Code: {e.checkInCode}
                        </span>
                      ) : null}
                    </div>
                    <div className="hidden sm:block">
                      <h3 className="mt-2 font-display text-base font-bold leading-snug text-ink">{e.title}</h3>
                      <p className="mt-1 text-xs text-muted">{e.location}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {e.time}{e.endTime ? ` – ${e.endTime}` : ""} · {e.price ? naira(e.price) : "Free"}
                        {(e.endMonth || e.endDay || e.endYear) ? ` · Ends ${e.endMonth || e.month} ${e.endDay || e.day}, ${e.endYear || e.year}` : ""}
                      </p>
                      {e.sessions && e.sessions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {e.sessions.map((s) => (
                            <span key={s.id} className="rounded bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-mono text-slate-700">
                              {s.label}: <strong>{s.code}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <IconBtn title="Edit" onClick={() => setEditing(e)}><Pencil className="h-4 w-4" /></IconBtn>
                  <IconBtn danger title="Delete" onClick={() => { if (confirm(`Delete "${e.title}" and all its registrations?`)) admin.deleteEvent(e.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </div>
              </div>

              <div className="mt-3 sm:hidden">
                <h3 className="font-display text-base font-bold leading-snug text-ink">{e.title}</h3>
                <p className="mt-1 text-xs text-muted">{e.location}</p>
                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-muted">{e.time}{e.endTime ? ` – ${e.endTime}` : ""}</span>
                  <span className="font-bold text-ink">{e.price ? naira(e.price) : "Free"}</span>
                </div>
              </div>

              <div className="mt-4 sm:mt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink">{taken} / {e.capacity} seats filled</span>
                  <span className={`font-bold ${left === 0 ? "text-brand" : "text-muted"}`}>{left === 0 ? "SOLD OUT" : `${left} left`}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.title ? "Edit event" : "Create event"} wide>
        {editing && (
          <EventForm
            ev={editing}
            registrantEmails={Array.from(
              new Set(
                admin.registrations
                  .filter((r) => r.eventId === editing.id && r.status === "confirmed" && r.email)
                  .map((r) => r.email.trim().toLowerCase())
              )
            )}
            onSave={async (e, shouldNotify, emails) => {
              admin.saveEvent(e);
              setEditing(null);
              if (shouldNotify && emails.length > 0) {
                const dateLine = `${e.month} ${e.day}, ${e.year}${e.endMonth || e.endDay || e.endYear ? ` – ${e.endMonth || e.month} ${e.endDay || e.day}, ${e.endYear || e.year}` : ""}`;
                const timeLine = `${e.time}${e.endTime ? ` – ${e.endTime}` : ""}`;
                const res = await sendBroadcastEmail({
                  recipients: emails,
                  subject: `Event Update: ${e.title}`,
                  message: `Hello,\n\nPlease note that "${e.title}" has an updated schedule or location:\n\nDate: ${dateLine}\nTime: ${timeLine}\nLocation: ${e.location}\n\nYour existing ticket remains valid. See you there!`,
                  ctaLabel: "View Event Details",
                  ctaUrl: "https://gamatfxacademy.com/#/events",
                });
                if (res.ok) {
                  setNotifyBanner(`Update notification sent to ${res.sent ?? emails.length} confirmed registrant(s).`);
                } else {
                  setNotifyBanner(`Event saved, but notification email failed: ${res.error || "Unknown error"}`);
                }
              }
            }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </AdminShell>
  );
}

function EventForm({
  ev,
  registrantEmails,
  onSave,
  onCancel,
}: {
  ev: EventItem;
  registrantEmails: string[];
  onSave: (e: EventItem, shouldNotify: boolean, emails: string[]) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState<EventItem>(ev);
  const [notifyRegistrants, setNotifyRegistrants] = useState(false);
  const set = <K extends keyof EventItem>(k: K, v: EventItem[K]) => setF({ ...f, [k]: v });

  const scheduleOrLocationChanged =
    f.month !== ev.month ||
    f.day !== ev.day ||
    f.year !== ev.year ||
    f.time !== ev.time ||
    (f.endMonth || "") !== (ev.endMonth || "") ||
    (f.endDay || "") !== (ev.endDay || "") ||
    (f.endYear || "") !== (ev.endYear || "") ||
    (f.endTime || "") !== (ev.endTime || "") ||
    f.location !== ev.location;

  const addSession = () => {
    const existing = f.sessions || [];
    const nextCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    set("sessions", [
      ...existing,
      { id: `ses_${Date.now()}_${existing.length + 1}`, label: `Day ${existing.length + 1}`, code: nextCode },
    ]);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(f, scheduleOrLocationChanged && notifyRegistrants, registrantEmails); }} className="space-y-4">
      <Field label="Event title" value={f.title} onChange={(v) => set("title", v)} ph="Forex Mentorship Class…" />
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Description</label>
        <textarea rows={3} value={f.description} onChange={(e) => set("description", e.target.value)}
          className="w-full resize-none rounded-xl border border-line bg-cream px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:bg-white" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Select label="Start Month" value={f.month} onChange={(v) => set("month", v)} options={MONTHS.map(m => ({ v: m, l: m }))} />
        <Field label="Start Day" value={f.day} onChange={(v) => set("day", v)} ph="10" />
        <Field label="Start Year" value={f.year} onChange={(v) => set("year", v)} ph="2026" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Select label="End Month (optional)" value={f.endMonth || ""} onChange={(v) => set("endMonth", v || undefined)} options={[{ v: "", l: "Same / None" }, ...MONTHS.map(m => ({ v: m, l: m }))]} />
        <Field label="End Day (optional)" value={f.endDay || ""} onChange={(v) => set("endDay", v || undefined)} ph="14" />
        <Field label="End Year (optional)" value={f.endYear || ""} onChange={(v) => set("endYear", v || undefined)} ph="2026" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Start Time" value={f.time} onChange={(v) => set("time", v)} />
        <Field label="End Time (optional)" value={f.endTime || ""} onChange={(v) => set("endTime", v || undefined)} ph="4:00 PM" />
        <Select label="Type" value={f.type} onChange={(v) => set("type", v as EventItem["type"])}
          options={[{ v: "Physical", l: "Physical" }, { v: "Online", l: "Online" }, { v: "Hybrid", l: "Hybrid" }]} />
      </div>
      <Field label="Location" value={f.location} onChange={(v) => set("location", v)} ph="Port Harcourt, Nigeria / Zoom" />
      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Capacity" type="number" value={f.capacity} onChange={(v) => set("capacity", Number(v))} />
        <Field label="Price (₦, 0 = free)" type="number" value={f.price} onChange={(v) => set("price", Number(v))} />
        <Select label="Status" value={f.status} onChange={(v) => set("status", v as EventItem["status"])}
          options={[{ v: "published", l: "Published" }, { v: "draft", l: "Draft" }]} />
        <Field label="Default Check-In Code" value={f.checkInCode || ""} onChange={(v) => set("checkInCode", v.toUpperCase())} ph="Auto" />
      </div>

      {/* Multi-Day / Per-Class Session Codes */}
      <div className="rounded-xl border border-line bg-cream/50 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink">Class Sessions &amp; Unique Check-In Codes</p>
            <p className="text-[11px] text-muted">Optional — add a unique code for each day or class session.</p>
          </div>
          <button
            type="button"
            onClick={addSession}
            className="rounded-lg bg-brand px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-brand-dark transition cursor-pointer"
          >
            + Add Session
          </button>
        </div>
        {(f.sessions || []).length > 0 && (
          <div className="space-y-2">
            {(f.sessions || []).map((ses, idx) => (
              <div key={ses.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                <input
                  type="text"
                  value={ses.label}
                  onChange={(e) => {
                    const next = [...(f.sessions || [])];
                    next[idx] = { ...ses, label: e.target.value };
                    set("sessions", next);
                  }}
                  placeholder="Session name (e.g. Day 1)"
                  className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-ink outline-none focus:border-brand"
                />
                <input
                  type="text"
                  value={ses.code}
                  onChange={(e) => {
                    const next = [...(f.sessions || [])];
                    next[idx] = { ...ses, code: e.target.value.toUpperCase() };
                    set("sessions", next);
                  }}
                  placeholder="CODE"
                  className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-mono font-bold text-ink outline-none focus:border-brand"
                />
                <button
                  type="button"
                  onClick={() => set("sessions", (f.sessions || []).filter((s) => s.id !== ses.id))}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                  title="Remove session"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <label className="flex items-center gap-2.5 rounded-xl border border-line bg-cream/60 px-4 py-2.5 text-sm font-semibold text-ink cursor-pointer">
        <input
          type="checkbox"
          checked={!!f.featured}
          onChange={(e) => set("featured", e.target.checked)}
          className="h-4 w-4 accent-brand rounded"
        />
        <span>Featured on Homepage (only featured events appear on the Home page)</span>
      </label>
      {scheduleOrLocationChanged && registrantEmails.length > 0 && (
        <label className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900 cursor-pointer">
          <input
            type="checkbox"
            checked={notifyRegistrants}
            onChange={(e) => setNotifyRegistrants(e.target.checked)}
            className="h-4 w-4 accent-brand rounded"
          />
          <span>Notify {registrantEmails.length} confirmed registrant(s) of schedule/location update via email</span>
        </label>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-outline-dark !py-2.5">Cancel</button>
        <button type="submit" className="btn-primary !py-2.5"><Save className="h-4 w-4" /> Save event</button>
      </div>
    </form>
  );
}

/* ============================ Registrations ============================ */

export function AdminRegistrations() {
  const { admin, allEvents } = useStore();
  const [q, setQ] = useAdminSearchTarget();
  const [evFilter, setEvFilter] = useState("all");
  const [viewingReg, setViewingReg] = useState<Registration | null>(null);

  const rows = useMemo(() => admin.registrations.filter((r) => {
    const mq = `${r.name} ${r.email} ${r.ticket} ${r.eventTitle}`.toLowerCase().includes(q.toLowerCase());
    return mq && (evFilter === "all" || r.eventId === evFilter);
  }), [admin.registrations, q, evFilter]);

  return (
    <AdminShell title="Registrations" subtitle="Every attendee signed up for your live events."
      action={
        <button onClick={() => exportCsv("registrations.csv", rows.map(r => ({
          Ticket: r.ticket, Name: r.name, Email: r.email, Phone: r.phone,
          Event: r.eventTitle, EventDate: r.eventDate, Status: r.status,
          SeatConfirmed: r.seatConfirmed ? "Yes" : "No",
          Attended: r.checkedIn ? "Yes" : "No",
          Sessions: (r.attendedSessions || []).map((s) => s.label).join(", "),
          Experience: r.survey?.experience || "",
          Struggle: r.survey?.struggle || "",
          Pair: r.survey?.pair || "",
          Question: r.survey?.question || "",
          Rating: r.feedback?.rating ?? "",
          Takeaway: r.feedback?.takeaway || "",
          NextTopic: r.feedback?.nextTopic || "",
          Account: r.userId ? "Registered user" : "Guest", Registered: fmtDate(r.createdAt),
        })))} className="btn-outline-dark !py-2.5">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      }>
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Ticket} label="Total registrations" value={admin.registrations.length} />
        <StatCard icon={CheckCircle2} label="Confirmed" value={admin.registrations.filter(r => r.status === "confirmed").length} />
        <StatCard icon={Users} label="Seat confirmed" value={admin.registrations.filter(r => r.seatConfirmed).length} />
        <StatCard icon={CheckCircle2} label="Attended" value={admin.registrations.filter(r => r.checkedIn).length} />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <SearchBar value={q} onChange={setQ} placeholder="Search name, email or ticket…" />
          <select value={evFilter} onChange={(e) => setEvFilter(e.target.value)}
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand">
            <option value="all">All events</option>
            {allEvents.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <span className="ml-auto text-sm text-muted">{rows.length} attendee(s)</span>
        </div>

        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <Th className="whitespace-nowrap">Ticket</Th>
                  <Th className="w-[26%] min-w-[200px]">Attendee</Th>
                  <Th className="w-[30%] min-w-[200px]">Event</Th>
                  <Th className="whitespace-nowrap">Date</Th>
                  <Th className="whitespace-nowrap">Attendance</Th>
                  <Th className="whitespace-nowrap">Status</Th>
                  <Th right className="whitespace-nowrap w-[150px] min-w-[150px]">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => {
                  const evObj = allEvents.find((ev) => ev.id === r.eventId);
                  const evSessions = evObj?.sessions || [];
                  const attendedList = r.attendedSessions || [];
                  return (
                  <tr key={r.id} className="transition hover:bg-cream/60">
                    <Td className="whitespace-nowrap"><code className="rounded bg-cream px-2 py-1 text-xs font-bold text-brand">{r.ticket}</code></Td>
                    <Td className="min-w-[200px]">
                      <p className="font-semibold text-ink">{r.name}</p>
                      <p className="text-xs text-muted truncate">{r.email}</p>
                      {r.phone && <p className="text-xs text-muted">{r.phone}</p>}
                    </Td>
                    <Td className="min-w-[200px]"><span className="text-ink/80 font-medium">{r.eventTitle}</span></Td>
                    <Td className="whitespace-nowrap"><span className="text-muted">{r.eventDate}</span></Td>
                    <Td className="whitespace-nowrap">
                      {evSessions.length > 0 ? (
                        <div className="space-y-1">
                          <Badge tone={attendedList.length > 0 ? "green" : r.seatConfirmed ? "amber" : "gray"}>
                            {attendedList.length} / {evSessions.length} sessions
                          </Badge>
                          {r.status === "confirmed" && (
                            <div className="flex flex-wrap gap-1">
                              {evSessions.map((ses) => {
                                const done = attendedList.some((a) => a.sessionId === ses.id);
                                return (
                                  <button
                                    key={ses.id}
                                    type="button"
                                    onClick={() => admin.toggleRegistrationCheckIn(r.id, ses.id)}
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold border transition cursor-pointer ${
                                      done
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                    }`}
                                    title={done ? `Undo ${ses.label}` : `Check in for ${ses.label}`}
                                  >
                                    {ses.label}{done ? " ✓" : ""}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : r.checkedIn ? (
                        <Badge tone="green">Attended ✓</Badge>
                      ) : r.seatConfirmed ? (
                        <Badge tone="amber">Seat Confirmed</Badge>
                      ) : (
                        <Badge tone="gray">Registered</Badge>
                      )}
                      {(r.survey || r.feedback) && (
                        <button
                          type="button"
                          onClick={() => setViewingReg(r)}
                          className="mt-1 inline-flex items-center gap-1 rounded-md bg-brand-light px-2 py-0.5 text-[10px] font-bold text-brand hover:bg-brand hover:text-white transition cursor-pointer"
                        >
                          {r.feedback?.rating ? `${r.feedback.rating}★ Feedback` : "View Survey"}
                        </button>
                      )}
                    </Td>
                    <Td className="whitespace-nowrap"><Badge tone={r.status === "confirmed" ? "green" : "gray"}>{r.status}</Badge></Td>
                    <Td right className="whitespace-nowrap w-[150px] min-w-[150px]">
                      <div className="flex justify-end items-center gap-1">
                        {r.status === "confirmed" && evSessions.length === 0 && (
                          <button
                            type="button"
                            onClick={() => admin.toggleRegistrationCheckIn(r.id)}
                            className={`rounded-lg px-2 py-1 text-[11px] font-bold border transition cursor-pointer ${
                              r.checkedIn
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            }`}
                            title={r.checkedIn ? "Undo Check-In" : "Mark Attended / Check In"}
                          >
                            {r.checkedIn ? "Checked In" : "Check In"}
                          </button>
                        )}
                        {r.status === "confirmed" ? (
                          <IconBtn title="Cancel" onClick={() => admin.setRegistrationStatus(r.id, "cancelled")}><XCircle className="h-4 w-4" /></IconBtn>
                        ) : (
                          <IconBtn title="Confirm" onClick={() => admin.setRegistrationStatus(r.id, "confirmed")}><CheckCircle2 className="h-4 w-4" /></IconBtn>
                        )}
                        <IconBtn danger title="Delete" onClick={() => { if (confirm("Delete this registration?")) admin.deleteRegistration(r.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </IconBtn>
                      </div>
                    </Td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <Empty icon={Ticket} title="No registrations yet" body="Attendees who register for your events will show up here." />}
      </Card>

      <Modal open={!!viewingReg} onClose={() => setViewingReg(null)} title={viewingReg ? `${viewingReg.name} — Responses` : "Responses"}>
        {viewingReg && (
          <div className="space-y-4 text-sm">
            {viewingReg.survey && (
              <div className="rounded-xl border border-line bg-cream/60 p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-brand">Pre-Event Survey</p>
                {viewingReg.survey.experience && <p><strong className="text-ink">Experience:</strong> <span className="text-muted">{viewingReg.survey.experience}</span></p>}
                {viewingReg.survey.struggle && <p><strong className="text-ink">Biggest Struggle:</strong> <span className="text-muted">{viewingReg.survey.struggle}</span></p>}
                {viewingReg.survey.pair && <p><strong className="text-ink">Favorite Market:</strong> <span className="text-muted">{viewingReg.survey.pair}</span></p>}
                {viewingReg.survey.goal && <p><strong className="text-ink">Goal:</strong> <span className="text-muted">{viewingReg.survey.goal}</span></p>}
                {viewingReg.survey.question && <p><strong className="text-ink">Question:</strong> <span className="text-muted">{viewingReg.survey.question}</span></p>}
              </div>
            )}
            {viewingReg.feedback && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Post-Event Feedback</p>
                {viewingReg.feedback.rating && <p><strong className="text-ink">Rating:</strong> <span className="text-amber-600 font-bold">{viewingReg.feedback.rating} / 5 ★</span></p>}
                {viewingReg.feedback.takeaway && <p><strong className="text-ink">Biggest Takeaway:</strong> <span className="text-muted">{viewingReg.feedback.takeaway}</span></p>}
                {viewingReg.feedback.nextTopic && <p><strong className="text-ink">Next Topic:</strong> <span className="text-muted">{viewingReg.feedback.nextTopic}</span></p>}
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdminShell>
  );
}

/* =============================== Settings =============================== */

export function AdminSettings() {
  const { admin, user, updateProfile } = useStore();
  const [f, setF] = useState({ firstName: user?.firstName ?? "", lastName: user?.lastName ?? "", phone: user?.phone ?? "" });
  const [saved, setSaved] = useState(false);

  return (
    <AdminShell title="Settings" subtitle="Manage your admin profile and platform data.">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-7">
          <h3 className="font-display text-lg font-bold text-ink">Admin profile</h3>
          <p className="mt-1 text-sm text-muted">Update your own account details.</p>
          <form onSubmit={(e) => { e.preventDefault(); updateProfile(f); setSaved(true); setTimeout(() => setSaved(false), 2500); }} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" value={f.firstName} onChange={(v) => setF({ ...f, firstName: v })} />
              <Field label="Last name" value={f.lastName} onChange={(v) => setF({ ...f, lastName: v })} />
            </div>
            <Field label="Phone" value={f.phone} onChange={(v) => setF({ ...f, phone: v })} />
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Email</label>
              <input disabled value={user?.email ?? ""} className="w-full cursor-not-allowed rounded-xl border border-line bg-line/40 px-4 py-2.5 text-sm text-muted" />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="btn-primary !py-2.5"><Save className="h-4 w-4" /> Save</button>
              {saved && <span className="text-sm font-semibold text-brand">Saved!</span>}
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="p-7">
            <h3 className="font-display text-lg font-bold text-ink">Platform summary</h3>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {[
                { l: "Accounts", v: admin.accounts.length },
                { l: "Enrollments", v: admin.enrollments.length },
                { l: "Payments", v: admin.payments.length },
                { l: "Registrations", v: admin.registrations.length },
              ].map(s => (
                <div key={s.l} className="rounded-xl bg-cream p-4">
                  <p className="font-display text-xl font-extrabold text-ink">{s.v}</p>
                  <p className="text-xs text-muted">{s.l}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
