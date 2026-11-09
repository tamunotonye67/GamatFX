import { useReveal } from "../lib/useReveal";
import { Star, Quote, Plus, MapPin } from "lucide-react";
import { navigate } from "../lib/router";
import { useStore, type ReviewItem } from "../lib/store";

function ReviewCard({ r, compact = false }: { r: ReviewItem; compact?: boolean }) {
  const initials = r.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (compact) {
    return (
      <div className="pr-5 shrink-0">
        <figure className="flex h-full w-[290px] flex-col justify-between rounded-2xl border border-line bg-white p-5 shadow-[0_12px_32px_-18px_rgba(22,24,28,0.22)]">
          {/* Header: Student profile + Stars */}
          <div>
            <figcaption className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {r.userAvatar ? (
                  <img
                    src={r.userAvatar}
                    alt={r.userName}
                    className="h-10 w-10 rounded-full object-cover border border-line shrink-0"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-xs font-bold text-white shrink-0">
                    {initials}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink truncate">{r.userName}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted truncate">
                    <MapPin className="h-3 w-3 shrink-0 text-brand" /> {r.userLocation}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star
                    key={k}
                    className={`h-3.5 w-3.5 ${
                      k < r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
            </figcaption>

            {/* Quote */}
            <blockquote className="mt-4 text-[13px] leading-relaxed text-ink/80 line-clamp-3">
              “{r.comment}”
            </blockquote>
          </div>

          {/* Footer badge */}
          <div className="mt-4 flex items-center justify-between border-t border-line/80 pt-3.5">
            <span className="truncate max-w-[210px] rounded-full bg-brand-light px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-brand">
              {r.targetTitle}
            </span>
            <Quote className="h-4 w-4 text-brand/25 shrink-0" />
          </div>
        </figure>
      </div>
    );
  }

  return (
    <figure className="card w-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2">
          <Quote className="h-6 w-6 text-brand/30 shrink-0" />
          <span className="truncate max-w-[180px] rounded-full border border-line bg-cream px-2.5 py-0.5 text-[11px] font-semibold text-brand">
            {r.targetTitle}
          </span>
        </div>

        <blockquote className="mt-4 text-sm leading-relaxed text-ink/80">
          “{r.comment}”
        </blockquote>
      </div>

      <div>
        <div className="mt-5 flex items-center gap-1 text-amber-400">
          {Array.from({ length: 5 }).map((_, k) => (
            <Star
              key={k}
              className={`h-3.5 w-3.5 ${
                k < r.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
              }`}
            />
          ))}
        </div>

        <figcaption className="mt-4 flex items-center gap-3 border-t border-line pt-4">
          {r.userAvatar ? (
            <img
              src={r.userAvatar}
              alt={r.userName}
              className="h-11 w-11 rounded-full object-cover border border-line shrink-0"
            />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-sm font-bold text-white shrink-0">
              {initials}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink truncate">{r.userName}</p>
            <p className="flex items-center gap-1 text-xs text-muted truncate">
              <MapPin className="h-3 w-3 shrink-0 text-brand" /> {r.userLocation}
            </p>
          </div>
        </figcaption>
      </div>
    </figure>
  );
}

export default function Testimonials() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const { reviews } = useStore();

  const displayReviews = reviews.slice(0, 6);
  const mid = Math.ceil(displayReviews.length / 2);
  const firstHalf = displayReviews.slice(0, mid);
  const secondHalf = displayReviews.slice(mid).length > 0 ? displayReviews.slice(mid) : firstHalf;

  // Duplicate each row for a seamless 50% loop
  const row1 = [...firstHalf, ...firstHalf];
  const row2 = [...secondHalf, ...secondHalf];

  return (
    <section id="reviews" className="section overflow-hidden bg-white">
      <div ref={ref} className="container-x">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="eyebrow">Student Testimonials & Ratings</span>
            <h2 className="section-title mt-2">Verified Student Reviews</h2>
            <p className="mt-3 text-muted">
              Real feedback from traders worldwide who completed our video courses, 1-on-1 mentorship, institutional services, and live events.
            </p>
          </div>
          <div className="shrink-0 flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/reviews")}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Rate a Course or Service
            </button>
          </div>
        </div>

        {/* Mobile 2-line counter-scrolling marquee (< md) */}
        <div className="mt-10 space-y-5 md:hidden -mx-4 overflow-hidden py-3">
          {/* Line 1: Right to Left */}
          <div className="flex w-max animate-marquee-left">
            {row1.map((r, idx) => (
              <ReviewCard key={`row1-${r.id}-${idx}`} r={r} compact />
            ))}
          </div>

          {/* Line 2: Left to Right */}
          <div className="flex w-max animate-marquee-right">
            {row2.map((r, idx) => (
              <ReviewCard key={`row2-${r.id}-${idx}`} r={r} compact />
            ))}
          </div>
        </div>

        {/* Tablet & Desktop Grid (>= md) */}
        <div className="mt-12 hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
          {displayReviews.map((r, i) => (
            <div
              key={r.id}
              className={`reveal ${visible ? "is-visible" : ""} flex`}
              style={{ transitionDelay: `${(i % 3) * 110}ms` }}
            >
              <ReviewCard r={r} />
            </div>
          ))}
        </div>

        <div className="mt-10 md:mt-12 text-center">
          <button type="button" onClick={() => navigate("/reviews")} className="btn-outline-dark">
            View All Reviews & Submit Rating
          </button>
        </div>
      </div>
    </section>
  );
}
