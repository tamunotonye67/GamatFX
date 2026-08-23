import { useMemo, useState } from "react";
import { AdminShell, Card, StatCard, Badge, SearchBar, Modal, Field, Select, Empty, exportCsv, fmtDate } from "./AdminShell";
import { Th, Td, IconBtn } from "./AdminMain";
import { useStore, type EventItem, type Payment } from "../../lib/store";
import { naira } from "../../lib/courses";
import {
  Wallet, CreditCard, RotateCcw, Trash2, Download, Plus, Pencil, Ticket,
  CalendarDays, Users, CheckCircle2, XCircle, Save, AlertTriangle, Database, Eye,
} from "lucide-react";

/* =============================== Payments =============================== */

export function AdminPayments() {
  const { admin } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [view, setView] = useState<Payment | null>(null);

  const rows = useMemo(() => admin.payments.filter((p) => {
    const mq = `${p.userName} ${p.userEmail} ${p.ref} ${p.courseTitle}`.toLowerCase().includes(q.toLowerCase());
    const isMentorship = p.courseId.startsWith("mentorship") || p.courseTitle.toLowerCase().includes("mentorship");
    const matchType = typeFilter === "all" || (typeFilter === "mentorship" ? isMentorship : !isMentorship);
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
        })))} className="btn-outline-dark !py-2.5">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      }>
      <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
        <strong className="font-bold">Manual refunds only.</strong>{" "}
        Students cannot request an automatic refund from their dashboard. Use the refund action
        below solely to mark a payment after you have processed the payout yourself outside this app.
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wallet} label="Paid revenue" value={naira(sum("paid"))} />
        <StatCard icon={RotateCcw} label="Manually refunded" value={naira(sum("refunded"))} />
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
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand">
            {["all", "paid", "pending", "refunded", "failed"].map(s => <option key={s} value={s}>{s === "all" ? "All statuses" : s}</option>)}
          </select>
          <span className="ml-auto text-sm text-muted">{rows.length} transaction(s)</span>
        </div>

        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
                <tr><Th>Reference</Th><Th>Student</Th><Th>Course / Mentorship</Th><Th>Amount</Th><Th>Method</Th><Th>Status</Th><Th>Date</Th><Th right>Actions</Th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((p) => {
                  const isMentorship = p.courseId.startsWith("mentorship") || p.courseTitle.toLowerCase().includes("mentorship");
                  return (
                    <tr key={p.id} className="transition hover:bg-cream/60">
                      <Td><code className="rounded bg-cream px-2 py-1 text-xs font-bold text-brand">{p.ref}</code></Td>
                      <Td><p className="font-semibold text-ink">{p.userName}</p><p className="text-xs text-muted">{p.userEmail}</p></Td>
                      <Td>
                        <span className="text-ink/80 font-medium">{p.courseTitle}</span>
                        {isMentorship && (
                          <span className="ml-2 inline-block rounded bg-purple-100 px-2 py-0.5 text-[10px] font-extrabold text-purple-700">
                            Mentorship
                          </span>
                        )}
                      </Td>
                      <Td><span className="font-bold text-ink">{naira(p.amount)}</span>{p.discount > 0 && <p className="text-xs text-brand">−{naira(p.discount)}</p>}</Td>
                      <Td><span className="capitalize text-muted">{p.method}</span></Td>
                      <Td><Badge tone={p.status === "paid" ? "green" : p.status === "refunded" ? "amber" : p.status === "failed" ? "red" : "gray"}>{p.status}</Badge></Td>
                      <Td><span className="text-muted">{fmtDate(p.createdAt)}</span></Td>
                    <Td right>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setView(p)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-brand hover:text-brand"
                        >
                          <Eye className="h-3.5 w-3.5" /> Receipt
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
                            className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-600"
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Refund
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
                            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-brand hover:text-brand"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Undo refund
                          </button>
                        )}
                        {p.status !== "paid" && p.status !== "refunded" && (
                          <button
                            type="button"
                            onClick={() => admin.setPaymentStatus(p.id, "paid")}
                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Mark paid
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => { if (confirm("Delete this transaction record?")) admin.deletePayment(p.id); }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-muted transition hover:border-brand hover:text-brand"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      <Modal open={!!view} onClose={() => setView(null)} title="Transaction receipt">
        {view && (
          <div className="space-y-4 text-sm">
            <div className="rounded-2xl bg-cream p-5 text-center">
              <p className="text-xs uppercase tracking-wide text-muted">Amount paid</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-brand">{naira(view.amount)}</p>
              <Badge tone={view.status === "paid" ? "green" : "amber"}>{view.status}</Badge>
            </div>
            {[
              ["Reference", view.ref], ["Student", view.userName], ["Email", view.userEmail],
              ["Course", view.courseTitle], ["Subtotal", naira(view.subtotal)],
              ["Discount", view.discount ? `− ${naira(view.discount)}` : "—"],
              ["VAT", naira(view.vat)], ["Coupon", view.coupon || "—"],
              ["Method", view.method], ["Date", new Date(view.createdAt).toLocaleString()],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between border-b border-line pb-2">
                <span className="text-muted">{l}</span><span className="font-semibold text-ink">{v}</span>
              </div>
            ))}

            {view.status === "paid" && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(
                    `Mark ${naira(view.amount)} for ${view.userName} as MANUALLY REFUNDED?\n\n` +
                    `Process the real payout outside this app first, then confirm.`
                  )) {
                    admin.setPaymentStatus(view.id, "refunded");
                    setView({ ...view, status: "refunded" });
                  }
                }}
                className="btn-primary w-full !bg-amber-500 hover:!bg-amber-600"
              >
                <RotateCcw className="h-4 w-4" /> Mark as manually refunded
              </button>
            )}
            {view.status === "refunded" && (
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-center text-xs font-semibold text-amber-800">
                This payment is marked as manually refunded. No automatic payout was sent from the app.
              </p>
            )}
          </div>
        )}
      </Modal>
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            <Card key={e.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-ink text-white">
                    <span className="text-[10px] font-bold uppercase text-brand-light">{e.month.slice(0, 3)}</span>
                    <span className="font-display text-xl font-extrabold leading-none">{e.day}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={e.type === "Online" ? "ink" : e.type === "Hybrid" ? "amber" : "red"}>{e.type}</Badge>
                      <Badge tone={e.status === "published" ? "green" : "gray"}>{e.status}</Badge>
                    </div>
                    <h3 className="mt-2 font-display text-base font-bold leading-snug text-ink">{e.title}</h3>
                    <p className="mt-1 text-xs text-muted">{e.location}</p>
                    <p className="mt-0.5 text-xs text-muted">{e.time} · {e.price ? naira(e.price) : "Free"}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <IconBtn title="Edit" onClick={() => setEditing(e)}><Pencil className="h-4 w-4" /></IconBtn>
                  <IconBtn danger title="Delete" onClick={() => { if (confirm(`Delete "${e.title}" and all its registrations?`)) admin.deleteEvent(e.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </div>
              </div>

              <div className="mt-5">
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
        {editing && <EventForm ev={editing} onSave={(e) => { admin.saveEvent(e); setEditing(null); }} onCancel={() => setEditing(null)} />}
      </Modal>
    </AdminShell>
  );
}

function EventForm({ ev, onSave, onCancel }: { ev: EventItem; onSave: (e: EventItem) => void; onCancel: () => void }) {
  const [f, setF] = useState<EventItem>(ev);
  const set = <K extends keyof EventItem>(k: K, v: EventItem[K]) => setF({ ...f, [k]: v });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="space-y-4">
      <Field label="Event title" value={f.title} onChange={(v) => set("title", v)} ph="Forex Mentorship Class…" />
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Description</label>
        <textarea rows={3} value={f.description} onChange={(e) => set("description", e.target.value)}
          className="w-full resize-none rounded-xl border border-line bg-cream px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:bg-white" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Select label="Month" value={f.month} onChange={(v) => set("month", v)} options={MONTHS.map(m => ({ v: m, l: m }))} />
        <Field label="Day" value={f.day} onChange={(v) => set("day", v)} ph="10" />
        <Field label="Year" value={f.year} onChange={(v) => set("year", v)} ph="2026" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Time" value={f.time} onChange={(v) => set("time", v)} />
        <Select label="Type" value={f.type} onChange={(v) => set("type", v as EventItem["type"])}
          options={[{ v: "Physical", l: "Physical" }, { v: "Online", l: "Online" }, { v: "Hybrid", l: "Hybrid" }]} />
      </div>
      <Field label="Location" value={f.location} onChange={(v) => set("location", v)} ph="Port Harcourt, Nigeria / Zoom" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Capacity" type="number" value={f.capacity} onChange={(v) => set("capacity", Number(v))} />
        <Field label="Price (₦, 0 = free)" type="number" value={f.price} onChange={(v) => set("price", Number(v))} />
        <Select label="Status" value={f.status} onChange={(v) => set("status", v as EventItem["status"])}
          options={[{ v: "published", l: "Published" }, { v: "draft", l: "Draft" }]} />
      </div>
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
  const [q, setQ] = useState("");
  const [evFilter, setEvFilter] = useState("all");

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
          Account: r.userId ? "Registered user" : "Guest", Registered: fmtDate(r.createdAt),
        })))} className="btn-outline-dark !py-2.5">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      }>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Ticket} label="Total registrations" value={admin.registrations.length} />
        <StatCard icon={CheckCircle2} label="Confirmed" value={admin.registrations.filter(r => r.status === "confirmed").length} />
        <StatCard icon={XCircle} label="Cancelled" value={admin.registrations.filter(r => r.status === "cancelled").length} />
        <StatCard icon={Users} label="Guest sign-ups" value={admin.registrations.filter(r => !r.userId).length} />
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
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
                <tr><Th>Ticket</Th><Th>Attendee</Th><Th>Event</Th><Th>Date</Th><Th>Type</Th><Th>Status</Th><Th right>Actions</Th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.id} className="transition hover:bg-cream/60">
                    <Td><code className="rounded bg-cream px-2 py-1 text-xs font-bold text-brand">{r.ticket}</code></Td>
                    <Td>
                      <p className="font-semibold text-ink">{r.name}</p>
                      <p className="text-xs text-muted">{r.email}</p>
                      <p className="text-xs text-muted">{r.phone}</p>
                    </Td>
                    <Td><span className="text-ink/80">{r.eventTitle}</span></Td>
                    <Td><span className="text-muted">{r.eventDate}</span></Td>
                    <Td><Badge tone={r.userId ? "green" : "gray"}>{r.userId ? "member" : "guest"}</Badge></Td>
                    <Td><Badge tone={r.status === "confirmed" ? "green" : "gray"}>{r.status}</Badge></Td>
                    <Td right>
                      <div className="flex justify-end gap-1">
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
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty icon={Ticket} title="No registrations yet" body="Attendees who register for your events will show up here." />}
      </Card>
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

          <Card className="border-brand/30 p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand">
                <Database className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-ink">Danger zone</h3>
                <p className="text-sm text-muted">Irreversible data operations.</p>
              </div>
            </div>
            <p className="mt-5 text-sm text-muted">
              Reset removes all students, enrollments, payments, registrations and custom pricing,
              restoring the default events. Admin accounts are preserved.
            </p>
            <button
              onClick={() => { if (confirm("Reset ALL platform data? This cannot be undone.")) admin.resetDemoData(); }}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark">
              <AlertTriangle className="h-4 w-4" /> Reset all data
            </button>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
