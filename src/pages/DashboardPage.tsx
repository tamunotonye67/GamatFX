import { useState, useEffect, useRef } from "react";
import { useStore } from "../lib/store";
import { downloadCertificate, certificatePreview, type CertData } from "../lib/certificate";
import { COURSES, getCourse, totalLessons, naira } from "../lib/courses";
import { navigate } from "../lib/router";
import {
  LayoutDashboard, BookOpen, Award, User as UserIcon, CalendarDays,
  PlayCircle, ArrowUpRight, Clock, CheckCircle2, Lock, LogOut, Save, Download,
  Receipt, ShieldCheck, Loader2, Eye, Camera, Trash2, Cake, EyeOff, AlertCircle,
  ListChecks, PenSquare, Plus, Send, FileText, Users,
} from "lucide-react";
import { getQuiz } from "../lib/quizzes";
import RichTextEditor from "../components/RichTextEditor";
import { CONTACT } from "../lib/contact";
import { rankForXp, progressToNext, nextRank } from "../lib/combat";
import { uploadAvatar } from "../lib/supabaseStorage";

type Tab = "overview" | "courses" | "certificates" | "events" | "billing" | "posts" | "team-bio" | "profile";

const baseTabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "courses", label: "My Courses", icon: BookOpen },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "events", label: "My Events", icon: CalendarDays },
  { id: "billing", label: "Billing", icon: Receipt },
  { id: "profile", label: "Profile", icon: UserIcon },
];

const CATEGORIES = ["Fundamentals", "Technical", "Psychology", "Risk", "News"];

