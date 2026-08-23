import { useMemo, useRef, useState } from "react";
import { AdminShell, Card, StatCard, Badge, SearchBar, Modal, Field, Empty, exportCsv } from "./AdminShell";
import { Th, Td, IconBtn } from "./AdminMain";
import {
  useStore,
  type ManagedCourse,
  type ManagedModule,
  type ManagedLesson,
} from "../../lib/store";
import { naira } from "../../lib/courses";
import {
  BookOpen, Plus, Pencil, Trash2, Save, Download, CheckCircle2, EyeOff,
  GraduationCap, LineChart, Brain, Target, Shield, Award, Rocket,
  TrendingUp, BarChart3, Layers, Upload, Link2, Video, ChevronDown, ChevronUp,
} from "lucide-react";

const ICON_OPTIONS = [
  { v: "GraduationCap", l: "Graduation", Icon: GraduationCap },
  { v: "LineChart", l: "Line chart", Icon: LineChart },
  { v: "Brain", l: "Brain", Icon: Brain },
  { v: "Target", l: "Target", Icon: Target },
  { v: "Shield", l: "Shield", Icon: Shield },
  { v: "Award", l: "Award", Icon: Award },
  { v: "Rocket", l: "Rocket", Icon: Rocket },
  { v: "TrendingUp", l: "Trending", Icon: TrendingUp },
  { v: "BarChart3", l: "Bars", Icon: BarChart3 },
  { v: "Layers", l: "Layers", Icon: Layers },
  { v: "BookOpen", l: "Book", Icon: BookOpen },
  { v: "Video", l: "Video", Icon: Video },
] as const;

const COLORS = [
  "#dc3545", "#b02a37", "#0f766e", "#1d4ed8", "#7c3aed",
  "#b45309", "#be123c", "#0369a1", "#15803d", "#16181c",
];

