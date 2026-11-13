import { useState, useRef, useEffect } from "react";
import { AdminShell, Card, Field } from "./AdminShell";
import { useStore, type StudentOfTheWeek } from "../../lib/store";
import { Trophy, Save, Upload, Star, CheckCircle2, Zap, Eye, Loader2 } from "lucide-react";
import { uploadAvatar } from "../../lib/supabaseStorage";

export function AdminStudentOfTheWeek() {
  const { studentOfTheWeek, saveStudentOfTheWeek, admin } = useStore();
  const accounts = admin?.accounts ?? [];
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<Partial<StudentOfTheWeek>>({
    id: studentOfTheWeek.id || "sotw_active",
    studentId: studentOfTheWeek.studentId ?? "",
    studentName: studentOfTheWeek.studentName ?? "",
    avatar: studentOfTheWeek.avatar ?? "",
    track: studentOfTheWeek.track ?? "Advanced Technicals & Price Action",
    weekPeriod: studentOfTheWeek.weekPeriod ?? `Week of ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}, 2026`,
    winRate: studentOfTheWeek.winRate ?? "91.2%",
    quizXP: studentOfTheWeek.quizXP ?? "1,240 XP",
    combatRank: studentOfTheWeek.combatRank ?? "Apex Sovereign (Tier 7)",
    weeklyReturn: studentOfTheWeek.weeklyReturn ?? "+28.4% Return",
    performanceReview: studentOfTheWeek.performanceReview ?? "",
    mentorQuote: studentOfTheWeek.mentorQuote ?? "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sync form when studentOfTheWeek updates from Supabase or storage
  useEffect(() => {
    if (studentOfTheWeek) {
      setForm((prev) => ({
        ...prev,
        id: studentOfTheWeek.id || "sotw_active",
        studentId: prev.studentId || studentOfTheWeek.studentId || "",
        studentName: prev.studentName || studentOfTheWeek.studentName || "",
        avatar: prev.avatar || studentOfTheWeek.avatar || "",
        track: prev.track || studentOfTheWeek.track || "Advanced Technicals & Price Action",
        weekPeriod: prev.weekPeriod || studentOfTheWeek.weekPeriod || "",
        winRate: prev.winRate || studentOfTheWeek.winRate || "91.2%",
        quizXP: prev.quizXP || studentOfTheWeek.quizXP || "1,240 XP",
        combatRank: prev.combatRank || studentOfTheWeek.combatRank || "Apex Sovereign (Tier 7)",
        weeklyReturn: prev.weeklyReturn || studentOfTheWeek.weeklyReturn || "+28.4% Return",
        performanceReview: prev.performanceReview || studentOfTheWeek.performanceReview || "",
        mentorQuote: prev.mentorQuote || studentOfTheWeek.mentorQuote || "",
      }));
    }
  }, [studentOfTheWeek]);

  const handleSelectStudent = (accId: string) => {
    if (!accId) return;
    const acc = accounts.find((a) => a.id === accId);
    if (!acc) return;
    setForm((prev) => ({
      ...prev,
      studentId: acc.id,
      studentName: `${acc.firstName} ${acc.lastName}`,
      avatar: acc.avatar || prev.avatar,
    }));
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // 1. Try uploading to Supabase Storage first
    try {
      const uploadRes = await uploadAvatar(form.studentId || "sotw", file);
      if (uploadRes.ok && uploadRes.url && uploadRes.url.startsWith("http")) {
        setForm((prev) => ({ ...prev, avatar: uploadRes.url }));
        setIsUploading(false);
        return;
      }
    } catch {}

    // 2. Client-side canvas compression (max 800px, 80KB) to prevent storage/network quota blowouts
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 800;
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL("image/jpeg", 0.82);
        setForm((prev) => ({ ...prev, avatar: compressed }));
        setIsUploading(false);
      };
      if (reader.result) img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setIsSaving(true);
    const res = await saveStudentOfTheWeek({
      id: form.id || studentOfTheWeek.id || "sotw_active",
      studentId: form.studentId,
      studentName: form.studentName ?? "",
      avatar: form.avatar,
      track: form.track ?? "Price Action Mastery",
      weekPeriod: form.weekPeriod ?? "",
      winRate: form.winRate ?? "88.0%",
      quizXP: form.quizXP ?? "1,000 XP",
      combatRank: form.combatRank ?? "Apex Master",
      weeklyReturn: form.weeklyReturn ?? "+20.0%",
      performanceReview: form.performanceReview ?? "",
      mentorQuote: form.mentorQuote,
    });
    setIsSaving(false);
    if (res.ok) {
      setMsg({ type: "success", text: "Student of the Week spotlight updated and published live!" });
    } else {
      setMsg({ type: "error", text: res.error || "Failed to update spotlight." });
    }
  };

  return (
    <AdminShell
      title="Student of the Week"
      subtitle="Nominate and publish the top performing student spotlight with custom metrics and performance reviews."
      action={
        <a
          href="/fun/student-of-the-week"
          target="_blank"
          rel="noreferrer"
          className="btn-outline-dark !py-2 inline-flex items-center gap-1.5"
        >
          <Eye className="h-4 w-4" /> View Live Page
        </a>
      }
    >
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6 text-brand font-bold">
              <Trophy className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold text-ink">Publish Active Spotlight</h2>
            </div>

            {msg && (
              <div
                className={`mb-6 rounded-2xl p-4 text-sm font-semibold flex items-center gap-2 ${
                  msg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                {msg.text}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              {/* Quick Account Selector */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Quick Select Registered Student
                </label>
                <select
                  onChange={(e) => handleSelectStudent(e.target.value)}
                  className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white"
                >
                  <option value="">-- Pick from registered accounts --</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.firstName} {a.lastName} ({a.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Student Full Name *"
                  value={form.studentName ?? ""}
                  onChange={(v) => setForm({ ...form, studentName: v })}
                  ph="e.g. Kelechi Okafor"
                />
                <Field
                  label="Course / Track *"
                  value={form.track ?? ""}
                  onChange={(v) => setForm({ ...form, track: v })}
                  ph="e.g. Advanced Price Action"
                />
              </div>

              <Field
                label="Week Period *"
                value={form.weekPeriod ?? ""}
                onChange={(v) => setForm({ ...form, weekPeriod: v })}
                ph="e.g. Week of August 10 – August 16, 2026"
              />

              {/* Picture Upload / URL */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Student Picture / Avatar
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={form.avatar ?? ""}
                    onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                    placeholder="Image URL or upload file below"
                    className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white"
                  />
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-1.5 shrink-0 rounded-xl border border-line bg-cream px-4 py-2.5 text-xs font-bold text-ink transition hover:border-brand hover:bg-white disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {isUploading ? "Optimizing..." : "Upload"}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
                </div>

                {form.avatar && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={form.avatar} alt="Preview" className="h-16 w-16 shrink-0 aspect-square rounded-xl object-cover border border-line shadow-sm" />
                    <span className="text-xs text-muted">Photo preview</span>
                  </div>
                )}
              </div>

              {/* Metrics Inputs */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Win Rate"
                  value={form.winRate ?? ""}
                  onChange={(v) => setForm({ ...form, winRate: v })}
                  ph="e.g. 91.2%"
                />
                <Field
                  label="Quiz XP High Score"
                  value={form.quizXP ?? ""}
                  onChange={(v) => setForm({ ...form, quizXP: v })}
                  ph="e.g. 1,240 XP"
                />
                <Field
                  label="Market Combat Rank"
                  value={form.combatRank ?? ""}
                  onChange={(v) => setForm({ ...form, combatRank: v })}
                  ph="e.g. Apex Sovereign (Tier 7)"
                />
                <Field
                  label="Weekly Gain / Return"
                  value={form.weeklyReturn ?? ""}
                  onChange={(v) => setForm({ ...form, weeklyReturn: v })}
                  ph="e.g. +28.4% Return"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Performance Review Writeup *
                </label>
                <textarea
                  rows={4}
                  value={form.performanceReview ?? ""}
                  onChange={(e) => setForm({ ...form, performanceReview: e.target.value })}
                  placeholder="Detail trade executions, risk management adherence, or quiz arcade performance..."
                  className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Mentor Recommendation Quote
                </label>
                <textarea
                  rows={2}
                  value={form.mentorQuote ?? ""}
                  onChange={(e) => setForm({ ...form, mentorQuote: e.target.value })}
                  placeholder="e.g. Consistency isn't luck; it's adhering to your plan when emotion urges you to break rules."
                  className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 text-sm outline-none focus:border-brand focus:bg-white resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="btn-primary w-full justify-center !py-3 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving & Publishing...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save & Publish Student of the Week
                    </>
                  )}
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Live Preview Card */}
        <div className="lg:col-span-5">
          <Card className="p-6 bg-slate-950 text-white border-brand/30">
            <div className="flex items-center gap-2 mb-4 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Zap className="h-4 w-4" /> Live Public Card Preview
            </div>

            <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-xl">
              <img
                src={form.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-0.5 text-[11px] font-black uppercase text-slate-950">
                <Star className="h-3 w-3 fill-slate-950" /> Champion
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{form.weekPeriod}</p>
                <h3 className="text-xl font-black">{form.studentName || "Student Name"}</h3>
                <p className="text-xs text-slate-300 font-medium">{form.track}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-white/5 p-2 border border-white/10 text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Win Rate</span>
                <span className="font-extrabold text-amber-400">{form.winRate}</span>
              </div>
              <div className="rounded-xl bg-white/5 p-2 border border-white/10 text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Gain</span>
                <span className="font-extrabold text-emerald-400">{form.weeklyReturn}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
