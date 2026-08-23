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
  T("easy", "Basics", "What does 'forex' stand for?", ["Foreign Exchange", "Forward Extension", "Formal Exchange", "Foreign Export"], 0, "Forex is short for foreign exchange — the global market for trading currencies."),
  T("easy", "Basics", "Which currency is known as the 'greenback'?", ["Euro", "British Pound", "US Dollar", "Swiss Franc"], 2, "The US dollar earned the nickname from the green ink used on its banknotes."),
  T("easy", "Basics", "How many major currency pairs are there conventionally?", ["3", "7", "15", "28"], 1, "There are seven majors, all involving the US dollar."),
  T("easy", "Basics", "What is the nickname for GBP/USD?", ["Loonie", "Cable", "Kiwi", "Aussie"], 1, "'Cable' comes from the transatlantic telegraph cable once used to transmit the rate."),
  T("easy", "Basics", "Which of these is NOT a currency?", ["Yen", "Rand", "Peso", "Bourse"], 3, "A bourse is a stock exchange, not a currency."),
  T("easy", "Basics", "What does 'bullish' mean?", ["Expecting prices to fall", "Expecting prices to rise", "Closing all trades", "Trading sideways"], 1, "A bull market rises; the bull attacks by thrusting its horns upward."),
  T("easy", "Basics", "The forex market is open how many days a week?", ["7", "5", "6", "4"], 1, "It runs 24 hours a day, five days a week, closing over the weekend."),
  T("easy", "Sessions", "Which session opens first each trading day?", ["London", "New York", "Sydney", "Tokyo"], 2, "Sydney opens the trading week, followed by Tokyo."),
  T("easy", "Basics", "What is the currency of Nigeria?", ["Cedi", "Naira", "Shilling", "Rand"], 1, "The Nigerian Naira, symbol ₦."),
  T("easy", "Basics", "What does 'going long' mean?", ["Selling", "Buying", "Waiting", "Closing"], 1, "Going long means buying, expecting the price to rise."),
  T("easy", "Basics", "Which is the safest place for a beginner to practise?", ["Live account", "Demo account", "Friend's account", "Prop account"], 1, "A demo account lets you build process at zero financial risk."),
  T("easy", "Basics", "What is the nickname for AUD/USD?", ["Aussie", "Kiwi", "Loonie", "Swissy"], 0, "AUD/USD is the 'Aussie'; NZD/USD is the 'Kiwi'."),
  T("easy", "Basics", "What does 'going short' mean in trading?", ["Closing a trade", "Buying a currency", "Selling a currency expecting price to fall", "Holding overnight"], 2, "Going short means selling first to profit from a price decline."),
  T("easy", "Basics", "Which symbol represents the Euro?", ["$", "£", "€", "¥"], 2, "€ is the symbol for the Euro."),
  T("easy", "Basics", "What does USD stand for?", ["United States Dollar", "Universal Standard Dollar", "United Sterling Dollar", "Union State Dollar"], 0, "USD stands for United States Dollar."),
  T("easy", "Basics", "What is a 'bid' price?", ["The price you sell at", "The price you buy at", "The daily high", "The broker fee"], 0, "The bid price is the price at which the market/broker buys from you (the price you sell at)."),

  /* ---------------- MEDIUM ---------------- */
  T("medium", "Mechanics", "On most pairs, a pip is which decimal place?", ["1st", "2nd", "4th", "6th"], 2, "The fourth decimal on most pairs; the second on JPY pairs."),
  T("medium", "Mechanics", "How many units is a standard lot?", ["1,000", "10,000", "100,000", "1,000,000"], 2, "A standard lot is 100,000 units of the base currency."),
  T("medium", "Mechanics", "What is the spread?", ["Broker bonus", "Difference between bid and ask", "Your profit", "Overnight fee"], 1, "The bid-ask difference, and a cost you pay on entry."),
  T("medium", "Mechanics", "What is a swap in forex?", ["A trade copy", "Overnight interest paid or earned", "A broker switch", "A chart pattern"], 1, "Swap is the interest adjustment for holding a position overnight."),
  T("medium", "Analysis", "What does CPI measure?", ["Employment", "Inflation", "GDP growth", "Trade balance"], 1, "The Consumer Price Index measures inflation in consumer goods."),
  T("medium", "Analysis", "NFP stands for…", ["National Finance Policy", "Non-Farm Payrolls", "New Forex Pricing", "Net Foreign Position"], 1, "Non-Farm Payrolls is the key monthly US employment report."),
  T("medium", "Analysis", "Which pair is most affected by an ECB rate decision?", ["USD/JPY", "EUR/USD", "AUD/NZD", "GBP/CAD"], 1, "The ECB sets euro-area policy, directly impacting EUR pairs."),
  T("medium", "Sessions", "Which two sessions overlap for the highest liquidity?", ["Sydney & Tokyo", "London & New York", "Tokyo & New York", "Sydney & London"], 1, "The London–New York overlap is the most liquid window of the day."),
  T("medium", "Risk", "Risking 1% with a 1:3 reward means a winner returns…", ["1%", "2%", "3%", "10%"], 2, "A 1:3 reward-to-risk on 1% risk yields roughly 3%."),
  T("medium", "Analysis", "What is a safe-haven currency?", ["One that always rises", "One investors buy during uncertainty", "One with no spread", "A crypto pair"], 1, "USD, JPY and CHF typically strengthen when risk appetite falls."),
  T("medium", "Mechanics", "What is slippage?", ["A charting bug", "Difference between expected and actual fill price", "A broker fee", "A candle pattern"], 1, "Slippage occurs when your order fills at a different price than requested."),
  T("medium", "Psychology", "Revenge trading usually happens…", ["After a big win", "Immediately after a loss", "On weekends", "During backtesting"], 1, "Stress hormones after a loss push traders toward immediate corrective action."),
  T("medium", "Analysis", "A 'dovish' central bank is likely to…", ["Raise rates", "Cut or hold rates low", "Ban trading", "Buy its own currency"], 1, "Dovish means accommodative — typically bearish for that currency."),
  T("medium", "Technical", "What indicator consists of a fast line, slow line, and histogram?", ["RSI", "MACD", "Stochastic", "Bollinger Bands"], 1, "MACD (Moving Average Convergence Divergence) features fast/slow lines and a histogram."),
  T("medium", "Technical", "What candle pattern has a long lower wick and small body at the top?", ["Shooting Star", "Hammer", "Doji", "Marubozu"], 1, "A Hammer indicates rejection of lower prices at support."),

  /* ---------------- HARD ---------------- */
  T("hard", "Risk", "A 50% drawdown requires what gain to break even?", ["50%", "75%", "100%", "125%"], 2, "Drawdown is asymmetric — halving your account requires doubling it to recover."),
  T("hard", "Risk", "A 75% drawdown requires what gain to recover?", ["75%", "150%", "300%", "200%"], 2, "You need a 300% gain, which is why deep drawdowns are usually terminal."),
  T("hard", "Structure", "An uptrend is structurally defined by…", ["Green candles", "Higher highs and higher lows", "Price above MA", "Rising volume"], 1, "Structure defines trend, not candle colour or indicators."),
  T("hard", "Structure", "A liquidity grab is characterised by…", ["A slow drift", "A wick beyond a level that quickly reverses", "A gap", "High spread"], 1, "Price sweeps stops beyond an obvious level, then sharply reverses."),
  T("hard", "Structure", "What is an order block?", ["Any big candle", "Last opposing candle before a structure-breaking move", "A round number", "A broker limit"], 1, "It marks where institutional orders likely originated."),
  T("hard", "Analysis", "Markets primarily price in…", ["The actual number", "Expectations and the surprise versus them", "Broker sentiment", "Retail positioning"], 1, "You trade the deviation from consensus, not the raw figure."),
  T("hard", "Risk", "Three 1% dollar-correlated positions behave like…", ["0.33% risk", "1% risk", "Roughly 3% risk", "Risk-free"], 2, "Correlation is hidden leverage — they move together as one larger position."),
  T("hard", "Mechanics", "Premium pricing refers to…", ["Broker VIP tier", "Upper half of a dealing range", "Low spread", "Weekend trading"], 1, "You generally sell in premium and buy in discount."),
  T("hard", "History", "Which 1992 event is George Soros famous for?", ["Breaking the Bank of England", "Founding the ECB", "Creating the euro", "Launching MT4"], 0, "Soros shorted GBP during Black Wednesday, reportedly earning over $1bn."),
  T("hard", "History", "The Bretton Woods system pegged currencies to…", ["Oil", "Gold via the US dollar", "Silver", "The pound"], 1, "It fixed currencies to the dollar, which was convertible to gold until 1971."),
  T("hard", "Mechanics", "A fair value gap represents…", ["A pricing error", "An inefficient one-sided move price may revisit", "A dividend", "A rollover"], 1, "It shows an imbalance where one side overwhelmed the other."),
  T("hard", "Psychology", "How many trades before performance data is meaningful?", ["10", "25", "At least 50", "5"], 2, "You need a meaningful sample before drawing conclusions about an edge."),

  /* ---------------- EXPERT ---------------- */
  T("expert", "Mechanics", "Approximate daily forex turnover as of recent BIS surveys?", ["$750 billion", "$2 trillion", "$7.5 trillion", "$50 trillion"], 2, "The BIS Triennial Survey put daily turnover around $7.5 trillion."),
  T("expert", "Analysis", "Interest rate parity theory links…", ["Oil and gold", "Spot and forward rates via interest differentials", "GDP and CPI", "Stocks and bonds"], 1, "It states forward rates reflect the interest rate differential between two currencies."),
  T("expert", "Analysis", "The 'carry trade' involves…", ["Buying and holding gold", "Borrowing low-yield currency to buy high-yield currency", "Scalping the open", "Hedging with options"], 1, "Traders profit from the interest differential, though it carries sharp reversal risk."),
  T("expert", "Mechanics", "What is a 'fixing' in forex?", ["A broker repair", "A benchmark rate set at a specific time", "A stop hunt", "A margin call"], 1, "Benchmarks like the WM/Reuters 4pm London fix set reference rates."),
  T("expert", "History", "Which currency did Switzerland unpeg from the euro in 2015?", ["EUR", "CHF", "USD", "GBP"], 1, "The SNB abandoned the 1.20 EUR/CHF floor, causing a violent CHF surge."),
  T("expert", "Analysis", "Purchasing Power Parity suggests exchange rates should equalise…", ["Interest rates", "The price of identical goods across countries", "Stock indices", "Bond yields"], 1, "The Big Mac Index is a popular informal illustration of PPP."),
  T("expert", "Mechanics", "In a 1:500 leverage account, $1,000 controls up to…", ["$5,000", "$50,000", "$500,000", "$5,000,000"], 2, "1:500 leverage on $1,000 margin controls $500,000 notional."),
  T("expert", "Analysis", "A yield curve inversion typically signals…", ["Economic expansion", "Potential recession ahead", "Currency pegging", "Rising inflation only"], 1, "Inverted curves have historically preceded recessions."),
];

