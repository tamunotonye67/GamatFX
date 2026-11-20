import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Cake, Check, Copy, Gift, Sparkles, Tag, Volume2, VolumeX, X, ArrowUpRight } from "lucide-react";
import { navigate } from "../lib/router";

export type BirthdayWishModalProps = {
  open: boolean;
  onClose: () => void;
  recipientName: string;
  recipientAvatar?: string;
  couponCode?: string;
  discountPercent?: number;
};

const BALLOONS = [
  { left: "6%", color: "#dc3545", delay: "0s", dur: "6.4s", scale: 1 },
  { left: "16%", color: "#f59e0b", delay: "0.7s", dur: "7.2s", scale: 0.88 },
  { left: "28%", color: "#ec4899", delay: "1.4s", dur: "6.8s", scale: 1.05 },
  { left: "44%", color: "#8b5cf6", delay: "0.3s", dur: "7.5s", scale: 0.92 },
  { left: "61%", color: "#10b981", delay: "1.1s", dur: "6.6s", scale: 1 },
  { left: "76%", color: "#f59e0b", delay: "0.5s", dur: "7.1s", scale: 0.95 },
  { left: "88%", color: "#dc3545", delay: "1.6s", dur: "6.5s", scale: 1.08 },
];

const CONFETTI = Array.from({ length: 32 }, (_, idx) => {
  const colors = ["#dc3545", "#fbbf24", "#34d399", "#f472b6", "#60a5fa", "#a78bfa", "#ffffff"];
  return {
    id: idx,
    left: `${(idx * 3.1 + (idx % 5) * 1.7) % 98}%`,
    color: colors[idx % colors.length],
    delay: `${((idx * 0.23) % 3.2).toFixed(2)}s`,
    dur: `${(3.2 + (idx % 5) * 0.55).toFixed(2)}s`,
    w: idx % 3 === 0 ? 10 : 7,
    h: idx % 2 === 0 ? 14 : 8,
  };
});

/** Plays a cheerful celebratory birthday chime using Web Audio API. */
function playBirthdayMelody(ctxRef: React.MutableRefObject<AudioContext | null>) {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new AudioCtx();
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    // Celebratory "Happy Birthday" opening phrase + sparkle chord
    const notes: [number, number, number][] = [
      [392.0, 0.0, 0.18],   // G4
      [392.0, 0.22, 0.16],  // G4
      [440.0, 0.42, 0.34],  // A4
      [392.0, 0.8, 0.34],   // G4
      [523.25, 1.18, 0.34], // C5
      [493.88, 1.56, 0.55], // B4
      // Sparkle arpeggio
      [523.25, 2.25, 0.14], // C5
      [659.25, 2.36, 0.14], // E5
      [783.99, 2.47, 0.18], // G5
      [1046.5, 2.6, 0.45],  // C6
    ];

    const now = ctx.currentTime + 0.03;
    notes.forEach(([freq, offset, dur]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + offset);

      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.11, now + offset + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + dur + 0.03);
    });
  } catch {
    // Ignore audio errors on restricted devices
  }
}

