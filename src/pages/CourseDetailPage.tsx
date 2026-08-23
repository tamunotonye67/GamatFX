import { useState } from "react";
import PageCta from "../components/PageCta";
import { getCourse, totalLessons, naira, asCourse } from "../lib/courses";
import { useStore } from "../lib/store";
import { navigate } from "../lib/router";
import {
  Play, Clock, Users, Star, BadgeCheck, ChevronDown, ChevronRight,
  Lock, CheckCircle2, Infinity as InfinityIcon, Award, MonitorPlay, ArrowUpRight, X,
} from "lucide-react";

export default function CourseDetailPage({ id }: { id: string }) {
  const { isAuthed, isEnrolled, progressOf, priceOf, managedCourses, admin } = useStore();
  const builtIn = getCourse(id);
  const managed = managedCourses.find((c) => c.id === id && c.published);
  const course = builtIn ?? (managed ? asCourse({
    ...managed,
    enrolled: admin.enrollments.filter((e) => e.courseId === id).length,
  }) : undefined);

  const [openModule, setOpenModule] = useState<number>(0);
  const [videoModal, setVideoModal] = useState<{ title: string; videoUrl: string } | null>(null);

  if (!course) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
        <h1 className="font-display text-3xl font-extrabold text-ink">Course not found</h1>
        <p className="mt-3 text-muted">The course you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/courses")} className="btn-primary mt-8">Back to Courses</button>
      </section>
    );
  }

  const enrolled = isEnrolled(course.id);
  const progress = progressOf(course.id);
  const lessons = totalLessons(course);
  const displayPrice = managed ? managed.price : priceOf(course.id);

  const onEnroll = () => {
    if (!isAuthed) { navigate(`/signup?next=/checkout/${course.id}`); return; }
    if (enrolled) { navigate(`/learn/${course.id}`); return; }
    navigate(`/checkout/${course.id}`);
  };

  const openPreview = (title = `${course.title} — Preview`, videoUrl = course.video) => {
    setVideoModal({ title, videoUrl });
  };

  return (
    <>
      {/* Video Modal */}
      {videoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/20 bg-ink shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h3 className="font-display text-base font-bold text-white truncate pr-4">{videoModal.title}</h3>
              <button
                onClick={() => setVideoModal(null)}
                className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative bg-black">
              <video
                src={videoModal.videoUrl}
                poster={course.poster}
                controls
                autoPlay
                playsInline
                controlsList="nodownload"
                className="aspect-video w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 -z-10">
          <img src={course.poster} alt="" aria-hidden className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink/95 to-[#0c0d10]" />
          <div className="absolute inset-0 bg-[radial-gradient(55%_55%_at_85%_15%,rgba(220,53,69,0.3),transparent_60%)]" />
        </div>

        <div className="container-x grid gap-12 pb-20 pt-36 lg:grid-cols-[1.4fr_1fr] lg:pt-44">
          <div>
            <nav className="mb-6 flex items-center gap-2 text-sm text-white/55">
              <button onClick={() => navigate("/")} className="hover:text-white">Home</button>
              <ChevronRight className="h-3.5 w-3.5" />
              <button onClick={() => navigate("/courses")} className="hover:text-white">Courses</button>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-brand-light">{course.tag}</span>
            </nav>

            <span className="chip">{course.tag}</span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight md:text-5xl">{course.title}</h1>
            <p className="mt-5 max-w-2xl text-lg text-white/75">{course.short}</p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <strong>{course.rating}</strong><span className="text-white/50">rating</span>
              </span>
              <span className="flex items-center gap-1.5 text-white/70"><Users className="h-4 w-4 text-brand" /> {course.enrolled.toLocaleString()} enrolled</span>
              <span className="flex items-center gap-1.5 text-white/70"><Clock className="h-4 w-4 text-brand" /> {course.duration}</span>
              <span className="flex items-center gap-1.5 text-white/70"><MonitorPlay className="h-4 w-4 text-brand" /> {lessons} lessons</span>
              <span className="flex items-center gap-1.5 text-white/70"><BadgeCheck className="h-4 w-4 text-brand" /> {course.level}</span>
            </div>

            {enrolled && (
              <div className="mt-8 max-w-md rounded-2xl border border-brand/30 bg-brand/10 p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-white">Your progress</span>
                  <span className="font-bold text-brand-light">{progress}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Purchase card */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
              <div className="relative group cursor-pointer" onClick={() => openPreview()}>
                <video poster={course.poster} muted loop playsInline preload="none"
                  disablePictureInPicture disableRemotePlayback
                  controlsList="nodownload noplaybackrate noremoteplayback"
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  className="aspect-video w-full object-cover">
                  <source src={course.video} type="video/mp4" />
                </video>
                <div className="absolute inset-0 flex items-center justify-center bg-ink/40 transition-colors group-hover:bg-ink/20">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand shadow-2xl transition-transform group-hover:scale-110">
                    <Play className="ml-1 h-7 w-7 fill-white text-white" />
                  </span>
                </div>
                <span className="absolute bottom-3 left-3 rounded-md bg-ink/85 px-2.5 py-1 text-xs font-semibold text-white">Click to Preview Video</span>
              </div>

              <div className="p-7">
                <div className="flex items-end gap-3">
                  <span className="font-display text-4xl font-extrabold text-ink">{naira(displayPrice)}</span>
                  {course.oldPrice && <span className="mb-1 text-lg text-muted line-through">{naira(course.oldPrice)}</span>}
                </div>
                {course.oldPrice && course.oldPrice > displayPrice && (
                  <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-brand">
                    Save {naira(course.oldPrice - displayPrice)} — limited time
                  </p>
                )}

                <button onClick={onEnroll} className="btn-primary mt-6 w-full">
                  {enrolled ? "Continue Learning" : "Enroll Now"} <ArrowUpRight className="h-4 w-4" />
                </button>
                {!enrolled && (
                  <p className="mt-3 text-center text-xs text-muted">30-day access guarantee · Secure checkout</p>
                )}

                <ul className="mt-6 space-y-3 border-t border-line pt-6">
                  {[
                    { icon: InfinityIcon, t: "Lifetime access to all updates" },
                    { icon: MonitorPlay, t: "Weekly live market sessions" },
                    { icon: Award, t: "Certificate on completion" },
                    { icon: Users, t: "Private trader community" },
                  ].map((f) => (
                    <li key={f.t} className="flex items-center gap-3 text-sm text-ink/75">
                      <f.icon className="h-4 w-4 shrink-0 text-brand" /> {f.t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Body */}
      <section className="section bg-cream">
        <div className="container-x grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-10">
            <div className="card">
              <h2 className="font-display text-2xl font-bold text-ink">About this course</h2>
              <p className="mt-4 leading-relaxed text-muted">{course.desc}</p>
            </div>

            <div className="card">
              <h2 className="font-display text-2xl font-bold text-ink">What you'll learn</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {course.outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-2.5 text-sm text-ink/80">
                    <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" /> {o}
                  </li>
                ))}
              </ul>
            </div>

            {/* Curriculum */}
            <div>
              <div className="flex items-end justify-between">
                <h2 className="font-display text-2xl font-bold text-ink">Curriculum</h2>
                <p className="text-sm text-muted">{course.modules.length} modules · {lessons} lessons</p>
              </div>
              <div className="mt-5 space-y-3">
                {course.modules.map((m, mi) => {
                  const open = openModule === mi;
                  return (
                    <div key={m.title} className={`overflow-hidden rounded-2xl border bg-white transition-colors ${open ? "border-brand/40" : "border-line"}`}>
                      <button onClick={() => setOpenModule(open ? -1 : mi)} className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left">
                        <span>
                          <span className="font-display text-base font-bold text-ink">{m.title}</span>
                          <span className="ml-3 text-xs text-muted">{m.lessons.length} lessons</span>
                        </span>
                        <ChevronDown className={`h-5 w-5 shrink-0 text-brand transition-transform ${open ? "rotate-180" : ""}`} />
                      </button>
                      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                        <div className="overflow-hidden">
                          <ul className="divide-y divide-line border-t border-line">
                            {m.lessons.map((l) => (
                              <li key={l.id} className="flex items-center gap-3 px-6 py-3.5">
                                {enrolled || l.free
                                  ? <button onClick={() => l.free ? openPreview(l.title, (l as any).videoUrl || course.video) : onEnroll()} className="text-brand hover:scale-110 transition"><Play className="h-4 w-4 shrink-0 fill-brand text-brand" /></button>
                                  : <Lock className="h-4 w-4 shrink-0 text-muted" />}
                                <span className="flex-1 text-sm font-medium text-ink/80">{l.title}</span>
                                {l.free && !enrolled && (
                                  <button
                                    onClick={() => openPreview(l.title, (l as any).videoUrl || course.video)}
                                    className="chip !px-2.5 !py-0.5 hover:bg-brand hover:text-white transition cursor-pointer"
                                  >
                                    Free Preview
                                  </button>
                                )}
                                <span className="text-xs text-muted">{l.duration}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Requirements */}
          <aside className="space-y-6">
            <div className="card">
              <h3 className="font-display text-lg font-bold text-ink">Requirements</h3>
              <ul className="mt-4 space-y-2.5">
                {course.requirements.map((r) => (
                  <li key={r} className="flex items-start gap-2.5 text-sm text-muted">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-7 text-white">
              <h3 className="font-display text-xl font-bold">Need guidance?</h3>
              <p className="mt-2 text-sm text-white/85">Not sure if this is the right course? Talk to our team and we'll help you choose.</p>
              <button onClick={() => navigate("/contact")} className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand transition hover:-translate-y-0.5">
                Contact Us <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </aside>
        </div>
      </section>

      <PageCta tone="light" title="Ready to start learning?" body="Join thousands of traders building real, durable skill with GAMAT Fx Academy." primaryLabel="Browse All Courses" primaryTo="/courses" />
    </>
  );
}
