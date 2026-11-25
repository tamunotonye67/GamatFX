import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  ChevronsUpDown,
  Code2,
  Headphones,
  HelpCircle,
  MapPin,
  Megaphone,
  Menu,
  Palette,
  PenTool,
  Search,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { navigate } from "../lib/router";
import { slugifyRoleTitle } from "../lib/jobRoleGuides";
import { useStore } from "../lib/store";
import Logo from "../components/Logo";
import RevolvingGlobe3D from "../components/RevolvingGlobe3D";

const SKILL_CATEGORIES = [
  { id: "Dev & IT", label: "Dev & IT", icon: Code2 },
  { id: "Trading", label: "Trading & Analysis", icon: TrendingUp },
  { id: "Design", label: "Design & Creative", icon: Palette },
  { id: "Marketing", label: "Marketing", icon: Megaphone },
  { id: "Admin", label: "Admin & Support", icon: Headphones },
  { id: "Writing", label: "Writing & Content", icon: PenTool },
];

const SKILL_SUBCATEGORIES: Record<
  string,
  { title: string; subtitle: string }[]
> = {
  "Dev & IT": [
    { title: "React & TypeScript Engineers", subtitle: "Dashboard & Web App" },
    { title: "MQL5 & EA Developers", subtitle: "MT5 Bots & Indicators" },
    { title: "Supabase & API Engineers", subtitle: "Auth, Sync & Payments" },
    { title: "Interactive Canvas Engineers", subtitle: "Chart & Whiteboard Tools" },
    { title: "QA & Reliability Engineers", subtitle: "Testing & Performance" },
  ],
  Trading: [
    { title: "Senior FX Market Analysts", subtitle: "London & NY Sessions" },
    { title: "1-on-1 Trading Mentors", subtitle: "Trade Journal Audits" },
    { title: "Live Session Hosts", subtitle: "Order Flow & Liquidity" },
    { title: "Prop & Risk Coaches", subtitle: "Drawdown & Scaling" },
    { title: "Daily Outlook Strategists", subtitle: "Macro & HTF Bias" },
  ],
  Design: [
    { title: "Short-Form Video Editors", subtitle: "Reels, TikTok & Shorts" },
    { title: "Motion & Remotion Designers", subtitle: "Product Walkthroughs" },
    { title: "UI / Product Designers", subtitle: "Trading Tools & UX" },
    { title: "Brand & Social Designers", subtitle: "Thumbnails & Visuals" },
    { title: "Event & Bootcamp Creatives", subtitle: "Flyers & Certificates" },
  ],
  Marketing: [
    { title: "Paid Ads & Funnel Specialists", subtitle: "Meta & YouTube Ads" },
    { title: "Affiliate & Partner Managers", subtitle: "Creator & IB Growth" },
    { title: "Email Broadcast Strategists", subtitle: "Retention & Launches" },
    { title: "Social Media Managers", subtitle: "IG, X & YouTube" },
    { title: "SEO & Growth Analysts", subtitle: "Organic Search Traffic" },
  ],
  Admin: [
    { title: "Student Success Leads", subtitle: "Onboarding & Support" },
    { title: "Community Moderators", subtitle: "Forum & Trading Floor" },
    { title: "Event Ops Coordinators", subtitle: "Workshops & Check-Ins" },
    { title: "Billing & Enrollment Support", subtitle: "Invoices & Access" },
    { title: "Executive Operations", subtitle: "Scheduling & Admin" },
  ],
  Writing: [
    { title: "Trading Curriculum Writers", subtitle: "Workbooks & Playbooks" },
    { title: "Market News & Blog Editors", subtitle: "Daily FX Commentary" },
    { title: "YouTube & Course Scriptwriters", subtitle: "Educational Scripts" },
    { title: "Email & Launch Copywriters", subtitle: "Campaign Messaging" },
    { title: "Quiz & Assessment Authors", subtitle: "Certification Tests" },
  ],
};

type FlyoutMenu = "roles" | "why" | null;

