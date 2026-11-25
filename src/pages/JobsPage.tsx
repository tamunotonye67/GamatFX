import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Clock,
  Code2,
  Headphones,
  MapPin,
  Megaphone,
  Menu,
  Palette,
  PenTool,
  Search,
  Send,
  TrendingUp,
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
import { slugifyRoleTitle } from "../lib/jobRoleGuides";
import Logo from "../components/Logo";
import RevolvingGlobe3D from "../components/RevolvingGlobe3D";

const DEPARTMENTS: Array<"All" | JobDepartment> = [
  "All",
  "Trading & Mentorship",
  "Content & Media",
  "Engineering & Product",
  "Operations & Support",
];

const SKILL_SUBCATEGORIES: Record<
  string,
  { title: string; subtitle: string; queryKeyword: string }[]
> = {
  "Dev & IT": [
    { title: "React & TypeScript Engineers", subtitle: "Dashboard & Web App", queryKeyword: "React" },
    { title: "MQL5 & EA Developers", subtitle: "MT5 Bots & Indicators", queryKeyword: "Engineer" },
    { title: "Supabase & API Engineers", subtitle: "Auth, Sync & Payments", queryKeyword: "Full-Stack" },
    { title: "Interactive Canvas Engineers", subtitle: "Chart & Whiteboard Tools", queryKeyword: "TypeScript" },
    { title: "QA & Reliability Engineers", subtitle: "Testing & Performance", queryKeyword: "Engineer" },
  ],
  Trading: [
    { title: "Senior FX Market Analysts", subtitle: "London & NY Sessions", queryKeyword: "Analyst" },
    { title: "1-on-1 Trading Mentors", subtitle: "Trade Journal Audits", queryKeyword: "Mentor" },
    { title: "Live Session Hosts", subtitle: "Order Flow & Liquidity", queryKeyword: "Live" },
    { title: "Prop & Risk Coaches", subtitle: "Drawdown & Scaling", queryKeyword: "Analyst" },
    { title: "Daily Outlook Strategists", subtitle: "Macro & HTF Bias", queryKeyword: "Forex" },
  ],
  Design: [
    { title: "Short-Form Video Editors", subtitle: "Reels, TikTok & Shorts", queryKeyword: "Video" },
    { title: "Motion & Remotion Designers", subtitle: "Product Walkthroughs", queryKeyword: "Motion" },
    { title: "UI / Product Designers", subtitle: "Trading Tools & UX", queryKeyword: "Designer" },
    { title: "Brand & Social Designers", subtitle: "Thumbnails & Visuals", queryKeyword: "Designer" },
    { title: "Event & Bootcamp Creatives", subtitle: "Flyers & Certificates", queryKeyword: "Designer" },
  ],
  Marketing: [
    { title: "Paid Ads & Funnel Specialists", subtitle: "Meta & YouTube Ads", queryKeyword: "" },
    { title: "Affiliate & Partner Managers", subtitle: "Creator & IB Growth", queryKeyword: "" },
    { title: "Email Broadcast Strategists", subtitle: "Retention & Launches", queryKeyword: "" },
    { title: "Social Media Managers", subtitle: "IG, X & YouTube", queryKeyword: "" },
    { title: "SEO & Growth Analysts", subtitle: "Organic Search Traffic", queryKeyword: "" },
  ],
  Admin: [
    { title: "Student Success Leads", subtitle: "Onboarding & Support", queryKeyword: "Student" },
    { title: "Community Moderators", subtitle: "Forum & Trading Floor", queryKeyword: "Community" },
    { title: "Event Ops Coordinators", subtitle: "Workshops & Check-Ins", queryKeyword: "Operations" },
    { title: "Billing & Enrollment Support", subtitle: "Invoices & Access", queryKeyword: "Support" },
    { title: "Executive Operations", subtitle: "Scheduling & Admin", queryKeyword: "Operations" },
  ],
  Writing: [
    { title: "Trading Curriculum Writers", subtitle: "Workbooks & Playbooks", queryKeyword: "" },
    { title: "Market News & Blog Editors", subtitle: "Daily FX Commentary", queryKeyword: "" },
    { title: "YouTube & Course Scriptwriters", subtitle: "Educational Scripts", queryKeyword: "" },
    { title: "Email & Launch Copywriters", subtitle: "Campaign Messaging", queryKeyword: "" },
    { title: "Quiz & Assessment Authors", subtitle: "Certification Tests", queryKeyword: "" },
  ],
};

