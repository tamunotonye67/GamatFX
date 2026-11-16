import { useState, useRef, useEffect } from "react";
import { AdminShell, Card } from "./AdminShell";
import { useStore, type StudentOfTheWeek, type Account, type QuizAttempt, type CombatStats } from "../../lib/store";
import { Trophy, Save, Upload, Star, CheckCircle2, Zap, Eye, Loader2, Flame, TrendingUp, ShieldCheck, Image as ImageIcon, Link2, X } from "lucide-react";
import { uploadAvatar } from "../../lib/supabaseStorage";
import { COURSES } from "../../lib/courses";
import { rankForXp } from "../../lib/combat";
import { formatStudentName, formatAccountName } from "../../lib/formatName";
import { normalizeImageUrl, handleImageError, DEFAULT_FALLBACK_IMAGES } from "../../lib/imageUrl";

function formatReturn(val?: string): string {
  if (!val) return "+0.0%";
  const cleaned = val.replace(/\s*Return/i, "").trim();
  return cleaned || "+0.0%";
}

function formatTier(rank?: string): string {
  if (!rank) return "Tier 1";
  const match = rank.match(/Tier\s*(\d+)/i);
  if (match) return `Tier ${match[1]}`;
  const lvlMatch = rank.match(/(?:Level|Lv\.?)\s*(\d+)/i);
  if (lvlMatch) return `Tier ${lvlMatch[1]}`;
  return rank.length <= 8 ? rank : "Tier 1";
}

function computeStudentMetrics(
  acc: Account,
  allAttempts: QuizAttempt[] = [],
  combatByUser: Record<string, CombatStats> = {}
): Partial<StudentOfTheWeek> {
  // 1. Real stats lookup
  const combatStats = combatByUser[acc.id];
  const userAttempts = allAttempts.filter((a) => a.userId === acc.id);

  // 2. Real Win Rate (0.0% if student has not played combat or taken quizzes yet)
  let winRate = "0.0%";
  if (combatStats && (combatStats.wins + combatStats.losses) > 0) {
    const rawRate = (combatStats.wins / (combatStats.wins + combatStats.losses)) * 100;
    winRate = `${rawRate.toFixed(1)}%`;
  } else if (userAttempts.length > 0) {
    const passed = userAttempts.filter((a) => a.passed).length;
    const avgScore = (passed / userAttempts.length) * 100;
    winRate = `${avgScore.toFixed(1)}%`;
  }

  // 3. Real Quiz & Combat XP (0 XP if student has not earned any yet)
  const quizPoints = userAttempts.reduce((s, a) => s + (a.passed ? a.score * 10 : 0), 0);
  const realXp = (combatStats?.xp ?? 0) + quizPoints;
  const quizXP = `${realXp.toLocaleString()} XP`;

  // 4. Market Combat Rank based directly on real XP (Level 1 Market Rookie if 0 XP)
  const r = rankForXp(realXp);
  const combatRank = `${r.title} (Tier ${r.level})`;

  // 5. Real-time Weekly Return (defaults to +0.0% unless specified)
  const weeklyReturn = "+0.0%";

  // 6. Week Period (Current active Monday - Sunday)
  const now = new Date();
  const day = now.getDay();
  const diffToMon = now.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(now);
  mon.setDate(diffToMon);
  const sun = new Date(now);
  sun.setDate(diffToMon + 6);
  const monStr = mon.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const sunStr = sun.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const weekPeriod = `Week of ${monStr} – ${sunStr}`;

  // 7. Photo / Avatar: Real avatar from user account if available
  const avatar = acc.avatar?.trim() || "";

  return {
    studentId: acc.id,
    studentName: formatAccountName(acc),
    avatar,
    weekPeriod,
    winRate,
    quizXP,
    combatRank,
    weeklyReturn,
    // Course track, performance review and mentor quote are intentionally manual
  };
}

