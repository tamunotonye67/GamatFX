import { useEffect, useRef, useState } from "react";
import {
  GraduationCap, Building2, Megaphone, Users, TrendingUp,
  Briefcase, Zap, ChevronLeft, ChevronRight, Play, Pause,
} from "lucide-react";

/* ------------------------------------------------------------------ */

const SLIDES = [
  { src: "/images/services.jpg", label: "Mentorship Sessions", tag: "Education", icon: GraduationCap, accent: "#dc3545" },
  { src: "/images/about.jpg", label: "Academy Training", tag: "Curriculum", icon: Users, accent: "#f59e0b" },
  { src: "/images/community.jpg", label: "Digital & Community", tag: "Marketing", icon: Megaphone, accent: "#38bdf8" },
  { src: "/images/about-hero.jpg", label: "Consultancy & Setup", tag: "Advisory", icon: Building2, accent: "#8b5cf6" },
];

const DURATION = 4200;

/** Position of each card in the 3D carousel, relative to the active index. */
function transformFor(offset: number, total: number) {
  // Normalise to a signed distance so cards fan both ways.
  let d = offset;
  if (d > total / 2) d -= total;

  if (d === 0) {
    return { transform: "translate3d(0,0,0) rotateY(0deg) scale(1)", opacity: 1, zIndex: 30, filter: "blur(0px) brightness(1)" };
  }
  const dir = d > 0 ? 1 : -1;
  const mag = Math.abs(d);
  return {
    transform: `translate3d(${dir * (46 + mag * 14)}px, ${mag * 10}px, ${-140 * mag}px) rotateY(${dir * -22}deg) scale(${1 - mag * 0.08})`,
    opacity: mag > 2 ? 0 : 0.55 - mag * 0.14,
    zIndex: 30 - mag,
    filter: `blur(${mag * 1.6}px) brightness(${1 - mag * 0.18})`,
  };
}

