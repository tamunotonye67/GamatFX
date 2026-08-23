import { useReveal } from "../lib/useReveal";
import { Clock, Users, PlayCircle, Star } from "lucide-react";
import { navigate } from "../lib/router";
import { COURSES, naira, totalLessons } from "../lib/courses";
import { useStore } from "../lib/store";

/** Home-page featured courses — links straight into each course detail. */
export default function Courses() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const { priceOf, isEnrolled } = useStore();

  const featured = COURSES.filter((c) =>
    ["fundamental-supply-demand", "price-action-mastery", "pro-trader-mentorship"].includes(c.id)
  );

  return (
    <section id="courses" className="section bg-white">
      <div ref={ref} className="container-x">
        <div className="max-w-2xl">
          <span className="eyebrow">What we teach</span>
          <h2 className="section-title mt-4">Courses</h2>
          <p className="mt-4 text-muted">
            Structured, practical programs built to take you from beginner to
            consistently profitable trader.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((c, i) => {
            const owned = isEnrolled(c.id);
            return (
              <div
                key={c.id}
                className={`group flex flex-col overflow-hidden rounded-3xl border bg-white shadow-[0_18px_50px_-30px_rgba(22,24,28,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(22,24,28,0.45)] ${
                  c.featured ? "border-brand/40" : "border-line"
                } reveal ${visible ? "is-visible" : ""}`}
                style={{ transitionDelay: `${i * 110}ms` }}
              >
                <div className="relative bg-ink p-6">
                  <div className="flex items-center justify-between">
                    <span className="chip">{c.tag}</span>
                    {c.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <div className="mt-5 flex items-center gap-1.5 text-amber-400">
                    <Star className="h-4 w-4 fill-amber-400" />
                    <span className="text-sm font-semibold text-white">{c.rating}</span>
                    <span className="text-xs text-white/50">rating</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-lg font-bold leading-snug text-ink">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{c.short}</p>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-brand" /> {c.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <PlayCircle className="h-3.5 w-3.5 text-brand" /> {totalLessons(c)} lessons
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-brand" /> {c.enrolled.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
                    <div>
                      <p className="text-xs text-muted">{owned ? "Owned" : "One-time"}</p>
                      <p className="font-display text-2xl font-extrabold text-ink">
                        {owned ? "Enrolled" : naira(priceOf(c.id))}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(owned ? `/learn/${c.id}` : `/courses/${c.id}`)}
                      className="btn-primary"
                    >
                      {owned ? "Continue" : "Enroll"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button type="button" onClick={() => navigate("/courses")} className="btn-outline-dark">
            View All Courses
          </button>
        </div>
      </div>
    </section>
  );
}
