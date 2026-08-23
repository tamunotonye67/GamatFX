import { useEffect, useMemo, useState } from "react";
import Logo from "../components/Logo";
import { getQuiz } from "../lib/quizzes";
import { getCourse } from "../lib/courses";
import { useStore, type QuizAttempt } from "../lib/store";
import { navigate } from "../lib/router";
import {
  Clock, CheckCircle2, XCircle, ArrowLeft, ArrowRight, Award,
  Lock, AlertCircle, RotateCcw, Flag, Trophy, ListChecks,
} from "lucide-react";

export default function QuizPage({ courseId }: { courseId: string }) {
  const quiz = getQuiz(courseId);
  const course = getCourse(courseId);
  const { isAuthed, isEnrolled, submitAttempt, bestAttempt, progressOf } = useStore();

  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizAttempt | null>(null);
  const [left, setLeft] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  const best = bestAttempt(courseId);
  const progress = progressOf(courseId);

  /* countdown */
  useEffect(() => {
    if (!started || result) return;
    if (left <= 0) { finish(); return; }
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, left, result]);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  if (!quiz || !course) return <Fallback title="Assessment not found" cta="Back to Courses" to="/courses" />;
  if (!isAuthed) return <Fallback title="Sign in to take the assessment" cta="Log In" to={`/login?next=/quiz/${courseId}`} icon={Lock} />;
  if (!isEnrolled(courseId)) return <Fallback title="You're not enrolled in this course" cta="View Course" to={`/courses/${courseId}`} icon={Lock} />;

  function finish() {
    const a = submitAttempt(courseId, answers);
    setResult(a);
    setStarted(false);
    window.scrollTo({ top: 0 });
  }

  const mmss = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;

  /* ------------------------------ Result ------------------------------ */
  if (result) {
    return (
      <div className="min-h-screen bg-cream px-5 py-10">
        <div className="mx-auto max-w-3xl">
          <Logo />
          <div className={`mt-8 overflow-hidden rounded-3xl border bg-white shadow-lg ${result.passed ? "border-emerald-300" : "border-brand/40"}`}>
            <div className={`p-10 text-center text-white ${result.passed ? "bg-gradient-to-br from-emerald-600 to-emerald-700" : "bg-gradient-to-br from-brand to-brand-dark"}`}>
              {result.passed ? <Trophy className="mx-auto h-16 w-16" /> : <RotateCcw className="mx-auto h-16 w-16" />}
              <h1 className="mt-5 font-display text-3xl font-extrabold">
                {result.passed ? "Congratulations — you passed!" : "Not quite there yet"}
              </h1>
              <p className="mt-2 text-white/85">
                You scored <strong>{result.score}%</strong> ({result.correct}/{result.total} correct).
                Pass mark is {quiz.passMark}%.
              </p>
              <div className="mx-auto mt-6 h-3 max-w-sm overflow-hidden rounded-full bg-white/25">
                <div className="h-full rounded-full bg-white transition-all duration-1000" style={{ width: `${result.score}%` }} />
              </div>
            </div>

            <div className="p-8">
              {result.passed ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                  <Award className="mx-auto h-8 w-8 text-emerald-700" />
                  <p className="mt-2 font-display text-lg font-bold text-emerald-900">Certificate unlocked</p>
                  <p className="mt-1 text-sm text-emerald-800">
                    Your certificate for {course.title} is now available in your dashboard.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-brand/25 bg-brand-light p-5 text-center">
                  <AlertCircle className="mx-auto h-8 w-8 text-brand" />
                  <p className="mt-2 font-display text-lg font-bold text-ink">Review and try again</p>
                  <p className="mt-1 text-sm text-muted">
                    You need {quiz.passMark}% to earn your certificate. There's no limit on attempts.
                  </p>
                </div>
              )}

              {/* Review */}
              <h2 className="mt-8 font-display text-lg font-bold text-ink">Review your answers</h2>
              <div className="mt-4 space-y-4">
                {quiz.questions.map((q, i) => {
                  const given = result.answers[q.id];
                  const ok = given === q.answer;
                  return (
                    <div key={q.id} className={`rounded-2xl border p-5 ${ok ? "border-emerald-200 bg-emerald-50/50" : "border-brand/30 bg-brand-light/40"}`}>
                      <div className="flex items-start gap-3">
                        {ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand" />}
                        <div className="min-w-0">
                          <p className="font-semibold text-ink">{i + 1}. {q.q}</p>
                          <p className="mt-2 text-sm text-muted">
                            Your answer: <strong className={ok ? "text-emerald-700" : "text-brand"}>
                              {given !== undefined ? q.options[given] : "Not answered"}
                            </strong>
                          </p>
                          {!ok && <p className="mt-1 text-sm text-muted">Correct: <strong className="text-emerald-700">{q.options[q.answer]}</strong></p>}
                          <p className="mt-2 rounded-lg bg-white p-3 text-xs leading-relaxed text-muted">{q.explain}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {result.passed ? (
                  <button onClick={() => navigate("/dashboard")} className="btn-primary">
                    <Award className="h-4 w-4" /> View my certificate
                  </button>
                ) : (
                  <button onClick={() => { setResult(null); setAnswers({}); setIdx(0); setStarted(true); setLeft(quiz.timeLimitMins * 60); }} className="btn-primary">
                    <RotateCcw className="h-4 w-4" /> Retake assessment
                  </button>
                )}
                <button onClick={() => navigate(`/learn/${courseId}`)} className="btn-outline-dark">
                  <ArrowLeft className="h-4 w-4" /> Back to course
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------ Intro ------------------------------ */
  if (!started) {
    return (
      <div className="min-h-screen bg-cream px-5 py-10">
        <div className="mx-auto max-w-2xl">
          <Logo />
          <div className="mt-8 rounded-3xl border border-line bg-white p-10 shadow-lg">
            <span className="chip">Final assessment</span>
            <h1 className="mt-4 font-display text-3xl font-extrabold text-ink">{quiz.title}</h1>
            <p className="mt-3 text-muted">
              Pass this assessment to earn your certificate for <strong className="text-ink">{course.title}</strong>.
            </p>

            {best && (
              <div className={`mt-6 rounded-2xl border p-4 ${best.passed ? "border-emerald-200 bg-emerald-50" : "border-line bg-cream"}`}>
                <p className="text-sm">
                  <strong className={best.passed ? "text-emerald-800" : "text-ink"}>
                    Best score: {best.score}%
                  </strong>{" "}
                  <span className="text-muted">
                    {best.passed ? "— passed, certificate unlocked." : `— ${quiz.passMark}% needed to pass.`}
                  </span>
                </p>
              </div>
            )}

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {[
                { icon: ListChecks, v: `${quiz.questions.length}`, l: "Questions" },
                { icon: Flag, v: `${quiz.passMark}%`, l: "Pass mark" },
                { icon: Clock, v: `${quiz.timeLimitMins} min`, l: "Time limit" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl bg-cream p-5 text-center">
                  <s.icon className="mx-auto h-5 w-5 text-brand" />
                  <p className="mt-2 font-display text-xl font-extrabold text-ink">{s.v}</p>
                  <p className="text-xs text-muted">{s.l}</p>
                </div>
              ))}
            </div>

            <ul className="mt-7 space-y-2.5">
              {[
                "Multiple choice — one correct answer per question.",
                "You can move freely between questions before submitting.",
                "The quiz auto-submits when the timer runs out.",
                "Unlimited retakes — your best score counts.",
                "You'll see full explanations for every answer afterwards.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-ink/80">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {t}
                </li>
              ))}
            </ul>

            {progress < 100 && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-900">
                  You've completed <strong>{progress}%</strong> of the lessons. We recommend finishing
                  the course before attempting the assessment.
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => { setStarted(true); setLeft(quiz.timeLimitMins * 60); setAnswers({}); setIdx(0); }} className="btn-primary">
                Start Assessment <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate(`/learn/${courseId}`)} className="btn-outline-dark">
                <ArrowLeft className="h-4 w-4" /> Back to course
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------ Running ------------------------------ */
  const q = quiz.questions[idx];
  const low = left <= 60;

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-4xl items-center justify-between gap-4 px-5">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted sm:inline">{answeredCount}/{quiz.questions.length} answered</span>
            <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${low ? "animate-pulse bg-brand text-white" : "bg-cream text-ink"}`}>
              <Clock className="h-4 w-4" /> {mmss}
            </span>
          </div>
        </div>
        <div className="h-1 bg-line">
          <div className="h-full bg-brand transition-all" style={{ width: `${((idx + 1) / quiz.questions.length) * 100}%` }} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10">
        {err && (
          <p className="mb-5 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand-light p-3 text-sm text-ink/80">
            <AlertCircle className="h-4 w-4 text-brand" /> {err}
          </p>
        )}

        <div className="rounded-3xl border border-line bg-white p-8 shadow-lg">
          <p className="text-xs font-bold uppercase tracking-wide text-brand">
            Question {idx + 1} of {quiz.questions.length}
          </p>
          <h2 className="mt-3 font-display text-xl font-bold leading-snug text-ink md:text-2xl">{q.q}</h2>

          <div className="mt-7 space-y-3">
            {q.options.map((opt, i) => {
              const sel = answers[q.id] === i;
              return (
                <button key={i} onClick={() => { setAnswers({ ...answers, [q.id]: i }); setErr(null); }}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    sel ? "border-brand bg-brand-light" : "border-line hover:border-brand/50 hover:bg-cream"
                  }`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${sel ? "bg-brand text-white" : "bg-cream text-muted"}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className={`text-sm ${sel ? "font-semibold text-ink" : "text-ink/80"}`}>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigator */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {quiz.questions.map((qq, i) => (
            <button key={qq.id} onClick={() => setIdx(i)}
              className={`h-9 w-9 rounded-lg text-xs font-bold transition ${
                i === idx ? "bg-ink text-white" : answers[qq.id] !== undefined ? "bg-brand text-white" : "border border-line bg-white text-muted hover:border-brand"
              }`}>
              {i + 1}
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0} className="btn-outline-dark disabled:opacity-40">
            <ArrowLeft className="h-4 w-4" /> Previous
          </button>
          {idx < quiz.questions.length - 1 ? (
            <button onClick={() => setIdx((i) => i + 1)} className="btn-primary ml-auto">
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (answeredCount < quiz.questions.length) {
                  setErr(`Please answer all ${quiz.questions.length} questions before submitting.`);
                  return;
                }
                finish();
              }}
              className="btn-primary ml-auto">
              <Flag className="h-4 w-4" /> Submit Assessment
            </button>
          )}
        </div>
      </main>
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