export default function DashboardPage() {
  const store = useStore();
  const { user, isAuthed, enrollments, myRegistrations, myPayments, stats, progressOf, logout, isAdmin, combat } = store;
  const combatRank = rankForXp(combat.xp);
  const combatNext = nextRank(combat.xp);
  const combatPct = progressToNext(combat.xp);
  const [tab, setTab] = useState<Tab>("overview");

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
    tabs = [...baseTabs.slice(0, 5), { id: "posts" as Tab, label: "My Articles", icon: PenSquare }, baseTabs[5]];
  }
  if (isTeamMember) {
    const profileIdx = tabs.findIndex((t) => t.id === "profile");
    tabs = [
      ...tabs.slice(0, profileIdx),
      { id: "team-bio" as Tab, label: "Team Bio", icon: Users },
      ...tabs.slice(profileIdx),
    ];
  }
  const completedCourses = enrollments.filter((e) => {
    const c = getCourse(e.courseId);
    return c && e.completedLessons.length >= totalLessons(c);
  });
  // A certificate requires BOTH all lessons finished AND a passed assessment.
  const certified = completedCourses.filter((e) => store.hasPassedQuiz(e.courseId));
  const awaitingQuiz = completedCourses.filter((e) => !store.hasPassedQuiz(e.courseId));

  return (
    <div className="min-h-screen bg-cream pt-[72px]">
      {/* Header */}
      <section className="bg-ink pb-24 pt-12 text-white">
        <div className="container-x flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="h-16 w-16 rounded-2xl object-cover shadow-lg ring-2 ring-brand/40" />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark font-display text-xl font-extrabold shadow-lg">
                {initials}
              </span>
            )}
            <div>
              <p className="text-sm text-white/55">Welcome back,</p>
              <h1 className="font-display text-2xl font-extrabold md:text-3xl">
                {user.nickname || `${user.firstName} ${user.lastName}`}
              </h1>
              <p className="mt-0.5 text-sm text-white/50">{user.email}</p>
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
          <button onClick={() => navigate("/courses")} className="btn-primary">
            Browse Courses <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Stats */}
      <div className="container-x -mt-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BookOpen, v: stats.enrolled, l: "Courses enrolled" },
            { icon: CheckCircle2, v: stats.lessonsDone, l: "Lessons completed" },
            { icon: Clock, v: `${stats.hours}h`, l: "Learning time" },
            { icon: Award, v: stats.completed, l: "Certificates earned" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-line bg-white p-6 shadow-[0_14px_45px_-25px_rgba(22,24,28,0.3)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand">
                <s.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-display text-3xl font-extrabold text-ink">{s.v}</p>
              <p className="mt-0.5 text-sm text-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs + content */}
      <section className="container-x grid gap-8 py-12 lg:grid-cols-[240px_1fr]">
        <aside>
          <div className="sticky top-24 space-y-1 rounded-2xl border border-line bg-white p-3">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${tab === t.id ? "bg-brand text-white" : "text-ink/70 hover:bg-cream hover:text-brand"}`}>
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
            {isAdmin && (
              <button onClick={() => navigate("/admin")}
                className="flex w-full items-center gap-3 rounded-xl bg-ink px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-ink/90">
                <ShieldCheck className="h-4 w-4 text-brand-light" /> Admin Panel
              </button>
            )}
            <button onClick={() => { logout(); navigate("/"); }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-muted transition hover:bg-cream hover:text-brand">
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </aside>

        <div>
          {tab === "overview" && <Overview />}
          {tab === "courses" && <MyCourses />}
          {tab === "certificates" && <Certificates completed={certified.map((e) => e.courseId)} pending={awaitingQuiz.map((e) => e.courseId)} name={[user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ")} />}
          {tab === "events" && <MyEvents />}
          {tab === "billing" && <Billing />}
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
              <img src={nextCourse.poster} alt="" className="h-full min-h-[160px] w-full object-cover" />
              <div className="p-7">
                <span className="chip">Continue learning</span>
                <h2 className="mt-3 font-display text-xl font-bold text-ink">{nextCourse.title}</h2>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${progressOf(nextCourse.id)}%` }} />
                  </div>
                  <span className="text-sm font-bold text-brand">{progressOf(nextCourse.id)}%</span>
                </div>
                <button onClick={() => navigate(`/learn/${nextCourse.id}`)} className="btn-primary mt-5">
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
                <img src={c.poster} alt="" className="h-full min-h-[140px] w-full object-cover" />
                <div className="p-6">
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
            <div key={id} className="rounded-3xl border-2 border-dashed border-brand/40 bg-white p-8">
              <div className="flex flex-wrap items-center gap-5">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand">
                  <Lock className="h-7 w-7" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-bold text-ink">{c.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    All lessons complete — pass the final assessment ({quiz?.passMark ?? 70}% required) to unlock your certificate.
                  </p>
                  {best && (
                    <p className="mt-1.5 text-xs font-semibold text-brand">
                      Best attempt: {best.score}% — {quiz ? quiz.passMark - best.score : 0}% short.
                    </p>
                  )}
                </div>
                <button onClick={() => navigate(`/quiz/${id}`)} className="btn-primary">
                  <ListChecks className="h-4 w-4" /> {best ? "Retake assessment" : "Take assessment"}
                </button>
              </div>
            </div>
          );
        })}
      </>
    );

    if (!completed.length && !pending.length) {
      return <EmptyState title="No certificates yet" body="Complete all lessons in a course, then pass the final assessment to unlock your certificate." cta="View My Courses" to="/dashboard" />;
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
            <div className="flex flex-wrap items-center justify-between gap-4 p-6">
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

  function Billing() {
    if (!myPayments.length) {
      return <EmptyState title="No payments yet" body="Your course purchase receipts will appear here." cta="Browse Courses" to="/courses" />;
    }
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-line bg-white p-5 text-sm text-muted">
          <p className="font-semibold text-ink">Refunds are manual only</p>
          <p className="mt-1.5 leading-relaxed">
            There is no automatic refund button here. Enrollments are generally non-refundable.
            If you believe you qualify for a review (for example you have not accessed any material
            within 7 days of purchase), contact the academy — any approved refund is processed
            manually by our team outside this dashboard.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a href={CONTACT.whatsappHref} target="_blank" rel="noreferrer" className="btn-primary !py-2">
              Message us on WhatsApp
            </a>
            <button type="button" onClick={() => navigate("/contact")} className="btn-outline-dark !py-2">
              Contact form
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-bold">Reference</th>
                  <th className="px-5 py-3 font-bold">Course</th>
                  <th className="px-5 py-3 font-bold">Amount</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {myPayments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3.5"><code className="rounded bg-cream px-2 py-1 text-xs font-bold text-brand">{p.ref}</code></td>
                    <td className="px-5 py-3.5 text-ink/80">{p.courseTitle}</td>
                    <td className="px-5 py-3.5 font-bold text-ink">{naira(p.amount)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
                        p.status === "paid" ? "bg-emerald-50 text-emerald-700"
                          : p.status === "refunded" ? "bg-amber-50 text-amber-700"
                          : "bg-line text-muted"
                      }`}>
                        {p.status === "refunded" ? "refunded (manual)" : p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
        <div className="rounded-3xl border border-line bg-white p-8 shadow-[0_18px_50px_-32px_rgba(22,24,28,0.3)]">
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
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-6">
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
              <div key={p.id} className="flex flex-wrap items-center gap-4 p-5">
                <FileText className="h-5 w-5 shrink-0 text-brand" />
                <div className="min-w-0 flex-1">
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
                <div className="flex gap-2">
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
          <div className="rounded-2xl border border-dashed border-line bg-white p-14 text-center">
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
        <div className="rounded-3xl border border-line bg-white p-8 shadow-sm">
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
        <div className="rounded-3xl border border-line bg-white p-8 shadow-[0_18px_50px_-32px_rgba(22,24,28,0.3)]">
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
        <div className="rounded-3xl border border-line bg-white p-8 shadow-[0_18px_50px_-32px_rgba(22,24,28,0.3)]">
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
          <div className="mt-5 rounded-2xl border border-line bg-cream p-5">
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
