import { useState } from "react";
import {
  ArrowLeft,
  Award,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Home,
  MessageSquare,
  Send,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import Logo from "../components/Logo";
import {
  ROLE_GUIDES,
  type RoleGuide,
} from "../lib/jobRoleGuides";
import {
  loadJobApplications,
  saveJobApplications,
  submitSupabaseJobApplication,
  type JobApplication,
} from "../lib/jobs";
import { navigate } from "../lib/router";

export default function JobRoleDetailPage({ guide }: { guide: RoleGuide }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [applyOpen, setApplyOpen] = useState(false);

  // Application form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [experience, setExperience] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const relatedGuides = ROLE_GUIDES.filter(
    (g) => g.slug !== guide.slug
  ).slice(0, 12);

  const sameCategoryGuides = ROLE_GUIDES.filter(
    (g) => g.categoryId === guide.categoryId && g.slug !== guide.slug
  );

  const goBackToJobs = () => {
    navigate("/jobs");
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg("Please fill in your full name, email address, and phone number.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    const refCode = `JOB-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const app: JobApplication = {
      id: `jobapp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ref: refCode,
      jobId: guide.slug,
      jobTitle: `${guide.title} (${guide.engagementType})`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      portfolioUrl: portfolioUrl.trim(),
      experience: experience.trim(),
      coverNote: coverNote.trim(),
      status: "new",
      createdAt: new Date().toISOString(),
    };

    const existing = loadJobApplications();
    saveJobApplications([app, ...existing]);
    await submitSupabaseJobApplication(app);

    setSubmitting(false);
    setSubmittedRef(refCode);
    setName("");
    setEmail("");
    setPhone("");
    setPortfolioUrl("");
    setExperience("");
    setCoverNote("");
  };

  return (
    <div className="min-h-screen bg-white text-ink-soft selection:bg-brand selection:text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={goBackToJobs}
              className="cursor-pointer"
            >
              <Logo variant="dark" size="sm" asDiv />
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={goBackToJobs}
              aria-label="All Roles"
              title="All Roles"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-cream text-xs font-semibold text-ink hover:border-brand/40 hover:text-brand transition cursor-pointer sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3.5 sm:py-1.5"
            >
              <ArrowLeft className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">All Roles</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSubmittedRef(null);
                setErrorMsg("");
                setApplyOpen(true);
              }}
              className="rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-dark cursor-pointer"
            >
              Apply to Volunteer
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section (matches Screenshot 1) */}
      <section className="border-b border-line bg-cream/60 px-4 py-14 sm:py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3.5 py-1 text-xs font-bold text-brand">
            <Briefcase className="h-3.5 w-3.5" /> {guide.engagementType}
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-5xl">
            {guide.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            {guide.overview}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-ink/70">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-brand" /> {guide.weeklyHours}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-brand" /> Verified Certificate &amp; Academy Access
            </span>
          </div>

          <div className="mt-7 flex justify-center">
            <button
              type="button"
              onClick={() => {
                setSubmittedRef(null);
                setErrorMsg("");
                setApplyOpen(true);
              }}
              className="rounded-full bg-brand px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark cursor-pointer"
            >
              Apply for {guide.title}
            </button>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-10 flex flex-wrap items-center gap-2 text-xs font-medium text-muted">
          <button
            type="button"
            onClick={goBackToJobs}
            className="inline-flex items-center gap-1 hover:text-brand cursor-pointer"
          >
            <Home className="h-3.5 w-3.5" /> Careers
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={goBackToJobs}
            className="hover:text-brand cursor-pointer"
          >
            {guide.category}
          </button>
          <span>/</span>
          <span className="font-semibold text-ink">{guide.title}</span>
        </nav>

        {/* How It Works (4-column strip matching Screenshot 2) */}
        <section className="border-b border-line pb-14">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            How volunteering at GAMAT Fx works
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: FileText,
                title: "Submit your interest",
                desc: "Share your background, portfolio, or trading track record in under two minutes.",
              },
              {
                icon: Users,
                title: "Quick alignment call",
                desc: "Meet our team lead to align on weekly hours, expectations, and your learning goals.",
              },
              {
                icon: MessageSquare,
                title: "Collaborate remotely",
                desc: "Work directly with mentors, engineers, and creators on real student-facing work.",
              },
              {
                icon: ShieldCheck,
                title: "Grow & unlock perks",
                desc: "Earn verified experience, academy access, and priority for paid full-time roles.",
              },
            ].map((step) => (
              <div key={step.title}>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-light text-brand">
                  <step.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-ink">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Hiring & Role Guide (matches Screenshots 4–7) */}
        <section className="border-b border-line py-14 space-y-10 max-w-3xl">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              {guide.title} role guide
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/80 sm:text-base">
              {guide.overview} Most contributors join GAMAT Fx through our
              structured volunteering fellowship—gaining hands-on fintech and
              trading-desk experience while helping thousands of students trade
              with discipline.
            </p>
          </div>

          <div>
            <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">
              What do {guide.title} do at GAMAT Fx?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink/80 sm:text-base">
              {guide.whatTheyDo}
            </p>
            <p className="mt-4 text-sm font-semibold text-ink">
              Key responsibilities include:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink/80 sm:text-base">
              {guide.responsibilities.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">
              How to join as a volunteer
            </h3>
            <div className="mt-6 space-y-6">
              <div>
                <h4 className="font-display text-base font-bold text-ink">
                  Step 1: Prepare your proof of work
                </h4>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink/80">
                  {guide.requirements.map((req) => (
                    <li key={req}>{req}</li>
                  ))}
                  <li>Share links to past projects, GitHub, Behance, or trading journals</li>
                </ul>
              </div>
              <div>
                <h4 className="font-display text-base font-bold text-ink">
                  Step 2: Align on weekly commitment
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/80">
                  Volunteering roles are remote and asynchronous, requiring{" "}
                  <strong>{guide.weeklyHours}</strong>. Consistency and clear
                  communication matter more than where you live.
                </p>
              </div>
              <div>
                <h4 className="font-display text-base font-bold text-ink">
                  Step 3: Short practical assessment &amp; intro chat
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/80">
                  You’ll complete a brief, realistic task or walkthrough with our
                  team lead so both sides know it’s a great fit.
                </p>
              </div>
              <div>
                <h4 className="font-display text-base font-bold text-ink">
                  Step 4: Onboarding &amp; growth track
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/80">
                  Receive workspace access, mentorship perks, and clear weekly
                  milestones—with priority consideration when paid roles open.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Commitment & Track Breakdown Table (matches Screenshots 8–9) */}
        <section className="border-b border-line py-14">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            Commitment &amp; fellowship structure
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Here’s how weekly time commitment and focus areas typically break
            down for this volunteer track:
          </p>

          <div className="mt-8 divide-y divide-line border-t border-line">
            {guide.tracks.map((tr) => (
              <div
                key={tr.name}
                className="grid gap-4 py-6 sm:grid-cols-[260px_1fr]"
              >
                <div>
                  <h3 className="font-display text-base font-bold text-ink">
                    {tr.name}
                  </h3>
                  <p className="mt-1 font-display text-xl font-bold text-brand">
                    {tr.commitment}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    Volunteer Fellowship
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted mb-2.5">
                    {tr.level}
                  </p>
                  <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink/85">
                    {tr.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Frequently Asked Questions (matches Screenshots 9–10) */}
        <section className="border-b border-line py-14">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                Frequently asked questions
              </h2>
              <p className="mt-2 text-sm text-muted">
                Everything you need to know about volunteering and growing with
                GAMAT Fx.
              </p>
            </div>

            <div className="divide-y divide-line rounded-2xl border border-line bg-cream/40 px-5 sm:px-6">
              {guide.faqs.map((f, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={f.q} className="py-5">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between gap-4 text-left cursor-pointer"
                    >
                      <span className="font-display text-base font-bold text-ink">
                        {f.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-brand" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
                      )}
                    </button>
                    {isOpen && (
                      <p className="mt-2.5 text-sm leading-relaxed text-ink/75">
                        {f.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Related Roles Grid (matches Screenshot 11) */}
        <section className="py-14">
          <h2 className="font-display text-2xl font-bold text-ink">
            Explore more volunteer tracks
          </h2>

          {sameCategoryGuides.length > 0 && (
            <div className="mt-8">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted">
                More in {guide.category}
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {sameCategoryGuides.map((g) => (
                  <button
                    key={g.slug}
                    type="button"
                    onClick={() => navigate(`/jobs/${g.slug}`)}
                    className="text-left text-sm font-medium text-ink/80 hover:text-brand transition cursor-pointer"
                  >
                    {g.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 border-t border-line pt-8">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted">
              Other GAMAT Fx Teams
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {relatedGuides.map((g) => (
                <button
                  key={g.slug}
                  type="button"
                  onClick={() => navigate(`/jobs/${g.slug}`)}
                  className="text-left text-sm font-medium text-ink/75 hover:text-brand transition cursor-pointer"
                >
                  {g.title}
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-line bg-ink py-8 text-white/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs sm:flex-row sm:px-6">
          <div className="font-semibold text-white/80">
            GAMAT <span className="text-brand">Fx</span> Careers ·
            jobs.gamatfxacademy.com
          </div>
          <div>
            © {new Date().getFullYear()} GAMAT Fx Academy. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Apply Modal */}
      {applyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-line bg-white p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setApplyOpen(false)}
              aria-label="Close modal"
              className="absolute right-5 top-5 rounded-full p-2 text-muted hover:bg-cream hover:text-ink cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {submittedRef ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                <h3 className="mt-4 font-display text-xl font-bold text-ink">
                  Application Received!
                </h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  Thank you for applying to volunteer as{" "}
                  <strong className="text-ink">{guide.title}</strong>. Our team
                  will review your profile and reach out via email.
                </p>
                <div className="mt-4 inline-block rounded-xl border border-dashed border-brand/40 bg-brand-light px-4 py-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted block">
                    Reference ID
                  </span>
                  <span className="font-display text-sm font-extrabold text-brand">
                    {submittedRef}
                  </span>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setApplyOpen(false)}
                    className="btn-primary w-full"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="chip">{guide.category}</span>
                <h3 className="mt-2 font-display text-xl font-bold text-ink pr-8">
                  Apply for {guide.title}
                </h3>
                <p className="mt-1 text-xs text-muted">
                  {guide.engagementType} · {guide.weeklyHours}
                </p>

                <form onSubmit={handleApply} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted">
                      Full Name *
                    </label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-muted">
                        Email Address *
                      </label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-muted">
                        Phone / WhatsApp *
                      </label>
                      <input
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-muted">
                        Portfolio / GitHub / CV Link
                      </label>
                      <input
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-muted">
                        Weekly Availability
                      </label>
                      <input
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="e.g. 8 hrs / week"
                        className="w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted">
                      Why do you want to volunteer with GAMAT Fx?
                    </label>
                    <textarea
                      rows={4}
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      placeholder="Share your background, skills, or links to work you're proud of..."
                      className="w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-xs font-semibold text-rose-600">
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full justify-center"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? "Submitting..." : "Submit Volunteer Application"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
