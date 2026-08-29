import { useMemo, useState } from "react";
import { AdminShell, Card, StatCard, Badge, SearchBar, Modal, Field, Empty, exportCsv, fmtDate } from "./AdminShell";
import { Th, Td, IconBtn } from "./AdminMain";
import { useStore, type TeamProfile, type TeamBioSubmission } from "../../lib/store";
import {
  Users, Plus, Pencil, Trash2, Save, Download, CheckCircle2, EyeOff,
  UserRound, Zap,
} from "lucide-react";

type Draft = Partial<TeamProfile> & {
  expertiseText?: string;
  milestonesText?: string;
};

const blank = (): Draft => ({
  name: "", role: "", focus: "", bio: "", longBio: "",
  expertiseText: "", milestonesText: "",
  order: 10, published: true, avatar: "",
});

function parseMilestones(text: string) {
  return text.split("\n").map((line) => {
    const [year, ...rest] = line.split("—");
    const titleBody = rest.join("—").trim();
    const [title, ...bodyParts] = titleBody.split(":");
    return {
      year: (year || "").trim() || "—",
      title: (title || "Milestone").trim(),
      body: (bodyParts.join(":") || titleBody || "").trim(),
    };
  }).filter((m) => m.title && m.title !== "Milestone" || m.body);
}

