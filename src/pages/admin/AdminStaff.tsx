import { useMemo, useState } from "react";
import { AdminShell, Card, StatCard, Badge, SearchBar, Modal, Field, Select, Empty, exportCsv, fmtDate } from "./AdminShell";
import { Th, Td, IconBtn } from "./AdminMain";
import {
  useStore, LEVEL_PERMISSIONS, LEVEL_LABELS, ALL_PERMISSIONS,
  type Account, type StaffLevel, type Permission,
} from "../../lib/store";
import {
  UserCog, Shield, PenSquare, Plus, Trash2, Save, UserCheck, UserX,
  CheckCircle2, Download, FileText, Eye, Key,
} from "lucide-react";

const PERM_LABELS: Record<Permission, string> = {
  "posts:write": "Write own drafts",
  "posts:publish": "Publish / unpublish posts",
  "posts:manage": "Edit & delete any post",
  "events:manage": "Manage events",
  "enquiries:manage": "Manage service enquiries",
  "registrations:manage": "Manage event registrations",
  "students:manage": "Manage student accounts",
  "courses:manage": "Manage courses & pricing",
  "payments:manage": "Manage payments & refunds",
  "settings:manage": "Platform settings",
};

/* ============================ Staff accounts ============================ */

export function AdminStaff() {
  const { admin } = useStore();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Account | null>(null);
  const [creating, setCreating] = useState(false);

  const staff = useMemo(
    () => admin.accounts.filter((a) => a.role === "staff" || a.role === "admin")
      .filter((a) => `${a.firstName} ${a.lastName} ${a.email} ${a.jobTitle ?? ""}`.toLowerCase().includes(q.toLowerCase())),
    [admin.accounts, q]
  );

  const postsBy = (id: string) => admin.posts.filter((p) => p.authorId === id).length;

  return (
    <AdminShell title="Staff & Roles" subtitle="Create worker accounts and control exactly what each person can change."
      action={
        <div className="flex flex-wrap gap-3">
          <button onClick={() => exportCsv("staff.csv", staff.map(a => ({
            Name: `${a.firstName} ${a.lastName}`, Email: a.email, Role: a.role,
            Level: a.staffLevel ?? "—", JobTitle: a.jobTitle ?? "", Status: a.status,
            Articles: postsBy(a.id), Joined: fmtDate(a.joined),
          })))} className="btn-outline-dark !py-2.5"><Download className="h-4 w-4" /> Export</button>
          <button onClick={() => setCreating(true)} className="btn-primary !py-2.5"><Plus className="h-4 w-4" /> Add Worker</button>
        </div>
      }>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={UserCog} label="Staff accounts" value={admin.accounts.filter(a => a.role === "staff").length} />
        <StatCard icon={Shield} label="Administrators" value={admin.accounts.filter(a => a.role === "admin").length} />
        <StatCard icon={PenSquare} label="Total articles" value={admin.posts.length} />
        <StatCard icon={FileText} label="Awaiting review" value={admin.posts.filter(p => p.status === "pending").length}
          sub={admin.posts.filter(p => p.status === "pending").length ? "Needs attention" : undefined} />
      </div>

      {/* Level legend */}
      <Card className="mt-6 p-6">
        <h3 className="font-display text-base font-bold text-ink">Permission levels</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {(Object.keys(LEVEL_PERMISSIONS) as StaffLevel[]).map((lvl) => (
            <div key={lvl} className="rounded-2xl border border-line bg-cream p-5">
              <p className="font-display text-sm font-extrabold uppercase tracking-wide text-brand">{lvl}</p>
              <p className="mt-1 text-xs text-muted">{LEVEL_LABELS[lvl]}</p>
              <ul className="mt-3 space-y-1.5">
                {LEVEL_PERMISSIONS[lvl].map((p) => (
                  <li key={p} className="flex items-start gap-2 text-xs text-ink/75">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" /> {PERM_LABELS[p]}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <SearchBar value={q} onChange={setQ} placeholder="Search staff…" />
          <span className="ml-auto text-sm text-muted">{staff.length} account(s)</span>
        </div>

        {staff.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
                <tr><Th>Worker</Th><Th>Job title</Th><Th>Role</Th><Th>Level</Th><Th>Articles</Th><Th>Status</Th><Th right>Actions</Th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {staff.map((a) => (
                  <tr key={a.id} className="transition hover:bg-cream/60">
                    <Td>
                      <div className="flex items-center gap-3">
                        {a.avatar
                          ? <img src={a.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                          : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-xs font-bold text-white">
                              {(a.firstName[0] ?? "") + (a.lastName[0] ?? "")}
                            </span>}
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{a.firstName} {a.lastName}</p>
                          <p className="truncate text-xs text-muted">{a.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td><span className="text-muted">{a.jobTitle || "—"}</span></Td>
                    <Td><Badge tone={a.role === "admin" ? "ink" : "red"}>{a.role}</Badge></Td>
                    <Td>{a.role === "admin" ? <span className="text-xs font-bold text-muted">Full access</span> : <Badge tone="amber">{a.staffLevel ?? "author"}</Badge>}</Td>
                    <Td><span className="font-semibold text-ink">{postsBy(a.id)}</span></Td>
                    <Td><Badge tone={a.status === "active" ? "green" : "amber"}>{a.status}</Badge></Td>
                    <Td right>
                      <div className="flex justify-end gap-1">
                        <IconBtn title="Edit role" onClick={() => setEdit(a)}><Key className="h-4 w-4" /></IconBtn>
                        <IconBtn title={a.status === "active" ? "Suspend" : "Activate"}
                          onClick={() => admin.updateAccount(a.id, { status: a.status === "active" ? "suspended" : "active" })}>
                          {a.status === "active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </IconBtn>
                        <IconBtn danger title="Delete" onClick={() => { if (confirm(`Remove ${a.firstName}'s access?`)) admin.deleteAccount(a.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </IconBtn>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty icon={UserCog} title="No staff accounts" body="Add a worker to give them access to write blog articles." />}
      </Card>

      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit worker access" wide>
        {edit && <StaffForm account={edit} onDone={() => setEdit(null)} />}
      </Modal>
      <Modal open={creating} onClose={() => setCreating(false)} title="Add a worker" wide>
        <StaffForm onDone={() => setCreating(false)} />
      </Modal>
    </AdminShell>
  );
}

function StaffForm({ account, onDone }: { account?: Account; onDone: () => void }) {
  const { admin } = useStore();
  const [f, setF] = useState({
    firstName: account?.firstName ?? "", lastName: account?.lastName ?? "",
    email: account?.email ?? "", jobTitle: account?.jobTitle ?? "",
    role: (account?.role ?? "staff") as Account["role"],
    staffLevel: (account?.staffLevel ?? "author") as StaffLevel,
    status: account?.status ?? "active",
    password: "",
  });
  const [extra, setExtra] = useState<Permission[]>(account?.extraPermissions ?? []);
  const [err, setErr] = useState<string | null>(null);

  const inherited = f.role === "admin" ? ALL_PERMISSIONS : LEVEL_PERMISSIONS[f.staffLevel];

  const toggle = (p: Permission) =>
    setExtra((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const patch = {
      firstName: f.firstName.trim(), lastName: f.lastName.trim(),
      jobTitle: f.jobTitle.trim() || undefined,
      role: f.role, staffLevel: f.role === "staff" ? f.staffLevel : undefined,
      extraPermissions: f.role === "admin" ? [] : extra,
      status: f.status as Account["status"],
    };
    if (account) {
      admin.updateAccount(account.id, { ...patch, ...(f.password ? { password: f.password } : {}) });
      onDone(); return;
    }
    if (!f.firstName.trim() || !f.lastName.trim()) { setErr("Please enter a full name."); return; }
    if (f.password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    const res = admin.createAccount({ ...patch, email: f.email, password: f.password } as Omit<Account, "id" | "joined">);
    if (!res.ok) { setErr(res.error ?? "Could not create account."); return; }
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {err && <p className="rounded-xl border border-brand/30 bg-brand-light p-3 text-sm text-ink/80">{err}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" value={f.firstName} onChange={(v) => setF({ ...f, firstName: v })} />
        <Field label="Last name" value={f.lastName} onChange={(v) => setF({ ...f, lastName: v })} />
      </div>
      {!account && <Field label="Work email" type="email" value={f.email} onChange={(v) => setF({ ...f, email: v })} ph="writer@gamatfx.com" />}
      <Field label="Job title" value={f.jobTitle} onChange={(v) => setF({ ...f, jobTitle: v })} ph="Content Writer" />

      <div className="grid gap-4 sm:grid-cols-3">
        <Select label="Account type" value={f.role} onChange={(v) => setF({ ...f, role: v as Account["role"] })}
          options={[{ v: "staff", l: "Staff / worker" }, { v: "admin", l: "Administrator" }, { v: "student", l: "Student" }]} />
        {f.role === "staff" && (
          <Select label="Permission level" value={f.staffLevel} onChange={(v) => setF({ ...f, staffLevel: v as StaffLevel })}
            options={[{ v: "author", l: "Author" }, { v: "editor", l: "Editor" }, { v: "manager", l: "Manager" }]} />
        )}
        <Select label="Status" value={f.status} onChange={(v) => setF({ ...f, status: v as Account["status"] })}
          options={[{ v: "active", l: "Active" }, { v: "suspended", l: "Suspended" }]} />
      </div>

      {f.role === "staff" && (
        <div className="rounded-2xl border border-line bg-cream p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">
            What this worker can change
          </p>
          <p className="mt-1 text-xs text-muted">
            Level <strong className="text-brand">{f.staffLevel}</strong> grants the ticked items below.
            Tick extras to grant more.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {ALL_PERMISSIONS.map((p) => {
              const fromLevel = inherited.includes(p);
              const on = fromLevel || extra.includes(p);
              return (
                <label key={p}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-sm transition ${
                    on ? "border-brand/40 bg-brand-light" : "border-line bg-white hover:border-brand/40"
                  } ${fromLevel ? "cursor-not-allowed opacity-80" : ""}`}>
                  <input type="checkbox" checked={on} disabled={fromLevel}
                    onChange={() => toggle(p)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-line accent-[#dc3545]" />
                  <span>
                    <span className={`block font-semibold ${on ? "text-brand" : "text-ink"}`}>{PERM_LABELS[p]}</span>
                    {fromLevel && <span className="text-[11px] text-muted">Included in level</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {f.role === "admin" && (
        <p className="flex items-start gap-2 rounded-xl border border-ink/15 bg-ink/5 p-4 text-sm text-ink/80">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          Administrators have unrestricted access to every part of the platform.
        </p>
      )}

      <Field label={account ? "Reset password (optional)" : "Temporary password"} value={f.password}
        onChange={(v) => setF({ ...f, password: v })} ph="Min. 6 characters" />

      <div className="flex justify-end gap-3 pt-1">
        <button type="button" onClick={onDone} className="btn-outline-dark !py-2.5">Cancel</button>
        <button type="submit" className="btn-primary !py-2.5"><Save className="h-4 w-4" /> {account ? "Save access" : "Create worker"}</button>
      </div>
    </form>
  );
}

/* ============================== Articles ============================== */

export function AdminPosts() {
  const { admin, setPostStatus, deletePost } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [view, setView] = useState<typeof admin.posts[number] | null>(null);

  const rows = useMemo(() => admin.posts.filter((p) => {
    const mq = `${p.title} ${p.authorName} ${p.category}`.toLowerCase().includes(q.toLowerCase());
    return mq && (status === "all" || p.status === status);
  }), [admin.posts, q, status]);

  return (
    <AdminShell title="Blog Articles" subtitle="Review, approve and publish content written by your team."
      action={
        <button onClick={() => exportCsv("articles.csv", rows.map(p => ({
          Title: p.title, Author: p.authorName, Category: p.category,
          Status: p.status, Created: fmtDate(p.createdAt), Updated: fmtDate(p.updatedAt),
        })))} className="btn-outline-dark !py-2.5"><Download className="h-4 w-4" /> Export</button>
      }>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileText} label="Total articles" value={admin.posts.length} />
        <StatCard icon={CheckCircle2} label="Published" value={admin.posts.filter(p => p.status === "published").length} />
        <StatCard icon={Eye} label="Pending review" value={admin.posts.filter(p => p.status === "pending").length} />
        <StatCard icon={PenSquare} label="Drafts" value={admin.posts.filter(p => p.status === "draft").length} />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <SearchBar value={q} onChange={setQ} placeholder="Search title or author…" />
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand">
            {["all", "draft", "pending", "published"].map(s => <option key={s} value={s}>{s === "all" ? "All statuses" : s}</option>)}
          </select>
          <span className="ml-auto text-sm text-muted">{rows.length} article(s)</span>
        </div>

        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
                <tr><Th>Title</Th><Th>Author</Th><Th>Category</Th><Th>Status</Th><Th>Updated</Th><Th right>Actions</Th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((p) => (
                  <tr key={p.id} className={`transition hover:bg-cream/60 ${p.status === "pending" ? "bg-amber-50/50" : ""}`}>
                    <Td><span className="font-semibold text-ink">{p.title || "Untitled"}</span></Td>
                    <Td><span className="text-muted">{p.authorName}</span></Td>
                    <Td><Badge tone="gray">{p.category}</Badge></Td>
                    <Td><Badge tone={p.status === "published" ? "green" : p.status === "pending" ? "amber" : "gray"}>{p.status}</Badge></Td>
                    <Td><span className="text-muted">{fmtDate(p.updatedAt)}</span></Td>
                    <Td right>
                      <div className="flex justify-end gap-1">
                        <IconBtn title="Preview" onClick={() => setView(p)}><Eye className="h-4 w-4" /></IconBtn>
                        {p.status !== "published"
                          ? <IconBtn title="Publish" onClick={() => setPostStatus(p.id, "published")}><CheckCircle2 className="h-4 w-4" /></IconBtn>
                          : <IconBtn title="Unpublish" onClick={() => setPostStatus(p.id, "draft")}><UserX className="h-4 w-4" /></IconBtn>}
                        <IconBtn danger title="Delete" onClick={() => { if (confirm("Delete this article?")) deletePost(p.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </IconBtn>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty icon={FileText} title="No articles yet" body="Articles written by staff will appear here for review." />}
      </Card>

      <Modal open={!!view} onClose={() => setView(null)} title="Article preview" wide>
        {view && (
          <article className="space-y-4">
            <Badge tone="red">{view.category}</Badge>
            <h2 className="font-display text-2xl font-extrabold text-ink">{view.title}</h2>
            <p className="text-sm text-muted">By {view.authorName} · {fmtDate(view.createdAt)}</p>
            {view.image && <img src={view.image} alt="" className="w-full rounded-xl object-cover" />}
            <p className="italic text-muted">{view.excerpt}</p>
            <div className="whitespace-pre-wrap text-[15px] leading-[1.8] text-ink/80">{view.body}</div>
            <div className="flex gap-3 pt-3">
              {view.status !== "published" && (
                <button onClick={() => { setPostStatus(view.id, "published"); setView(null); }} className="btn-primary !py-2.5">
                  <CheckCircle2 className="h-4 w-4" /> Approve & publish
                </button>
              )}
            </div>
          </article>
        )}
      </Modal>
    </AdminShell>
  );
}
