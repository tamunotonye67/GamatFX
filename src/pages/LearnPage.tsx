import { useMemo, useState, useEffect } from "react";
import { getCourse, allLessons, totalLessons, asCourse, type LessonWithVideo } from "../lib/courses";
import { useStore } from "../lib/store";
import { navigate } from "../lib/router";
import Logo from "../components/Logo";
import {
  CheckCircle2, Circle, ChevronLeft, ChevronRight, Menu, X,
  Lock, Award, LayoutDashboard, PlayCircle,
} from "lucide-react";

export default function LearnPage({ id }: { id: string }) {
  const { isAuthed, isEnrolled, getEnrollment, toggleLesson, setLastLesson, progressOf, managedCourses } = useStore();
  const builtIn = getCourse(id);
  const managed = managedCourses.find((c) => c.id === id);
  const course = builtIn ?? (managed ? asCourse(managed) : undefined);
  const [sidebar, setSidebar] = useState(false);

  const lessons = useMemo(() => (course ? allLessons(course) as LessonWithVideo[] : []), [course]);
  const enrollment = course ? getEnrollment(course.id) : undefined;
  const [activeId, setActiveId] = useState<string>(() => enrollment?.lastLessonId ?? lessons[0]?.id ?? "");

  useEffect(() => {
    if (course && activeId) setLastLesson(course.id, activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  if (!course) {
    return <Fallback title="Course not found" cta="Back to Courses" to="/courses" />;
  }
  if (!isAuthed) {
    return <Fallback title="Sign in to continue learning" cta="Log In" to="/login" icon={Lock} />;
  }
  if (!isEnrolled(course.id)) {
    return <Fallback title="You're not enrolled in this course" cta="View Course" to={`/courses/${course.id}`} icon={Lock} />;
  }

  const done = enrollment?.completedLessons ?? [];
  const progress = progressOf(course.id);
  const index = lessons.findIndex((l) => l.id === activeId);
  const active = lessons[index] ?? lessons[0];
  const isDone = done.includes(active.id);
  const complete = progress === 100;
  const activeVideo = (active as LessonWithVideo)?.videoUrl || course.video;

  const go = (dir: -1 | 1) => {
    const next = lessons[index + dir];
    if (next) { setActiveId(next.id); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };

  const completeAndNext = () => {
    if (!isDone) toggleLesson(course.id, active.id);
    if (index < lessons.length - 1) go(1);
  };

  return (
    <div className="min-h-screen bg-ink text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebar((v) => !v)} className="rounded-lg p-2 text-white lg:hidden" aria-label="Toggle lessons">
              {sidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Logo variant="light" />
          </div>
          <div className="hidden flex-1 items-center gap-4 px-8 md:flex">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="shrink-0 text-xs font-semibold text-white/70">{progress}% complete</span>
          </div>
          <button onClick={() => navigate("/dashboard")} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold transition hover:border-white hover:bg-white/10">
            <LayoutDashboard className="h-4 w-4" /> <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 top-16 z-30 w-80 overflow-y-auto border-r border-white/10 bg-[#101216] transition-transform lg:sticky lg:translate-x-0 ${sidebar ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-5">
            <p className="font-display text-sm font-bold">{course.title}</p>
            <p className="mt-1 text-xs text-white/50">{done.length} of {totalLessons(course)} lessons complete</p>
          </div>
          <nav className="pb-24">
            {course.modules.map((m) => (
              <div key={m.title}>
                <p className="bg-white/5 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white/50">{m.title}</p>
                <ul>
                  {m.lessons.map((l) => {
                    const lDone = done.includes(l.id);
                    const isActive = l.id === active.id;
                    return (
                      <li key={l.id}>
                        <button onClick={() => { setActiveId(l.id); setSidebar(false); }}
                          className={`flex w-full items-start gap-3 px-5 py-3 text-left transition ${isActive ? "border-l-2 border-brand bg-brand/15" : "border-l-2 border-transparent hover:bg-white/5"}`}>
                          <span onClick={(e) => { e.stopPropagation(); toggleLesson(course.id, l.id); }} className="mt-0.5 shrink-0">
                            {lDone ? <CheckCircle2 className="h-4 w-4 text-brand" /> : <Circle className="h-4 w-4 text-white/30" />}
                          </span>
                          <span className="flex-1">
                            <span className={`block text-sm leading-snug ${isActive ? "font-semibold text-white" : lDone ? "text-white/45 line-through" : "text-white/75"}`}>{l.title}</span>
                            <span className="mt-0.5 block text-[11px] text-white/40">{l.duration}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Player */}
        <main className="min-w-0 flex-1 p-5 lg:p-10">
          <div className="mx-auto max-w-4xl">
            {/* Download / right-click / PiP disabled to protect course content. */}
            <video
              key={active.id + (activeVideo || "")}
              poster={course.poster}
              controls
              playsInline
              disablePictureInPicture
              disableRemotePlayback
              controlsList="nodownload noplaybackrate noremoteplayback"
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              className="aspect-video w-full rounded-2xl bg-black shadow-2xl"
            >
              <source src={activeVideo} type="video/mp4" />
            </video>

            <div className="mt-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                Lesson {index + 1} of {lessons.length}
              </p>
              <h1 className="mt-2 font-display text-2xl font-extrabold md:text-3xl">{active.title}</h1>
              <p className="mt-2 text-sm text-white/50">{active.duration} · {course.title}</p>
            </div>

            {/* Controls */}
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
              <button onClick={() => go(-1)} disabled={index === 0}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold transition hover:border-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35">
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>

              <button onClick={() => toggleLesson(course.id, active.id)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${isDone ? "bg-white/10 text-white hover:bg-white/15" : "bg-white text-ink hover:-translate-y-0.5"}`}>
                {isDone ? <><CheckCircle2 className="h-4 w-4 text-brand" /> Completed</> : <><Circle className="h-4 w-4" /> Mark complete</>}
              </button>

              <button onClick={completeAndNext} disabled={index === lessons.length - 1 && isDone} className="btn-primary ml-auto disabled:opacity-40">
                {index === lessons.length - 1 ? "Finish Course" : "Complete & Continue"} <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Completion banner */}
            {complete && (
              <div className="mt-10 rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-8 text-center">
                <Award className="mx-auto h-12 w-12" />
                <h2 className="mt-4 font-display text-2xl font-extrabold">All lessons complete — one step to go!</h2>
                <p className="mt-2 text-white/85">
                  You've finished every lesson in {course.title}. Pass the final assessment to earn your certificate.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button onClick={() => navigate(`/quiz/${course.id}`)} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand transition hover:-translate-y-0.5">
                    <Award className="h-4 w-4" /> Take Final Assessment
                  </button>
                  <button onClick={() => navigate("/courses")} className="inline-flex items-center gap-2 rounded-full border border-white/35 px-6 py-3 text-sm font-semibold transition hover:bg-white/10">
                    <PlayCircle className="h-4 w-4" /> Next Course
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Fallback({ title, cta, to, icon: Icon }: { title: string; cta: string; to: string; icon?: React.ElementType }) {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      {Icon && <Icon className="h-14 w-14 text-brand" />}
      <h1 className="mt-6 font-display text-3xl font-extrabold text-ink">{title}</h1>
      <button onClick={() => navigate(to)} className="btn-primary mt-8">{cta}</button>
    </section>
  );
}
