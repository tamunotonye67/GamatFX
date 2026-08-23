import { useEffect, useState } from "react";
import PageHero from "../../components/PageHero";
import { navigate } from "../../lib/router";
import { LADDER, ladderDifficulty, pickQuestions, fmtNaira, type TriviaQ } from "../../lib/trivia";
import {
  Crown, Users, Split, PhoneCall, Trophy, RotateCcw, Handshake,
  CheckCircle2, XCircle, Timer, Sparkles, ShieldCheck,
} from "lucide-react";

type Phase = "intro" | "playing" | "won" | "lost" | "banked";

const QUESTION_SECONDS = 45;

export default function MillionairePage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [level, setLevel] = useState(0);          // 0-indexed rung
  const [q, setQ] = useState<TriviaQ | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [removed, setRemoved] = useState<number[]>([]);
  const [left, setLeft] = useState(QUESTION_SECONDS);
  const [banked, setBanked] = useState(0);
  const [lifelines, setLifelines] = useState({ fifty: true, audience: true, phone: true });
  const [hint, setHint] = useState<string | null>(null);
  const [audience, setAudience] = useState<number[] | null>(null);
  const [seenIds, setSeenIds] = useState<Set<string>>(() => new Set());

  const rung = LADDER[level];

  /* Countdown */
  useEffect(() => {
    if (phase !== "playing" || locked) return;
    if (left <= 0) { lose(); return; }
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, left, locked]);

  const loadQuestion = (lvl: number, trackingSet?: Set<string>) => {
    const activeSeen = trackingSet || seenIds;
    const nextQ = pickQuestions(1, ladderDifficulty(lvl + 1), activeSeen)[0];
    setQ(nextQ);
    setPicked(null); setLocked(false); setRemoved([]);
    setLeft(QUESTION_SECONDS); setHint(null); setAudience(null);
  };

  const start = () => {
    setLevel(0); setBanked(0);
    const freshSeen = new Set<string>();
    setSeenIds(freshSeen);
    setLifelines({ fifty: true, audience: true, phone: true });
    loadQuestion(0, freshSeen);
    setPhase("playing");
  };

  const safeAmount = () => {
    let amt = 0;
    for (let i = 0; i < level; i++) if (LADDER[i].safe) amt = LADDER[i].prize;
    return amt;
  };

  function lose() {
    setLocked(true);
    window.setTimeout(() => { setBanked(safeAmount()); setPhase("lost"); }, 1800);
  }

  const lockIn = (i: number) => {
    if (locked || !q) return;
    setPicked(i); setLocked(true);
    const right = i === q.answer;
    window.setTimeout(() => {
      if (!right) { setBanked(safeAmount()); setPhase("lost"); return; }
      if (level === LADDER.length - 1) { setBanked(rung.prize); setPhase("won"); return; }
      const next = level + 1;
      setLevel(next);
      loadQuestion(next);
    }, 1800);
  };

  const walkAway = () => {
    setBanked(level > 0 ? LADDER[level - 1].prize : 0);
    setPhase("banked");
  };

  /* ----------------------------- Lifelines ----------------------------- */
  const useFifty = () => {
    if (!q || !lifelines.fifty) return;
    const wrong = q.options.map((_, i) => i).filter((i) => i !== q.answer);
    const drop = wrong.sort(() => Math.random() - 0.5).slice(0, 2);
    setRemoved(drop);
    setLifelines((l) => ({ ...l, fifty: false }));
  };

  const useAudience = () => {
    if (!q || !lifelines.audience) return;
    // Audience is usually right, more so on easy questions.
    const confidence = { easy: 0.82, medium: 0.68, hard: 0.52, expert: 0.4 }[q.difficulty];
    const base = q.options.map((_, i) => (i === q.answer ? confidence * 100 : 0));
    let remainder = 100 - base[q.answer];
    q.options.forEach((_, i) => {
      if (i === q.answer || removed.includes(i)) return;
      const share = Math.random() * remainder * 0.7;
      base[i] = share; remainder -= share;
    });
    const total = base.reduce((a, b) => a + b, 0);
    setAudience(base.map((b) => Math.round((b / total) * 100)));
    setLifelines((l) => ({ ...l, audience: false }));
  };

  const usePhone = () => {
    if (!q || !lifelines.phone) return;
    const sure = Math.random() < 0.75;
    const guess = sure ? q.answer : Math.floor(Math.random() * q.options.length);
    setHint(sure
      ? `Your mentor says: "I'm fairly confident it's ${String.fromCharCode(65 + guess)} — ${q.options[guess]}."`
      : `Your mentor says: "I'm not certain, but I'd lean toward ${String.fromCharCode(65 + guess)}. Trust your own read."`);
    setLifelines((l) => ({ ...l, phone: false }));
  };

  /* ------------------------------- Intro ------------------------------- */
  if (phase === "intro") {
    return (
      <>
        <PageHero crumb="Millionaire Mindset" eyebrow="Fun zone" image="/images/hero.jpg"
          title={<>Millionaire <span className="text-brand">Mindset</span></>}
          subtitle="Fifteen forex questions. Three lifelines. Two safe havens. Climb the ladder from ₦5,000 to ₦10,000,000 — how far can your market knowledge take you?" />

        <section className="section bg-cream">
          <div className="container-x grid gap-10 lg:grid-cols-[1fr_320px]">
            <div className="rounded-3xl border border-line bg-white p-8 shadow-lg">
              <h2 className="font-display text-2xl font-extrabold text-ink">How to play</h2>
              <ul className="mt-6 space-y-4">
                {[
                  { i: Crown, t: "Climb 15 rungs", d: "Questions get progressively harder as the prize grows." },
                  { i: ShieldCheck, t: "Two safe havens", d: "Reach ₦80,000 and ₦1,000,000 to guarantee that amount." },
                  { i: Timer, t: "45 seconds per question", d: "Run out of time and the game ends at your last safe haven." },
                  { i: Handshake, t: "Walk away anytime", d: "Bank your winnings before risking them on the next question." },
                ].map((r) => (
                  <li key={r.t} className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                      <r.i className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-display text-base font-bold text-ink">{r.t}</p>
                      <p className="mt-0.5 text-sm text-muted">{r.d}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="mt-7 text-xs font-semibold uppercase tracking-wide text-muted">Your three lifelines</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {[
                  { i: Split, n: "50 : 50", d: "Removes two wrong answers" },
                  { i: Users, n: "Ask the Room", d: "Poll the GAMAT community" },
                  { i: PhoneCall, n: "Call a Mentor", d: "Get a mentor's opinion" },
                ].map((l) => (
                  <div key={l.n} className="rounded-2xl border border-line bg-cream p-4 text-center">
                    <l.i className="mx-auto h-5 w-5 text-brand" />
                    <p className="mt-2 text-sm font-bold text-ink">{l.n}</p>
                    <p className="text-[11px] text-muted">{l.d}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={start} className="btn-primary"><Crown className="h-4 w-4" /> Start the game</button>
                <button onClick={() => navigate("/fun")} className="btn-outline-dark">Back to Fun Zone</button>
              </div>
            </div>

            <Ladder level={-1} />
          </div>
        </section>

      </>
    );
  }

  /* ------------------------------ Endgame ------------------------------ */
  if (phase !== "playing") {
    const won = phase === "won";
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-6 py-24">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur">
          {won ? <Trophy className="mx-auto h-16 w-16 text-amber-400" />
            : phase === "banked" ? <Handshake className="mx-auto h-16 w-16 text-brand" />
            : <XCircle className="mx-auto h-16 w-16 text-brand" />}

          <h1 className="mt-5 font-display text-3xl font-extrabold text-white">
            {won ? "You're a Millionaire Mind!" : phase === "banked" ? "You walked away" : "Game over"}
          </h1>
          <p className="mt-2 text-white/70">
            {won ? "You answered all fifteen questions correctly." :
              phase === "banked" ? "Smart play — you banked your winnings." :
              "Better luck next time. Your safe haven protected you."}
          </p>

          <div className="mt-7 rounded-2xl border border-dashed border-brand/50 bg-brand/10 p-6">
            <p className="text-xs uppercase tracking-widest text-white/50">You take home</p>
            <p className="mt-2 font-display text-4xl font-extrabold text-amber-400">{fmtNaira(banked)}</p>
            <p className="mt-2 text-xs text-white/40">Reached level {level + (won ? 1 : 0)} of 15</p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={start} className="btn-primary"><RotateCcw className="h-4 w-4" /> Play again</button>
            <button onClick={() => navigate("/fun")} className="btn-ghost">Fun Zone</button>
          </div>
          <p className="mt-5 text-xs text-white/35">This is a knowledge game. No real money is awarded.</p>
        </div>
      </div>
    );
  }

  /* ------------------------------ Playing ------------------------------ */
  return (
    <div className="min-h-screen bg-ink pb-16 pt-28 text-white">
      <div className="container-x grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          {/* HUD */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <span className="font-display text-lg font-extrabold text-amber-400">{fmtNaira(rung.prize)}</span>
            <span className="text-sm text-white/60">Question {level + 1} of 15</span>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ${left <= 10 ? "animate-pulse bg-brand" : "bg-white/10"}`}>
              <Timer className="h-4 w-4" /> {left}s
            </span>
          </div>

          {/* Lifelines */}
          <div className="mt-5 flex flex-wrap gap-3">
            <Lifeline on={lifelines.fifty} icon={Split} label="50:50" onClick={useFifty} />
            <Lifeline on={lifelines.audience} icon={Users} label="Ask the Room" onClick={useAudience} />
            <Lifeline on={lifelines.phone} icon={PhoneCall} label="Call a Mentor" onClick={usePhone} />
            <button onClick={walkAway} disabled={locked}
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-bold transition hover:border-white hover:bg-white/10 disabled:opacity-40">
              <Handshake className="h-4 w-4" /> Walk away
            </button>
          </div>

          {/* Question */}
          {q && (
            <div key={level} className="mt-6 animate-[riseIn_.5s_cubic-bezier(.22,1,.36,1)]">
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.03] p-8 text-center shadow-2xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" /> {q.difficulty} · {q.topic}
                </span>
                <h2 className="mt-4 font-display text-xl font-extrabold leading-snug md:text-2xl">{q.q}</h2>
              </div>

              {hint && (
                <p className="mt-4 animate-[riseIn_.4s_ease] rounded-2xl border border-sky-400/30 bg-sky-400/10 p-4 text-sm text-sky-100">
                  <PhoneCall className="mr-2 inline h-4 w-4" />{hint}
                </p>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {q.options.map((opt, i) => {
                  if (removed.includes(i)) return <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 opacity-30" />;
                  const isRight = i === q.answer;
                  const chosen = picked === i;
                  const reveal = locked && picked !== null;
                  return (
                    <button key={i} onClick={() => lockIn(i)} disabled={locked}
                      className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition ${
                        reveal && isRight ? "border-emerald-400 bg-emerald-500/25"
                          : reveal && chosen ? "border-brand bg-brand/30"
                          : "border-white/15 bg-white/5 hover:border-amber-400/60 hover:bg-white/10"
                      } disabled:cursor-not-allowed`}>
                      <span className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          reveal && isRight ? "bg-emerald-500" : reveal && chosen ? "bg-brand" : "bg-white/10 text-amber-400"
                        }`}>
                          {reveal && isRight ? <CheckCircle2 className="h-4 w-4" />
                            : reveal && chosen ? <XCircle className="h-4 w-4" />
                            : String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-sm">{opt}</span>
                      </span>
                      {audience && (
                        <span className="mt-3 block">
                          <span className="flex items-center gap-2">
                            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                              <span className="block h-full rounded-full bg-amber-400 transition-all duration-1000"
                                style={{ width: `${audience[i]}%` }} />
                            </span>
                            <span className="text-[11px] font-bold text-amber-400">{audience[i]}%</span>
                          </span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <Ladder level={level} dark />
      </div>
    </div>
  );
}

/* ------------------------------ Sub-components ------------------------------ */

function Lifeline({ on, icon: Icon, label, onClick }: {
  on: boolean; icon: React.ElementType; label: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} disabled={!on} title={label}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition ${
        on ? "border-amber-400/50 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20"
           : "border-white/10 text-white/25 line-through"
      }`}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

/**
 * Prize ladder. `dark` must be true only on the dark in-game screen —
 * on the light intro page the light palette is used instead.
 */
function Ladder({ level, dark = false }: { level: number; dark?: boolean }) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div
        className={`rounded-2xl border p-3 ${
          dark ? "border-white/10 bg-white/5" : "border-line bg-white shadow-sm"
        }`}
      >
        <p
          className={`px-2 py-2 text-[10px] font-bold uppercase tracking-[0.18em] ${
            dark ? "text-white/40" : "text-muted"
          }`}
        >
          Prize ladder
        </p>
        <ul className="flex flex-col-reverse">
          {LADDER.map((r, i) => {
            const current = i === level;
            const done = i < level;

            let tone: string;
            if (current) tone = "bg-brand font-extrabold text-white";
            else if (done) tone = dark ? "text-emerald-400" : "text-emerald-600";
            else if (r.safe) tone = dark ? "font-bold text-amber-400" : "font-bold text-amber-600";
            else tone = dark ? "text-white/45" : "text-ink/60";

            return (
              <li
                key={r.level}
                className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition ${tone}`}
              >
                <span className="flex items-center gap-2">
                  {r.safe && <ShieldCheck className="h-3.5 w-3.5" />}
                  {r.level}
                </span>
                <span>{fmtNaira(r.prize)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
