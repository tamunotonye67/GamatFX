/* ================= Shared trivia question bank ================= */

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export type TriviaQ = {
  id?: string;
  q: string;
  options: string[];
  answer: number;
  explain: string;
  difficulty: Difficulty;
  topic: string;
};

const T = (
  difficulty: Difficulty,
  topic: string,
  q: string,
  options: string[],
  answer: number,
  explain: string,
  id?: string
): TriviaQ => ({
  id: id || `${difficulty}_${topic}_${q.slice(0, 20).replace(/\W/g, "")}`,
  q,
  options,
  answer,
  explain,
  difficulty,
  topic,
});

export const TRIVIA: TriviaQ[] = [
  /* ---------------- EASY ---------------- */
  T("easy", "Basics", "What does 'forex' stand for?", ["Foreign Exchange", "Forward Extension Market", "Formal Exchange Settlement", "Foreign Export Reserve"], 0, "Forex is short for foreign exchange — the global market for trading currencies."),
  T("easy", "Basics", "Which currency is known as the 'greenback'?", ["Euro", "British Pound Sterling", "US Dollar", "Swiss Franc Reserve"], 2, "The US dollar earned the nickname from the green ink used on its banknotes."),
  T("easy", "Basics", "How many major currency pairs are there conventionally?", ["3 major pairs", "7", "15 global pairs", "28 total pairs"], 1, "There are seven majors, all involving the US dollar."),
  T("easy", "Basics", "What is the nickname for GBP/USD?", ["Loonie Dollar", "Cable", "Kiwi Cross", "Aussie Dollar"], 1, "'Cable' comes from the transatlantic telegraph cable once used to transmit the rate."),
  T("easy", "Basics", "Which of these is NOT a currency?", ["Japanese Yen", "South African Rand", "Mexican Peso", "Bourse"], 3, "A bourse is a stock exchange, not a currency."),
  T("easy", "Basics", "What does 'bullish' mean?", ["Expecting prices to decline sharply", "Expecting prices to rise", "Closing all open margin positions", "Trading sideways in a tight channel"], 1, "A bull market rises; the bull attacks by thrusting its horns upward."),
  T("easy", "Basics", "The forex market is open how many days a week?", ["7 full days", "5", "6 business days", "4 trading days"], 1, "It runs 24 hours a day, five days a week, closing over the weekend."),
  T("easy", "Sessions", "Which session opens first each trading week?", ["London European Session", "New York North American Session", "Sydney", "Tokyo Asian Session"], 2, "Sydney opens the trading week on Monday morning (Sunday evening UTC), followed by Tokyo."),
  T("easy", "Basics", "What is the official currency of Nigeria?", ["Ghanaian Cedi", "Naira", "Kenyan Shilling", "South African Rand"], 1, "The Nigerian Naira, symbol ₦."),
  T("easy", "Basics", "What does 'going long' mean?", ["Selling a currency pair short", "Buying", "Waiting on the sidelines in cash", "Closing a losing trade early"], 1, "Going long means buying, expecting the price to rise."),
  T("easy", "Basics", "Which is the safest place for a beginner to practise?", ["A high-leverage live account", "Demo account", "A borrowed funded prop account", "An unhedged margin account"], 1, "A demo account lets you build process at zero financial risk."),
  T("easy", "Basics", "What is the nickname for AUD/USD?", ["Aussie", "Kiwi Dollar", "Canadian Loonie", "Swissy Franc"], 0, "AUD/USD is the 'Aussie'; NZD/USD is the 'Kiwi'."),
  T("easy", "Basics", "What does 'going short' mean in trading?", ["Closing a position before rollover", "Buying a base currency on margin", "Selling first to profit from a drop", "Holding a trade for under a minute"], 2, "Going short means selling first to profit from a price decline."),
  T("easy", "Basics", "Which symbol represents the Euro?", ["$ (Dollar Sign)", "£ (Pound Sign)", "€", "¥ (Yen Sign)"], 2, "€ is the symbol for the Euro."),
  T("easy", "Basics", "What does USD stand for?", ["United States Dollar", "Universal Standard Reserve Dollar", "United Sterling Treasury Dollar", "Union State Commercial Dollar"], 0, "USD stands for United States Dollar."),
  T("easy", "Basics", "What is a 'bid' price?", ["The price you sell at", "The price you buy at from the broker", "The highest price reached that week", "The overnight commission fee"], 0, "The bid price is the price at which the market/broker buys from you (the price you sell at)."),

  /* ---------------- MEDIUM ---------------- */
  T("medium", "Mechanics", "On most non-JPY pairs, a pip is which decimal place?", ["1st decimal place", "2nd decimal place", "4th", "6th decimal place"], 2, "The fourth decimal on most pairs; the second on JPY pairs."),
  T("medium", "Mechanics", "How many units is a standard lot?", ["1,000 base units", "10,000 base units", "100,000", "1,000,000 base units"], 2, "A standard lot is 100,000 units of the base currency."),
  T("medium", "Mechanics", "What is the spread?", ["A monthly broker loyalty rebate", "Bid-ask difference", "Your net realized profit after tax", "The overnight weekend rollover fee"], 1, "The bid-ask difference, and a cost you pay on entry."),
  T("medium", "Mechanics", "What is a swap in forex?", ["A social copy-trading subscription", "Overnight interest adjustment", "Switching between two retail brokers", "A reversal chart pattern on H4"], 1, "Swap is the interest adjustment for holding a position overnight."),
  T("medium", "Analysis", "What does CPI measure?", ["Monthly manufacturing employment", "Inflation", "Quarterly gross domestic product", "International trade balance deficits"], 1, "The Consumer Price Index measures inflation in consumer goods."),
  T("medium", "Analysis", "NFP stands for…", ["National Monetary Finance Policy", "Non-Farm Payrolls", "New Interbank Forex Pricing", "Net Foreign Reserve Position"], 1, "Non-Farm Payrolls is the key monthly US employment report."),
  T("medium", "Analysis", "Which pair is most directly affected by an ECB rate decision?", ["USD/JPY", "EUR/USD", "AUD/NZD", "GBP/CAD"], 1, "The ECB sets euro-area policy, directly impacting EUR pairs."),
  T("medium", "Sessions", "Which two sessions overlap for the highest daily liquidity?", ["Sydney & Tokyo Asian hours", "London & New York", "Tokyo & late New York close", "Sydney & early Frankfurt open"], 1, "The London–New York overlap is the most liquid window of the day."),
  T("medium", "Risk", "Risking 1% with a 1:3 reward means a winner returns…", ["1% account gain", "2% account gain", "3%", "10% account gain"], 2, "A 1:3 reward-to-risk on 1% risk yields roughly 3%."),
  T("medium", "Analysis", "What is a safe-haven currency?", ["A currency that never experiences red days", "Currency bought during global uncertainty", "An exotic pair with zero broker spread", "A decentralized cryptocurrency token"], 1, "USD, JPY and CHF typically strengthen when risk appetite falls."),
  T("medium", "Mechanics", "What is slippage?", ["A visual charting glitch on MT5", "Fill price differing from requested price", "A fixed monthly account maintenance fee", "A three-candle continuation pattern"], 1, "Slippage occurs when your order fills at a different price than requested."),
  T("medium", "Psychology", "Revenge trading usually happens…", ["After a calm, planned winning week", "Right after a loss", "Only on bank holiday weekends", "During spreadsheet backtesting"], 1, "Stress hormones after a loss push traders toward immediate corrective action."),
  T("medium", "Analysis", "A 'dovish' central bank is likely to…", ["Aggressively hike interest rates", "Cut or hold rates low", "Ban retail spot currency trading", "Peg its currency to physical silver"], 1, "Dovish means accommodative — typically bearish for that currency."),
  T("medium", "Technical", "What indicator consists of a fast line, slow line, and histogram?", ["Relative Strength Index (RSI)", "MACD", "Stochastic Oscillator", "Bollinger Volatility Bands"], 1, "MACD (Moving Average Convergence Divergence) features fast/slow lines and a histogram."),
  T("medium", "Technical", "What candle pattern has a long lower wick and small body at the top?", ["Bearish Shooting Star", "Hammer", "Four-Price Doji", "Bullish Marubozu"], 1, "A Hammer indicates rejection of lower prices at support."),

  /* ---------------- HARD ---------------- */
  T("hard", "Risk", "A 50% drawdown requires what gain on remaining equity to break even?", ["50% gain on remaining equity", "75% gain on remaining equity", "100%", "125% gain on remaining equity"], 2, "Drawdown is asymmetric — halving your account requires doubling it to recover."),
  T("hard", "Risk", "A 75% drawdown requires what gain on remaining equity to recover?", ["75% recovery gain", "150% recovery gain", "300%", "200% recovery gain"], 2, "You need a 300% gain, which is why deep drawdowns are usually terminal."),
  T("hard", "Structure", "An uptrend is structurally defined by…", ["Five consecutive green M1 candles", "Higher highs and higher lows", "Price hovering near a moving average", "Rising tick volume during Tokyo hours"], 1, "Structure defines trend, not candle colour or indicators."),
  T("hard", "Structure", "A liquidity grab is characterised by…", ["A slow multi-day sideways drift", "Sweep beyond a level and sharp reversal", "A weekend broker maintenance gap", "Fixed spreads during Asian hours"], 1, "Price sweeps stops beyond an obvious level, then sharply reverses."),
  T("hard", "Structure", "What is an order block?", ["Any oversized news spike candle", "Last opposing candle before BOS", "A round number ending in 000", "A broker margin restriction rule"], 1, "It marks the last opposing candle before displacement breaks structure."),
  T("hard", "Analysis", "Markets primarily price in…", ["Last year's historical headline number", "Surprise vs consensus expectations", "Retail social media poll sentiment", "Historical broker demo positioning"], 1, "You trade the deviation from consensus, not the raw figure."),
  T("hard", "Risk", "Three 1% dollar-correlated positions behave like…", ["0.33% diversified risk per trade", "1% capped portfolio risk", "Roughly 3% risk", "A completely hedged risk-free book"], 2, "Correlation is hidden leverage — they move together as one larger position."),
  T("hard", "Mechanics", "Premium pricing refers to…", ["A VIP low-commission broker tier", "Upper half of a dealing range", "Zero-spread institutional accounts", "Weekend cryptocurrency over-the-counter pricing"], 1, "You generally sell in premium (above 50%) and buy in discount (below 50%)."),
  T("hard", "History", "Which 1992 event is George Soros famous for?", ["Breaking the Bank of England", "Founding the European Central Bank", "Designing the physical Euro banknotes", "Launching the MetaTrader 4 platform"], 0, "Soros shorted GBP during Black Wednesday, reportedly earning over $1bn."),
  T("hard", "History", "The Bretton Woods system pegged currencies to…", ["Crude oil futures contracts", "Gold via the US dollar", "Industrial silver bullion reserves", "The British Pound Sterling"], 1, "It fixed currencies to the dollar, which was convertible to gold until 1971."),
  T("hard", "Mechanics", "A fair value gap represents…", ["A broker server pricing malfunction", "Three-candle price delivery imbalance", "A quarterly stock dividend adjustment", "An overnight triple-swap rollover charge"], 1, "It shows a 3-candle imbalance where one side overwhelmed the other."),
  T("hard", "Psychology", "How many trades before performance data is statistically meaningful?", ["10 random scalps", "15 demo trades", "At least 50", "5 high-risk trades"], 2, "You need a meaningful sample (30–50+ trades) before drawing conclusions about an edge."),

  /* ---------------- EXPERT ---------------- */
  T("expert", "Mechanics", "Approximate daily global forex turnover as of recent BIS surveys?", ["$750 billion per day", "$2 trillion per day", "$7.5 trillion", "$50 trillion per day"], 2, "The BIS Triennial Survey put daily turnover around $7.5 trillion."),
  T("expert", "Analysis", "Interest rate parity theory links…", ["Crude oil and physical gold prices", "Spot/forward rates and rate differentials", "National GDP and consumer inflation", "Corporate stocks and municipal bonds"], 1, "It states forward rates reflect the interest rate differential between two currencies."),
  T("expert", "Analysis", "The 'carry trade' involves…", ["Buying and holding physical gold bars", "Borrowing low-yield to buy high-yield", "Scalping five-second candles at open", "Hedging equities with binary options"], 1, "Traders borrow a low-yield currency to invest in a higher-yielding currency."),
  T("expert", "Mechanics", "What is a 'fixing' in forex?", ["A scheduled broker server reboot", "Benchmark rate set at a fixed time", "A retail stop-loss hunting algorithm", "An automated margin call liquidation"], 1, "Benchmarks like the WM/Reuters 4pm London fix set institutional reference rates."),
  T("expert", "History", "Which currency did Switzerland unpeg from the euro in January 2015?", ["European Euro (EUR)", "CHF", "US Dollar (USD)", "British Pound (GBP)"], 1, "The SNB abandoned the 1.20 EUR/CHF floor, causing a violent CHF surge."),
  T("expert", "Analysis", "Purchasing Power Parity suggests exchange rates should equalise…", ["Short-term central bank repo rates", "Identical goods' prices across countries", "Domestic technology stock indices", "Thirty-year sovereign bond yields"], 1, "The Big Mac Index is a popular informal illustration of PPP."),
  T("expert", "Mechanics", "In a 1:500 leverage account, $1,000 margin controls up to…", ["$5,000 notional volume", "$50,000 notional volume", "$500,000", "$5,000,000 notional volume"], 2, "1:500 leverage on $1,000 margin controls $500,000 notional."),
  T("expert", "Analysis", "A 2s10s Treasury yield curve inversion typically signals…", ["Guaranteed decade-long economic boom", "Recession risk ahead", "Immediate currency pegging to gold", "Hyperinflation in commodity exports"], 1, "Inverted yield curves have historically preceded economic recessions."),
];

