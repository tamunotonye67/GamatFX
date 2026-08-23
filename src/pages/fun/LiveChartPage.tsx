import { useCallback, useEffect, useRef, useState } from "react";
import PageHero from "../../components/PageHero";
import { navigate } from "../../lib/router";
import {
  TrendingUp, TrendingDown, Play, Pause, RotateCcw, Wallet,
  Activity, Gauge, Trophy, ArrowUpRight, ArrowDownRight, Zap, Info,
  Maximize2, Minimize2,
} from "lucide-react";

type Candle = { o: number; h: number; l: number; c: number };
type Position = { dir: 1 | -1; entry: number; size: number; openedAt: number } | null;

const START_BALANCE = 10_000;
const MAX_CANDLES = 60;
const TICK_MS = 260;          // price ticks
const CANDLE_TICKS = 8;       // ticks per candle

const PAIRS = [
  { s: "EUR/USD", base: 1.0850, vol: 0.00055, dp: 4 },
  { s: "GBP/USD", base: 1.2640, vol: 0.00075, dp: 4 },
  { s: "XAU/USD", base: 2340.0, vol: 1.6, dp: 2 },
  { s: "BTC/USD", base: 64200, vol: 90, dp: 1 },
];

export default function LiveChartPage() {
  const [pairIdx, setPairIdx] = useState(0);
  const pair = PAIRS[pairIdx];

  const [candles, setCandles] = useState<Candle[]>([]);
  const [price, setPrice] = useState(pair.base);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [balance, setBalance] = useState(START_BALANCE);
  const [pos, setPos] = useState<Position>(null);
  const [trades, setTrades] = useState<{ dir: 1 | -1; pnl: number }[]>([]);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const tickRef = useRef(0);
  const priceRef = useRef(pair.base);
  const trendRef = useRef(0);

  /* ---------------------------- Fullscreen engine ---------------------------- */
  const toggleFullscreen = () => {
    if (!chartContainerRef.current) return;
    const elem = chartContainerRef.current as any;
    if (!document.fullscreenElement && !elem.webkitFullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => setIsFullscreen((p) => !p));
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
        setIsFullscreen(true);
      } else {
        setIsFullscreen((p) => !p);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => setIsFullscreen(false));
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
        setIsFullscreen(false);
      } else {
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || (document as any).webkitFullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, []);

  /* ---------------------------- Reset on pair change ---------------------------- */
  const reset = useCallback((p = pair) => {
    priceRef.current = p.base;
    trendRef.current = 0;
    tickRef.current = 0;
    setPrice(p.base);
    setCandles(Array.from({ length: 24 }, () => ({ o: p.base, h: p.base, l: p.base, c: p.base })));
    setPos(null);
  }, [pair]);

  useEffect(() => { reset(PAIRS[pairIdx]); }, [pairIdx, reset]);

  /* ------------------------------- Price engine ------------------------------- */
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      // Random walk with drifting trend + occasional shocks.
      trendRef.current += (Math.random() - 0.5) * 0.28;
      trendRef.current = Math.max(-1, Math.min(1, trendRef.current * 0.97));
      const shock = Math.random() < 0.02 ? (Math.random() - 0.5) * 6 : 0;
      const move = (Math.random() - 0.5 + trendRef.current * 0.55 + shock) * pair.vol;

      const next = Math.max(pair.base * 0.9, priceRef.current + move);
      const dir = next > priceRef.current ? "up" : "down";
      priceRef.current = next;
      setPrice(next);
      setFlash(dir);
      window.setTimeout(() => setFlash(null), 160);

      tickRef.current += 1;
      setCandles((prev) => {
        const arr = [...prev];
        const last = { ...arr[arr.length - 1] };
        last.c = next;
        last.h = Math.max(last.h, next);
        last.l = Math.min(last.l, next);
        arr[arr.length - 1] = last;

        if (tickRef.current % CANDLE_TICKS === 0) {
          arr.push({ o: next, h: next, l: next, c: next });
          if (arr.length > MAX_CANDLES) arr.shift();
        }
        return arr;
      });
    }, TICK_MS / speed);
    return () => window.clearInterval(id);
  }, [running, speed, pair]);

  /* --------------------------------- Trading --------------------------------- */
  const pipValue = pair.dp === 4 ? 10000 : pair.dp === 2 ? 10 : 1;
  const unrealised = pos ? (price - pos.entry) * pos.dir * pipValue * pos.size : 0;

  const open = (dir: 1 | -1) => {
    if (pos) return;
    setPos({ dir, entry: price, size: 1, openedAt: Date.now() });
  };

  const close = () => {
    if (!pos) return;
    const pnl = Math.round(unrealised);
    setBalance((b) => b + pnl);
    setTrades((t) => [{ dir: pos.dir, pnl }, ...t].slice(0, 12));
    setPos(null);
  };

  const wins = trades.filter((t) => t.pnl > 0).length;
  const winRate = trades.length ? Math.round((wins / trades.length) * 100) : 0;
  const equity = balance + unrealised;

  /* ------------------------------ Chart geometry ------------------------------ */
  const W = 900, H = isFullscreen ? 500 : 340, PAD = 8;
  const highs = candles.map((c) => c.h);
  const lows = candles.map((c) => c.l);
  const hi = Math.max(...highs, price);
  const lo = Math.min(...lows, price);
  const range = hi - lo || pair.vol;
  const y = (v: number) => PAD + (1 - (v - lo) / range) * (H - PAD * 2);
  const cw = W / MAX_CANDLES;

  return (
    <>
      <PageHero crumb="Live Chart Game" eyebrow="Fun zone" image="/images/hero.jpg"
        title={<>Live <span className="text-brand">Chart Simulator</span></>}
        subtitle="Watch price action unfold tick by tick in real time. Open longs and shorts with virtual capital to feel how the market actually moves — zero risk, pure practice." />

      <section className="section bg-cream">
        <div className="container-x">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {PAIRS.map((p, i) => (
                <button key={p.s} onClick={() => setPairIdx(i)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                    i === pairIdx ? "bg-brand text-white" : "border border-line text-ink/70 hover:border-brand hover:text-brand"
                  }`}>{p.s}</button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {[1, 2, 4].map((s) => (
                <button key={s} onClick={() => setSpeed(s)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    speed === s ? "bg-ink text-white" : "border border-line text-muted hover:border-brand hover:text-brand"
                  }`}>{s}×</button>
              ))}
              <button onClick={() => setRunning((r) => !r)} title={running ? "Pause simulator" : "Play simulator"}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition hover:border-brand hover:text-brand">
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <button onClick={() => reset()} title="Reset chart"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition hover:border-brand hover:text-brand">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
            {/* Chart */}
            <div
              ref={chartContainerRef}
              className={`overflow-hidden bg-ink shadow-2xl transition-all duration-300 ${
                isFullscreen
                  ? "fixed inset-0 z-[100] flex flex-col justify-between p-4 sm:p-6 rounded-none bg-ink"
                  : "rounded-3xl border border-white/10"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg font-extrabold text-white">{pair.s}</span>
                  <span className={`font-display text-2xl font-extrabold tabular-nums transition-colors duration-150 ${
                    flash === "up" ? "text-emerald-400" : flash === "down" ? "text-brand" : "text-white"
                  }`}>
                    {price.toFixed(pair.dp)}
                  </span>
                  <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                    <ArrowUpRight className={`absolute h-4 w-4 text-emerald-400 transition-all duration-150 ${flash === "up" ? "opacity-100 scale-110" : "opacity-0 scale-95"}`} />
                    <ArrowDownRight className={`absolute h-4 w-4 text-brand transition-all duration-150 ${flash === "down" ? "opacity-100 scale-110" : "opacity-0 scale-95"}`} />
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    running ? "bg-emerald-500/15 text-emerald-400" : "bg-white/10 text-white/50"
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${running ? "animate-pulse bg-emerald-400" : "bg-white/40"}`} />
                    {running ? "LIVE" : "PAUSED"}
                  </span>
                  <button
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold text-white transition hover:border-white/50 hover:bg-white/20 active:scale-95"
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize2 className="h-3.5 w-3.5" />
                        <span>Exit Fullscreen</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-3.5 w-3.5" />
                        <span>Fullscreen</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <svg viewBox={`0 0 ${W} ${H}`} className="w-full bg-[#0d0f12]" preserveAspectRatio="none" style={{ height: isFullscreen ? "calc(100vh - 180px)" : 340 }}>
                {/* Grid */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <line key={i} x1="0" x2={W} y1={(H / 4) * i} y2={(H / 4) * i} stroke="rgba(255,255,255,.05)" strokeWidth="1" />
                ))}

                {/* Candles */}
                {candles.map((c, i) => {
                  const x = i * cw + cw / 2;
                  const up = c.c >= c.o;
                  const col = up ? "#10b981" : "#dc3545";
                  const bodyTop = y(Math.max(c.o, c.c));
                  const bodyH = Math.max(1.5, Math.abs(y(c.o) - y(c.c)));
                  return (
                    <g key={i}>
                      <line x1={x} x2={x} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth="1.2" opacity="0.85" />
                      <rect x={x - cw * 0.3} y={bodyTop} width={cw * 0.6} height={bodyH} fill={col} opacity="0.95" rx="0.5" />
                    </g>
                  );
                })}

                {/* Live price line */}
                <line x1="0" x2={W} y1={y(price)} y2={y(price)} stroke="#fff" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                <rect x={W - 78} y={y(price) - 11} width="76" height="22" rx="4" fill="#fff" />
                <text x={W - 40} y={y(price) + 5} textAnchor="middle" fontSize="12" fontWeight="700" fill="#16181c">
                  {price.toFixed(pair.dp)}
                </text>

                {/* Entry line */}
                {pos && (
                  <>
                    <line x1="0" x2={W} y1={y(pos.entry)} y2={y(pos.entry)}
                      stroke={pos.dir === 1 ? "#10b981" : "#dc3545"} strokeWidth="1.5" strokeDasharray="6 3" />
                    <rect x="4" y={y(pos.entry) - 11} width="92" height="22" rx="4"
                      fill={pos.dir === 1 ? "#10b981" : "#dc3545"} />
                    <text x="50" y={y(pos.entry) + 5} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
                      {pos.dir === 1 ? "LONG" : "SHORT"} {pos.entry.toFixed(pair.dp)}
                    </text>
                  </>
                )}
              </svg>

              {/* Trade controls */}
              <div className="grid grid-cols-2 gap-3 border-t border-white/10 p-4 sm:grid-cols-3">
                <button onClick={() => open(1)} disabled={!!pos}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-30">
                  <TrendingUp className="h-4 w-4 shrink-0" /> Buy / Long
                </button>
                <button onClick={() => open(-1)} disabled={!!pos}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-30">
                  <TrendingDown className="h-4 w-4 shrink-0" /> Sell / Short
                </button>
                <button onClick={close} disabled={!pos}
                  className="col-span-2 inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-30 sm:col-span-1">
                  <Zap className="h-4 w-4 shrink-0" />
                  <span className="tabular-nums truncate">
                    Close {pos ? `(${unrealised >= 0 ? "+" : ""}$${Math.round(unrealised)})` : ""}
                  </span>
                </button>
              </div>
            </div>

            {/* Side panel */}
            <aside className="space-y-5">
              <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Account</p>
                <p className="mt-2 font-display text-3xl font-extrabold tabular-nums text-ink">
                  ${equity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className={`mt-1 text-sm font-bold tabular-nums ${equity >= START_BALANCE ? "text-emerald-600" : "text-brand"}`}>
                  {equity >= START_BALANCE ? "+" : ""}
                  {(((equity - START_BALANCE) / START_BALANCE) * 100).toFixed(2)}%
                </p>

                {pos && (
                  <div className={`mt-4 rounded-xl p-3 text-sm ${unrealised >= 0 ? "bg-emerald-50" : "bg-brand-light"}`}>
                    <p className="flex items-center justify-between">
                      <span className="font-semibold text-ink">{pos.dir === 1 ? "Long" : "Short"} open</span>
                      <span className={`font-bold tabular-nums ${unrealised >= 0 ? "text-emerald-700" : "text-brand"}`}>
                        {unrealised >= 0 ? "+" : ""}${Math.round(unrealised)}
                      </span>
                    </p>
                    <p className="mt-1 text-xs tabular-nums text-muted">Entry {pos.entry.toFixed(pair.dp)}</p>
                  </div>
                )}

                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
                  {[
                    { i: Activity, v: trades.length, l: "Trades" },
                    { i: Trophy, v: `${winRate}%`, l: "Win rate" },
                    { i: Gauge, v: `${speed}×`, l: "Speed" },
                  ].map((s) => (
                    <div key={s.l}>
                      <s.i className="mx-auto h-4 w-4 text-brand" />
                      <p className="mt-1 font-display text-sm font-extrabold tabular-nums text-ink">{s.v}</p>
                      <p className="text-[10px] text-muted">{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trade log */}
              <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Recent trades</p>
                {trades.length ? (
                  <ul className="mt-3 space-y-1.5 min-h-[160px]">
                    {trades.map((t, i) => (
                      <li key={i} className="flex items-center justify-between rounded-lg bg-cream px-3 py-2 text-sm">
                        <span className="flex items-center gap-2 font-semibold text-ink">
                          {t.dir === 1 ? <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> : <TrendingDown className="h-3.5 w-3.5 text-brand" />}
                          {t.dir === 1 ? "Long" : "Short"}
                        </span>
                        <span className={`font-bold tabular-nums ${t.pnl >= 0 ? "text-emerald-600" : "text-brand"}`}>
                          {t.pnl >= 0 ? "+" : ""}${t.pnl}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-2 text-sm text-muted min-h-[160px] flex items-center">No trades yet — open a position to begin.</p>}

                <button onClick={() => { setBalance(START_BALANCE); setTrades([]); setPos(null); }}
                  className="btn-outline-dark mt-4 w-full !py-2.5">
                  <Wallet className="h-4 w-4" /> Reset account
                </button>
              </div>

              <div className="flex gap-3 rounded-2xl border border-brand/25 bg-brand-light p-4">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <p className="text-xs leading-relaxed text-ink/75">
                  Prices here are <strong>simulated</strong>, not live market data. This is a
                  learning tool for understanding price behaviour — not a trading platform.
                </p>
              </div>
            </aside>
          </div>

          <div className="mt-10 text-center">
            <button onClick={() => navigate("/fun")} className="btn-outline-dark">Back to Fun Zone</button>
          </div>
        </div>
      </section>
    </>
  );
}
