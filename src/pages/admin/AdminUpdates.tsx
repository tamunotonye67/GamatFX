import { useMemo, useState, useRef } from "react";
import { AdminShell, Card, StatCard, Badge, SearchBar, Modal, Field, Select, Empty, exportCsv, fmtDate } from "./AdminShell";
import { Th, Td, IconBtn } from "./AdminMain";
import { useStore, type NewsItem, type OutlookItem } from "../../lib/store";
import {
  Newspaper, Sun, Plus, Pencil, Trash2, Save, Download,
  Eye, CheckCircle2, EyeOff,
} from "lucide-react";

export { AdminCourseManager } from "./AdminCourseManager";

/* ============================== News ============================== */

export function AdminNews() {
  const { news, saveNews, deleteNews } = useStore();
  const list = useMemo(() => news ?? [], [news]);
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Partial<NewsItem> | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const rows = useMemo(
    () => list.filter((n) => `${n.title} ${n.summary} ${n.pair ?? ""}`.toLowerCase().includes(q.toLowerCase())),
    [list, q]
  );

  const blank = (): Partial<NewsItem> => ({
    title: "", summary: "", body: "", source: "GAMAT Market Desk",
    impact: "medium", pair: "", status: "draft", image: "/images/hero.jpg",
  });

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (edit && reader.result) {
        setEdit({ ...edit, image: String(reader.result) });
      }
    };
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    const res = saveNews({
      id: edit.id,
      title: edit.title ?? "",
      summary: edit.summary ?? "",
      body: edit.body ?? "",
      source: edit.source,
      impact: (edit.impact as NewsItem["impact"]) ?? "medium",
      pair: edit.pair || undefined,
      image: edit.image || undefined,
      status: (edit.status as NewsItem["status"]) ?? "draft",
    });
    if (res.ok) setEdit(null);
    else alert(res.error);
  };

  return (
    <AdminShell title="News Events" subtitle="Publish market headlines and desk notes for the Updates section."
      action={
        <div className="flex flex-wrap gap-3">
          <button onClick={() => exportCsv("news.csv", rows.map(n => ({
            Title: n.title, Impact: n.impact, Pair: n.pair ?? "", Status: n.status, Published: n.publishedAt ? fmtDate(n.publishedAt) : "",
          })))} className="btn-outline-dark !py-2.5"><Download className="h-4 w-4" /> Export</button>
          <button onClick={() => setEdit(blank())} className="btn-primary !py-2.5"><Plus className="h-4 w-4" /> New story</button>
        </div>
      }>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Newspaper} label="Total stories" value={list.length} />
        <StatCard icon={CheckCircle2} label="Published" value={list.filter(n => n.status === "published").length} />
        <StatCard icon={EyeOff} label="Drafts" value={list.filter(n => n.status === "draft").length} />
        <StatCard icon={Eye} label="High impact" value={list.filter(n => n.impact === "high").length} />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <SearchBar value={q} onChange={setQ} placeholder="Search news…" />
          <span className="ml-auto text-sm text-muted">{rows.length} story(ies)</span>
        </div>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
                <tr><Th>Thumbnail</Th><Th>Title</Th><Th>Impact</Th><Th>Pair</Th><Th>Status</Th><Th>Published</Th><Th right>Actions</Th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((n) => (
                  <tr key={n.id} className="transition hover:bg-cream/60">
                    <Td>
                      {n.image ? (
                        <img src={n.image} alt="" className="h-10 w-14 rounded-md object-cover border border-line" />
                      ) : (
                        <div className="flex h-10 w-14 items-center justify-center rounded-md bg-line/60 text-muted">
                          <Newspaper className="h-4 w-4" />
                        </div>
                      )}
                    </Td>
                    <Td><span className="font-semibold text-ink">{n.title}</span></Td>
                    <Td><Badge tone={n.impact === "high" ? "red" : n.impact === "medium" ? "amber" : "gray"}>{n.impact}</Badge></Td>
                    <Td><span className="text-muted">{n.pair || "—"}</span></Td>
                    <Td><Badge tone={n.status === "published" ? "green" : "gray"}>{n.status}</Badge></Td>
                    <Td><span className="text-muted">{n.publishedAt ? fmtDate(n.publishedAt) : "—"}</span></Td>
                    <Td right>
                      <div className="flex justify-end gap-1">
                        <IconBtn title="Edit" onClick={() => setEdit(n)}><Pencil className="h-4 w-4" /></IconBtn>
                        <IconBtn danger title="Delete" onClick={() => { if (confirm("Delete this story?")) deleteNews(n.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </IconBtn>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty icon={Newspaper} title="No news yet" body="Create your first market news story." />}
      </Card>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Edit story" : "New story"} wide>
        {edit && (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Headline" value={edit.title ?? ""} onChange={(v) => setEdit({ ...edit, title: v })} />
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Summary</label>
              <textarea rows={2} value={edit.summary ?? ""} onChange={(e) => setEdit({ ...edit, summary: e.target.value })}
                className="w-full resize-none rounded-xl border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Full body</label>
              <textarea rows={8} value={edit.body ?? ""} onChange={(e) => setEdit({ ...edit, body: e.target.value })}
                className="w-full resize-y rounded-xl border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Thumbnail Picture</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={edit.image ?? ""}
                  onChange={(e) => setEdit({ ...edit, image: e.target.value })}
                  placeholder="Image URL (https://… or upload file below)"
                  className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 shrink-0 rounded-xl border border-line bg-cream px-4 py-2.5 text-xs font-bold text-ink transition hover:border-brand hover:bg-white"
                >
                  Upload Image
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
              </div>
              {edit.image && (
                <div className="mt-2.5 flex items-center gap-3">
                  <img src={edit.image} alt="Thumbnail preview" className="h-14 w-24 rounded-lg object-cover border border-line shadow-sm" />
                  <span className="text-xs text-muted">Thumbnail preview</span>
                </div>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Select label="Impact" value={edit.impact ?? "medium"} onChange={(v) => setEdit({ ...edit, impact: v as NewsItem["impact"] })}
                options={[{ v: "low", l: "Low" }, { v: "medium", l: "Medium" }, { v: "high", l: "High" }]} />
              <Field label="Pair / asset" value={edit.pair ?? ""} onChange={(v) => setEdit({ ...edit, pair: v })} ph="EURUSD / USD / XAUUSD" />
              <Select label="Status" value={edit.status ?? "draft"} onChange={(v) => setEdit({ ...edit, status: v as NewsItem["status"] })}
                options={[{ v: "draft", l: "Draft" }, { v: "published", l: "Published" }]} />
            </div>
            <Field label="Source" value={edit.source ?? ""} onChange={(v) => setEdit({ ...edit, source: v })} />
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEdit(null)} className="btn-outline-dark !py-2.5">Cancel</button>
              <button type="submit" className="btn-primary !py-2.5"><Save className="h-4 w-4" /> Save</button>
            </div>
          </form>
        )}
      </Modal>
    </AdminShell>
  );
}

/* ============================= Outlooks ============================= */

export function AdminOutlooks() {
  const { outlooks, saveOutlook, deleteOutlook } = useStore();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<(Partial<OutlookItem> & { pairsText?: string }) | null>(null);

  const rows = useMemo(
    () => outlooks.filter((o) => `${o.title} ${o.summary} ${o.pairs.join(" ")}`.toLowerCase().includes(q.toLowerCase())),
    [outlooks, q]
  );

  const blank = (): Partial<OutlookItem> & { pairsText?: string } => ({
    date: new Date().toISOString().slice(0, 10),
    title: "", bias: "mixed", pairs: [], pairsText: "",
    summary: "", body: "", levels: "", status: "draft",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    const pairs = (edit.pairsText ?? edit.pairs?.join(", ") ?? "")
      .split(/[,]+/).map((p) => p.trim().toUpperCase()).filter(Boolean);
    const res = saveOutlook({
      id: edit.id,
      date: edit.date ?? new Date().toISOString().slice(0, 10),
      title: edit.title ?? "",
      bias: (edit.bias as OutlookItem["bias"]) ?? "mixed",
      pairs,
      summary: edit.summary ?? "",
      body: edit.body ?? "",
      levels: edit.levels,
      status: (edit.status as OutlookItem["status"]) ?? "draft",
    });
    if (res.ok) setEdit(null);
    else alert(res.error);
  };

  return (
    <AdminShell title="Daily Outlook" subtitle="Publish the desk's daily pair bias, levels and risk notes."
      action={
        <div className="flex flex-wrap gap-3">
          <button onClick={() => exportCsv("outlooks.csv", rows.map(o => ({
            Date: o.date, Title: o.title, Bias: o.bias, Pairs: o.pairs.join(" "), Status: o.status,
          })))} className="btn-outline-dark !py-2.5"><Download className="h-4 w-4" /> Export</button>
          <button onClick={() => setEdit(blank())} className="btn-primary !py-2.5"><Plus className="h-4 w-4" /> New outlook</button>
        </div>
      }>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Sun} label="Total outlooks" value={outlooks.length} />
        <StatCard icon={CheckCircle2} label="Published" value={outlooks.filter(o => o.status === "published").length} />
        <StatCard icon={EyeOff} label="Drafts" value={outlooks.filter(o => o.status === "draft").length} />
        <StatCard icon={Sun} label="This week" value={outlooks.filter(o => {
          const d = +new Date(o.date); return Date.now() - d < 7 * 864e5;
        }).length} />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <SearchBar value={q} onChange={setQ} placeholder="Search outlooks…" />
          <span className="ml-auto text-sm text-muted">{rows.length} outlook(s)</span>
        </div>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
                <tr><Th>Date</Th><Th>Title</Th><Th>Bias</Th><Th>Pairs</Th><Th>Status</Th><Th right>Actions</Th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((o) => (
                  <tr key={o.id} className="transition hover:bg-cream/60">
                    <Td><span className="font-semibold text-ink">{o.date}</span></Td>
                    <Td><span className="text-ink/80">{o.title}</span></Td>
                    <Td><Badge tone={o.bias === "bullish" ? "green" : o.bias === "bearish" ? "red" : o.bias === "mixed" ? "amber" : "gray"}>{o.bias}</Badge></Td>
                    <Td><span className="text-xs text-muted">{o.pairs.join(", ") || "—"}</span></Td>
                    <Td><Badge tone={o.status === "published" ? "green" : "gray"}>{o.status}</Badge></Td>
                    <Td right>
                      <div className="flex justify-end gap-1">
                        <IconBtn title="Edit" onClick={() => setEdit({ ...o, pairsText: o.pairs.join(", ") })}><Pencil className="h-4 w-4" /></IconBtn>
                        <IconBtn danger title="Delete" onClick={() => { if (confirm("Delete this outlook?")) deleteOutlook(o.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </IconBtn>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty icon={Sun} title="No outlooks yet" body="Publish the first daily outlook for students." />}
      </Card>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Edit outlook" : "New outlook"} wide>
        {edit && (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date" type="date" value={edit.date ?? ""} onChange={(v) => setEdit({ ...edit, date: v })} />
              <Select label="Bias" value={edit.bias ?? "mixed"} onChange={(v) => setEdit({ ...edit, bias: v as OutlookItem["bias"] })}
                options={[
                  { v: "bullish", l: "Bullish" }, { v: "bearish", l: "Bearish" },
                  { v: "neutral", l: "Neutral" }, { v: "mixed", l: "Mixed" },
                ]} />
            </div>
            <Field label="Title" value={edit.title ?? ""} onChange={(v) => setEdit({ ...edit, title: v })} />
            <Field label="Pairs (comma separated)" value={edit.pairsText ?? ""} onChange={(v) => setEdit({ ...edit, pairsText: v })} ph="EURUSD, GBPUSD, XAUUSD" />
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Summary</label>
              <textarea rows={2} value={edit.summary ?? ""} onChange={(e) => setEdit({ ...edit, summary: e.target.value })}
                className="w-full resize-none rounded-xl border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Full notes</label>
              <textarea rows={8} value={edit.body ?? ""} onChange={(e) => setEdit({ ...edit, body: e.target.value })}
                className="w-full resize-y rounded-xl border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Key levels (optional)</label>
              <textarea rows={3} value={edit.levels ?? ""} onChange={(e) => setEdit({ ...edit, levels: e.target.value })}
                className="w-full resize-none rounded-xl border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white"
                placeholder={"EURUSD support 1.0820 / resistance 1.0910"} />
            </div>
            <Select label="Status" value={edit.status ?? "draft"} onChange={(v) => setEdit({ ...edit, status: v as OutlookItem["status"] })}
              options={[{ v: "draft", l: "Draft" }, { v: "published", l: "Published" }]} />
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEdit(null)} className="btn-outline-dark !py-2.5">Cancel</button>
              <button type="submit" className="btn-primary !py-2.5"><Save className="h-4 w-4" /> Save</button>
            </div>
          </form>
        )}
      </Modal>
    </AdminShell>
  );
}
