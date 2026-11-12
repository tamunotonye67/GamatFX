import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Users,
  Star,
  MessagesSquare,
  Gamepad2,
  Zap,
  Crown,
  LineChart,
  Swords,
  MessageCircle,
  Gift,
  Newspaper,
  Sun,
  HelpCircle,
  FileText,
  ShieldCheck,
  MailOpen,
  LogIn,
  UserPlus,
  History,
  Shield,
  Award,
  Pencil,
  ShoppingBag,
  LayoutDashboard,
  BookOpen,
  LogOut,
  Home,
  Info,
  GraduationCap,
  Briefcase,
  Calendar,
  Phone,
  Send,
} from "lucide-react";
import Logo from "./Logo";
import TopCouponBar from "./TopCouponBar";
import { navigate, useRoute, type Route } from "../lib/router";
import { useStore } from "../lib/store";
import { useNavbarForcedSolid } from "../lib/chrome";
import { CONTACT } from "../lib/contact";

type NavLink = { label: string; to: Route; icon?: React.ElementType; badge?: string };

/** Primary links shown inline on desktop and in mobile menu. */
const primary: (NavLink & { icon: React.ElementType })[] = [
  { label: "Home", to: "/", icon: Home },
  { label: "About Us", to: "/about", icon: Info },
  { label: "Courses", to: "/courses", icon: GraduationCap, badge: "Popular" },
  { label: "Services", to: "/services", icon: Briefcase },
  { label: "Events", to: "/events", icon: Calendar },
];

/** 4 sub-games nested under Fun Zone */
export const funZoneSubGames = [
  { label: "Quiz Arcade", to: "/fun/quiz", icon: Zap, desc: "Unlimited forex trivia" },
  { label: "Forex Millionaire", to: "/fun/millionaire", icon: Crown, desc: "Climb the ₦10M prize ladder" },
  { label: "Live Chart Game", to: "/fun/live-chart", icon: LineChart, desc: "Watch price move in real time" },
  { label: "Market Combat", to: "/fun/market-combat", icon: Swords, desc: "Predict up or down & climb ranks" },
];

