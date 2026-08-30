import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
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
} from "lucide-react";
import Logo from "./Logo";
import TopCouponBar from "./TopCouponBar";
import { navigate, useRoute, type Route } from "../lib/router";
import { useStore } from "../lib/store";
import { useNavbarForcedSolid } from "../lib/chrome";
import { CONTACT } from "../lib/contact";
import { LayoutDashboard, BookOpen, LogOut } from "lucide-react";

type NavLink = { label: string; to: Route };

/** Primary links shown inline on desktop. */
const primary: NavLink[] = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Courses", to: "/courses" },
  { label: "Services", to: "/services" },
  { label: "Events", to: "/events" },
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
      { label: "Student Forum", to: "/forum", icon: MessagesSquare, desc: "Meet students & ask questions" },
      { label: "Blog", to: "/blog", icon: Newspaper, desc: "Forex articles & market insight" },
      { label: "Community", to: "/community", icon: Users, desc: "Join 40K+ traders on Telegram" },
      { label: "Reviews", to: "/reviews", icon: Star, desc: "What our students say" },
      { label: "FAQ", to: "/faq", icon: HelpCircle, desc: "Answers to common questions" },
      { label: "Contact", to: "/contact", icon: MailOpen, desc: "Talk to our team" },
    ],
  },
  {
    title: "Fun & Trivia",
    items: [
      { label: "Fun Zone", to: "/fun", icon: Gamepad2, desc: "Four in one game" },
      { label: "Student of the Week", to: "/fun/student-of-the-week", icon: Award, desc: "Student spotlight & wall of fame" },
      { label: "Histofact Cards", to: "/fun/histofact", icon: History, desc: "Card flips on forex & crypto history" },
      { label: "Club Builder", to: "/fun/clubs", icon: Shield, desc: "Join and build a family of traders" },
    ],
  },
  {
    title: "Updates",
    items: [
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
  const { user, isAuthed, isAdmin, logout, stats } = useStore();
  const requestedSolid = useNavbarForcedSolid();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * Pages that do NOT open with a full-bleed dark hero need a solid bar
   * immediately, otherwise white nav text sits on a light background.
   */
  const forceSolid = route.startsWith("/dashboard") || requestedSolid;
  const scrolled = scrolledRaw || forceSolid;

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
      if (e.key === "Escape") { setMoreOpen(false); setUserOpen(false); }
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
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-line bg-white/90 backdrop-blur-md shadow-[0_8px_30px_-18px_rgba(22,24,28,0.35)]"
          : "bg-transparent"
      }`}
    >
      <TopCouponBar />
      <nav className="container-x flex h-[72px] items-center justify-between gap-4">
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
          <li ref={moreRef} className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              aria-haspopup="true"
              className={`relative flex items-center gap-1 text-sm font-medium transition-colors ${linkTone(moreActive)}`}
            >
              More
              <ChevronDown className={`h-4 w-4 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
              {moreActive && (
                <span className="absolute -bottom-1.5 left-0 h-0.5 w-full rounded-full bg-brand" />
              )}
            </button>

            <div
              className={`absolute left-1/2 top-full z-50 mt-4 w-[min(56rem,calc(100vw-2rem))] -translate-x-1/2 origin-top overflow-visible rounded-2xl border border-line bg-white shadow-[0_30px_70px_-25px_rgba(22,24,28,0.45)] transition-all duration-200 ${
                moreOpen
                  ? "visible scale-100 opacity-100"
                  : "invisible scale-95 opacity-0"
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
                                <div className="absolute left-full top-0 ml-3 z-50 w-72 origin-top-left rounded-2xl border-2 border-amber-400/50 bg-slate-950/95 p-3 text-white shadow-[0_20px_60px_-15px_rgba(245,158,11,0.6)] backdrop-blur-xl transition-all duration-300 opacity-0 scale-95 pointer-events-none group-hover/funzone:opacity-100 group-hover/funzone:scale-100 group-hover/funzone:pointer-events-auto">
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
                className={`flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3 transition ${
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
                userOpen ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
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
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className={`rounded-lg p-2 transition lg:hidden ${scrolled ? "text-ink" : "text-white"}`}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`overflow-y-auto border-t border-line bg-white transition-all duration-300 lg:hidden ${
          open ? "max-h-[80vh]" : "max-h-0"
        }`}
      >
        <ul className="container-x flex flex-col gap-1 py-4">
          {primary.map((l) => (
            <li key={l.to}>
              <button
                type="button"
                onClick={() => go(l.to)}
                className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                  l.to === route ? "bg-brand-light text-brand" : "text-ink/80 hover:bg-brand-light hover:text-brand"
                }`}
              >
                {l.label}
              </button>
            </li>
          ))}

          {/* Mobile "More" accordion */}
          <li>
            <button
              type="button"
              onClick={() => setMobileMoreOpen((v) => !v)}
              aria-expanded={mobileMoreOpen}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                moreActive ? "bg-brand-light text-brand" : "text-ink/80 hover:bg-brand-light hover:text-brand"
              }`}
            >
              More
              <ChevronDown className={`h-4 w-4 transition-transform ${mobileMoreOpen ? "rotate-180" : ""}`} />
            </button>

            <div className={`grid transition-all duration-300 ${mobileMoreOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <ul className="mt-1 space-y-0.5 border-l-2 border-line pl-3">
                  {moreGroups.flatMap((g) => g.items).map((item) => (
                    <li key={item.to}>
                      <button
                        type="button"
                        onClick={() => go(item.to)}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                          item.to === route ? "bg-brand-light font-semibold text-brand" : "text-ink/70 hover:bg-cream hover:text-brand"
                        }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0 text-brand" />
                        {item.label}
                      </button>

                      {item.to === "/fun" && (
                        <div className="ml-6 my-1 space-y-1 border-l border-brand/40 pl-3">
                          {funZoneSubGames.map((sub) => (
                            <button
                              key={sub.to}
                              type="button"
                              onClick={() => go(sub.to)}
                              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                                sub.to === route ? "bg-brand text-white font-bold" : "text-ink/70 hover:text-brand"
                              }`}
                            >
                              <sub.icon className="h-3.5 w-3.5 shrink-0 text-brand" />
                              {sub.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>

          {isAuthed && user ? (
            <li className="mt-3 space-y-2 border-t border-line pt-4">
              <div className="flex items-center gap-3 rounded-xl bg-cream px-3 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-xs font-bold text-white">
                  {`${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">{user.firstName} {user.lastName}</p>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                </div>
              </div>
              <button type="button" onClick={() => go("/dashboard")} className="btn-primary w-full">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </button>
              <button type="button" onClick={() => { logout(); navigate("/"); setOpen(false); }} className="btn-outline-dark w-full">
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </li>
          ) : (
            <li className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-4">
              <button type="button" onClick={() => go("/login")} className="btn-outline-dark w-full">
                <LogIn className="h-4 w-4" /> Login
              </button>
              <button type="button" onClick={() => go("/signup")} className="btn-primary w-full">
                <UserPlus className="h-4 w-4" /> Sign Up
              </button>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}
