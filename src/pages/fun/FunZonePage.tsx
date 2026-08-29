import PageHero from "../../components/PageHero";
import PageCta from "../../components/PageCta";
import { navigate } from "../../lib/router";
import { useReveal } from "../../lib/useReveal";
import { TRIVIA } from "../../lib/trivia";
import {
  Gamepad2, Crown, LineChart, ArrowUpRight, Infinity as InfinityIcon,
  Trophy, Zap, Swords,
} from "lucide-react";

const GAMES = [
  {
    to: "/fun/quiz",
    icon: Gamepad2,
    name: "Quiz Arcade",
    tag: "Unlimited",
    desc: "Endless forex trivia across three modes — Endless, Beat the Clock and Survival. Build streaks, chase your high score, learn as you go.",
    accent: "from-brand to-brand-dark",
    points: ["Unlimited questions", "3 game modes", "4 difficulty levels", "Streak scoring"],
  },
  {
    to: "/fun/millionaire",
    icon: Crown,
    name: "Millionaire Mindset",
    tag: "Game show",
    desc: "Climb 15 rungs from ₦5,000 to ₦10,000,000. Three lifelines, two safe havens, 45 seconds per question. How far can your knowledge take you?",
    accent: "from-amber-500 to-amber-600",
    points: ["15-rung prize ladder", "50:50, Ask the Room, Call a Mentor", "Two safe havens", "Walk away anytime"],
  },
  {
    to: "/fun/live-chart",
    icon: LineChart,
    name: "Live Chart Game",
    tag: "Simulator",
    desc: "Watch candles form tick by tick in real time. Open longs and shorts with virtual capital and feel how price action actually behaves.",
    accent: "from-sky-500 to-sky-700",
    points: ["Real-time candle formation", "4 instruments", "Long & short with P&L", "Adjustable speed"],
  },
  {
    to: "/fun/market-combat",
    icon: Swords,
    name: "Market Combat",
    tag: "Predictions",
    desc: "Read fundamental and technical briefs, then lock UP or DOWN calls. Earn XP, unlock ranks and climb the combat leaderboard.",
    accent: "from-violet-600 to-fuchsia-700",
    points: ["8 live scenarios", "7-tier rank hierarchy", "XP + win streaks", "Public leaderboard"],
  },
];

export default function FunZonePage() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <>
      <PageHero
        crumb="Fun Zone"
        eyebrow="Learn by playing"
        image="/images/hero.jpg"
        title={<>The GAMAT <span className="text-brand">Fun Zone</span></>}
        subtitle="Trading knowledge sticks faster when you're enjoying yourself. Four free games built to sharpen your market instincts — play, predict, and climb the ranks."
      />

      {/* Stats */}
      <section className="border-b border-line bg-white py-10">
        <div className="container-x grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          {[
            { i: InfinityIcon, v: "Unlimited", l: "Quiz questions" },
            { i: Trophy, v: "₦10M", l: "Top game prize" },
            { i: Zap, v: TRIVIA.length + "+", l: "Trivia in the bank" },
            { i: Zap, v: "Free", l: "Always" },
          ].map((s) => (
            <div key={s.l}>
              <s.i className="mx-auto h-6 w-6 text-brand" />
              <p className="mt-3 font-display text-xl font-extrabold text-ink md:text-2xl">{s.v}</p>
              <p className="text-sm text-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Games */}
      <section className="section bg-cream">
        <div ref={ref} className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">Pick your game</span>
            <h2 className="section-title mt-4">Four ways to sharpen up</h2>
          </div>

          <div className="mt-12 grid gap-7 md:grid-cols-2 xl:grid-cols-4">
            {GAMES.map((g, i) => (
              <button
                key={g.to}
                onClick={() => navigate(g.to)}
                className={`group flex flex-col overflow-hidden rounded-3xl border border-line bg-white text-left shadow-[0_18px_50px_-30px_rgba(22,24,28,0.35)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_32px_65px_-30px_rgba(22,24,28,0.45)] reveal ${visible ? "is-visible" : ""}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className={`relative overflow-hidden bg-gradient-to-br ${g.accent} p-8 text-white`}>
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-150" />
                  <div className="relative">
                    <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
                      {g.tag}
                    </span>
                    <g.icon className="mt-5 h-12 w-12 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" />
                    <h3 className="mt-4 font-display text-2xl font-extrabold">{g.name}</h3>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <p className="text-sm leading-relaxed text-muted">{g.desc}</p>
                  <ul className="mt-5 space-y-2">
                    {g.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-xs text-ink/75">
                        <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" /> {p}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-6 font-bold text-brand">
                    Play now <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <PageCta
        tone="red"
        title="Enjoyed the games? Learn it properly."
        body="Our structured courses turn scattered knowledge into a repeatable, profitable process."
        primaryLabel="Browse Courses"
        primaryTo="/courses"
      />
    </>
  );
}
