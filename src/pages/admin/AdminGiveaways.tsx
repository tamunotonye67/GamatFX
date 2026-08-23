import { useMemo, useState } from "react";
import { AdminShell, Card, StatCard, Badge, SearchBar, Modal, Field, Select, Empty, exportCsv, fmtDate } from "./AdminShell";
import { Th, Td, IconBtn } from "./AdminMain";
import { useStore, type Giveaway, type GiveawayWinner, type Account } from "../../lib/store";
import {
  Gift, Plus, Pencil, Trash2, Save, Download, CheckCircle2, EyeOff, UserPlus, X,
} from "lucide-react";

type Draft = Partial<Giveaway> & { winners: GiveawayWinner[] };

const blank = (): Draft => ({
  title: "",
  summary: "",
  body: "",
  reward: "",
  image: "",
  status: "draft",
  winners: [],
});

export function AdminGiveaways() {
  const { giveaways, saveGiveaway, deleteGiveaway, admin, clubs } = useStore();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Draft | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [studentQ, setStudentQ] = useState("");

  const rows = useMemo(
    () => giveaways.filter((g) =>
      `${g.title} ${g.reward} ${g.winners.map((w) => w.name).join(" ")}`.toLowerCase().includes(q.toLowerCase())
    ),
    [giveaways, q]
  );

  const students = useMemo(() => {
    const pool = admin.accounts.filter((a) => a.role === "student" && a.status === "active");
    if (!studentQ.trim()) return pool.slice(0, 12);
    const s = studentQ.toLowerCase();
    return pool.filter((a) =>
      `${a.firstName} ${a.lastName} ${a.nickname ?? ""} ${a.email}`.toLowerCase().includes(s)
    ).slice(0, 12);
  }, [admin.accounts, studentQ]);

  const openEdit = (g?: Giveaway) => {
    setErr(null);
    setStudentQ("");
    setEdit(g ? { ...g, winners: [...g.winners] } : blank());
  };

  const addWinner = (acc?: Account, manual?: GiveawayWinner) => {
    if (!edit) return;
    if (acc) {
      if (edit.winners.some((w) => w.userId === acc.id)) return;
      const w: GiveawayWinner = {
        userId: acc.id,
        name: `${acc.firstName} ${acc.lastName}`.trim(),
        nickname: acc.nickname,
        avatar: acc.avatar,
        note: "",
      };
      setEdit({ ...edit, winners: [...edit.winners, w] });
      return;
    }
    if (manual) setEdit({ ...edit, winners: [...edit.winners, manual] });
  };

  const updateWinner = (i: number, patch: Partial<GiveawayWinner>) => {
    if (!edit) return;
    setEdit({
      ...edit,
      winners: edit.winners.map((w, idx) => (idx === i ? { ...w, ...patch } : w)),
    });
  };

  const removeWinner = (i: number) => {
    if (!edit) return;
    setEdit({ ...edit, winners: edit.winners.filter((_, idx) => idx !== i) });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    const res = saveGiveaway({
      id: edit.id,
      title: edit.title ?? "",
      summary: edit.summary ?? "",
      body: edit.body ?? "",
      reward: edit.reward ?? "",
      image: edit.image,
      taggedClubId: edit.taggedClubId,
      taggedClubName: edit.taggedClubName,
      status: (edit.status as Giveaway["status"]) ?? "draft",
      winners: edit.winners,
    });
    if (!res.ok) { setErr(res.error ?? "Could not save."); return; }
    setEdit(null);
  };

  return (
    <AdminShell
      title="Giveaways"
      subtitle="Announce student winners, tag their profiles and publish rewards."
      action={
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => exportCsv("giveaways.csv", rows.map((g) => ({
              Title: g.title,
              Reward: g.reward,
              Winners: g.winners.map((w) => w.name).join("; "),
              Status: g.status,
              Announced: g.announcedAt ? fmtDate(g.announcedAt) : "",
            })))}
            className="btn-outline-dark !py-2.5"
          >
            <Download className="h-4 w-4" /> Export
          </button>
          <button onClick={() => openEdit()} className="btn-primary !py-2.5">
            <Plus className="h-4 w-4" /> New giveaway
          </button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Gift} label="Total giveaways" value={giveaways.length} />
        <StatCard icon={CheckCircle2} label="Published" value={giveaways.filter((g) => g.status === "published").length} />
        <StatCard icon={EyeOff} label="Drafts" value={giveaways.filter((g) => g.status === "draft").length} />
        <StatCard icon={UserPlus} label="Tagged winners" value={giveaways.reduce((n, g) => n + g.winners.length, 0)} />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <SearchBar value={q} onChange={setQ} placeholder="Search giveaways or winners…" />
          <span className="ml-auto text-sm text-muted">{rows.length} item(s)</span>
        </div>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <Th>Title</Th>
                  <Th>Reward</Th>
                  <Th>Winners</Th>
                  <Th>Status</Th>
                  <Th>Announced</Th>
                  <Th right>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((g) => (
                  <tr key={g.id} className="transition hover:bg-cream/60">
                    <Td><span className="font-semibold text-ink">{g.title}</span></Td>
                    <Td><span className="text-muted">{g.reward}</span></Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {g.winners.slice(0, 3).map((w) => (
                          <span key={w.name} className="rounded-full bg-cream px-2 py-0.5 text-[11px] font-semibold text-ink">
                            {w.nickname ? `@${w.nickname}` : w.name}
                          </span>
                        ))}
                        {g.winners.length > 3 && (
                          <span className="text-[11px] text-muted">+{g.winners.length - 3}</span>
                        )}
                      </div>
                    </Td>
                    <Td><Badge tone={g.status === "published" ? "green" : "gray"}>{g.status}</Badge></Td>
                    <Td><span className="text-muted">{g.announcedAt ? fmtDate(g.announcedAt) : "—"}</span></Td>
                    <Td right>
                      <div className="flex justify-end gap-1">
                        <IconBtn title="Edit" onClick={() => openEdit(g)}><Pencil className="h-4 w-4" /></IconBtn>
                        <IconBtn danger title="Delete" onClick={() => { if (confirm("Delete this giveaway?")) deleteGiveaway(g.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </IconBtn>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon={Gift} title="No giveaways yet" body="Announce your first student reward and tag the winners." />
        )}
      </Card>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Edit giveaway" : "New giveaway"} wide>
        {edit && (
          <form onSubmit={submit} className="space-y-5">
            {err && <p className="rounded-xl border border-brand/30 bg-brand-light p-3 text-sm text-ink/80">{err}</p>}

            <Field label="Title" value={edit.title ?? ""} onChange={(v) => setEdit({ ...edit, title: v })} ph="March Process Champions" />
            <Field label="Reward" value={edit.reward ?? ""} onChange={(v) => setEdit({ ...edit, reward: v })} ph="Free mentorship month + merch" />
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Short summary</label>
              <textarea rows={2} value={edit.summary ?? ""} onChange={(e) => setEdit({ ...edit, summary: e.target.value })}
                className="w-full resize-none rounded-xl border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Full announcement</label>
              <textarea rows={5} value={edit.body ?? ""} onChange={(e) => setEdit({ ...edit, body: e.target.value })}
                className="w-full resize-y rounded-xl border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Status"
                value={edit.status ?? "draft"}
                onChange={(v) => setEdit({ ...edit, status: v as Giveaway["status"] })}
                options={[{ v: "draft", l: "Draft" }, { v: "published", l: "Published" }]}
              />
              <Field label="Image URL (optional)" value={edit.image ?? ""} onChange={(v) => setEdit({ ...edit, image: v })} />
            </div>

            {/* Tag Winning Club / Syndicate */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Tag Winning Syndicate / Club (Optional)
              </label>
              <select
                value={edit.taggedClubId ?? ""}
                onChange={(e) => {
                  const selectedClub = (clubs || []).find((c) => c.id === e.target.value);
                  setEdit({
                    ...edit,
                    taggedClubId: e.target.value || undefined,
                    taggedClubName: selectedClub ? selectedClub.name : undefined,
                  });
                }}
                className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white text-ink"
              >
                <option value="">-- No club tagged --</option>
                {(clubs || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    🏆 {c.name} ({c.members.length} members - {c.focus})
                  </option>
                ))}
              </select>
            </div>

            {/* Winners */}
            <div className="rounded-2xl border border-line bg-cream p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-display text-sm font-bold uppercase tracking-wide text-muted">Tagged winners</h4>
                  <p className="text-xs text-muted">Pull from student accounts or add a name manually.</p>
                </div>
                <button
                  type="button"
                  onClick={() => addWinner(undefined, { name: "", note: "" })}
                  className="btn-outline-dark !py-2"
                >
                  <Plus className="h-4 w-4" /> Manual name
                </button>
              </div>

              <div className="mt-4">
                <SearchBar value={studentQ} onChange={setStudentQ} placeholder="Search students to tag…" />
                {studentQ.trim() && (
                  <ul className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-line bg-white">
                    {students.length ? students.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => { addWinner(s); setStudentQ(""); }}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-cream"
                        >
                          {s.avatar ? (
                            <img src={s.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                              {(s.firstName[0] ?? "") + (s.lastName[0] ?? "")}
                            </span>
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold text-ink">{s.firstName} {s.lastName}</span>
                            <span className="block truncate text-xs text-muted">{s.nickname ? `@${s.nickname}` : s.email}</span>
                          </span>
                          <UserPlus className="h-4 w-4 text-brand" />
                        </button>
                      </li>
                    )) : (
                      <li className="px-3 py-3 text-sm text-muted">No matching students.</li>
                    )}
                  </ul>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {edit.winners.length ? edit.winners.map((w, i) => (
                  <div key={`${w.userId ?? "m"}-${i}`} className="rounded-xl border border-line bg-white p-3">
                    <div className="flex items-start gap-3">
                      {w.avatar ? (
                        <img src={w.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                          {(w.name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("")}
                        </span>
                      )}
                      <div className="min-w-0 flex-1 space-y-2">
                        <input
                          value={w.name}
                          onChange={(e) => updateWinner(i, { name: e.target.value })}
                          placeholder="Full name"
                          className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm font-semibold outline-none focus:border-brand focus:bg-white"
                        />
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            value={w.nickname ?? ""}
                            onChange={(e) => updateWinner(i, { nickname: e.target.value })}
                            placeholder="Nickname / handle"
                            className="rounded-lg border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-brand focus:bg-white"
                          />
                          <input
                            value={w.note ?? ""}
                            onChange={(e) => updateWinner(i, { note: e.target.value })}
                            placeholder="Why they won (short note)"
                            className="rounded-lg border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-brand focus:bg-white"
                          />
                        </div>
                        {w.userId && (
                          <p className="text-[11px] font-semibold text-brand">Linked student account</p>
                        )}
                      </div>
                      <button type="button" onClick={() => removeWinner(i)} className="rounded-lg p-1.5 text-muted hover:bg-brand-light hover:text-brand">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted">No winners tagged yet.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => setEdit(null)} className="btn-outline-dark !py-2.5">Cancel</button>
              <button type="submit" className="btn-primary !py-2.5"><Save className="h-4 w-4" /> Save giveaway</button>
            </div>
          </form>
        )}
      </Modal>
    </AdminShell>
  );
}