export default function BirthdayWishModal({
  open,
  onClose,
  recipientName,
  recipientAvatar,
  couponCode,
  discountPercent = 15,
}: BirthdayWishModalProps) {
  const [muted, setMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!open) return;
    if (!muted) {
      playBirthdayMelody(audioCtxRef);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, muted, onClose]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        void audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  if (!open || typeof document === "undefined") return null;

  const firstName = recipientName.trim().split(/\s+/)[0] || "Trader";
  const initials =
    recipientName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0] || "")
      .join("")
      .toUpperCase() || "GF";

  const handleCopyCoupon = () => {
    if (!couponCode) return;
    try {
      void navigator.clipboard.writeText(couponCode);
    } catch {}
    try {
      sessionStorage.setItem("gamat_claimed_coupon", couponCode);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const handleUseCoupon = () => {
    if (couponCode) {
      try {
        sessionStorage.setItem("gamat_claimed_coupon", couponCode);
      } catch {}
    }
    onClose();
    navigate("/courses");
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`Happy Birthday ${firstName}`}
      onClick={onClose}
    >
      {/* Falling celebration papers (confetti) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {CONFETTI.map((c) => (
          <span
            key={c.id}
            className="absolute -top-6 rounded-xs will-change-transform"
            style={{
              left: c.left,
              width: `${c.w}px`,
              height: `${c.h}px`,
              backgroundColor: c.color,
              animation: `bdayConfettiFall ${c.dur} linear ${c.delay} infinite`,
            }}
          />
        ))}

        {/* Floating celebratory balloons */}
        {BALLOONS.map((b, i) => (
          <div
            key={i}
            className="absolute bottom-0 will-change-transform"
            style={{
              left: b.left,
              animation: `bdayBalloonFloat ${b.dur} ease-in-out ${b.delay} infinite`,
            }}
          >
            <div
              className="relative flex flex-col items-center"
              style={{ transform: `scale(${b.scale})` }}
            >
              <div
                className="h-14 w-11 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] shadow-lg relative"
                style={{
                  background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.65), ${b.color} 55%)`,
                }}
              >
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2.5 rotate-45"
                  style={{ backgroundColor: b.color }}
                />
              </div>
              <div className="h-12 w-px bg-white/45" />
            </div>
          </div>
        ))}
      </div>

      {/* Birthday Wish Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900 via-[#121622] to-slate-950 text-white shadow-[0_30px_90px_-20px_rgba(220,53,69,0.55)] animate-[riseIn_.4s_cubic-bezier(.22,1,.36,1)]"
      >
        {/* Top celebratory ribbon */}
        <div className="relative bg-gradient-to-r from-brand via-rose-500 to-amber-500 px-6 pt-7 pb-8 text-center">
          <div className="absolute right-3 top-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (muted) {
                  setMuted(false);
                  playBirthdayMelody(audioCtxRef);
                } else {
                  setMuted(true);
                }
              }}
              aria-label={muted ? "Unmute celebration sound" : "Mute celebration sound"}
              title={muted ? "Play birthday chime" : "Mute sound"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-white/90 hover:bg-black/40 transition cursor-pointer"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close birthday card"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-white/90 hover:bg-black/40 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white/40 bg-white/15 shadow-lg backdrop-blur-sm overflow-hidden">
            {recipientAvatar ? (
              <img src={recipientAvatar} alt={recipientName} className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-xl font-black text-white">{initials}</span>
            )}
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-amber-200">
            <Sparkles className="h-3 w-3" /> Birthday Celebration
          </span>

          <h2 className="mt-2.5 font-display text-2xl sm:text-3xl font-black tracking-tight text-white">
            Happy Birthday, {firstName}!
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-5">
          <div className="mx-auto -mt-10 flex h-11 w-11 items-center justify-center rounded-full border-4 border-slate-900 bg-amber-400 text-slate-950 shadow-lg">
            <Cake className="h-5 w-5" />
          </div>

          <p className="text-sm leading-relaxed text-slate-300">
            From everyone at <strong className="text-white">GAMAT Fx Academy</strong>, we wish you a
            joyful birthday and a year filled with sharp discipline, high-probability setups, and
            consistent growth on and off the charts!
          </p>

          {couponCode && (
            <div className="rounded-2xl border border-dashed border-amber-400/50 bg-amber-500/10 p-4 text-center space-y-2.5">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                <Gift className="h-3.5 w-3.5" /> Your Birthday Gift • {discountPercent}% OFF
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-black/50 px-3.5 py-2 font-mono text-sm font-black tracking-widest text-amber-200 border border-amber-400/30">
                  <Tag className="h-3.5 w-3.5 text-amber-400" />
                  {couponCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCoupon}
                  className="inline-flex items-center gap-1 rounded-xl bg-amber-400 px-3 py-2 text-xs font-black text-slate-950 hover:bg-amber-300 transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Apply this code at checkout on any course, mentorship, or store item.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            {couponCode ? (
              <button
                type="button"
                onClick={handleUseCoupon}
                className="btn-primary flex-1 justify-center !py-2.5 cursor-pointer"
              >
                Claim {discountPercent}% Gift <ArrowUpRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/forum");
                }}
                className="btn-primary flex-1 justify-center !py-2.5 cursor-pointer"
              >
                Celebrate in Forum <ArrowUpRight className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white/85 hover:bg-white/10 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
