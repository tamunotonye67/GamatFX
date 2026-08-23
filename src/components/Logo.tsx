import { navigate } from "../lib/router";

type LogoProps = {
  variant?: "light" | "dark";
  className?: string;
  asDiv?: boolean;
};

/**
 * Minimal GAMAT mark: a rounded tile containing a 3-candle pattern
 * that also reads as the letter "G" via a subtle arc on the right.
 */
export default function Logo({ variant = "dark", className = "", asDiv = false }: LogoProps) {
  const isLight = variant === "light";
  const wordColor = isLight ? "text-white" : "text-ink";
  const subColor = isLight ? "text-white/70" : "text-muted";

  const content = (
    <>
      {/* Mark */}
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#dc3545] shadow-sm transition group-hover:shadow-md group-hover:shadow-brand/30 print:[color-adjust:exact] print:[-webkit-print-color-adjust:exact]">
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          {/* Soft chart floor */}
          <line x1="4" y1="26" x2="28" y2="26" stroke="white" strokeOpacity="0.3" strokeWidth="1" />

          {/* Bearish candle (left) */}
          <line x1="8.5" y1="7" x2="8.5" y2="24" stroke="white" strokeOpacity="0.75" strokeWidth="1.4" strokeLinecap="round" />
          <rect x="6.2" y="10" width="4.6" height="10" rx="1" fill="white" fillOpacity="0.6" />

          {/* Bullish candle (centre) — strongest */}
          <line x1="16" y1="5" x2="16" y2="24" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="13.4" y="9" width="5.2" height="12" rx="1.1" fill="white" />

          {/* Bullish candle (right) */}
          <line x1="23.5" y1="9" x2="23.5" y2="24" stroke="white" strokeOpacity="0.8" strokeWidth="1.4" strokeLinecap="round" />
          <rect x="21.2" y="13" width="4.6" height="8" rx="1" fill="white" fillOpacity="0.8" />

          {/* Subtle rising trend line through the pattern */}
          <path
            d="M5.5 21.5 C10 18.5, 13 14.5, 16.5 12.5 C20 10.5, 23 9.5, 27 8"
            stroke="white"
            strokeOpacity="0.45"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </span>

      {/* Wordmark */}
      <span className="flex flex-col items-start justify-center leading-none">
        <span className={`block font-display text-lg font-extrabold leading-none tracking-tight ${wordColor}`}>
          GAMAT<span className="text-[#dc3545]">&nbsp;Fx</span>
        </span>
        <span
          className={`mt-[3px] block text-[10px] font-semibold uppercase leading-none tracking-[0.22em] ${subColor}`}
          style={{ marginRight: "-0.22em" }}
        >
          Academy
        </span>
      </span>
    </>
  );

  if (asDiv) {
    return (
      <div className={`flex items-center gap-2.5 text-left print:flex ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => navigate("/")}
      aria-label="GAMAT Fx Academy — home"
      className={`group flex items-center gap-2.5 text-left ${className}`}
    >
      {content}
    </button>
  );
}