const uid = () => `x_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

type Draft = Partial<ManagedCourse> & {
  outcomesText?: string;
  requirementsText?: string;
  modules: ManagedModule[];
};

function blankLesson(index = 1): ManagedLesson {
  return { id: uid(), title: `Lesson ${index}: Introduction`, duration: "10:00", videoUrl: "", videoFileName: "", free: false };
}
function blankModule(index = 1): ManagedModule {
  return { id: uid(), title: `Module ${index}: Core Concepts`, lessons: [blankLesson(1)] };
}
function blankCourse(): Draft {
  return {
    title: "", short: "", desc: "", tag: "Fundamental", level: "Beginner",
    duration: "6hr", price: 39999, oldPrice: undefined, poster: "/images/about-hero.jpg",
    video: "https://videos.pexels.com/video-files/38484636/16343740_3840_2160_50fps.mp4",
    icon: "GraduationCap", iconColor: "#dc3545",
    outcomesText: "", requirementsText: "",
    modules: [blankModule(1)],
    published: true, featured: false,
  };
}

function IconPreview({ name, color }: { name?: string; color?: string }) {
  const found = ICON_OPTIONS.find((o) => o.v === name) ?? ICON_OPTIONS[0];
  const I = found.Icon;
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ background: color || "#dc3545" }}>
      <I className="h-5 w-5" />
    </span>
  );
}

function readVideoFile(file: File): Promise<{ url: string; name: string }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("video/") && !file.name.match(/\.(mp4|webm|mov|m4v)$/i)) {
      reject(new Error("Please choose a video file (MP4, WebM, MOV)."));
      return;
    }
    // Cap at ~40MB for localStorage safety; larger files should use a URL.
    if (file.size > 40 * 1024 * 1024) {
      reject(new Error("File is larger than 40MB. Host it online and paste the URL instead."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve({ url: String(reader.result), name: file.name });
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

export function AdminCourseManager() {
  const { managedCourses, saveManagedCourse, deleteManagedCourse } = useStore();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Draft | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [openMod, setOpenMod] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const lessonUpload = useRef<{ mi: number; li: number } | null>(null);

  const rows = useMemo(
    () => managedCourses.filter((c) => `${c.title} ${c.tag} ${c.level}`.toLowerCase().includes(q.toLowerCase())),
    [managedCourses, q]
  );

  const openEdit = (c?: ManagedCourse) => {
    if (!c) { setEdit(blankCourse()); setOpenMod(null); setErr(null); return; }
    setEdit({
      ...c,
      outcomesText: (c.outcomes ?? []).join("\n"),
      requirementsText: (c.requirements ?? []).join("\n"),
      modules: c.modules?.length ? c.modules : [blankModule()],
      icon: c.icon || "GraduationCap",
      iconColor: c.iconColor || "#dc3545",
    });
    setOpenMod(c.modules?.[0]?.id ?? null);
    setErr(null);
  };

  const setMod = (mi: number, patch: Partial<ManagedModule>) => {
    if (!edit) return;
    const modules = edit.modules.map((m, i) => (i === mi ? { ...m, ...patch } : m));
    setEdit({ ...edit, modules });
  };

  const setLes = (mi: number, li: number, patch: Partial<ManagedLesson>) => {
    if (!edit) return;
    const modules = edit.modules.map((m, i) => {
      if (i !== mi) return m;
      return { ...m, lessons: m.lessons.map((l, j) => (j === li ? { ...l, ...patch } : l)) };
    });
    setEdit({ ...edit, modules });
  };

  const addModule = () => {
    if (!edit) return;
    const m = blankModule();
    setEdit({ ...edit, modules: [...edit.modules, m] });
    setOpenMod(m.id);
  };

  const removeModule = (mi: number) => {
    if (!edit || edit.modules.length <= 1) return;
    setEdit({ ...edit, modules: edit.modules.filter((_, i) => i !== mi) });
  };

  const addLesson = (mi: number) => {
    if (!edit) return;
    setMod(mi, { lessons: [...edit.modules[mi].lessons, blankLesson()] });
  };

  const removeLesson = (mi: number, li: number) => {
    if (!edit) return;
    const lessons = edit.modules[mi].lessons.filter((_, j) => j !== li);
    setMod(mi, { lessons: lessons.length ? lessons : [blankLesson()] });
  };

  const onUpload = async (file?: File) => {
    if (!file || !lessonUpload.current || !edit) return;
    const { mi, li } = lessonUpload.current;
    try {
      const { url, name } = await readVideoFile(file);
      setLes(mi, li, { videoUrl: url, videoFileName: name });
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    }
    lessonUpload.current = null;
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    if (!edit.title?.trim()) { setErr("Course title is required."); return; }
    const modules = edit.modules
      .map((m) => ({
        ...m,
        title: m.title.trim() || "Untitled module",
        lessons: m.lessons
          .filter((l) => l.title.trim())
          .map((l) => ({ ...l, title: l.title.trim() })),
      }))
      .filter((m) => m.lessons.length);

    const res = saveManagedCourse({
      id: edit.id,
      title: edit.title ?? "",
      short: edit.short ?? "",
      desc: edit.desc ?? "",
      tag: edit.tag ?? "Fundamental",
      level: edit.level ?? "Beginner",
      duration: edit.duration ?? "",
      price: Number(edit.price) || 0,
      oldPrice: edit.oldPrice ? Number(edit.oldPrice) : undefined,
      poster: edit.poster || undefined,
      video: edit.video || undefined,
      icon: edit.icon || "GraduationCap",
      iconColor: edit.iconColor || "#dc3545",
      outcomes: (edit.outcomesText ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
      requirements: (edit.requirementsText ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
      modules: modules.length ? modules : [blankModule()],
      published: edit.published !== false,
      featured: !!edit.featured,
    });
    if (!res.ok) { setErr(res.error ?? "Could not save."); return; }
    setEdit(null);
  };

  return (
    <AdminShell
      title="Course Manager"
      subtitle="Create courses with full curriculum, listing icons, colours and lesson videos."
      action={
        <div className="flex flex-wrap gap-3">
          <button onClick={() => exportCsv("managed-courses.csv", rows.map((c) => ({
            Title: c.title, Tag: c.tag, Level: c.level, Price: c.price,
            Modules: c.modules?.length ?? 0,
            Lessons: c.modules?.reduce((n, m) => n + m.lessons.length, 0) ?? 0,
            Published: c.published ? "Yes" : "No",
          })))} className="btn-outline-dark !py-2.5"><Download className="h-4 w-4" /> Export</button>
          <button onClick={() => openEdit()} className="btn-primary !py-2.5"><Plus className="h-4 w-4" /> Add course</button>
        </div>
      }
    >
      <input ref={fileRef} type="file" accept="video/*,.mp4,.webm,.mov,.m4v" className="hidden"
        onChange={(e) => void onUpload(e.target.files?.[0])} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BookOpen} label="Managed courses" value={managedCourses.length} />
        <StatCard icon={CheckCircle2} label="Published" value={managedCourses.filter((c) => c.published).length} />
        <StatCard icon={EyeOff} label="Hidden" value={managedCourses.filter((c) => !c.published).length} />
        <StatCard icon={Video} label="Total lessons" value={managedCourses.reduce((n, c) => n + (c.modules?.reduce((a, m) => a + m.lessons.length, 0) ?? 0), 0)} />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <SearchBar value={q} onChange={setQ} placeholder="Search courses…" />
          <span className="ml-auto text-sm text-muted">{rows.length} course(s)</span>
        </div>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
                <tr><Th>Course</Th><Th>Tag</Th><Th>Curriculum</Th><Th>Price</Th><Th>Status</Th><Th right>Actions</Th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((c) => {
                  const lessons = c.modules?.reduce((n, m) => n + m.lessons.length, 0) ?? 0;
                  return (
                    <tr key={c.id} className="transition hover:bg-cream/60">
                      <Td>
                        <div className="flex items-center gap-3">
                          <IconPreview name={c.icon} color={c.iconColor} />
                          <div>
                            <p className="font-semibold text-ink">{c.title}</p>
                            <p className="text-xs text-muted">{c.level} · {c.duration}</p>
                          </div>
                        </div>
                      </Td>
                      <Td><Badge tone="gray">{c.tag}</Badge></Td>
                      <Td><span className="text-muted">{c.modules?.length ?? 0} modules · {lessons} lessons</span></Td>
                      <Td><span className="font-bold text-ink">{naira(c.price)}</span></Td>
                      <Td>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge tone={c.published ? "green" : "gray"}>{c.published ? "published" : "hidden"}</Badge>
                          {c.featured && <Badge tone="red">featured</Badge>}
                        </div>
                      </Td>
                      <Td right>
                        <div className="flex justify-end gap-1">
                          <IconBtn title="Edit" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></IconBtn>
                          <IconBtn danger title="Delete" onClick={() => { if (confirm(`Delete "${c.title}"?`)) deleteManagedCourse(c.id); }}>
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
        ) : (
          <Empty icon={BookOpen} title="No custom courses yet"
            body="Add a full course with outcomes, requirements, curriculum modules and lesson videos." />
        )}
      </Card>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Edit course" : "Add course"} wide>
        {edit && (
          <form onSubmit={submit} className="space-y-6">
            {err && <p className="rounded-xl border border-brand/30 bg-brand-light p-3 text-sm text-ink/80">{err}</p>}

            {/* Basics */}
            <section className="space-y-4">
              <h4 className="font-display text-sm font-bold uppercase tracking-wide text-muted">Basics</h4>
              <Field label="Title" value={edit.title ?? ""} onChange={(v) => setEdit({ ...edit, title: v })} />
              <Field label="Short description" value={edit.short ?? ""} onChange={(v) => setEdit({ ...edit, short: v })} />
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Full description</label>
                <textarea rows={4} value={edit.desc ?? ""} onChange={(e) => setEdit({ ...edit, desc: e.target.value })}
                  className="w-full resize-none rounded-xl border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Tag" value={edit.tag ?? ""} onChange={(v) => setEdit({ ...edit, tag: v })} ph="Fundamental" />
                <Field label="Level" value={edit.level ?? ""} onChange={(v) => setEdit({ ...edit, level: v })} ph="Beginner" />
                <Field label="Duration" value={edit.duration ?? ""} onChange={(v) => setEdit({ ...edit, duration: v })} ph="8hr 30min" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Price (₦)" type="number" value={edit.price ?? 0} onChange={(v) => setEdit({ ...edit, price: Number(v) })} />
                <Field label="Old price (optional)" type="number" value={edit.oldPrice ?? ""} onChange={(v) => setEdit({ ...edit, oldPrice: v ? Number(v) : undefined })} />
              </div>
            </section>

            {/* Listing icon + colour */}
            <section className="space-y-4 rounded-2xl border border-line bg-cream p-5">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-display text-sm font-bold uppercase tracking-wide text-muted">Listing icon</h4>
                <IconPreview name={edit.icon} color={edit.iconColor} />
              </div>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {ICON_OPTIONS.map((o) => {
                  const on = edit.icon === o.v;
                  return (
                    <button key={o.v} type="button" onClick={() => setEdit({ ...edit, icon: o.v })}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-[10px] font-semibold transition ${
                        on ? "border-brand bg-brand-light text-brand" : "border-line bg-white text-muted hover:border-brand/40"
                      }`}>
                      <o.Icon className="h-4 w-4" />
                      {o.l}
                    </button>
                  );
                })}
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Icon colour</p>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setEdit({ ...edit, iconColor: c })}
                      className={`h-8 w-8 rounded-full border-2 transition ${edit.iconColor === c ? "border-ink scale-110" : "border-white"}`}
                      style={{ background: c }} title={c} />
                  ))}
                  <input type="color" value={edit.iconColor || "#dc3545"}
                    onChange={(e) => setEdit({ ...edit, iconColor: e.target.value })}
                    className="h-8 w-10 cursor-pointer rounded border border-line bg-white p-0.5" />
                </div>
              </div>
            </section>

            {/* Media */}
            <section className="space-y-4">
              <h4 className="font-display text-sm font-bold uppercase tracking-wide text-muted">Cover media</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Poster image URL" value={edit.poster ?? ""} onChange={(v) => setEdit({ ...edit, poster: v })} />
                <Field label="Preview video URL" value={edit.video ?? ""} onChange={(v) => setEdit({ ...edit, video: v })} ph="https://…/preview.mp4" />
              </div>
            </section>

            {/* What you'll learn */}
            <section className="space-y-3">
              <h4 className="font-display text-sm font-bold uppercase tracking-wide text-muted">What you'll learn</h4>
              <p className="text-xs text-muted">One outcome per line — shown on the course page like built-in programmes.</p>
              <textarea rows={5} value={edit.outcomesText ?? ""} onChange={(e) => setEdit({ ...edit, outcomesText: e.target.value })}
                placeholder={"Read economic data releases\nMap institutional zones\nBuild a top-down bias"}
                className="w-full resize-none rounded-xl border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white" />
            </section>

            {/* Requirements */}
            <section className="space-y-3">
              <h4 className="font-display text-sm font-bold uppercase tracking-wide text-muted">Requirements</h4>
              <textarea rows={3} value={edit.requirementsText ?? ""} onChange={(e) => setEdit({ ...edit, requirementsText: e.target.value })}
                placeholder={"A laptop or smartphone\nFree TradingView or MT5 account"}
                className="w-full resize-none rounded-xl border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white" />
            </section>

            {/* Curriculum */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-display text-sm font-bold uppercase tracking-wide text-muted">Curriculum</h4>
                  <p className="text-xs text-muted">Modules and lessons with optional video links or uploads.</p>
                </div>
                <button type="button" onClick={addModule} className="btn-outline-dark !py-2">
                  <Plus className="h-4 w-4" /> Add module
                </button>
              </div>

              <div className="space-y-3">
                {edit.modules.map((m, mi) => {
                  const open = openMod === m.id;
                  return (
                    <div key={m.id} className="overflow-hidden rounded-2xl border border-line bg-white">
                      <div className="flex items-center gap-2 border-b border-line bg-cream/60 px-4 py-3">
                        <button type="button" onClick={() => setOpenMod(open ? null : m.id)} className="text-muted">
                          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        <input
                          value={m.title}
                          onChange={(e) => setMod(mi, { title: e.target.value })}
                          className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-bold text-ink outline-none focus:border-line focus:bg-white"
                          placeholder="Module title"
                        />
                        <span className="text-xs text-muted">{m.lessons.length} lesson(s)</span>
                        <button type="button" onClick={() => removeModule(mi)} className="rounded-lg p-1.5 text-muted hover:bg-brand-light hover:text-brand">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {open && (
                        <div className="space-y-3 p-4">
                          {m.lessons.map((l, li) => (
                            <div key={l.id} className="rounded-xl border border-line bg-cream/40 p-3">
                              <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto]">
                                <input value={l.title} onChange={(e) => setLes(mi, li, { title: e.target.value })}
                                  placeholder="Lesson title" className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand" />
                                <input value={l.duration} onChange={(e) => setLes(mi, li, { duration: e.target.value })}
                                  placeholder="12:00" className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand" />
                                <label className="flex items-center gap-2 text-xs font-semibold text-muted">
                                  <input type="checkbox" checked={!!l.free} onChange={(e) => setLes(mi, li, { free: e.target.checked })}
                                    className="h-3.5 w-3.5 accent-[#dc3545]" /> Free preview
                                </label>
                              </div>

                              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                                <div className="relative">
                                  <Link2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                                  <input
                                    value={l.videoUrl && !l.videoUrl.startsWith("data:") ? l.videoUrl : ""}
                                    onChange={(e) => setLes(mi, li, { videoUrl: e.target.value, videoFileName: "" })}
                                    placeholder="Video URL (https://…)"
                                    className="w-full rounded-lg border border-line bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => { lessonUpload.current = { mi, li }; fileRef.current?.click(); }}
                                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-xs font-bold text-ink transition hover:border-brand hover:text-brand"
                                >
                                  <Upload className="h-3.5 w-3.5" /> Upload
                                </button>
                                <button type="button" onClick={() => removeLesson(mi, li)}
                                  className="rounded-lg border border-line bg-white px-3 py-2 text-muted hover:border-brand hover:text-brand">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              {l.videoFileName && (
                                <p className="mt-2 text-[11px] font-semibold text-brand">
                                  Uploaded: {l.videoFileName}
                                </p>
                              )}
                              {l.videoUrl && l.videoUrl.startsWith("data:") && !l.videoFileName && (
                                <p className="mt-2 text-[11px] font-semibold text-brand">Local video attached</p>
                              )}
                            </div>
                          ))}
                          <button type="button" onClick={() => addLesson(mi)} className="btn-outline-dark !py-2">
                            <Plus className="h-4 w-4" /> Add lesson
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="flex flex-wrap gap-5 border-t border-line pt-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-ink">
                <input type="checkbox" checked={edit.published !== false} onChange={(e) => setEdit({ ...edit, published: e.target.checked })}
                  className="h-4 w-4 rounded accent-[#dc3545]" /> Published
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-ink">
                <input type="checkbox" checked={!!edit.featured} onChange={(e) => setEdit({ ...edit, featured: e.target.checked })}
                  className="h-4 w-4 rounded accent-[#dc3545]" /> Featured
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setEdit(null)} className="btn-outline-dark !py-2.5">Cancel</button>
              <button type="submit" className="btn-primary !py-2.5"><Save className="h-4 w-4" /> Save course</button>
            </div>
          </form>
        )}
      </Modal>
    </AdminShell>
  );
}
