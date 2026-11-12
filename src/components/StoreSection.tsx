import { useState, useRef, useEffect, MouseEvent } from "react";
import { navigate } from "../lib/router";
import {
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Download,
  X,
  Star,
  Layers,
  ExternalLink,
} from "lucide-react";

export default function StoreSection() {
  const [isHovered, setIsHovered] = useState(false);
  const [rotate, setRotate] = useState({ x: 8, y: -18 });
  const [showBookModal, setShowBookModal] = useState(false);
  const bookRef = useRef<HTMLDivElement>(null);

  // Lock body scroll and handle Escape key when book modal is open
  useEffect(() => {
    if (!showBookModal) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowBookModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [showBookModal]);

  // Smooth mouse tilt tracking on the 3D book
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!bookRef.current) return;
    const rect = bookRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -10 + 6;
    const rotY = ((x - centerX) / centerX) * 14 - 16;
    setRotate({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 8, y: -18 });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-[#0a0d14] to-slate-950 py-20 sm:py-28 text-white">
      {/* Ambient background glows matching GAMAT Red & Obsidian */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-brand/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(220,53,69,0.12),rgba(255,255,255,0))]" />

      <div className="container-x relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-rose-300">
            BESTSELLING TRADING SUITE
          </p>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Institutional Order <br />
            Flow in <span className="text-brand">Print &amp; Code</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Master smart money sweeps and liquidity imbalances with Chief Mentor Tonye's flagship hardcover playbook — backed by our institutional algorithmic trading suite.
          </p>
        </div>

        {/* 2-Column Showcase: 3D Hardcover Book + Authoritative Narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* LEFT: 3D Hardcover Book Presentation */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div
              className="relative w-full max-w-[340px] sm:max-w-[380px] py-8 cursor-pointer select-none"
              style={{ perspective: "1400px" }}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={handleMouseLeave}
              onClick={() => setShowBookModal(true)}
              role="button"
              tabIndex={0}
              aria-label="View Institutional Order Flow & Liquidity Playbook details"
            >
              {/* Soft Ground Shadow */}
              <div
                className="absolute -bottom-4 left-6 right-6 h-10 rounded-full bg-black/80 blur-xl transition-transform duration-500"
                style={{
                  transform: isHovered ? "scale(1.08) translateY(6px)" : "scale(1)",
                }}
              />

              {/* 3D Book Container */}
              <div
                ref={bookRef}
                className="relative rounded-r-2xl transition-transform duration-300 ease-out"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `rotateY(${rotate.y}deg) rotateX(${rotate.x}deg) rotateZ(1deg)`,
                }}
              >
                {/* 1. Left Book Spine (Hardcover Depth) */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-8 origin-left bg-gradient-to-r from-[#2a060a] via-[#5c0d15] to-[#1a0305] rounded-l-sm shadow-2xl flex flex-col justify-between py-6 items-center text-center border-l border-white/10"
                  style={{
                    transform: "rotateY(-90deg) translateX(-32px)",
                  }}
                >
                  {/* Spine Crease / Embossing */}
                  <div className="w-full h-1 bg-black/40 border-y border-white/10" />
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-black tracking-widest text-rose-300/80 [writing-mode:vertical-rl] rotate-180">
                      GAMAT FX ACADEMY
                    </span>
                    <span className="text-[10px] font-extrabold tracking-wider text-white [writing-mode:vertical-rl] rotate-180">
                      ORDER FLOW PLAYBOOK
                    </span>
                  </div>
                  <div className="w-full h-1 bg-black/40 border-y border-white/10" />
                </div>

                {/* 2. Hardcover Front Cover */}
                <div className="relative aspect-[1/1.42] w-full rounded-r-2xl rounded-l-sm bg-gradient-to-br from-[#121622] via-[#0b0e17] to-[#05070c] p-6 sm:p-7 text-white shadow-2xl border-y border-r border-white/15 overflow-hidden">
                  {/* Subtle Red / Crimson Ambient Sheen across the cover */}
                  <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand/20 blur-2xl" />
                  <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-brand/25 blur-2xl" />

                  {/* Embossed Gold / Red Border Lines */}
                  <div className="pointer-events-none absolute inset-3 rounded-r-xl rounded-l-xs border border-brand/35" />
                  <div className="pointer-events-none absolute inset-4 rounded-r-lg rounded-l-xs border border-white/10" />

                  {/* Top Cover Header: Desk Badge & Rating */}
                  <div className="relative flex items-center justify-between pt-1">
                    <span className="text-[8px] sm:text-[9px] font-extrabold tracking-[0.2em] text-rose-200/90 uppercase">
                      Official Desk Edition
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-400 text-[10px]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-2.5 w-2.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  {/* Center Brand Identity: GAMAT Official Candlestick Logo */}
                  <div className="relative mt-5 sm:mt-6 flex flex-col items-center text-center">
                    {/* Official Candlestick Tile */}
                    <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b02a37] via-[#dc3545] to-[#83141f] shadow-lg shadow-brand/40 ring-2 ring-white/20">
                      <svg width="34" height="34" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                        <line x1="4" y1="26" x2="28" y2="26" stroke="white" strokeOpacity="0.35" strokeWidth="1" />
                        <line x1="8.5" y1="7" x2="8.5" y2="24" stroke="white" strokeOpacity="0.8" strokeWidth="1.4" strokeLinecap="round" />
                        <rect x="6.2" y="10" width="4.6" height="10" rx="1" fill="white" fillOpacity="0.65" />
                        <line x1="16" y1="5" x2="16" y2="24" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                        <rect x="13.4" y="9" width="5.2" height="12" rx="1.1" fill="white" />
                        <line x1="23.5" y1="9" x2="23.5" y2="24" stroke="white" strokeOpacity="0.85" strokeWidth="1.4" strokeLinecap="round" />
                        <rect x="21.2" y="13" width="4.6" height="8" rx="1" fill="white" fillOpacity="0.8" />
                        <path d="M5.5 21.5 C10 18.5, 13 14.5, 16.5 12.5 C20 10.5, 23 9.5, 27 8" stroke="white" strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                      </svg>
                    </div>

                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.25em] text-white">
                      GAMAT<span className="text-brand">&nbsp;Fx</span> ACADEMY
                    </p>
                  </div>

                  {/* Book Title in GAMAT Red and Black Theme */}
                  <div className="relative mt-5 sm:mt-6 text-center">
                    <p className="text-[10px] font-bold tracking-[0.22em] text-slate-300 uppercase">
                      The Institutional
                    </p>
                    <h3 className="mt-1 font-display text-xl sm:text-2xl font-black leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-100 to-white drop-shadow-sm">
                      ORDER FLOW &amp;
                    </h3>
                    <h3 className="font-display text-xl sm:text-2xl font-black leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-red-600 drop-shadow-sm">
                      LIQUIDITY
                    </h3>
                    <p className="mt-1 font-display text-xs font-bold uppercase tracking-[0.3em] text-white/90">
                      P L A Y B O O K
                    </p>

                    <div className="mx-auto my-3 h-px w-24 bg-gradient-to-r from-transparent via-brand to-transparent" />

                    <p className="text-[9px] sm:text-[10px] text-slate-300/90 leading-snug line-clamp-2 px-2">
                      Decoding Central Bank Sweeps, Imbalances &amp; Multi-Timeframe Execution
                    </p>
                  </div>

                  {/* Bottom Author & Stamp */}
                  <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between pt-2 border-t border-white/10 text-[9px]">
                    <div>
                      <p className="font-bold text-white tracking-wide">Tonye &amp; Quant Desk</p>
                      <p className="text-[8px] text-rose-300/80">Chief Institutional Mentors</p>
                    </div>
                    <div className="rounded-full bg-brand/20 border border-brand/40 px-2 py-0.5 text-[8px] font-black text-rose-200">
                      280 PAGES
                    </div>
                  </div>
                </div>

                {/* 3. Right Page Edges Stack (3D paper thickness) */}
                <div
                  className="absolute right-0 top-1 bottom-1 w-6 origin-right bg-gradient-to-r from-stone-100 via-stone-200 to-stone-300 rounded-r-xs shadow-md"
                  style={{
                    transform: "rotateY(90deg) translateX(24px)",
                    backgroundImage:
                      "repeating-linear-gradient(to right, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 2px)",
                  }}
                />

                {/* 4. Crimson Ribbon Bookmark dangling from bottom */}
                <div className="absolute -bottom-8 left-1/3 w-4 h-12 bg-gradient-to-b from-[#83141f] via-[#dc3545] to-[#b02a37] shadow-lg shadow-brand/50 [clip-path:polygon(0_0,100%_0,100%_100%,50%_80%,0_100%)] z-10" />
              </div>

              {/* Click to Preview Indicator */}
              <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-rose-300/80 hover:text-white transition">
                <BookOpen className="h-3.5 w-3.5 text-brand" />
                <span className="font-semibold text-[11px]">Click book for chapter breakdown &amp; preview</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Clear Narrative, Flagship Book Overview & Tools Access Gateway */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                AVAILABLE IN HIGH-RES PDF
              </span>

              <h3 className="mt-4 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Institutional Order Flow &amp; Liquidity Playbook
              </h3>

              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                Written by Chief Mentor Tonye and the GAMAT Senior Trading Desk, this comprehensive 280-page playbook decodes the exact algorithms institutions use to accumulate orders, trigger stop runs, and execute clean session continuations.
              </p>

              {/* Key Highlights (Clean 6-Point Grid) */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-3.5 backdrop-blur-sm">
                  <p className="font-display text-sm sm:text-base font-black text-rose-300">280 Pages</p>
                  <p className="mt-1 text-[11px] sm:text-xs text-slate-400 leading-snug">Full color with 120+ annotated trade setups</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-3.5 backdrop-blur-sm">
                  <p className="font-display text-sm sm:text-base font-black text-white">FVG &amp; OB Rules</p>
                  <p className="mt-1 text-[11px] sm:text-xs text-slate-400 leading-snug">Step-by-step smart money validation criteria</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-3.5 backdrop-blur-sm">
                  <p className="font-display text-sm sm:text-base font-black text-white">Session Killzones</p>
                  <p className="mt-1 text-[11px] sm:text-xs text-slate-400 leading-snug">London Judas swings &amp; NY continuation timing</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-3.5 backdrop-blur-sm">
                  <p className="font-display text-sm sm:text-base font-black text-white">Liquidity Maps</p>
                  <p className="mt-1 text-[11px] sm:text-xs text-slate-400 leading-snug">Buy-side &amp; sell-side stop sweep identification</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-3.5 backdrop-blur-sm">
                  <p className="font-display text-sm sm:text-base font-black text-white">Desk Cheatsheets</p>
                  <p className="mt-1 text-[11px] sm:text-xs text-slate-400 leading-snug">Quick multi-timeframe confirmation cards</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-3.5 backdrop-blur-sm">
                  <p className="font-display text-sm sm:text-base font-black text-white">Risk Protocol</p>
                  <p className="mt-1 text-[11px] sm:text-xs text-slate-400 leading-snug">Institutional position sizing &amp; drawdown rules</p>
                </div>
              </div>

              {/* Action Buttons: Direct Book Purchase + Full Store */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => navigate("/store?product=gamat-playbook-v1")}
                  className="rounded-xl bg-brand px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-brand/30 hover:bg-brand-dark transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Get The Playbook • ₦24,999</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/store")}
                  className="rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-white/10 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Visit Full Store &amp; Catalog</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Book Overview & Chapter Details (Full-Width Bottom-to-Top Flyout Sheet) */}
      {showBookModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowBookModal(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full rounded-t-[28px] sm:rounded-t-[36px] rounded-b-none border-t border-white/20 bg-gradient-to-b from-slate-900 via-[#0e131d] to-slate-950 text-white shadow-[0_-25px_60px_-15px_rgba(0,0,0,0.85)] h-[94vh] sm:h-[93vh] max-h-[96vh] flex flex-col animate-fly-up overflow-hidden">
            {/* Grab / Drag Handle */}
            <div className="pt-3.5 pb-1 flex justify-center">
              <div
                className="h-1.5 w-12 rounded-full bg-white/25 hover:bg-white/40 transition cursor-pointer"
                onClick={() => setShowBookModal(false)}
                title="Close"
              />
            </div>

            {/* Header */}
            <div className="border-b border-white/10">
              <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 pt-2 pb-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-brand text-xs font-bold uppercase tracking-wider">
                    <BookOpen className="h-4 w-4" />
                    <span>Flagship Desk Publication</span>
                  </div>

                  <h3 className="mt-1.5 font-display text-xl sm:text-2xl font-black text-white">
                    Institutional Order Flow &amp; Liquidity Playbook
                  </h3>
                  <p className="mt-0.5 text-xs text-rose-300 font-semibold">
                    By Chief Mentor Tonye &amp; GAMAT Senior Quant Research Desk
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 py-6 space-y-5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>
                  The financial markets are engineered by central banks and institutional algorithms designed to exploit retail liquidity. This playbook strips away the retail noise and provides you with the exact mechanical rules institutional desks follow.
                </p>

                <div className="rounded-2xl bg-white/5 p-4 sm:p-6 border border-white/10 space-y-3.5">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                    What is inside the 280 pages:
                  </h4>
                  <ul className="space-y-3 text-xs text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                      <span><strong>Module 1: The Liquidity Paradigm</strong> — Decoding Buy-Side (BSL) vs Sell-Side Liquidity (SSL) and why stop sweeps occur before explosive runs.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                      <span><strong>Module 2: Imbalances &amp; Fair Value Gaps</strong> — High-probability FVG validation, consequent encroachment, and volume imbalance delivery.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                      <span><strong>Module 3: Order Block Mechanics</strong> — Identifying true institutional mitigation vs false retail support/resistance traps.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                      <span><strong>Module 4: Killzones &amp; Session Expansion</strong> — London Open Judas swings, New York AM continuation models, and Asian range sweeps.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                      <span><strong>Module 5: Multi-Timeframe Structure</strong> — Mapping institutional order flow, internal vs swing structural shifts, and high-probability CHoCH confirmations.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                      <span><strong>Module 6: Risk Architecture &amp; Trade Management</strong> — Asymmetric 1:3+ risk-to-reward models, algorithmic stop placements, and dynamic profit-taking protocols.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                      <span><strong>Cheatsheet Desk Bundle</strong> — Printable laminated execution cards for quick multi-timeframe confirmation.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Anchored Bottom Action Bar */}
            <div className="border-t border-white/10 bg-slate-950/95 backdrop-blur-md">
              <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400">Instant Download &amp; Lifetime Updates</span>
                  <p className="font-display text-2xl font-black text-white">
                    ₦24,999 <span className="text-xs text-slate-400 font-normal line-through ml-2">₦45,000</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookModal(false);
                      navigate("/store?product=gamat-playbook-v1");
                    }}
                    className="w-full sm:w-auto rounded-xl bg-brand px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-brand-dark transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-brand/30"
                  >
                    <Download className="h-4 w-4" />
                    <span>Get Playbook on Store</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
