/* ===================== Market Combat — predictions & ranks ===================== */

export type Direction = "up" | "down";

export type CombatScenario = {
  id: string;
  pair: string;
  title: string;
  timeframe: string;
  /** Hours until resolution (simulated). */
  horizonHours: number;
  entry: number;
  /** Settled close — used when the scenario resolves. */
  settle: number;
  fundamental: string;
  technical: string;
  riskNote: string;
  difficulty: "rookie" | "trader" | "pro" | "elite";
};

export type CombatPrediction = {
  id: string;
  scenarioId: string;
  pair: string;
  direction: Direction;
  createdAt: string;
  /** ISO time when this prediction can be resolved. */
  resolvesAt: string;
  status: "open" | "won" | "lost";
  points: number;
};

export type CombatRank = {
  level: number;
  title: string;
  minXp: number;
  color: string;
  blurb: string;
};

/** Hierarchy shown on profiles and the combat leaderboard. */
export const RANKS: CombatRank[] = [
  { level: 1, title: "Market Rookie", minXp: 0, color: "#6b7280", blurb: "Just stepping onto the floor." },
  { level: 2, title: "Chart Scout", minXp: 40, color: "#0ea5e9", blurb: "Reading structure, still learning patience." },
  { level: 3, title: "Session Trader", minXp: 120, color: "#10b981", blurb: "Comfortable with bias and levels." },
  { level: 4, title: "Bias Architect", minXp: 280, color: "#8b5cf6", blurb: "Combines macro and technical confluence." },
  { level: 5, title: "Liquidity Hunter", minXp: 500, color: "#f59e0b", blurb: "Anticipates sweeps and expansions." },
  { level: 6, title: "Desk Analyst", minXp: 850, color: "#dc3545", blurb: "Thinks in scenarios, not guesses." },
  { level: 7, title: "Market Commander", minXp: 1400, color: "#b45309", blurb: "Elite consistency under pressure." },
];

