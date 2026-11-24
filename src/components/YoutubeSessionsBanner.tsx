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
        {/* Left Red Textured Visual Block */}
        <div className="relative h-20 md:h-28 w-full md:w-32 shrink-0 overflow-hidden bg-gradient-to-br from-[#ef3b47] via-brand to-brand-dark">
          {/* Subtle hatched globe / wave SVG matching reference aesthetic */}
          <svg
            viewBox="0 0 140 120"
            className="absolute inset-0 h-full w-full opacity-35 pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <pattern id="gamat-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,255,0.65)" strokeWidth="2" />
              </pattern>
            </defs>
            <circle cx="70" cy="92" r="56" fill="url(#gamat-hatch)" />
            <circle cx="70" cy="92" r="56" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
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
