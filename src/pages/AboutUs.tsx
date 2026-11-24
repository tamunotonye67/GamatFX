import { useEffect, useState } from "react";
import PageHero from "../components/PageHero";
import Pillars from "../components/Pillars";
import Counter from "../components/Counter";
import Timeline from "../components/Timeline";
import Faq from "../components/Faq";
import { useReveal } from "../lib/useReveal";
import { navigate } from "../lib/router";
import { CONTACT } from "../lib/contact";
import { useStore } from "../lib/store";
import { loadGalleryItems, fetchSupabaseGallery, type GalleryItem } from "../lib/gallery";
import {
  ArrowUpRight,
  BadgeCheck,
  BookOpenCheck,
  BrainCircuit,
  Camera,
  ChevronLeft,
  ChevronRight,
  LineChart,
  Pause,
  Play,
  Quote,
  ShieldCheck,
  Users,
  Send,
  X,
  ZoomIn,
} from "lucide-react";

/* ---------------------------------- Story --------------------------------- */

function Story() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="section bg-cream">
      <div ref={ref} className="container-x grid items-center gap-14 lg:grid-cols-2">
        <div className={`reveal ${visible ? "is-visible" : ""}`}>
          <span className="eyebrow">Our story &amp; heritage</span>
          <h2 className="section-title mt-4">
            Built by traders, <span className="text-brand">for traders</span>
          </h2>

          <div className="mt-5 space-y-4 text-muted">
            <p>
              Born out of{" "}
              <strong className="font-semibold text-ink">
                GAMAT — Growth and Mentorship Academy with Taylor
              </strong>
              , GAMAT Fx Academy began with a simple frustration: too many aspiring
              traders were losing money to hype, signal-selling and shallow
              &ldquo;get-rich-quick&rdquo; schemes. What the market lacked was a
              legitimate, transparent institution that taught traders to actually{" "}
              <em>think</em> — to read fundamentals, understand institutional order flow,
              and manage risk like professionals.
            </p>
            <p>
              So we built one under the GAMAT umbrella. What started as a focused
              mentorship circle with Tonye S. Taylor has grown into a full academy
              training over 1,000 verified students and supporting a community of over
              2,000 traders across Africa and beyond.
            </p>
            <p>
              Today, as a core pillar of{" "}
              <strong className="font-semibold text-ink">
                Growth and Mentorship Academy with Taylor (GAMAT)
              </strong>
              , we operate as a trusted hub for financial education and digital
              empowerment — combining structured curricula, live market sessions and an
              accountable mentorship system that never manages student funds or sells
              get-rich-quick promises.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {["Part of GAMAT", "Fundamentals-first", "Risk-led", "Mentorship-driven", "Community-backed"].map(
              (t) => (
                <span key={t} className="chip">
                  <BadgeCheck className="h-3.5 w-3.5" /> {t}
                </span>
              )
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Official Parent Organization Callout */}
          <div className="col-span-2 flex items-start gap-3 rounded-2xl border border-brand/25 bg-brand-light/60 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <p className="text-xs sm:text-sm leading-relaxed text-ink/85">
              <strong className="font-bold text-ink">Official Identity:</strong>{" "}
              <span className="font-semibold text-brand">GAMAT Fx Academy</span> is the
              dedicated financial-markets and forex education division of{" "}
              <strong className="font-bold text-ink">
                GAMAT (Growth and Mentorship Academy with Taylor)
              </strong>
              .
            </p>
          </div>

          <img
            src="/images/about.jpg"
            alt="GAMAT Fx Academy students"
            className="col-span-2 h-64 w-full rounded-3xl object-cover shadow-lg"
          />
          {[
            { end: 1000, suffix: "+", label: "Students trained" },
            { end: 2000, suffix: "+", label: "Community members" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-3xl border border-line bg-white p-6 shadow-[0_14px_45px_-25px_rgba(22,24,28,0.3)]"
            >
              <div className="font-display text-3xl font-extrabold text-ink">
                <Counter end={s.end} suffix={s.suffix} />
              </div>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Founder -------------------------------- */

function Founder() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="section bg-ink text-white">
      <div ref={ref} className="container-x grid items-stretch gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
        {/* Portrait — fixed aspect so it aligns cleanly with the copy column */}
        <div className="relative min-h-[420px] overflow-hidden rounded-3xl shadow-2xl lg:min-h-full">
          <img
            src="/images/founder.jpg"
            alt="Tonye S. Taylor — Founder of GAMAT (Growth and Mentorship Academy with Taylor)"
            className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/70 to-transparent p-6">
            <p className="font-display text-lg font-bold">Tonye S. Taylor</p>
            <p className="text-sm text-brand-light">
              Founder of GAMAT (Growth and Mentorship Academy with Taylor) &amp; Lead Mentor
            </p>
          </div>
        </div>

        <div className={`reveal flex flex-col justify-center ${visible ? "is-visible" : ""}`}>
          <span className="eyebrow text-brand-light">Meet the founder</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight md:text-4xl">
            A mentor who still trades the markets he teaches
          </h2>
          <Quote className="mt-6 h-8 w-8 text-brand" />
          <p className="mt-3 text-lg leading-relaxed text-white/75">
            &ldquo;I never wanted to build another signal group. I wanted to build
            traders who could stand on their own — people who understand
            <span className="text-white"> why </span>
            price moves, not just where to click. That is the whole point of
            GAMAT — Growth and Mentorship Academy with Taylor.&rdquo;
          </p>
          <p className="mt-5 text-sm leading-relaxed text-white/60">
            With over three years navigating currencies, indices and crypto through
            multiple market cycles, Tonye S. Taylor founded{" "}
            <strong className="text-white/85">
              GAMAT (Growth and Mentorship Academy with Taylor)
            </strong>{" "}
            and its forex trading division, <strong className="text-white/85">GAMAT Fx Academy</strong>,
            mentoring over 1,000 traders through a curriculum grounded in fundamentals,
            supply &amp; demand, and disciplined risk management.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-6 border-t border-white/10 pt-6">
            {[
              { end: 3, suffix: "+", label: "Years trading" },
              { end: 12, suffix: "", label: "Programs built" },
              { end: 1000, suffix: "+", label: "Traders mentored" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-2xl font-extrabold">
                  <Counter end={s.end} suffix={s.suffix} />
                </div>
                <p className="mt-1 text-xs text-white/55">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button type="button" onClick={() => navigate("/mentor")} className="btn-primary">
              Full mentor profile <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Approach -------------------------------- */

const approach = [
  {
    icon: BookOpenCheck,
    step: "01",
    title: "Learn the foundation",
    body: "Structured lessons on market fundamentals, supply & demand and price structure — no fluff, no shortcuts.",
  },
  {
    icon: LineChart,
    step: "02",
    title: "Apply in live markets",
    body: "Weekly live sessions where we break down real setups, news events and trade management in real time.",
  },
  {
    icon: BrainCircuit,
    step: "03",
    title: "Build the mindset",
    body: "Psychology, journaling and routine coaching that turn knowledge into consistent, repeatable execution.",
  },
  {
    icon: ShieldCheck,
    step: "04",
    title: "Trade with accountability",
    body: "Personal reviews, performance tracking and a private community that keeps your discipline honest.",
  },
];

function Approach() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="section bg-white">
      <div ref={ref} className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center">How we teach</span>
          <h2 className="section-title mt-4">Our four-step approach</h2>
          <p className="mt-4 text-muted">
            A deliberate path from complete beginner to accountable, self-sufficient
            trader.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {approach.map((a, i) => (
            <div
              key={a.step}
              className={`card reveal ${visible ? "is-visible" : ""} relative`}
              style={{ transitionDelay: `${i * 110}ms` }}
            >
              <span className="absolute right-6 top-6 font-display text-4xl font-extrabold text-brand/10">
                {a.step}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
                <a.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-ink">
                {a.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{a.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- Team ---------------------------------- */

function Team() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const { publishedTeam } = useStore();

  return (
    <section id="team" className="section bg-cream">
      <div ref={ref} className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center">About the Team</span>
          <h2 className="section-title mt-4">Meet the team behind GAMAT</h2>
          <p className="mt-4 text-muted">
            Active traders, educators and mentors committed to your growth. Click a profile for the full story.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {publishedTeam.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => navigate(`/team/${m.slug}`)}
              className={`card reveal ${visible ? "is-visible" : ""} text-center transition hover:-translate-y-1`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {m.avatar ? (
                <img src={m.avatar} alt={m.name} className="mx-auto h-16 w-16 rounded-full object-cover ring-4 ring-brand/15" />
              ) : (
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark font-display text-lg font-extrabold text-white shadow-md">
                  {m.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </span>
              )}
              <h3 className="mt-4 font-display text-base font-bold text-ink">{m.name}</h3>
              <p className="mt-1 text-sm font-medium text-brand">{m.role}</p>
              <p className="mt-2 text-xs text-muted">{m.focus}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand">
                View profile <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </button>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button type="button" onClick={() => navigate("/team")} className="btn-outline-dark">
            About the Team — full directory
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Why choose ------------------------------- */

const reasons = [
  "Fundamentals-first curriculum, not recycled indicator strategies",
  "Live market breakdowns every single week",
  "Personal performance reviews and trade journaling support",
  "A 2,000+ strong community of accountable traders",
  "Mentors who actively trade the markets they teach",
  "Lifetime access to course updates and replays",
];

function WhyChoose() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="section bg-white">
      <div ref={ref} className="container-x grid items-center gap-12 lg:grid-cols-2">
        <div className={`reveal ${visible ? "is-visible" : ""}`}>
          <span className="eyebrow">The difference</span>
          <h2 className="section-title mt-4">Why traders choose GAMAT Fx Academy</h2>
          <p className="mt-4 text-muted">
            We measure our success by one thing only — whether our students can trade
            profitably without us.
          </p>

          <ul className="mt-8 space-y-4">
            {reasons.map((r) => (
              <li key={r} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
                  <BadgeCheck className="h-4 w-4" />
                </span>
                <span className="text-sm leading-relaxed text-ink/80">{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-9 text-white shadow-xl">
          <Users className="h-9 w-9" />
          <h3 className="mt-5 font-display text-2xl font-extrabold leading-snug">
            You are never trading alone
          </h3>
          <p className="mt-3 text-white/85">
            Every GAMAT student joins a private network of traders sharing analysis,
            reviewing each other's journals and growing together — long after the
            course ends.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/courses")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand transition hover:-translate-y-0.5 hover:shadow-md"
            >
              View Courses <ArrowUpRight className="h-4 w-4" />
            </button>
            <a
              href={CONTACT.telegram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              <Send className="h-4 w-4" /> Join Telegram
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Gallery --------------------------------- */

function AboutGallery() {
  const [items, setItems] = useState<GalleryItem[]>(() => loadGalleryItems());
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchSupabaseGallery().then((remote) => {
      if (mounted) setItems(remote);
    });
    const onUpdate = () => {
      if (mounted) setItems(loadGalleryItems());
    };
    window.addEventListener("gamat:gallery-updated", onUpdate);
    return () => {
      mounted = false;
      window.removeEventListener("gamat:gallery-updated", onUpdate);
    };
  }, []);

  const featured = items.filter((i) => i.featured !== false).slice(0, 6);
  const displayList = featured.length > 0 ? featured : items.slice(0, 6);
  const safeIdx = displayList.length > 0 ? activeIdx % displayList.length : 0;
  const currentSlide = displayList[safeIdx];
  const activeItem = lightboxIdx !== null ? displayList[lightboxIdx] : null;

  useEffect(() => {
    if (paused || lightboxIdx !== null || displayList.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % displayList.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [paused, lightboxIdx, displayList.length]);

  const goPrev = () => setActiveIdx((prev) => (prev - 1 + displayList.length) % displayList.length);
  const goNext = () => setActiveIdx((prev) => (prev + 1) % displayList.length);

  return (
    <section className="section bg-white">
      <div className="container-x">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">Campus &amp; Community Gallery</span>
            <h2 className="section-title mt-3">
              Inside our <span className="text-brand">Port Harcourt</span> trading floor
            </h2>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-muted">
              Real sessions from our mentorship classes, live market analysis desks, and cohort graduations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/gallery")}
            className="btn-outline-dark shrink-0 self-start sm:self-auto"
          >
            <Camera className="h-4 w-4" /> View Full Gallery <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        {currentSlide && (
          <div
            className="mt-8 space-y-4"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Main Animated Slideshow Stage */}
            <div className="relative overflow-hidden rounded-3xl border border-line bg-ink shadow-[0_24px_70px_-30px_rgba(22,24,28,0.45)]">
              <div className="relative aspect-[16/10] sm:aspect-[16/8] w-full overflow-hidden">
                {displayList.map((slide, idx) => {
                  const isCurrent = idx === safeIdx;
                  return (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-all duration-700 ease-out ${
                        isCurrent ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0 pointer-events-none"
                      }`}
                    >
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className={`h-full w-full object-cover transition-transform duration-[4500ms] ease-linear ${
                          isCurrent ? "scale-105" : "scale-100"
                        }`}
                      />
                    </div>
                  );
                })}

                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/85 via-black/25 to-black/10 pointer-events-none" />

                {/* Top Controls */}
                <div className="absolute right-3 top-3 sm:right-5 sm:top-5 z-30 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPaused((p) => !p)}
                    aria-label={paused ? "Play slideshow" : "Pause slideshow"}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition hover:bg-brand cursor-pointer"
                  >
                    {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxIdx(safeIdx)}
                    aria-label="Expand photo"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition hover:bg-brand cursor-pointer"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>

                {/* Prev / Next Arrows */}
                {displayList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      aria-label="Previous slide"
                      className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-brand cursor-pointer"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      aria-label="Next slide"
                      className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-brand cursor-pointer"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Caption Overlay */}
                <div className="absolute inset-x-0 bottom-0 z-30 p-4 sm:p-7 text-white">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          {currentSlide.category}
                        </span>
                        {currentSlide.date && (
                          <span className="text-xs font-medium text-white/70">{currentSlide.date}</span>
                        )}
                      </div>
                      <h3 className="mt-2 font-display text-lg sm:text-2xl font-bold leading-tight">
                        {currentSlide.title}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-white/80 line-clamp-2">
                        {currentSlide.caption}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white/75 shrink-0">
                      <span>{safeIdx + 1}</span>
                      <span>/</span>
                      <span>{displayList.length}</span>
                    </div>
                  </div>
                </div>

                {/* Animated Progress Dots */}
                <div className="absolute inset-x-0 bottom-0 z-30 flex h-1 bg-white/15">
                  {displayList.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActiveIdx(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`flex-1 transition-colors duration-300 cursor-pointer ${
                        idx === safeIdx ? "bg-brand" : "bg-transparent hover:bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Thumbnail Strip */}
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6 sm:gap-3">
              {displayList.map((item, idx) => {
                const isSelected = idx === safeIdx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    onDoubleClick={() => setLightboxIdx(idx)}
                    className={`group relative overflow-hidden rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? "border-brand shadow-md -translate-y-0.5"
                        : "border-line opacity-75 hover:opacity-100 hover:border-brand/50"
                    }`}
                  >
                    <div className="aspect-[16/10] w-full overflow-hidden bg-ink">
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="hidden sm:block bg-white px-2.5 py-1.5">
                      <p className={`truncate text-[11px] font-bold ${isSelected ? "text-brand" : "text-ink"}`}>
                        {item.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {activeItem && lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setLightboxIdx(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-ink text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxIdx(null)}
              aria-label="Close preview"
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-brand transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative bg-black">
              <img src={activeItem.image} alt={activeItem.title} className="max-h-[70vh] w-full object-contain" />
              {displayList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setLightboxIdx((lightboxIdx - 1 + displayList.length) % displayList.length)}
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-brand transition cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxIdx((lightboxIdx + 1) % displayList.length)}
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-brand transition cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            <div className="flex flex-col gap-1 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="rounded-full bg-brand/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                  {activeItem.category}
                </span>
                <h3 className="mt-1.5 font-display text-lg font-bold text-white">{activeItem.title}</h3>
                <p className="mt-0.5 text-xs sm:text-sm text-white/75">{activeItem.caption}</p>
              </div>
              <span className="text-xs text-white/50 shrink-0">
                {lightboxIdx + 1} / {displayList.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------------------------------- Page ---------------------------------- */

export default function AboutUs() {
  return (
    <>
      <PageHero
        crumb="About Us"
        eyebrow="Part of GAMAT (Growth and Mentorship Academy with Taylor)"
        image="/images/about-hero.jpg"
        title={
          <>
            A hub for financial education and{" "}
            <span className="text-brand">digital empowerment</span>
          </>
        }
        subtitle="GAMAT Fx Academy is an official part of GAMAT (Growth and Mentorship Academy with Taylor) — built to turn ambitious beginners into disciplined, consistently profitable traders through honest education, live market mentorship and an accountable community."
      />

      <Story />
      <Pillars />
      <Founder />
      <Approach />
      <Timeline />
      <Team />
      <AboutGallery />
      <WhyChoose />
      <Faq />

      {/* Closing CTA */}
      <section className="bg-cream pb-24">
        <div className="container-x">
          <div className="rounded-3xl border border-line bg-white px-8 py-14 text-center shadow-[0_22px_60px_-32px_rgba(22,24,28,0.4)]">
            <h2 className="section-title mx-auto max-w-2xl">
              Ready to start your trading journey with us?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Join the next mentorship intake and learn the exact framework our
              students use to trade the markets with confidence.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/events")}
                className="btn-primary"
              >
                Register for Next Class <ArrowUpRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="btn-outline-dark"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
