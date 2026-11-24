import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Globe2,
  MapPin,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
  Zap,
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

const DEPARTMENTS: Array<"All" | JobDepartment> = [
  "All",
  "Trading & Mentorship",
  "Content & Media",
  "Engineering & Product",
  "Operations & Support",
];

const HIRING_STEPS = [
  {
    step: "01",
    title: "Application Review",
    desc: "We read every submission personally—focusing on proof of work, clarity, and real execution.",
  },
  {
    step: "02",
    title: "15-Min Intro Call",
    desc: "A quick conversation to align on mission, working style, and what success looks like in the role.",
  },
  {
    step: "03",
    title: "Practical Assessment",
    desc: "A short, role-specific task (chart breakdown, edit sample, or code/ops scenario)—never unpaid busywork.",
  },
  {
    step: "04",
    title: "Final Offer & Onboarding",
    desc: "Meet leadership, align on compensation & milestones, and step straight into the team.",
  },
];

export default function JobsPage() {
  const [roles, setRoles] = useState<JobRole[]>(() => loadJobRoles());
  const [dept, setDept] = useState<"All" | JobDepartment>("All");
  const [query, setQuery] = useState("");
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
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

  const filteredRoles = useMemo(() => {
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

  const deptCounts = useMemo(() => {
    const map: Record<string, number> = { All: allOpenRoles.length };
    for (const r of allOpenRoles) {
      map[r.department] = (map[r.department] || 0) + 1;
    }
    return map;
  }, [allOpenRoles]);

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

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0b0d11] text-white selection:bg-brand selection:text-white">
      {/* Dedicated Careers Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0d11]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand font-display text-sm font-black text-white shadow-md shadow-brand/30">
              G
            </span>
            <span className="font-display text-base font-extrabold tracking-tight text-white">
              GAMAT <span className="text-brand">Fx</span>
            </span>
            <span className="hidden sm:inline-flex items-center rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/70">
              Careers
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-white/70">
            <button
              type="button"
              onClick={() => scrollToSection("roles")}
              className="hover:text-white transition cursor-pointer"
            >
              Open Roles ({allOpenRoles.length})
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("culture")}
              className="hover:text-white transition cursor-pointer"
            >
              Why GAMAT Fx
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("process")}
              className="hover:text-white transition cursor-pointer"
            >
              Hiring Process
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://gamatfxacademy.com"
              onClick={(e) => {
                if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
                  e.preventDefault();
                  navigate("/");
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:border-white/30 hover:bg-white/10"
            >
              Academy Site <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={() => scrollToSection("roles")}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-brand/25 transition hover:bg-brand-dark cursor-pointer"
            >
              View Roles <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Dark Executive Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        {/* Ambient glows & subtle grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 right-0 h-[520px] w-[520px] rounded-full bg-brand/20 blur-[130px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-20 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px]"
        />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                We’re Hiring · {allOpenRoles.length} Open Roles
              </div>

              <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
                Build the infrastructure behind{" "}
                <span className="bg-gradient-to-r from-brand via-rose-400 to-amber-300 bg-clip-text text-transparent">
                  disciplined traders.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
                At GAMAT Fx, we’re replacing trading guesswork with institutional
                education, live market desks, and real software tools. Join a
                high-ownership team shaping how thousands of traders learn and
                execute.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => scrollToSection("roles")}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark cursor-pointer"
                >
                  Explore Open Roles <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("process")}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10 cursor-pointer"
                >
                  How We Hire
                </button>
              </div>
            </div>

            {/* Right: Live Company Snapshot Card */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-white/50">
                  Team Snapshot
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  Remote-First · Global
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3.5">
                {[
                  { label: "Traders Impacted", value: "1,000+" },
                  { label: "Open Positions", value: String(allOpenRoles.length) },
                  { label: "Departments", value: "4 Teams" },
                  { label: "Avg. Review Time", value: "48 hrs" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-[#12151c] p-4"
                  >
                    <p className="font-display text-2xl font-extrabold text-white">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-white/55">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#12151c] p-3.5 text-xs text-white/75">
                <Globe2 className="h-4 w-4 shrink-0 text-brand" />
                <span>
                  Lagos · London · Remote worldwide across major FX sessions.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Roles Section */}
      <section id="roles" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Open Positions
            </span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">
              Find your seat on the desk
            </h2>
          </div>

          {/* Search box */}
          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search role, skill, or location..."
              className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-brand"
            />
          </div>
        </div>

        {/* Department Pills */}
        <div className="mt-6 flex flex-wrap gap-2">
          {DEPARTMENTS.map((d) => {
            const active = dept === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDept(d)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                  active
                    ? "bg-brand text-white shadow-md shadow-brand/25"
                    : "border border-white/10 bg-white/[0.04] text-white/70 hover:border-white/25 hover:text-white"
                }`}
              >
                <span>{d}</span>
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                    active ? "bg-white/20 text-white" : "bg-white/10 text-white/60"
                  }`}
                >
                  {deptCounts[d] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Job Cards */}
        <div className="mt-8 space-y-3.5">
          {filteredRoles.length > 0 ? (
            filteredRoles.map((role) => {
              const isExpanded = expandedRoleId === role.id;
              return (
                <div
                  key={role.id}
                  className="group rounded-2xl border border-white/10 bg-[#12151c] p-5 sm:p-6 transition hover:border-brand/50 hover:bg-[#151922]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                        <span className="rounded-md bg-brand/15 px-2.5 py-1 text-rose-300">
                          {role.department}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2.5 py-1 text-white/70">
                          <MapPin className="h-3 w-3 text-white/50" />
                          {role.location}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2.5 py-1 text-white/70">
                          <Clock className="h-3 w-3 text-white/50" />
                          {role.type}
                        </span>
                        {role.compensation && (
                          <span className="rounded-md bg-emerald-500/15 px-2.5 py-1 text-emerald-300">
                            {role.compensation}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 font-display text-lg font-bold text-white sm:text-xl">
                        {role.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/65">
                        {role.summary}
                      </p>

                      {role.requirements && isExpanded && (
                        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-relaxed text-white/75">
                          <span className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1">
                            What We’re Looking For
                          </span>
                          {role.requirements}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      {role.requirements && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedRoleId(isExpanded ? null : role.id)
                          }
                          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white/80 transition hover:bg-white/10 cursor-pointer"
                        >
                          {isExpanded ? "Hide Details" : "Role Details"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openModal(role)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand/25 transition hover:bg-brand-dark cursor-pointer"
                      >
                        Apply Now <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[#12151c] p-12 text-center">
              <Briefcase className="mx-auto h-8 w-8 text-white/30" />
              <p className="mt-3 font-display text-base font-bold text-white">
                No matching roles found
              </p>
              <p className="mt-1 text-sm text-white/55">
                Try clearing your search or selecting a different department.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Why GAMAT Fx */}
      <section
        id="culture"
        className="border-y border-white/10 bg-[#0f1218] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Why GAMAT Fx
            </span>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">
              High standards, zero corporate bloat
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-base">
              We operate like a lean trading desk—clear metrics, direct
              communication, and real autonomy.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Zap,
                title: "Fast Execution",
                desc: "Ship ideas in days, not quarters. No endless approval layers.",
              },
              {
                icon: Users,
                title: "Remote-First Flexibility",
                desc: "Work from anywhere with async clarity around key market sessions.",
              },
              {
                icon: TrendingUp,
                title: "Performance Upside",
                desc: "Competitive base pay paired with clear performance-linked bonuses.",
              },
              {
                icon: ShieldCheck,
                title: "Real Impact",
                desc: "Every lesson, tool, and audit directly helps traders protect and grow capital.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-[#141821] p-5"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-white/60 sm:text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hiring Process */}
      <section id="process" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-400">
            Transparent Process
          </span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">
            From application to offer in days
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HIRING_STEPS.map((s) => (
            <div
              key={s.step}
              className="relative rounded-2xl border border-white/10 bg-[#12151c] p-6"
            >
              <span className="font-display text-3xl font-black text-white/10">
                {s.step}
              </span>
              <h3 className="mt-3 font-display text-base font-bold text-white">
                {s.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-white/60 sm:text-sm">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Clean Careers Footer */}
      <footer className="border-t border-white/10 bg-[#080a0d] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs text-white/50 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-white/80">
              GAMAT <span className="text-brand">Fx</span> Careers
            </span>
            <span>·</span>
            <span>jobs.gamatfxacademy.com</span>
          </div>
          <div>
            © {new Date().getFullYear()} GAMAT Fx Academy. Equal-opportunity team.
          </div>
        </div>
      </footer>

      {/* Application Modal */}
      {selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/15 bg-[#12151c] p-6 sm:p-8 text-white shadow-2xl">
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
                  Our hiring team reviews every application within 48 hours.
                </p>
                <div className="mt-4 inline-block rounded-xl border border-dashed border-brand/50 bg-brand/10 px-4 py-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-white/50">
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
                    className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white hover:bg-brand-dark transition cursor-pointer"
                  >
                    Back to Open Roles
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="inline-block rounded-md bg-brand/15 px-2.5 py-1 text-[11px] font-bold text-rose-300">
                  {selectedRole.department}
                </span>
                <h3 className="mt-3 font-display text-xl font-bold text-white pr-8">
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
                      Why GAMAT Fx &amp; Proof of Work
                    </label>
                    <textarea
                      rows={4}
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      placeholder="Share your background, track record, or links to work you're proud of..."
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
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark cursor-pointer"
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
