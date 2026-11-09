export type Question = {
  id: string;
  q: string;
  options: string[];
  /** index of correct option in `options` */
  answer: number;
  explain: string;
};

export type Quiz = {
  courseId: string;
  title: string;
  passMark: number; // percent, e.g. 70
  timeLimitMins: number; // 60 minutes for 50 questions
  questions: Question[];
};

export const DEFAULT_EXAM_QUESTION_COUNT = 50;

/**
 * Fisher-Yates array shuffle.
 */
function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Shuffles the 4 options of a Question and updates `answer` to match the new index.
 */
export function shuffleQuestionOptions(question: Question): Question {
  const tagged = question.options.map((text, idx) => ({
    text,
    isCorrect: idx === question.answer,
  }));
  const mixed = shuffleArray(tagged);
  return {
    ...question,
    options: mixed.map((m) => m.text),
    answer: mixed.findIndex((m) => m.isCorrect),
  };
}

/**
 * Course-specific curated question banks.
 * Anti-guessing design: Correct answers are concise and direct;
 * distractors are equally detailed or longer so sentence length cannot be used to guess.
 */
export const QUIZZES: Quiz[] = [
  {
    courseId: "fundamental-supply-demand",
    title: "Fundamental, Supply & Demand Assessment",
    passMark: 70,
    timeLimitMins: 60,
    questions: [
      {
        id: "fsd-1",
        q: "What causes the price of a currency pair to rise?",
        options: [
          "Buy orders exceeding available sell orders",
          "Central banks freezing overnight interbank lending rates during London hours",
          "Retail brokers widening the bid-ask spread ahead of the New York close",
          "An equal volume of institutional buy and sell orders matching at equilibrium",
        ],
        answer: 0,
        explain: "Price rises whenever aggressive buying demand absorbs all available selling supply at the current level.",
      },
      {
        id: "fsd-2",
        q: "On a chart, what is a Demand Zone?",
        options: [
          "A slow sideways consolidation range that forms during the late Asian session",
          "A price area where strong buying previously launched a sharp upward rally",
          "A resistance ceiling where institutional sellers repeatedly capped price advances",
          "An indicator band calculated from the 200-period exponential moving average",
        ],
        answer: 1,
        explain: "Demand zones mark price origins where institutional buyers overwhelmed sellers, leaving resting buy orders behind.",
      },
      {
        id: "fsd-3",
        q: "How does a surprise interest rate hike usually affect a currency?",
        options: [
          "It weakens the currency by discouraging foreign bond inflows",
          "It freezes spot trading until the next quarterly GDP release",
          "It strengthens the currency as global capital seeks higher yields",
          "It forces commercial banks to widen retail spreads for thirty days",
        ],
        answer: 2,
        explain: "Higher interest rates attract international capital inflows seeking superior yield, boosting demand for the currency.",
      },
      {
        id: "fsd-4",
        q: "Why do traders watch 'High Impact' (Red Folder) news events?",
        options: [
          "They pause all interbank algorithmic execution for two hours",
          "They guarantee that existing technical support levels will hold",
          "They permanently fix the daily trading range before New York opens",
          "They trigger rapid repricing and sharp volatility spikes",
        ],
        answer: 3,
        explain: "Tier-1 macro releases cause sudden institutional order-flow imbalances and rapid repricing.",
      },
      {
        id: "fsd-5",
        q: "What makes a Supply or Demand zone 'Fresh'?",
        options: [
          "Price has not returned to test it since it was created",
          "It formed within the last fifteen minutes on a one-minute chart",
          "It has already been tested at least three times by retail traders",
          "It overlaps with both the 50-day and 100-day simple moving averages",
        ],
        answer: 0,
        explain: "A zone is fresh (unmitigated) when price has never retraced into it since the original impulse move.",
      },
      {
        id: "fsd-6",
        q: "Which release is the primary monthly gauge of US job creation?",
        options: [
          "The Consumer Price Index (CPI)",
          "Non-Farm Payrolls (NFP)",
          "The Purchasing Managers' Index (PMI)",
          "The Producer Price Index (PPI)",
        ],
        answer: 1,
        explain: "Non-Farm Payrolls (NFP), released on the first Friday of each month, tracks US employment growth.",
      },
      {
        id: "fsd-7",
        q: "In Supply and Demand trading, what is a 'Rally-Base-Drop' (RBD)?",
        options: [
          "A bullish continuation structure formed during low-volume holidays",
          "A reversal pattern that creates a Supply Zone at the base",
          "A momentum indicator crossover confirming oversold conditions",
          "A central bank intervention model used to peg emerging currencies",
        ],
        answer: 1,
        explain: "Price rallies, pauses briefly in a tight base, and drops sharply—leaving an institutional Supply Zone.",
      },
      {
        id: "fsd-8",
        q: "When fundamentals are bullish for USD, where should you look to buy USD?",
        options: [
          "At a fresh Demand Zone",
          "Directly inside a major higher-timeframe Supply Zone",
          "In the exact middle of a choppy Asian session range",
          "Immediately after five consecutive parabolic green daily candles",
        ],
        answer: 0,
        explain: "Combining bullish macro bias with a discounted Demand Zone gives the highest-probability entry and tightest risk.",
      },
      {
        id: "fsd-9",
        q: "Why must a strong impulse candle leave a zone for that zone to be valid?",
        options: [
          "It proves a major order-flow imbalance occurred there",
          "It ensures retail trailing stops remain untouched for a full week",
          "It resets the broker's overnight swap calculation before rollover",
          "It confirms that both buyers and sellers were in complete agreement",
        ],
        answer: 0,
        explain: "Explosive departure candles confirm that institutional orders heavily outweighed opposing orders at the base.",
      },
      {
        id: "fsd-10",
        q: "What happens when a Supply Zone is tested multiple times?",
        options: [
          "It becomes impenetrable and can never be broken by buyers",
          "Resting sell orders get absorbed, making a breakout more likely",
          "The central bank automatically steps in to defend the price ceiling",
          "It transforms into a guaranteed risk-free entry for short sellers",
        ],
        answer: 1,
        explain: "Each touch consumes resting sell orders in the zone, weakening resistance over repeated tests.",
      },
    ],
  },
  {
    courseId: "forex-foundations",
    title: "Forex Foundations — Final Assessment",
    passMark: 70,
    timeLimitMins: 60,
    questions: [
      {
        id: "ff-1",
        q: "In the quote EUR/USD = 1.0850, which currency is the base currency?",
        options: [
          "EUR",
          "USD, because it sits on the right side of the pair",
          "Whichever currency currently carries the higher central bank rate",
          "Both currencies share base status during the London–New York overlap",
        ],
        answer: 0,
        explain: "The first currency listed in a pair (EUR) is always the base currency; the second (USD) is the quote currency.",
      },
      {
        id: "ff-2",
        q: "On most non-JPY pairs, which decimal place represents one standard pip?",
        options: [
          "The first decimal place immediately after the decimal point",
          "The second decimal place used exclusively on Japanese Yen crosses",
          "The fourth decimal place (0.0001)",
          "The fifth decimal place, which measures fractional pipette ticks",
        ],
        answer: 2,
        explain: "For non-JPY pairs, 1 pip equals 0.0001 (the fourth decimal place). The fifth decimal is a pipette.",
      },
      {
        id: "ff-3",
        q: "How many units of the base currency make up 1 standard lot?",
        options: [
          "1,000 units (matching a standard micro lot contract)",
          "10,000 units (matching a standard mini lot contract)",
          "100,000 units",
          "1,000,000 units reserved only for interbank prime brokers",
        ],
        answer: 2,
        explain: "1 standard lot = 100,000 units of the base currency (~$10 per pip on USD-quoted pairs).",
      },
      {
        id: "ff-4",
        q: "Which session overlap typically delivers the deepest liquidity and tightest spreads?",
        options: [
          "Sydney and Tokyo during the quiet Pacific afternoon transition",
          "Tokyo and London during the single hour before Frankfurt opens",
          "London and New York",
          "Sydney and New York right after the Friday weekly market close",
        ],
        answer: 2,
        explain: "The London–New York overlap (roughly 13:00–17:00 WAT) combines the two largest financial centres.",
      },
      {
        id: "ff-5",
        q: "What is the 'spread' in forex trading?",
        options: [
          "The overnight financing interest charged at the daily rollover",
          "The difference between the broker's Bid and Ask prices",
          "The total distance in pips between your entry and take-profit",
          "The maximum leverage ratio offered on a retail margin account",
        ],
        answer: 1,
        explain: "Spread is the Ask minus the Bid price—the built-in transaction cost paid upon opening a trade.",
      },
      {
        id: "ff-6",
        q: "If you risk 1% ($100) on a $10,000 account with a 25-pip stop on EUR/USD, what is your lot size?",
        options: [
          "0.40 lots",
          "0.04 lots, risking only ten dollars across the entire trade",
          "1.00 standard lot, which risks ten dollars per single pip move",
          "2.50 standard lots, which risks twenty-five dollars per pip move",
        ],
        answer: 0,
        explain: "Lot size = $100 / (25 pips × $10/pip) = 0.40 lots.",
      },
      {
        id: "ff-7",
        q: "Which order type fills a buy entry BELOW the current market price?",
        options: [
          "A Buy Stop order placed above a resistance breakout level",
          "A Buy Limit order",
          "A Sell Limit order placed inside an overhead supply zone",
          "A Market Execution order triggered immediately at the current Ask",
        ],
        answer: 1,
        explain: "A Buy Limit sits below current price to fill you on a pullback into support/demand.",
      },
      {
        id: "ff-8",
        q: "What is the real effect of high leverage (such as 1:500) on your account?",
        options: [
          "It automatically increases your strategy's win rate during trends",
          "It lowers your required margin, which magnifies risk if you oversize",
          "It guarantees your stop loss will never experience news slippage",
          "It reduces the pip value of a standard lot by fifty percent",
        ],
        answer: 1,
        explain: "Leverage reduces margin requirements; without strict position sizing, it lets traders take destructive risk.",
      },
      {
        id: "ff-9",
        q: "What should a beginner ALWAYS define before clicking Buy or Sell?",
        options: [
          "How they plan to spend the profit at the end of the week",
          "Their exact invalidation (stop loss) and calculated lot size",
          "At least four correlated pairs to enter at the exact same moment",
          "A social media post announcing the trade to their followers",
        ],
        answer: 1,
        explain: "Professional execution requires a clear invalidation level (stop loss) and calculated risk before entry.",
      },
      {
        id: "ff-10",
        q: "When should a beginner transition from a demo account to live funds?",
        options: [
          "Right after hitting one lucky winning trade on non-farm payrolls day",
          "After following a written plan profitably across 30–50 logged trades",
          "On day one, because demo charts use completely different candle data",
          "Only after memorizing every harmonic indicator ever published",
        ],
        answer: 1,
        explain: "A 30–50 trade sample with consistent rule adherence proves process discipline before risking capital.",
      },
    ],
  },
  {
    courseId: "price-action-mastery",
    title: "Price Action Mastery — Final Assessment",
    passMark: 75,
    timeLimitMins: 60,
    questions: [
      {
        id: "pa-1",
        q: "What sequence of swing points defines a healthy bullish trend?",
        options: [
          "Lower highs and lower lows across three consecutive sessions",
          "Higher highs and higher lows",
          "Equal highs and equal lows locked inside a ten-pip channel",
          "Three consecutive green candles on the one-minute timeframe",
        ],
        answer: 1,
        explain: "Bullish market structure is defined by price printing Higher Highs (HH) and Higher Lows (HL).",
      },
      {
        id: "pa-2",
        q: "In smart-money price action, what is a 'Change of Character' (CHoCH)?",
        options: [
          "A routine continuation break in the direction of the dominant trend",
          "The first break of an internal swing low/high signalling a potential shift",
          "A broker widening spreads during the daily rollover maintenance window",
          "A moving average crossover occurring on a monthly chart",
        ],
        answer: 1,
        explain: "While BOS confirms trend continuation, CHoCH is the first structural break against the prior trend.",
      },
      {
        id: "pa-3",
        q: "Where do large clusters of retail stop-loss orders typically rest?",
        options: [
          "At random Fibonacci decimals that change every five minutes",
          "Just beyond obvious swing highs, swing lows, and equal highs/lows",
          "At the exact midpoint of a single five-minute candle body",
          "Only at prices ending in odd prime numbers during Tokyo hours",
        ],
        answer: 1,
        explain: "Retail traders place stops just above swing highs or below swing lows, creating liquidity pools.",
      },
      {
        id: "pa-4",
        q: "What is an Order Block (OB)?",
        options: [
          "Any oversized candle that forms during a low-liquidity bank holiday",
          "The last opposing candle before an impulsive move that breaks structure",
          "A psychological round number ending in 00 or 50 on any pair",
          "A limit on how many open positions a retail account can hold",
        ],
        answer: 1,
        explain: "An Order Block is the final opposing candle prior to a strong displacement that breaks market structure.",
      },
      {
        id: "pa-5",
        q: "How many candles form a classic Fair Value Gap (FVG) / imbalance?",
        options: [
          "A three-candle sequence where candles 1 and 3 leave an unmitigated gap",
          "A single doji candle with equal upper and lower wicks at midnight",
          "Ten consecutive overlapping candles inside a tight Asian range",
          "Two identical engulfing candles separated by a weekend market gap",
        ],
        answer: 0,
        explain: "An FVG is a 3-candle pattern where the wicks of candle 1 and candle 3 do not overlap across candle 2's body.",
      },
      {
        id: "pa-6",
        q: "When looking for a long trade in an uptrend, where is the optimal entry zone?",
        options: [
          "Above the 0.50 equilibrium level (in deep premium pricing)",
          "Below the 0.50 equilibrium level (in discount)",
          "Right at the extreme top of the breakout candle wick",
          "Only after the Relative Strength Index rises above 85",
        ],
        answer: 1,
        explain: "Buying in discount (below the 50% midpoint of the dealing range) improves R:R and keeps invalidation tight.",
      },
      {
        id: "pa-7",
        q: "How should higher timeframes (HTF) and lower timeframes (LTF) work together?",
        options: [
          "LTF dictates directional bias while HTF is used only for scalping",
          "HTF sets the directional bias and key POI; LTF refines the entry trigger",
          "Every timeframe from 1M to 1W must show the exact same candle colour",
          "You should ignore HTF completely whenever trading the 5-minute chart",
        ],
        answer: 1,
        explain: "Higher timeframes (D1/H4) establish narrative and POIs; lower timeframes (M15/M5) confirm entry execution.",
      },
      {
        id: "pa-8",
        q: "What characterizes a classic 'Judas Swing' at the London or New York open?",
        options: [
          "A flat, zero-volume drift that lasts until the session closes",
          "A false spike that sweeps Asian liquidity before reversing into the real trend",
          "A central bank emergency rate cut announced without prior scheduling",
          "A guaranteed 200-pip straight-line continuation with zero pullbacks",
        ],
        answer: 1,
        explain: "A Judas Swing is an early session false move that raids resting stops before the true session expansion.",
      },
      {
        id: "pa-9",
        q: "Why wait for a lower-timeframe CHoCH inside a higher-timeframe Order Block?",
        options: [
          "To pay higher commissions to the broker by delaying execution",
          "To confirm institutional defence rather than catching a falling knife",
          "Because limit orders are banned by liquidity providers during London hours",
          "To ensure your stop loss is at least 150 pips wide on every trade",
        ],
        answer: 1,
        explain: "LTF confirmation proves the HTF zone is actively holding before you commit capital.",
      },
      {
        id: "pa-10",
        q: "If price sweeps a major high and immediately closes back below it with displacement, what is that?",
        options: [
          "A confirmed bullish breakout that should be bought at market",
          "A liquidity raid (turtle soup) signalling potential bearish reversal",
          "A broker data feed error that has no relevance to market structure",
          "A signal to remove your stop loss on all open long positions",
        ],
        answer: 1,
        explain: "Sweeping an old high and aggressively rejecting back inside the range is a classic liquidity grab.",
      },
    ],
  },
  {
    courseId: "risk-trade-management",
    title: "Risk & Trade Management — Final Assessment",
    passMark: 75,
    timeLimitMins: 60,
    questions: [
      {
        id: "rm-1",
        q: "If your account drops by 50%, what percentage gain is required on the remaining balance to break even?",
        options: [
          "50%, matching the exact percentage that was lost",
          "75%, assuming you double your lot size on the next trade",
          "100%",
          "25%, because compounding accelerates after a drawdown",
        ],
        answer: 2,
        explain: "Losing 50% turns $10,000 into $5,000. Getting back to $10,000 from $5,000 requires a +100% gain.",
      },
      {
        id: "rm-2",
        q: "With a 40% win rate and an average 1:2.5 Risk-to-Reward (2.5R winner, -1R loser), what is your expectancy per trade?",
        options: [
          "-0.20R (a losing strategy over a large sample size)",
          "+0.40R",
          "+1.50R (assuming zero losing streaks occur in live trading)",
          "0.00R (exact breakeven before accounting for commissions)",
        ],
        answer: 1,
        explain: "Expectancy = (0.40 × 2.5R) - (0.60 × 1R) = 1.00R - 0.60R = +0.40R per trade.",
      },
      {
        id: "rm-3",
        q: "You go long EUR/USD, long GBP/USD, and short USD/CHF at 1% risk each. What is your true exposure?",
        options: [
          "1% total risk because the three currency symbols are different",
          "Roughly 3% concentrated short-USD risk",
          "0% risk because the three positions completely hedge one another",
          "0.33% risk per pair since correlation divides total portfolio variance",
        ],
        answer: 1,
        explain: "All three positions are bets against the US Dollar—if USD spikes, all three stops can hit together (~3% loss).",
      },
      {
        id: "rm-4",
        q: "What is the safest protocol when your trade reaches +1R in profit?",
        options: [
          "Immediately double the position size and widen the original stop loss",
          "Close all charts and remove both your stop loss and take profit",
          "Move stop to breakeven only after price forms a new structural swing",
          "Market-close 95% of the trade two pips above your entry price",
        ],
        answer: 2,
        explain: "Trailing stops behind confirmed market structure protects capital without choking the trade on normal pullbacks.",
      },
      {
        id: "rm-5",
        q: "How should a disciplined trader respond after hitting two consecutive full-stop losses (-2R) in one day?",
        options: [
          "Risk 4% on the third trade to win back the daily loss before close",
          "Switch to the 1-minute chart and scalp every candle until green",
          "Stop trading for the day (daily loss cap) and review the journal tomorrow",
          "Deposit additional margin immediately so you can open larger lots",
        ],
        answer: 2,
        explain: "A hard daily loss limit (e.g., 2R) prevents emotional tilt from turning a normal red day into an account blowout.",
      },
      {
        id: "rm-6",
        q: "Why is 'scaling in' to a losing trade (averaging down without planned split risk) so dangerous?",
        options: [
          "It compounds exposure against an active trend with no invalidation",
          "It slightly reduces the broker commission charged per micro lot",
          "It forces your take-profit target to trigger too early in trends",
          "It is only permitted on demo accounts by institutional liquidity providers",
        ],
        answer: 0,
        explain: "Adding to a loser increases total risk while price is actively proving your directional thesis wrong.",
      },
      {
        id: "rm-7",
        q: "When is it acceptable to widen your stop loss after a trade is already live?",
        options: [
          "Whenever price gets within three pips of hitting your stop loss",
          "Never — if price hits your stop, your trade thesis is invalidated",
          "Whenever a friend in a Telegram chat group says price will reverse",
          "During every high-impact CPI release so you can survive the spike",
        ],
        answer: 1,
        explain: "Widening a stop mid-trade violates your pre-calculated risk and turns small planned losses into catastrophic ones.",
      },
      {
        id: "rm-8",
        q: "What is the minimum sample size of trades needed before judging whether a setup has an edge?",
        options: [
          "2 to 3 trades taken during a single afternoon session",
          "30 to 50 logged trades executed strictly by the same rules",
          "1 single trade, provided it achieved at least a 1:5 R:R ratio",
          "5 trades taken without a stop loss on a demo account",
        ],
        answer: 1,
        explain: "Law of large numbers: even a 60% win-rate system can lose 4–5 times in a row; 30–50 trades reveal true expectancy.",
      },
    ],
  },
  {
    courseId: "pro-trader-mentorship",
    title: "Pro Trader Mentorship — Final Assessment",
    passMark: 80,
    timeLimitMins: 60,
    questions: [
      {
        id: "ptm-1",
        q: "What causes the strongest, most sustained multi-week trends in forex?",
        options: [
          "Retail sentiment indicators crossing the 50% midline on a Tuesday",
          "Divergence between two central banks' monetary policies (hawkish vs dovish)",
          "A single five-minute hammer candle forming during the Sydney open",
          "Weekend cryptocurrency volatility spilling over into Monday morning",
        ],
        answer: 1,
        explain: "When a hawkish central bank (raising/holding high rates) is paired against a dovish bank (cutting rates), institutional capital flows drive sustained trends.",
      },
      {
        id: "ptm-2",
        q: "US CPI prints at 3.1% vs 3.5% consensus (cooler than expected). What is the typical initial USD reaction?",
        options: [
          "USD strengthens sharply as traders price in emergency rate hikes",
          "USD weakens as markets price in earlier or deeper Fed rate cuts",
          "USD/JPY freezes completely until the Bank of Japan meets next month",
          "Gold (XAU/USD) crashes because lower inflation boosts real bond yields",
        ],
        answer: 1,
        explain: "Cooler inflation reduces pressure on the Fed to keep rates high, lowering Treasury yields and weakening USD.",
      },
      {
        id: "ptm-3",
        q: "In the ICT/SMC daily cycle (AMD), what do the three phases stand for?",
        options: [
          "Average, Momentum, and Divergence across the weekly candle",
          "Accumulation, Manipulation, and Distribution",
          "Analysis, Margin, and Drawdown during the London session",
          "Ask, Midpoint, and Delivery on the interbank order book",
        ],
        answer: 1,
        explain: "Asian range often Accumulates orders, London open Manipulates (sweeps liquidity), and London/NY Distributes (expands).",
      },
      {
        id: "ptm-4",
        q: "Why is holding a trade through a Tier-1 release (like NFP or FOMC) with a tight 10-pip stop poor practice?",
        options: [
          "Brokers legally cancel all winning trades opened before Tier-1 news",
          "Spread widening and slippage can fill your stop far worse than 10 pips",
          "Central banks prohibit retail accounts from closing trades for an hour",
          "Charting platforms hide all candlesticks during the first fifteen minutes",
        ],
        answer: 1,
        explain: "During Tier-1 releases, liquidity thins out—spreads widen and stop orders can slip by 20–50+ pips, multiplying your planned 1% risk.",
      },
      {
        id: "ptm-5",
        q: "In a risk-off global environment (falling stocks, geopolitical stress), which currencies typically attract safe-haven flows?",
        options: [
          "AUD, NZD, and ZAR due to their high commodity export sensitivity",
          "USD, JPY, and CHF",
          "TRY and MXN because emerging markets outperform during panics",
          "Only minor exotic pairs with wide spreads and low daily volume",
        ],
        answer: 1,
        explain: "USD, JPY, and CHF historically serve as global safe-haven currencies when risk appetite contracts.",
      },
      {
        id: "ptm-6",
        q: "What is the purpose of a weekly top-down narrative prepared on Sunday?",
        options: [
          "To lock you into buying one direction all week regardless of structure breaks",
          "To map HTF bias, key liquidity targets, and red-folder catalysts before the week starts",
          "To predict the exact closing price of EUR/USD to the fifth decimal place",
          "To replace the need for using stop losses during Tuesday and Wednesday sessions",
        ],
        answer: 1,
        explain: "A Sunday playbook defines HTF scenarios, invalidation levels, and macro landmines so execution during the week is calm and objective.",
      },
      {
        id: "ptm-7",
        q: "When tracking trading performance in your journal, why is measuring in 'R-multiples' better than raw dollar amounts?",
        options: [
          "It normalizes performance across changing account sizes so edge is clear",
          "It hides losing trades from your monthly win-rate calculation",
          "It allows you to risk random dollar amounts on every single setup",
          "It automatically converts losing trades into breakeven scratches",
        ],
        answer: 0,
        explain: "R-multiples measure return relative to initial risk (e.g., +2.5R, -1R), keeping statistics consistent as equity grows.",
      },
      {
        id: "ptm-8",
        q: "What defines an 'A+ Setup' in a professional trading playbook?",
        options: [
          "Any trade that ends up making money, even if it broke every rule",
          "Full alignment of HTF narrative, liquidity sweep, POI, LTF trigger, and clean R:R",
          "A trade copied blindly from social media two seconds before news drops",
          "An impulse entry taken with 5% risk after missing the original move",
        ],
        answer: 1,
        explain: "An A+ setup is defined strictly by pre-trade confluence checklist criteria, never by retrospective outcome.",
      },
    ],
  },
  {
    courseId: "funded-trader-prep",
    title: "Funded Trader Prep — Final Assessment",
    passMark: 80,
    timeLimitMins: 60,
    questions: [
      {
        id: "ftp-1",
        q: "On a $100,000 prop firm account with a 5% daily drawdown and 10% max drawdown, what is your true operating capital?",
        options: [
          "The full $100,000 headline balance advertised by the prop firm",
          "$10,000 (your maximum allowable drawdown buffer)",
          "$50,000, because prop firms split profits 50/50 on the first payout",
          "$110,000, including the 10% phase-one profit target",
        ],
        answer: 1,
        explain: "If losing $10,000 terminates the account, your real risk capital is $10,000—sizing must be anchored to that buffer.",
      },
      {
        id: "ftp-2",
        q: "What is the critical trap of an 'equity-based' (floating) daily drawdown rule?",
        options: [
          "Only closed losses count toward the daily breach limit",
          "Unrealized floating profit raises your daily high-water mark intraday",
          "It resets every thirty minutes during the New York trading session",
          "It allows unlimited drawdown as long as you close before rollover",
        ],
        answer: 1,
        explain: "On trailing/floating daily drawdown accounts, if a trade goes up +$3,000 and pulls back to breakeven, that -$3,000 pullback counts against your daily limit!",
      },
      {
        id: "ftp-3",
        q: "During a prop firm challenge with a 5% daily loss limit, what per-trade risk keeps survival probability high?",
        options: [
          "2.5% to 4.0% per trade so you can pass in two trades",
          "0.25% to 0.50% per trade",
          "5.0% all-in on a single high-impact news candle",
          "10.0% split across four correlated USD pairs simultaneously",
        ],
        answer: 1,
        explain: "Risking 0.25%–0.50% means it takes 10–20 consecutive losses to breach max drawdown, insulating you from normal variance.",
      },
      {
        id: "ftp-4",
        q: "You are at +7.6% on an 8% challenge target with no time limit. What is the smartest play?",
        options: [
          "Double your lot size on a random setup to finish the challenge today",
          "Cut risk in half (e.g. 0.25%) and wait patiently for your normal A+ setup",
          "Open five scalps during the Asian rollover to grab the last 0.4%",
          "Remove your stop loss so a pullback cannot stop you out before +8%",
        ],
        answer: 1,
        explain: "Most challenge failures happen at 7%+ when traders get impatient and oversize to force the final 0.4%.",
      },
      {
        id: "ftp-5",
        q: "What should your risk per trade be right after passing verification and receiving your live funded account?",
        options: [
          "Triple your challenge risk to hit a massive first payout immediately",
          "Keep the exact same conservative risk (or lower) until a profit buffer is built",
          "Risk the entire 4% daily limit on your very first funded trade",
          "Switch to a brand-new strategy you have never backtested before",
        ],
        answer: 1,
        explain: "On a newly funded account, building a 2%–3% profit cushion at 0.25%–0.50% risk protects the account for long-term payouts.",
      },
      {
        id: "ftp-6",
        q: "Which hidden prop firm rule frequently voids payouts even when the trader is in profit?",
        options: [
          "Using a stop loss on every single trade from entry to exit",
          "Violating restricted news-trading windows or lot-size consistency rules",
          "Closing trades in profit before the Friday market close",
          "Trading only during the high-liquidity London and New York sessions",
        ],
        answer: 1,
        explain: "Many prop firms enforce news blackout windows (e.g., ±2–5 mins around Tier-1 news) or maximum single-trade profit consistency caps.",
      },
      {
        id: "ftp-7",
        q: "If your prop account falls into a -4% drawdown, how should you manage recovery?",
        options: [
          "Increase risk to 2% per trade to recover the 4% in one afternoon",
          "Reduce risk to 0.25%–0.35% per trade and rebuild step-by-step",
          "Hold losing trades over the weekend without a stop loss",
          "Trade unfamiliar exotic pairs during low-liquidity hours",
        ],
        answer: 1,
        explain: "Scaling down risk during a drawdown extends your runway and prevents emotional spiral near the breach line.",
      },
      {
        id: "ftp-8",
        q: "Why is holding multiple funded accounts with staggered risk better than going all-in on one challenge?",
        options: [
          "It lets you copy the exact same oversized 4% trade across all accounts",
          "It diversifies payout streams and removes emotional pressure from any single trade",
          "It bypasses the need to follow a trading plan or journal your trades",
          "It guarantees you never experience a losing trade again",
        ],
        answer: 1,
        explain: "Treating funded capital as a diversified portfolio with low risk per trade creates steady, low-stress payouts.",
      },
    ],
  },
];

