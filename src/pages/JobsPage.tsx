import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  ChevronLeft,
  ChevronRight,
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

const JOIN_US_PHRASES = [
  "build real skills, ship live work, and grow fast",
  "learn with mentors, earn verified proof, and stand out",
  "collaborate globally across LDN and NY desks",
  "turn volunteer impact into real career momentum",
];

const BUILDING_PILL_ITEMS = [
  { target: 120, suffix: "+", text: "Live projects & tools shipped" },
  { target: 45, suffix: "+", text: "Global mentors & builders" },
  { target: 100, suffix: "%", text: "Verified fellowship growth" },
  { target: 24, suffix: "/7", text: "Async collaboration & support" },
];

export default function JobsPage() {
  const { user, logout } = useStore();
  const [activeSkill, setActiveSkill] = useState<string>("");
  const [activeSubSkill, setActiveSubSkill] = useState<string>("");
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<"roles" | "why" | null>(null);
  const [mobileRoleCat, setMobileRoleCat] = useState<string | null>("Dev & IT");
  const [openFlyout, setOpenFlyout] = useState<FlyoutMenu>(null);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [typedCount, setTypedCount] = useState(JOIN_US_PHRASES[0].length);
  const [typePhase, setTypePhase] = useState<"settled" | "deleting" | "typing">("settled");
  const [pillIdx, setPillIdx] = useState(0);
  const [pillCount, setPillCount] = useState(BUILDING_PILL_ITEMS[0].target);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const navWrapRef = useRef<HTMLDivElement | null>(null);
  const globeOrbitRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const target = BUILDING_PILL_ITEMS[pillIdx].target;
    let rafId = 0;
    const duration = 900;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setPillCount(Math.round(target * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    setPillCount(0);
    rafId = requestAnimationFrame(step);

    const cycleId = window.setTimeout(() => {
      setPillIdx((prev) => (prev + 1) % BUILDING_PILL_ITEMS.length);
    }, 3200);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(cycleId);
    };
  }, [pillIdx]);

  useEffect(() => {
    const current = JOIN_US_PHRASES[phraseIdx];
    let timeoutId = 0;

    if (typePhase === "settled") {
      timeoutId = window.setTimeout(() => {
        setTypePhase("deleting");
      }, 2200);
    } else if (typePhase === "deleting") {
      if (typedCount > 0) {
        timeoutId = window.setTimeout(() => {
          setTypedCount((c) => c - 1);
        }, 22);
      } else {
        setPhraseIdx((idx) => (idx + 1) % JOIN_US_PHRASES.length);
        setTypePhase("typing");
      }
    } else if (typePhase === "typing") {
      if (typedCount < current.length) {
        timeoutId = window.setTimeout(() => {
          setTypedCount((c) => c + 1);
        }, 42);
      } else {
        timeoutId = window.setTimeout(() => {
          setTypePhase("settled");
        }, 400);
      }
    }

    return () => window.clearTimeout(timeoutId);
  }, [phraseIdx, typedCount, typePhase]);

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
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 70);
  };

  return (
    <div className="min-h-screen bg-[#111215] text-white selection:bg-brand selection:text-white">
      {/* Transparent Minimal Sticky Bar shown only on desktop after scrolling past the red hero */}
      <div
        className={`hidden lg:block fixed top-0 inset-x-0 z-40 bg-transparent transition-all duration-300 ${
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
                onClick={() => navigate("/jobs/faq")}
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
                onClick={() => {
                  setMobileMenuOpen(false);
                  setMobileSection(null);
                  setMobileRoleCat(null);
                }}
                aria-label="Close navigation menu"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative flex flex-1 flex-col justify-between overflow-y-auto px-5 py-6">
              <div className="space-y-3">
                {/* 1. Roles -> opens left flyout */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileRoleCat(null);
                    setMobileSection("roles");
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-left text-base font-semibold text-white transition hover:border-brand/50 hover:bg-white/[0.06] cursor-pointer"
                >
                  <span>Roles</span>
                  <ChevronRight className="h-4 w-4 text-white/60" />
                </button>

                {/* 2. Explore Opportunities (direct link, no arrow) */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileSection(null);
                    setMobileRoleCat(null);
                    handleExploreOpportunities();
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-left text-base font-semibold text-white transition hover:border-brand/50 hover:bg-white/[0.06] cursor-pointer"
                >
                  <span>Explore Opportunities</span>
                </button>

                {/* 3. Why GAMAT? -> opens left flyout */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileRoleCat(null);
                    setMobileSection("why");
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-left text-base font-semibold text-white transition hover:border-brand/50 hover:bg-white/[0.06] cursor-pointer"
                >
                  <span>Why GAMAT?</span>
                  <ChevronRight className="h-4 w-4 text-white/60" />
                </button>

                {/* 4. Direct links: Back to Site, FAQ?, Contact Founder (no arrows) */}
                {[
                  { label: "Back to Site", action: () => goToMainRoute("/") },
                  { label: "FAQ?", action: () => navigate("/jobs/faq") },
                  {
                    label: "Contact Founder",
                    action: () => goToMainRoute("/contact"),
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileSection(null);
                      setMobileRoleCat(null);
                      item.action();
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-left text-base font-semibold text-white transition hover:border-brand/50 hover:bg-white/[0.06] cursor-pointer"
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-8 space-y-3">
                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setMobileSection(null);
                        setMobileRoleCat(null);
                        goToMainRoute("/dashboard");
                      }}
                      className="w-full rounded-full bg-brand py-4 text-sm font-bold text-white shadow-lg shadow-brand/30 cursor-pointer"
                    >
                      Go to Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                        setMobileSection(null);
                        setMobileRoleCat(null);
                      }}
                      className="w-full rounded-full border border-white/20 bg-white/[0.04] py-3.5 text-sm font-semibold text-white/90 hover:bg-white/10 transition cursor-pointer"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setMobileSection(null);
                        setMobileRoleCat(null);
                        goToMainRoute("/login");
                      }}
                      className="w-full rounded-full bg-brand py-4 text-sm font-bold text-white shadow-lg shadow-brand/30 cursor-pointer"
                    >
                      Log in
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setMobileSection(null);
                        setMobileRoleCat(null);
                        goToMainRoute("/signup");
                      }}
                      className="w-full rounded-full border border-white/20 bg-white/[0.04] py-3.5 text-sm font-semibold text-white/90 hover:bg-white/10 transition cursor-pointer"
                    >
                      Create GAMAT Account
                    </button>
                  </>
                )}
              </div>

              {/* Left Flyout Panel (Roles / Why GAMAT?) */}
              {mobileSection && (
                <div className="fixed inset-0 top-[84px] z-10 flex">
                  <div className="relative z-10 flex h-full w-[86%] max-w-sm flex-col border-r border-white/15 bg-[#0d0e11] shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileRoleCat(null);
                          setMobileSection(null);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wider text-white/75 hover:bg-white/10 hover:text-white cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back</span>
                      </button>
                      <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                        {mobileSection === "roles" ? "Roles" : "Why GAMAT?"}
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                      {mobileSection === "roles" ? (
                        <>
                          {SKILL_CATEGORIES.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setMobileRoleCat(cat.id)}
                              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left text-sm font-semibold text-white/90 hover:border-brand/50 hover:bg-white/[0.06] cursor-pointer"
                            >
                              <span>{cat.label}</span>
                              <ChevronRight className="h-4 w-4 text-white/55" />
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setMobileSection(null);
                              setMobileRoleCat(null);
                              scrollTo("skills");
                            }}
                            className="mt-2 flex w-full items-center rounded-xl bg-white/[0.04] px-4 py-3 text-left text-xs font-semibold text-rose-400 hover:bg-white/[0.08] cursor-pointer"
                          >
                            <span>View all skill tracks on page</span>
                          </button>
                        </>
                      ) : (
                        [
                          {
                            label: "Remote-First Culture",
                            action: () => scrollTo("culture"),
                          },
                          {
                            label: "Why Should You Join Us?",
                            action: () => scrollTo("skills"),
                          },
                          {
                            label: "Meet the Team",
                            action: () => navigate("/jobs/team"),
                          },
                          {
                            label: "About the Academy",
                            action: () => goToMainRoute("/about"),
                          },
                          {
                            label: "How GAMAT Fx Works",
                            action: () => goToMainRoute("/how-it-works"),
                          },
                        ].map((sub) => (
                          <button
                            key={sub.label}
                            type="button"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setMobileSection(null);
                              setMobileRoleCat(null);
                              sub.action();
                            }}
                            className="flex w-full items-center rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left text-sm font-semibold text-white/90 hover:border-brand/50 hover:bg-white/[0.06] cursor-pointer"
                          >
                            <span>{sub.label}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label="Close submenu"
                    onClick={() => {
                      setMobileRoleCat(null);
                      setMobileSection(null);
                    }}
                    className="flex-1 bg-black/55 backdrop-blur-[1px]"
                  />

                  {/* Nested Left Flyout for Selected Role Category */}
                  {mobileSection === "roles" && mobileRoleCat && (
                    <div className="fixed inset-0 top-[84px] z-20 flex">
                      <div className="relative z-10 flex h-full w-[80%] max-w-[320px] flex-col border-r border-white/15 bg-[#15171c] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => setMobileRoleCat(null)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wider text-white/75 hover:bg-white/10 hover:text-white cursor-pointer"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span>Roles</span>
                          </button>
                          <span className="truncate pl-2 text-xs font-bold uppercase tracking-wider text-white/50">
                            {SKILL_CATEGORIES.find((c) => c.id === mobileRoleCat)?.label ?? mobileRoleCat}
                          </span>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                          {(SKILL_SUBCATEGORIES[mobileRoleCat] || []).map((sub) => (
                            <button
                              key={sub.title}
                              type="button"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setMobileSection(null);
                                setMobileRoleCat(null);
                                navigate(`/jobs/${slugifyRoleTitle(sub.title)}`);
                              }}
                              className="flex w-full items-center rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left text-sm font-medium text-white/90 hover:border-brand/50 hover:bg-white/[0.06] cursor-pointer"
                            >
                              <span>{sub.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        aria-label="Back to Roles"
                        onClick={() => setMobileRoleCat(null)}
                        className="flex-1 bg-black/55 backdrop-blur-[1px]"
                      />
                    </div>
                  )}
                </div>
              )}
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

            <div className="relative z-10 w-full sm:mx-auto max-w-5xl">
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
              className="relative overflow-hidden px-4 pt-20 pb-10 sm:px-10 sm:pt-28 sm:pb-12 text-center"
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

              {/* True 3D Revolving Globe (X/Y/Z axes) + 2 Orbiting Callout Boxes */}
              <div className="relative mx-auto mt-8 max-w-4xl">
                <RevolvingGlobe3D orbitRefs={globeOrbitRefs} />

                {[
                  "Remote-first collaboration connects our mentors, engineers, and creators across every trading session.",
                  "Build anywhere. Ship from Lagos, LDN & NY.",
                ].map((copy, idx) => (
                  <div
                    key={copy}
                    ref={(el) => {
                      globeOrbitRefs.current[idx] = el;
                    }}
                    className="pointer-events-none absolute w-[185px] sm:w-[250px] border border-dashed border-brand/60 bg-[#13151a]/92 p-3 text-left shadow-xl backdrop-blur-xs sm:p-4 transition-opacity duration-75"
                  >
                    <span className="absolute -top-0.5 -left-0.5 h-2.5 w-2.5 border-t-2 border-l-2 border-brand" />
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 border-t-2 border-r-2 border-brand" />
                    <span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 border-b-2 border-l-2 border-brand" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 border-b-2 border-r-2 border-brand" />
                    <p className="text-[11px] sm:text-xs leading-relaxed font-medium text-rose-400">
                      {copy}
                    </p>
                  </div>
                ))}
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
                  @keyframes gamatSoloStream {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0%); }
                  }
                  @keyframes gamatPopStack {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-7px) scale(1.035); }
                  }
                  .gamat-solo-track-fast {
                    display: flex;
                    width: max-content;
                    animation: gamatSoloStream 28s linear infinite;
                  }
                  .gamat-solo-track-turbo {
                    display: flex;
                    width: max-content;
                    animation: gamatSoloStream 24s linear infinite;
                  }
                  .gamat-solo-track-mid {
                    display: flex;
                    width: max-content;
                    animation: gamatSoloStream 34s linear infinite;
                  }
                `}</style>

                <h2 className="font-sans text-3xl font-medium tracking-tight text-white sm:text-5xl">
                  Why should you join us?
                </h2>
                <p className="mt-4 min-h-[32px] text-sm text-white/65 sm:text-base">
                  Everything needed to{" "}
                  <span
                    className={`inline-flex items-center transition-all duration-200 ${
                      typePhase === "settled"
                        ? "text-white/65 font-normal"
                        : "rounded-md border border-brand/30 bg-brand/15 px-2.5 py-0.5 text-rose-400 font-medium"
                    }`}
                  >
                    <span>
                      {JOIN_US_PHRASES[phraseIdx].slice(0, typedCount)}
                    </span>
                    {typePhase !== "settled" && (
                      <span
                        aria-hidden="true"
                        className="ml-0.5 inline-block h-4 w-[1.5px] animate-pulse bg-rose-400"
                      />
                    )}
                  </span>
                </p>

                {/* 2-Column Architectural Split Box */}
                <div className="relative mt-10 border border-white/10 bg-[#111215] text-left">
                  {/* Corner square markers */}
                  <span className="absolute -top-1 -left-1 z-30 h-2 w-2 border border-white/25 bg-[#111215]" />
                  <span className="absolute -top-1 -right-1 z-30 h-2 w-2 border border-white/25 bg-[#111215]" />
                  <span className="absolute -bottom-1 -left-1 z-30 h-2 w-2 border border-white/25 bg-[#111215]" />
                  <span className="absolute -bottom-1 -right-1 z-30 h-2 w-2 border border-white/25 bg-[#111215]" />

                  <div className="grid md:grid-cols-2">
                    {/* Left Half: Fast Left-to-Right Motion Streams disappearing under the Red Right Half */}
                    <div className="relative min-h-[300px] md:min-h-[450px] overflow-hidden border-b md:border-b-0 md:border-r border-white/10 bg-[#111215] pt-7 pb-5 md:pt-10 md:pb-10 flex flex-col justify-between">
                      {/* Dotted waveform background */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-1/2 h-48 -translate-y-1/2 opacity-25"
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

                      <h3 className="relative z-10 px-6 text-center font-sans text-4xl sm:text-5xl font-medium leading-[1.08] tracking-tight text-white">
                        Grinding alone
                        <br />
                        “solo”
                      </h3>

                      {/* Layered stack of sharp message cards overlapping & popping up while flowing left-to-right */}
                      <div className="relative z-10 mt-6 h-[225px] overflow-hidden">
                        {/* Right-edge fade just before vanishing under the red half */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-y-0 right-0 z-40 w-10 bg-gradient-to-l from-[#111215]/70 to-transparent"
                        />

                        {/* Layer 1 (Back layer) */}
                        <div className="absolute inset-x-0 top-2 z-10 overflow-hidden py-2">
                          <div className="gamat-solo-track-fast">
                            {[0, 1].map((dup) => (
                              <div key={dup} className="flex shrink-0 items-center -space-x-6 pr-2">
                                <div
                                  style={{ animation: "gamatPopStack 3.4s ease-in-out infinite" }}
                                  className="relative z-10 border border-amber-400/40 bg-[#181a20] px-3.5 py-2 shadow-2xl whitespace-nowrap"
                                >
                                  <span className="absolute -bottom-1.5 left-3 h-2.5 w-2.5 rotate-45 border-b border-r border-amber-400/40 bg-[#181a20]" />
                                  <span className="relative text-[10px] font-bold uppercase tracking-wider text-amber-300">
                                    ⚠ STATUS: UNRESOLVED
                                  </span>
                                </div>

                                <div
                                  style={{ animation: "gamatPopStack 4.0s ease-in-out 0.8s infinite" }}
                                  className="relative z-20 w-[225px] border border-white/25 bg-[#17191f] px-3.5 py-2.5 shadow-2xl"
                                >
                                  <p className="text-[11px] leading-snug text-white/85">
                                    “Watched 40+ tutorials — zero real-world feedback.”
                                  </p>
                                </div>

                                <div
                                  style={{ animation: "gamatPopStack 3.8s ease-in-out 1.5s infinite" }}
                                  className="relative z-10 border border-brand/60 bg-[#1a1518] px-3.5 py-2 shadow-2xl whitespace-nowrap"
                                >
                                  <span className="text-[10px] font-bold text-rose-400">
                                    P0 · NO PRODUCTION PROOF
                                  </span>
                                </div>

                                <div
                                  style={{ animation: "gamatPopStack 4.2s ease-in-out 2.1s infinite" }}
                                  className="relative z-20 w-[215px] border border-white/25 bg-[#17191f] px-3.5 py-2.5 shadow-2xl"
                                >
                                  <span className="absolute -bottom-1.5 left-4 h-2.5 w-2.5 rotate-45 border-b border-r border-white/25 bg-[#17191f]" />
                                  <p className="relative text-[11px] leading-snug text-white/85">
                                    “No live desk, no mentor audits.”
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Layer 2 (Middle overlapping layer) */}
                        <div className="absolute inset-x-0 top-[56px] z-20 overflow-hidden py-2">
                          <div className="gamat-solo-track-turbo">
                            {[0, 1].map((dup) => (
                              <div key={dup} className="flex shrink-0 items-center -space-x-6 pr-2">
                                <div
                                  style={{ animation: "gamatPopStack 3.6s ease-in-out 0.4s infinite" }}
                                  className="relative z-30 w-[240px] border border-brand/55 bg-[#1a1518] p-3 shadow-2xl"
                                >
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400">
                                    <span className="bg-brand/25 px-1.5 py-0.5">P0</span>
                                    <span>PORTFOLIO GAP</span>
                                  </div>
                                  <p className="mt-1 text-[11px] leading-snug text-white/85">
                                    Applying everywhere with zero live shipped projects.
                                  </p>
                                </div>

                                <div
                                  style={{ animation: "gamatPopStack 4.1s ease-in-out 1.2s infinite" }}
                                  className="relative z-20 w-[215px] border border-white/25 bg-[#17191f] p-3 shadow-2xl"
                                >
                                  <span className="absolute -bottom-1.5 right-5 h-2.5 w-2.5 rotate-45 border-b border-r border-white/25 bg-[#17191f]" />
                                  <div className="text-[9px] font-bold uppercase tracking-wider text-white/40 mb-1">
                                    DM · UNANSWERED
                                  </div>
                                  <p className="relative text-[11px] leading-snug text-white/85">
                                    “Stuck in demo loops without team accountability.”
                                  </p>
                                </div>

                                <div
                                  style={{ animation: "gamatPopStack 3.5s ease-in-out 1.9s infinite" }}
                                  className="relative z-30 border border-rose-400/45 bg-[#1c1418] px-3.5 py-2.5 shadow-2xl whitespace-nowrap"
                                >
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                                    ✖ NO VERIFIED CERTIFICATE
                                  </span>
                                </div>

                                <div
                                  style={{ animation: "gamatPopStack 4.3s ease-in-out 0.6s infinite" }}
                                  className="relative z-10 w-[225px] border border-white/25 bg-[#17191f] p-3 shadow-2xl"
                                >
                                  <p className="text-[11px] leading-snug text-white/85">
                                    “Building alone with nobody reviewing my trades or PRs.”
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Layer 3 (Front popping layer) */}
                        <div className="absolute inset-x-0 top-[116px] z-30 overflow-hidden py-2">
                          <div className="gamat-solo-track-mid">
                            {[0, 1].map((dup) => (
                              <div key={dup} className="flex shrink-0 items-center -space-x-6 pr-2">
                                <div
                                  style={{ animation: "gamatPopStack 3.9s ease-in-out 0.2s infinite" }}
                                  className="relative z-20 w-[230px] border border-white/25 bg-[#17191f] px-3.5 py-2.5 shadow-2xl"
                                >
                                  <p className="text-[11px] leading-snug text-white/85">
                                    “No structured desk, no mentorship, no clear growth path.”
                                  </p>
                                </div>

                                <div
                                  style={{ animation: "gamatPopStack 3.5s ease-in-out 1.1s infinite" }}
                                  className="relative z-30 border border-amber-400/45 bg-[#181a20] px-3.5 py-2 shadow-2xl whitespace-nowrap"
                                >
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                                    ⏳ WAITING FOR AN OPPORTUNITY
                                  </span>
                                </div>

                                <div
                                  style={{ animation: "gamatPopStack 4.2s ease-in-out 1.8s infinite" }}
                                  className="relative z-10 w-[220px] border border-brand/50 bg-[#1a1518] px-3.5 py-2.5 shadow-2xl"
                                >
                                  <span className="absolute -bottom-1.5 left-4 h-2.5 w-2.5 rotate-45 border-b border-r border-brand/50 bg-[#1a1518]" />
                                  <p className="relative text-[11px] leading-snug text-white/85">
                                    “Missed cohorts because I had no network.”
                                  </p>
                                </div>

                                <div
                                  style={{ animation: "gamatPopStack 3.7s ease-in-out 2.4s infinite" }}
                                  className="relative z-30 border border-white/25 bg-[#17191f] px-3.5 py-2 shadow-2xl whitespace-nowrap"
                                >
                                  <span className="text-[10px] font-semibold text-white/75">
                                    0 TEAM VELOCITY
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Half: Solid Brand-Red Calm Clarity */}
                    <div className="relative z-20 min-h-[300px] md:min-h-[450px] overflow-hidden bg-gradient-to-b from-brand to-[#b81d2c] px-5 py-7 md:p-10 flex flex-col items-center justify-between text-center">
                      {/* Dotted center horizon line */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dotted border-white/35"
                      />

                      <h3 className="relative z-10 font-sans text-4xl sm:text-5xl font-medium leading-[1.08] tracking-tight text-white">
                        Building with
                        <br />
                        GAMAT Fx
                      </h3>

                      {/* Centered Pill sitting directly on the dotted horizon line */}
                      <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-[calc(100%-2.5rem)] max-w-max -translate-x-1/2 -translate-y-1/2">
                        <div className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/35 bg-[#c62233]/95 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-xl backdrop-blur-xs">
                          <span className="inline-flex items-center rounded-lg bg-white/20 px-2 py-0.5 font-mono text-xs sm:text-sm font-extrabold tabular-nums text-white">
                            {pillCount}
                            {BUILDING_PILL_ITEMS[pillIdx].suffix}
                          </span>
                          <span className="truncate">
                            {BUILDING_PILL_ITEMS[pillIdx].text}
                          </span>
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

            {/* Two evenly spaced horizontal dashed lines joining left & right vertical dashed rails */}
            <div
              aria-hidden="true"
              className="flex flex-col justify-evenly pt-2 pb-8 sm:pt-3 sm:pb-10 gap-16 sm:gap-24"
            >
              <div
                className="h-[2px] w-full"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(to right, rgba(255,255,255,0.22) 0 14px, transparent 14px 24px)",
                }}
              />
              <div
                className="h-[2px] w-full"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(to right, rgba(255,255,255,0.22) 0 14px, transparent 14px 24px)",
                }}
              />
            </div>

      {/* Build without boundaries CTA Banner */}
      <section className="w-full px-3 pb-10 pt-2 sm:px-6 sm:pb-14">
        <style>{`
          @keyframes gamatTickerScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .gamat-ticker-track {
            display: flex;
            width: max-content;
            animation: gamatTickerScroll 34s linear infinite;
          }
          .gamat-ticker-track:hover {
            animation-play-state: paused;
          }
          @keyframes gamatTileBob {
            0%, 100% { translate: 0 0; }
            50% { translate: 0 -6px; }
          }
        `}</style>
        <div
          className="relative overflow-hidden rounded-2xl border border-white/15 shadow-2xl sm:rounded-3xl"
          style={{
            background:
              "linear-gradient(135deg, #dc3545 0%, #c82d3d 52%, #a92230 100%)",
          }}
        >
          {/* Dot-matrix texture */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.65) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />

          {/* Warm bottom-center glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 left-1/2 h-64 w-[520px] -translate-x-1/2 rounded-full bg-amber-300/25 blur-3xl"
          />

          {/* Left floating tilted icon tiles */}
          <div
            aria-hidden="true"
            style={{ animation: "gamatTileBob 4.2s ease-in-out infinite" }}
            className="pointer-events-none absolute left-6 top-10 hidden h-14 w-14 -rotate-12 items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-white shadow-lg backdrop-blur-md md:flex lg:left-14"
          >
            <Code2 className="h-6 w-6" />
          </div>
          <div
            aria-hidden="true"
            style={{ animation: "gamatTileBob 4.8s ease-in-out 0.6s infinite" }}
            className="pointer-events-none absolute left-16 top-1/2 hidden h-12 w-12 -translate-y-1/2 rotate-6 items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-white shadow-lg backdrop-blur-md md:flex lg:left-32"
          >
            <TrendingUp className="h-5 w-5" />
          </div>
          <div
            aria-hidden="true"
            style={{ animation: "gamatTileBob 4.5s ease-in-out 1.2s infinite" }}
            className="pointer-events-none absolute bottom-20 left-8 hidden h-13 w-13 rotate-12 items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-white shadow-lg backdrop-blur-md md:flex lg:left-20"
          >
            <BarChart3 className="h-5 w-5" />
          </div>

          {/* Right floating tilted icon tiles */}
          <div
            aria-hidden="true"
            style={{ animation: "gamatTileBob 4.6s ease-in-out 0.3s infinite" }}
            className="pointer-events-none absolute right-6 top-10 hidden h-14 w-14 rotate-12 items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-white shadow-lg backdrop-blur-md md:flex lg:right-14"
          >
            <Briefcase className="h-6 w-6" />
          </div>
          <div
            aria-hidden="true"
            style={{ animation: "gamatTileBob 5s ease-in-out 0.9s infinite" }}
            className="pointer-events-none absolute right-16 top-1/2 hidden h-12 w-12 -translate-y-1/2 -rotate-6 items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-white shadow-lg backdrop-blur-md md:flex lg:right-32"
          >
            <Users className="h-5 w-5" />
          </div>
          <div
            aria-hidden="true"
            style={{ animation: "gamatTileBob 4.3s ease-in-out 1.5s infinite" }}
            className="pointer-events-none absolute bottom-20 right-8 hidden h-13 w-13 -rotate-12 items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-white shadow-lg backdrop-blur-md md:flex lg:right-20"
          >
            <PenTool className="h-5 w-5" />
          </div>

          {/* Centered CTA Content */}
          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-6 pb-14 pt-16 text-center sm:px-10 sm:pb-16 sm:pt-20">
            <h2 className="font-sans text-3xl font-medium tracking-tight text-white sm:text-5xl">
              Build without boundaries
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
              Join volunteers, analysts, and builders contributing globally with
              GAMAT Fx. Start your fellowship today — zero barriers, real
              execution.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleExploreOpportunities}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#111215] shadow-lg transition hover:bg-white/90 active:scale-[0.99]"
              >
                Explore opportunities
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/jobs/team")}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-[0.99]"
              >
                Meet the team
              </button>
            </div>
          </div>

          {/* Bottom horizontal ticker bar */}
          <div className="relative z-10 overflow-hidden border-t border-white/15 bg-black/15 py-3.5 backdrop-blur-sm">
            <div className="gamat-ticker-track">
              {[0, 1].map((dupIdx) => (
                <div
                  key={dupIdx}
                  className="flex shrink-0 items-center gap-8 pr-8 text-xs font-medium text-white/85 sm:gap-12 sm:pr-12"
                >
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-white/75" />
                    Remote-first across all sessions
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-white/75" />
                    Direct mentor &amp; team feedback
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-white/75" />
                    Verified experience certificates
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-white/75" />
                    Complimentary academy &amp; course access
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Megaphone className="h-3.5 w-3.5 text-white/75" />
                    Priority path to paid roles
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Headphones className="h-3.5 w-3.5 text-white/75" />
                    Live desk collaboration
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Palette className="h-3.5 w-3.5 text-white/75" />
                    Real portfolio deliverables
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Structured Dark Careers Footer */}
      <footer className="bg-[#0b0c0e]/70 text-white/75">
        <div className="px-5 py-12 sm:px-8 sm:py-16">
          {/* 4-column link grid (offset on desktop like reference) */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-2 md:grid-cols-4 lg:pl-48">
              {/* Row 1 */}
              <div>
                <h3 className="text-xs font-medium text-white/45">
                  Getting started
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li>
                    <button
                      type="button"
                      onClick={handleExploreOpportunities}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Explore opportunities
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => goToMainRoute("/signup")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Create GAMAT account
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => goToMainRoute("/login")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Member login
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollTo("skills")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Browse role tracks
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => goToMainRoute("/contact")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Contact founder
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-medium text-white/45">
                  Fellowship
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate("/jobs/team")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Meet the team
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate("/jobs/culture")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Remote-first culture
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate("/jobs/certificates")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Experience certificates
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => goToMainRoute("/learn")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Academy access
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate("/jobs/certificates")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Path to paid roles
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-medium text-white/45">Resources</h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li>
                    <button
                      type="button"
                      onClick={() => goToMainRoute("/outlook")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Market outlook
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => goToMainRoute("/learn")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Learning center
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => goToMainRoute("/blog")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Blog &amp; insights
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => goToMainRoute("/forum")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Community forum
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => goToMainRoute("/news")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Market news
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-medium text-white/45">
                  Role tracks
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/jobs/${slugifyRoleTitle("Senior FX Market Analysts")}`
                        )
                      }
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Research &amp; Analysis
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/jobs/${slugifyRoleTitle("React & TypeScript Engineers")}`
                        )
                      }
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Engineering &amp; Web
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/jobs/${slugifyRoleTitle("Short-Form Video Editors")}`
                        )
                      }
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Design &amp; Media
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/jobs/${slugifyRoleTitle("Social Media Managers")}`
                        )
                      }
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Community &amp; Growth
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/jobs/${slugifyRoleTitle("Student Success Leads")}`
                        )
                      }
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Operations &amp; Support
                    </button>
                  </li>
                </ul>
              </div>

              {/* Row 2 */}
              <div>
                <h3 className="text-xs font-medium text-white/45">Academy</h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li>
                    <button
                      type="button"
                      onClick={() => goToMainRoute("/")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Back to main site
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => goToMainRoute("/mentor")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Mentorship
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => goToMainRoute("/store")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Academy store
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => goToMainRoute("/gallery")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Gallery
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-medium text-white/45">
                  Standards
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate("/jobs/guidelines")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Volunteer guidelines
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate("/jobs/conduct")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Code of conduct
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => goToMainRoute("/verify-certificate")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Verify certificate
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate("/jobs/report")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Report an issue
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-medium text-white/45">Builders</h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/jobs/${slugifyRoleTitle("React & TypeScript Engineers")}`
                        )
                      }
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Role guides
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate("/jobs/team")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Team directory
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => goToMainRoute("/whiteboard")}
                      className="text-left text-white/85 transition hover:text-white cursor-pointer"
                    >
                      Whiteboard desk
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Matching dashed horizontal divider + bottom legal bar */}
          <div
            aria-hidden="true"
            className="h-[2px] w-full"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to right, rgba(255,255,255,0.22) 0 14px, transparent 14px 24px)",
            }}
          />
          <div className="px-5 py-5 sm:px-8">
            <div className="flex flex-col items-start justify-between gap-3 text-xs text-white/45 sm:flex-row sm:items-center">
              <div>
                © {new Date().getFullYear()} GAMAT Fx Academy. All rights
                reserved.
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <button
                  type="button"
                  onClick={() => goToMainRoute("/privacy")}
                  className="font-medium text-white/80 transition hover:text-white cursor-pointer"
                >
                  Privacy policy
                </button>
                <span aria-hidden="true" className="text-white/25">
                  |
                </span>
                <button
                  type="button"
                  onClick={() => navigate("/jobs/report")}
                  className="transition hover:text-white cursor-pointer"
                >
                  Report an issue
                </button>
                <span aria-hidden="true" className="text-white/25">
                  |
                </span>
                <button
                  type="button"
                  onClick={() => goToMainRoute("/terms")}
                  className="transition hover:text-white cursor-pointer"
                >
                  Terms of use
                </button>
              </div>
            </div>
          </div>
      </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
