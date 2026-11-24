import { ArrowUpRight } from "lucide-react";
import { CONTACT } from "../lib/contact";
import { useStore } from "../lib/store";
import { normalizeImageUrl, DEFAULT_FALLBACK_IMAGES } from "../lib/imageUrl";

const FALLBACK_AVATARS = [
  "/images/team/founder.jpg",
  "/images/team/mentor-1.jpg",
  "/images/team/mentor-2.jpg",
  "/images/team/mentor-3.jpg",
];

export default function YoutubeSessionsBanner({ className = "" }: { className?: string }) {
  const { teamMembers } = useStore();

  const avatars = (teamMembers || [])
    .filter((m) => m.status === "published" && m.image)
    .slice(0, 5)
    .map((m) => ({
      name: m.name,
      src: normalizeImageUrl(m.image, DEFAULT_FALLBACK_IMAGES.avatar),
    }));

  const displayAvatars =
    avatars.length > 0
      ? avatars
      : FALLBACK_AVATARS.map((src, i) => ({ name: `Mentor ${i + 1}`, src }));

  return (
    <div className={`rounded-2xl border border-line/80 bg-white/70 p-1.5 shadow-xs ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-line bg-white overflow-hidden">
        {/* Left Red Animated Chartlines Visual Block */}
        <div className="relative h-20 md:h-28 w-full md:w-36 shrink-0 overflow-hidden bg-gradient-to-br from-[#ef3b47] via-brand to-brand-dark">
          <svg
            viewBox="0 0 160 120"
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

            {/* Subtle animated candlesticks */}
            <g opacity="0.45" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2">
              <line x1="22" y1="74" x2="22" y2="96" />
              <rect x="19" y="79" width="6" height="12" rx="1.2" fill="rgba(255,255,255,0.75)" />

              <line x1="44" y1="62" x2="44" y2="88" />
              <rect x="41" y="67" width="6" height="14" rx="1.2" fill="rgba(255,255,255,0.35)" />

              <line x1="66" y1="54" x2="66" y2="82" />
              <rect x="63" y="59" width="6" height="15" rx="1.2" fill="rgba(255,255,255,0.85)" />

              <line x1="88" y1="42" x2="88" y2="70" />
              <rect x="85" y="48" width="6" height="13" rx="1.2" fill="rgba(255,255,255,0.85)" />

              <line x1="110" y1="36" x2="110" y2="62" />
              <rect x="107" y="40" width="6" height="14" rx="1.2" fill="rgba(255,255,255,0.4)" />

              <line x1="132" y1="22" x2="132" y2="50" />
              <rect x="129" y="27" width="6" height="15" rx="1.2" fill="rgba(255,255,255,0.9)" />

              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,2; 0,-3; 0,2"
                dur="3.6s"
                repeatCount="indefinite"
              />
            </g>

            {/* Area fill under chartline */}
            <path
              d="M -10,94 L 18,84 L 42,74 L 64,78 L 88,54 L 112,48 L 136,28 L 170,20 L 170,125 L -10,125 Z"
              fill="url(#gamat-area)"
            />

            {/* Primary glowing animated vector chartline */}
            <path
              id="gamat-wave-path"
              d="M -10,94 L 18,84 L 42,74 L 64,78 L 88,54 L 112,48 L 136,28 L 170,20"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
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
              d="M -10,104 Q 40,88 80,68 T 170,34"
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
            <circle r="4" fill="#ffffff" opacity="0.95">
              <animateMotion
                dur="3.2s"
                repeatCount="indefinite"
                path="M -10,94 L 18,84 L 42,74 L 64,78 L 88,54 L 112,48 L 136,28 L 170,20"
              />
            </circle>
            <circle r="8" fill="rgba(255,255,255,0.3)">
              <animateMotion
                dur="3.2s"
                repeatCount="indefinite"
                path="M -10,94 L 18,84 L 42,74 L 64,78 L 88,54 L 112,48 L 136,28 L 170,20"
              />
              <animate attributeName="r" values="5;10;5" dur="1.4s" repeatCount="indefinite" />
            </circle>
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/10" />
        </div>

        {/* Middle Title + Stacked Avatars + Description */}
        <div className="min-w-0 flex-1 px-4 md:px-2 py-1 md:py-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-display text-base sm:text-lg font-extrabold text-ink tracking-tight">
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
                      (e.currentTarget as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGES.avatar;
                    }}
                    className="h-6 w-6 rounded-full object-cover ring-2 ring-white bg-cream"
                  />
                ))}
              </div>
              <a
                href={CONTACT.youtube}
                target="_blank"
                rel="noreferrer"
                aria-label="Open GamatFX YouTube Channel"
                className="-ml-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-cream border border-line text-ink/70 hover:text-brand hover:border-brand transition shadow-2xs"
              >
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>

          <p className="mt-1 text-xs sm:text-sm text-muted leading-relaxed">
            Missed our Port Harcourt workshops or weekly live market breakdowns? Watch full session replays, trade setups, and mentor Q&amp;As on YouTube.
          </p>
        </div>

        {/* Right CTA Button */}
        <div className="px-4 pb-4 md:pb-0 md:pr-5 md:pl-2 shrink-0 flex items-center">
          <a
            href={CONTACT.youtube}
            target="_blank"
            rel="noreferrer"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#ef3b47] to-brand-dark hover:from-brand hover:to-[#9b1c26] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-brand/25 transition active:scale-95 whitespace-nowrap"
          >
            Watch now
          </a>
        </div>
      </div>
    </div>
  );
}