export function AdminTeam() {
  const {
    teamProfiles, saveTeamProfile, deleteTeamProfile,
    teamBios, reviewTeamBio, deleteTeamBio,
  } = useStore();

  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Draft | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"profiles" | "submissions">("profiles");

  const rows = useMemo(
    () => teamProfiles
      .filter((t) => `${t.name} ${t.role} ${t.focus}`.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => a.order - b.order),
    [teamProfiles, q]
  );

  const pending = teamBios.filter((b) => b.status === "pending");

  const openEdit = (t?: TeamProfile) => {
    setErr(null);
    if (!t) { setEdit(blank()); return; }
    setEdit({
      ...t,
      expertiseText: (t.expertise ?? []).join("\n"),
      milestonesText: (t.milestones ?? [])
        .map((m) => `${m.year} — ${m.title}: ${m.body}`)
        .join("\n"),
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    const res = saveTeamProfile({
      id: edit.id,
      userId: edit.userId,
      slug: edit.slug,
      name: edit.name ?? "",
      role: edit.role ?? "",
      focus: edit.focus ?? "",
      bio: edit.bio ?? "",
      longBio: edit.longBio ?? "",
      expertise: (edit.expertiseText ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
      milestones: parseMilestones(edit.milestonesText ?? ""),
      avatar: edit.avatar,
      order: Number(edit.order) || 10,
      published: edit.published !== false,
    });
    if (!res.ok) { setErr(res.error ?? "Could not save."); return; }
    setEdit(null);
  };

  const approve = (b: TeamBioSubmission) => {
    if (!confirm(`Approve ${b.name}'s bio and publish/update their team page?`)) return;
    reviewTeamBio(b.id, "approved", true);
  };

  return (
    <AdminShell
      title="Team Pages"
      subtitle="Manage public team profiles and review bios submitted by staff."
      action={
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => exportCsv("team.csv", rows.map((t) => ({
              Name: t.name, Role: t.role, Focus: t.focus, Published: t.published ? "Yes" : "No", Order: t.order,
            })))}
            className="btn-outline-dark !py-2.5"
          >
            <Download className="h-4 w-4" /> Export
          </button>
          <button onClick={() => openEdit()} className="btn-primary !py-2.5">
            <Plus className="h-4 w-4" /> Add member
          </button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Team profiles" value={teamProfiles.length} />
        <StatCard icon={CheckCircle2} label="Published" value={teamProfiles.filter((t) => t.published).length} />
        <StatCard icon={Zap} label="Pending bios" value={pending.length} sub={pending.length ? "Needs review" : undefined} />
        <StatCard icon={EyeOff} label="Hidden" value={teamProfiles.filter((t) => !t.published).length} />
      </div>

      <div className="mt-6 flex gap-2">
        <button type="button" onClick={() => setTab("profiles")}
          className={`rounded-full px-4 py-2 text-sm font-bold transition ${tab === "profiles" ? "bg-brand text-white" : "border border-line bg-white text-ink/70"}`}>
          Public profiles
        </button>
        <button type="button" onClick={() => setTab("submissions")}
          className={`rounded-full px-4 py-2 text-sm font-bold transition ${tab === "submissions" ? "bg-brand text-white" : "border border-line bg-white text-ink/70"}`}>
          Bio submissions {pending.length ? `(${pending.length})` : ""}
        </button>
      </div>

      {tab === "profiles" ? (
        <Card className="mt-4 overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
            <SearchBar value={q} onChange={setQ} placeholder="Search team…" />
            <span className="ml-auto text-sm text-muted">{rows.length} member(s)</span>
          </div>
          {rows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
                  <tr><Th>Member</Th><Th>Role</Th><Th>Focus</Th><Th>Order</Th><Th>Status</Th><Th right>Actions</Th></tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((t) => (
                    <tr key={t.id} className="transition hover:bg-cream/60">
                      <Td>
                        <div className="flex items-center gap-3">
                          {t.avatar ? (
                            <img src={t.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                              {t.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                            </span>
                          )}
                          <div>
                            <p className="font-semibold text-ink">{t.name}</p>
                            <p className="text-xs text-muted">/{t.slug}</p>
                          </div>
                        </div>
                      </Td>
                      <Td><span className="text-ink/80">{t.role}</span></Td>
                      <Td><span className="text-muted">{t.focus}</span></Td>
                      <Td><span className="font-semibold text-ink">{t.order}</span></Td>
                      <Td><Badge tone={t.published ? "green" : "gray"}>{t.published ? "published" : "hidden"}</Badge></Td>
                      <Td right>
                        <div className="flex justify-end gap-1">
                          <IconBtn title="Edit" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></IconBtn>
                          <IconBtn danger title="Delete" onClick={() => { if (confirm(`Delete ${t.name}'s page?`)) deleteTeamProfile(t.id); }}>
                            <Trash2 className="h-4 w-4" />
                          </IconBtn>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <Empty icon={Users} title="No team profiles" body="Add members or approve staff bio submissions." />}
        </Card>
      ) : (
        <Card className="mt-4 overflow-hidden">
          <div className="border-b border-line p-4">
            <p className="text-sm text-muted">
              Staff can submit bios from their dashboard. Approve to publish/update their About the Team page.
            </p>
          </div>
          {teamBios.length ? (
            <ul className="divide-y divide-line">
              {teamBios.map((b) => (
                <li key={b.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {b.avatar ? (
                        <img src={b.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                          {b.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                        </span>
                      )}
                      <div>
                        <p className="font-display font-bold text-ink">{b.name}</p>
                        <p className="text-sm text-brand">{b.role}</p>
                        <p className="text-xs text-muted">{b.email} · {fmtDate(b.createdAt)}</p>
                        <p className="mt-2 max-w-xl text-sm text-ink/80">{b.bio}</p>
                        {b.longBio && <p className="mt-1 max-w-xl text-xs text-muted line-clamp-3">{b.longBio}</p>}
                        {b.focus && <p className="mt-1 text-xs font-semibold text-muted">Focus: {b.focus}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge tone={b.status === "pending" ? "amber" : b.status === "approved" ? "green" : "gray"}>{b.status}</Badge>
                      {b.status === "pending" && (
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => approve(b)} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approve & publish
                          </button>
                          <button type="button" onClick={() => reviewTeamBio(b.id, "rejected")} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink">
                            Reject
                          </button>
                        </div>
                      )}
                      <button type="button" onClick={() => { if (confirm("Delete submission?")) deleteTeamBio(b.id); }} className="text-xs font-semibold text-muted hover:text-brand">
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty icon={UserRound} title="No bio submissions" body="When staff submit bios from their dashboard, they appear here for review." />
          )}
        </Card>
      )}

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Edit team member" : "Add team member"} wide>
        {edit && (
          <form onSubmit={submit} className="space-y-4">
            {err && <p className="rounded-xl border border-brand/30 bg-brand-light p-3 text-sm">{err}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={edit.name ?? ""} onChange={(v) => setEdit({ ...edit, name: v })} />
              <Field label="Role / title" value={edit.role ?? ""} onChange={(v) => setEdit({ ...edit, role: v })} />
            </div>
            <Field label="Focus line" value={edit.focus ?? ""} onChange={(v) => setEdit({ ...edit, focus: v })} ph="Fundamentals · Mentorship" />
            <Field label="Avatar URL (optional)" value={edit.avatar ?? ""} onChange={(v) => setEdit({ ...edit, avatar: v })} />
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Short bio</label>
              <textarea rows={2} value={edit.bio ?? ""} onChange={(e) => setEdit({ ...edit, bio: e.target.value })}
                className="w-full resize-none rounded-xl border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Long bio (profile page)</label>
              <textarea rows={6} value={edit.longBio ?? ""} onChange={(e) => setEdit({ ...edit, longBio: e.target.value })}
                className="w-full resize-y rounded-xl border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Expertise (one per line)</label>
              <textarea rows={4} value={edit.expertiseText ?? ""} onChange={(e) => setEdit({ ...edit, expertiseText: e.target.value })}
                className="w-full resize-none rounded-xl border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Milestones (one per line: Year — Title: Body)
              </label>
              <textarea rows={4} value={edit.milestonesText ?? ""} onChange={(e) => setEdit({ ...edit, milestonesText: e.target.value })}
                placeholder="2023 — Joined GAMAT: Took ownership of curriculum standards."
                className="w-full resize-none rounded-xl border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Display order" type="number" value={edit.order ?? 10} onChange={(v) => setEdit({ ...edit, order: Number(v) })} />
              <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-ink">
                <input type="checkbox" checked={edit.published !== false} onChange={(e) => setEdit({ ...edit, published: e.target.checked })}
                  className="h-4 w-4 rounded accent-[#dc3545]" /> Published on site
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setEdit(null)} className="btn-outline-dark !py-2.5">Cancel</button>
              <button type="submit" className="btn-primary !py-2.5"><Save className="h-4 w-4" /> Save profile</button>
            </div>
          </form>
        )}
      </Modal>
    </AdminShell>
  );
}
