import { useMemo, useState } from "react";
import PageHero from "../components/PageHero";
import PageCta from "../components/PageCta";
import Counter from "../components/Counter";
import { useReveal } from "../lib/useReveal";
import { Star, Quote, BadgeCheck, Plus, X, MapPin, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { useStore } from "../lib/store";
import { navigate } from "../lib/router";

const filters = ["All", "Courses", "Mentorship", "Services", "Events"] as const;

function SubmitReviewModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, isAuthed, addReview, managedCourses, allEvents } = useStore();
  const [targetType, setTargetType] = useState<"course" | "mentorship" | "service" | "event">("course");
  const [targetTitle, setTargetTitle] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [location, setLocation] = useState(user?.country ? `${user.country}` : "Lagos, Nigeria");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Available titles based on targetType
  const options = useMemo(() => {
    if (targetType === "course") {
      return managedCourses.map((c) => ({ id: c.id, title: c.title }));
    }
    if (targetType === "event") {
      return allEvents.map((e) => ({ id: e.id, title: e.title }));
    }
    if (targetType === "mentorship") {
      return [
        { id: "pro-trader", title: "Pro Trader 1-on-1 Mentorship" },
        { id: "executive-bootcamp", title: "Executive Trader Bootcamp" },
      ];
    }
    return [
      { id: "desk-execution", title: "Institutional Desk Execution" },
      { id: "macro-blueprint", title: "Macroeconomic Advisory Blueprint" },
    ];
  }, [targetType, managedCourses, allEvents]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthed) {
      setError("Please sign in to submit a review.");
      return;
    }

    const selectedTitle = targetTitle || options[0]?.title || "Price Action Mastery";
    const selectedId = options.find((o) => o.title === selectedTitle)?.id || "generic";

    const res = addReview({
      targetType,
      targetId: selectedId,
      targetTitle: selectedTitle,
      rating,
      comment,
      userLocation: location,
    });

    if (!res.ok) {
      setError(res.error || "Failed to submit review.");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-[fadeIn_.2s_ease]">
      <div className="relative w-full max-w-lg rounded-3xl border border-line bg-white p-6 md:p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-muted hover:bg-line/50 hover:text-ink transition"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-brand" />
            <h3 className="mt-4 font-display text-2xl font-extrabold text-ink">Thank you for your rating!</h3>
            <p className="mt-2 text-sm text-muted">
              Your review has been published in real-time and saved to our database.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10 text-brand font-bold">
                ★
              </span>
              <div>
                <h3 className="font-display text-xl font-extrabold text-ink">Rate Your Experience</h3>
                <p className="text-xs text-muted">Share your feedback on GAMAT courses, mentorship & services.</p>
              </div>
            </div>

            {!isAuthed ? (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-amber-600" />
                <p className="mt-2 text-sm font-semibold text-amber-900">Sign in required</p>
                <p className="mt-1 text-xs text-amber-700">
                  Please log in to your student profile to post a rating and review.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate("/login");
                  }}
                  className="btn-primary mt-4 text-xs py-2 px-6"
                >
                  Log In Now
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                    {error}
                  </div>
                )}

                {/* Target Type */}
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                    What are you rating?
                  </label>
                  <select
                    value={targetType}
                    onChange={(e) => {
                      const tt = e.target.value as any;
                      setTargetType(tt);
                      setTargetTitle("");
                    }}
                    className="w-full rounded-xl border border-line bg-white p-3 text-sm font-semibold text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15 cursor-pointer"
                  >
                    <option value="course">📚 Video Course</option>
                    <option value="mentorship">🎓 1-on-1 Mentorship</option>
                    <option value="service">💼 Institutional Service</option>
                    <option value="event">🎟️ Event / Summit</option>
                  </select>
                </div>

                {/* Specific Title */}
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                    Select Item
                  </label>
                  <select
                    value={targetTitle || options[0]?.title || ""}
                    onChange={(e) => setTargetTitle(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white p-3 text-sm font-semibold text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15 cursor-pointer"
                  >
                    {options.map((o) => (
                      <option key={o.id} value={o.title}>
                        {o.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Star Rating Picker */}
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                    Your Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-line bg-cream p-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 transition transform hover:scale-125"
                      >
                        <Star
                          className={`h-7 w-7 ${
                            star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-auto font-display text-lg font-bold text-ink">{rating}.0 / 5.0</span>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                    Your Location (City, Country)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lagos, Nigeria or London, UK"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white p-3 text-sm text-ink outline-none transition focus:border-brand"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                    Your Detailed Review & Feedback
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us what you learned, your trading results, or how our mentors helped your strategy..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white p-3 text-sm text-ink outline-none transition focus:border-brand"
                  />
                </div>

                <button type="submit" className="btn-primary w-full inline-flex items-center justify-center gap-2 py-3.5">
                  <Send className="h-4 w-4" /> Submit Review
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Summary() {
  const { reviews } = useStore();

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : "5.0";

  const counts = [5, 4, 3, 2, 1].map((star) => {
    const c = reviews.filter((r) => Math.round(r.rating) === star).length;
    const pct = totalReviews > 0 ? Math.round((c / totalReviews) * 100) : star === 5 ? 100 : 0;
    return { stars: star, pct };
  });

  return (
    <section className="border-b border-line bg-white py-14">
      <div className="container-x grid gap-10 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div className="text-center lg:text-left">
          <div className="font-display text-6xl font-extrabold text-ink">{avgRating}</div>
          <div className="mt-2 flex justify-center gap-1 lg:justify-start">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="mt-2 text-sm text-muted">Average rating from verified students</p>
        </div>

        <div className="space-y-2">
          {counts.map((b) => (
            <div key={b.stars} className="flex items-center gap-3">
              <span className="w-12 shrink-0 text-xs font-semibold text-muted">{b.stars} star</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${b.pct}%` }} />
              </div>
              <span className="w-10 shrink-0 text-right text-xs text-muted">{b.pct}%</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-8 text-center lg:gap-10">
          <div>
            <div className="font-display text-3xl font-extrabold text-brand">
              <Counter end={totalReviews} suffix="+" />
            </div>
            <p className="mt-1 text-sm text-muted">Verified Reviews</p>
          </div>
          <div>
            <div className="font-display text-3xl font-extrabold text-brand">
              <Counter end={4000} suffix="+" />
            </div>
            <p className="mt-1 text-sm text-muted">Active Students</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Wall({ onOpenModal }: { onOpenModal: () => void }) {
  const [active, setActive] = useState<(typeof filters)[number]>("All");
  const { ref, visible } = useReveal<HTMLDivElement>();
  const { reviews } = useStore();

  const shown = useMemo(() => {
    if (active === "All") return reviews;
    if (active === "Courses") return reviews.filter((r) => r.targetType === "course");
    if (active === "Mentorship") return reviews.filter((r) => r.targetType === "mentorship");
    if (active === "Services") return reviews.filter((r) => r.targetType === "service");
    if (active === "Events") return reviews.filter((r) => r.targetType === "event");
    return reviews;
  }, [active, reviews]);

  return (
    <section className="section bg-cream">
      <div ref={ref} className="container-x">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="eyebrow">Real Time Ratings</span>
            <h2 className="section-title mt-2">What our students say</h2>
            <p className="mt-3 text-muted">
              Live feedback from verified traders who completed GAMAT video courses, 1-on-1 mentorship, institutional services, or summit workshops.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenModal}
            className="btn-primary inline-flex items-center gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" /> Rate a Course or Service
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="mt-10 flex flex-wrap gap-2.5 border-b border-line pb-4">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActive(f)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                active === f
                  ? "bg-brand text-white shadow-sm"
                  : "border border-line bg-white text-ink/70 hover:border-brand hover:text-brand"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((r, i) => {
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
                style={{ transitionDelay: `${(i % 3) * 100}ms` }}
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
                        className="h-11 w-11 rounded-full object-cover border border-line shrink-0"
                      />
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-sm font-bold text-white shrink-0">
                        {initials}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 font-semibold text-ink truncate">
                        {r.userName}
                        <BadgeCheck className="h-4 w-4 shrink-0 text-brand" />
                      </p>
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
      </div>
    </section>
  );
}

export default function ReviewsPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <PageHero
        crumb="Reviews & Ratings"
        eyebrow="Student Ratings"
        image="/images/about.jpg"
        title={<>Real results from <span className="text-brand">real traders</span></>}
        subtitle="We measure success by whether our students can trade profitably without us. Rate our courses, 1-on-1 mentorship, services and live events."
      />

      <Summary />
      <Wall onOpenModal={() => setModalOpen(true)} />

      {/* Featured story */}
      <section className="section bg-ink text-white">
        <div className="container-x mx-auto max-w-3xl text-center">
          <Quote className="mx-auto h-10 w-10 text-brand" />
          <p className="mt-6 font-display text-2xl font-bold leading-snug md:text-3xl">
            “I joined GAMAT after two years of losing money to signal groups. Within
            six months I was consistently profitable — not because someone told me
            what to buy, but because I finally understood the market myself.”
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand font-bold">
              DE
            </span>
            <div className="text-left">
              <p className="font-semibold">Daniel Etim</p>
              <p className="text-sm text-white/55">Pro Trader Mentorship · Nigeria</p>
            </div>
          </div>
        </div>
      </section>

      <PageCta
        tone="light"
        title="Write your own success story"
        body="Join the next intake, master price action & market fundamentals, and leave your own review."
        primaryLabel="Browse Courses"
        primaryTo="/courses"
      />

      <SubmitReviewModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
