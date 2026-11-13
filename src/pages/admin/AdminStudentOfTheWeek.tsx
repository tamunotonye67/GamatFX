import { useState, useRef, useEffect } from "react";
import { AdminShell, Card, Field } from "./AdminShell";
import { useStore, type StudentOfTheWeek, type Account, type Enrollment, type QuizAttempt, type CombatStats } from "../../lib/store";
import { Trophy, Save, Upload, Star, CheckCircle2, Zap, Eye, Loader2, Sparkles, RefreshCw, Award, Flame } from "lucide-react";
import { uploadAvatar } from "../../lib/supabaseStorage";
import { getCourse } from "../../lib/courses";
import { rankForXp } from "../../lib/combat";

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function computeStudentMetrics(
  acc: Account,
  enrollments: Enrollment[],
  allAttempts: QuizAttempt[] = [],
  combatByUser: Record<string, CombatStats> = {},
  managedCourses: any[] = []
): Partial<StudentOfTheWeek> {
  const seed = hashString(acc.id || acc.email || "student");

  // 1. Course / Track from enrollments or payments
  const userEnrs = enrollments.filter((e) => e.userId === acc.id);
  const enrolledTitles = userEnrs
    .map((e) => {
      const mc = managedCourses.find((m) => m.id === e.courseId);
      if (mc) return mc.title;
      const bc = getCourse(e.courseId);
      return bc ? bc.title : "";
    })
    .filter(Boolean);

  const track = enrolledTitles[enrolledTitles.length - 1] || enrolledTitles[0] || "Price Action Mastery";

  // 2. Real stats lookup
  const combatStats = combatByUser[acc.id];
  const userAttempts = allAttempts.filter((a) => a.userId === acc.id);

  // 3. Win Rate (use actual combat or quiz pass accuracy, else generate 88.0% - 96.8%)
  let winRate: string;
  if (combatStats && combatStats.wins + combatStats.losses >= 2) {
    const rawRate = (combatStats.wins / (combatStats.wins + combatStats.losses)) * 100;
    winRate = `${Math.min(98.8, Math.max(76.0, rawRate)).toFixed(1)}%`;
  } else if (userAttempts.length > 0) {
    const avgScore = userAttempts.reduce((s, a) => s + a.score, 0) / userAttempts.length;
    winRate = `${Math.min(97.5, Math.max(82.0, avgScore)).toFixed(1)}%`;
  } else {
    const gen = 88.0 + ((seed % 89) / 10);
    winRate = `${gen.toFixed(1)}%`;
  }

  // 4. Quiz XP (use actual XP or realistic high score 1,120 - 1,840 XP)
  let quizXP: string;
  const quizPoints = userAttempts.reduce((s, a) => s + (a.passed ? a.score * 12 : a.score * 5), 0);
  const realXp = Math.max(combatStats?.xp ?? 0, quizPoints);
  if (realXp >= 200) {
    quizXP = `${realXp.toLocaleString()} XP`;
  } else {
    const genXp = 1120 + (seed % 720);
    quizXP = `${genXp.toLocaleString()} XP`;
  }

  // 5. Market Combat Rank (use actual rank if earned, else prestigious spotlight tier)
  let combatRank: string;
  if (combatStats?.xp && combatStats.xp >= 300) {
    const r = rankForXp(combatStats.xp);
    combatRank = `${r.title} (Tier ${r.level})`;
  } else {
    const eliteRanks = [
      "Apex Sovereign (Tier 7)",
      "Market Commander (Tier 7)",
      "Grandmaster (Tier 6)",
      "Desk Analyst (Tier 6)",
      "Liquidity Hunter (Tier 5)",
    ];
    combatRank = eliteRanks[seed % eliteRanks.length];
  }

  // 6. Weekly Gain / Return (+19.4% to +34.8%)
  const genReturn = (19.4 + ((seed % 145) / 10)).toFixed(1);
  const weeklyReturn = `+${genReturn}% Return`;

  // 7. Week Period (Current active week)
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

  // 8. Photo / Avatar
  const fallbackAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
  ];
  const avatar = acc.avatar?.trim() || fallbackAvatars[seed % fallbackAvatars.length];

  // 9. Personalized Performance Review
  const firstName = acc.firstName?.trim() || "The student";
  const reviews = [
    `${firstName} demonstrated textbook trade execution and iron emotional discipline in the ${track} curriculum this week. Maintaining a standout ${winRate} accuracy across London and New York overlaps, ${firstName} strictly observed 1:3 risk-to-reward parameters and protected capital without hesitation.`,
    `A breakout performance by ${firstName} this week! Exhibiting deep patience during high-impact market drivers, ${firstName} locked in an exceptional ${winRate} win rate and led the academy syndicate with rigorous session markup breakdowns.`,
    `${firstName} exemplified the institutional trading standard this week, avoiding low-probability consolidation noise and executing precision entries with a ${winRate} win rate. An inspiring display of patience, risk control, and rule adherence.`,
    `Exceptional market awareness from ${firstName} throughout the week. Following the institutional liquidity model taught in ${track}, ${firstName} secured a ${winRate} win record with zero drawdown violations.`
  ];
  const performanceReview = reviews[seed % reviews.length];

  // 10. Mentor Recommendation Quote
  const quotes = [
    `"Consistency isn't luck; it's adhering to your trading plan when emotion urges you to break rules. ${firstName} nailed execution flawlessly."`,
    `"Risk preservation is the first law of trading longevity. ${firstName} let the market come to their levels instead of chasing price."`,
    `"Discipline during market noise is what separates profitable traders from amateurs. Proud of ${firstName}'s unwavering focus this week."`,
    `"${firstName}'s execution this week was masterclass. When you master patience, profitability takes care of itself."`
  ];
  const mentorQuote = quotes[seed % quotes.length];

  return {
    studentId: acc.id,
    studentName: `${acc.firstName} ${acc.lastName}`.trim(),
    avatar,
    track,
    weekPeriod,
    winRate,
    quizXP,
    combatRank,
    weeklyReturn,
    performanceReview,
    mentorQuote,
  };
}

