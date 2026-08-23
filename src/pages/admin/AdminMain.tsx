import { useMemo, useState } from "react";
import { AdminShell, Card, StatCard, Badge, SearchBar, Modal, Field, Select, Empty, exportCsv, fmtDate } from "./AdminShell";
import { useStore, type Account } from "../../lib/store";
import { COURSES, getCourse, totalLessons, naira } from "../../lib/courses";
import { navigate } from "../../lib/router";
import {
  Users, Wallet, BookOpen, Ticket, TrendingUp, Download, Plus, Pencil, Trash2,
  Eye, UserCheck, UserX, ShieldCheck, GraduationCap, CreditCard, ArrowUpRight, Save,
} from "lucide-react";

/* ============================= Dashboard ============================= */

export function AdminDashboard() {
  const { admin } = useStore();
  const { kpis, revenueByMonth, payments, accounts, registrations } = admin;
  const max = Math.max(...revenueByMonth.map((r) => r.value), 1);

  const mentorshipPayments = useMemo(() => {
    return payments.filter(
      (p) =>
        p.courseId.startsWith("mentorship") ||
        p.courseTitle.toLowerCase().includes("mentorship")
    );
  }, [payments]);

  const mentorshipRevenue = useMemo(() => {
    return mentorshipPayments
      .filter((p) => p.status === "paid")
      .reduce((s, p) => s + p.amount, 0);
  }, [mentorshipPayments]);

  const mentorshipEnrollments = useMemo(() => {
    return admin.enrollments.filter(
      (e) => e.courseId.startsWith("mentorship")
    );
  }, [admin.enrollments]);

  const topCourses = useMemo(() => {
    const counts = new Map<string, number>();
    admin.enrollments.forEach((e) => counts.set(e.courseId, (counts.get(e.courseId) ?? 0) + 1));
    return [...counts.entries()]
      .map(([id, n]) => ({ course: getCourse(id), n }))
      .filter((x) => x.course)
      .sort((a, b) => b.n - a.n)
      .slice(0, 5);
  }, [admin.enrollments]);

  return (
    <AdminShell title="Dashboard" subtitle="A live overview of your academy's performance.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={Wallet} label="Total revenue" value={naira(kpis.revenue)} sub={`${payments.filter(p => p.status === "paid").length} paid orders`} />
        <StatCard icon={GraduationCap} label="Mentorship Packages" value={naira(mentorshipRevenue)} sub={`${mentorshipEnrollments.length} mentorship student(s)`} />
        <StatCard icon={Users} label="Registered students" value={kpis.students} sub={`${kpis.admins} admin account(s)`} />
        <StatCard icon={BookOpen} label="Course enrollments" value={kpis.enrollments} sub={`Avg order ${naira(kpis.avgOrder)}`} />
        <StatCard icon={Ticket} label="Event registrations" value={kpis.registrations} sub={`${kpis.events} events live`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Revenue chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-ink">Revenue — last 6 months</h3>
              <p className="mt-0.5 text-sm text-muted">Paid orders & mentorship packages</p>
            </div>
            <TrendingUp className="h-5 w-5 text-brand" />
          </div>
          <div className="mt-8 flex h-52 items-end gap-3">
            {revenueByMonth.map((m) => (
              <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-muted">
                  {m.value ? `₦${Math.round(m.value / 1000)}k` : ""}
                </span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-brand to-brand/60 transition-all duration-700"
                    style={{ height: `${Math.max((m.value / max) * 100, 2)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-muted">{m.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top courses */}
        <Card className="p-6">
          <h3 className="font-display text-lg font-bold text-ink">Top programs & mentorship</h3>
          <p className="mt-0.5 text-sm text-muted">By enrollment count</p>
          <div className="mt-6 space-y-4">
            {topCourses.length ? topCourses.map(({ course, n }) => (
              <div key={course!.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate pr-3 font-medium text-ink flex items-center gap-1.5">
                    {course!.title}
                    {course!.tag === "Mentorship" && (
                      <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold text-brand">Mentorship</span>
                    )}
                  </span>
                  <span className="shrink-0 font-bold text-brand">{n}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${(n / topCourses[0].n) * 100}%` }} />
                </div>
              </div>
            )) : <p className="text-sm text-muted">No enrollments yet.</p>}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Recent payments */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h3 className="font-display text-base font-bold text-ink">Recent payments & mentorship orders</h3>
            <button onClick={() => navigate("/admin/payments")} className="text-xs font-bold text-brand hover:underline">View all</button>
          </div>
          {payments.length ? (
            <ul className="divide-y divide-line">
              {payments.slice(0, 5).map((p) => {
                const isMentorship = p.courseId.startsWith("mentorship") || p.courseTitle.toLowerCase().includes("mentorship");
                return (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-6 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink flex items-center gap-1.5">
                        {p.userName}
                        {isMentorship && (
                          <span className="rounded bg-purple-100 text-purple-700 px-1.5 py-0.5 text-[10px] font-extrabold uppercase">
                            Mentorship
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-muted">{p.courseTitle}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-ink">{naira(p.amount)}</p>
                      <Badge tone={p.status === "paid" ? "green" : p.status === "refunded" ? "amber" : "gray"}>{p.status}</Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : <p className="px-6 py-10 text-center text-sm text-muted">No payments recorded yet.</p>}
        </Card>

        {/* Recent students */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h3 className="font-display text-base font-bold text-ink">Newest students</h3>
            <button onClick={() => navigate("/admin/students")} className="text-xs font-bold text-brand hover:underline">View all</button>
          </div>
          {accounts.filter(a => a.role === "student").length ? (
            <ul className="divide-y divide-line">
              {[...accounts].filter(a => a.role === "student").reverse().slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-6 py-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-xs font-bold text-white">
                    {(a.firstName[0] ?? "") + (a.lastName[0] ?? "")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{a.firstName} {a.lastName}</p>
                    <p className="truncate text-xs text-muted">{a.email}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">{fmtDate(a.joined)}</span>
                </li>
              ))}
            </ul>
          ) : <p className="px-6 py-10 text-center text-sm text-muted">No students registered yet.</p>}
        </Card>
      </div>

      {/* Latest registrations */}
      <Card className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h3 className="font-display text-base font-bold text-ink">Latest event registrations</h3>
          <button onClick={() => navigate("/admin/registrations")} className="text-xs font-bold text-brand hover:underline">View all</button>
        </div>
        {registrations.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
                <tr><Th>Attendee</Th><Th>Event</Th><Th>Ticket</Th><Th>Status</Th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {registrations.slice(0, 5).map((r) => (
                  <tr key={r.id}>
                    <Td><span className="font-semibold text-ink">{r.name}</span><br /><span className="text-xs text-muted">{r.email}</span></Td>
                    <Td>{r.eventTitle}</Td>
                    <Td><code className="rounded bg-cream px-2 py-1 text-xs font-bold text-brand">{r.ticket}</code></Td>
                    <Td><Badge tone={r.status === "confirmed" ? "green" : "gray"}>{r.status}</Badge></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="px-6 py-10 text-center text-sm text-muted">No event registrations yet.</p>}
      </Card>
    </AdminShell>
  );
}

/* ============================== Students ============================== */

export function AdminStudents() {
  const { admin } = useStore();
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [view, setView] = useState<Account | null>(null);
  const [edit, setEdit] = useState<Account | null>(null);
  const [creating, setCreating] = useState(false);

  const rows = useMemo(() => admin.accounts.filter((a) => {
    const matchQ = `${a.firstName} ${a.lastName} ${a.email}`.toLowerCase().includes(q.toLowerCase());
    const matchRole = roleFilter === "all" || a.role === roleFilter;
    return matchQ && matchRole;
  }), [admin.accounts, q, roleFilter]);

  const enrollmentsOf = (id: string) => admin.enrollments.filter((e) => e.userId === id);
  const spendOf = (id: string) => admin.payments.filter((p) => p.userId === id && p.status === "paid").reduce((s, p) => s + p.amount, 0);

  return (
    <AdminShell
      title="Students"
      subtitle={`${admin.accounts.length} total accounts`}
      action={
        <div className="flex flex-wrap gap-3">
          <button onClick={() => exportCsv("students.csv", rows.map(a => ({
            Name: `${a.firstName} ${a.lastName}`, Email: a.email, Role: a.role, Status: a.status,
            Phone: a.phone ?? "", Country: a.country ?? "", Joined: fmtDate(a.joined),
            Courses: enrollmentsOf(a.id).length, Spend: spendOf(a.id),
          })))} className="btn-outline-dark !py-2.5">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={() => setCreating(true)} className="btn-primary !py-2.5">
            <Plus className="h-4 w-4" /> Add Student
          </button>
        </div>
      }
    >
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <SearchBar value={q} onChange={setQ} placeholder="Search name or email…" />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-brand">
            <option value="all">All roles</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </select>
          <span className="ml-auto text-sm text-muted">{rows.length} result(s)</span>
        </div>

        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
                <tr><Th>Student</Th><Th>Role</Th><Th>Status</Th><Th>Courses</Th><Th>Spend</Th><Th>Joined</Th><Th right>Actions</Th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((a) => (
                  <tr key={a.id} className="transition hover:bg-cream/60">
                    <Td>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-xs font-bold text-white">
                          {(a.firstName[0] ?? "") + (a.lastName[0] ?? "")}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{a.firstName} {a.lastName}</p>
                          <p className="truncate text-xs text-muted">{a.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td><Badge tone={a.role === "admin" ? "ink" : "gray"}>{a.role}</Badge></Td>
                    <Td><Badge tone={a.status === "active" ? "green" : "amber"}>{a.status}</Badge></Td>
                    <Td><span className="font-semibold text-ink">{enrollmentsOf(a.id).length}</span></Td>
                    <Td><span className="font-semibold text-ink">{naira(spendOf(a.id))}</span></Td>
                    <Td><span className="text-muted">{fmtDate(a.joined)}</span></Td>
                    <Td right>
                      <div className="flex justify-end gap-1">
                        <IconBtn title="View" onClick={() => setView(a)}><Eye className="h-4 w-4" /></IconBtn>
                        <IconBtn title="Edit" onClick={() => setEdit(a)}><Pencil className="h-4 w-4" /></IconBtn>
                        <IconBtn title={a.status === "active" ? "Suspend" : "Activate"}
                          onClick={() => admin.updateAccount(a.id, { status: a.status === "active" ? "suspended" : "active" })}>
                          {a.status === "active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </IconBtn>
                        <IconBtn danger title="Delete" onClick={() => {
                          if (confirm(`Delete ${a.firstName} ${a.lastName}? This also removes their enrollments.`)) admin.deleteAccount(a.id);
                        }}><Trash2 className="h-4 w-4" /></IconBtn>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty icon={Users} title="No students found" body="Try a different search term or filter." />}
      </Card>

      {/* View drawer */}
      <Modal open={!!view} onClose={() => setView(null)} title="Student details" wide>
        {view && <StudentDetail account={view} />}
      </Modal>

      {/* Edit */}
      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit student">
        {edit && <StudentForm account={edit} onDone={() => setEdit(null)} />}
      </Modal>

      {/* Create */}
      <Modal open={creating} onClose={() => setCreating(false)} title="Add new student">
        <StudentForm onDone={() => setCreating(false)} />
      </Modal>
    </AdminShell>
  );
}

function StudentDetail({ account }: { account: Account }) {
  const { admin } = useStore();
  const [courseId, setCourseId] = useState(COURSES[0].id);
  const enrollments = admin.enrollments.filter((e) => e.userId === account.id);
  const pays = admin.payments.filter((p) => p.userId === account.id);
  const regs = admin.registrations.filter((r) => r.userId === account.id || r.email === account.email);

  return (
    <div className="space-y-7">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark font-display text-lg font-extrabold text-white">
          {(account.firstName[0] ?? "") + (account.lastName[0] ?? "")}
        </span>
        <div>
          <p className="font-display text-xl font-extrabold text-ink">{account.firstName} {account.lastName}</p>
          <p className="text-sm text-muted">{account.email}</p>
          <div className="mt-2 flex gap-2">
            <Badge tone={account.role === "admin" ? "ink" : "gray"}>{account.role}</Badge>
            <Badge tone={account.status === "active" ? "green" : "amber"}>{account.status}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { l: "Courses", v: enrollments.length },
          { l: "Payments", v: pays.length },
          { l: "Spend", v: naira(pays.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0)) },
          { l: "Events", v: regs.length },
        ].map((s) => (
          <div key={s.l} className="rounded-xl bg-cream p-4 text-center">
            <p className="font-display text-lg font-extrabold text-ink">{s.v}</p>
            <p className="text-xs text-muted">{s.l}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Contact</p>
        <div className="mt-2 space-y-1 text-sm text-ink/80">
          <p>Phone: {account.phone || "—"}</p>
          <p>Country: {account.country || "—"}</p>
          <p>Joined: {fmtDate(account.joined)}</p>
          {account.bio && <p className="pt-1 text-muted">"{account.bio}"</p>}
        </div>
      </div>

      {/* Manual enroll */}
      <div className="rounded-2xl border border-line bg-cream p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Grant course access</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)}
            className="flex-1 rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand">
            {COURSES.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <button onClick={() => admin.enrollUser(account.id, courseId)} className="btn-primary !py-2.5">
            <Plus className="h-4 w-4" /> Enroll
          </button>
        </div>
      </div>

      {/* Enrollments */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Enrolled courses</p>
        {enrollments.length ? (
          <ul className="mt-3 space-y-2">
            {enrollments.map((e) => {
              const c = getCourse(e.courseId);
              const pct = c ? Math.round((e.completedLessons.length / totalLessons(c)) * 100) : 0;
              return (
                <li key={e.id} className="flex items-center gap-3 rounded-xl border border-line p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{c?.title ?? e.courseId}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                        <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-brand">{pct}%</span>
                    </div>
                  </div>
                  <IconBtn danger title="Revoke" onClick={() => admin.removeEnrollment(e.id)}><Trash2 className="h-4 w-4" /></IconBtn>
                </li>
              );
            })}
          </ul>
        ) : <p className="mt-2 text-sm text-muted">No enrollments.</p>}
      </div>

      {/* Payments */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Payment history</p>
        {pays.length ? (
          <ul className="mt-3 space-y-2">
            {pays.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-xl border border-line p-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{p.courseTitle}</p>
                  <p className="text-xs text-muted">{p.ref} · {fmtDate(p.createdAt)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-bold text-ink">{naira(p.amount)}</p>
                  <Badge tone={p.status === "paid" ? "green" : p.status === "refunded" ? "amber" : "gray"}>{p.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-muted">No payments.</p>}
      </div>
    </div>
  );
}

function StudentForm({ account, onDone }: { account?: Account; onDone: () => void }) {
  const { admin } = useStore();
  const [f, setF] = useState({
    firstName: account?.firstName ?? "", lastName: account?.lastName ?? "",
    email: account?.email ?? "", phone: account?.phone ?? "", country: account?.country ?? "Nigeria",
    role: account?.role ?? "student", status: account?.status ?? "active",
    password: account?.password ?? "",
  });
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (account) {
      admin.updateAccount(account.id, {
        firstName: f.firstName, lastName: f.lastName, phone: f.phone, country: f.country,
        role: f.role as Account["role"], status: f.status as Account["status"],
        ...(f.password ? { password: f.password } : {}),
      });
      onDone(); return;
    }
    if (!f.password || f.password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    const res = admin.createAccount({
      firstName: f.firstName, lastName: f.lastName, email: f.email, password: f.password,
      phone: f.phone, country: f.country, role: f.role as Account["role"], status: f.status as Account["status"],
    });
    if (!res.ok) { setErr(res.error ?? "Could not create account."); return; }
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {err && <p className="rounded-xl border border-brand/30 bg-brand-light p-3 text-sm text-ink/80">{err}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" value={f.firstName} onChange={(v) => setF({ ...f, firstName: v })} />
        <Field label="Last name" value={f.lastName} onChange={(v) => setF({ ...f, lastName: v })} />
      </div>
      {!account && <Field label="Email" type="email" value={f.email} onChange={(v) => setF({ ...f, email: v })} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" value={f.phone} onChange={(v) => setF({ ...f, phone: v })} ph="+234…" />
        <Field label="Country" value={f.country} onChange={(v) => setF({ ...f, country: v })} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Role" value={f.role} onChange={(v) => setF({ ...f, role: v as Account["role"] })}
          options={[{ v: "student", l: "Student" }, { v: "admin", l: "Admin" }]} />
        <Select label="Status" value={f.status} onChange={(v) => setF({ ...f, status: v as Account["status"] })}
          options={[{ v: "active", l: "Active" }, { v: "suspended", l: "Suspended" }]} />
      </div>
      <Field label={account ? "Reset password (optional)" : "Password"} value={f.password} onChange={(v) => setF({ ...f, password: v })} ph="Min. 6 characters" />
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onDone} className="btn-outline-dark !py-2.5">Cancel</button>
        <button type="submit" className="btn-primary !py-2.5"><Save className="h-4 w-4" /> {account ? "Save changes" : "Create account"}</button>
      </div>
    </form>
  );
}

/* =============================== Courses =============================== */

export function AdminCourses() {
  const { admin, priceOf, courseSettings } = useStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [price, setPrice] = useState(0);

  const enrollCount = (id: string) => admin.enrollments.filter((e) => e.courseId === id).length;
  const revenue = (id: string) => admin.payments.filter((p) => p.courseId === id && p.status === "paid").reduce((s, p) => s + p.amount, 0);

  return (
    <AdminShell title="Courses" subtitle="Manage pricing, visibility and see performance per course."
      action={
        <button onClick={() => exportCsv("courses.csv", COURSES.map(c => ({
          Title: c.title, Tag: c.tag, Level: c.level, Price: priceOf(c.id),
          Lessons: totalLessons(c), Enrollments: enrollCount(c.id), Revenue: revenue(c.id),
          Published: courseSettings[c.id]?.published !== false ? "Yes" : "No",
        })))} className="btn-outline-dark !py-2.5">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      }>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BookOpen} label="Total courses" value={COURSES.length} />
        <StatCard icon={GraduationCap} label="Total enrollments" value={admin.enrollments.length} />
        <StatCard icon={CreditCard} label="Course revenue" value={naira(admin.payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0))} />
        <StatCard icon={ShieldCheck} label="Published" value={COURSES.filter(c => courseSettings[c.id]?.published !== false).length} />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
              <tr><Th>Course</Th><Th>Level</Th><Th>Price</Th><Th>Lessons</Th><Th>Enrolled</Th><Th>Revenue</Th><Th>Status</Th><Th right>Actions</Th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {COURSES.map((c) => {
                const published = courseSettings[c.id]?.published !== false;
                return (
                  <tr key={c.id} className="transition hover:bg-cream/60">
                    <Td>
                      <div className="flex items-center gap-3">
                        <img src={c.poster} alt="" className="h-11 w-16 shrink-0 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{c.title}</p>
                          <p className="text-xs text-muted">{c.tag}</p>
                        </div>
                      </div>
                    </Td>
                    <Td><span className="text-muted">{c.level}</span></Td>
                    <Td><span className="font-bold text-ink">{naira(priceOf(c.id))}</span></Td>
                    <Td>{totalLessons(c)}</Td>
                    <Td><span className="font-semibold text-ink">{enrollCount(c.id)}</span></Td>
                    <Td><span className="font-semibold text-brand">{naira(revenue(c.id))}</span></Td>
                    <Td><Badge tone={published ? "green" : "gray"}>{published ? "published" : "hidden"}</Badge></Td>
                    <Td right>
                      <div className="flex justify-end gap-1">
                        <IconBtn title="Edit price" onClick={() => { setEditing(c.id); setPrice(priceOf(c.id)); }}><Pencil className="h-4 w-4" /></IconBtn>
                        <IconBtn title={published ? "Hide" : "Publish"} onClick={() => admin.setCourseSetting(c.id, { published: !published })}>
                          {published ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </IconBtn>
                        <IconBtn title="View public page" onClick={() => navigate(`/courses/${c.id}`)}><ArrowUpRight className="h-4 w-4" /></IconBtn>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Update course price">
        <div className="space-y-4">
          <p className="text-sm text-muted">{getCourse(editing ?? "")?.title}</p>
          <Field label="Price (₦)" type="number" value={price} onChange={(v) => setPrice(Number(v))} />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setEditing(null)} className="btn-outline-dark !py-2.5">Cancel</button>
            <button onClick={() => { if (editing) admin.setCourseSetting(editing, { price }); setEditing(null); }} className="btn-primary !py-2.5">
              <Save className="h-4 w-4" /> Save price
            </button>
          </div>
        </div>
      </Modal>
    </AdminShell>
  );
}

/* ============================ Table helpers ============================ */

export function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th className={`whitespace-nowrap px-5 py-3 font-bold ${right ? "text-right" : ""}`}>{children}</th>;
}
export function Td({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <td className={`px-5 py-3.5 align-middle ${right ? "text-right" : ""}`}>{children}</td>;
}
export function IconBtn({ children, onClick, title, danger }: {
  children: React.ReactNode; onClick: () => void; title: string; danger?: boolean;
}) {
  return (
    <button onClick={onClick} title={title} aria-label={title}
      className={`rounded-lg p-2 transition ${danger ? "text-muted hover:bg-brand-light hover:text-brand" : "text-muted hover:bg-cream hover:text-ink"}`}>
      {children}
    </button>
  );
}
