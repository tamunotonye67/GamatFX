import { useEffect, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { CONTACT } from "../lib/contact";
import { useStore } from "../lib/store";
import { normalizeImageUrl, DEFAULT_FALLBACK_IMAGES } from "../lib/imageUrl";
import { PRESET_AVATARS } from "../lib/avatars";

export default function YoutubeSessionsBanner({ className = "" }: { className?: string }) {
  const { teamMembers } = useStore();
  const [arrowHovered, setArrowHovered] = useState(false);
  const [cycleIdx, setCycleIdx] = useState(0);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("gamat.yt_banner_dismissed.v1") === "true";
    } catch {
      return false;
    }
  });

  const publishedAvatars = (teamMembers || [])
    .filter((m) => m.status === "published" && m.image)
    .map((m, idx) => ({
      name: m.name,
      src: normalizeImageUrl(m.image, PRESET_AVATARS[idx % PRESET_AVATARS.length]?.url || DEFAULT_FALLBACK_IMAGES.avatar),
      fallback: PRESET_AVATARS[idx % PRESET_AVATARS.length]?.url || DEFAULT_FALLBACK_IMAGES.avatar,
    }));

  const displayAvatars = [0, 1, 2, 3].map((idx) => {
    const preset = PRESET_AVATARS[idx % PRESET_AVATARS.length]?.url || DEFAULT_FALLBACK_IMAGES.avatar;
    return (
      publishedAvatars[idx] ?? {
        name: `Mentor ${idx + 1}`,
        src: preset,
        fallback: preset,
      }
    );
  });

  const allCycleAvatars =
    publishedAvatars.length >= 2
      ? publishedAvatars
      : PRESET_AVATARS.map((p) => ({ name: p.label, src: p.url, fallback: p.url }));

  useEffect(() => {
    if (!arrowHovered || allCycleAvatars.length <= 1) return;
    const id = window.setInterval(() => {
      setCycleIdx((prev) => (prev + 1) % allCycleAvatars.length);
    }, 220);
    return () => window.clearInterval(id);
  }, [arrowHovered, allCycleAvatars.length]);

  const activeCycleAvatar = allCycleAvatars[cycleIdx % allCycleAvatars.length] ?? displayAvatars[0];
  const speakerCountLabel =
    publishedAvatars.length > 0 ? `${publishedAvatars.length}+ mentors & speakers` : "10+ mentors & speakers";

  if (dismissed) return null;

  return (
    <div className={`group mx-auto max-w-4xl rounded-2xl border border-line/80 bg-white/70 p-1.5 shadow-xs ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-line bg-white">
        {/* Left Red Animated Chartlines Visual Block */}
        <div className="relative h-24 md:h-[88px] w-full md:w-32 shrink-0 overflow-hidden rounded-t-[11px] md:rounded-t-none md:rounded-l-[11px] bg-gradient-to-br from-[#ef3b47] via-brand to-brand-dark">
          {/* Mobile-only top-right X dismiss button (away from Watch now) */}
          <button
            type="button"
            onClick={() => {
              setDismissed(true);
              try {
                sessionStorage.setItem("gamat.yt_banner_dismissed.v1", "true");
              } catch {}
            }}
            aria-label="Dismiss GamatFX Live Sessions announcement"
            className="md:hidden absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-xs border border-white/20 transition hover:bg-black/50 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <svg
            viewBox="0 0 160 120"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 h-full w-full pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="gamat-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.34)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
              </linearGradient>
              <pattern id="gamat-chart-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.75" />
                <animateTransform
                  attributeName="patternTransform"
                  type="translate"
                  from="0 0"
                  to="-20 0"
                  dur="3.5s"
                  repeatCount="indefinite"
                />
              </pattern>
            </defs>

            {/* Scrolling grid */}
            <rect width="160" height="120" fill="url(#gamat-chart-grid)" />

            {/* Subtle animated candlesticks (centered in safe band y: 32..88) */}
            <g opacity="0.48" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2">
              <line x1="22" y1="68" x2="22" y2="88" />
              <rect x="19" y="73" width="6" height="10" rx="1.2" fill="rgba(255,255,255,0.75)" />

              <line x1="44" y1="58" x2="44" y2="82" />
              <rect x="41" y="63" width="6" height="12" rx="1.2" fill="rgba(255,255,255,0.35)" />

              <line x1="66" y1="54" x2="66" y2="78" />
              <rect x="63" y="59" width="6" height="12" rx="1.2" fill="rgba(255,255,255,0.85)" />

              <line x1="88" y1="45" x2="88" y2="69" />
              <rect x="85" y="50" width="6" height="11" rx="1.2" fill="rgba(255,255,255,0.85)" />

              <line x1="110" y1="40" x2="110" y2="62" />
              <rect x="107" y="44" width="6" height="11" rx="1.2" fill="rgba(255,255,255,0.4)" />

              <line x1="132" y1="30" x2="132" y2="54" />
              <rect x="129" y="34" width="6" height="12" rx="1.2" fill="rgba(255,255,255,0.9)" />

              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,2; 0,-2; 0,2"
                dur="3.6s"
                repeatCount="indefinite"
              />
            </g>

            {/* Area fill under chartline */}
            <path
              d="M -10,86 L 18,78 L 42,70 L 64,73 L 88,54 L 112,49 L 136,36 L 170,30 L 170,125 L -10,125 Z"
              fill="url(#gamat-area)"
            />

            {/* Primary glowing animated vector chartline */}
            <path
              id="gamat-wave-path"
              d="M -10,86 L 18,78 L 42,70 L 64,73 L 88,54 L 112,49 L 136,36 L 170,30"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="240"
              strokeDashoffset="240"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="240;0;0;-240"
                keyTimes="0;0.45;0.75;1"
                dur="3.2s"
                repeatCount="indefinite"
              />
            </path>

            {/* Secondary dashed projection line */}
            <path
              d="M -10,94 Q 40,80 80,64 T 170,40"
              fill="none"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.25"
              strokeDasharray="4 4"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-32"
                dur="2s"
                repeatCount="indefinite"
              />
            </path>

            {/* Moving price pulse dot along the chartline */}
            <circle r="3.5" fill="#ffffff" opacity="0.95">
              <animateMotion
                dur="3.2s"
                repeatCount="indefinite"
                path="M -10,86 L 18,78 L 42,70 L 64,73 L 88,54 L 112,49 L 136,36 L 170,30"
              />
            </circle>
            <circle r="7" fill="rgba(255,255,255,0.3)">
              <animateMotion
                dur="3.2s"
                repeatCount="indefinite"
                path="M -10,86 L 18,78 L 42,70 L 64,73 L 88,54 L 112,49 L 136,36 L 170,30"
              />
              <animate attributeName="r" values="4.5;8.5;4.5" dur="1.4s" repeatCount="indefinite" />
            </circle>
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/10" />
        </div>

        {/* Middle Title + Stacked Avatars + Description */}
        <div className="min-w-0 flex-1 px-4 md:px-1.5 py-1 md:py-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-sm sm:text-[15px] font-extrabold text-ink tracking-tight">
              Watch replays from GamatFX Live Sessions
            </h3>

            {/* Stacked Avatar Group + Arrow Pill */}
            <div className="inline-flex items-center">
              <div className="flex -space-x-2">
                {displayAvatars.slice(0, 4).map((a, idx) => (
                  <img
                    key={idx}
                    src={a.src}
                    alt={a.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = a.fallback;
                    }}
                    className="h-6 w-6 rounded-full object-cover ring-2 ring-white bg-cream"
                  />
                ))}
              </div>
              <div
                className="relative -ml-1.5 inline-flex items-center"
                onMouseEnter={() => setArrowHovered(true)}
                onMouseLeave={() => setArrowHovered(false)}
              >
                {arrowHovered && (
                  <div className="pointer-events-none hidden md:flex absolute bottom-full right-0 mb-2.5 z-30 items-center justify-between gap-4 rounded-2xl border border-line bg-white px-4 py-2.5 shadow-xl whitespace-nowrap">
                    <div className="text-left">
                      <p className="font-display text-sm font-bold text-ink leading-tight">Browse all</p>
                      <p className="text-xs font-medium text-muted mt-0.5">{speakerCountLabel}</p>
                    </div>
                    <img
                      src={activeCycleAvatar.src}
                      alt={activeCycleAvatar.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = activeCycleAvatar.fallback;
                      }}
                      className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-line bg-cream"
                    />
                  </div>
                )}

                <a
                  href={CONTACT.youtube}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open GamatFX YouTube Channel"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-cream border border-line text-ink/70 hover:text-brand hover:border-brand transition shadow-2xs"
                >
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          <p className="mt-1 max-w-xl md:pr-8 text-xs text-muted leading-relaxed">
            Missed our Port Harcourt workshops or weekly live market breakdowns? Watch full session replays, trade setups, and mentor Q&amp;As on YouTube.
          </p>
        </div>

        {/* Right CTA Button + Desktop Hover Dismiss X */}
        <div className="px-4 pb-4 md:pb-0 md:pr-5 md:pl-2 shrink-0 flex items-center gap-2.5">
          <div className="hidden md:block relative group/dismiss opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
            <div className="pointer-events-none absolute bottom-full right-0 mb-2.5 z-30 opacity-0 translate-y-1 group-hover/dismiss:opacity-100 group-hover/dismiss:translate-y-0 transition-all duration-150 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-medium text-ink shadow-lg whitespace-nowrap">
              Dismiss GamatFX Live Sessions announcement
            </div>
            <button
              type="button"
              onClick={() => {
                setDismissed(true);
                try {
                  sessionStorage.setItem("gamat.yt_banner_dismissed.v1", "true");
                } catch {}
              }}
              aria-label="Dismiss GamatFX Live Sessions announcement"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white text-ink/70 hover:text-ink hover:border-ink/30 shadow-2xs transition cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <a
            href={CONTACT.youtube}
            target="_blank"
            rel="noreferrer"
            className="flex-1 md:flex-none md:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#ef3b47] to-brand-dark hover:from-brand hover:to-[#9b1c26] px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand/25 transition active:scale-95 whitespace-nowrap"
          >
            Watch now
          </a>
        </div>
      </div>
    </div>
  );
}
