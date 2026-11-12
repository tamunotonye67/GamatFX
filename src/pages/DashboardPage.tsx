import { useState, useEffect, useRef } from "react";
import { useStore } from "../lib/store";
import { downloadCertificate, certificatePreview, type CertData } from "../lib/certificate";
import { COURSES, getCourse, totalLessons, naira, compactNaira } from "../lib/courses";
import { navigate } from "../lib/router";
import {
  LayoutDashboard, BookOpen, Award, User as UserIcon, CalendarDays,
  PlayCircle, ArrowUpRight, Clock, CheckCircle2, Lock, LogOut, Save, Download,
  Receipt, ShieldCheck, Loader2, Eye, Camera, Trash2, Cake, EyeOff, AlertCircle,
  ListChecks, PenSquare, Plus, Send, FileText, Users, Share2, Wallet, MousePointerClick,
  TrendingUp, History, Copy, Building2, CreditCard, ArrowRight, Check,
} from "lucide-react";
import { getQuiz } from "../lib/quizzes";
import RichTextEditor from "../components/RichTextEditor";
import { CONTACT } from "../lib/contact";
import { rankForXp, progressToNext, nextRank } from "../lib/combat";
import { uploadAvatar } from "../lib/supabaseStorage";
import AffiliateCard from "../components/AffiliateCard";
import { getSignupReferralUrl } from "../lib/affiliate";

type Tab = "overview" | "courses" | "certificates" | "affiliate" | "wallet" | "events" | "billing" | "posts" | "team-bio" | "profile";

const baseTabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "courses", label: "My Courses", icon: BookOpen },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "affiliate", label: "Invite & Earn", icon: Share2 },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "billing", label: "Billing", icon: Receipt },
  { id: "events", label: "My Events", icon: CalendarDays },
  { id: "profile", label: "Profile", icon: UserIcon },
];

const NIGERIAN_BANKS = [
  "Access Bank",
  "Citibank Nigeria",
  "Ecobank Nigeria",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "First City Monument Bank (FCMB)",
  "Globus Bank",
  "Guaranty Trust Bank (GTBank)",
  "Heritage Bank",
  "Jaiz Bank",
  "Keystone Bank",
  "Kuda Bank",
  "Lotus Bank",
  "Moniepoint MFB",
  "OPay",
  "Palmpay",
  "Parallex Bank",
  "Polaris Bank",
  "PremiumTrust Bank",
  "Providus Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank",
  "Sterling Bank",
  "SunTrust Bank",
  "TAJBank",
  "Titan Trust Bank",
  "Union Bank of Nigeria",
  "United Bank for Africa (UBA)",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank",
  "Other Bank",
];

const CATEGORIES = ["Fundamentals", "Technical", "Psychology", "Risk", "News"];

