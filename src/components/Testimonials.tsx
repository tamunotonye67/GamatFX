import { useReveal } from "../lib/useReveal";
import { Star, Quote, Plus, MapPin } from "lucide-react";
import { navigate } from "../lib/router";
import { useStore } from "../lib/store";

export default function Testimonials() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const { reviews } = useStore();

  const displayReviews = reviews.slice(0, 6);

  return (
    <section id="reviews" className="section bg-white">
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

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayReviews.map((r, i) => {
            const initials = r.userName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <figure
                key={r.id}
                className={`card reveal ${visible ? "is-visible" : ""} flex flex-col justify-between`}
                style={{ transitionDelay: `${(i % 3) * 110}ms` }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Quote className="h-6 w-6 text-brand/30 shrink-0" />
                    <span className="rounded-full border border-line bg-cream px-2.5 py-0.5 text-[11px] font-semibold text-brand">
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
                        className="h-11 w-11 rounded-full object-cover border border-line"
                      />
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-sm font-bold text-white shrink-0">
                        {initials}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-ink truncate">{r.userName}</p>
                      <p className="flex items-center gap-1 text-xs text-muted">
                        <MapPin className="h-3 w-3 shrink-0 text-brand" /> {r.userLocation}
                      </p>
                    </div>
                  </figcaption>
                </div>
              </figure>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button type="button" onClick={() => navigate("/reviews")} className="btn-outline-dark">
            View All Reviews & Submit Rating
          </button>
        </div>
      </div>
    </section>
  );
}