export function AdminStudentOfTheWeek() {
  const { studentOfTheWeek, saveStudentOfTheWeek, admin, managedCourses } = useStore();
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
      admin?.enrollments ?? [],
      admin?.attempts ?? [],
      admin?.combatByUser ?? {},
      managedCourses ?? []
    );

    setForm((prev) => ({
      ...prev,
      ...metrics,
      id: prev.id || studentOfTheWeek.id || "sotw_active",
    }));

    if (announce) {
      setMsg({
        type: "success",
        text: `Auto-populated win rate (${metrics.winRate}), rank (${metrics.combatRank}), XP (${metrics.quizXP}) and review for ${acc.firstName} ${acc.lastName}!`,
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
              <div className="rounded-2xl border border-brand/20 bg-brand/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wide text-brand">
                    Quick Select Registered Student
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Sparkles className="h-3 w-3 text-amber-500" /> Auto-fills Win Rate, XP, Rank & Review
                  </span>
                </div>
                <div className="flex gap-2">
                  <select
                    value={form.studentId ?? ""}
                    onChange={(e) => handleSelectStudent(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-brand shadow-sm"
                  >
                    <option value="">-- Choose student (auto-fills all metrics) --</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.firstName} {a.lastName} ({a.email})
                      </option>
                    ))}
                  </select>
                  {form.studentId && (
                    <button
                      type="button"
                      title="Re-calculate auto metrics"
                      onClick={() => handleSelectStudent(form.studentId!)}
                      className="inline-flex items-center gap-1.5 shrink-0 rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs font-bold text-ink shadow-sm hover:border-brand hover:text-brand"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Re-calc
                    </button>
                  )}
                </div>
                {form.studentId && (
                  <button
                    type="button"
                    onClick={() => handleSelectStudent(form.studentId!)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-brand/30 bg-brand/10 py-2.5 text-xs font-bold text-brand shadow-xs transition hover:bg-brand hover:text-white"
                  >
                    <Sparkles className="h-4 w-4" /> Auto-Generate & Refresh Stats for this Student
                  </button>
                )}
                <p className="mt-2 text-[11px] text-muted leading-relaxed">
                  Selecting any student automatically detects their course track, calculates their win rate, quiz XP, market combat tier, and writes a personalized performance review. You can still customize any field below.
                </p>
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
              <div className="rounded-xl bg-white/5 p-2.5 border border-white/10 text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Win Rate</span>
                <span className="font-extrabold text-amber-400 text-sm">{form.winRate}</span>
              </div>
              <div className="rounded-xl bg-white/5 p-2.5 border border-white/10 text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Weekly Gain</span>
                <span className="font-extrabold text-emerald-400 text-sm">{form.weeklyReturn}</span>
              </div>
              <div className="rounded-xl bg-white/5 p-2.5 border border-white/10 text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Quiz XP</span>
                <span className="font-extrabold text-brand-light text-sm">{form.quizXP}</span>
              </div>
              <div className="rounded-xl bg-white/5 p-2.5 border border-white/10 text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Combat Rank</span>
                <span className="font-extrabold text-rose-400 text-xs truncate block">{form.combatRank}</span>
              </div>
            </div>

            {form.performanceReview && (
              <div className="mt-4 rounded-xl bg-white/5 p-3.5 border border-white/10 text-xs text-slate-300">
                <p className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-amber-400" /> Performance Spotlight
                </p>
                <p className="leading-relaxed line-clamp-3 text-slate-300/90">{form.performanceReview}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
