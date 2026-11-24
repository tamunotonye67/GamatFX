import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import {
  fetchSupabaseJobRoles,
  loadJobApplications,
  loadJobRoles,
  saveJobApplications,
  submitSupabaseJobApplication,
  type JobApplication,
  type JobDepartment,
  type JobRole,
} from "../lib/jobs";
import { navigate } from "../lib/router";
import Logo from "../components/Logo";

const DEPARTMENTS: Array<"All" | JobDepartment> = [
  "All",
  "Trading & Mentorship",
  "Content & Media",
  "Engineering & Product",
  "Operations & Support",
];

export default function JobsPage() {
  const [roles, setRoles] = useState<JobRole[]>(() => loadJobRoles());
  const [dept, setDept] = useState<"All" | JobDepartment>("All");
  const [query, setQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);

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

  useEffect(() => {
    void fetchSupabaseJobRoles().then((remote) => {
      if (remote.length > 0) setRoles(remote);
    });
  }, []);

  const allOpenRoles = useMemo(() => roles.filter((r) => r.open), [roles]);

  const openRoles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allOpenRoles.filter((r) => {
      const matchDept = dept === "All" || r.department === dept;
      const matchQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q);
      return matchDept && matchQuery;
    });
  }, [allOpenRoles, dept, query]);

  const openModal = (role: JobRole) => {
    setSelectedRole(role);
    setSubmittedRef(null);
    setErrorMsg("");
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
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
      jobId: selectedRole.id,
      jobTitle: selectedRole.title,
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

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-cream text-ink-soft">
      {/* Cloudflare-inspired dark header + framed brand-red rounded hero */}
      <div className="bg-[#0d0e11]">
        <header className="mx-auto flex min-h-[84px] w-full max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="cursor-pointer"
            >
              <Logo variant="light" size="md" asDiv />
            </button>

            <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-white/85">
              <button
                type="button"
                onClick={() => scrollTo("roles")}
                className="hover:text-white transition cursor-pointer"
              >
                Open Roles
              </button>
              <button
                type="button"
                onClick={() => scrollTo("culture")}
                className="hover:text-white transition cursor-pointer"
              >
                Why GAMAT Fx
              </button>
              <button
                type="button"
                onClick={() => {
                  setDept("Trading & Mentorship");
                  scrollTo("roles");
                }}
                className="hover:text-white transition cursor-pointer"
              >
                Trading Desk
              </button>
              <button
                type="button"
                onClick={() => {
                  setDept("Engineering & Product");
                  scrollTo("roles");
                }}
                className="hover:text-white transition cursor-pointer"
              >
                Engineering
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollTo("roles")}
              className="hidden sm:inline-flex items-center gap-1.5 mr-1 text-[13px] font-medium text-rose-400 hover:text-rose-300 transition cursor-pointer"
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Hiring ({allOpenRoles.length})</span>
            </button>
            <a
              href="https://gamatfxacademy.com"
              onClick={(e) => {
                if (
                  window.location.hostname === "localhost" ||
                  window.location.hostname === "127.0.0.1"
                ) {
                  e.preventDefault();
                  navigate("/");
                }
              }}
              className="rounded-full border border-white/20 bg-white/[0.04] px-4 py-1.5 text-[13px] font-medium text-white/95 transition hover:bg-white/10"
            >
              Main Site
            </a>
            <button
              type="button"
              onClick={() => scrollTo("roles")}
              className="rounded-full border border-white/20 bg-white/[0.04] px-4 py-1.5 text-[13px] font-medium text-white/95 transition hover:bg-white/10 cursor-pointer"
            >
              View Jobs
            </button>
            <button
              type="button"
              onClick={() => {
                scrollTo("roles");
                setTimeout(() => {
                  document.querySelector<HTMLInputElement>('input[data-job-search="true"]')?.focus();
                }, 350);
              }}
              aria-label="Search roles"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-white/85 transition hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        {/* Framed Top-Rounded Brand-Red Hero Card */}
        <div className="w-full px-2 sm:px-3">
          <section className="relative overflow-hidden rounded-t-[48px] sm:rounded-t-[64px] rounded-b-none bg-gradient-to-b from-brand via-[#c82d3d] to-[#a92230] px-6 py-20 sm:py-28 lg:py-36 text-center text-white shadow-2xl">
            {/* Subtle dot-matrix texture + warm bottom glow matching reference */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.45) 1px, transparent 1px)",
                backgroundSize: "10px 10px",
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 left-1/2 h-72 w-[540px] -translate-x-1/2 rounded-full bg-rose-200/35 blur-[90px]"
            />

            <div className="relative mx-auto max-w-3xl">
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.35rem] lg:leading-[1.12]">
                Build the future of disciplined trading—with GAMAT Fx
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
                Join our remote-first team of market analysts, educators,
                creators, and engineers powering trading education for 1,000+
                students worldwide.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => scrollTo("roles")}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-ink shadow-lg transition hover:scale-[1.02] hover:bg-cream cursor-pointer"
                >
                  Explore {allOpenRoles.length} Open Roles{" "}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo("culture")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-xs transition hover:bg-white/20 cursor-pointer"
                >
                  Life at GAMAT Fx
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Culture highlights */}
      <section id="culture" className="section bg-cream">
        <div className="container-x">
          <div className="grid gap-4 sm:grid-cols-3 mb-12">
            {[
              {
                icon: Users,
                title: "Remote-First Team",
                body: "Work asynchronously with a tight-knit team across Lagos, London, and global trading sessions.",
              },
              {
                icon: Sparkles,
                title: "High Ownership",
                body: "Direct impact on thousands of students, live market broadcasts, and trading tools.",
              },
              {
                icon: Briefcase,
                title: "Performance Culture",
                body: "Competitive base pay, performance bonuses, and full access to GAMAT Fx resources.",
              },
            ].map((perk) => (
              <div
                key={perk.title}
                className="rounded-2xl border border-line bg-white p-6 shadow-2xs"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <perk.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-display text-base font-bold text-ink">
                  {perk.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {perk.body}
                </p>
              </div>
            ))}
          </div>

          {/* Open Positions Header & Search */}
          <div
            id="roles"
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6 scroll-mt-20"
          >
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">
                Open Positions ({openRoles.length})
              </h2>
              <p className="text-sm text-muted mt-1">
                Select a role below to review requirements and submit your
                application.
              </p>
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                data-job-search="true"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search roles..."
                className="w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-4 text-sm text-ink outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Department filter */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {DEPARTMENTS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDept(d)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
                  dept === d
                    ? "bg-brand text-white shadow-xs"
                    : "border border-line bg-white text-ink/75 hover:border-brand/40 hover:text-brand"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Role list */}
          {openRoles.length > 0 ? (
            <div className="space-y-4">
              {openRoles.map((role) => (
                <div
                  key={role.id}
                  className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-2xs transition hover:border-brand/35 hover:shadow-md"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="chip">{role.department}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-cream border border-line px-2.5 py-0.5 text-[11px] font-semibold text-ink/80">
                          <MapPin className="h-3 w-3 text-brand" /> {role.location}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-cream border border-line px-2.5 py-0.5 text-[11px] font-semibold text-ink/80">
                          <Clock className="h-3 w-3 text-brand" /> {role.type}
                        </span>
                        {role.compensation && (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                            {role.compensation}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-ink">
                        {role.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink/80">
                        {role.summary}
                      </p>
                      {role.requirements && (
                        <p className="mt-2 text-xs leading-relaxed text-muted">
                          <strong className="text-ink">Requirements:</strong>{" "}
                          {role.requirements}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => openModal(role)}
                        className="btn-primary w-full sm:w-auto"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-white p-10 text-center">
              <Briefcase className="mx-auto h-8 w-8 text-muted" />
              <p className="mt-3 font-display text-base font-bold text-ink">
                No matching open roles right now
              </p>
              <p className="mt-1 text-sm text-muted">
                Try another department or clear your search filter.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Clean Careers Footer */}
      <footer className="border-t border-line bg-ink py-8 text-white/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs sm:flex-row sm:px-6">
          <div className="font-semibold text-white/80">
            GAMAT <span className="text-brand">Fx</span> Careers · jobs.gamatfxacademy.com
          </div>
          <div>
            © {new Date().getFullYear()} GAMAT Fx Academy. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Application Modal */}
      {selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-line bg-white p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedRole(null)}
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
                  Thank you for applying for{" "}
                  <strong className="text-ink">{selectedRole.title}</strong>. Our
                  hiring team will review your profile and reach out via email.
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
                    onClick={() => setSelectedRole(null)}
                    className="btn-primary w-full"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="chip">{selectedRole.department}</span>
                <h3 className="mt-2 font-display text-xl font-bold text-ink pr-8">
                  Apply for {selectedRole.title}
                </h3>
                <p className="mt-1 text-xs text-muted">
                  {selectedRole.location} · {selectedRole.type}
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
                        CV / Portfolio / LinkedIn URL
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
                        Years of Experience
                      </label>
                      <input
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="e.g. 3 years"
                        className="w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted">
                      Why GAMAT Fx &amp; Relevant Experience
                    </label>
                    <textarea
                      rows={4}
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      placeholder="Tell us about your background, track record, or links to work you're proud of..."
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
                    {submitting ? "Submitting..." : "Submit Application"}
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