export default function JobsPage() {
  const [roles, setRoles] = useState<JobRole[]>(() => loadJobRoles());
  const [dept, setDept] = useState<"All" | JobDepartment>("All");
  const [activeSkill, setActiveSkill] = useState<string>("");
  const [activeSubSkill, setActiveSubSkill] = useState<string>("");
  const [query, setQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);

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
      const heroEl = heroRef.current;
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        setScrolledPastHero(rect.bottom <= 24);
      } else {
        setScrolledPastHero(window.scrollY > window.innerHeight * 1.05);
      }
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
      {/* Transparent Minimal Sticky Bar shown only after scrolling past the red hero */}
      <div
        className={`fixed top-0 inset-x-0 z-40 bg-transparent transition-all duration-300 ${
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
            className="rounded-full bg-brand px-5 py-2 text-xs font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark cursor-pointer"
          >
            Explore roles
          </button>
        </div>
      </div>

      {/* Dark top header + framed brand-red hero */}
      <div ref={heroRef} className="bg-[#111215]">
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
          <section className="relative flex min-h-[81vh] sm:min-h-[108vh] flex-col items-start sm:items-center justify-center overflow-hidden rounded-t-[36px] sm:rounded-t-[64px] rounded-b-2xl bg-gradient-to-b from-brand via-[#c82d3d] to-[#a92230] px-5 py-20 sm:px-6 sm:py-36 text-left sm:text-center text-white shadow-2xl">
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

              <div className="mt-12 sm:mt-14 flex w-full justify-start sm:justify-center">
                <button
                  type="button"
                  onClick={() => scrollTo("roles")}
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl sm:rounded-full bg-white px-8 py-4 sm:py-3.5 text-sm font-bold text-ink shadow-lg transition hover:scale-[1.02] hover:bg-cream cursor-pointer"
                >
                  Start building with us
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Architectural Dark Continuation Section */}
      <div className="mx-auto max-w-[1440px] px-2 sm:px-3">
        <div className="border-x border-t border-dashed border-white/10">
          {/* Location Doesn't Matter + Dotted Globe */}
          <section
            id="culture"
            className="relative overflow-hidden px-4 pt-20 pb-16 sm:px-10 sm:pt-28 text-center"
          >
            <div className="mx-auto max-w-2xl">
              <h2 className="font-sans text-3xl font-medium tracking-tight text-white sm:text-5xl">
                Location Doesn’t Matter
              </h2>
              <p className="mt-4 text-sm text-white/65 sm:text-base">
                One connected trading &amp; education team — close to the markets,
                close to our students, anywhere in the world.
              </p>
            </div>

            {/* True 3D Revolving Globe (X/Y/Z axes) + Front-Overlaid Callout Box */}
            <div className="relative mx-auto mt-8 max-w-4xl">
              <style>{`
                @keyframes gamatCalloutFloat {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-6px); }
                }
              `}</style>
              <RevolvingGlobe3D />

              {/* Corner-bracketed dashed callout box floating in front (both mobile & desktop) */}
              <div
                style={{ animation: "gamatCalloutFloat 4.5s ease-in-out infinite" }}
                className="absolute right-2 bottom-10 z-20 max-w-[195px] border border-dashed border-brand/60 bg-[#13151a]/92 p-3 text-left shadow-xl backdrop-blur-xs sm:right-4 sm:bottom-auto sm:top-1/2 sm:max-w-[265px] sm:p-4 sm:-translate-y-1/2"
              >
                <span className="absolute -top-0.5 -left-0.5 h-2.5 w-2.5 border-t-2 border-l-2 border-brand" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 border-t-2 border-r-2 border-brand" />
                <span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 border-b-2 border-l-2 border-brand" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 border-b-2 border-r-2 border-brand" />
                <p className="text-[11px] sm:text-xs leading-relaxed font-medium text-rose-400">
                  Remote-first collaboration connects our mentors, engineers, and
                  creators across every trading session.
                </p>
              </div>
            </div>

            {/* 3-Column Architectural Grid with Corner Square Markers */}
            <div className="relative mx-auto -mt-8 sm:-mt-16 lg:-mt-24 max-w-5xl border border-white/10 bg-[#111215]/95 backdrop-blur-xs text-left">
              {/* 4 Corner Square Markers */}
              <span className="absolute -top-1 -left-1 h-2 w-2 border border-white/25 bg-[#111215]" />
              <span className="absolute -top-1 -right-1 h-2 w-2 border border-white/25 bg-[#111215]" />
              <span className="absolute -bottom-1 -left-1 h-2 w-2 border border-white/25 bg-[#111215]" />
              <span className="absolute -bottom-1 -right-1 h-2 w-2 border border-white/25 bg-[#111215]" />

              <div className="grid divide-y divide-white/10 md:grid-cols-3 md:divide-y-0 md:divide-x">
                {[
                  {
                    icon: Users,
                    title: "Work everywhere",
                    body: "Our team collaborates seamlessly across Lagos, London, and New York sessions with zero geographic barriers.",
                  },
                  {
                    icon: MapPin,
                    title: "Work from anywhere",
                    body: "A remote-first desk built around clear ownership, async workflows, and live market execution.",
                  },
                  {
                    icon: TrendingUp,
                    title: "Grow at massive scale",
                    body: "Direct impact on thousands of traders, live broadcasts, and institutional tools. No corporate bloat.",
                  },
                ].map((item) => (
                  <div key={item.title} className="p-7 sm:p-8">
                    <item.icon className="h-5 w-5 text-white/80" />
                    <h3 className="mt-4 font-sans text-base font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-white/55">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Centered Impact Statement below 3-column box */}
            <div className="mx-auto mt-16 sm:mt-24 max-w-5xl">
              <h2 className="font-sans text-[1.75rem] leading-tight font-medium tracking-tight text-white sm:text-5xl sm:whitespace-nowrap">
                GAMAT Fx needs your unique skills
              </h2>
              <p className="mt-4 text-sm text-white/65 sm:text-base">
                We love risks that brings profit, but we recognize potentials
              </p>
            </div>

            {/* Interactive Skill Category Strip (matches reference) */}
            <div className="mx-auto mt-10 max-w-5xl overflow-x-auto no-scrollbar">
              <div className="inline-flex min-w-full items-stretch justify-between border-b border-white/10">
                {[
                  { id: "Dev & IT", label: "Dev & IT", icon: Code2, mapDept: "Engineering & Product" as const },
                  { id: "Trading", label: "Trading & Analysis", icon: TrendingUp, mapDept: "Trading & Mentorship" as const },
                  { id: "Design", label: "Design & Creative", icon: Palette, mapDept: "Content & Media" as const },
                  { id: "Marketing", label: "Marketing", icon: Megaphone, mapDept: "Content & Media" as const },
                  { id: "Admin", label: "Admin & Support", icon: Headphones, mapDept: "Operations & Support" as const },
                  { id: "Writing", label: "Writing & Content", icon: PenTool, mapDept: "Content & Media" as const },
                ].map((tab) => {
                  const isActive = activeSkill === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        if (isActive) {
                          setActiveSkill("");
                          setActiveSubSkill("");
                          setDept("All");
                        } else {
                          setActiveSkill(tab.id);
                          setActiveSubSkill(SKILL_SUBCATEGORIES[tab.id]?.[0]?.title || "");
                          setDept(tab.mapDept);
                        }
                      }}
                      className={`group relative flex min-w-[116px] flex-1 flex-col items-center gap-2.5 px-3 pb-4 pt-2 transition cursor-pointer ${
                        isActive ? "text-white" : "text-white/55 hover:text-white/85"
                      }`}
                    >
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                          isActive
                            ? "border-brand/70 bg-gradient-to-br from-brand/35 to-rose-400/20 text-white shadow-md shadow-brand/20"
                            : "border-white/15 bg-white/[0.03] text-white/65 group-hover:border-white/30 group-hover:text-white"
                        }`}
                      >
                        <tab.icon className="h-4 w-4" />
                      </span>
                      <span className="whitespace-nowrap text-xs font-medium">
                        {tab.label}
                      </span>
                      {isActive && (
                        <span className="absolute bottom-0 inset-x-0 h-[2.5px] rounded-full bg-brand" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subcategories Grid shown when a skill category is selected (matches reference) */}
            {activeSkill && SKILL_SUBCATEGORIES[activeSkill] && (
              <div className="mx-auto mt-6 max-w-5xl grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 text-left">
                {SKILL_SUBCATEGORIES[activeSkill].map((sub) => {
                  const selected = activeSubSkill === sub.title;
                  return (
                    <button
                      key={sub.title}
                      type="button"
                      onClick={() => {
                        setActiveSubSkill(sub.title);
                        navigate(`/jobs/${slugifyRoleTitle(sub.title)}`);
                      }}
                      className={`rounded-xl border p-4 transition cursor-pointer flex flex-col justify-between min-h-[104px] ${
                        selected
                          ? "border-brand bg-[#181a20] shadow-md shadow-brand/15"
                          : "border-white/10 bg-[#15171c] hover:border-white/25 hover:bg-[#181a20]"
                      }`}
                    >
                      <span className="font-sans text-[13.5px] font-semibold leading-snug text-white">
                        {sub.title}
                      </span>
                      <span className="mt-3 text-[11.5px] font-medium text-white/50">
                        {sub.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
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