export default function ServiceGallery() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const stage = useRef<HTMLDivElement | null>(null);

  const go = (next: number) =>
    setI(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % SLIDES.length), DURATION);
    return () => window.clearInterval(t);
  }, [paused]);

  /* Parallax tilt following the pointer */
  const onMove = (e: React.MouseEvent) => {
    const r = stage.current?.getBoundingClientRect();
    if (!r) return;
    setTilt({
      x: ((e.clientY - r.top) / r.height - 0.5) * -14,
      y: ((e.clientX - r.left) / r.width - 0.5) * 16,
    });
  };

  const active = SLIDES[i];

  return (
    <div className="w-full px-8 py-10 sm:px-12">
      <div
        ref={stage}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => { setPaused(false); setTilt({ x: 0, y: 0 }); }}
        onMouseMove={onMove}
        className="relative mx-auto w-full max-w-[400px]"
        style={{ perspective: "1400px" }}
      >
        {/* Ambient glow that shifts colour with the slide */}
        <div
          className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] blur-3xl transition-all duration-1000"
          style={{ background: `radial-gradient(circle at 40% 30%, ${active.accent}38, transparent 65%)` }}
        />

        {/* Rotating dashed ring */}
        <div className="pointer-events-none absolute -inset-6 -z-10 animate-[spinSlow_26s_linear_infinite] rounded-[2.5rem] border-2 border-dashed border-brand/20" />

        {/* Vector dot grid */}
        <svg className="pointer-events-none absolute -bottom-8 -left-9 h-24 w-24 text-brand/25" viewBox="0 0 96 96" aria-hidden="true">
          {Array.from({ length: 4 }).flatMap((_, r) =>
            Array.from({ length: 4 }).map((__, c) => (
              <circle key={`${r}-${c}`} cx={10 + c * 25} cy={10 + r * 25} r="3.5" fill="currentColor"
                className="animate-[twinkle_3s_ease-in-out_infinite]"
                style={{ animationDelay: `${(r + c) * 160}ms` }} />
            ))
          )}
        </svg>

        {/* Corner accent */}
        <div className="pointer-events-none absolute -right-5 -top-5 h-24 w-24 rounded-tr-[2rem] border-r-4 border-t-4 transition-colors duration-1000"
          style={{ borderColor: `${active.accent}66` }} />

        {/* ---------------- 3D stage ---------------- */}
        <div
          className="relative aspect-[4/5] transition-transform duration-500 ease-out"
          style={{ transformStyle: "preserve-3d", transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
        >
          {SLIDES.map((s, idx) => {
            const offset = (idx - i + SLIDES.length) % SLIDES.length;
            const st = transformFor(offset, SLIDES.length);
            const isActive = offset === 0;
            return (
              <div
                key={s.src}
                aria-hidden={!isActive}
                className="absolute inset-0 overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10 transition-all duration-[1100ms] ease-[cubic-bezier(.22,1,.36,1)]"
                style={{ ...st, transformStyle: "preserve-3d" }}
              >
                <img
                  src={s.src}
                  alt={s.label}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform ease-out"
                  style={{
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                    transitionDuration: isActive ? `${DURATION + 1200}ms` : "1100ms",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />

                {/* Sheen sweep on the active card */}
                {isActive && (
                  <div
                    key={`sheen-${i}`}
                    className="pointer-events-none absolute inset-0 animate-[sheen_1.4s_ease-out]"
                    style={{ background: "linear-gradient(105deg,transparent 35%,rgba(255,255,255,.28) 50%,transparent 65%)" }}
                  />
                )}

                {/* Caption */}
                {isActive && (
                  <div key={`cap-${i}`} className="absolute inset-x-0 bottom-0 p-6">
                    <span
                      className="inline-flex animate-[riseIn_.7s_cubic-bezier(.22,1,.36,1)_both] items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ background: s.accent }}
                    >
                      <Zap className="h-3 w-3" /> {s.tag}
                    </span>
                    <p
                      className="mt-2.5 animate-[riseIn_.7s_cubic-bezier(.22,1,.36,1)_.1s_both] font-display text-xl font-extrabold leading-tight text-white"
                      style={{ textShadow: "0 2px 12px rgba(0,0,0,.5)" }}
                    >
                      {s.label}
                    </p>
                    <span className="mt-3 flex animate-[riseIn_.7s_cubic-bezier(.22,1,.36,1)_.2s_both] items-center gap-2 text-xs text-white/70">
                      <s.icon className="h-4 w-4" style={{ color: s.accent }} />
                      GAMAT Fx Academy
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress ring */}
        <div className="pointer-events-none absolute -left-3 -top-3 z-40">
          <svg width="54" height="54" viewBox="0 0 54 54" className="-rotate-90">
            <circle cx="27" cy="27" r="23" fill="rgba(22,24,28,.75)" stroke="rgba(255,255,255,.14)" strokeWidth="2" />
            <circle
              key={`ring-${i}-${paused}`}
              cx="27" cy="27" r="23" fill="none" stroke={active.accent} strokeWidth="3" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 23}
              style={{
                animation: paused ? "none" : `ring ${DURATION}ms linear forwards`,
                strokeDashoffset: paused ? 0 : undefined,
              }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-display text-xs font-extrabold text-white">
            {String(i + 1).padStart(2, "0")}
          </span>
        </div>

        {/* Floating stat chips */}
        <div className="pointer-events-none absolute -left-7 top-24 z-40 animate-[float_5s_ease-in-out_infinite] rounded-2xl border border-line bg-white px-4 py-3 shadow-2xl">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white"><TrendingUp className="h-4 w-4" /></span>
            <div>
              <p className="font-display text-base font-extrabold leading-none text-ink">4,000+</p>
              <p className="text-[11px] text-muted">Trained</p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-7 bottom-32 z-40 animate-[floatAlt_6s_ease-in-out_infinite] rounded-2xl border border-line bg-white px-4 py-3 shadow-2xl">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white"><Briefcase className="h-4 w-4" /></span>
            <div>
              <p className="font-display text-base font-extrabold leading-none text-ink">4</p>
              <p className="text-[11px] text-muted">Core services</p>
            </div>
          </div>
        </div>

        {/* ---------------- Controls ---------------- */}
        <div className="mt-7 flex items-center justify-center gap-4">
          <button type="button" onClick={() => go(i - 1)} aria-label="Previous"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-muted shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:text-brand">
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            {SLIDES.map((s, idx) => (
              <button key={s.src} type="button" onClick={() => go(idx)} aria-label={`Show ${s.label}`}
                className="group/dot relative h-2.5 overflow-hidden rounded-full transition-all duration-500"
                style={{ width: idx === i ? 34 : 10, background: idx === i ? "transparent" : "var(--color-line)" }}>
                {idx === i && (
                  <span className="absolute inset-0 rounded-full transition-colors duration-700" style={{ background: s.accent }} />
                )}
              </button>
            ))}
          </div>

          <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? "Play" : "Pause"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-muted shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:text-brand">
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>

          <button type="button" onClick={() => go(i + 1)} aria-label="Next"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-muted shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:text-brand">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