export default function JobsPage() {
  const { user } = useStore();
  const [activeSkill, setActiveSkill] = useState<string>("");
  const [activeSubSkill, setActiveSubSkill] = useState<string>("");
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFlyout, setOpenFlyout] = useState<FlyoutMenu>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const navWrapRef = useRef<HTMLDivElement | null>(null);

  const goToMainRoute = (path: string) => {
    const clean = path.startsWith("/") ? path : `/${path}`;
    if (
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
    ) {
      navigate(clean);
    } else {
      window.location.href = `https://gamatfxacademy.com/#${clean}`;
    }
  };

  const handleExploreOpportunities = () => {
    setOpenFlyout(null);
    setMobileMenuOpen(false);
    if (!user) {
      navigate("/jobs/opportunities");
      return;
    }
    navigate("/jobs/opportunities");
  };

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

  // Close flyout on Escape or outside click
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenFlyout(null);
    };
    const onClickOutside = (e: MouseEvent) => {
      if (navWrapRef.current && !navWrapRef.current.contains(e.target as Node)) {
        setOpenFlyout(null);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

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
            onClick={handleExploreOpportunities}
            className="rounded-full bg-brand px-5 py-2 text-xs font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark cursor-pointer"
          >
            Explore opportunities
          </button>
        </div>
      </div>

      {/* Dark top header + framed brand-red hero */}
      <div ref={heroRef} className="bg-[#111215]">
        <div ref={navWrapRef} className="relative z-40">
          <header className="mx-auto flex min-h-[84px] w-full max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
            {/* Left: Logo */}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="cursor-pointer shrink-0"
            >
              <Logo variant="light" size="md" asDiv />
            </button>

            {/* Center: 4 Navigation Menus with Flyouts */}
            <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-white/90">
              {/* 1. Roles (with 6-col Mega Flyout) */}
              <button
                type="button"
                onClick={() =>
                  setOpenFlyout(openFlyout === "roles" ? null : "roles")
                }
                className={`inline-flex items-center gap-1.5 transition cursor-pointer ${
                  openFlyout === "roles"
                    ? "text-white"
                    : "text-white/85 hover:text-white"
                }`}
              >
                <span>Roles</span>
                <ChevronsUpDown className="h-3.5 w-3.5 text-white/50" />
              </button>

              {/* 2. Explore Opportunities (no flyout — opens dedicated gated page) */}
              <button
                type="button"
                onClick={handleExploreOpportunities}
                className="text-white/85 hover:text-white transition cursor-pointer"
              >
                Explore opportunities
              </button>

              {/* 3. Why GAMAT? (with Flyout) */}
              <button
                type="button"
                onClick={() =>
                  setOpenFlyout(openFlyout === "why" ? null : "why")
                }
                className={`inline-flex items-center gap-1.5 transition cursor-pointer ${
                  openFlyout === "why"
                    ? "text-white"
                    : "text-white/85 hover:text-white"
                }`}
              >
                <span>Why GAMAT?</span>
                <ChevronsUpDown className="h-3.5 w-3.5 text-white/50" />
              </button>

              {/* 4. Back to Site (no flyout) */}
              <button
                type="button"
                onClick={() => {
                  setOpenFlyout(null);
                  goToMainRoute("/");
                }}
                className="text-white/85 hover:text-white transition cursor-pointer"
              >
                Back to Site
              </button>
            </nav>

            {/* Desktop Right Controls */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToMainRoute("/faq")}
                className="inline-flex items-center gap-1.5 mr-1 text-[13px] font-medium text-rose-400 hover:text-rose-300 transition cursor-pointer"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>FAQ?</span>
              </button>
              <button
                type="button"
                onClick={() => goToMainRoute(user ? "/dashboard" : "/signup")}
                className="rounded-full border border-white/20 bg-white/[0.04] px-4 py-1.5 text-[13px] font-medium text-white/95 transition hover:bg-white/10 cursor-pointer"
              >
                {user ? "Dashboard" : "Login"}
              </button>
              <button
                type="button"
                onClick={() => goToMainRoute("/contact")}
                className="rounded-full border border-white/20 bg-white/[0.04] px-4 py-1.5 text-[13px] font-medium text-white/95 transition hover:bg-white/10 cursor-pointer"
              >
                Contact Founder
              </button>
              <button
                type="button"
                onClick={() => scrollTo("skills")}
                aria-label="Explore roles"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-white/85 transition hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Mobile Right Controls (Login/Dashboard + Search + Hamburger) */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => goToMainRoute(user ? "/dashboard" : "/signup")}
                className="rounded-full border border-white/20 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 cursor-pointer"
              >
                {user ? "Dashboard" : "Login"}
              </button>
              <button
                type="button"
                onClick={() => scrollTo("skills")}
                aria-label="Explore roles"
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10 cursor-pointer"
              >
                <Search className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10 cursor-pointer"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </header>

          {/* ======================== Desktop Flyout Panels ======================== */}
          {openFlyout === "roles" && (
            <div className="hidden lg:block absolute left-0 right-0 top-full z-50 mt-2 px-6">
              <div className="mx-auto max-w-[1400px] overflow-hidden rounded-2xl border border-white/15 bg-[#121317] shadow-2xl">
                <div className="grid grid-cols-6 divide-x divide-white/10">
                  {SKILL_CATEGORIES.map((cat) => (
                    <div key={cat.id} className="p-6 xl:p-7">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45 mb-5">
                        {cat.label}
                      </p>
                      <div className="space-y-5">
                        {(SKILL_SUBCATEGORIES[cat.id] || []).map((sub) => (
                          <button
                            key={sub.title}
                            type="button"
                            onClick={() => {
                              setOpenFlyout(null);
                              navigate(`/jobs/${slugifyRoleTitle(sub.title)}`);
                            }}
                            className="block w-full text-left group cursor-pointer"
                          >
                            <div className="text-[13px] font-semibold text-white group-hover:text-brand transition leading-snug">
                              {sub.title}
                            </div>
                            <div className="text-[11.5px] text-white/50 mt-1 leading-snug">
                              {sub.subtitle}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-white/10 bg-[#0e0f12] px-7 py-4 text-xs text-white/60">
                  <span>All roles start as flexible remote Volunteer Fellowships</span>
                  <button
                    type="button"
                    onClick={handleExploreOpportunities}
                    className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-brand transition cursor-pointer"
                  >
                    Explore open opportunities <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {openFlyout === "why" && (
            <div className="hidden lg:block absolute left-0 right-0 top-full z-50 mt-2 px-6">
              <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/15 bg-[#121317] shadow-2xl">
                <div className="grid grid-cols-3 divide-x divide-white/10">
                  <div className="p-7 space-y-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
                      Our Culture
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenFlyout(null);
                        scrollTo("culture");
                      }}
                      className="block w-full text-left group cursor-pointer"
                    >
                      <div className="text-[13.5px] font-semibold text-white group-hover:text-brand transition">
                        Location Doesn’t Matter
                      </div>
                      <div className="text-xs text-white/50 mt-1 leading-relaxed">
                        Remote-first desk across Lagos, London &amp; NY sessions
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenFlyout(null);
                        scrollTo("skills");
                      }}
                      className="block w-full text-left group cursor-pointer"
                    >
                      <div className="text-[13.5px] font-semibold text-white group-hover:text-brand transition">
                        High Ownership &amp; Speed
                      </div>
                      <div className="text-xs text-white/50 mt-1 leading-relaxed">
                        Ship real work without corporate red tape
                      </div>
                    </button>
                  </div>

                  <div className="p-7 space-y-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
                      Volunteering &amp; Growth
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenFlyout(null);
                        navigate("/jobs/react-and-typescript-engineers");
                      }}
                      className="block w-full text-left group cursor-pointer"
                    >
                      <div className="text-[13.5px] font-semibold text-white group-hover:text-brand transition">
                        Academy &amp; Mentorship Perks
                      </div>
                      <div className="text-xs text-white/50 mt-1 leading-relaxed">
                        Complimentary access to courses &amp; live sessions
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenFlyout(null);
                        navigate("/jobs/senior-fx-market-analysts");
                      }}
                      className="block w-full text-left group cursor-pointer"
                    >
                      <div className="text-[13.5px] font-semibold text-white group-hover:text-brand transition">
                        Path to Paid Roles
                      </div>
                      <div className="text-xs text-white/50 mt-1 leading-relaxed">
                        Top volunteers get priority when paid seats open
                      </div>
                    </button>
                  </div>

                  <div className="p-7 space-y-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
                      Learn About GAMAT Fx
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenFlyout(null);
                        navigate("/jobs/team");
                      }}
                      className="block w-full text-left group cursor-pointer"
                    >
                      <div className="text-[13.5px] font-semibold text-white group-hover:text-brand transition">
                        Meet the Team
                      </div>
                      <div className="text-xs text-white/50 mt-1 leading-relaxed">
                        Explore profiles &amp; portfolios of our mentors and builders
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenFlyout(null);
                        goToMainRoute("/about");
                      }}
                      className="block w-full text-left group cursor-pointer"
                    >
                      <div className="text-[13.5px] font-semibold text-white group-hover:text-brand transition inline-flex items-center gap-1">
                        About the Academy <ArrowUpRight className="h-3 w-3" />
                      </div>
                      <div className="text-xs text-white/50 mt-1 leading-relaxed">
                        Our story training 1,000+ disciplined traders
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenFlyout(null);
                        goToMainRoute("/how-it-works");
                      }}
                      className="block w-full text-left group cursor-pointer"
                    >
                      <div className="text-[13.5px] font-semibold text-white group-hover:text-brand transition inline-flex items-center gap-1">
                        How GAMAT Fx Works <ArrowUpRight className="h-3 w-3" />
                      </div>
                      <div className="text-xs text-white/50 mt-1 leading-relaxed">
                        See the full student &amp; mentor ecosystem
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Full-Viewport Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex flex-col bg-[#111215] text-white lg:hidden">
            <div className="flex min-h-[84px] items-center justify-between border-b border-white/10 px-4 py-4">
              <Logo variant="light" size="md" asDiv />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col justify-between overflow-y-auto px-6 py-8">
              <div className="space-y-3">
                {[
                  { label: "Roles & Volunteer Tracks", action: () => scrollTo("skills") },
                  { label: "Explore Opportunities", action: handleExploreOpportunities },
                  { label: "Why GAMAT?", action: () => scrollTo("culture") },
                  { label: "Meet the Team", action: () => navigate("/jobs/team") },
                  { label: "Back to Site", action: () => goToMainRoute("/") },
                  { label: "FAQ?", action: () => goToMainRoute("/faq") },
                  { label: "Contact Founder", action: () => goToMainRoute("/contact") },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      item.action();
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-left text-base font-semibold text-white transition hover:border-brand/50 hover:bg-white/[0.06] cursor-pointer"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="h-4 w-4 text-white/50" />
                  </button>
                ))}
              </div>

              <div className="pt-8 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    goToMainRoute(user ? "/dashboard" : "/signup");
                  }}
                  className="w-full rounded-full bg-brand py-4 text-sm font-bold text-white shadow-lg shadow-brand/30 cursor-pointer"
                >
                  {user ? "Go to Dashboard" : "Login / Create GAMAT Account"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Framed Top-Rounded Brand-Red Hero Card */}
        <div className="w-full px-2 sm:px-3 pb-0">
          <section className="relative flex min-h-0 sm:min-h-[108vh] flex-col items-start sm:items-center justify-start sm:justify-center overflow-hidden rounded-t-[36px] sm:rounded-t-[64px] rounded-b-2xl bg-gradient-to-b from-brand via-[#c82d3d] to-[#a92230] px-5 pt-24 pb-10 sm:px-6 sm:py-36 text-left sm:text-center text-white shadow-2xl">
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
              <h1 className="pr-16 sm:pr-0 font-sans text-[2.2rem] leading-[1.1] font-bold sm:font-medium tracking-tight text-white sm:text-5xl lg:text-[3.2rem] lg:leading-[1.15]">
                Want to be a part of something more
                <br className="hidden sm:inline" /> fulfilling than trading? Then, let’s work!
              </h1>
              <p className="mt-5 pr-12 sm:pr-0 max-w-xl text-base leading-relaxed text-white/90 sm:mx-auto sm:text-base">
                Join our remote-first team of market analysts, educators,
                creators, and engineers powering trading education for 1,000+
                students worldwide.
              </p>

              <div className="mt-12 sm:mt-14 flex w-full justify-start sm:justify-center">
                <button
                  type="button"
                  onClick={() => scrollTo("skills")}
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
      <div className="mt-12 sm:mt-2 w-full">
        <div
          aria-hidden="true"
          className="h-[2px] w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, rgba(255,255,255,0.22) 0 14px, transparent 14px 24px)",
          }}
        />
        <div className="mx-auto max-w-[1440px] px-2 sm:px-3">
          <div className="relative">
            {/* Left & Right matching vertical dashed lines (hidden on mobile) */}
            <div
              aria-hidden="true"
              className="pointer-events-none hidden md:block absolute top-0 bottom-0 left-0 w-[2px]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, rgba(255,255,255,0.22) 0 14px, transparent 14px 24px)",
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none hidden md:block absolute top-0 bottom-0 right-0 w-[2px]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, rgba(255,255,255,0.22) 0 14px, transparent 14px 24px)",
              }}
            />

            {/* Location Doesn't Matter + True 3D Revolving Globe */}
            <section
              id="culture"
              className="relative overflow-hidden px-4 pt-20 pb-20 sm:px-10 sm:pt-28 text-center"
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
              <div id="skills" className="mx-auto mt-16 sm:mt-24 max-w-5xl scroll-mt-20">
                <h2 className="font-sans text-[1.75rem] leading-tight font-medium tracking-tight text-white sm:text-5xl sm:whitespace-nowrap">
                  GAMAT Fx needs your unique skills
                </h2>
                <p className="mt-4 text-sm text-white/65 sm:text-base">
                  We love risks that brings profit, but we recognize potentials
                </p>
              </div>

              {/* Interactive Skill Category Strip */}
              <div className="mx-auto mt-10 max-w-5xl overflow-x-auto no-scrollbar">
                <div className="inline-flex min-w-full items-stretch justify-between border-b border-white/10">
                  {SKILL_CATEGORIES.map((tab) => {
                    const isActive = activeSkill === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          if (isActive) {
                            setActiveSkill("");
                            setActiveSubSkill("");
                          } else {
                            setActiveSkill(tab.id);
                            setActiveSubSkill(
                              SKILL_SUBCATEGORIES[tab.id]?.[0]?.title || ""
                            );
                          }
                        }}
                        className={`group relative flex min-w-[116px] flex-1 flex-col items-center gap-2.5 px-3 pb-4 pt-2 transition cursor-pointer ${
                          isActive
                            ? "text-white"
                            : "text-white/55 hover:text-white/85"
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

              {/* Subcategories Grid shown when a skill category is selected */}
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

              {/* Why should you join us? Split Comparison Section */}
              <div className="mx-auto mt-24 sm:mt-32 max-w-5xl">
                <style>{`
                  @keyframes gamatNoiseFloatA {
                    0%, 100% { transform: translate3d(0px, 0px, 0); }
                    50% { transform: translate3d(10px, -12px, 0); }
                  }
                  @keyframes gamatNoiseFloatB {
                    0%, 100% { transform: translate3d(0px, 0px, 0); }
                    50% { transform: translate3d(-12px, 10px, 0); }
                  }
                  @keyframes gamatNoiseScroll {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-18px); }
                    100% { transform: translateY(0px); }
                  }
                `}</style>

                <h2 className="font-sans text-3xl font-medium tracking-tight text-white sm:text-5xl">
                  Why should you join us?
                </h2>
                <p className="mt-4 text-sm text-white/65 sm:text-base">
                  Everything needed to{" "}
                  <span className="inline-block rounded-md border border-brand/30 bg-brand/15 px-2.5 py-0.5 text-rose-400 font-medium">
                    build real skills, ship live work, and grow fast
                  </span>
                </p>

                {/* 2-Column Architectural Split Box */}
                <div className="relative mt-10 border border-white/10 bg-[#111215] text-left">
                  {/* Corner square markers */}
                  <span className="absolute -top-1 -left-1 z-20 h-2 w-2 border border-white/25 bg-[#111215]" />
                  <span className="absolute -top-1 -right-1 z-20 h-2 w-2 border border-white/25 bg-[#111215]" />
                  <span className="absolute -bottom-1 -left-1 z-20 h-2 w-2 border border-white/25 bg-[#111215]" />
                  <span className="absolute -bottom-1 -right-1 z-20 h-2 w-2 border border-white/25 bg-[#111215]" />

                  <div className="grid md:grid-cols-2">
                    {/* Left Half: Dynamic Non-Static Chaos / Solo Grind */}
                    <div className="relative min-h-[380px] sm:min-h-[430px] overflow-hidden border-b md:border-b-0 md:border-r border-white/10 bg-[#111215] p-6 sm:p-10 flex flex-col items-center">
                      {/* Dotted waveform background */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-1/2 h-40 -translate-y-1/2 opacity-25"
                        style={{
                          backgroundImage:
                            "radial-gradient(#dc3545 1px, transparent 1px)",
                          backgroundSize: "7px 7px",
                          maskImage:
                            "linear-gradient(to bottom, transparent, black 45%, transparent)",
                          WebkitMaskImage:
                            "linear-gradient(to bottom, transparent, black 45%, transparent)",
                        }}
                      />

                      <h3 className="relative z-10 text-center font-sans text-2xl sm:text-3xl font-medium tracking-tight text-white">
                        Grinding alone
                        <br />
                        “solo”
                      </h3>

                      {/* Animated drifting status / friction cards */}
                      <div className="relative mt-6 h-[240px] w-full max-w-[390px]">
                        {/* Card 1 */}
                        <div
                          style={{ animation: "gamatNoiseFloatA 5.5s ease-in-out infinite" }}
                          className="absolute right-1 top-0 z-10 rounded-xl border border-amber-400/35 bg-[#181a20]/95 px-3.5 py-2 shadow-xl"
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                            ⚠ STATUS: UNRESOLVED
                          </span>
                        </div>

                        {/* Card 2 */}
                        <div
                          style={{ animation: "gamatNoiseFloatB 6.2s ease-in-out infinite" }}
                          className="absolute left-0 top-10 z-20 max-w-[250px] rounded-xl border border-white/15 bg-[#17191f]/95 p-3 shadow-2xl"
                        >
                          <p className="text-[11px] leading-relaxed text-white/75">
                            “Watched 40+ tutorials this month — still zero
                            real-world feedback on my work.”
                          </p>
                        </div>

                        {/* Card 3 */}
                        <div
                          style={{ animation: "gamatNoiseScroll 4.8s ease-in-out infinite" }}
                          className="absolute right-0 top-24 z-30 max-w-[235px] rounded-xl border border-brand/45 bg-[#1a1518]/95 p-3.5 shadow-2xl"
                        >
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400">
                            <span className="rounded bg-brand/25 px-1.5 py-0.5">P0</span>
                            <span>NO PRODUCTION PROOF</span>
                          </div>
                          <p className="mt-1.5 text-[11px] leading-snug text-white/80">
                            Applying everywhere without live projects, mentor
                            audits, or team velocity.
                          </p>
                        </div>

                        {/* Card 4 */}
                        <div
                          style={{ animation: "gamatNoiseFloatA 6.8s ease-in-out infinite" }}
                          className="absolute left-2 bottom-2 z-20 max-w-[250px] rounded-xl border border-white/15 bg-[#17191f]/95 p-3 shadow-2xl"
                        >
                          <p className="text-[11px] leading-relaxed text-white/70">
                            “No structured desk, no mentorship, and no clear
                            growth path.”
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Half: Solid Brand-Red Calm Clarity */}
                    <div className="relative min-h-[380px] sm:min-h-[430px] overflow-hidden bg-gradient-to-b from-brand to-[#b81d2c] p-6 sm:p-10 flex flex-col items-center justify-between text-center">
                      {/* Dotted center horizon line */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dotted border-white/35"
                      />

                      <h3 className="relative z-10 font-sans text-2xl sm:text-3xl font-medium tracking-tight text-white">
                        Building with
                        <br />
                        GAMAT Fx
                      </h3>

                      <div className="relative z-10 my-auto">
                        <div className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-lg backdrop-blur-xs">
                          <span>✓</span>
                          <span>Real projects, live mentorship &amp; growth</span>
                        </div>
                      </div>

                      <div className="relative z-10 text-xs font-medium text-white/80">
                        Verified Fellowship · Direct Team Impact
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
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
    </div>
  );
}