/* --------------------------- Procedural Question Generator --------------------------- */

function generateProceduralQuestion(difficulty: Difficulty, attemptSeed: number): TriviaQ {
  const pairs = ["EUR/USD", "GBP/USD", "AUD/USD", "NZD/USD", "EUR/GBP", "USD/CAD"];
  const selectedPair = pairs[attemptSeed % pairs.length];
  const variant = attemptSeed % 3;

  if (difficulty === "easy") {
    if (variant === 0) {
      const pips = 15 + (attemptSeed % 8) * 10;
      const dollarVal = pips * 10;
      return shuffleOptions({
        id: `proc_easy_${attemptSeed}`,
        q: `If you gain ${pips} pips on 1 standard lot of ${selectedPair}, how much profit in USD is generated?`,
        options: [
          `$${dollarVal}`,
          `$${dollarVal / 2} after deducting standard lot margin`,
          `$${dollarVal * 2} including the base currency bonus`,
          `$${dollarVal + 75} before overnight swap adjustments`,
        ],
        answer: 0,
        explain: `At $10 per pip on a 1.0 standard lot, ${pips} pips equals $${dollarVal}.`,
        difficulty: "easy",
        topic: "Risk & Math",
      });
    } else if (variant === 1) {
      const miniLots = 2 + (attemptSeed % 7);
      const units = miniLots * 10000;
      return shuffleOptions({
        id: `proc_easy_units_${attemptSeed}`,
        q: `How many units of the base currency are controlled by 0.${miniLots}0 standard lots (${miniLots} mini lots) on ${selectedPair}?`,
        options: [
          `${units.toLocaleString()} units`,
          `${(units / 10).toLocaleString()} units on standard retail accounts`,
          `${(units * 10).toLocaleString()} units during the London overlap`,
          `100,000 fixed units regardless of lot fraction`,
        ],
        answer: 0,
        explain: `1 standard lot is 100,000 units, so 0.${miniLots}0 lots equals ${units.toLocaleString()} units.`,
        difficulty: "easy",
        topic: "Lot Sizes",
      });
    } else {
      const riskUsd = 50 + (attemptSeed % 6) * 25;
      const rr = 2 + (attemptSeed % 3);
      const targetUsd = riskUsd * rr;
      return shuffleOptions({
        id: `proc_easy_rr_${attemptSeed}`,
        q: `If you risk $${riskUsd} on a ${selectedPair} trade with a 1:${rr} Risk-to-Reward ratio, what is your target profit?`,
        options: [
          `$${targetUsd}`,
          `$${riskUsd} matching the initial stop-loss distance`,
          `$${targetUsd * 2} after doubling for the quote currency`,
          `$${Math.round(targetUsd / 2)} after broker spread deduction`,
        ],
        answer: 0,
        explain: `Risking $${riskUsd} at 1:${rr} R:R targets $${riskUsd} × ${rr} = $${targetUsd}.`,
        difficulty: "easy",
        topic: "R:R Basics",
      });
    }
  } else if (difficulty === "medium") {
    const accSize = 10000 + (attemptSeed % 6) * 10000;
    const riskPct = 1 + (attemptSeed % 2);
    const riskDollar = (accSize * riskPct) / 100;
    const slPips = 20 + (attemptSeed % 4) * 10;
    const expectedLot = (riskDollar / (slPips * 10)).toFixed(2);

    return shuffleOptions({
      id: `proc_med_${attemptSeed}`,
      q: `On a $${accSize.toLocaleString()} account, risking ${riskPct}% with a ${slPips}-pip stop loss on ${selectedPair}, what is your lot size?`,
      options: [
        `${expectedLot} Lots`,
        `${(Number(expectedLot) * 2).toFixed(2)} Lots using double pip valuation`,
        `${(Number(expectedLot) / 2).toFixed(2)} Lots reserving half for margin`,
        `1.00 Standard Lot regardless of stop distance`,
      ],
      answer: 0,
      explain: `Risking $${riskDollar} over a ${slPips}-pip stop ($10/pip/lot) gives a position size of ${expectedLot} lots.`,
      difficulty: "medium",
      topic: "Position Sizing",
    });
  } else if (difficulty === "hard") {
    const risk = 1 + (attemptSeed % 2);
    const rr = 3 + (attemptSeed % 3);
    const gainPct = risk * rr;
    return shuffleOptions({
      id: `proc_hard_${attemptSeed}`,
      q: `If you risk ${risk}% per trade with a 1:${rr} Risk-to-Reward ratio, what portfolio percentage is gained on a winning trade?`,
      options: [
        `+${gainPct}%`,
        `+${gainPct / 2}% after accounting for margin reserve`,
        `+${gainPct + 3}% due to intraday leverage compounding`,
        `+1.0% capped by standard retail account rules`,
      ],
      answer: 0,
      explain: `Risking ${risk}% at a 1:${rr} R:R yields +${gainPct}% return per winning trade.`,
      difficulty: "hard",
      topic: "R:R Math",
    });
  } else {
    const leverage = 100 * (1 + (attemptSeed % 5));
    const margin = 500 * (1 + (attemptSeed % 4));
    const notional = margin * leverage;
    return shuffleOptions({
      id: `proc_exp_${attemptSeed}`,
      q: `With 1:${leverage} leverage, a $${margin.toLocaleString()} margin deposit controls what total notional value?`,
      options: [
        `$${notional.toLocaleString()}`,
        `$${(notional / 2).toLocaleString()} after fifty percent margin call buffer`,
        `$${(notional * 2).toLocaleString()} when trading during London overlap`,
        `$${margin.toLocaleString()} because leverage only applies to swaps`,
      ],
      answer: 0,
      explain: `Margin of $${margin} multiplied by 1:${leverage} leverage controls $${notional.toLocaleString()} of notional volume.`,
      difficulty: "expert",
      topic: "Leverage & Margin",
    });
  }
}

