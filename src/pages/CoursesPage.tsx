import { useMemo, useState } from "react";
import PageHero from "../components/PageHero";
import PageCta from "../components/PageCta";
import Faq from "../components/Faq";
import { useReveal } from "../lib/useReveal";
import { navigate } from "../lib/router";
import { COURSES, totalLessons, naira } from "../lib/courses";
import { useStore } from "../lib/store";
import {
  Clock, Users, PlayCircle, Star, BadgeCheck, ArrowUpRight,
  Infinity as InfinityIcon, Award, MonitorPlay, CheckCircle2, BookOpen,
} from "lucide-react";

const filters = ["All", "Beginner", "Fundamental", "Technical", "Mentorship"] as const;

const includes = [
  { icon: InfinityIcon, title: "Lifetime access", body: "Including every future update to the course." },
  { icon: MonitorPlay, title: "Live sessions", body: "Weekly market breakdowns with our mentors." },
  { icon: Award, title: "Certificate", body: "Issued on completion of any full program." },
  { icon: Users, title: "Private community", body: "Ongoing peer and mentor support." },
];

function Catalogue() {
  const [active, setActive] = useState<(typeof filters)[number]>("All");
  const { ref, visible } = useReveal<HTMLDivElement>();
  const { isEnrolled, progressOf, priceOf, courseSettings, managedCourses, admin } = useStore();

  const shown = useMemo(() => {
    const live = COURSES.filter((c) => courseSettings[c.id]?.published !== false);
    return active === "All" ? live : live.filter((c) => c.tag === active);
  }, [active, courseSettings]);

  const customShown = useMemo(() => {
    const live = managedCourses.filter((c) => c.published);
    return active === "All" ? live : live.filter((c) => c.tag === active);
  }, [active, managedCourses]);

  const enrolledCount = (id: string) =>
    admin.enrollments.filter((e) => e.courseId === id).length;

  const lessonCount = (c: (typeof customShown)[number]) =>
    (c.modules ?? []).reduce((n, m) => n + (m.lessons?.length ?? 0), 0);

  return (
    <section className="section bg-white">
      <div ref={ref} className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center">Course catalogue</span>
          <h2 className="section-title mt-4">Find the right program for you</h2>
          <p className="mt-4 text-muted">Every course is practical, self-paced and backed by live mentorship.</p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {filters.map((f) => (
            <button key={f} type="button" onClick={() => setActive(f)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                active === f ? "bg-brand text-white shadow-sm" : "border border-line bg-white text-ink/70 hover:border-brand hover:text-brand"
              }`}>
              {f}
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((c, i) => {
            const owned = isEnrolled(c.id);
            const progress = progressOf(c.id);
            return (
              <div key={c.id}
                className={`group flex flex-col overflow-hidden rounded-3xl border bg-white shadow-[0_18px_50px_-30px_rgba(22,24,28,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(22,24,28,0.45)] ${
                  c.featured ? "border-brand/40" : "border-line"
                } reveal ${visible ? "is-visible" : ""}`}
                style={{ transitionDelay: `${(i % 3) * 110}ms` }}>

                {/* Poster */}
                <button onClick={() => navigate(`/courses/${c.id}`)} className="relative block">
                  <img src={c.poster} alt={c.title} className="aspect-video w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
                    <span className="chip">{c.tag}</span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {c.rating}
                    </span>
                  </div>
                  {c.featured && (
                    <span className="absolute left-4 top-4 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">Most Popular</span>
                  )}
                  {owned && (
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-brand">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Enrolled
                    </span>
                  )}
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand shadow-xl">
                      <PlayCircle className="h-7 w-7 text-white" />
                    </span>
                  </span>
                </button>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-lg font-bold leading-snug text-ink">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{c.short}</p>

                  <ul className="mt-4 space-y-2">
                    {c.outcomes.slice(0, 3).map((o) => (
                      <li key={o} className="flex items-start gap-2 text-xs text-ink/75">
                        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {o}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
                    <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-brand" /> {c.duration}</span>
                    <span className="inline-flex items-center gap-1.5"><PlayCircle className="h-3.5 w-3.5 text-brand" /> {totalLessons(c)} lessons</span>
                    <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-brand" /> {c.enrolled.toLocaleString()}</span>
                  </div>

                  {owned && (
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                        <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-brand">{progress}%</span>
                    </div>
                  )}

                  <div className="mt-auto flex items-center justify-between border-t border-line pt-5">
                    <div>
                      {owned ? (
                        <p className="text-sm font-bold text-brand">Owned</p>
                      ) : (
                        <>
                          <p className="text-xs text-muted">One-time</p>
                          <p className="font-display text-2xl font-extrabold text-ink">{naira(priceOf(c.id))}</p>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(owned ? `/learn/${c.id}` : `/courses/${c.id}`)}
                      className="btn-primary"
                    >
                      {owned ? "Continue" : "Enroll"} <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {customShown.length > 0 && (
          <div className="mt-16">
            <div className="mx-auto max-w-2xl text-center">
              <span className="eyebrow justify-center">New programmes</span>
              <h3 className="mt-3 font-display text-2xl font-extrabold text-ink md:text-3xl">Recently added courses</h3>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {customShown.map((c) => {
                const owned = isEnrolled(c.id);
                const lessons = lessonCount(c);
                const people = enrolledCount(c.id);
                return (
                  <div key={c.id} className="card flex flex-col overflow-hidden !p-0">
                    <button type="button" onClick={() => navigate(`/courses/${c.id}`)} className="relative aspect-video w-full bg-ink text-left">
                      <img src={c.poster || "/images/about-hero.jpg"} alt={c.title} className="h-full w-full object-cover opacity-80" />
                      <span
                        className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg"
                        style={{ background: c.iconColor || "#dc3545" }}
                      >
                        <BookOpen className="h-5 w-5" />
                      </span>
                      {c.featured && (
                        <span className="absolute right-4 top-4 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">Featured</span>
                      )}
                    </button>
                    <div className="flex flex-1 flex-col p-6">
                      <span className="chip w-fit">{c.tag}</span>
                      <h3 className="mt-3 font-display text-lg font-bold text-ink">{c.title}</h3>
                      <p className="mt-2 text-sm text-muted">{c.short}</p>
                      {(c.outcomes?.length ?? 0) > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {c.outcomes.slice(0, 3).map((o) => (
                            <li key={o} className="flex items-start gap-2 text-xs text-ink/75">
                              <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" /> {o}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-brand" /> {c.duration || "Self-paced"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <PlayCircle className="h-3.5 w-3.5 text-brand" /> {lessons} lesson{lessons === 1 ? "" : "s"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-brand" /> {people.toLocaleString()} enrolled
                        </span>
                      </div>
                      {owned && (
                        <div className="mt-3 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                            <div className="h-full rounded-full bg-brand" style={{ width: `${progressOf(c.id)}%` }} />
                          </div>
                          <span className="text-xs font-bold text-brand">{progressOf(c.id)}%</span>
                        </div>
                      )}
                      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                        <div>
                          <p className="text-xs text-muted">{owned ? "Owned" : "One-time"}</p>
                          <p className="font-display text-xl font-extrabold text-ink">
                            {owned ? "Enrolled" : naira(c.price)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(owned ? `/learn/${c.id}` : `/courses/${c.id}`)}
                          className="btn-primary"
                        >
                          {owned ? "Continue" : "Enroll"} <ArrowUpRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function CoursesPage() {
  return (
    <>
      <PageHero
        crumb="Courses"
        eyebrow="What we teach"
        image="/images/about-hero.jpg"
        title={<>Structured courses that build <span className="text-brand">real traders</span></>}
        subtitle="From your very first candlestick to funded-account discipline — practical programs with lifetime access, live sessions and mentorship built in."
      />

      <Catalogue />

      <section className="section bg-cream">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">Every enrollment includes</span>
            <h2 className="section-title mt-4">More than just videos</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {includes.map((inc) => (
              <div key={inc.title} className="card text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
                  <inc.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-ink">{inc.title}</h3>
                <p className="mt-2 text-sm text-muted">{inc.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Faq />

      <PageCta
        tone="red"
        title="Not sure which course to start with?"
        body="Register for the next mentorship intake and we'll place you on the right track based on your experience."
        primaryLabel="See Upcoming Events"
        primaryTo="/events"
      />
    </>
  );
}
