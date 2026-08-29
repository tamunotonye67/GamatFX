import { useEffect, useMemo, useState } from "react";
import PageHero from "../../components/PageHero";
import { navigate } from "../../lib/router";
import { useStore } from "../../lib/store";
import { useSolidNavbar } from "../../lib/chrome";
import {
  SCENARIOS, RANKS, rankForXp, nextRank, progressToNext, outcomeOf,
  type CombatScenario, type Direction,
} from "../../lib/combat";
import {
  TrendingUp, TrendingDown, Trophy, Flame, Target, Clock,
  CheckCircle2, XCircle, Lock, ChevronRight, Zap, Shield,
  BarChart3, Users, Info,
} from "lucide-react";

const DIFF_TONE: Record<CombatScenario["difficulty"], string> = {
  rookie: "bg-sky-100 text-sky-800",
  trader: "bg-emerald-100 text-emerald-800",
  pro: "bg-violet-100 text-violet-800",
  elite: "bg-brand-light text-brand",
};

function Avatar({ name, src, size = 40 }: { name: string; src?: string; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  if (src) return <img src={src} alt="" style={{ width: size, height: size }} className="shrink-0 rounded-full object-cover" />;
  return (
    <span style={{ width: size, height: size, fontSize: size * 0.34 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark font-bold text-white">
      {initials}
    </span>
  );
}

export default function MarketCombatPage() {
  const {
    isAuthed, user, combat, placeCombatPrediction,
    resolveCombatPredictions, combatLeaderboard,
  } = useStore();

  useSolidNavbar(true);

  // Auto-resolve any matured predictions.
  useEffect(() => {
    resolveCombatPredictions();
    const t = window.setInterval(() => resolveCombatPredictions(), 4000);
    return () => window.clearInterval(t);
  }, [resolveCombatPredictions]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const rank = rankForXp(combat.xp);
  const nxt = nextRank(combat.xp);
  const pct = progressToNext(combat.xp);
  const openCount = combat.predictions.filter((p) => p.status === "open").length;
  const settled = combat.predictions.filter((p) => p.status !== "open");

  const scenario = activeId ? SCENARIOS.find((s) => s.id === activeId) ?? null : null;

  const alreadyOpen = (id: string) =>
    combat.predictions.some((p) => p.scenarioId === id && p.status === "open");

  const lockIn = (dir: Direction) => {
    if (!scenario) return;
    if (!isAuthed) {
      navigate(`/login?next=/fun/market-combat`);
      return;
    }
    const res = placeCombatPrediction(scenario.id, dir);
    if (!res.ok) { setMsg(res.error ?? "Could not lock call."); return; }
    setMsg(`Call locked: ${scenario.pair} ${dir === "up" ? "▲ UP" : "▼ DOWN"}. Waiting for the market…`);
    setActiveId(null);
    window.setTimeout(() => setMsg(null), 3500);
  };

  const winRate = useMemo(() => {
    const total = combat.wins + combat.losses;
    return total ? Math.round((combat.wins / total) * 100) : 0;
  }, [combat.wins, combat.losses]);

  return (
    <>
      <PageHero
        crumb="Market Combat"
        eyebrow="Fun zone"
        image="/images/hero.jpg"
        title={<>Market <span className="text-brand">Combat</span></>}
        subtitle="Read the fundamental and technical brief, then lock a call — UP or DOWN. Earn XP, climb the ranks, and prove your process under pressure."
      />

      <section className="section bg-cream">
        <div className="container-x space-y-8">
          {msg && (
            <div className="rounded-2xl border border-brand/30 bg-brand-light px-5 py-3 text-sm font-semibold text-ink">
              {msg}
            </div>
          )}

          {/* Player profile / rank */}
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center gap-5">
                <Avatar
                  name={user ? (user.nickname || `${user.firstName} ${user.lastName}`) : "Guest"}
                  src={user?.avatar}
                  size={64}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">Combat profile</p>
                  <h2 className="font-display text-2xl font-extrabold text-ink">
                    {isAuthed
                      ? (user?.nickname || `${user?.firstName} ${user?.lastName}`)
                      : "Guest fighter"}
                  </h2>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{ background: rank.color }}>
                    <Shield className="h-3.5 w-3.5" /> Lv.{rank.level} · {rank.title}
                  </div>
                  <p className="mt-2 text-sm text-muted">{rank.blurb}</p>
                </div>
                {!isAuthed && (
                  <button onClick={() => navigate("/signup?next=/fun/market-combat")} className="btn-primary">
                    Create free profile
                  </button>
                )}
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted">{combat.xp} XP</span>
                  <span className="text-ink">
                    {nxt ? `${nxt.minXp - combat.xp} XP to ${nxt.title}` : "Max rank"}
                  </span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: rank.color }} />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { i: Trophy, v: combat.xp, l: "Total XP" },
                  { i: Target, v: `${winRate}%`, l: "Win rate" },
                  { i: Flame, v: combat.streak, l: "Win streak" },
                  { i: BarChart3, v: openCount, l: "Open calls" },
                ].map((s) => (
                  <div key={s.l} className="rounded-2xl bg-cream p-4 text-center">
                    <s.i className="mx-auto h-4 w-4 text-brand" />
                    <p className="mt-1.5 font-display text-lg font-extrabold text-ink">{s.v}</p>
                    <p className="text-[11px] text-muted">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rank hierarchy */}
            <div className="rounded-3xl border border-line bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Rank hierarchy</p>
              <ul className="mt-4 space-y-2">
                {[...RANKS].reverse().map((r) => {
                  const unlocked = combat.xp >= r.minXp;
                  const current = r.level === rank.level;
                  return (
                    <li key={r.level}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                        current ? "bg-brand text-white" : unlocked ? "bg-cream text-ink" : "text-muted opacity-60"
                      }`}>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-extrabold"
                        style={{ background: current ? "rgba(255,255,255,.2)" : `${r.color}22`, color: current ? "#fff" : r.color }}>
                        {r.level}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold">{r.title}</span>
                        <span className={`block text-[11px] ${current ? "text-white/75" : "text-muted"}`}>{r.minXp}+ XP</span>
                      </span>
                      {current && <Zap className="h-4 w-4" />}
                      {!unlocked && <Lock className="h-3.5 w-3.5" />}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Scenarios */}
          <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="eyebrow">Live scenarios</span>
                <h2 className="section-title mt-2">Make your call</h2>
              </div>
              <p className="text-sm text-muted">{SCENARIOS.length} boards · fundamentals + technicals</p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {SCENARIOS.map((s) => {
                const locked = alreadyOpen(s.id);
                const past = settled.find((p) => p.scenarioId === s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveId(s.id)}
                    className="card group text-left transition hover:-translate-y-1"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">{s.pair}</span>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${DIFF_TONE[s.difficulty]}`}>
                        {s.difficulty}
                      </span>
                      {locked && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-800">Open call</span>}
                      {past?.status === "won" && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-800">Won</span>}
                      {past?.status === "lost" && <span className="rounded-full bg-brand-light px-2.5 py-1 text-[10px] font-bold uppercase text-brand">Lost</span>}
                    </div>
                    <h3 className="mt-3 font-display text-lg font-bold text-ink group-hover:text-brand">{s.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted">{s.fundamental}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-brand" /> {s.timeframe}</span>
                      <span>Entry {s.entry}</span>
                      <span className="ml-auto inline-flex items-center gap-1 font-bold text-brand">
                        Analyse <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent results + leaderboard */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-line bg-white p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold text-ink">Your recent calls</h3>
              {combat.predictions.length ? (
                <ul className="mt-4 space-y-2">
                  {combat.predictions.slice(0, 8).map((p) => (
                    <li key={p.id} className="flex items-center justify-between rounded-xl bg-cream px-4 py-3 text-sm">
                      <span className="font-semibold text-ink">
                        {p.pair}{" "}
                        <span className={p.direction === "up" ? "text-emerald-600" : "text-brand"}>
                          {p.direction === "up" ? "▲ UP" : "▼ DOWN"}
                        </span>
                      </span>
                      <span className="flex items-center gap-2 text-xs font-bold">
                        {p.status === "open" && <span className="text-amber-600">Pending…</span>}
                        {p.status === "won" && <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> +{p.points} XP</span>}
                        {p.status === "lost" && <span className="inline-flex items-center gap-1 text-brand"><XCircle className="h-3.5 w-3.5" /> Miss</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted">No calls yet — open a scenario and lock your first prediction.</p>
              )}
            </div>

            <div className="rounded-3xl border border-line bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-brand" />
                <h3 className="font-display text-lg font-bold text-ink">Combat leaderboard</h3>
              </div>
              {combatLeaderboard.length ? (
                <ul className="mt-4 space-y-2">
                  {combatLeaderboard.map((row, i) => {
                    const r = rankForXp(row.xp);
                    return (
                      <li key={row.userId} className="flex items-center gap-3 rounded-xl bg-cream px-3 py-2.5">
                        <span className="w-6 text-center text-xs font-extrabold text-muted">#{i + 1}</span>
                        <Avatar name={row.name} src={row.avatar} size={32} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-ink">{row.name}</span>
                          <span className="text-[11px] font-semibold" style={{ color: r.color }}>{r.title}</span>
                        </span>
                        <span className="text-sm font-extrabold text-ink">{row.xp} XP</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted">Be the first on the board — win a call to appear here.</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-line bg-white p-5 text-sm text-muted">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <p>
              Market Combat uses <strong className="text-ink">educational scenarios</strong> with
              simulated settlement for training — not live brokerage prices and not financial advice.
              XP and ranks are for motivation inside the Fun Zone only.
            </p>
          </div>

          <div className="text-center">
            <button onClick={() => navigate("/fun")} className="btn-outline-dark">Back to Fun Zone</button>
          </div>
        </div>
      </section>

      {/* Scenario modal */}
      {scenario && (
        <ScenarioModal
          s={scenario}
          locked={alreadyOpen(scenario.id)}
          onClose={() => setActiveId(null)}
          onCall={lockIn}
          authed={isAuthed}
        />
      )}
    </>
  );
}

function ScenarioModal({
  s, locked, onClose, onCall, authed,
}: {
  s: CombatScenario;
  locked: boolean;
  onClose: () => void;
  onCall: (d: Direction) => void;
  authed: boolean;
}) {
  const actual = outcomeOf(s);
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-2xl rounded-3xl border border-line bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">{s.pair}</span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${DIFF_TONE[s.difficulty]}`}>{s.difficulty}</span>
            </div>
            <h3 className="mt-2 font-display text-xl font-extrabold text-ink">{s.title}</h3>
            <p className="mt-1 text-xs text-muted">{s.timeframe} · Entry reference {s.entry}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-muted hover:bg-cream hover:text-brand">✕</button>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-2xl border border-line bg-cream p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-brand">Fundamental brief</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">{s.fundamental}</p>
          </div>
          <div className="rounded-2xl border border-line bg-cream p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-brand">Technical brief</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">{s.technical}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <strong>Risk note:</strong> {s.riskNote}
          </div>

          {locked ? (
            <p className="rounded-xl bg-ink px-4 py-3 text-center text-sm font-semibold text-white">
              You already have an open call on this board. Wait for settlement.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => onCall("up")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-emerald-500">
                <TrendingUp className="h-5 w-5" /> Call UP
              </button>
              <button type="button" onClick={() => onCall("down")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-4 text-sm font-bold text-white transition hover:bg-brand-dark">
                <TrendingDown className="h-5 w-5" /> Call DOWN
              </button>
            </div>
          )}

          {!authed && (
            <p className="text-center text-xs text-muted">
              You’ll be asked to sign in so we can save XP to your combat profile.
            </p>
          )}

          {/* Hidden until settled — keeps honesty; players shouldn't see settle price early */}
          <p className="hidden">settle {s.settle} actual {actual}</p>
        </div>
      </div>
    </div>
  );
}
