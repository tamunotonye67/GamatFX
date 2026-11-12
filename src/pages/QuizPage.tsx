import { useEffect, useMemo, useState } from "react";
import Logo from "../components/Logo";
import { getQuiz, generateAssessmentQuestions, DEFAULT_EXAM_QUESTION_COUNT, createFallbackQuiz, type Question, type Quiz } from "../lib/quizzes";
import { getCourse, asCourse, type Course } from "../lib/courses";
import { useStore, type QuizAttempt } from "../lib/store";
import { navigate } from "../lib/router";
import {
  Clock, CheckCircle2, XCircle, ArrowLeft, ArrowRight, Award,
  Lock, AlertCircle, RotateCcw, Flag, Trophy, ListChecks, Bookmark,
  HelpCircle, Filter, Check,
} from "lucide-react";

export default function QuizPage({ courseId }: { courseId: string }) {
  const { isAuthed, isEnrolled, submitAttempt, bestAttempt, progressOf, managedCourses, getCourseQuiz, user } = useStore();
  const rawId = (courseId || "").trim();
  const lowerId = rawId.toLowerCase();

  const builtIn = getCourse(rawId);
  const managed = managedCourses.find((c) => c.id === rawId || c.id.toLowerCase() === lowerId);
  const existingCourse = builtIn ?? (managed ? asCourse(managed) : undefined);

  if (!rawId) {
    return <Fallback title="Assessment not found" cta="Back to Courses" to="/courses" />;
  }

  const autoWords = rawId.replace(/[^a-zA-Z0-9]+/g, " ").trim().split(" ");
  const fallbackTitle = autoWords.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const course: Course = existingCourse ?? {
    id: rawId,
    title: fallbackTitle || "Trading Examination",
    tag: "Assessment",
    level: "All Levels",
    short: "Official GAMAT Academy comprehensive trading assessment.",
    desc: "Official GAMAT Academy comprehensive trading assessment.",
    duration: "60 Mins",
    enrolled: 1,
    rating: 5.0,
    price: 0,
    featured: false,
    poster: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
    outcomes: ["Test your core market knowledge", "Validate your risk discipline"],
    requirements: ["Basic forex concepts"],
    modules: [{ title: "Assessment", lessons: [{ id: `${rawId}-exam`, title: "Final Assessment", duration: "60:00" }] }],
  };

  const quiz: Quiz = getCourseQuiz(rawId) || getQuiz(rawId, `${course.title} — Final Assessment`);

  const [started, setStarted] = useState(false);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [navFilter, setNavFilter] = useState<"all" | "unanswered" | "answered" | "flagged">("all");
  const [reviewFilter, setReviewFilter] = useState<"all" | "incorrect" | "correct">("all");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [result, setResult] = useState<QuizAttempt | null>(null);
  const [left, setLeft] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  const best = bestAttempt(rawId) || (existingCourse ? bestAttempt(existingCourse.id) : undefined);
  const progress = progressOf(rawId) || (existingCourse ? progressOf(existingCourse.id) : 0);

  /* countdown */
  useEffect(() => {
    if (!started || result) return;
    if (left <= 0) { finish(); return; }
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, left, result]);

  const activeQuestions = sessionQuestions.length ? sessionQuestions : (quiz?.questions ?? []);
  const totalCount = activeQuestions.length || DEFAULT_EXAM_QUESTION_COUNT;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const flaggedCount = useMemo(() => Object.values(flagged).filter(Boolean).length, [flagged]);

  if (!isAuthed) return <Fallback title="Sign in to take the assessment" cta="Log In" to={`/login?next=/quiz/${rawId}`} icon={Lock} />;
  
  const hasEnrollment = isEnrolled(rawId) || isEnrolled(course.id) || (existingCourse && isEnrolled(existingCourse.id)) || user?.role === "admin";
  const courseUrl = hasEnrollment ? `/learn/${course.id}` : `/courses/${course.id}`;

  function startAssessment() {
    const fresh = generateAssessmentQuestions(rawId, quiz, DEFAULT_EXAM_QUESTION_COUNT);
    setSessionQuestions(fresh);
    setAnswers({});
    setFlagged({});
    setIdx(0);
    setResult(null);
    setShowSubmitModal(false);
    setStarted(true);
    setLeft(quiz.timeLimitMins * 60);
    window.scrollTo({ top: 0 });
  }

  function finish() {
    setShowSubmitModal(false);
    const a = submitAttempt(rawId, answers, activeQuestions);
    setResult(a);
    setStarted(false);
    window.scrollTo({ top: 0 });
  }

  const hours = Math.floor(left / 3600);
  const mins = Math.floor((left % 3600) / 60);
  const secs = left % 60;
  const mmss = hours > 0
    ? `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  /* ------------------------------ Result Screen ------------------------------ */
  if (result) {
    const incorrectCount = result.total - result.correct;
    const filteredReview = activeQuestions.filter((q) => {
      const isCorrect = result.answers[q.id] === q.answer;
      if (reviewFilter === "incorrect") return !isCorrect;
      if (reviewFilter === "correct") return isCorrect;
      return true;
    });

    return (
      <div className="min-h-screen bg-cream px-4 sm:px-5 py-8 sm:py-10">
        <div className="mx-auto max-w-3xl">
          <Logo />
          <div className={`mt-6 sm:mt-8 overflow-hidden rounded-3xl border bg-white shadow-xl ${result.passed ? "border-emerald-300" : "border-brand/40"}`}>
            <div className={`p-6 sm:p-10 text-center text-white ${result.passed ? "bg-gradient-to-br from-emerald-600 to-emerald-700" : "bg-gradient-to-br from-brand to-brand-dark"}`}>
              {result.passed ? <Trophy className="mx-auto h-14 w-14 sm:h-16 sm:w-16" /> : <RotateCcw className="mx-auto h-14 w-14 sm:h-16 sm:w-16" />}
              <h1 className="mt-4 sm:mt-5 font-display text-2xl sm:text-3xl font-extrabold">
                {result.passed ? "Congratulations — You Passed!" : "Exam Incomplete"}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-white/90">
                You scored <strong>{result.score}%</strong> ({result.correct} out of {result.total} questions correct).
                Passing grade is {quiz.passMark}%.
              </p>
              <div className="mx-auto mt-6 h-3.5 max-w-sm overflow-hidden rounded-full bg-white/25">
                <div className="h-full rounded-full bg-white transition-all duration-1000" style={{ width: `${result.score}%` }} />
              </div>
            </div>

            <div className="p-5 sm:p-8">
              {result.passed ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                  <Award className="mx-auto h-9 w-9 text-emerald-700" />
                  <p className="mt-2 font-display text-lg font-bold text-emerald-900">Official Certificate Unlocked</p>
                  <p className="mt-1 text-sm text-emerald-800">
                    Your official GAMAT Fx Academy certificate for <strong>{course.title}</strong> is now ready to download and print in your dashboard.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-brand/25 bg-brand-light p-5 text-center">
                  <AlertCircle className="mx-auto h-9 w-9 text-brand" />
                  <p className="mt-2 font-display text-lg font-bold text-ink">Review & Try Again</p>
                  <p className="mt-1 text-sm text-muted">
                    You need {quiz.passMark}% ({Math.ceil((quiz.passMark / 100) * result.total)} correct answers out of {result.total}) to earn your certificate. Unlimited retakes are allowed.
                  </p>
                </div>
              )}

              {/* Review Filter Tabs */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                <h2 className="font-display text-lg font-bold text-ink">Exam Review ({result.total} Questions)</h2>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setReviewFilter("all")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${reviewFilter === "all" ? "bg-ink text-white" : "bg-cream text-muted hover:text-ink"}`}
                  >
                    All ({result.total})
                  </button>
                  <button
                    onClick={() => setReviewFilter("incorrect")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${reviewFilter === "incorrect" ? "bg-brand text-white" : "bg-cream text-brand hover:bg-brand-light"}`}
                  >
                    Incorrect ({incorrectCount})
                  </button>
                  <button
                    onClick={() => setReviewFilter("correct")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${reviewFilter === "correct" ? "bg-emerald-600 text-white" : "bg-cream text-emerald-700 hover:bg-emerald-50"}`}
                  >
                    Correct ({result.correct})
                  </button>
                </div>
              </div>

              {/* Questions Review List */}
              <div className="mt-5 space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {filteredReview.map((q) => {
                  const origIdx = activeQuestions.findIndex((aq) => aq.id === q.id);
                  const given = result.answers[q.id];
                  const ok = given === q.answer;
                  return (
                    <div key={q.id} className={`rounded-2xl border p-4 sm:p-5 ${ok ? "border-emerald-200 bg-emerald-50/40" : "border-brand/30 bg-brand-light/30"}`}>
                      <div className="flex items-start gap-3">
                        {ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand" />}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-ink text-sm sm:text-base">
                            <span className="text-muted font-normal mr-1.5">Q{origIdx + 1}.</span> {q.q}
                          </p>
                          <div className="mt-2.5 space-y-1 text-xs sm:text-sm">
                            <p className="text-muted">
                              Your answer:{" "}
                              <strong className={ok ? "text-emerald-700 font-semibold" : "text-brand font-semibold"}>
                                {given !== undefined ? `${String.fromCharCode(65 + given)}. ${q.options[given]}` : "Unanswered"}
                              </strong>
                            </p>
                            {!ok && (
                              <p className="text-muted">
                                Correct answer:{" "}
                                <strong className="text-emerald-700 font-semibold">
                                  {String.fromCharCode(65 + q.answer)}. {q.options[q.answer]}
                                </strong>
                              </p>
                            )}
                          </div>
                          <p className="mt-3 rounded-xl bg-white/90 p-3 text-xs leading-relaxed text-muted border border-line/60">
                            <strong>Explanation:</strong> {q.explain}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {result.passed ? (
                  <button onClick={() => navigate("/dashboard")} className="btn-primary">
                    <Award className="h-4 w-4" /> View My Certificate
                  </button>
                ) : (
                  <button onClick={startAssessment} className="btn-primary">
                    <RotateCcw className="h-4 w-4" /> Retake 50-Question Exam
                  </button>
                )}
                <button onClick={() => navigate(courseUrl)} className="btn-outline-dark">
                  <ArrowLeft className="h-4 w-4" /> Back to Course
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------ Intro Screen ------------------------------ */
  if (!started) {
    return (
      <div className="min-h-screen bg-cream px-4 sm:px-5 py-8 sm:py-10">
        <div className="mx-auto max-w-2xl">
          <Logo />
          <div className="mt-6 sm:mt-8 rounded-3xl border border-line bg-white p-6 sm:p-10 shadow-lg">
            <span className="chip">Official Certification Examination</span>
            <h1 className="mt-4 font-display text-2xl sm:text-3xl font-extrabold text-ink">{quiz.title}</h1>
            <p className="mt-3 text-muted leading-relaxed">
              Complete this comprehensive 50-question examination to earn your official GAMAT Fx Academy Certificate for <strong className="text-ink">{course.title}</strong>.
            </p>

            {best && (
              <div className={`mt-6 rounded-2xl border p-4 ${best.passed ? "border-emerald-200 bg-emerald-50" : "border-line bg-cream"}`}>
                <p className="text-sm">
                  <strong className={best.passed ? "text-emerald-800" : "text-ink"}>
                    Previous Best: {best.score}% ({best.correct}/{best.total} correct)
                  </strong>{" "}
                  <span className="text-muted">
                    {best.passed ? "— Passed, certificate unlocked!" : `— ${quiz.passMark}% required to pass.`}
                  </span>
                </p>
              </div>
            )}

            <div className="mt-7 grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { icon: ListChecks, v: `${DEFAULT_EXAM_QUESTION_COUNT}`, l: "Questions" },
                { icon: Flag, v: `${quiz.passMark}%`, l: "Pass Mark" },
                { icon: Clock, v: `${quiz.timeLimitMins} min`, l: "Time Limit" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl bg-cream p-3.5 sm:p-5 text-center">
                  <s.icon className="mx-auto h-5 w-5 text-brand" />
                  <p className="mt-2 font-display text-lg sm:text-xl font-extrabold text-ink">{s.v}</p>
                  <p className="text-[11px] sm:text-xs text-muted font-medium">{s.l}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-2xl bg-cream/70 p-4 border border-line/60">
              <p className="text-xs font-bold uppercase tracking-wide text-ink">Exam Guidelines</p>
              <ul className="mt-3 space-y-2 text-sm text-ink/80">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  50 multiple-choice questions randomized on every attempt.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  60 minutes total. You can move freely and bookmark questions to review before submitting.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  Immediate grading with detailed step-by-step explanations for each question.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  Unlimited retakes — valid for both online and physical academy students.
                </li>
              </ul>
            </div>

            {progress < 100 && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-900">
                  Online video progress: <strong>{progress}%</strong>. You can take this exam directly at any time (recommended for physical academy students or experienced traders).
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={startAssessment} className="btn-primary !py-3 !px-7 font-bold text-sm">
                Begin 50-Question Exam <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate(courseUrl)} className="btn-outline-dark">
                <ArrowLeft className="h-4 w-4" /> Back to Course
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------ Running Exam View ------------------------------ */
  const q = activeQuestions[idx] ?? activeQuestions[0];
  const isFlagged = Boolean(flagged[q.id]);
  const isWarningTime = left <= 300; // under 5 minutes

  // Filtering navigator buttons
  const navIndices = activeQuestions.map((_, i) => i).filter((i) => {
    const qId = activeQuestions[i].id;
    const hasAns = answers[qId] !== undefined;
    const isFl = Boolean(flagged[qId]);
    if (navFilter === "unanswered") return !hasAns;
    if (navFilter === "answered") return hasAns;
    if (navFilter === "flagged") return isFl;
    return true;
  });

  return (
    <div className="min-h-screen bg-cream">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden text-xs sm:text-sm font-semibold text-muted md:inline">
              <strong className="text-ink">{answeredCount}</strong> / {activeQuestions.length} Answered
            </span>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold transition shadow-sm ${
                isWarningTime ? "animate-pulse bg-brand text-white" : "bg-cream text-ink border border-line"
              }`}
            >
              <Clock className="h-4 w-4 text-brand" /> {mmss}
            </span>
            <button
              onClick={() => {
                if (answeredCount < activeQuestions.length) {
                  setShowSubmitModal(true);
                } else {
                  finish();
                }
              }}
              className="btn-primary !py-2 !px-4 text-xs font-bold"
            >
              Finish Exam
            </button>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-1.5 bg-line">
          <div
            className="h-full bg-brand transition-all duration-300"
            style={{ width: `${(answeredCount / activeQuestions.length) * 100}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Active Question Column (Left, 8 cols on desktop) */}
          <div className="lg:col-span-8 space-y-4">
            {err && (
              <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand-light p-3 text-sm text-ink/80">
                <AlertCircle className="h-4 w-4 text-brand shrink-0" /> {err}
              </p>
            )}

            {/* Active Question Card */}
            <div className="rounded-2xl border border-line bg-white p-5 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between gap-3 border-b border-line/60 pb-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-ink px-2.5 py-1 text-xs font-extrabold text-white">
                    Q{idx + 1} of {activeQuestions.length}
                  </span>
                  {answers[q.id] !== undefined ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <Check className="h-3.5 w-3.5" /> Answered
                    </span>
                  ) : (
                    <span className="text-xs text-muted">Unanswered</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setFlagged({ ...flagged, [q.id]: !isFlagged })}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    isFlagged ? "bg-amber-100 text-amber-800" : "bg-cream text-muted hover:text-ink"
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  {isFlagged ? "Flagged for Review" : "Flag for Review"}
                </button>
              </div>

              <h2 className="mt-5 font-display text-lg sm:text-xl font-bold leading-snug text-ink md:text-2xl">
                {q.q}
              </h2>

              <div className="mt-6 space-y-3">
                {q.options.map((opt, i) => {
                  const sel = answers[q.id] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setAnswers({ ...answers, [q.id]: i });
                        setErr(null);
                      }}
                      className={`flex w-full items-start gap-3.5 rounded-xl border p-3.5 sm:p-4 text-left transition ${
                        sel ? "border-brand bg-brand-light/70 shadow-xs" : "border-line hover:border-brand/40 hover:bg-cream/60"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                          sel ? "bg-brand text-white shadow-xs" : "bg-cream text-muted border border-line"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className={`text-sm leading-relaxed ${sel ? "font-semibold text-ink" : "text-ink/80"}`}>
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="mt-7 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-line/60">
                <button
                  onClick={() => {
                    setIdx((i) => Math.max(0, i - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={idx === 0}
                  className="btn-outline-dark !py-2 !px-4 text-xs font-bold disabled:opacity-30"
                >
                  <ArrowLeft className="h-4 w-4" /> Previous
                </button>

                <span className="text-xs text-muted font-medium">
                  Question {idx + 1} / {activeQuestions.length}
                </span>

                {idx < activeQuestions.length - 1 ? (
                  <button
                    onClick={() => {
                      setIdx((i) => i + 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="btn-primary !py-2 !px-4 text-xs font-bold"
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (answeredCount < activeQuestions.length) {
                        setShowSubmitModal(true);
                      } else {
                        finish();
                      }
                    }}
                    className="btn-primary !py-2 !px-4 text-xs font-bold"
                  >
                    Submit Exam <Flag className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Question Navigator Column (Right, 4 cols on desktop, sticky) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-[90px] w-full">
            <div className="rounded-2xl border border-line bg-white p-3.5 sm:p-4 shadow-xs">
              <div className="flex items-center justify-between gap-2 border-b border-line pb-2.5">
                <div>
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink">Question Navigator</h3>
                  <p className="text-[11px] text-muted">{answeredCount} of {activeQuestions.length} answered</p>
                </div>
                <span className="rounded-full bg-cream border border-line px-2 py-0.5 text-[11px] font-bold text-ink">
                  {Math.round((answeredCount / activeQuestions.length) * 100)}%
                </span>
              </div>

              {/* Compact Filter Tabs */}
              <div className="mt-2.5 flex items-center justify-between gap-1 p-0.5 rounded-lg bg-cream border border-line/60 text-[10px] font-bold">
                <button
                  onClick={() => setNavFilter("all")}
                  className={`flex-1 py-1 rounded transition text-center ${
                    navFilter === "all" ? "bg-white text-ink shadow-xs" : "text-muted hover:text-ink"
                  }`}
                >
                  All ({activeQuestions.length})
                </button>
                <button
                  onClick={() => setNavFilter("unanswered")}
                  className={`flex-1 py-1 rounded transition text-center ${
                    navFilter === "unanswered" ? "bg-white text-ink shadow-xs" : "text-muted hover:text-ink"
                  }`}
                >
                  Left ({activeQuestions.length - answeredCount})
                </button>
                <button
                  onClick={() => setNavFilter("answered")}
                  className={`flex-1 py-1 rounded transition text-center ${
                    navFilter === "answered" ? "bg-white text-ink shadow-xs" : "text-muted hover:text-ink"
                  }`}
                >
                  Done ({answeredCount})
                </button>
                <button
                  onClick={() => setNavFilter("flagged")}
                  className={`flex-1 py-1 rounded transition text-center ${
                    navFilter === "flagged" ? "bg-white text-ink shadow-xs" : "text-muted hover:text-ink"
                  }`}
                >
                  Flag ({flaggedCount})
                </button>
              </div>

              {/* Number Buttons Grid (10 Columns, fits 50 in 5 neat rows) */}
              <div className="mt-2.5 grid grid-cols-10 gap-1">
                {navIndices.map((i) => {
                  const qq = activeQuestions[i];
                  const isCurrent = i === idx;
                  const hasAnswer = answers[qq.id] !== undefined;
                  const isFl = Boolean(flagged[qq.id]);

                  return (
                    <button
                      key={qq.id}
                      onClick={() => {
                        setIdx(i);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`relative flex h-7 items-center justify-center rounded-md text-[11px] font-bold transition ${
                        isCurrent
                          ? "bg-ink text-white shadow-xs ring-2 ring-brand"
                          : hasAnswer
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "border border-line bg-cream/40 text-ink/70 hover:border-brand/40 hover:bg-white hover:text-ink"
                      }`}
                    >
                      {i + 1}
                      {isFl && (
                        <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-400 ring-1 ring-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Compact Legend */}
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[10px] text-muted pt-2 border-t border-line/60">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded bg-emerald-600 shrink-0" /> Done
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded border border-line bg-cream shrink-0" /> Left
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded bg-ink shrink-0" /> Current
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" /> Flagged
                </span>
              </div>

              {/* Submit CTA */}
              <button
                onClick={() => {
                  if (answeredCount < activeQuestions.length) {
                    setShowSubmitModal(true);
                  } else {
                    finish();
                  }
                }}
                className="mt-3 w-full btn-primary !py-2 text-xs font-bold"
              >
                Submit Exam
              </button>
            </div>
          </aside>
        </div>
      </main>

        {/* Confirmation Modal for Incomplete Submissions */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
              <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
              <h3 className="mt-3 text-center font-display text-xl font-bold text-ink">Incomplete Assessment</h3>
              <p className="mt-2 text-center text-sm text-muted">
                You have answered <strong>{answeredCount}</strong> of <strong>{activeQuestions.length}</strong> questions.
                Unanswered questions will be scored as 0.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => {
                    // Jump to first unanswered
                    const firstUnans = activeQuestions.findIndex((aq) => answers[aq.id] === undefined);
                    if (firstUnans >= 0) setIdx(firstUnans);
                    setShowSubmitModal(false);
                  }}
                  className="btn-primary !py-2.5 text-xs font-bold"
                >
                  Jump to First Unanswered Question
                </button>
                <button
                  onClick={finish}
                  className="btn-outline-dark !py-2.5 text-xs font-bold"
                >
                  Submit Anyway
                </button>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="text-xs text-muted hover:text-ink pt-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
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