export default function DashboardPage() {
  const store = useStore();
  const { user, isAuthed, enrollments, myRegistrations, myPayments, stats, progressOf, logout, isAdmin, combat } = store;
  const combatRank = rankForXp(combat.xp);
  const combatNext = nextRank(combat.xp);
  const combatPct = progressToNext(combat.xp);
  const [tab, setTabState] = useState<Tab>(() => {
    try {
      const saved = sessionStorage.getItem("gamat_fx_dashboard_tab") || localStorage.getItem("gamat_fx_dashboard_tab");
      if (saved && ["overview", "courses", "certificates", "affiliate", "wallet", "billing", "events", "posts", "team-bio", "profile"].includes(saved)) {
        return saved as Tab;
      }
    } catch {}
    return "overview";
  });

  const setTab = (nextTab: Tab) => {
    setTabState(nextTab);
    try {
      sessionStorage.setItem("gamat_fx_dashboard_tab", nextTab);
      localStorage.setItem("gamat_fx_dashboard_tab", nextTab);
    } catch {}
  };

  if (!isAuthed || !user) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
        <Lock className="h-14 w-14 text-brand" />
        <h1 className="mt-6 font-display text-3xl font-extrabold text-ink">Sign in to view your dashboard</h1>
        <p className="mt-3 max-w-sm text-muted">Track your courses, progress and certificates in one place.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => navigate("/login")} className="btn-primary">Log In</button>
          <button onClick={() => navigate("/signup")} className="btn-outline-dark">Create Account</button>
        </div>
      </section>
    );
  }

  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

  // Writers get articles; staff/admin also get a team-bio submission tab.
  const isTeamMember = user.role === "staff" || user.role === "admin";
  let tabs = [...baseTabs];
  if (store.can("posts:write")) {
    const profileIdx = tabs.findIndex((t) => t.id === "profile");
    tabs = [...tabs.slice(0, profileIdx), { id: "posts" as Tab, label: "My Articles", icon: PenSquare }, ...tabs.slice(profileIdx)];
  }
  if (isTeamMember) {
    const profileIdx = tabs.findIndex((t) => t.id === "profile");
    tabs = [
      ...tabs.slice(0, profileIdx),
      { id: "team-bio" as Tab, label: "Team Bio", icon: Users },
      ...tabs.slice(profileIdx),
    ];
  }
  // A student qualifies for a certificate when they pass the official assessment
  // (available to both physical office students and online students) or complete coursework.
  const certified = enrollments.filter((e) => store.hasPassedQuiz(e.courseId));
  const awaitingQuiz = enrollments.filter((e) => !store.hasPassedQuiz(e.courseId));

  return (
    <div className="min-h-screen bg-cream pt-[var(--header-h,72px)]">
      {/* Header */}
      <section className="bg-ink pb-20 pt-8 sm:pb-24 sm:pt-12 text-white">
        <div className="container-x flex flex-wrap items-center justify-between gap-5 sm:gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-2xl object-cover shadow-lg ring-2 ring-brand/40" />
            ) : (
              <span className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark font-display text-lg sm:text-xl font-extrabold shadow-lg">
                {initials}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-white/55">Welcome back,</p>
              <h1 className="truncate font-display text-xl sm:text-2xl font-extrabold md:text-3xl">
                {user.nickname || `${user.firstName} ${user.lastName}`}
              </h1>
              <p className="mt-0.5 truncate text-xs sm:text-sm text-white/50">{user.email}</p>
              {user.birthday && (
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-white/45">
                  <Cake className="h-3.5 w-3.5 text-brand" />
                  {new Date(user.birthday).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px]">year private</span>
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold text-white"
                  style={{ background: combatRank.color }}
                >
                  Lv.{combatRank.level} · {combatRank.title}
                </span>
                <span className="text-[11px] text-white/50">
                  {combat.xp} XP
                  {combatNext ? ` · ${combatNext.minXp - combat.xp} to next rank` : " · Max rank"}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-48 max-w-full overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full" style={{ width: `${combatPct}%`, background: combatRank.color }} />
              </div>
            </div>
          </div>
          <button onClick={() => navigate("/courses")} className="btn-primary w-full sm:w-auto">
            Browse Courses <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Stats */}
      <div className="container-x -mt-14 sm:-mt-16">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[
            { icon: BookOpen, v: stats.enrolled, l: "Courses enrolled" },
            { icon: CheckCircle2, v: stats.lessonsDone, l: "Lessons completed" },
            { icon: Clock, v: `${stats.hours}h`, l: "Learning time" },
            { icon: Award, v: stats.completed, l: "Certificates earned" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-line bg-white p-4 sm:p-6 shadow-[0_14px_45px_-25px_rgba(22,24,28,0.3)]">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-brand-light text-brand">
                <s.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <p className="mt-3 sm:mt-4 font-display text-2xl sm:text-3xl font-extrabold text-ink">{s.v}</p>
              <p className="mt-0.5 text-xs sm:text-sm text-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs + content */}
      <section className="container-x grid gap-6 sm:gap-8 py-8 sm:py-12 lg:grid-cols-[240px_1fr] items-start">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start z-10">
          <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-line bg-white p-2 lg:flex-col lg:items-stretch lg:space-y-1 lg:p-3 shadow-xs lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto no-scrollbar">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex shrink-0 items-center gap-2 lg:gap-3 lg:w-full rounded-xl px-3.5 py-2.5 lg:px-4 lg:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${tab === t.id ? "bg-brand text-white shadow-xs" : "text-ink/70 hover:bg-cream hover:text-brand"}`}>
                <t.icon className="h-4 w-4 shrink-0" /> {t.label}
              </button>
            ))}
            {isAdmin && (
              <button onClick={() => navigate("/admin")}
                className="flex shrink-0 items-center gap-2 lg:gap-3 lg:w-full rounded-xl bg-ink px-3.5 py-2.5 lg:px-4 lg:py-3 text-left text-xs sm:text-sm font-semibold text-white whitespace-nowrap transition hover:bg-ink/90 cursor-pointer">
                <ShieldCheck className="h-4 w-4 shrink-0 text-brand-light" /> Admin Panel
              </button>
            )}
            <button onClick={() => { logout(); navigate("/"); }}
              className="flex shrink-0 items-center gap-2 lg:gap-3 lg:w-full rounded-xl px-3.5 py-2.5 lg:px-4 lg:py-3 text-left text-xs sm:text-sm font-semibold text-muted whitespace-nowrap transition hover:bg-cream hover:text-brand cursor-pointer">
              <LogOut className="h-4 w-4 shrink-0" /> Log out
            </button>
          </div>
        </aside>

        <div className="min-w-0">
          {tab === "overview" && <Overview />}
          {tab === "courses" && <MyCourses />}
          {tab === "certificates" && <Certificates completed={certified.map((e) => e.courseId)} pending={awaitingQuiz.map((e) => e.courseId)} name={[user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ")} />}
          {tab === "affiliate" && <AffiliateSection />}
          {tab === "wallet" && <WalletSection />}
          {tab === "billing" && <BillingSection />}
          {tab === "events" && <MyEvents />}
          {tab === "posts" && <MyArticles />}
          {tab === "team-bio" && <TeamBioForm />}
          {tab === "profile" && <Profile />}
        </div>
      </section>
    </div>
  );

  /* ---------------------------- Tab panels ---------------------------- */

  function Overview() {
    const inProgress = enrollments.filter((e) => {
      const p = progressOf(e.courseId);
      return p > 0 && p < 100;
    });
    const next = inProgress[0] ?? enrollments[0];
    const nextCourse = next ? getCourse(next.courseId) : undefined;

    return (
      <div className="space-y-8">
        {nextCourse ? (
          <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_18px_50px_-30px_rgba(22,24,28,0.3)]">
            <div className="grid sm:grid-cols-[240px_1fr]">
              <img src={nextCourse.poster} alt="" className="h-48 sm:h-full min-h-[160px] w-full object-cover" />
              <div className="p-5 sm:p-7">
                <span className="chip">Continue learning</span>
                <h2 className="mt-3 font-display text-lg sm:text-xl font-bold text-ink">{nextCourse.title}</h2>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${progressOf(nextCourse.id)}%` }} />
                  </div>
                  <span className="text-sm font-bold text-brand">{progressOf(nextCourse.id)}%</span>
                </div>
                <button onClick={() => navigate(`/learn/${nextCourse.id}`)} className="btn-primary mt-5 w-full sm:w-auto">
                  <PlayCircle className="h-4 w-4" /> Resume Course
                </button>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState title="You haven't enrolled yet" body="Browse our catalogue and start your first course today." cta="Browse Courses" to="/courses" />
        )}

        <div>
          <h2 className="font-display text-xl font-bold text-ink">Recommended for you</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {COURSES.filter((c) => !store.isEnrolled(c.id)).slice(0, 4).map((c) => (
              <button key={c.id} onClick={() => navigate(`/courses/${c.id}`)} className="card text-left !p-5">
                <img src={c.poster} alt="" className="h-28 w-full rounded-xl object-cover" />
                <p className="mt-3 font-display text-sm font-bold text-ink">{c.title}</p>
                <p className="mt-1 text-xs text-muted">{c.level} · {totalLessons(c)} lessons</p>
                <p className="mt-2 font-display text-base font-extrabold text-brand">{naira(c.price)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function MyCourses() {
    if (!enrollments.length) {
      return <EmptyState title="No courses yet" body="When you enroll in a course it will appear here." cta="Browse Courses" to="/courses" />;
    }
    return (
      <div className="space-y-5">
        {enrollments.map((e) => {
          const c = getCourse(e.courseId);
          if (!c) return null;
          const p = progressOf(c.id);
          return (
            <div key={c.id} className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_14px_45px_-28px_rgba(22,24,28,0.3)]">
              <div className="grid sm:grid-cols-[200px_1fr]">
                <img src={c.poster} alt="" className="h-44 sm:h-full min-h-[140px] w-full object-cover" />
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="chip">{c.tag}</span>
                      <h3 className="mt-2 font-display text-lg font-bold text-ink">{c.title}</h3>
                      <p className="mt-1 text-xs text-muted">
                        {e.completedLessons.length} of {totalLessons(c)} lessons · enrolled {new Date(e.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                    {p === 100 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand">
                        <Award className="h-3.5 w-3.5" /> Complete
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${p}%` }} />
                    </div>
                    <span className="text-sm font-bold text-brand">{p}%</span>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button onClick={() => navigate(`/learn/${c.id}`)} className="btn-primary">
                      <PlayCircle className="h-4 w-4" /> {p > 0 ? "Continue" : "Start Course"}
                    </button>
                    <button onClick={() => navigate(`/courses/${c.id}`)} className="btn-outline-dark">Details</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function Certificates({ completed, pending, name }: { completed: string[]; pending: string[]; name: string }) {
    const PendingList = () => (
      <>
        {pending.map((id) => {
          const c = getCourse(id);
          const quiz = getQuiz(id);
          const best = store.bestAttempt(id);
          if (!c) return null;
          return (
            <div key={id} className="rounded-3xl border-2 border-dashed border-brand/40 bg-white p-5 sm:p-8">
              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                <span className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand">
                  <Lock className="h-6 w-6 sm:h-7 sm:w-7" />
                </span>
                <div className="min-w-[200px] flex-1">
                  <p className="font-display text-lg font-bold text-ink">{c.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    Pass the final assessment ({quiz?.passMark ?? 70}% required) to unlock your certificate (for both online and physical academy students).
                  </p>
                  {best && (
                    <p className="mt-1.5 text-xs font-semibold text-brand">
                      Best attempt: {best.score}% — {quiz ? Math.max(0, quiz.passMark - best.score) : 0}% short.
                    </p>
                  )}
                </div>
                <button onClick={() => navigate(`/quiz/${id}`)} className="btn-primary w-full sm:w-auto">
                  <ListChecks className="h-4 w-4" /> {best ? "Retake assessment" : "Take assessment"}
                </button>
              </div>
            </div>
          );
        })}
      </>
    );

    if (!completed.length && !pending.length) {
      return <EmptyState title="No certificates yet" body="Enroll in a course and pass the final assessment to earn your official certificate." cta="View My Courses" to="/dashboard" />;
    }
    return (
      <div className="space-y-8">
        <PendingList />
        {completed.map((id) => {
          const c = getCourse(id);
          if (!c) return null;
          const enr = enrollments.find((e) => e.courseId === id);
          const issued = new Date(enr?.enrolledAt ?? Date.now());
          const data = {
            name,
            course: c.title,
            date: issued.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
            serial: `GX-${id.slice(0, 4).toUpperCase()}-${(user!.id).slice(-5).toUpperCase()}`,
            hours: c.duration,
          };
          return <CertificateCard key={id} data={data} />;
        })}
      </div>
    );
  }

  function MyEvents() {
    if (!myRegistrations.length) {
      return <EmptyState title="No event registrations" body="Register for a mentorship intake or webinar to see it here." cta="View Events" to="/events" />;
    }
    return (
      <div className="space-y-4">
        {myRegistrations.map((r) => (
          <div key={r.id} className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
              <div className="min-w-0">
                <span className={`chip ${r.status === "cancelled" ? "!bg-line/60 !text-muted" : ""}`}>
                  {r.status === "confirmed" ? "Confirmed" : "Cancelled"}
                </span>
                <h3 className="mt-2 font-display text-base font-bold text-ink">{r.eventTitle}</h3>
                <p className="mt-1 text-xs text-muted">
                  {r.eventDate} · registered {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-dashed border-brand/40 bg-brand-light px-4 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-muted">Ticket</p>
                  <p className="font-display text-sm font-extrabold text-brand">{r.ticket}</p>
                </div>
                {r.status === "confirmed" && (
                  <button
                    onClick={() => { if (confirm("Cancel this registration? Your seat will be released.")) store.cancelRegistration(r.id); }}
                    className="btn-outline-dark !py-2.5">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function AffiliateSection() {
    const profile = store.myAffiliateProfile;
    if (!profile) return null;

    const commissionPercent = store.affiliateSettings?.defaultCommissionPercent || 15;
    const minPayout = store.affiliateSettings?.minimumPayoutAmount || 10000;
    const [copiedCode, setCopiedCode] = useState(false);

    const handleCopyCode = async () => {
      try {
        await navigator.clipboard.writeText(profile.referralCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } catch {}
    };

    return (
      <div className="space-y-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-ink">
              Invite & Earn Commissions
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted">
              Share your personal invite link or enrollment announcement card. Earn <strong>{commissionPercent}% commission</strong> when friends enroll in paid programs or store tools.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            title="Click to copy invite code"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink shadow-xs hover:border-brand/40 hover:bg-cream/40 transition cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Invite Code:</span>
            <code className="font-mono text-xs font-black text-brand select-all bg-cream/70 px-2 py-0.5 rounded-md border border-line/60">
              {profile.referralCode}
            </code>
            {copiedCode ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <Check className="h-3.5 w-3.5" />
                <span>Copied!</span>
              </span>
            ) : (
              <Copy className="h-3.5 w-3.5 text-muted hover:text-ink transition" />
            )}
          </button>
        </div>

        {/* Top Earnings & Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-bold uppercase tracking-wider">Available Balance</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-2 min-w-0">
              <span
                className="font-display text-2xl font-extrabold text-ink tabular-nums truncate"
                title={naira(profile.pendingBalance)}
              >
                {profile.pendingBalance >= 1_000_000 ? compactNaira(profile.pendingBalance) : naira(profile.pendingBalance)}
              </span>
              <button
                type="button"
                onClick={() => setTab("wallet")}
                disabled={profile.pendingBalance < minPayout}
                className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition disabled:opacity-40 cursor-pointer shrink-0"
              >
                Withdraw
              </button>
            </div>
            <p className="mt-1 text-xs text-muted">Min withdrawal: {naira(minPayout)}</p>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-bold uppercase tracking-wider">Total Earned</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Award className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 min-w-0">
              <span
                className="font-display text-2xl font-extrabold text-ink tabular-nums truncate block"
                title={naira(profile.totalEarned)}
              >
                {profile.totalEarned >= 1_000_000 ? compactNaira(profile.totalEarned) : naira(profile.totalEarned)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">{commissionPercent}% commission on all referred sales</p>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-bold uppercase tracking-wider">Referred Students</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-2xl font-extrabold text-ink">
                {profile.totalSignups}
              </span>
              <span className="text-xs font-semibold text-emerald-600">
                ({profile.totalConversions} paid)
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">Active accounts registered with your code</p>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-bold uppercase tracking-wider">Link Visits</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <MousePointerClick className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="font-display text-2xl font-extrabold text-ink">
                {profile.totalClicks}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">Traffic to your personal invite link</p>
          </div>
        </div>

        {/* Compute enrolled & paid courses for this student */}
        {(() => {
          const studentEnrolledCourses: { id: string; title: string; isPaid?: boolean; enrolledAt?: string }[] = [];

          // 1. From active enrollments
          enrollments.forEach((e) => {
            const course = getCourse(e.courseId);
            const title = course?.title || e.courseId;
            const isPaid =
              (course?.price ?? 0) > 0 ||
              myPayments.some((p) => p.courseId === e.courseId && p.status === "paid");
            if (!studentEnrolledCourses.some((item) => item.title.toLowerCase() === title.toLowerCase())) {
              studentEnrolledCourses.push({
                id: e.courseId,
                title,
                isPaid,
                enrolledAt: e.enrolledAt,
              });
            }
          });

          // 2. From confirmed payments
          myPayments
            .filter((p) => p.status === "paid")
            .forEach((p) => {
              const course = getCourse(p.courseId);
              const title =
                course?.title ||
                (p.courseId.startsWith("store-")
                  ? p.courseId.replace("store-", "").replace(/-/g, " ").toUpperCase()
                  : p.courseId);
              if (!studentEnrolledCourses.some((item) => item.title.toLowerCase() === title.toLowerCase())) {
                studentEnrolledCourses.push({
                  id: p.courseId,
                  title,
                  isPaid: true,
                  enrolledAt: p.createdAt,
                });
              }
            });

          return (
            <AffiliateCard
              profile={profile}
              avatarUrl={user.avatar}
              enrolledCourses={studentEnrolledCourses}
              availableCourses={COURSES.map((c) => ({ id: c.id, title: c.title, price: c.price }))}
              commissionPercent={commissionPercent}
              minimumPayoutAmount={minPayout}
              onUpdateQuote={(quote) => store.updateMyAffiliateProfile({ personalQuote: quote })}
              onUpdateCourseTitle={(title) => store.updateMyAffiliateProfile({ enrolledCourseTitle: title })}
              onUpdateDisplayName={(name) => store.updateMyAffiliateProfile({ cardDisplayName: name })}
            />
          );
        })()}

        {/* Link to Student Wallet */}
        <div className="pt-2">
          <div className="rounded-2xl border border-line bg-white p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0 mt-0.5 shadow-xs border border-emerald-100/60">
                <Wallet className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-display text-sm sm:text-base font-bold text-ink leading-snug">
                  Commission Ledger &amp; Preferred Payout Method
                </h4>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  Track your referral sales, monitor withdrawal payouts, and set your default bank or USDT account in your Wallet.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTab("wallet")}
              className="px-4 py-2.5 rounded-xl bg-ink text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer shrink-0 inline-flex items-center justify-center gap-1.5 w-full sm:w-auto shadow-xs"
            >
              <span>Open Student Wallet</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------- Student Wallet Hub ---------------------------- */

  function WalletSection() {
    const profile = store.myAffiliateProfile;
    const commissions = store.affiliateCommissions.filter(
      (c) => c.affiliateUserId === user.id || (profile && c.affiliateCode === profile.referralCode)
    );
    const myPayouts = store.payoutRequests.filter((p) => p.affiliateUserId === user.id);
    const minPayout = store.affiliateSettings?.minimumPayoutAmount || 10000;
    const commissionPercent = store.affiliateSettings?.defaultCommissionPercent || 15;

    // Withdrawal modal state
    const [payoutModalOpen, setPayoutModalOpen] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState(
      profile && profile.pendingBalance >= minPayout ? profile.pendingBalance : minPayout
    );
    const [payoutMethod, setPayoutMethod] = useState<"bank" | "usdt" | "paypal">(profile?.payoutMethod || "bank");
    const [payoutDetails, setPayoutDetails] = useState(profile?.payoutDetails || "");
    const [payoutError, setPayoutError] = useState<string | null>(null);
    const [payoutSuccess, setPayoutSuccess] = useState(false);

    // Preferred payout method configuration state
    const [isEditingMethod, setIsEditingMethod] = useState(!profile?.payoutDetails);
    const [prefMethod, setPrefMethod] = useState<"bank" | "usdt" | "paypal">(profile?.payoutMethod || "bank");
    const [bankName, setBankName] = useState("");
    const [customBankName, setCustomBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState(
      [user.firstName, user.lastName].filter(Boolean).join(" ")
    );
    const [usdtAddress, setUsdtAddress] = useState("");
    const [paypalEmail, setPaypalEmail] = useState(user.email || "");
    const [savedNotice, setSavedNotice] = useState(false);

    // Sync from profile on mount/change
    useEffect(() => {
      if (profile?.payoutMethod) {
        setPrefMethod(profile.payoutMethod);
        setPayoutMethod(profile.payoutMethod);
      }
      if (profile?.payoutDetails) {
        setPayoutDetails(profile.payoutDetails);
        if (profile.payoutMethod === "usdt") {
          setUsdtAddress(profile.payoutDetails.replace(/^TRC20:\s*/i, ""));
        } else if (profile.payoutMethod === "paypal") {
          setPaypalEmail(profile.payoutDetails.replace(/^PayPal:\s*/i, ""));
        } else if (profile.payoutMethod === "bank") {
          const parts = profile.payoutDetails.split(/[•-]/).map((s) => s.trim());
          if (parts[0]) {
            if (NIGERIAN_BANKS.includes(parts[0])) {
              setBankName(parts[0]);
            } else {
              setBankName("Other Bank");
              setCustomBankName(parts[0]);
            }
          }
          if (parts[1]) {
            const accNum = parts[1].split(" ")[0];
            setAccountNumber(accNum);
          }
        }
      }
    }, [profile]);

    const handleSavePreferredMethod = (e: React.FormEvent) => {
      e.preventDefault();
      let formatted = "";
      if (prefMethod === "bank") {
        const resolvedBank = bankName === "Other Bank" ? customBankName.trim() : bankName.trim();
        if (!resolvedBank || !accountNumber.trim() || !accountName.trim()) return;
        formatted = `${resolvedBank} • ${accountNumber.trim()} (${accountName.trim()})`;
      } else if (prefMethod === "usdt") {
        if (!usdtAddress.trim()) return;
        formatted = `TRC20: ${usdtAddress.trim()}`;
      } else if (prefMethod === "paypal") {
        if (!paypalEmail.trim()) return;
        formatted = `PayPal: ${paypalEmail.trim()}`;
      }

      store.updateMyAffiliateProfile({
        payoutMethod: prefMethod,
        payoutDetails: formatted,
      });
      setPayoutMethod(prefMethod);
      setPayoutDetails(formatted);
      setIsEditingMethod(false);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    };

    const handleRequestPayout = (e: React.FormEvent) => {
      e.preventDefault();
      setPayoutError(null);
      const res = store.requestPayout(Number(payoutAmount), payoutMethod, payoutDetails);
      if (!res.ok) {
        setPayoutError(res.error || "Unable to submit withdrawal request.");
        return;
      }
      setPayoutSuccess(true);
      setTimeout(() => {
        setPayoutSuccess(false);
        setPayoutModalOpen(false);
      }, 2000);
    };

    const hasSavedMethod = Boolean(profile?.payoutDetails);

    return (
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-ink">
              Student Wallet &amp; Payouts
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted">
              Manage your commission earnings, configure your default payout account, and monitor payment records.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setTab("affiliate")}
              className="px-3.5 py-2 rounded-xl border border-line bg-white text-xs font-bold text-ink hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Share2 className="h-3.5 w-3.5 text-brand" />
              <span>Invite &amp; Earn</span>
            </button>
          </div>
        </div>

        {/* 3 Top Financial Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Available Commission Balance */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-bold uppercase tracking-wider">Available Balance</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-2 min-w-0">
              <span
                className="font-display text-2xl font-extrabold text-ink tabular-nums truncate"
                title={naira(profile?.pendingBalance || 0)}
              >
                {(profile?.pendingBalance || 0) >= 1_000_000
                  ? compactNaira(profile?.pendingBalance || 0)
                  : naira(profile?.pendingBalance || 0)}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (!hasSavedMethod) {
                    setIsEditingMethod(true);
                  }
                  setPayoutAmount(profile && profile.pendingBalance >= minPayout ? profile.pendingBalance : minPayout);
                  setPayoutModalOpen(true);
                }}
                disabled={(profile?.pendingBalance || 0) < minPayout}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition disabled:opacity-40 cursor-pointer shrink-0"
              >
                Withdraw
              </button>
            </div>
            <p className="mt-1 text-xs text-muted">
              {(profile?.pendingBalance || 0) < minPayout
                ? `Requires minimum ${naira(minPayout)} balance to withdraw`
                : `Ready to disburse to your preferred account`}
            </p>
          </div>

          {/* Total Paid Out */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-bold uppercase tracking-wider">Total Disbursed</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 min-w-0">
              <span className="font-display text-2xl font-extrabold text-ink tabular-nums truncate block">
                {naira(profile?.paidOut || 0)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">Paid to your bank or crypto account</p>
          </div>

          {/* Total Earned */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted">
              <span className="text-xs font-bold uppercase tracking-wider">Total Earned</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 min-w-0">
              <span className="font-display text-2xl font-extrabold text-ink tabular-nums truncate block">
                {naira(profile?.totalEarned || 0)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">{commissionPercent}% commission on referred enrollments</p>
          </div>
        </div>

        {/* Preferred Payment Method Card */}
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <h3 className="font-display text-base sm:text-lg font-extrabold text-ink">
                Preferred Payout Destination
              </h3>
              <p className="mt-0.5 text-xs text-muted">
                Your default disbursement account for affiliate commission withdrawals.
              </p>
            </div>

            {!isEditingMethod && hasSavedMethod && (
              <button
                type="button"
                onClick={() => setIsEditingMethod(true)}
                className="btn-outline-dark !py-1.5 !px-3.5 !text-xs self-start sm:self-auto cursor-pointer"
              >
                Change Method
              </button>
            )}
          </div>

          {savedNotice && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Preferred payout method saved successfully! Future withdrawals will disburse here automatically.</span>
            </div>
          )}

          {!isEditingMethod && hasSavedMethod ? (
            <div className="rounded-xl border border-line bg-cream/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-line shadow-xs shrink-0">
                  {profile?.payoutMethod === "bank" ? (
                    <Building2 className="h-5 w-5 text-brand" />
                  ) : profile?.payoutMethod === "usdt" ? (
                    <Wallet className="h-5 w-5 text-brand" />
                  ) : (
                    <CreditCard className="h-5 w-5 text-brand" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-ink">
                      {profile?.payoutDetails}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active Default
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    Disbursement Method: <span className="font-semibold text-ink">{profile?.payoutMethod === "bank" ? "Nigerian Bank Transfer" : profile?.payoutMethod === "usdt" ? "USDT (TRC-20)" : "PayPal"}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingMethod(true)}
                className="btn-outline-dark !py-2 !px-4 !text-xs self-start sm:self-auto cursor-pointer"
              >
                Edit Details
              </button>
            </div>
          ) : (
            <form onSubmit={handleSavePreferredMethod} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-ink">
                  Choose Disbursement Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPrefMethod("bank")}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-3 ${
                      prefMethod === "bank"
                        ? "border-brand bg-brand/5 text-ink ring-1 ring-brand/30 shadow-xs"
                        : "border-line bg-cream/40 text-muted hover:text-ink hover:bg-cream"
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${prefMethod === "bank" ? "bg-brand text-white" : "bg-white border border-line text-muted"}`}>
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs">Nigerian Bank</p>
                      <p className="text-[10px] text-muted">Direct transfer in ₦ (NGN)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrefMethod("usdt")}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-3 ${
                      prefMethod === "usdt"
                        ? "border-brand bg-brand/5 text-ink ring-1 ring-brand/30 shadow-xs"
                        : "border-line bg-cream/40 text-muted hover:text-ink hover:bg-cream"
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${prefMethod === "usdt" ? "bg-brand text-white" : "bg-white border border-line text-muted"}`}>
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs">USDT (TRC-20)</p>
                      <p className="text-[10px] text-muted">Crypto wallet address</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrefMethod("paypal")}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-3 ${
                      prefMethod === "paypal"
                        ? "border-brand bg-brand/5 text-ink ring-1 ring-brand/30 shadow-xs"
                        : "border-line bg-cream/40 text-muted hover:text-ink hover:bg-cream"
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${prefMethod === "paypal" ? "bg-brand text-white" : "bg-white border border-line text-muted"}`}>
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs">PayPal</p>
                      <p className="text-[10px] text-muted">International email payout</p>
                    </div>
                  </button>
                </div>
              </div>

              {prefMethod === "bank" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1.5">Bank Name</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full rounded-xl border border-line bg-cream/50 px-3 py-2.5 text-xs font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none transition cursor-pointer"
                      required
                    >
                      <option value="">Select your bank</option>
                      {NIGERIAN_BANKS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    {bankName === "Other Bank" && (
                      <input
                        type="text"
                        placeholder="Enter bank name"
                        value={customBankName}
                        onChange={(e) => setCustomBankName(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-line bg-cream/50 px-3 py-2 text-xs font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none transition"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1.5">Account Number</label>
                    <input
                      type="text"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      placeholder="10-digit NUBAN"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-xl border border-line bg-cream/50 px-3 py-2.5 text-xs font-mono font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1.5">Account Name</label>
                    <input
                      type="text"
                      placeholder="Beneficiary full name"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full rounded-xl border border-line bg-cream/50 px-3 py-2.5 text-xs font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none transition"
                      required
                    />
                  </div>
                </div>
              )}

              {prefMethod === "usdt" && (
                <div className="pt-1 space-y-1.5">
                  <label className="block text-xs font-bold text-ink">USDT TRC-20 Wallet Address</label>
                  <input
                    type="text"
                    placeholder="e.g. TYDzsYBPjxNYt8CqCXp... (TRON TRC-20 network only)"
                    value={usdtAddress}
                    onChange={(e) => setUsdtAddress(e.target.value)}
                    className="w-full rounded-xl border border-line bg-cream/50 px-3.5 py-2.5 text-xs font-mono font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none transition"
                    required
                  />
                  <p className="text-[11px] text-muted">Please ensure your address accepts incoming transfers on the TRON (TRC-20) network.</p>
                </div>
              )}

              {prefMethod === "paypal" && (
                <div className="pt-1 space-y-1.5">
                  <label className="block text-xs font-bold text-ink">PayPal Email Address</label>
                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    className="w-full rounded-xl border border-line bg-cream/50 px-3.5 py-2.5 text-xs font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none transition"
                    required
                  />
                  <p className="text-[11px] text-muted">Disbursements will be routed to your active PayPal email address.</p>
                </div>
              )}

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="submit"
                  className="btn-primary !py-2.5 !px-5 !text-xs cursor-pointer shadow-sm"
                >
                  Save Preferred Method
                </button>
                {hasSavedMethod && (
                  <button
                    type="button"
                    onClick={() => setIsEditingMethod(false)}
                    className="btn-outline-dark !py-2.5 !px-4 !text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Activity & Payout History */}
        <div className="space-y-4">
          <div>
            <h3 className="font-display text-lg font-bold text-ink">
              Activity &amp; Payout History
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              Track student commissions earned through your referral code and monitor your withdrawal requests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Referral Commissions Card */}
            <div className="rounded-3xl border border-line bg-white p-6 shadow-sm flex flex-col justify-between min-h-[260px]">
              <div>
                <div className="flex items-center justify-between border-b border-line pb-4 mb-2">
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="h-5 w-5 text-brand" />
                    <div>
                      <h4 className="font-display text-base font-bold text-ink leading-tight">
                        Referral Commissions
                      </h4>
                      <p className="text-[11px] text-muted">{commissionPercent}% on all student enrollments</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-muted bg-cream px-3 py-1 rounded-full border border-line">
                    {commissions.length} {commissions.length === 1 ? "Sale" : "Sales"}
                  </span>
                </div>

                {commissions.length === 0 ? (
                  <div className="py-10 text-center">
                    <Users className="mx-auto h-10 w-10 text-muted/30" />
                    <p className="mt-3 font-semibold text-ink text-sm">No referral commissions yet</p>
                    <p className="mt-1 text-xs text-muted max-w-xs mx-auto leading-relaxed">
                      Share your card or invite link to earn {commissionPercent}% cash commission whenever anyone enrolls.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-line pt-1 max-h-72 overflow-y-auto pr-1">
                    {commissions.map((c) => (
                      <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-ink">{c.orderTitle}</p>
                          <p className="text-[11px] text-muted">
                            Referred: {c.customerName} • {new Date(c.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-display font-extrabold text-emerald-600">+{naira(c.commissionAmount)}</p>
                          <span className="text-[10px] uppercase font-bold text-muted">{c.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Withdrawal History Card */}
            <div className="rounded-3xl border border-line bg-white p-6 shadow-sm flex flex-col justify-between min-h-[260px]">
              <div>
                <div className="flex items-center justify-between border-b border-line pb-4 mb-2">
                  <div className="flex items-center gap-2.5">
                    <History className="h-5 w-5 text-brand" />
                    <div>
                      <h4 className="font-display text-base font-bold text-ink leading-tight">
                        Withdrawal History
                      </h4>
                      <p className="text-[11px] text-muted">Bank, USDT, or PayPal payouts</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-muted bg-cream px-3 py-1 rounded-full border border-line">
                    {myPayouts.length} {myPayouts.length === 1 ? "Payout" : "Payouts"}
                  </span>
                </div>

                {myPayouts.length === 0 ? (
                  <div className="py-10 text-center">
                    <Wallet className="mx-auto h-10 w-10 text-muted/30" />
                    <p className="mt-3 font-semibold text-ink text-sm">No withdrawals requested yet</p>
                    <p className="mt-1 text-xs text-muted max-w-xs mx-auto leading-relaxed">
                      You can request a withdrawal once your commission balance reaches {naira(minPayout)}.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-line pt-1 max-h-72 overflow-y-auto pr-1">
                    {myPayouts.map((p) => (
                      <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-ink">{naira(p.amount)}</p>
                          <p className="text-[11px] text-muted capitalize">
                            {p.method} • {new Date(p.requestedAt).toLocaleDateString()}
                          </p>
                          {p.adminNote && <p className="text-[10px] text-emerald-600 font-medium mt-0.5">{p.adminNote}</p>}
                        </div>
                        <div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              p.status === "paid"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : p.status === "pending"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course Invoices & Billing Shortcut */}
        <div className="rounded-2xl border border-line bg-cream/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-line text-ink shrink-0">
              <Receipt className="h-4 w-4 text-brand" />
            </div>
            <div>
              <p className="font-bold text-ink text-sm">Course Purchase Receipts &amp; Invoices</p>
              <p className="text-[11px] text-muted">Looking for transaction references and invoices from courses you enrolled in?</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTab("billing")}
            className="px-4 py-2 rounded-xl bg-white border border-line text-xs font-bold text-ink hover:border-brand hover:text-brand transition cursor-pointer shrink-0 self-start sm:self-center"
          >
            View Billing &amp; Invoices →
          </button>
        </div>

        {/* Withdrawal Request Modal */}
        {payoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h4 className="font-display text-base font-bold text-ink">Request Affiliate Payout</h4>
                <button
                  type="button"
                  onClick={() => setPayoutModalOpen(false)}
                  className="rounded-lg p-1 text-muted hover:bg-slate-100 hover:text-ink cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRequestPayout} className="mt-4 space-y-4 text-xs">
                {payoutError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 font-medium">
                    {payoutError}
                  </div>
                )}
                {payoutSuccess && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Payout request submitted! Our finance team will disburse shortly.
                  </div>
                )}

                <div>
                  <label className="block font-bold text-ink mb-1">
                    Withdrawal Amount (₦) — Available: {naira(profile?.pendingBalance || 0)}
                  </label>
                  <input
                    type="number"
                    step={1000}
                    min={minPayout}
                    max={profile?.pendingBalance || 0}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-line bg-cream/60 p-2.5 font-bold text-ink focus:border-brand focus:bg-white focus:outline-none"
                    required
                  />
                  <p className="mt-1 text-[11px] text-muted">Minimum withdrawal: {naira(minPayout)}</p>
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">Disbursement Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["bank", "usdt", "paypal"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPayoutMethod(m)}
                        className={`p-2 rounded-xl border text-center font-bold capitalize transition cursor-pointer text-xs ${
                          payoutMethod === m ? "border-brand bg-brand/10 text-brand" : "border-line bg-white text-muted hover:text-ink"
                        }`}
                      >
                        {m === "bank" ? "Nigerian Bank" : m === "usdt" ? "USDT (TRC20)" : "PayPal"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">
                    {payoutMethod === "bank"
                      ? "Bank Name, Account Number & Name"
                      : payoutMethod === "usdt"
                      ? "USDT TRC20 Wallet Address"
                      : "PayPal Email Address"}
                  </label>
                  <textarea
                    rows={2}
                    value={payoutDetails}
                    onChange={(e) => setPayoutDetails(e.target.value)}
                    placeholder={
                      payoutMethod === "bank"
                        ? "e.g. Zenith Bank • 0123456789 • John Doe"
                        : payoutMethod === "usdt"
                        ? "e.g. TRC20: TYs27F38kdP92mdLm78qZ03kdfk19..."
                        : "e.g. PayPal: payments@example.com"
                    }
                    className="w-full rounded-xl border border-line bg-cream/60 p-2.5 text-xs text-ink focus:border-brand focus:bg-white focus:outline-none"
                    required
                  />
                  {hasSavedMethod && payoutDetails === profile?.payoutDetails && (
                    <p className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="h-3 w-3" /> Auto-filled from your preferred payout destination
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setPayoutModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-line font-bold text-ink hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={(profile?.pendingBalance || 0) < minPayout}
                    className="px-5 py-2 rounded-xl bg-brand text-white font-bold hover:bg-brand-dark transition cursor-pointer"
                  >
                    Submit Withdrawal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---------------------------- Billing panel ---------------------------- */

  function BillingSection() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">Billing &amp; Invoices</h2>
          <p className="mt-1 text-sm text-muted">
            Payment records, transaction reference numbers, and receipts for your enrolled courses and tools.
          </p>
        </div>

        {/* Shortcut to Wallet */}
        <div className="rounded-2xl border border-line bg-cream/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-line text-ink shrink-0">
              <Wallet className="h-4 w-4 text-brand" />
            </div>
            <div>
              <p className="font-bold text-ink text-sm">Affiliate Commission &amp; Payout Wallet</p>
              <p className="text-[11px] text-muted">Looking for your referral earnings, balance, or payout disbursement settings?</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTab("wallet")}
            className="px-4 py-2 rounded-xl bg-white border border-line text-xs font-bold text-ink hover:border-brand hover:text-brand transition cursor-pointer shrink-0 self-start sm:self-center"
          >
            Go to Wallet →
          </button>
        </div>

        {myPayments.length === 0 ? (
          <EmptyState
            title="No payment records yet"
            body="Your course purchase receipts and transaction references will appear here once you enroll in paid courses or trading tools."
            cta="Browse Courses"
            to="/courses"
          />
        ) : (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-xs sm:text-sm">
                  <thead className="bg-cream text-left font-bold text-muted border-b border-line">
                    <tr>
                      <th className="px-5 py-3">Reference</th>
                      <th className="px-5 py-3">Course / Tool</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {myPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-3.5">
                          <code className="rounded bg-cream px-2 py-1 text-xs font-mono font-bold text-brand">
                            {p.ref}
                          </code>
                        </td>
                        <td className="px-5 py-3.5 text-ink font-semibold">{p.courseTitle}</td>
                        <td className="px-5 py-3.5 font-bold text-ink">{naira(p.amount)}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              p.status === "paid"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : p.status === "refunded"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-line text-muted"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-muted">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Refund & Billing Support notice */}
            <div className="rounded-2xl border border-line bg-white p-5 text-xs text-muted flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-ink text-sm">Need billing assistance or refund review?</p>
                <p className="mt-1 leading-relaxed">
                  Enrollments are generally non-refundable. If you have exceptional circumstances (e.g. within 7 days of purchase without accessing materials), our support team can review your request.
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <a
                  href={CONTACT.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary !py-2 !text-xs"
                >
                  Message Support
                </a>
                <button
                  type="button"
                  onClick={() => navigate("/contact")}
                  className="btn-outline-dark !py-2 !text-xs cursor-pointer"
                >
                  Contact Form
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ------------------------ Staff article editor ------------------------ */

  function MyArticles() {
    const canPublish = store.can("posts:publish");
    const canManageAll = store.can("posts:manage");
    const list = canManageAll ? store.posts : store.myPosts;
    const blank = { id: "", slug: "", title: "", excerpt: "", category: CATEGORIES[0], body: "", image: "", tags: "" };
    const [editing, setEditing] = useState<typeof blank | null>(null);
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const open = (p?: typeof store.posts[number]) =>
      setEditing(p
        ? { id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category, body: p.body, image: p.image ?? "", tags: p.tags.join(", ") } as typeof blank
        : { ...blank });

    const submit = (status: "draft" | "published") => {
      if (!editing) return;
      const res = store.savePost({
        id: editing.id || undefined,
        slug: editing.slug, title: editing.title, excerpt: editing.excerpt,
        category: editing.category, body: editing.body, image: editing.image || undefined,
        tags: editing.tags.split(",").map((t) => t.trim()).filter(Boolean),
        status,
      });
      if (!res.ok) { setError(res.error ?? "Could not save."); return; }
      setError(null);
      setEditing(null);
      setMsg(status === "published"
        ? (canPublish ? "Article published." : "Submitted for editor review.")
        : "Draft saved.");
      window.setTimeout(() => setMsg(null), 3500);
    };

    if (editing) {
      return (
        <div className="rounded-3xl border border-line bg-white p-5 sm:p-8 shadow-[0_18px_50px_-32px_rgba(22,24,28,0.3)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-ink">{editing.id ? "Edit article" : "New article"}</h2>
            <button onClick={() => { setEditing(null); setError(null); }} className="btn-outline-dark !py-2.5">Cancel</button>
          </div>

          {error && (
            <p className="mt-5 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand-light p-3 text-sm text-ink/80">
              <AlertCircle className="h-4 w-4 shrink-0 text-brand" /> {error}
            </p>
          )}

          <div className="mt-6 space-y-5">
            <Input label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} ph="How to read the economic calendar" />
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Category</label>
                <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Input label="Tags (comma separated)" value={editing.tags} onChange={(v) => setEditing({ ...editing, tags: v })} ph="NFP, CPI" />
            </div>
            <Input label="Cover image URL (optional)" value={editing.image} onChange={(v) => setEditing({ ...editing, image: v })} ph="https://…" />
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Excerpt</label>
              <textarea rows={2} value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                placeholder="A one or two sentence summary shown on the blog index."
                className="w-full resize-none rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Article body</label>
              <RichTextEditor
                value={editing.body}
                onChange={(html) => setEditing((prev) => (prev ? { ...prev, body: html } : prev))}
                placeholder="Start writing your article… Use the toolbar to format headings, lists, quotes and links."
              />
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-line pt-6">
            <button onClick={() => submit("draft")} className="btn-outline-dark"><Save className="h-4 w-4" /> Save draft</button>
            <button onClick={() => submit("published")} className="btn-primary">
              <Send className="h-4 w-4" /> {canPublish ? "Publish now" : "Submit for review"}
            </button>
            {!canPublish && <span className="text-xs text-muted">Your level requires editor approval before publishing.</span>}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 sm:p-6">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">My articles</h2>
            <p className="mt-1 text-sm text-muted">
              {canManageAll ? "You can edit and publish any article." : "Write drafts and submit them for editor review."}
            </p>
          </div>
          <button onClick={() => open()} className="btn-primary"><Plus className="h-4 w-4" /> New article</button>
        </div>

        {msg && (
          <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> {msg}
          </p>
        )}

        {list.length ? (
          <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
            {list.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-3 sm:gap-4 p-4 sm:p-5">
                <FileText className="h-5 w-5 shrink-0 text-brand" />
                <div className="min-w-[160px] flex-1">
                  <p className="truncate font-display text-base font-bold text-ink">{p.title || "Untitled"}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {p.category} · {p.authorName} · updated {new Date(p.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${
                  p.status === "published" ? "bg-emerald-50 text-emerald-700"
                    : p.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-line/60 text-muted"}`}>
                  {p.status}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => open(p)} className="btn-outline-dark !py-2"><PenSquare className="h-4 w-4" /> Edit</button>
                  {canPublish && p.status !== "published" && (
                    <button onClick={() => store.setPostStatus(p.id, "published")} className="btn-primary !py-2">Publish</button>
                  )}
                  {canPublish && p.status === "published" && (
                    <button onClick={() => store.setPostStatus(p.id, "draft")} className="btn-outline-dark !py-2">Unpublish</button>
                  )}
                  <button onClick={() => { if (confirm("Delete this article?")) store.deletePost(p.id); }}
                    className="rounded-lg p-2 text-muted transition hover:bg-brand-light hover:text-brand" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-white p-10 sm:p-14 text-center">
            <PenSquare className="mx-auto h-12 w-12 text-brand/35" />
            <h3 className="mt-5 font-display text-lg font-bold text-ink">No articles yet</h3>
            <p className="mt-1.5 text-sm text-muted">Write your first piece for the GAMAT blog.</p>
            <button onClick={() => open()} className="btn-primary mt-6"><Plus className="h-4 w-4" /> New article</button>
          </div>
        )}
      </div>
    );
  }

  function TeamBioForm() {
    const { submitTeamBio, teamBios, updateProfile, user: u } = store;
    const mine = teamBios.filter((b) => b.userId === u?.id);
    const latest = mine[0];
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [form, setForm] = useState({
      role: latest?.role || u?.jobTitle || "",
      focus: latest?.focus || "",
      bio: latest?.bio || u?.bio || "",
      longBio: latest?.longBio || "",
      expertiseText: latest?.expertiseText || "",
      milestonesText: latest?.milestonesText || "",
    });
    const [photo, setPhoto] = useState(u?.avatar || latest?.avatar || "");
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const pickPhoto = (file?: File) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) { setError("Please choose an image file."); return; }
      if (file.size > 3 * 1024 * 1024) { setError("Image must be smaller than 3MB."); return; }
      setError(null);
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const size = 400;
          const cv = document.createElement("canvas");
          cv.width = size; cv.height = size;
          const ctx = cv.getContext("2d")!;
          const s = Math.min(img.width, img.height);
          ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
          const data = cv.toDataURL("image/jpeg", 0.88);
          setPhoto(data);
          // Immediately sync account + any linked team page.
          updateProfile({ avatar: data });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    };

    const submit = (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      if (photo && photo !== u?.avatar) updateProfile({ avatar: photo });
      const res = submitTeamBio(form);
      setSaving(false);
      if (!res.ok) { setError(res.error ?? "Could not submit."); setMsg(null); return; }
      setError(null);
      setMsg("Bio and photo submitted for admin review. Your photo already updates your account and any linked team page.");
    };

    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-line bg-white p-5 sm:p-8 shadow-sm">
          <h2 className="font-display text-xl font-bold text-ink">Team bio for the public site</h2>
          <p className="mt-2 text-sm text-muted">
            Upload your photo and bio for About the Team. Your picture updates your account immediately
            and syncs to your public team page when linked; admins review the written bio before publish.
          </p>

          {latest && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1 text-xs font-bold text-ink">
              Latest submission:{" "}
              <span className={
                latest.status === "approved" ? "text-emerald-600"
                  : latest.status === "pending" ? "text-amber-600" : "text-muted"
              }>
                {latest.status}
              </span>
            </p>
          )}

          <form onSubmit={submit} className="mt-6 space-y-5">
            {error && <p className="rounded-xl border border-brand/30 bg-brand-light p-3 text-sm">{error}</p>}
            {msg && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{msg}</p>}

            {/* Photo upload */}
            <div className="rounded-2xl border border-line bg-cream p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Profile photo</p>
              <div className="mt-4 flex flex-wrap items-center gap-5">
                {photo ? (
                  <img src={photo} alt="Team photo" className="h-24 w-24 rounded-2xl object-cover ring-4 ring-brand/20" />
                ) : (
                  <span className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark font-display text-2xl font-extrabold text-white">
                    {(u?.firstName?.[0] ?? "") + (u?.lastName?.[0] ?? "")}
                  </span>
                )}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => fileRef.current?.click()} className="btn-outline-dark !py-2">
                      <Camera className="h-4 w-4" /> {photo ? "Change photo" : "Upload photo"}
                    </button>
                    {photo && (
                      <button type="button" onClick={() => { setPhoto(""); updateProfile({ avatar: undefined }); }} className="btn-outline-dark !py-2">
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted">JPG or PNG, square works best. Max 3MB. Shows on your team page, forum and dashboard.</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickPhoto(e.target.files?.[0])} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Role / title *</label>
                <input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white"
                  placeholder="Senior Market Analyst" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Focus line</label>
                <input value={form.focus} onChange={(e) => setForm({ ...form, focus: e.target.value })}
                  className="w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white"
                  placeholder="Indices · Crypto" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Short bio *</label>
              <textarea required rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full resize-none rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white"
                placeholder="2–3 sentences for your team card and profile header." />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Long bio</label>
              <textarea rows={6} value={form.longBio} onChange={(e) => setForm({ ...form, longBio: e.target.value })}
                className="w-full resize-y rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white"
                placeholder="Full profile story shown on your individual team page." />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Expertise (one per line)</label>
              <textarea rows={4} value={form.expertiseText} onChange={(e) => setForm({ ...form, expertiseText: e.target.value })}
                className="w-full resize-none rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white"
                placeholder={"Price action & liquidity\nSession analysis"} />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Milestones (one per line: Year — Title: Body)
              </label>
              <textarea rows={4} value={form.milestonesText} onChange={(e) => setForm({ ...form, milestonesText: e.target.value })}
                className="w-full resize-none rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white"
                placeholder="2023 — Joined GAMAT: Took ownership of student success systems." />
            </div>

            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <><Send className="h-4 w-4" /> Submit for admin review</>}
            </button>
          </form>
        </div>

        {mine.length > 1 && (
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Submission history</p>
            <ul className="mt-3 space-y-2">
              {mine.map((b) => (
                <li key={b.id} className="flex items-center justify-between rounded-xl bg-cream px-3 py-2 text-sm">
                  <span className="text-ink">{new Date(b.createdAt).toLocaleDateString()}</span>
                  <span className="font-bold capitalize text-brand">{b.status}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  function Profile() {
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [form, setForm] = useState({
      firstName: user!.firstName,
      middleName: user!.middleName ?? "",
      lastName: user!.lastName,
      nickname: user!.nickname ?? "",
      phone: user!.phone ?? "", country: user!.country ?? "",
      birthday: user!.birthday ?? "", bio: user!.bio ?? "",
    });
    const [avatar, setAvatar] = useState(user!.avatar ?? "");
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    // Has anything actually changed?
    const dirty =
      form.firstName !== user!.firstName ||
      form.middleName !== (user!.middleName ?? "") ||
      form.lastName !== user!.lastName ||
      form.nickname !== (user!.nickname ?? "") ||
      form.phone !== (user!.phone ?? "") ||
      form.country !== (user!.country ?? "") ||
      form.birthday !== (user!.birthday ?? "") ||
      form.bio !== (user!.bio ?? "") ||
      avatar !== (user!.avatar ?? "");

    const save = (e: React.FormEvent) => {
      e.preventDefault();
      setErr(null);
      if (!form.firstName.trim()) { setErr("First name is required."); return; }
      if (!form.lastName.trim()) { setErr("Last name is required."); return; }

      setSaving(true);
      window.setTimeout(() => {
        store.updateProfile({
          firstName: form.firstName.trim(),
          middleName: form.middleName.trim() || undefined,
          lastName: form.lastName.trim(),
          nickname: form.nickname.trim() || undefined,
          phone: form.phone.trim() || undefined,
          country: form.country.trim() || undefined,
          birthday: form.birthday || undefined,
          bio: form.bio.trim() || undefined,
          avatar: avatar || undefined,
        });
        setSaving(false);
        setSaved(true);
        window.setTimeout(() => setSaved(false), 3000);
      }, 500);
    };

    const pick = async (file?: File) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) { setErr("Please choose an image file."); return; }
      if (file.size > 5 * 1024 * 1024) { setErr("Image must be smaller than 5MB."); return; }
      setErr(null);

      const res = await uploadAvatar(user!.id, file);
      if (res.ok && res.url) {
        setAvatar(res.url);
      } else {
        const reader = new FileReader();
        reader.onload = () => setAvatar(reader.result as string);
        reader.readAsDataURL(file);
      }
    };

    const initials = `${form.firstName[0] ?? ""}${form.lastName[0] ?? ""}`.toUpperCase();
    const bdayLabel = form.birthday
      ? new Date(form.birthday).toLocaleDateString("en-GB", { day: "numeric", month: "long" })
      : "";

    return (
      <form onSubmit={save} className="space-y-6">
        {/* Avatar + identity */}
        <div className="rounded-3xl border border-line bg-white p-5 sm:p-8 shadow-[0_18px_50px_-32px_rgba(22,24,28,0.3)]">
          <h2 className="font-display text-xl font-bold text-ink">Profile picture</h2>
          <p className="mt-1 text-sm text-muted">Shown on your dashboard, certificates area and community profile.</p>

          <div className="mt-6 flex flex-wrap items-center gap-6">
            <div className="relative">
              {avatar ? (
                <img src={avatar} alt="Profile" className="h-24 w-24 rounded-2xl object-cover ring-4 ring-brand-light" />
              ) : (
                <span className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark font-display text-2xl font-extrabold text-white">
                  {initials}
                </span>
              )}
              <button type="button" onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white shadow-lg transition hover:bg-brand"
                aria-label="Upload picture">
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => fileRef.current?.click()} className="btn-outline-dark !py-2.5">
                  <Camera className="h-4 w-4" /> {avatar ? "Change photo" : "Upload photo"}
                </button>
                {avatar && (
                  <button type="button" onClick={() => setAvatar("")} className="btn-outline-dark !py-2.5">
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-muted">JPG or PNG, square works best. Max 3MB.</p>
              {err && <p className="text-xs font-semibold text-brand">{err}</p>}
            </div>

            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => pick(e.target.files?.[0])} />
          </div>
        </div>

        {/* Details */}
        <div className="rounded-3xl border border-line bg-white p-5 sm:p-8 shadow-[0_18px_50px_-32px_rgba(22,24,28,0.3)]">
          <h2 className="font-display text-xl font-bold text-ink">Personal details</h2>
          <p className="mt-1 text-sm text-muted">Update your information and how you appear to others.</p>

          <div className="mt-7 grid gap-5 sm:grid-cols-3">
            <Input label="First name *" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
            <Input label="Middle name (optional)" value={form.middleName}
              onChange={(v) => setForm({ ...form, middleName: v })} ph="Optional" />
            <Input label="Last name *" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
          </div>

          <div className="mt-5">
            <Input label="Nickname / display name (optional)" value={form.nickname}
              onChange={(v) => setForm({ ...form, nickname: v })} ph="e.g. TheChartGuy" />
            <p className="mt-1.5 text-xs text-muted">
              This is what the community and forum see. Leave blank to use your full name.
            </p>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} ph="+234 806 194 9891" />
            <Input label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} ph="Nigeria" />
          </div>

          {/* Birthday */}
          <div className="mt-5 rounded-2xl border border-line bg-cream p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                <Cake className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted">Date of birth</label>
                <input type="date" value={form.birthday} max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand sm:max-w-xs" />

                <div className="mt-3 flex items-start gap-2 rounded-xl bg-white p-3">
                  <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <p className="text-xs leading-relaxed text-muted">
                    <strong className="text-ink">Your birth year is private.</strong> Only you (and academy
                    admins) can see it. The community and your certificates show only
                    {bdayLabel ? <> <strong className="text-ink">{bdayLabel}</strong></> : " the day and month"} —
                    never the year.
                  </p>
                </div>

                {form.birthday && (
                  <div className="mt-3 flex flex-wrap gap-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-semibold text-ink">
                      <Eye className="h-3.5 w-3.5 text-brand" /> Public: {bdayLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-semibold text-muted">
                      <EyeOff className="h-3.5 w-3.5 text-brand" /> Private: {new Date(form.birthday).getFullYear()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Email (read only)</label>
            <input disabled value={user!.email} className="w-full cursor-not-allowed rounded-xl border border-line bg-line/40 px-4 py-3 text-sm text-muted" />
          </div>

          <div className="mt-5">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Trading bio</label>
            <textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell the community a bit about your trading journey…"
              className="w-full resize-none rounded-xl border border-line bg-cream px-4 py-3 text-sm text-ink placeholder-muted/60 outline-none transition focus:border-brand focus:bg-white" />
          </div>

          {err && (
            <p className="mt-5 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand-light p-3 text-sm text-ink/80">
              <AlertCircle className="h-4 w-4 shrink-0 text-brand" /> {err}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-line pt-6">
            <button type="submit" disabled={saving || !dirty}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save Changes</>}
            </button>

            {dirty && !saving && !saved && (
              <button type="button"
                onClick={() => {
                  setForm({
                    firstName: user!.firstName, middleName: user!.middleName ?? "", lastName: user!.lastName,
                    nickname: user!.nickname ?? "", phone: user!.phone ?? "", country: user!.country ?? "",
                    birthday: user!.birthday ?? "", bio: user!.bio ?? "",
                  });
                  setAvatar(user!.avatar ?? "");
                  setErr(null);
                }}
                className="btn-outline-dark">
                Discard changes
              </button>
            )}

            {saved && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Profile saved successfully
              </span>
            )}
            {!dirty && !saved && !saving && (
              <span className="text-sm text-muted">No unsaved changes.</span>
            )}
          </div>
        </div>
      </form>
    );
  }
}

/* ------------------------------ Helpers ------------------------------ */

function Input({ label, value, onChange, ph }: { label: string; value: string; onChange: (v: string) => void; ph?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">{label}</label>
      <input value={value} placeholder={ph} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm text-ink placeholder-muted/60 outline-none transition focus:border-brand focus:bg-white" />
    </div>
  );
}

/** Inline preview of the real landscape certificate + PNG download. */
function CertificateCard({ data }: { data: CertData }) {
  const { publishedTeam } = useStore();
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    // Render on the next frame so fonts are ready.
    const t = window.setTimeout(() => setSrc(certificatePreview(data, publishedTeam)), 60);
    return () => window.clearTimeout(t);
  }, [data.name, data.course, data.serial, publishedTeam]);

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_20px_55px_-32px_rgba(22,24,28,0.35)]">
      <div className="bg-cream p-5">
        {src ? (
          <img src={src} alt={`Certificate for ${data.course}`}
            className="w-full rounded-xl border border-line shadow-md" />
        ) : (
          <div className="flex aspect-[1414/1000] w-full items-center justify-center rounded-xl border border-line bg-white">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line p-6">
        <div>
          <p className="font-display text-base font-bold text-ink">{data.course}</p>
          <p className="mt-0.5 text-xs text-muted">Serial {data.serial} · Issued {data.date}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { const w = window.open(""); if (w && src) w.document.write(`<img src="${src}" style="width:100%">`); }}
            className="btn-outline-dark !py-2.5">
            <Eye className="h-4 w-4" /> View full size
          </button>
          <button onClick={() => downloadCertificate(data, publishedTeam)} className="btn-primary !py-2.5">
            <Download className="h-4 w-4" /> Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, body, cta, to }: { title: string; body: string; cta: string; to: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-white p-14 text-center">
      <BookOpen className="mx-auto h-12 w-12 text-brand/40" />
      <h3 className="mt-5 font-display text-xl font-bold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{body}</p>
      <button onClick={() => navigate(to)} className="btn-primary mt-7">{cta} <ArrowUpRight className="h-4 w-4" /></button>
    </div>
  );
}