export const SCENARIOS: CombatScenario[] = [
  {
    id: "sc_eur_cpi",
    pair: "EURUSD",
    title: "Soft US CPI — dollar pressure into NY",
    timeframe: "Next 24–48 hours",
    horizonHours: 0.02, // ~1.2 min for demo playability
    entry: 1.0862,
    settle: 1.0914,
    fundamental: "US core CPI printed below consensus. Rate-cut odds ticked higher and the dollar index faded from local highs.",
    technical: "EURUSD reclaimed the overnight high and is holding above a fresh demand pocket on H1. Structure prints higher lows.",
    riskNote: "A hot follow-up speaker from the Fed could snap the move. Invalidation is a close back under the breakout candle.",
    difficulty: "rookie",
  },
  {
    id: "sc_gbp_boe",
    pair: "GBPUSD",
    title: "BoE hold with hawkish lean?",
    timeframe: "Post-decision session",
    horizonHours: 0.025,
    entry: 1.2688,
    settle: 1.2610,
    fundamental: "Markets price a hold, but sticky UK services inflation keeps a hawkish minority alive. Surprises here often fade the pound if the statement is softer than priced.",
    technical: "Cable is extended into daily supply after a straight three-day push. RSI stretched; equal highs sit just above.",
    riskNote: "A clearly hawkish press conference can extend the squeeze. Size down into the event.",
    difficulty: "trader",
  },
  {
    id: "sc_uj_riskoff",
    pair: "USDJPY",
    title: "Risk-off bid for the yen",
    timeframe: "Next 1–2 sessions",
    horizonHours: 0.03,
    entry: 151.42,
    settle: 150.18,
    fundamental: "Global equities wobble and US yields ease. When risk appetite drops, JPY often catches a bid even if the BoJ stays patient.",
    technical: "Price failed a clean break of the weekly high and left a long upper wick into resistance. Momentum rolling over on H4.",
    riskNote: "Intervention headlines cut both ways — keep stops logical, not emotional.",
    difficulty: "trader",
  },
  {
    id: "sc_xau_real",
    pair: "XAUUSD",
    title: "Gold vs falling real yields",
    timeframe: "Next 48 hours",
    horizonHours: 0.03,
    entry: 2342.5,
    settle: 2368.2,
    fundamental: "Soft US data and softer real yields historically support gold. ETF flows have stabilised after a quiet month.",
    technical: "Daily demand zone continues to hold. Bullish order block on H4 with an open fair-value gap overhead.",
    riskNote: "A surprise hawkish Fed tone can reverse precious metals quickly — trail risk if long.",
    difficulty: "pro",
  },
  {
    id: "sc_aud_china",
    pair: "AUDUSD",
    title: "China stimulus hopes lift the Aussie",
    timeframe: "Asia–London handoff",
    horizonHours: 0.025,
    entry: 0.6528,
    settle: 0.6581,
    fundamental: "Better-than-feared China activity data and talk of further support measures lift risk-sensitive currencies. Iron ore futures bid.",
    technical: "AUDUSD broke a multi-day descending trendline and retested it as support. London often continues Asia’s directional open here.",
    riskNote: "Commodity currencies gap on Chinese holiday schedules — watch the calendar.",
    difficulty: "rookie",
  },
  {
    id: "sc_btc_fomc",
    pair: "BTCUSD",
    title: "Crypto risk into FOMC minutes",
    timeframe: "Into / after minutes",
    horizonHours: 0.03,
    entry: 64250,
    settle: 62180,
    fundamental: "BTC rallied hard on ETF flow narratives. FOMC minutes can reprice liquidity expectations and hit high-beta assets first.",
    technical: "Price is extended above the weekly open with a series of shallow pullbacks — classic late-impulse structure vulnerable to a liquidity sweep lower.",
    riskNote: "Crypto trades 24/7; gaps are less common but wicks are violent. Use wider invalidation or smaller size.",
    difficulty: "elite",
  },
  {
    id: "sc_gbj_break",
    pair: "GBPJPY",
    title: "Cross breakout or bull trap?",
    timeframe: "Next London session",
    horizonHours: 0.02,
    entry: 191.85,
    settle: 190.42,
    fundamental: "Mixed UK data and a steady BoJ keep the cross driven more by risk sentiment than rate differentials this week.",
    technical: "A breakout above range highs is struggling to hold. Multiple wicks into liquidity above equal highs suggest a possible trap.",
    riskNote: "Crosses amplify volatility — halve normal risk if you engage.",
    difficulty: "pro",
  },
  {
    id: "sc_nas_open",
    pair: "NAS100",
    title: "US open: continuation or mean reversion?",
    timeframe: "First 2 hours of NY",
    horizonHours: 0.02,
    entry: 18240,
    settle: 18395,
    fundamental: "Mega-cap earnings beat aggregate estimates and bond yields are steady. Risk appetite remains constructive into the cash open.",
    technical: "Pre-market holds above VWAP with higher lows on the 5-minute. Opening drive often favours the pre-market direction when yields are calm.",
    riskNote: "First 5 minutes are noise. Wait for the opening range if you trade indices.",
    difficulty: "trader",
  },
];

export function rankForXp(xp: number): CombatRank {
  let current = RANKS[0];
  for (const r of RANKS) if (xp >= r.minXp) current = r;
  return current;
}

export function nextRank(xp: number): CombatRank | null {
  const cur = rankForXp(xp);
  return RANKS.find((r) => r.level === cur.level + 1) ?? null;
}

export function progressToNext(xp: number): number {
  const cur = rankForXp(xp);
  const nxt = nextRank(xp);
  if (!nxt) return 100;
  const span = nxt.minXp - cur.minXp;
  return Math.min(100, Math.round(((xp - cur.minXp) / span) * 100));
}

export function pointsFor(difficulty: CombatScenario["difficulty"], correct: boolean): number {
  const table = { rookie: 10, trader: 18, pro: 28, elite: 40 };
  return correct ? table[difficulty] : 0;
}

export function outcomeOf(s: CombatScenario): Direction {
  return s.settle >= s.entry ? "up" : "down";
}