/** Grouped links inside the "More" dropdown. */
const moreGroups: { title: string; items: (NavLink & { icon: React.ElementType; desc: string })[] }[] = [
  {
    title: "Explore",
    items: [
      { label: "Trading Whiteboard", to: "/whiteboard", icon: Pencil, desc: "Interactive technical analysis & teaching canvas" },
      { label: "Store & Trading Tools", to: "/store", icon: ShoppingBag, desc: "Books, AI bots, indicators & strategies" },
      { label: "Community", to: "/community", icon: Users, desc: "Join 2,000+ traders on Telegram" },
      { label: "Reviews", to: "/reviews", icon: Star, desc: "What our students say" },
      { label: "FAQ", to: "/faq", icon: HelpCircle, desc: "Answers to common questions" },
      { label: "Contact", to: "/contact", icon: MailOpen, desc: "Talk to our team" },
    ],
  },
  {
    title: "Fun & Trivia",
    items: [
      { label: "Fun Zone", to: "/fun", icon: Gamepad2, desc: "Four in one game" },
      { label: "Student Forum", to: "/forum", icon: MessagesSquare, desc: "Meet students & ask questions" },
      { label: "Student of the Week", to: "/fun/student-of-the-week", icon: Award, desc: "Student spotlight & wall of fame" },
      { label: "Histofact Cards", to: "/fun/histofact", icon: History, desc: "Card flips on forex & crypto history" },
      { label: "Club Builder", to: "/fun/clubs", icon: Shield, desc: "Join and build a family of traders" },
    ],
  },
  {
    title: "Updates",
    items: [
      { label: "Blog", to: "/blog", icon: Newspaper, desc: "Forex articles & market insight" },
      { label: "News Events", to: "/news", icon: Newspaper, desc: "Market headlines from the desk" },
      { label: "Daily Outlook", to: "/outlook", icon: Sun, desc: "Pair bias, levels & risk notes" },
      { label: "Giveaways", to: "/giveaways", icon: Gift, desc: "Student winners & special rewards" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Terms of Service", to: "/terms", icon: FileText, desc: "Rules of using our services" },
      { label: "Privacy Policy", to: "/privacy", icon: ShieldCheck, desc: "How we handle your data" },
    ],
  },
];

const moreRoutes = [
  ...moreGroups.flatMap((g) => g.items.map((i) => i.to)),
  "/fun/quiz",
  "/fun/millionaire",
  "/fun/live-chart",
  "/fun/market-combat",
];

export default function Navbar() {
  const [scrolledRaw, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const route = useRoute();
  const moreRef = useRef<HTMLLIElement | null>(null);
  const userRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const { user, isAuthed, isAdmin, logout, stats } = useStore();
  const requestedSolid = useNavbarForcedSolid();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      setScrolled(y > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = barRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () => {
      document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /**
   * Pages that do NOT open with a full-bleed dark hero need a solid bar
   * immediately, otherwise white nav text sits on a light background.
   */
  const forceSolid = route.startsWith("/dashboard") || requestedSolid;
  const scrolled = scrolledRaw || forceSolid || open;

  // Lock body scroll when full-viewport mobile menu is open
  useEffect(() => {
    if (open) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [open]);

  // Close menus on route change
  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
    setMobileMoreOpen(false);
  }, [route]);

  // Close dropdown on outside click / Escape
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMoreOpen(false);
        setUserOpen(false);
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const go = (to: Route) => {
    navigate(to);
    setOpen(false);
    setMoreOpen(false);
  };

  const moreActive = moreRoutes.includes(route);
  const linkTone = (active: boolean) =>
    scrolled
      ? active ? "text-brand" : "text-ink/70 hover:text-brand"
      : active ? "text-white" : "text-white/85 hover:text-white";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-line bg-white/95 backdrop-blur-md shadow-[0_8px_30px_-18px_rgba(22,24,28,0.35)]"
            : "bg-transparent"
        }`}
      >
      <div ref={barRef}>
        <TopCouponBar />
        <nav className="container-x relative flex min-h-[72px] pt-3 pb-1.5 sm:py-0 sm:h-[72px] items-center justify-between gap-3 sm:gap-4">
          <Logo variant={scrolled ? "dark" : "light"} />

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 lg:flex">
          {primary.map((l) => (
            <li key={l.to}>
              <button
                type="button"
                onClick={() => go(l.to)}
                className={`relative text-sm font-medium transition-colors ${linkTone(l.to === route)}`}
              >
                {l.label}
                {l.to === route && (
                  <span className="absolute -bottom-1.5 left-0 h-0.5 w-full rounded-full bg-brand" />
                )}
              </button>
            </li>
          ))}

          {/* More dropdown */}
          <li ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              aria-haspopup="true"
              className={`relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${linkTone(moreActive)}`}
            >
              <span>More</span>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
              {moreActive && (
                <span className="absolute -bottom-1.5 left-0 h-0.5 w-full rounded-full bg-brand" />
              )}
            </button>

            <div
              className={`absolute left-1/2 top-full z-50 mt-3 w-[min(56rem,calc(100vw-2rem))] -translate-x-1/2 origin-top overflow-visible rounded-2xl border border-line bg-white shadow-[0_30px_70px_-25px_rgba(22,24,28,0.45)] transition-all duration-200 ${
                moreOpen
                  ? "visible scale-100 opacity-100 pointer-events-auto"
                  : "hidden opacity-0 pointer-events-none"
              }`}
            >
              <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
                {moreGroups.filter((g) => g.title !== "Legal").map((group) => {
                  const isFunGroup = group.title === "Fun & Trivia";
                  return (
                    <div
                      key={group.title}
                      className={`p-1.5 transition-all duration-300 ${
                        isFunGroup
                          ? "rounded-2xl bg-slate-950/95 border border-brand/50 text-white shadow-[0_15px_40px_-10px_rgba(133,24,40,0.4)] backdrop-blur-md relative overflow-hidden"
                          : ""
                      }`}
                    >
                      {/* Sub-bg crimson shimmer for Fun & Trivia column */}
                      {isFunGroup && (
                        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand/20 blur-xl pointer-events-none" />
                      )}

                      <p
                        className={`px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] flex items-center gap-1.5 ${
                          isFunGroup ? "text-brand" : "text-muted"
                        }`}
                      >
                        {isFunGroup && <Zap className="h-3.5 w-3.5 text-brand animate-pulse" />}
                        {group.title}
                      </p>

                      <ul>
                        {group.items.map((item) => {
                          const on = item.to === route;
                          const isFunZone = item.to === "/fun";
                          return (
                            <li
                              key={item.to}
                              className={isFunZone ? "relative group/funzone" : "group/funitem"}
                            >
                              <div className="flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => go(item.to)}
                                  className={`flex flex-1 items-start gap-3 rounded-xl p-2.5 text-left transition-all duration-200 ${
                                    isFunGroup
                                      ? on
                                        ? "bg-brand/30 text-rose-200 border border-brand/60"
                                        : "hover:animate-vibrate-dance hover:bg-gradient-to-r hover:from-brand hover:via-brand-dark hover:to-amber-600 hover:text-white hover:shadow-[0_0_20px_rgba(251,191,36,0.6)] text-white/90"
                                      : on
                                      ? "bg-brand-light"
                                      : "hover:bg-cream"
                                  }`}
                                >
                                  <span
                                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 ${
                                      isFunGroup
                                        ? on
                                          ? "bg-brand text-white font-bold"
                                          : "bg-brand/25 text-rose-300 border border-brand/40 group-hover/funzone:bg-amber-400 group-hover/funzone:text-slate-950"
                                        : on
                                        ? "bg-brand text-white"
                                        : "bg-brand-light text-brand"
                                    }`}
                                  >
                                    <item.icon className="h-4 w-4" />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="flex items-center justify-between gap-1 leading-tight">
                                      <span
                                        className={`block text-sm font-semibold leading-tight ${
                                          isFunGroup
                                            ? on
                                              ? "text-rose-200 font-bold"
                                              : "text-white"
                                            : on
                                            ? "text-brand"
                                            : "text-ink"
                                        }`}
                                      >
                                        {item.label}
                                      </span>
                                      {isFunZone && (
                                        <span className="rounded-full bg-amber-400/20 p-1 text-amber-300 border border-amber-400/40 flex items-center justify-center transition-all duration-300 group-hover/funzone:bg-amber-400 group-hover/funzone:text-slate-950 group-hover/funzone:scale-110 shadow-md shrink-0">
                                          <Gamepad2 className="h-3.5 w-3.5 text-amber-400 group-hover/funzone:text-slate-950 animate-gamepad-wiggle" />
                                        </span>
                                      )}
                                    </span>
                                    <span
                                      className={`block text-xs leading-tight mt-0.5 ${
                                        isFunGroup ? "text-rose-200/75" : "text-muted"
                                      }`}
                                    >
                                      {item.desc}
                                    </span>
                                  </span>
                                </button>
                              </div>

                              {/* Hover-Activated Arcade Sub-Games Menu (Only reveals when Fun Zone is hovered on) */}
                              {isFunZone && (
                                <div className="absolute right-full top-0 mr-3 z-50 w-72 origin-top-right rounded-2xl border-2 border-amber-400/50 bg-slate-950/95 p-3 text-white shadow-[0_20px_60px_-15px_rgba(245,158,11,0.6)] backdrop-blur-xl transition-all duration-300 opacity-0 scale-95 pointer-events-none group-hover/funzone:opacity-100 group-hover/funzone:scale-100 group-hover/funzone:pointer-events-auto">
                                  {/* Arcade Flyout Header */}
                                  <div className="mb-2.5 flex items-center justify-between border-b border-amber-400/20 pb-2 px-1">
                                    <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-amber-300">
                                      <Zap className="h-3.5 w-3.5 text-amber-400 animate-spin-slow" /> Arcade Games Zone
                                    </span>
                                    <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                                      Hover to Play
                                    </span>
                                  </div>

                                  {/* 4 Arcade Games with Growing Animation on Hover */}
                                  <div className="space-y-2">
                                    {funZoneSubGames.map((sub) => {
                                      const subOn = sub.to === route;
                                      return (
                                        <button
                                          key={sub.to}
                                          type="button"
                                          onClick={() => {
                                            go(sub.to);
                                            setMoreOpen(false);
                                          }}
                                          className={`group/game flex w-full items-center gap-3 rounded-xl p-2.5 text-left text-xs font-bold transition-all duration-300 transform hover:scale-[1.06] hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(251,191,36,0.7)] ${
                                            subOn
                                              ? "bg-gradient-to-r from-brand via-brand-dark to-amber-600 text-white border-2 border-amber-400 shadow-lg"
                                              : "bg-white/10 border border-white/15 hover:border-amber-400/80 hover:bg-gradient-to-r hover:from-brand hover:to-amber-600 text-white"
                                          }`}
                                        >
                                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300 group-hover/game:bg-amber-400 group-hover/game:text-slate-950 transition-colors duration-300">
                                            <sub.icon className="h-4 w-4 transition-transform group-hover/game:scale-125 duration-300" />
                                          </span>
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between">
                                              <span className="truncate font-extrabold text-xs text-white group-hover/game:text-amber-200">
                                                {sub.label}
                                              </span>
                                              <Zap className="h-3.5 w-3.5 shrink-0 text-amber-400 opacity-0 group-hover/game:opacity-100 transition-opacity duration-300 animate-pulse" />
                                            </div>
                                            <span className="block text-[10px] text-rose-200/80 font-normal truncate">
                                              {sub.desc}
                                            </span>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>

                      {group.title === "Updates" && (
                        <div className="mt-3 border-t border-line pt-3">
                          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                            Legal
                          </p>
                          <ul>
                            {moreGroups.find((g) => g.title === "Legal")!.items.map((item) => {
                              const on = item.to === route;
                              return (
                                <li key={item.to}>
                                  <button
                                    type="button"
                                    onClick={() => go(item.to)}
                                    className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${
                                      on ? "bg-brand-light" : "hover:bg-cream"
                                    }`}
                                  >
                                    <span
                                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                                        on ? "bg-brand text-white" : "bg-brand-light text-brand"
                                      }`}
                                    >
                                      <item.icon className="h-4 w-4" />
                                    </span>
                                    <span className="min-w-0">
                                      <span className={`block text-sm font-semibold ${on ? "text-brand" : "text-ink"}`}>
                                        {item.label}
                                      </span>
                                      <span className="mt-0.5 block text-xs leading-snug text-muted">
                                        {item.desc}
                                      </span>
                                    </span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-line bg-cream px-4 py-4">
                <button
                  type="button"
                  onClick={() => go("/login")}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-ink/15 bg-white px-3 py-2.5 text-sm font-semibold text-ink transition hover:border-brand hover:text-brand"
                >
                  <LogIn className="h-4 w-4" /> Login
                </button>
                <button
                  type="button"
                  onClick={() => go("/signup")}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-brand px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
                >
                  <UserPlus className="h-4 w-4" /> Sign Up
                </button>
                <a
                  href={CONTACT.whatsappAiHref}
                  target="_blank"
                  rel="noreferrer"
                  className="ask-glow relative inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-full bg-ink px-3 py-2.5 text-sm font-semibold text-white"
                >
                  <span className="ask-glow-spin" aria-hidden="true" />
                  <span className="relative z-[1] inline-flex items-center gap-1.5">
                    <MessageCircle className="h-4 w-4" /> Ask Anything
                  </span>
                </a>
              </div>
            </div>
          </li>
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {isAuthed && user ? (
            <div ref={userRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setUserOpen((v) => !v)}
                aria-expanded={userOpen}
                className={`flex items-center gap-2.5 rounded-full py-1.5 pl-2.5 pr-3.5 transition ${
                  scrolled ? "hover:bg-cream" : "hover:bg-white/10"
                }`}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-xs font-bold text-white">
                    {`${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()}
                  </span>
                )}
                <span className={`text-sm font-semibold ${scrolled ? "text-ink" : "text-white"}`}>
                  {user.nickname || user.firstName}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${userOpen ? "rotate-180" : ""} ${scrolled ? "text-ink/60" : "text-white/70"}`} />
              </button>

              <div className={`absolute right-0 top-full mt-3 w-64 origin-top-right overflow-hidden rounded-2xl border border-line bg-white shadow-[0_30px_70px_-25px_rgba(22,24,28,0.45)] transition-all duration-200 ${
                userOpen ? "visible scale-100 opacity-100 pointer-events-auto" : "hidden opacity-0 pointer-events-none"
              }`}>
                <div className="border-b border-line bg-cream px-5 py-4">
                  <p className="font-display text-sm font-bold text-ink">{user.firstName} {user.lastName}</p>
                  <p className="mt-0.5 truncate text-xs text-muted">{user.email}</p>
                  <p className="mt-2 text-xs font-semibold text-brand">{stats.enrolled} course{stats.enrolled === 1 ? "" : "s"} enrolled</p>
                </div>
                <div className="p-2">
                  {isAdmin && (
                    <button type="button" onClick={() => { setUserOpen(false); go("/admin"); }}
                      className="mb-1 flex w-full items-center gap-3 rounded-xl bg-ink px-3 py-2.5 text-left text-sm font-semibold text-white transition hover:bg-ink/90">
                      <ShieldCheck className="h-4 w-4 text-brand-light" /> Admin Panel
                    </button>
                  )}
                  <button type="button" onClick={() => { setUserOpen(false); go("/dashboard"); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink/80 transition hover:bg-cream hover:text-brand">
                    <LayoutDashboard className="h-4 w-4 text-brand" /> Dashboard
                  </button>
                  <button type="button" onClick={() => { setUserOpen(false); go("/courses"); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink/80 transition hover:bg-cream hover:text-brand">
                    <BookOpen className="h-4 w-4 text-brand" /> My Courses
                  </button>
                  <button type="button" onClick={() => { setUserOpen(false); logout(); navigate("/"); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted transition hover:bg-cream hover:text-brand">
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => go("/login")}
                className={`hidden rounded-full px-4 py-2.5 text-sm font-semibold transition sm:inline-flex ${
                  scrolled ? "text-ink hover:text-brand" : "text-white/90 hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => go("/signup")}
                className="hidden items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-dark sm:inline-flex"
              >
                Sign Up
              </button>
            </>
          )}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className={`rounded-xl p-2 transition lg:hidden hover:bg-black/5 ${
              scrolled ? "text-ink" : "text-white"
            }`}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        </nav>
      </div>
    </header>

    {/* Full-Viewport Modern Mobile Navigation Overlay */}
    <div
      id="mobile-navigation"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
      className={`fixed inset-0 z-[100] flex h-[100dvh] w-screen flex-col bg-white transition-all duration-300 lg:hidden ${
        open
          ? "visible opacity-100 pointer-events-auto"
          : "invisible opacity-0 pointer-events-none"
      }`}
    >
      {/* Top Header mirroring the navbar */}
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-line bg-white/95 px-5 backdrop-blur-md">
        <Logo variant="dark" />
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-cream text-ink shadow-sm transition hover:bg-brand hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 space-y-6 sm:px-6">
        {/* User profile or Guest Auth card */}
        {isAuthed && user ? (
          <div className="rounded-2xl border border-line bg-gradient-to-br from-cream via-white to-cream/60 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-brand/20" />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-sm font-bold text-white shadow-sm">
                  {`${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-display text-base font-bold text-ink">
                    {user.firstName} {user.lastName}
                  </p>
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                      <ShieldCheck className="h-3 w-3" /> Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      Student
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-muted">{user.email}</p>
                <p className="mt-1 text-xs font-semibold text-brand">
                  {stats.enrolled} {stats.enrolled === 1 ? "course" : "courses"} enrolled
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line/60 pt-3">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => go("/admin")}
                  className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-ink px-3 py-2.5 text-xs font-bold text-white transition hover:bg-ink/90"
                >
                  <ShieldCheck className="h-4 w-4 text-brand-light" /> Admin Panel
                </button>
              )}
              <button
                type="button"
                onClick={() => go("/dashboard")}
                className="flex items-center justify-center gap-2 rounded-xl bg-brand px-3 py-2.5 text-xs font-bold text-white transition hover:bg-brand-dark"
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </button>
              <button
                type="button"
                onClick={() => go("/courses")}
                className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-xs font-bold text-ink transition hover:bg-cream"
              >
                <BookOpen className="h-4 w-4 text-brand" /> My Courses
              </button>
              <button
                type="button"
                onClick={() => { logout(); navigate("/"); setOpen(false); }}
                className="col-span-2 flex items-center justify-center gap-1.5 rounded-xl border border-line/70 py-2 text-xs font-semibold text-muted transition hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-3.5 w-3.5" /> Log out
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-gradient-to-br from-cream via-white to-cream/60 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Welcome to GAMAT Fx</p>
                <p className="font-display text-sm font-bold text-ink">Start Your Trading Journey</p>
              </div>
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => go("/login")}
                className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-xs font-bold text-ink shadow-sm transition hover:bg-cream"
              >
                <LogIn className="h-4 w-4 text-brand" /> Login
              </button>
              <button
                type="button"
                onClick={() => go("/signup")}
                className="flex items-center justify-center gap-2 rounded-xl bg-brand px-3 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-dark"
              >
                <UserPlus className="h-4 w-4" /> Sign Up Free
              </button>
            </div>
            <a
              href={CONTACT.whatsappAiHref}
              target="_blank"
              rel="noreferrer"
              className="ask-glow relative mt-2.5 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-ink px-4 py-2.5 text-xs font-bold text-white"
            >
              <span className="ask-glow-spin" aria-hidden="true" />
              <span className="relative z-[1] inline-flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <span>Ask Anything on WhatsApp</span>
                <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">Live</span>
              </span>
            </a>
          </div>
        )}

        {/* Primary Navigation */}
        <div>
          <p className="px-1 mb-2 text-[11px] font-extrabold uppercase tracking-widest text-muted">
            Main Navigation
          </p>
          <div className="space-y-1">
            {primary.map((l) => {
              const isActive = l.to === route;
              const Icon = l.icon;
              return (
                <button
                  key={l.to}
                  type="button"
                  onClick={() => go(l.to)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition ${
                    isActive
                      ? "bg-brand text-white font-bold shadow-sm shadow-brand/25"
                      : "text-ink/85 hover:bg-cream hover:text-brand"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-cream text-brand group-hover:bg-brand/10"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold">{l.label}</span>
                    {l.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isActive
                            ? "bg-white/25 text-white"
                            : "bg-brand/10 text-brand"
                        }`}
                      >
                        {l.badge}
                      </span>
                    )}
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 ${
                      isActive ? "text-white/80" : "text-muted"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Trading Ecosystem (Store & Whiteboard) */}
        <div>
          <p className="px-1 mb-2 text-[11px] font-extrabold uppercase tracking-widest text-muted">
            Trading Ecosystem
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => go("/store")}
              className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl border border-brand/25 bg-gradient-to-r from-brand/5 via-cream to-white p-3.5 text-left transition hover:border-brand/50 hover:shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm shadow-brand/30">
                  <ShoppingBag className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display text-sm font-bold text-ink">Store & Trading Tools</p>
                    <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-extrabold uppercase text-brand">Hot</span>
                  </div>
                  <p className="truncate text-xs text-muted">Bots, indicators, strategies & e-books</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-brand transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              type="button"
              onClick={() => go("/whiteboard")}
              className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-ink p-3.5 text-left text-white shadow-sm transition hover:border-brand/60"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-light">
                  <Pencil className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display text-sm font-bold text-white">Trading Whiteboard</p>
                    <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">Live</span>
                  </div>
                  <p className="truncate text-xs text-white/70">Interactive TA & live teaching canvas</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-white/70 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* Fun Zone Arcade */}
        <div>
          <p className="px-1 mb-2 text-[11px] font-extrabold uppercase tracking-widest text-muted">
            Games & Trivia
          </p>
          <div className="relative overflow-hidden rounded-2xl border border-brand/40 bg-slate-950 p-4 text-white shadow-md">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand/30 blur-2xl" />
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => go("/fun")}
                className="flex items-center gap-2 text-left"
              >
                <Gamepad2 className="h-5 w-5 text-brand-light" />
                <span className="font-display text-sm font-bold text-white">Fun Zone Arcade</span>
                <span className="rounded-full bg-brand/30 px-2 py-0.5 text-[10px] font-bold text-brand-light">4 Games</span>
              </button>
              <button
                type="button"
                onClick={() => go("/fun")}
                className="text-xs font-semibold text-brand-light transition hover:text-white"
              >
                Open Hub &rarr;
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {funZoneSubGames.map((sub) => {
                const SubIcon = sub.icon;
                const isSubActive = sub.to === route;
                return (
                  <button
                    key={sub.to}
                    type="button"
                    onClick={() => go(sub.to)}
                    className={`flex flex-col gap-1 rounded-xl p-2.5 text-left transition ${
                      isSubActive
                        ? "bg-brand text-white shadow-sm shadow-brand/40"
                        : "border border-white/10 bg-white/5 text-white/90 hover:border-brand/40 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <SubIcon className={`h-4 w-4 ${isSubActive ? "text-white" : "text-brand-light"}`} />
                    </div>
                    <p className="truncate text-xs font-bold leading-tight">{sub.label}</p>
                    <p className={`line-clamp-1 text-[10px] ${isSubActive ? "text-white/80" : "text-white/50"}`}>{sub.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => go("/fun/student-of-the-week")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <Award className="h-3 w-3 text-amber-400" /> Student Spotlight
              </button>
              <button
                type="button"
                onClick={() => go("/fun/histofact")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <History className="h-3 w-3 text-blue-400" /> Histofact Cards
              </button>
              <button
                type="button"
                onClick={() => go("/fun/clubs")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <Shield className="h-3 w-3 text-emerald-400" /> Club Builder
              </button>
            </div>
          </div>
        </div>

        {/* Community & Market Desk */}
        <div>
          <p className="px-1 mb-2 text-[11px] font-extrabold uppercase tracking-widest text-muted">
            Community & Market Desk
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Student Forum", to: "/forum" as Route, icon: MessagesSquare },
              { label: "Community", to: "/community" as Route, icon: Users },
              { label: "Daily Outlook", to: "/outlook" as Route, icon: Sun },
              { label: "Market News", to: "/news" as Route, icon: Newspaper },
              { label: "Blog Articles", to: "/blog" as Route, icon: FileText },
              { label: "Giveaways", to: "/giveaways" as Route, icon: Gift },
            ].map((item) => {
              const ItemIcon = item.icon;
              const isAct = item.to === route;
              return (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => go(item.to)}
                  className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-xs font-semibold transition ${
                    isAct
                      ? "border-brand bg-brand-light text-brand"
                      : "border-line bg-cream/40 text-ink/80 hover:bg-cream hover:text-brand"
                  }`}
                >
                  <ItemIcon className="h-4 w-4 shrink-0 text-brand" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Support & Legal */}
        <div>
          <p className="px-1 mb-2 text-[11px] font-extrabold uppercase tracking-widest text-muted">
            Support & Legal
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Reviews", to: "/reviews" as Route, icon: Star },
              { label: "FAQ", to: "/faq" as Route, icon: HelpCircle },
              { label: "Contact Us", to: "/contact" as Route, icon: MailOpen },
              { label: "Terms of Service", to: "/terms" as Route, icon: FileText },
              { label: "Privacy Policy", to: "/privacy" as Route, icon: ShieldCheck },
            ].map((item) => {
              const ItemIcon = item.icon;
              const isAct = item.to === route;
              return (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => go(item.to)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    isAct
                      ? "border-brand bg-brand-light text-brand"
                      : "border-line bg-white text-muted hover:border-brand/40 hover:text-ink"
                  }`}
                >
                  <ItemIcon className="h-3.5 w-3.5 text-brand" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Contacts Footer */}
        <div className="border-t border-line pt-5 pb-6 text-center">
          <p className="text-xs font-bold text-ink mb-3">Direct Support Channels</p>
          <div className="flex items-center justify-center gap-3">
            <a
              href={CONTACT.whatsappHref}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-cream text-emerald-600 transition hover:bg-emerald-600 hover:text-white"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
            <a
              href={CONTACT.telegram}
              target="_blank"
              rel="noreferrer"
              aria-label="Telegram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-cream text-sky-500 transition hover:bg-sky-500 hover:text-white"
            >
              <Send className="h-4 w-4" />
            </a>
            <a
              href={CONTACT.phoneHref}
              aria-label="Call Us"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-cream text-brand transition hover:bg-brand hover:text-white"
            >
              <Phone className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${CONTACT.email}`}
              aria-label="Email Us"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-cream text-ink transition hover:bg-ink hover:text-white"
            >
              <MailOpen className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-3 text-[11px] text-muted">
            {CONTACT.addressShort}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">
            {CONTACT.hours}
          </p>
          <p className="mt-2 text-[10px] font-medium text-muted/60">
            © {new Date().getFullYear()} GAMAT Fx Academy. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </>
  );
}
