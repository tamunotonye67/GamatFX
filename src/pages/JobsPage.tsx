import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  Menu,
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
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    const onScroll = () => {
      setScrolledPastHero(window.scrollY > Math.max(420, window.innerHeight * 0.72));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
    <div className="min-h-screen bg-[#111215] text-white selection:bg-brand selection:text-white">
      {/* Minimal Sticky Bar shown only after scrolling past the hero */}
      <div
        className={`fixed top-0 inset-x-0 z-40 border-b border-white/10 bg-[#111215]/90 backdrop-blur-md transition-all duration-300 ${
          scrolledPastHero
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="cursor-pointer"
          >
            <Logo variant="light" size="sm" asDiv />
          </button>
          <button
            type="button"
            onClick={() => scrollTo("roles")}
            className="rounded-full bg-brand px-5 py-2 text-xs font-bold text-white shadow-md shadow-brand/25 transition hover:bg-brand-dark cursor-pointer"
          >
            Explore roles
          </button>
        </div>
      </div>

      {/* Dark top header + framed brand-red hero */}
      <div className="bg-[#111215]">
        <header className="mx-auto flex min-h-[84px] w-full max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="cursor-pointer"
          >
            <Logo variant="light" size="md" asDiv />
          </button>

          {/* Desktop Right Controls */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollTo("roles")}
              className="inline-flex items-center gap-1.5 mr-1 text-[13px] font-medium text-rose-400 hover:text-rose-300 transition cursor-pointer"
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

          {/* Mobile Right Controls (matches reference: 1 pill + Search + Hamburger) */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => scrollTo("roles")}
              className="rounded-full border border-white/20 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 cursor-pointer"
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
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10 cursor-pointer"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#111215] px-4 py-4 space-y-2">
            {[
              { label: `Open Roles (${allOpenRoles.length})`, action: () => scrollTo("roles") },
              { label: "Why GAMAT Fx", action: () => scrollTo("culture") },
              {
                label: "Trading Desk",
                action: () => {
                  setDept("Trading & Mentorship");
                  scrollTo("roles");
                },
              },
              {
                label: "Engineering",
                action: () => {
                  setDept("Engineering & Product");
                  scrollTo("roles");
                },
              },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  item.action();
                }}
                className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/85 hover:bg-white/5 hover:text-white cursor-pointer"
              >
                {item.label}
              </button>
            ))}
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
              className="block w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              Visit Main Academy Site
            </a>
          </div>
        )}

        {/* Framed Top-Rounded Brand-Red Hero Card */}
        <div className="w-full px-2 sm:px-3 pb-3">
          <section className="relative flex min-h-[108vh] flex-col items-start sm:items-center justify-center overflow-hidden rounded-t-[36px] sm:rounded-t-[64px] rounded-b-2xl bg-gradient-to-b from-brand via-[#c82d3d] to-[#a92230] px-5 py-24 sm:px-6 sm:py-36 text-left sm:text-center text-white shadow-2xl">
            {/* Subtle dot-matrix texture + warm bottom glow */}
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
              className="pointer-events-none absolute -bottom-24 left-1/2 h-72 w-[540px] -translate-x-1/2 rounded-full bg-rose-200/45 blur-[90px]"
            />

            <div className="relative w-full sm:mx-auto max-w-5xl">
              <h1 className="font-sans text-[2.2rem] leading-[1.1] font-semibold sm:font-medium tracking-tight text-white sm:text-5xl lg:text-[3.2rem] lg:leading-[1.15]">
                Want to be a part of something more
                <br className="hidden sm:inline" /> fulfilling than trading? Then, let’s work!
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:mx-auto sm:text-base">
                Join our remote-first team of market analysts, educators,
                creators, and engineers powering trading education for 1,000+
                students worldwide.
              </p>

              <div className="mt-9 flex w-full flex-col sm:flex-row sm:w-auto sm:items-center sm:justify-center gap-3">
                <button
                  type="button"
                  onClick={() => scrollTo("roles")}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl sm:rounded-full bg-white px-7 py-4 sm:py-3 text-sm font-bold text-ink shadow-lg transition hover:scale-[1.02] hover:bg-cream cursor-pointer"
                >
                  Explore {allOpenRoles.length} Open Roles{" "}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo("culture")}
                  className="hidden sm:inline-flex items-center justify-center gap-2 rounded-full border border-white/35 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-xs transition hover:bg-white/20 cursor-pointer"
                >
                  Life at GAMAT Fx
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Architectural Dark Continuation Section (matches Region: Earth section) */}
      <div className="mx-auto max-w-[1440px] px-2 sm:px-3">
        <div className="border-x border-t border-dashed border-white/10">
          {/* Network / Global Team Visual Section */}
          <section className="relative overflow-hidden border-b border-dashed border-white/10 px-6 pt-20 pb-0 text-center">
            <div className="mx-auto max-w-2xl">
              <h2 className="font-sans text-3xl font-medium tracking-tight text-white sm:text-4xl">
                Region: Global Desk
              </h2>
              <p className="mt-3 text-sm text-white/60 sm:text-base">
                One connected team for live market breakdowns, education, and
                trader tools — built remotely across major sessions.
              </p>
            </div>

            {/* Minimal Dotted Globe & Connected Node Pins */}
            <div className="relative mx-auto mt-10 max-w-3xl h-[230px] sm:h-[280px] overflow-hidden">
              <svg
                viewBox="0 0 800 320"
                className="mx-auto h-full w-full"
                fill="none"
                aria-hidden="true"
              >
                <defs>
                  <radialGradient id="globeGlow" cx="50%" cy="85%" r="60%">
                    <stop offset="0%" stopColor="#dc3545" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#111215" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="400" cy="295" r="245" fill="url(#globeGlow)" />
                {/* Latitude / Longitude arcs */}
                <circle cx="400" cy="295" r="240" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                <ellipse cx="400" cy="295" rx="165" ry="240" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <ellipse cx="400" cy="295" rx="85" ry="240" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <ellipse cx="400" cy="215" rx="224" ry="48" stroke="rgba(220,53,69,0.22)" strokeDasharray="3 5" strokeWidth="1" />
                <ellipse cx="400" cy="145" rx="185" ry="38" stroke="rgba(220,53,69,0.25)" strokeDasharray="3 5" strokeWidth="1" />

                {/* Connection Arcs */}
                <path
                  d="M 285 170 Q 400 70 505 155"
                  stroke="#dc3545"
                  strokeWidth="1.5"
                  strokeOpacity="0.8"
                />
                <path
                  d="M 380 112 Q 465 105 555 198"
                  stroke="#dc3545"
                  strokeWidth="1.2"
                  strokeOpacity="0.65"
                />

                {/* Node 1 */}
                <circle cx="380" cy="112" r="16" fill="#111215" stroke="#dc3545" strokeWidth="1.5" />
                <circle cx="380" cy="112" r="4" fill="#dc3545" />

                {/* Node 2 */}
                <circle cx="505" cy="155" r="14" fill="#111215" stroke="#dc3545" strokeWidth="1.5" />
                <circle cx="505" cy="155" r="3.5" fill="#dc3545" />

                {/* Node 3 */}
                <circle cx="285" cy="170" r="14" fill="#111215" stroke="#dc3545" strokeWidth="1.5" />
                <circle cx="285" cy="170" r="3.5" fill="#dc3545" />
              </svg>

              {/* Corner-bracket callout box matching reference */}
              <div className="hidden sm:block absolute right-6 bottom-6 max-w-[235px] border border-dashed border-brand/50 bg-[#14161b]/95 p-3.5 text-left">
                <span className="absolute -top-0.5 -left-0.5 h-2 w-2 border-t-2 border-l-2 border-brand" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 border-t-2 border-r-2 border-brand" />
                <span className="absolute -bottom-0.5 -left-0.5 h-2 w-2 border-b-2 border-l-2 border-brand" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 border-b-2 border-r-2 border-brand" />
                <p className="text-[11px] leading-relaxed text-rose-300/95 font-medium">
                  1,000+ traders trained globally across London, New York, and
                  Lagos sessions.
                </p>
              </div>
            </div>
          </section>

          {/* Culture Highlights */}
          <section
            id="culture"
            className="border-b border-dashed border-white/10 px-4 py-14 sm:px-10"
          >
            <div className="grid gap-4 sm:grid-cols-3">
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
                  className="rounded-2xl border border-white/10 bg-[#16181d] p-6"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
                    <perk.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-white">
                    {perk.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                    {perk.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Open Positions */}
          <section id="roles" className="px-4 py-16 sm:px-10 scroll-mt-20">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
              <div>
                <h2 className="font-sans text-2xl sm:text-3xl font-medium tracking-tight text-white">
                  Open Positions ({openRoles.length})
                </h2>
                <p className="text-sm text-white/55 mt-1">
                  Select a role below to review requirements and submit your
                  application.
                </p>
              </div>

              <div className="relative w-full lg:w-72">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  data-job-search="true"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search roles..."
                  className="w-full rounded-xl border border-white/15 bg-[#16181d] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-brand"
                />
              </div>
            </div>

            {/* Department filter */}
            <div className="flex flex-wrap gap-1.5 mb-8">
              {DEPARTMENTS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDept(d)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                    dept === d
                      ? "bg-brand text-white"
                      : "border border-white/15 bg-[#16181d] text-white/70 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Role list */}
            {openRoles.length > 0 ? (
              <div className="space-y-3.5">
                {openRoles.map((role) => (
                  <div
                    key={role.id}
                    className="rounded-2xl border border-white/10 bg-[#16181d] p-5 sm:p-6 transition hover:border-brand/50"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2.5">
                          <span className="rounded-md bg-brand/15 px-2.5 py-0.5 text-[11px] font-bold text-rose-300">
                            {role.department}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-white/70">
                            <MapPin className="h-3 w-3 text-brand" />{" "}
                            {role.location}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-white/70">
                            <Clock className="h-3 w-3 text-brand" /> {role.type}
                          </span>
                          {role.compensation && (
                            <span className="inline-flex items-center rounded-md bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                              {role.compensation}
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                          {role.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-white/65">
                          {role.summary}
                        </p>
                        {role.requirements && (
                          <p className="mt-2 text-xs leading-relaxed text-white/50">
                            <strong className="text-white/80">
                              Requirements:
                            </strong>{" "}
                            {role.requirements}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={() => openModal(role)}
                          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs font-bold text-ink transition hover:bg-cream cursor-pointer"
                        >
                          Apply Now <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-[#16181d] p-10 text-center">
                <Briefcase className="mx-auto h-8 w-8 text-white/30" />
                <p className="mt-3 font-display text-base font-bold text-white">
                  No matching open roles right now
                </p>
                <p className="mt-1 text-sm text-white/55">
                  Try another department or clear your search filter.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Clean Careers Footer */}
      <footer className="border-t border-white/10 bg-[#0b0c0e] py-8 text-white/55">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-4 text-xs sm:flex-row sm:px-6">
          <div className="font-semibold text-white/80">
            GAMAT <span className="text-brand">Fx</span> Careers ·
            jobs.gamatfxacademy.com
          </div>
          <div>
            © {new Date().getFullYear()} GAMAT Fx Academy. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Application Modal */}
      {selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/15 bg-[#16181d] p-6 sm:p-8 text-white shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedRole(null)}
              aria-label="Close modal"
              className="absolute right-5 top-5 rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {submittedRef ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
                <h3 className="mt-4 font-display text-xl font-bold text-white">
                  Application Received!
                </h3>
                <p className="mt-2 text-sm text-white/65 leading-relaxed">
                  Thank you for applying for{" "}
                  <strong className="text-white">{selectedRole.title}</strong>.
                  Our hiring team will review your profile and reach out via
                  email.
                </p>
                <div className="mt-4 inline-block rounded-xl border border-dashed border-brand/50 bg-brand/10 px-4 py-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/55 block">
                    Reference ID
                  </span>
                  <span className="font-display text-sm font-extrabold text-rose-300">
                    {submittedRef}
                  </span>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setSelectedRole(null)}
                    className="w-full rounded-full bg-white py-3 text-sm font-bold text-ink hover:bg-cream cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="inline-block rounded-md bg-brand/15 px-2.5 py-1 text-[11px] font-bold text-rose-300">
                  {selectedRole.department}
                </span>
                <h3 className="mt-2 font-display text-xl font-bold text-white pr-8">
                  Apply for {selectedRole.title}
                </h3>
                <p className="mt-1 text-xs text-white/55">
                  {selectedRole.location} · {selectedRole.type}
                </p>

                <form onSubmit={handleApply} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-white/70">
                      Full Name *
                    </label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-white/70">
                        Email Address *
                      </label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-white/70">
                        Phone / WhatsApp *
                      </label>
                      <input
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-white/70">
                        CV / Portfolio / LinkedIn URL
                      </label>
                      <input
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-white/70">
                        Years of Experience
                      </label>
                      <input
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="e.g. 3 years"
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-white/70">
                      Why GAMAT Fx &amp; Relevant Experience
                    </label>
                    <textarea
                      rows={4}
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      placeholder="Tell us about your background, track record, or links to work you're proud of..."
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-xs font-semibold text-rose-400">
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-bold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark cursor-pointer"
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