/* --------------------------- Infinite Non-Repeating Selector --------------------------- */

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function shuffleOptions(q: TriviaQ): TriviaQ {
  const paired = q.options.map((o, i) => ({ o, correct: i === q.answer }));
  const mixed = shuffle(paired);
  return { ...q, options: mixed.map((m) => m.o), answer: mixed.findIndex((m) => m.correct) };
}

/** Picks a batch of unique questions, guaranteeing no duplicates against seenIds. */
export function pickQuestions(
  count: number,
  difficulty?: Difficulty | "mixed",
  seenIds?: Set<string>
): TriviaQ[] {
  const pool = !difficulty || difficulty === "mixed"
    ? TRIVIA
    : TRIVIA.filter((t) => t.difficulty === difficulty);

  const available = pool.filter((q) => !seenIds || !seenIds.has(q.id || q.q));
  const out: TriviaQ[] = [];
  const bag = shuffle(available);
  let procCounter = Date.now() + Math.floor(Math.random() * 100000);

  while (out.length < count) {
    if (bag.length > 0) {
      const q = bag.pop()!;
      const qId = q.id || q.q;
      if (seenIds) seenIds.add(qId);
      out.push(shuffleOptions(q));
    } else {
      // Procedurally generate a non-repeating question if static pool is exhausted
      const targetDiff: Difficulty = (!difficulty || difficulty === "mixed") ? "medium" : difficulty;
      const procQ = generateProceduralQuestion(targetDiff, procCounter++);
      if (seenIds) seenIds.add(procQ.id || procQ.q);
      out.push(procQ);
    }
  }
  return out;
}

/** Millionaire ladder — 15 rungs with two safe havens. */
export const LADDER = [
  { level: 1, prize: 5_000, safe: false },
  { level: 2, prize: 10_000, safe: false },
  { level: 3, prize: 20_000, safe: false },
  { level: 4, prize: 40_000, safe: false },
  { level: 5, prize: 80_000, safe: true },
  { level: 6, prize: 150_000, safe: false },
  { level: 7, prize: 250_000, safe: false },
  { level: 8, prize: 400_000, safe: false },
  { level: 9, prize: 600_000, safe: false },
  { level: 10, prize: 1_000_000, safe: true },
  { level: 11, prize: 2_000_000, safe: false },
  { level: 12, prize: 3_500_000, safe: false },
  { level: 13, prize: 5_000_000, safe: false },
  { level: 14, prize: 7_500_000, safe: false },
  { level: 15, prize: 10_000_000, safe: false },
];

export function ladderDifficulty(level: number): Difficulty {
  if (level <= 4) return "easy";
  if (level <= 8) return "medium";
  if (level <= 12) return "hard";
  return "expert";
}

export const fmtNaira = (n: number) => `₦${n.toLocaleString()}`;