/* ============================================================================
 * COMPREHENSIVE CROSS-DISCIPLINARY QUESTION BANK (35 Questions)
 * Used to expand any assessment to 50 comprehensive certification questions.
 * All options strictly adhere to the anti-guessing rule (concise correct answer,
 * detailed distractors).
 * ========================================================================== */

export const SHARED_TRADING_QUESTIONS: Question[] = [
  {
    id: "sq-1",
    q: "What does 'slippage' refer to during high-impact market events?",
    options: [
      "Getting filled at a price different from your order price",
      "A software bug where trading terminal charts disconnect from the server",
      "A penalty fee charged by liquidity providers for closing trades under one minute",
      "The automatic reduction of account leverage applied during weekend rollover",
    ],
    answer: 0,
    explain: "Slippage occurs when market volatility causes an execution fill price to deviate from the requested price.",
  },
  {
    id: "sq-2",
    q: "What does an inverted Treasury yield curve historically anticipate?",
    options: [
      "An upcoming economic recession",
      "An immediate ten-year boom in equity markets worldwide",
      "A permanent fixed peg between the US Dollar and Euro",
      "A complete cessation of interbank foreign currency trading",
    ],
    answer: 0,
    explain: "An inverted yield curve (where short-term yields exceed long-term yields) has historically signalled recession risk.",
  },
  {
    id: "sq-3",
    q: "What is an institutional Breaker Block?",
    options: [
      "A failed order block that was broken through and now acts as inverse support/resistance",
      "An overnight limit on how many positions a retail trader can hold open simultaneously",
      "A candlestick pattern consisting exclusively of four consecutive doji bars",
      "A trading indicator combining the 50-day EMA with twenty-period Bollinger Bands",
    ],
    answer: 0,
    explain: "A Breaker Block is an order block that was invalidated by a liquidity sweep and subsequently acts as inverted support/resistance.",
  },
  {
    id: "sq-4",
    q: "Why do professional traders avoid risking more than 1% to 2% on any single trade?",
    options: [
      "To survive inevitable losing streaks without emotional tilt",
      "Because brokerage terms of service strictly prohibit risking more than two percent",
      "Because prop firms close profitable accounts that take fewer than twenty trades",
      "To keep their trading account locked inside the lowest retail tax bracket",
    ],
    answer: 0,
    explain: "Conservative sizing ensures that even a string of 5–8 consecutive losses consumes under 10%–15% of equity.",
  },
  {
    id: "sq-5",
    q: "What is the primary driver of currency valuations over multi-month horizons?",
    options: [
      "Relative interest rate differentials between central banks",
      "Retail sentiment surveys conducted on social media platforms",
      "The volume of trading activity generated by cryptocurrency exchanges",
      "The number of technical indicators pointing in the same direction on the hourly chart",
    ],
    answer: 0,
    explain: "Capital flows toward currencies offering higher real yields and sounder monetary policy divergence.",
  },
  {
    id: "sq-6",
    q: "What does the 'Ask' price represent in a currency quote?",
    options: [
      "The price at which you buy from the market",
      "The price at which you sell your position back to the broker",
      "The average high price of the current daily candlestick session",
      "The overnight financing rate debited from your trading account",
    ],
    answer: 0,
    explain: "The Ask is the price sellers offer and buyers pay to enter long positions.",
  },
  {
    id: "sq-7",
    q: "What defines an institutional 'Discount' zone in a bullish dealing range?",
    options: [
      "Price trading below the 50% equilibrium of the range",
      "A temporary reduction in broker commissions during the Asian session",
      "Any price area where candlestick wicks exceed fifty pips in length",
      "Price trading above the previous monthly high on heavy volume",
    ],
    answer: 0,
    explain: "Buying below 50% equilibrium allows traders to purchase in discount relative to the current dealing range.",
  },
  {
    id: "sq-8",
    q: "Why is 'revenge trading' so damaging to long-term trader survival?",
    options: [
      "It trades emotional frustration rather than an edge, amplifying losses",
      "It requires paying double commission on every trade entered within an hour",
      "It causes charting software to delay execution feeds by several seconds",
      "It forces brokers to automatically lower your leverage to 1:1 for the day",
    ],
    answer: 0,
    explain: "Revenge trading happens when stress and anger bypass your trading plan, leading to oversized, unplanned positions.",
  },
  {
    id: "sq-9",
    q: "What is the primary role of a trading journal in professional development?",
    options: [
      "To track process adherence and quantify true statistical edge",
      "To share screenshots of winning trades with friends on Telegram groups",
      "To replace the requirement of using a stop loss on higher timeframe setups",
      "To predict future economic calendar releases before governments publish them",
    ],
    answer: 0,
    explain: "A detailed journal tracks setup types, emotional state, and R-multiples, diagnosing leaks in your execution.",
  },
  {
    id: "sq-10",
    q: "In currency trading, what does 'liquidity' mean?",
    options: [
      "How easily orders can be filled without moving the price",
      "The total amount of cash a trader keeps in their physical bank account",
      "The speed of an internet connection between the computer and broker server",
      "A guaranteed daily payout offered by unregulated offshore brokers",
    ],
    answer: 0,
    explain: "Liquidity is the volume of available resting buy/sell orders that allows rapid execution with minimal slippage.",
  },
  {
    id: "sq-11",
    q: "What occurs during the Asian session (Tokyo / Sydney) on major USD pairs?",
    options: [
      "Consolidation that builds liquidity above and below the range",
      "The largest trending price expansions of the entire trading day",
      "A complete freeze in interbank liquidity where spreads drop to zero",
      "The release of all major United States employment and inflation data",
    ],
    answer: 0,
    explain: "Asian session typically accumulates orders in a range, which the London open subsequently manipulates/sweeps.",
  },
  {
    id: "sq-12",
    q: "What does 'purchasing power parity' (PPP) attempt to measure?",
    options: [
      "Exchange rates that equalise prices of goods between countries",
      "The maximum lot size an account can purchase given its leverage tier",
      "The profit earned by central banks from daily overnight swap charges",
      "The exact spread difference between retail brokers and prime liquidity pools",
    ],
    answer: 0,
    explain: "PPP suggests exchange rates should adjust so that an identical basket of goods costs the same across countries.",
  },
  {
    id: "sq-13",
    q: "If an economic indicator prints 'Better than Expected' for EUR, what is the typical EUR/USD reaction?",
    options: [
      "Bullish EUR/USD rally",
      "Sharp bearish collapse in EUR/USD due to immediate profit taking",
      "Zero price movement because currency pairs only respond to US data",
      "A complete freeze in spot trading until the New York session begins",
    ],
    answer: 0,
    explain: "Positive economic data strengthens confidence in that economy's currency, lifting EUR/USD.",
  },
  {
    id: "sq-14",
    q: "What is the primary advantage of trading with a regulated broker?",
    options: [
      "Segregation of client funds and institutional oversight",
      "A guarantee that every trade you place will achieve at least a 1:3 R:R",
      "Free funded accounts with zero drawdown rules or restrictions",
      "Exemption from all local and international tax reporting obligations",
    ],
    answer: 0,
    explain: "Tier-1 regulated brokers keep client capital in segregated accounts and are audited by regulatory authorities.",
  },
  {
    id: "sq-15",
    q: "What does 'risk-on' sentiment describe in global financial markets?",
    options: [
      "Investors buying growth and higher-yielding assets like stocks and AUD",
      "Global institutional investors liquidating all assets into physical gold",
      "A complete ban on retail leverage imposed by international central banks",
      "Traders widening their stop losses to survive unexpected headline spikes",
    ],
    answer: 0,
    explain: "Risk-on sentiment occurs when confidence is high; capital flows out of safe havens into equities and commodity currencies.",
  },
  {
    id: "sq-16",
    q: "In Smart Money concepts, what does 'BOS' stand for?",
    options: [
      "Break of Structure",
      "Balance of Settlement",
      "Broker Order Stream",
      "Base of Support",
    ],
    answer: 0,
    explain: "Break of Structure (BOS) confirms the continuation of an established trend when price closes beyond a previous swing point.",
  },
  {
    id: "sq-17",
    q: "What is an 'Economic Calendar' used for by professional traders?",
    options: [
      "Scheduling risk around major macro releases and catalysts",
      "Booking vacation days when forex markets are closed for holidays",
      "Tracking the personal birthdays of global central bank governors",
      "Predicting lottery numbers based on historical price closing digits",
    ],
    answer: 0,
    explain: "Economic calendars map high-impact event release times so traders can avoid holding wide exposure into volatility spikes.",
  },
  {
    id: "sq-18",
    q: "What is 'overnight swap' (financing) in spot forex trading?",
    options: [
      "Interest earned or paid for holding a position past 5 PM New York",
      "A commission fee charged by trading platforms for refreshing chart candles",
      "A penalty applied when a trader changes the color palette of their charts",
      "The exchange rate difference between demo accounts and real money accounts",
    ],
    answer: 0,
    explain: "Swap is the interest rate differential between the two currencies held overnight at the daily 5:00 PM EST rollover.",
  },
  {
    id: "sq-19",
    q: "What is a 'Stop Loss' order designed to accomplish?",
    options: [
      "Cap maximum loss at a predetermined level if the trade fails",
      "Guarantee that the broker will always execute your take profit first",
      "Double your position size automatically when price begins to retrace",
      "Prevent your trading platform from logging out during the night",
    ],
    answer: 0,
    explain: "A stop loss acts as a safety invalidation mechanism, closing the trade if price moves against your thesis.",
  },
  {
    id: "sq-20",
    q: "What is the best way to handle a 3-trade losing streak?",
    options: [
      "Take a planned cool-off break and review logged execution against rules",
      "Quadruple the risk on the fourth trade to make back all previous losses",
      "Switch to an untested strategy downloaded from YouTube that afternoon",
      "Open simultaneous positions on eight different exotic currency pairs",
    ],
    answer: 0,
    explain: "Losing streaks are mathematically normal; stepping away protects emotional capital and prevents tilt.",
  },
  {
    id: "sq-21",
    q: "What does 'Carry Trade' mean?",
    options: [
      "Borrowing low-interest currency to invest in higher-yielding currency",
      "Holding an open position for more than one year without closing it",
      "Carrying your laptop to a physical trading office to place entries",
      "Copying trades placed by another member of a Telegram chat group",
    ],
    answer: 0,
    explain: "Traders profit from the yield spread between a high-rate currency and a low-rate funding currency.",
  },
  {
    id: "sq-22",
    q: "What does a 'Doji' candlestick indicate about market sentiment?",
    options: [
      "Indecision between buyers and sellers at that price",
      "A guaranteed 100-pip trend continuation in the direction of the open",
      "An immediate intervention by institutional liquidity providers",
      "That the market has permanently closed for the weekend early",
    ],
    answer: 0,
    explain: "A Doji has virtually equal opening and closing prices, showing that buyers and sellers ended in equilibrium.",
  },
  {
    id: "sq-23",
    q: "What happens to the spread during the 5:00 PM New York rollover window?",
    options: [
      "It widens significantly due to thin interbank liquidity",
      "It shrinks to absolute zero on all retail broker accounts",
      "It remains permanently frozen until the following Monday morning",
      "It is replaced by a flat twenty-dollar government transaction fee",
    ],
    answer: 0,
    explain: "During the 5:00 PM EST market rollover, New York closes and liquidity thins out, causing spreads to widen.",
  },
  {
    id: "sq-24",
    q: "What is 'FOMO' in trading psychology?",
    options: [
      "Fear of Missing Out, leading to emotional, late chase entries",
      "Financial Order Market Operations managed by institutional dealers",
      "A specialized candlestick pattern used exclusively on weekly charts",
      "An automated hedging system built into MetaTrader 5 terminals",
    ],
    answer: 0,
    explain: "Fear of Missing Out (FOMO) causes traders to jump into parabolic moves near the top, right before a reversal.",
  },
  {
    id: "sq-25",
    q: "Why are round psychological numbers (like 1.0500 or 1.3000) significant?",
    options: [
      "Large clusters of institutional limit and stop orders accumulate there",
      "They are the only price levels where automated trading robots are legal",
      "Central banks reset their interest rates each time price crosses them",
      "Brokers charge zero spread whenever price trades within five pips of them",
    ],
    answer: 0,
    explain: "Round numbers attract concentrated retail and institutional resting orders, creating natural support/resistance.",
  },
];

