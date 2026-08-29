import { useEffect, useMemo, useState } from "react";
import PageHero from "../../components/PageHero";
import { navigate } from "../../lib/router";
import { pickQuestions, type Difficulty, type TriviaQ } from "../../lib/trivia";
import { useSolidNavbar } from "../../lib/chrome";
import {
  Zap, CheckCircle2, XCircle, Flame, Trophy, RotateCcw, ArrowRight,
  Timer, Target, Heart, Infinity as InfinityIcon,
} from "lucide-react";

type Mode = "endless" | "timed" | "survival";

const MODES: { id: Mode; name: string; desc: string; icon: React.ElementType }[] = [
  { id: "endless", name: "Endless", desc: "Unlimited questions. Play as long as you like.", icon: InfinityIcon },
  { id: "timed", name: "Beat the Clock", desc: "How many can you answer in 60 seconds?", icon: Timer },
  { id: "survival", name: "Survival", desc: "Three lives. One wrong answer costs one.", icon: Heart },
];

const DIFFS: (Difficulty | "mixed")[] = ["mixed", "easy", "medium", "hard", "expert"];
const BEST_KEY = "gamat.arcade.best";

export default function QuizArcadePage() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [diff, setDiff] = useState<Difficulty | "mixed">("mixed");
  const [queue, setQueue] = useState<TriviaQ[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [left, setLeft] = useState(60);
  const [over, setOver] = useState(false);
  const [seenIds, setSeenIds] = useState<Set<string>>(() => new Set());
  const [best, setBest] = useState(() => Number(localStorage.getItem(BEST_KEY) ?? 0));

  // Playing + results screens sit on a light background with no dark hero,
  // so the navbar must render its solid state at scroll-top.
  useSolidNavbar(mode !== null);

  const q = queue[idx];

  /* Timer for Beat the Clock */
  useEffect(() => {
    if (mode !== "timed" || over || !queue.length) return;
    if (left <= 0) { finish(); return; }
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, left, over, queue.length]);

  const start = (m: Mode) => {
    setMode(m);
    const seen = new Set<string>();
    setSeenIds(seen);
    const initialBatch = pickQuestions(50, diff, seen);
    setQueue(initialBatch);
    setIdx(0); setPicked(null); setScore(0); setStreak(0);
    setBestStreak(0); setLives(3); setLeft(60); setOver(false);
  };

  function finish() {
    setOver(true);
    if (score > best) { setBest(score); localStorage.setItem(BEST_KEY, String(score)); }
  }

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const right = i === q.answer;

    if (right) {
      const bonus = 10 + streak * 2;
      setScore((s) => s + bonus);
      setStreak((s) => { const n = s + 1; setBestStreak((b) => Math.max(b, n)); return n; });
    } else {
      setStreak(0);
      if (mode === "survival") {
        const rem = lives - 1;
        setLives(rem);
        if (rem <= 0) { window.setTimeout(finish, 1200); return; }
      }
    }
    window.setTimeout(() => {
      setPicked(null);
      setIdx((n) => {
        const next = n + 1;
        // Dynamically refill queue with fresh non-repeating questions when reaching buffer end
        if (next >= queue.length - 5) {
          const freshBatch = pickQuestions(30, diff, seenIds);
          setQueue((prev) => [...prev, ...freshBatch]);
        }
        return next;
      });
    }, 1100);
  };

  const accuracy = useMemo(() => (idx ? Math.round((score / (idx * 10)) * 100) : 0), [score, idx]);

  /* ------------------------------ Lobby ------------------------------ */
  if (!mode) {
    return (
      <>
        <PageHero crumb="Quiz Arcade" eyebrow="Fun zone" image="/images/hero.jpg"
          title={<>Forex <span className="text-brand">Quiz Arcade</span></>}
          subtitle="Unlimited trivia to sharpen your market knowledge. Pick a mode, build a streak, and beat your high score — no pressure, just practice." />

        <section className="section bg-cream">
          <div className="container-x">
            {/* Difficulty */}
            <div className="mx-auto max-w-3xl text-center">
              <span className="eyebrow justify-center">Step 1 · Difficulty</span>
              <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                {DIFFS.map((d) => (
                  <button key={d} onClick={() => setDiff(d)}
                    className={`rounded-full px-5 py-2 text-sm font-bold capitalize transition ${
                      diff === d ? "bg-brand text-white shadow" : "border border-line bg-white text-ink/70 hover:border-brand hover:text-brand"
                    }`}>{d}</button>
                ))}
              </div>
            </div>

            {/* Modes */}
            <div className="mx-auto mt-12 max-w-4xl">
              <span className="eyebrow justify-center">Step 2 · Choose a mode</span>
              <div className="mt-5 grid gap-6 md:grid-cols-3">
                {MODES.map((m) => (
                  <button key={m.id} onClick={() => start(m.id)}
                    className="card group text-left transition hover:-translate-y-1.5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white transition group-hover:scale-110">
                      <m.icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 font-display text-lg font-bold text-ink">{m.name}</h3>
                    <p className="mt-2 text-sm text-muted">{m.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand">
                      Play now <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {best > 0 && (
              <p className="mt-10 text-center text-sm text-muted">
                Your best score: <strong className="text-brand">{best}</strong>
              </p>
            )}

            <div className="mt-12 text-center">
              <button onClick={() => navigate("/fun")} className="btn-outline-dark">Back to Fun Zone</button>
            </div>
          </div>
        </section>
      </>
    );
  }

  /* ------------------------------ Results ------------------------------ */
  if (over) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-24">
        <div className="w-full max-w-lg rounded-3xl border border-line bg-white p-10 text-center shadow-xl">
          <Trophy className="mx-auto h-16 w-16 text-brand" />
          <h1 className="mt-5 font-display text-3xl font-extrabold text-ink">
            {score >= best && score > 0 ? "New high score!" : "Game over"}
          </h1>
          <p className="mt-2 text-muted">Nice work — here's how you did.</p>

          <div className="mt-7 grid grid-cols-2 gap-4">
            {[
              { l: "Score", v: score, i: Zap },
              { l: "Answered", v: idx, i: Target },
              { l: "Best streak", v: bestStreak, i: Flame },
              { l: "Accuracy", v: `${accuracy}%`, i: Zap },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-cream p-5">
                <s.i className="mx-auto h-5 w-5 text-brand" />
                <p className="mt-2 font-display text-2xl font-extrabold text-ink">{s.v}</p>
                <p className="text-xs text-muted">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={() => start(mode)} className="btn-primary"><RotateCcw className="h-4 w-4" /> Play again</button>
            <button onClick={() => setMode(null)} className="btn-outline-dark">Change mode</button>
          </div>
          <button onClick={() => navigate("/fun")} className="mt-4 text-sm font-semibold text-brand hover:underline">
            Back to Fun Zone
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------ Playing ------------------------------ */
  return (
    <div className="min-h-screen bg-cream pb-20 pt-28">
      <div className="container-x mx-auto max-w-3xl">
        {/* HUD */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-ink">
            <Zap className="h-4 w-4 text-brand" /> {score}
          </span>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold transition ${streak >= 3 ? "bg-brand text-white" : "text-muted"}`}>
            <Flame className={`h-4 w-4 ${streak >= 3 ? "animate-pulse" : ""}`} /> {streak} streak
          </span>
          {mode === "timed" && (
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ${left <= 10 ? "animate-pulse bg-brand text-white" : "bg-cream text-ink"}`}>
              <Timer className="h-4 w-4" /> {left}s
            </span>
          )}
          {mode === "survival" && (
            <span className="inline-flex items-center gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart key={i} className={`h-4 w-4 ${i < lives ? "fill-brand text-brand" : "text-line"}`} />
              ))}
            </span>
          )}
          <button onClick={finish} className="text-xs font-bold text-muted hover:text-brand">End game</button>
        </div>

        {/* Question */}
        <div key={idx} className="mt-6 animate-[riseIn_.45s_cubic-bezier(.22,1,.36,1)] rounded-3xl border border-line bg-white p-8 shadow-lg">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">{q.topic}</span>
            <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-bold uppercase text-muted">{q.difficulty}</span>
            <span className="ml-auto text-xs text-muted">Question {idx + 1}</span>
          </div>

          <h2 className="mt-4 font-display text-xl font-bold leading-snug text-ink md:text-2xl">{q.q}</h2>

          <div className="mt-7 space-y-3">
            {q.options.map((opt, i) => {
              const isRight = i === q.answer;
              const chosen = picked === i;
              const reveal = picked !== null;
              return (
                <button key={i} onClick={() => choose(i)} disabled={reveal}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    reveal && isRight ? "border-emerald-400 bg-emerald-50"
                      : reveal && chosen ? "border-brand bg-brand-light"
                      : reveal ? "border-line opacity-60"
                      : "border-line hover:-translate-y-0.5 hover:border-brand hover:bg-cream"
                  }`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    reveal && isRight ? "bg-emerald-500 text-white"
                      : reveal && chosen ? "bg-brand text-white" : "bg-cream text-muted"
                  }`}>
                    {reveal && isRight ? <CheckCircle2 className="h-4 w-4" />
                      : reveal && chosen ? <XCircle className="h-4 w-4" />
                      : String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm text-ink/85">{opt}</span>
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <p className="mt-5 animate-[riseIn_.4s_ease] rounded-xl bg-cream p-4 text-sm leading-relaxed text-muted">
              <strong className="text-ink">Why: </strong>{q.explain}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
