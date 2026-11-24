import { useMemo, useState } from "react";
import { TrendingUp, Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";

type TradeEntry = {
  id: string;
  pair: string;
  direction: "Buy" | "Sell";
  entry: string;
  exit: string;
  rr: number;
  pnl: number;
  outcome: "Win" | "Loss" | "Breakeven";
  notes: string;
  createdAt: string;
};

export default function TradeJournalTab({ userId }: { userId: string }) {
  const storageKey = `gamat.trade_journal.${userId}`;
  const [trades, setTrades] = useState<TradeEntry[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [pair, setPair] = useState("EURUSD");
  const [direction, setDirection] = useState<"Buy" | "Sell">("Buy");
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");
  const [rr, setRr] = useState("2");
  const [pnl, setPnl] = useState("");
  const [outcome, setOutcome] = useState<"Win" | "Loss" | "Breakeven">("Win");
  const [notes, setNotes] = useState("");

  const persist = (next: TradeEntry[]) => {
    setTrades(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
  };

  const stats = useMemo(() => {
    const total = trades.length;
    const wins = trades.filter((t) => t.outcome === "Win").length;
    const winRate = total ? Math.round((wins / total) * 100) : 0;
    const netR = trades.reduce((acc, t) => acc + (t.outcome === "Loss" ? -Math.abs(t.rr) : t.outcome === "Win" ? Math.abs(t.rr) : 0), 0);
    const netPnl = trades.reduce((acc, t) => acc + (Number(t.pnl) || 0), 0);
    return { total, winRate, netR: Number(netR.toFixed(2)), netPnl: Number(netPnl.toFixed(2)) };
  }, [trades]);

  const addTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pair.trim()) return;
    const item: TradeEntry = {
      id: `tr_${Date.now()}`,
      pair: pair.trim().toUpperCase(),
      direction,
      entry: entry.trim() || "—",
      exit: exit.trim() || "—",
      rr: Number(rr) || 0,
      pnl: Number(pnl) || 0,
      outcome,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };
    persist([item, ...trades]);
    setEntry("");
    setExit("");
    setPnl("");
    setNotes("");
  };

  const removeTrade = (id: string) => {
    persist(trades.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Logged Trades", value: stats.total },
          { label: "Win Rate", value: `${stats.winRate}%` },
          { label: "Net R-Multiple", value: `${stats.netR >= 0 ? "+" : ""}${stats.netR}R` },
          { label: "Net P&L ($)", value: `${stats.netPnl >= 0 ? "+" : ""}$${stats.netPnl}` },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-white p-4 shadow-xs">
            <p className="text-xs font-semibold text-muted">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-ink">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-brand" />
          <h2 className="font-display text-lg font-bold text-ink">Log a Trade</h2>
        </div>

        <form onSubmit={addTrade} className="mt-4 grid gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Pair / Asset</label>
            <input
              value={pair}
              onChange={(e) => setPair(e.target.value)}
              placeholder="EURUSD, XAUUSD..."
              className="w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Direction</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as "Buy" | "Sell")}
              className="w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
            >
              <option value="Buy">Buy (Long)</option>
              <option value="Sell">Sell (Short)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Outcome</label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as "Win" | "Loss" | "Breakeven")}
              className="w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
            >
              <option value="Win">Win</option>
              <option value="Loss">Loss</option>
              <option value="Breakeven">Breakeven</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Risk : Reward (R)</label>
            <input
              type="number"
              step="0.1"
              value={rr}
              onChange={(e) => setRr(e.target.value)}
              placeholder="2.0"
              className="w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Entry Price</label>
            <input
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder="1.0845"
              className="w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Exit Price</label>
            <input
              value={exit}
              onChange={(e) => setExit(e.target.value)}
              placeholder="1.0910"
              className="w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">P&amp;L ($)</label>
            <input
              type="number"
              step="0.01"
              value={pnl}
              onChange={(e) => setPnl(e.target.value)}
              placeholder="150"
              className="w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full !py-2.5">
              <Plus className="h-4 w-4" /> Log Trade
            </button>
          </div>
          <div className="sm:col-span-4">
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Setup notes (e.g. London session sweep + FVG entry)..."
              className="w-full rounded-xl border border-line bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
            />
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-line bg-white overflow-hidden shadow-xs">
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-display text-base font-bold text-ink">Trade History</h3>
        </div>
        {trades.length ? (
          <div className="divide-y divide-line">
            {trades.map((t) => (
              <div key={t.id} className="px-4 py-3.5 sm:px-5 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3">
                    {t.outcome === "Win" ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-ink">{t.pair}</span>
                        <span
                          className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                            t.direction === "Buy"
                              ? "bg-emerald-500/10 text-emerald-700"
                              : "bg-brand/10 text-brand"
                          }`}
                        >
                          {t.direction}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted break-words">
                        Entry {t.entry} → Exit {t.exit}
                      </p>
                      {t.notes && (
                        <p className="mt-1 text-xs text-ink/70 break-words">
                          {t.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5 sm:gap-4">
                    <div className="text-right">
                      <p
                        className={`text-xs sm:text-sm font-bold whitespace-nowrap ${
                          t.outcome === "Win"
                            ? "text-emerald-600"
                            : t.outcome === "Loss"
                            ? "text-brand"
                            : "text-muted"
                        }`}
                      >
                        {t.outcome} ({t.rr}R)
                      </p>
                      <p className="text-xs font-medium text-muted whitespace-nowrap">
                        {Number(t.pnl) < 0 ? `-$${Math.abs(Number(t.pnl))}` : `$${t.pnl}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTrade(t.id)}
                      className="rounded-lg p-1.5 text-muted hover:bg-cream hover:text-brand cursor-pointer"
                      aria-label="Delete trade"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-6 text-center text-sm text-muted">
            No trades logged yet. Add your first trade above to track your consistency.
          </p>
        )}
      </div>
    </div>
  );
}