/* ============================================================================
 * INFINITE PROCEDURAL QUESTION BATCH GENERATOR
 * Generates endless parameterized questions with randomized numbers, account
 * balances, pairs, macro stats, and scenarios.
 * ========================================================================== */

function pickOne<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function generateProceduralBatch(courseId: string, count: number, startSeed: number): Question[] {
  const list: Question[] = [];
  const pairs = ["EUR/USD", "GBP/USD", "AUD/USD", "NZD/USD", "EUR/GBP", "USD/CAD", "USD/JPY"];
  const balances = [5000, 10000, 25000, 50000, 100000, 200000];
  const stopPipsList = [12, 15, 20, 25, 30, 40, 50];
  const riskPcts = [0.5, 1.0, 1.5, 2.0];
  const ddScenarios = [
    { loss: 20, gain: 25 },
    { loss: 25, gain: 33.3 },
    { loss: 30, gain: 42.9 },
    { loss: 40, gain: 66.7 },
    { loss: 50, gain: 100 },
    { loss: 60, gain: 150 },
    { loss: 75, gain: 300 },
  ];
  const winRateList = [40, 45, 50, 55, 60];
  const rrList = [2.0, 2.5, 3.0, 3.5, 4.0];

  for (let i = 0; i < count; i++) {
    const seed = startSeed + i * 37;
    const rng = makeRng(seed);
    const pair = pickOne(pairs, rng);
    const type = i % 7;

    if (type === 0) {
      // Position sizing calculation
      const balance = pickOne(balances, rng);
      const riskPct = pickOne(riskPcts, rng);
      const stopPips = pickOne(stopPipsList, rng);
      const riskDollars = (balance * riskPct) / 100;
      const lotSize = (riskDollars / (stopPips * 10)).toFixed(2);
      const wrongLot1 = (Number(lotSize) * 2).toFixed(2);
      const wrongLot2 = (Number(lotSize) * 0.5).toFixed(2);
      const wrongLot3 = (Number(lotSize) + 1.25).toFixed(2);

      list.push({
        id: `gen-lot-${seed}-${i}`,
        q: `On a $${balance.toLocaleString()} account risking ${riskPct}% ($${riskDollars.toLocaleString()}) with a ${stopPips}-pip stop on ${pair} ($10/pip/lot), what is your lot size?`,
        options: [
          `${lotSize} lots`,
          `${wrongLot1} lots, doubling your standard pip allocation for faster recovery`,
          `${wrongLot2} lots, reserving half of the margin for an unplanned hedge`,
          `${wrongLot3} lots, using maximum available broker leverage on entry`,
        ],
        answer: 0,
        explain: `Position Size = Risk Capital ($${riskDollars}) ÷ (Stop Pips ${stopPips} × $10/pip) = ${lotSize} standard lots.`,
      });
    } else if (type === 1) {
      // Drawdown recovery calculation
      const sc = pickOne(ddScenarios, rng);
      list.push({
        id: `gen-dd-${seed}-${i}`,
        q: `If an account experiences a ${sc.loss}% drawdown, what percentage gain on the remaining balance is required to return to breakeven?`,
        options: [
          `+${sc.gain}%`,
          `+${sc.loss}%, matching the exact percentage lost during the drawdown`,
          `+${(sc.loss * 0.75).toFixed(1)}%, because required margin shrinks after losses`,
          `+${(sc.gain * 1.5).toFixed(0)}%, assuming your reward-to-risk ratio remains fixed`,
        ],
        answer: 0,
        explain: `Drawdown recovery = [Loss% / (100 - Loss%)] × 100. A ${sc.loss}% loss leaves ${100 - sc.loss}% capital, requiring +${sc.gain}% gain.`,
      });
    } else if (type === 2) {
      // Mathematical expectancy
      const wr = pickOne(winRateList, rng);
      const rr = pickOne(rrList, rng);
      const exp = ((wr / 100) * rr - ((100 - wr) / 100) * 1).toFixed(2);
      list.push({
        id: `gen-exp-${seed}-${i}`,
        q: `A strategy has a ${wr}% win rate and averages 1:${rr} Risk-to-Reward (+${rr}R on wins, -1R on losses). What is its mathematical expectancy per trade?`,
        options: [
          `+${exp}R per trade`,
          `-0.15R per trade because the win rate is below seventy percent`,
          `+${(Number(exp) + 1.4).toFixed(2)}R per trade before factoring in spread costs`,
          `0.00R breakeven because losing trades cancel out all statistical gains`,
        ],
        answer: 0,
        explain: `Expectancy = (${wr / 100} × ${rr}R) - (${(100 - wr) / 100} × 1R) = +${exp}R per trade.`,
      });
    } else if (type === 3) {
      // Prop firm daily loss buffer
      const propBal = pickOne([25000, 50000, 100000, 200000], rng);
      const dailyLimitPct = 5;
      const dailyLimitUsd = (propBal * dailyLimitPct) / 100;
      const tradeRiskPct = 0.5;
      const tradeRiskUsd = (propBal * tradeRiskPct) / 100;
      const tradesToDailyBreach = Math.floor(dailyLimitPct / tradeRiskPct);

      list.push({
        id: `gen-pf-${seed}-${i}`,
        q: `On a $${propBal.toLocaleString()} prop firm account with a ${dailyLimitPct}% ($${dailyLimitUsd.toLocaleString()}) daily loss limit, how many consecutive full losses at ${tradeRiskPct}% ($${tradeRiskUsd.toLocaleString()}) each can you take before breaching?`,
        options: [
          `${tradesToDailyBreach} consecutive losses`,
          `2 consecutive losses regardless of the lot size used on entries`,
          `20 consecutive losses because daily limits reset every two hours`,
          `1 single loss if the trade is held across the London market open`,
        ],
        answer: 0,
        explain: `At ${tradeRiskPct}% risk per trade ($${tradeRiskUsd}), you can take ${tradesToDailyBreach} consecutive full losses before hitting the $${dailyLimitUsd} daily limit.`,
      });
    } else if (type === 4) {
      // Dealing range discount & premium
      const lowPrice = Number((1.05 + Math.floor(rng() * 20) * 0.01).toFixed(4));
      const rangePips = pickOne([80, 100, 120, 160], rng);
      const highPrice = Number((lowPrice + rangePips * 0.0001).toFixed(4));
      const eqPrice = Number(((lowPrice + highPrice) / 2).toFixed(4));

      list.push({
        id: `gen-eq-${seed}-${i}`,
        q: `In a dealing range between the low of ${lowPrice.toFixed(4)} and high of ${highPrice.toFixed(4)}, where is the discount zone for buying ${pair}?`,
        options: [
          `Below ${eqPrice.toFixed(4)}`,
          `Above ${eqPrice.toFixed(4)} where price trades in deep premium pricing`,
          `Only above ${highPrice.toFixed(4)} after three consecutive breakout candles`,
          `Exactly at ${highPrice.toFixed(4)} before any pullback has developed`,
        ],
        answer: 0,
        explain: `The 50% equilibrium is ${eqPrice.toFixed(4)}. Any price below ${eqPrice.toFixed(4)} is in discount for buying.`,
      });
    } else if (type === 5) {
      // Macro CPI Surprise
      const cpiCons = pickOne([2.8, 3.0, 3.2, 3.4], rng);
      const cpiPrint = (cpiCons + 0.5).toFixed(1);

      list.push({
        id: `gen-cpi-${seed}-${i}`,
        q: `United States CPI inflation prints at ${cpiPrint}% against an expected ${cpiCons}% consensus. What is the standard immediate macro reaction?`,
        options: [
          "Bullish USD (yields rise as rate cuts are priced out)",
          "Bearish USD as traders expect immediate emergency rate cuts by the Fed",
          "Neutral USD because consumer inflation never affects foreign exchange rates",
          "Immediate trading freeze in EUR/USD until the next quarterly GDP release",
        ],
        answer: 0,
        explain: `Hotter inflation (${cpiPrint}% vs ${cpiCons}%) forces yields higher and delays rate cuts, which strengthens the US Dollar.`,
      });
    } else {
      // Pip units and notional leverage
      const miniLots = pickOne([2, 3, 5, 8], rng);
      const units = miniLots * 10000;
      list.push({
        id: `gen-unit-${seed}-${i}`,
        q: `How many units of the base currency are controlled when trading 0.${miniLots}0 standard lots (${miniLots} mini lots) of ${pair}?`,
        options: [
          `${units.toLocaleString()} units`,
          `${(units / 10).toLocaleString()} units on standard retail accounts`,
          `${(units * 10).toLocaleString()} units during the London–New York overlap`,
          `100,000 units regardless of the lot size specified in MetaTrader`,
        ],
        answer: 0,
        explain: `1 standard lot = 100,000 units. 0.${miniLots}0 lots (${miniLots} mini lots) = ${units.toLocaleString()} units.`,
      });
    }
  }

  return list;
}