export function AdminStudentOfTheWeek() {
  const { studentOfTheWeek, saveStudentOfTheWeek, admin, managedCourses } = useStore();
  const accounts = admin?.accounts ?? [];
  const fileRef = useRef<HTMLInputElement | null>(null);

  const allCourseOptions = Array.from(
    new Set([
      ...COURSES.map((c) => c.title),
      ...(managedCourses ?? []).map((m: any) => m.title).filter(Boolean),
    ])
  );

  const [form, setForm] = useState<Partial<StudentOfTheWeek>>({
    id: studentOfTheWeek.id || "sotw_active",
    studentId: studentOfTheWeek.studentId ?? "",
    studentName: studentOfTheWeek.studentName ?? "",
    avatar: studentOfTheWeek.avatar ?? "",
    track: studentOfTheWeek.track ?? "",
    weekPeriod: studentOfTheWeek.weekPeriod ?? `Week of ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}, 2026`,
    winRate: studentOfTheWeek.winRate ?? "0.0%",
    quizXP: studentOfTheWeek.quizXP ?? "0 XP",
    combatRank: studentOfTheWeek.combatRank ?? "Market Rookie (Tier 1)",
    weeklyReturn: studentOfTheWeek.weeklyReturn ? formatReturn(studentOfTheWeek.weeklyReturn) : "+0.0%",
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
        track: prev.track || studentOfTheWeek.track || "",
        weekPeriod: prev.weekPeriod || studentOfTheWeek.weekPeriod || "",
        winRate: prev.winRate || studentOfTheWeek.winRate || "0.0%",
        quizXP: prev.quizXP || studentOfTheWeek.quizXP || "0 XP",
        combatRank: prev.combatRank || studentOfTheWeek.combatRank || "Market Rookie (Tier 1)",
        weeklyReturn: prev.weeklyReturn ? formatReturn(prev.weeklyReturn) : (studentOfTheWeek.weeklyReturn ? formatReturn(studentOfTheWeek.weeklyReturn) : "+0.0%"),
        performanceReview: prev.performanceReview || studentOfTheWeek.performanceReview || "",
        mentorQuote: prev.mentorQuote || studentOfTheWeek.mentorQuote || "",
      }));
    }
  }, [studentOfTheWeek]);

  // If navigating from ?studentId=...
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const sid = sp.get("studentId");
      if (sid && accounts.some((a) => a.id === sid)) {
        handleSelectStudent(sid, true);
      }
    } catch {}
  }, [accounts]);

  const handleSelectStudent = (accId: string, announce = true) => {
    if (!accId) return;
    const acc = accounts.find((a) => a.id === accId);
    if (!acc) return;

    const metrics = computeStudentMetrics(
      acc,
      admin?.attempts ?? [],
      admin?.combatByUser ?? {}
    );

    setForm((prev) => {
      // If selecting the student who is currently active or already in form, keep their typed values
      const isCurrentSotw = studentOfTheWeek.studentId === acc.id;
      const isCurrentForm = prev.studentId === acc.id;

      // Keep whatever track the admin has already set or chosen
      const track = isCurrentSotw
        ? studentOfTheWeek.track || prev.track || ""
        : prev.track || "";

      const performanceReview = isCurrentSotw
        ? studentOfTheWeek.performanceReview || ""
        : isCurrentForm
        ? prev.performanceReview || ""
        : "";

      const mentorQuote = isCurrentSotw
        ? studentOfTheWeek.mentorQuote || ""
        : isCurrentForm
        ? prev.mentorQuote || ""
        : "";

      return {
        ...prev,
        ...metrics,
        track,
        id: prev.id || studentOfTheWeek.id || "sotw_active",
        avatar: metrics.avatar || (isCurrentSotw ? studentOfTheWeek.avatar : "") || prev.avatar || "",
        performanceReview,
        mentorQuote,
      };
    });

    if (announce) {
      setMsg({
        type: "success",
        text: `Loaded real-time stats for ${formatAccountName(acc)} (${metrics.quizXP}, ${metrics.combatRank}). Set the course track and write your review below.`,
      });
    }
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
      studentName: formatStudentName(form.studentName),
      avatar: form.avatar ? normalizeImageUrl(form.avatar, DEFAULT_FALLBACK_IMAGES.avatar) : "",
      track: form.track?.trim() || "",
      weekPeriod: form.weekPeriod ?? "",
      winRate: form.winRate?.trim() || "0.0%",
      quizXP: form.quizXP?.trim() || "0 XP",
      combatRank: form.combatRank?.trim() || "Market Rookie (Tier 1)",
      weeklyReturn: form.weeklyReturn?.trim() ? formatReturn(form.weeklyReturn) : "+0.0%",
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
      subtitle="Nominate & publish the weekly student spotlight."
      action={
        <a
          href="/fun/student-of-the-week"
          target="_blank"
          rel="noreferrer"
          className="btn-outline-dark !py-2 inline-flex w-full sm:w-auto items-center justify-center gap-1.5 text-xs font-bold"
        >
          <Eye className="h-4 w-4" /> View Live Page
        </a>
      }
    >
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <form onSubmit={submit} className="space-y-4 sm:space-y-5">
            {msg && (
              <div
                className={`rounded-2xl p-4 text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
                  msg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>{msg.text}</span>
              </div>
            )}

            {/* 1. Student & Track */}
            <div className="rounded-2xl border border-line bg-white p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Trophy className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-ink">
                    Student & Track
                  </h2>
                  <p className="text-[11px] text-muted mt-0.5">
                    Pick a student to auto-load stats, or enter details manually.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1.5">
                  Registered Student
                </label>
                <select
                  value={form.studentId ?? ""}
                  onChange={(e) => handleSelectStudent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white shadow-2xs px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 cursor-pointer"
                >
                  <option value="">-- Choose student (loads real-time stats) --</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {formatAccountName(a)} ({a.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3.5 sm:gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.studentName ?? ""}
                    onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                    placeholder="e.g. Kelechi Okafor"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white placeholder:text-slate-400 shadow-2xs px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1.5">
                    Course / Track *
                  </label>
                  <input
                    type="text"
                    list="course-track-suggestions"
                    value={form.track ?? ""}
                    onChange={(e) => setForm({ ...form, track: e.target.value })}
                    placeholder="Type or pick track..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white placeholder:text-slate-400 shadow-2xs px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                  />
                  <datalist id="course-track-suggestions">
                    {allCourseOptions.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Quick Course Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-muted mr-0.5">Quick Pick:</span>
                {allCourseOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, track: c })}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition cursor-pointer ${
                      form.track === c
                        ? "bg-brand text-white border-brand font-bold shadow-xs"
                        : "bg-slate-50 text-ink/75 border-slate-200 hover:border-brand hover:text-brand"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1.5">
                  Week Period *
                </label>
                <input
                  type="text"
                  required
                  value={form.weekPeriod ?? ""}
                  onChange={(e) => setForm({ ...form, weekPeriod: e.target.value })}
                  placeholder="e.g. Week of Nov 09 – Nov 15, 2026"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white placeholder:text-slate-400 shadow-2xs px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                />
              </div>
            </div>

            {/* 2. Student Photo */}
            <div className="rounded-2xl border border-line bg-white p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <ImageIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-ink">
                    Student Photo
                  </h4>
                  <p className="text-[11px] text-muted mt-0.5">
                    Upload a portrait or paste an image link.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="relative group shrink-0 overflow-hidden rounded-xl border border-line bg-slate-50">
                  <img
                    src={normalizeImageUrl(form.avatar, DEFAULT_FALLBACK_IMAGES.avatar)}
                    onError={handleImageError(DEFAULT_FALLBACK_IMAGES.avatar)}
                    alt="Student photo preview"
                    className="h-40 w-full sm:h-24 sm:w-24 object-cover"
                  />
                  {form.avatar && !isUploading && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, avatar: "" })}
                      title="Clear photo"
                      className="absolute top-2 right-2 rounded-full bg-black/65 hover:bg-brand text-white p-1.5 backdrop-blur-xs transition cursor-pointer shadow-xs"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full min-w-0 space-y-2.5">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileRef.current?.click()}
                    className="w-full sm:w-auto rounded-xl border border-line bg-cream/60 hover:bg-cream px-4 py-2.5 text-xs font-bold text-ink transition inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 text-brand" />}
                    <span>{isUploading ? "Optimizing..." : "Upload Photo"}</span>
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageFile} className="hidden" />

                  <div className="relative">
                    <Link2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                    <input
                      type="text"
                      inputMode="url"
                      value={form.avatar ?? ""}
                      onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                      onBlur={() => {
                        if (form.avatar?.trim()) {
                          const norm = normalizeImageUrl(form.avatar.trim());
                          if (norm && norm !== form.avatar) setForm((p) => ({ ...p, avatar: norm }));
                        }
                      }}
                      placeholder="https://... or paste Google Drive / Dropbox link"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white placeholder:text-slate-400 shadow-2xs pl-9 pr-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Performance Metrics */}
            <div className="rounded-2xl border border-line bg-white p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-ink">
                    Performance Metrics
                  </h4>
                  <p className="text-[11px] text-muted mt-0.5">
                    Weekly stats displayed on the spotlight card.
                  </p>
                </div>
              </div>

              <div className="grid gap-3.5 sm:gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1.5">
                    Win Rate
                  </label>
                  <input
                    type="text"
                    value={form.winRate ?? ""}
                    onChange={(e) => setForm({ ...form, winRate: e.target.value })}
                    placeholder="e.g. 78.5%"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white placeholder:text-slate-400 shadow-2xs px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1.5">
                    Quiz XP
                  </label>
                  <input
                    type="text"
                    value={form.quizXP ?? ""}
                    onChange={(e) => setForm({ ...form, quizXP: e.target.value })}
                    placeholder="e.g. 1,200 XP"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white placeholder:text-slate-400 shadow-2xs px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1.5">
                    Combat Rank
                  </label>
                  <input
                    type="text"
                    value={form.combatRank ?? ""}
                    onChange={(e) => setForm({ ...form, combatRank: e.target.value })}
                    placeholder="e.g. Market Rookie (Tier 1)"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white placeholder:text-slate-400 shadow-2xs px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1.5">
                    Weekly Return
                  </label>
                  <input
                    type="text"
                    value={form.weeklyReturn ?? ""}
                    onChange={(e) => setForm({ ...form, weeklyReturn: e.target.value })}
                    placeholder="e.g. +28.4%"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white placeholder:text-slate-400 shadow-2xs px-3.5 py-2.5 text-sm font-medium text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
                  />
                </div>
              </div>
            </div>

            {/* 4. Mentor Review */}
            <div className="rounded-2xl border border-line bg-white p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-ink">
                    Mentor Review
                  </h4>
                  <p className="text-[11px] text-muted mt-0.5">
                    Evaluation writeup and recommendation quote.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1.5">
                  Performance Review *
                </label>
                <textarea
                  rows={4}
                  value={form.performanceReview ?? ""}
                  onChange={(e) => setForm({ ...form, performanceReview: e.target.value })}
                  placeholder="Write your evaluation of the student's execution, risk management, and discipline..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white placeholder:text-slate-400 shadow-2xs p-3.5 text-sm font-medium text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 leading-relaxed resize-y"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1.5">
                  Mentor Quote
                </label>
                <textarea
                  rows={3}
                  value={form.mentorQuote ?? ""}
                  onChange={(e) => setForm({ ...form, mentorQuote: e.target.value })}
                  placeholder="e.g. Great discipline during market noise with zero overleveraging."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white placeholder:text-slate-400 shadow-2xs p-3.5 text-sm font-medium text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 leading-relaxed resize-y"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="btn-primary w-full justify-center !py-3 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Publish Spotlight
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Website Preview */}
        <div className="lg:col-span-5">
          <Card className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-line">
              <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-brand shrink-0" /> Live Card Preview
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                Live Layout
              </span>
            </div>

            {/* Exact Website Card Preview */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121316] p-5 text-white shadow-xl">
              <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-slate-900 mb-4">
                <img
                  src={normalizeImageUrl(form.avatar, DEFAULT_FALLBACK_IMAGES.avatar)}
                  onError={handleImageError(DEFAULT_FALLBACK_IMAGES.avatar)}
                  alt={form.studentName || "Preview"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121316] via-transparent to-transparent" />

                <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-black uppercase text-slate-950 shadow-md">
                  <Star className="h-3 w-3 fill-slate-950" /> Weekly Champion
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{form.weekPeriod}</p>
                  <h3 className="text-lg font-black">{formatStudentName(form.studentName) || "Student Name"}</h3>
                  <p className="text-xs text-slate-300 font-medium">{form.track}</p>
                </div>
              </div>

              {/* Stats Grid matching website */}
              <div className="grid grid-cols-2 gap-2 text-center mb-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                  <div className="flex items-center justify-center gap-1 text-amber-400 text-[10px] font-bold uppercase mb-0.5">
                    <TrendingUp className="h-3 w-3" /> Win Rate
                  </div>
                  <span className="text-base font-black text-white">{form.winRate}</span>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                  <div className="flex items-center justify-center gap-1 text-emerald-400 text-[10px] font-bold uppercase mb-0.5">
                    <Flame className="h-3 w-3" /> Return
                  </div>
                  <span className="text-base font-black text-white">{formatReturn(form.weeklyReturn)}</span>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                  <div className="flex items-center justify-center gap-1 text-rose-400 text-[10px] font-bold uppercase mb-0.5">
                    <Zap className="h-3 w-3" /> Quiz XP
                  </div>
                  <span className="text-base font-black text-white">{form.quizXP}</span>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                  <div className="flex items-center justify-center gap-1 text-purple-400 text-[10px] font-bold uppercase mb-0.5">
                    <Trophy className="h-3 w-3" /> Rank
                  </div>
                  <span className="text-base font-black text-white">{formatTier(form.combatRank)}</span>
                </div>
              </div>

              {/* Mentor Evaluation matching website */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-100/90 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1 text-[11px]">
                  <ShieldCheck className="h-3.5 w-3.5" /> Mentor Evaluation
                </div>
                {form.performanceReview ? (
                  <p className="line-clamp-3">{form.performanceReview}</p>
                ) : (
                  <p className="italic text-amber-200/50">
                    Write your mentor performance evaluation on the left to preview it here.
                  </p>
                )}
              </div>

              {/* Mentor Quote preview */}
              {form.mentorQuote && (
                <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs italic text-slate-300">
                  <p>"{form.mentorQuote}"</p>
                  <p className="mt-1 text-[10px] font-semibold not-italic text-amber-400">— Mentor Recommendation</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