/* --------------------------- Procedural Question Generator --------------------------- */

function generateProceduralQuestion(difficulty: Difficulty, attemptSeed: number): TriviaQ {
  const pairs = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "EUR/JPY"];
  const selectedPair = pairs[attemptSeed % pairs.length];
  
  if (difficulty === "easy") {
    const pips = (15 + (attemptSeed % 7) * 10);
    const dollarVal = pips * 10;
    return shuffleOptions({
      id: `proc_easy_${attemptSeed}`,
      q: `If you gain ${pips} pips on 1 standard lot of ${selectedPair}, how much profit in USD is generated?`,
      options: [`$${dollarVal}`, `$${dollarVal / 2}`, `$${dollarVal * 2}`, `$${dollarVal + 50}`],
      answer: 0,
      explain: `At $10 per pip on a 1.0 standard lot, ${pips} pips equals $${dollarVal}.`,
      difficulty: "easy",
      topic: "Risk & Math",
    });
  } else if (difficulty === "medium") {
    const accSize = 10000 + (attemptSeed % 5) * 10000;
    const riskPct = 1 + (attemptSeed % 2);
    const riskDollar = (accSize * riskPct) / 100;
    const slPips = 20 + (attemptSeed % 4) * 10;
    const expectedLot = (riskDollar / (slPips * 10)).toFixed(2);

    return shuffleOptions({
      id: `proc_med_${attemptSeed}`,
      q: `On a $${accSize.toLocaleString()} account, risking ${riskPct}% with a ${slPips}-pip stop loss on ${selectedPair}, what is your lot size?`,
      options: [`${expectedLot} Lots`, `${(Number(expectedLot) * 2).toFixed(2)} Lots`, `${(Number(expectedLot) / 2).toFixed(2)} Lots`, `1.00 Lot`],
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
      q: `If you risk ${risk}% per trade with a 1:${rr} Risk-to-Reward ratio, what portfolio percentage is gained on a win?`,
      options: [`+${gainPct}%`, `+${gainPct / 2}%`, `+${gainPct + 2}%`, `+1.0%`],
      answer: 0,
      explain: `Risking ${risk}% at a 1:${rr} R:R yields +${gainPct}% return per winning trade.`,
      difficulty: "hard",
      topic: "R:R Math",
    });
  } else {
    const leverage = 100 * (1 + (attemptSeed % 5));
    const margin = 500 * (1 + (attemptSeed % 3));
    const notional = margin * leverage;
    return shuffleOptions({
      id: `proc_exp_${attemptSeed}`,
      q: `With 1:${leverage} leverage, a $${margin.toLocaleString()} margin deposit controls what total notional value?`,
      options: [`$${notional.toLocaleString()}`, `$${(notional / 2).toLocaleString()}`, `$${(notional * 2).toLocaleString()}`, `$${margin.toLocaleString()}`],
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
  let bag = shuffle(available);
  let procCounter = Date.now();

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