/* ============================================================================
 * CUSTOM QUIZZES PERSISTENCE
 * ========================================================================== */

export const CUSTOM_QUIZZES_KEY = "gamat.customQuizzes.v1";

export function getCustomQuizzes(): Quiz[] {
  try {
    const raw = localStorage.getItem(CUSTOM_QUIZZES_KEY);
    return raw ? (JSON.parse(raw) as Quiz[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomQuiz(quiz: Quiz): void {
  try {
    const list = getCustomQuizzes();
    const idx = list.findIndex((q) => q.courseId === quiz.courseId);
    let updated: Quiz[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = quiz;
    } else {
      updated = [quiz, ...list];
    }
    localStorage.setItem(CUSTOM_QUIZZES_KEY, JSON.stringify(updated));
  } catch {}
}

export function deleteCustomQuiz(courseId: string): void {
  try {
    const list = getCustomQuizzes().filter((q) => q.courseId !== courseId);
    localStorage.setItem(CUSTOM_QUIZZES_KEY, JSON.stringify(list));
  } catch {}
}

export const getQuiz = (courseId: string): Quiz | undefined => {
  const custom = getCustomQuizzes();
  const foundCustom = custom.find((q) => q.courseId === courseId);
  if (foundCustom) return foundCustom;
  return QUIZZES.find((q) => q.courseId === courseId);
};

/* ============================================================================
 * INFINITE 50-QUESTION ASSESSMENT GENERATOR
 * Every attempt produces a full 50-question examination:
 * 1. Combines core course questions + shared trading question bank + dynamic
 *    parameterized procedural scenarios.
 * 2. Every single question has its 4 options Fisher-Yates shuffled.
 * 3. The overall 50-question paper is randomized and non-repeating.
 * ========================================================================== */

export function generateAssessmentQuestions(
  courseId: string,
  baseQuiz: Quiz,
  targetCount: number = DEFAULT_EXAM_QUESTION_COUNT
): Question[] {
  const seed = Date.now() + Math.floor(Math.random() * 1_000_000);
  const needed = Math.max(10, targetCount);

  // 1. Course specific base questions
  const courseBase = shuffleArray(baseQuiz.questions);

  // 2. Cross-disciplinary questions from the shared pool
  const shared = shuffleArray(SHARED_TRADING_QUESTIONS);

  // 3. Generate dynamic procedural calculation & scenario questions
  const proceduralNeeded = Math.max(15, needed - (courseBase.length + shared.length) + 10);
  const procedural = generateProceduralBatch(courseId, proceduralNeeded, seed);

  // 4. Combine into an exhaustive candidate pool
  const candidatePool: Question[] = [
    ...courseBase,
    ...shared,
    ...procedural,
  ];

  // 5. Deduplicate by question text
  const seenTexts = new Set<string>();
  const uniqueQuestions: Question[] = [];

  for (const q of shuffleArray(candidatePool)) {
    const stem = q.q.trim().toLowerCase();
    if (!seenTexts.has(stem)) {
      seenTexts.add(stem);
      uniqueQuestions.push(q);
    }
    if (uniqueQuestions.length >= needed) break;
  }

  // If still needing more (rare), generate additional procedural questions
  let extraCounter = 1;
  while (uniqueQuestions.length < needed) {
    const extra = generateProceduralBatch(courseId, 1, seed + extraCounter * 9999)[0];
    const stem = extra.q.trim().toLowerCase();
    if (!seenTexts.has(stem)) {
      seenTexts.add(stem);
      uniqueQuestions.push(extra);
    }
    extraCounter++;
  }

  // 6. Slice exact count, shuffle options on each question, and assign unique attempt IDs
  return shuffleArray(uniqueQuestions.slice(0, needed)).map((q, idx) =>
    shuffleQuestionOptions({
      ...q,
      id: `${q.id}_s${seed}_${idx}`,
    })
  );
}
