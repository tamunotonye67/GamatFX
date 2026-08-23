export type Question = {
  id: string;
  q: string;
  options: string[];
  answer: number;
  explain: string;
};

export type Quiz = {
  courseId: string;
  title: string;
  passMark: number; // percentage
  timeLimitMins: number;
  questions: Question[];
};

const Q = (id: string, q: string, options: string[], answer: number, explain: string): Question =>
  ({ id, q, options, answer, explain });

export const QUIZZES: Quiz[] = [
  /* ============ Fundamental & Supply and Demand ============ */
  {
    courseId: "fundamental-supply-demand",
    title: "Fundamental & Supply and Demand — Final Assessment",
    passMark: 70,
    timeLimitMins: 25,
    questions: [
      Q("f1", "What ultimately drives the relative value of a currency pair?", [
        "The number of retail traders buying it",
        "Relative expectations about interest rates and monetary policy",
        "The shape of the last candlestick",
        "Trading volume on weekends",
      ], 1, "Currencies are priced on relative expectations about interest rates, which central banks set in response to inflation and employment data."),
      Q("f2", "Markets primarily price in…", [
        "The actual data outcome only",
        "Expectations, and then the surprise versus those expectations",
        "Whatever the news headline says",
        "The previous month's figure",
      ], 1, "You are never trading the number itself — you are trading the distance between the number and what the market expected."),
      Q("f3", "Which of these is considered Tier 1 data?", [
        "Consumer sentiment surveys",
        "Retail sales",
        "Central bank rate decisions and forward guidance",
        "Manufacturing PMI",
      ], 2, "Tier 1 covers rate decisions and forward guidance — these move currencies for weeks, not hours."),
      Q("f4", "What are the three characteristics of a valid supply or demand zone?", [
        "Round number, long wick, high volume",
        "Sharp departure, imbalance in the departure, and a structural consequence",
        "Any swing high or swing low",
        "A moving average crossover",
      ], 1, "A genuine zone shows a decisive departure, candles with minimal overlap (imbalance), and a break of meaningful structure."),
      Q("f5", "Why does a zone become less reliable each time price returns to it?", [
        "The chart software degrades it",
        "Unfilled institutional interest is consumed on each visit",
        "Zones expire after 24 hours",
        "Retail traders draw it differently",
      ], 1, "Each test consumes some of the remaining unfilled orders, so probability decays with every visit."),
      Q("f6", "What is the recommended action immediately before a Tier 1 release?", [
        "Double your position size",
        "Open new positions to catch the spike",
        "Avoid opening new positions in the final 30 minutes",
        "Remove your stop loss",
      ], 2, "The initial spike is dominated by algorithmic execution and thin liquidity. Wait for it to settle."),
      Q("f7", "A fresh demand zone aligned with a bullish macro bias and a higher-timeframe uptrend represents…", [
        "Over-analysis",
        "Three layers of confluence — a high-quality setup",
        "A guaranteed win",
        "A reason to reduce risk to zero",
      ], 1, "Three aligned layers is a strong setup, though it never removes the need for risk management."),
      Q("f8", "After a major data release, what does the course recommend?", [
        "Enter immediately on the first tick",
        "Wait for the first 15-minute candle to close",
        "Close all positions for the week",
        "Switch to a 1-second chart",
      ], 1, "Waiting for the first 15-minute candle to close filters out the algorithmic noise."),
      Q("f9", "If a central bank raises rates but signals this is the final hike, the currency often…", [
        "Rallies strongly on the hike",
        "Weakens, because the market prices the end of the tightening cycle",
        "Is completely unaffected",
        "Always gaps at the weekend",
      ], 1, "Forward guidance frequently matters more than the decision itself — 'dovish hikes' commonly weaken a currency."),
      Q("f10", "What does a rising CPI print typically imply for a central bank?", [
        "Pressure to cut rates",
        "Pressure to keep or raise rates to control inflation",
        "No policy implication",
        "An immediate currency devaluation",
      ], 1, "Higher inflation pressures a central bank toward tighter policy, which is generally currency-supportive."),
      Q("f11", "What is a 'fresh' zone?", [
        "One drawn in the last hour",
        "A zone price has not yet returned to since it formed",
        "A zone on the 1-minute chart",
        "Any zone drawn by a mentor",
      ], 1, "A fresh zone retains all its unfilled interest because price has not revisited it."),
      Q("f12", "Which currency generally strengthens during global risk-off sentiment?", [
        "AUD", "NZD", "USD and JPY", "ZAR",
      ], 2, "The dollar and yen are traditional safe havens and typically strengthen when risk appetite falls."),
      Q("f13", "Imbalance in a departure move is best described as…", [
        "Equal buying and selling",
        "Consecutive candles with minimal overlap, showing one side overwhelmed the other",
        "A doji pattern",
        "High spread conditions",
      ], 1, "Minimal candle overlap is visual evidence of a genuinely one-sided, inefficient move."),
      Q("f14", "The consensus forecast column on your calendar matters because…", [
        "It predicts the future accurately",
        "It defines what is already priced in, so you can judge the surprise",
        "Brokers require you to read it",
        "It sets the spread",
      ], 1, "Consensus tells you what the market already expects — the deviation from it is what moves price."),
      Q("f15", "A top-down analysis approach means…", [
        "Starting on the 1-minute chart",
        "Starting with macro/fundamental bias, then refining down through timeframes",
        "Only using the daily chart",
        "Copying another trader's analysis",
      ], 1, "You establish directional bias from the macro picture, then use lower timeframes for precise entry."),
      Q("f16", "Trading a zone that contradicts your fundamental bias is…", [
        "Always correct",
        "Lower probability — you are fighting the dominant flow",
        "Required for hedging",
        "The core of the strategy",
      ], 1, "Counter-bias trades remove a layer of confluence and are statistically weaker."),
      Q("f17", "Why should you write down your bias before the week starts?", [
        "To share on social media",
        "To prevent reactive, emotion-led decisions during volatile releases",
        "Because brokers require it",
        "To increase leverage",
      ], 1, "A pre-written plan removes in-the-moment improvisation when volatility spikes."),
    ],
  },

  /* ==================== Forex Foundations ==================== */
  {
    courseId: "forex-foundations",
    title: "Forex Foundations — Final Assessment",
    passMark: 70,
    timeLimitMins: 22,
    questions: [
      Q("b1", "What is a pip on most currency pairs?", [
        "The first decimal place", "The fourth decimal place", "The whole number", "The spread",
      ], 1, "For most pairs a pip is the fourth decimal place. On JPY pairs it is the second."),
      Q("b2", "What does leverage actually do?", [
        "Guarantees larger profits",
        "Amplifies both gains and losses on your capital",
        "Removes the need for a stop loss",
        "Reduces the spread",
      ], 1, "Leverage magnifies outcomes in both directions — it is a risk multiplier, not a profit generator."),
      Q("b3", "A standard lot is equivalent to…", [
        "1,000 units", "10,000 units", "100,000 units", "1,000,000 units",
      ], 2, "A standard lot is 100,000 units. A mini lot is 10,000 and a micro lot is 1,000."),
      Q("b4", "What is the safest way to place your very first trades?", [
        "Live account with maximum leverage",
        "A demo account until your process is consistent",
        "Copy someone else's signals",
        "A funded prop account",
      ], 1, "Demo trading builds process at zero cost. Going live too early is the most common year-one mistake."),
      Q("b5", "What does a stop-loss order do?", [
        "Guarantees you never lose",
        "Automatically closes a losing position at a defined level",
        "Doubles your position", "Increases leverage",
      ], 1, "A stop loss caps your downside by closing the position at a pre-defined level."),
      Q("b6", "Which session typically brings the highest liquidity for GBP pairs?", [
        "Sydney", "Tokyo", "London", "Weekend",
      ], 2, "The London session brings the deepest liquidity for European currencies."),
      Q("b7", "In the pair EURUSD, which is the base currency?", [
        "USD", "EUR", "Both", "Neither",
      ], 1, "The first currency listed is the base; the second is the quote currency."),
      Q("b8", "The spread is…", [
        "A broker bonus",
        "The difference between the bid and ask price",
        "Your profit target",
        "The same as leverage",
      ], 1, "The spread is the bid-ask difference and represents a cost you pay on entry."),
      Q("b9", "What is a 'long' position?", [
        "Holding for over a year",
        "Buying, expecting the base currency to rise",
        "Selling short",
        "A position with no stop loss",
      ], 1, "Going long means buying in anticipation of the price rising."),
      Q("b10", "What is margin?", [
        "Your total profit",
        "The capital your broker sets aside to hold a position open",
        "The broker's commission",
        "A type of order",
      ], 1, "Margin is the deposit required to open and maintain a leveraged position."),
      Q("b11", "A margin call happens when…", [
        "You make a profit",
        "Your account equity falls below the required margin level",
        "You close a trade",
        "The market is closed",
      ], 1, "It is a warning that your equity can no longer support your open positions."),
      Q("b12", "What does a take-profit order do?", [
        "Closes a position automatically at a target price",
        "Opens a new position",
        "Removes the spread",
        "Increases lot size",
      ], 0, "A take-profit closes your position automatically once your target level is reached."),
      Q("b13", "Which of these is a major currency pair?", [
        "TRY/ZAR", "GBP/USD", "MXN/NOK", "SEK/HUF",
      ], 1, "Majors always include the US dollar paired with another highly traded currency."),
      Q("b14", "Why does the forex market run 24 hours on weekdays?", [
        "Brokers never sleep",
        "Global financial centres open and close in overlapping sessions",
        "Governments require it",
        "Because of algorithmic trading only",
      ], 1, "Sydney, Tokyo, London and New York sessions overlap to create continuous trading."),
      Q("b15", "What is the first thing you should define before entering any trade?", [
        "Your profit target only",
        "Your risk — where you are wrong and how much you will lose",
        "How much leverage is available",
        "Which indicator to add",
      ], 1, "Defining your invalidation point and risk first is the foundation of survival."),
      Q("b16", "Candlestick wicks represent…", [
        "The open and close prices",
        "The highest and lowest prices reached during the period",
        "Trading volume",
        "The spread",
      ], 1, "The body shows open-to-close; the wicks show the full high-to-low range."),
    ],
  },

  /* =================== Price Action Mastery =================== */
  {
    courseId: "price-action-mastery",
    title: "Price Action Mastery — Final Assessment",
    passMark: 70,
    timeLimitMins: 24,
    questions: [
      Q("p1", "What distinguishes a break of structure from a liquidity grab?", [
        "Colour of the candle",
        "A break of structure holds and continues; a liquidity grab reverses sharply after taking stops",
        "Time of day only",
        "There is no difference",
      ], 1, "A genuine break of structure sustains. A liquidity grab wicks through, takes stops, then reverses."),
      Q("p2", "Where do resting stop orders usually sit?", [
        "At random prices",
        "Just beyond obvious swing highs and lows",
        "Only at round numbers",
        "In the middle of a range",
      ], 1, "Stops cluster just beyond obvious highs and lows, which is exactly why price is drawn there."),
      Q("p3", "A fair value gap (imbalance) represents…", [
        "A charting error",
        "An inefficient move where one side overwhelmed the other",
        "A guaranteed reversal point",
        "The end of a trend",
      ], 1, "An imbalance shows an inefficient, one-sided move that price often revisits to rebalance."),
      Q("p4", "Refining an entry to a lower timeframe primarily allows you to…", [
        "Trade more often",
        "Reduce stop distance and improve risk-to-reward",
        "Avoid all losses",
        "Ignore the higher timeframe",
      ], 1, "Lower-timeframe refinement tightens your stop, improving reward relative to risk."),
      Q("p5", "A five-minute buy setup against a clear daily downtrend is…", [
        "The highest probability trade available",
        "Low probability — you are fighting the dominant flow",
        "Always correct if the candle is green",
        "Only valid on Fridays",
      ], 1, "Counter-trend lower-timeframe setups against a strong higher timeframe are low probability."),
      Q("p6", "What is an order block?", [
        "Any large candle",
        "The last opposing candle before a decisive, structure-breaking move",
        "A broker restriction",
        "A round number level",
      ], 1, "An order block is typically the final opposing candle before an impulsive move that breaks structure."),
      Q("p7", "An uptrend is structurally defined by…", [
        "Green candles only",
        "Higher highs and higher lows",
        "Price above a moving average",
        "Rising volume",
      ], 1, "Structure, not colour or indicators, defines trend: successive higher highs and higher lows."),
      Q("p8", "A 'change of character' (CHoCH) signals…", [
        "The spread widening",
        "The first structural break suggesting the prevailing trend may be shifting",
        "A news release",
        "Market closure",
      ], 1, "CHoCH is the earliest structural hint that control may be passing to the other side."),
      Q("p9", "Equal highs on a chart typically indicate…", [
        "Strong resistance that will always hold",
        "A pool of liquidity likely to be swept",
        "A charting glitch",
        "Low volatility forever",
      ], 1, "Equal highs concentrate stop orders, making them attractive liquidity targets."),
      Q("p10", "Trading inside a tight consolidation range is generally…", [
        "The highest probability environment",
        "Low probability due to choppy, directionless price",
        "Required daily",
        "Best done with maximum size",
      ], 1, "Ranges produce false breaks and whipsaws; waiting for expansion is usually better."),
      Q("p11", "A pin bar / long wick rejection candle suggests…", [
        "Continuation is guaranteed",
        "Price was rejected at that level, hinting at order absorption",
        "The broker manipulated price",
        "Nothing at all",
      ], 1, "A long wick shows price tested a level and was firmly rejected."),
      Q("p12", "Why is confluence important?", [
        "It guarantees profit",
        "Multiple independent factors aligning raises probability",
        "It reduces the spread",
        "Brokers reward it",
      ], 1, "Each aligned factor adds weight to the setup, though none removes risk entirely."),
      Q("p13", "Premium and discount pricing refers to…", [
        "Broker account tiers",
        "Whether price sits in the upper or lower half of a dealing range",
        "The commission structure",
        "Weekend gaps",
      ], 1, "You generally want to buy in discount (lower half) and sell in premium (upper half)."),
      Q("p14", "What should invalidate a price action setup?", [
        "A single red candle",
        "Price closing beyond the structural level that defined the idea",
        "A losing day",
        "Negative news sentiment",
      ], 1, "Invalidation should be structural and defined in advance, not emotional."),
      Q("p15", "Marking every swing point as a zone typically leads to…", [
        "Better accuracy",
        "Cluttered charts and low-quality, indiscriminate trades",
        "Higher win rate",
        "Faster execution",
      ], 1, "Discipline in what you mark is discipline in what you trade — selectivity matters."),
      Q("p16", "Session liquidity patterns matter because…", [
        "Spreads are fixed all day",
        "Certain sessions reliably produce sweeps and expansion moves",
        "Markets close at noon",
        "Volume is always identical",
      ], 1, "London and New York opens frequently produce liquidity raids followed by directional expansion."),
    ],
  },

  /* ================= Risk & Trade Management ================= */
  {
    courseId: "risk-trade-management",
    title: "Risk & Trade Management — Final Assessment",
    passMark: 80,
    timeLimitMins: 22,
    questions: [
      Q("r1", "What is the correct position sizing formula?", [
        "Account ÷ number of trades",
        "(Account × risk %) ÷ (stop distance × pip value)",
        "Always one standard lot",
        "Leverage × balance",
      ], 1, "Position size = (Account balance × Risk percentage) ÷ (Stop distance in pips × Pip value)."),
      Q("r2", "A 50% drawdown requires what gain to break even?", [
        "50%", "75%", "100%", "150%",
      ], 2, "Drawdown is not symmetrical — a 50% loss requires a 100% gain to recover."),
      Q("r3", "What risk per trade does the course recommend in your first year?", [
        "5%", "3%", "0.5%", "10%",
      ], 2, "0.5% deliberately slows you down so your first year builds process rather than chasing returns."),
      Q("r4", "Three 1% positions on EURUSD, GBPUSD and AUDUSD behave most like…", [
        "Three independent 1% trades",
        "A single position of roughly 3% exposure to the dollar",
        "A hedged, risk-free position",
        "0.33% total risk",
      ], 1, "These pairs share a dollar leg, so correlated exposure behaves like one larger position."),
      Q("r5", "Why is a daily loss limit important?", [
        "Brokers require it",
        "It removes the in-the-moment decision when you are least objective",
        "It guarantees profit",
        "It increases leverage",
      ], 1, "A pre-set structural limit does not depend on willpower at the exact moment willpower is weakest."),
      Q("r6", "A 25% drawdown requires roughly what gain to recover?", [
        "25%", "33%", "50%", "10%",
      ], 1, "You need approximately a 33% gain to recover a 25% drawdown."),
      Q("r7", "Expectancy is best described as…", [
        "Your win rate alone",
        "The average amount you expect to win or lose per trade over many trades",
        "Your largest winning trade",
        "The broker's fee",
      ], 1, "Expectancy combines win rate and average win/loss size into one figure."),
      Q("r8", "A strategy with a 40% win rate can still be highly profitable if…", [
        "You use more leverage",
        "Average winners are meaningfully larger than average losers",
        "You trade more frequently",
        "You avoid stop losses",
      ], 1, "Win rate is meaningless without reward-to-risk. A 40% win rate at 3R is very profitable."),
      Q("r9", "Moving your stop loss further away as price moves against you is…", [
        "Good trade management",
        "One of the fastest ways to blow an account",
        "Required in volatile markets",
        "Recommended for beginners",
      ], 1, "Widening a stop abandons your predefined risk and turns a small loss into a catastrophic one."),
      Q("r10", "Risk-to-reward of 1:3 means…", [
        "Risking 3 to make 1",
        "Risking 1 to make 3",
        "Three trades per day",
        "A 3% account risk",
      ], 1, "You risk one unit to potentially gain three."),
      Q("r11", "Why should conviction never change your position size?", [
        "Brokers prohibit it",
        "Conviction is emotional and uncorrelated with actual outcome probability",
        "It slows execution",
        "It affects the spread",
      ], 1, "The setups that feel most certain are often those where you are least objective."),
      Q("r12", "Scaling out of a position means…", [
        "Adding more contracts",
        "Closing portions progressively to bank profit and reduce risk",
        "Switching brokers",
        "Increasing leverage",
      ], 1, "Partial closes lock in gains while leaving exposure for further movement."),
      Q("r13", "Moving your stop to breakeven too early often results in…", [
        "Guaranteed profit",
        "Being stopped out of trades that would have worked",
        "Higher expectancy",
        "Lower spread costs",
      ], 1, "Premature breakeven stops remove normal market noise tolerance and cut winners short."),
      Q("r14", "A 75% drawdown requires what gain to recover?", [
        "75%", "150%", "300%", "100%",
      ], 2, "A 75% loss requires a 300% gain — which is why deep drawdowns are usually terminal."),
      Q("r15", "Total portfolio risk should be measured by…", [
        "The number of open trades",
        "Combined exposure to each currency, accounting for correlation",
        "Your account balance alone",
        "The broker's margin figure",
      ], 1, "Correlation is hidden leverage — always size by aggregate currency exposure."),
      Q("r16", "The purpose of a trading journal in risk management is to…", [
        "Satisfy regulators",
        "Make behavioural patterns and rule breaches visible over time",
        "Calculate the spread",
        "Replace your strategy",
      ], 1, "You cannot improve what you do not measure; journals expose recurring costly habits."),
    ],
  },

  /* ================== Pro Trader Mentorship ================== */
  {
    courseId: "pro-trader-mentorship",
    title: "Pro Trader Mentorship — Final Assessment",
    passMark: 75,
    timeLimitMins: 25,
    questions: [
      Q("m1", "What is the single highest-leverage habit taught in the mentorship?", [
        "Watching more YouTube",
        "Writing one sentence in your journal after every loss",
        "Adding more indicators",
        "Increasing position size after wins",
      ], 1, "That one sentence makes patterns visible and separates good trades that lost from genuinely bad trades."),
      Q("m2", "Revenge trading is best solved by…", [
        "Trying harder to be disciplined",
        "Structural circuit breakers decided in advance",
        "Taking bigger positions to recover faster",
        "Trading a different pair",
      ], 1, "You cannot out-discipline physiology. Pre-committed structural rules remove the decision."),
      Q("m3", "How many trades are needed before performance data is meaningful?", [
        "5", "10", "At least 50", "200 minimum",
      ], 2, "At least fifty trades before you draw conclusions about a strategy's edge."),
      Q("m4", "A good trade that loses and a bad trade are…", [
        "The same thing",
        "Completely different events that must be judged separately",
        "Both reasons to change strategy",
        "Impossible to tell apart",
      ], 1, "Confusing the two causes traders to abandon profitable strategies during normal drawdown."),
      Q("m5", "What should determine your position size?", [
        "How confident you feel",
        "Your written risk rules, regardless of conviction",
        "Recent win streak",
        "Time of day",
      ], 1, "Conviction should never change position size — that is emotion, not risk management."),
      Q("m6", "Physiologically, what happens immediately after a loss?", [
        "Nothing measurable",
        "Stress hormones narrow focus and push you toward immediate corrective action",
        "Your analysis improves",
        "Reaction time slows permanently",
      ], 1, "Elevated cortisol and adrenaline are a survival response and a catastrophic trading response."),
      Q("m7", "Strategy hopping after five losing trades guarantees that…", [
        "You find the best system quickly",
        "You never experience any method's actual edge",
        "Your win rate rises",
        "You reduce risk",
      ], 1, "Every profitable strategy loses regularly; abandoning early means never realising the edge."),
      Q("m8", "The recommended mandatory gap after a loss before re-entering is…", [
        "No gap needed", "20 minutes", "One week", "Until the next month",
      ], 1, "A short enforced cooling-off period breaks the reactive impulse loop."),
      Q("m9", "A written trading plan matters because…", [
        "It impresses mentors",
        "Criteria only in your head will bend to whatever you feel like doing",
        "Brokers require it",
        "It increases leverage",
      ], 1, "Written rules are objective; mental rules quietly rewrite themselves under pressure."),
      Q("m10", "Reviewing losses is best done…", [
        "Immediately, while emotional",
        "On a calm day when nothing is at stake",
        "Never",
        "Only with a large profit",
      ], 1, "Weekend or end-of-week review, when calm, produces genuinely objective conclusions."),
      Q("m11", "In year one, your primary objective should be…", [
        "Maximum profit",
        "Building a repeatable process that could make money indefinitely",
        "Quitting your job",
        "Finding the perfect indicator",
      ], 1, "Traders who treat year one as tuition tend to still be trading in year five."),
      Q("m12", "Trading to generate immediate income typically causes…", [
        "Sharper focus",
        "Forced, low-quality trades taken out of necessity",
        "Better risk control",
        "Higher expectancy",
      ], 1, "Financial pressure makes patience impossible, which is fatal to a probabilistic edge."),
      Q("m13", "Accountability within a cohort helps because…", [
        "It creates competition to over-trade",
        "External review exposes blind spots you cannot see yourself",
        "It replaces your own analysis",
        "It guarantees profitability",
      ], 1, "Peer and mentor review surfaces recurring errors you have normalised."),
      Q("m14", "A daily loss limit should typically be set at…", [
        "50% of the account",
        "Two to three times your per-trade risk",
        "Unlimited",
        "One pip",
      ], 1, "Two to three times per-trade risk stops a bad day becoming a bad month."),
      Q("m15", "The purpose of a personal growth plan is to…", [
        "Set profit targets only",
        "Define measurable process goals and the habits behind them",
        "Choose which broker to use",
        "Decide your leverage",
      ], 1, "Process goals are controllable; outcome goals are not."),
      Q("m16", "Consistency is best evidenced by…", [
        "One large winning month",
        "Repeatable execution of the same rules across many trades",
        "A high account balance",
        "Trading every single day",
      ], 1, "Repeatability, not a single outlier result, demonstrates genuine skill."),
    ],
  },

  /* ==================== Funded Trader Prep ==================== */
  {
    courseId: "funded-trader-prep",
    title: "Funded Trader Prep — Final Assessment",
    passMark: 80,
    timeLimitMins: 22,
    questions: [
      Q("d1", "What ends most prop firm challenges?", [
        "Failing to hit the profit target",
        "Breaching the daily drawdown rule",
        "Trading too few pairs",
        "Slow internet",
      ], 1, "Daily drawdown breaches — often including floating losses — end more challenges than anything else."),
      Q("d2", "Consistency scoring exists to check that…", [
        "You trade every single day",
        "No single day contributes an outsized share of your profit",
        "You use the maximum leverage",
        "You hold positions overnight",
      ], 1, "Firms screen for repeatable process, not one lucky session."),
      Q("d3", "Recommended risk per trade during an evaluation?", [
        "2–3%", "0.25–0.5%", "5%", "Whatever your normal size is",
      ], 1, "Reduce to 0.25–0.5%. The target is time and consistency, not speed."),
      Q("d4", "You should stop trading for the day after…", [
        "One winning trade", "Two consecutive losses", "Reaching 50% of the target", "Any red candle",
      ], 1, "Two consecutive losses is a sensible daily circuit breaker regardless of remaining limit."),
      Q("d5", "Holding through a scheduled Tier 1 news event during a challenge is…", [
        "Recommended for faster gains",
        "Strongly discouraged and often against the rules",
        "Required",
        "Only allowed on demo",
      ], 1, "Many firms prohibit it outright, and the volatility can breach drawdown limits instantly."),
      Q("d6", "Many firms calculate daily drawdown including…", [
        "Only closed losses",
        "Floating (unrealised) losses on open positions",
        "Commission only",
        "Weekend gaps only",
      ], 1, "A trade temporarily underwater can breach your limit even if it later recovers."),
      Q("d7", "A strategy that holds through deep drawdown is…", [
        "Ideal for evaluations",
        "Structurally incompatible with most challenge rule sets",
        "Always the most profitable",
        "Required by prop firms",
      ], 1, "Regardless of long-run profitability, it conflicts with daily drawdown mechanics."),
      Q("d8", "A sensible weekly profit target during a challenge is roughly…", [
        "10%", "1%", "25%", "50%",
      ], 1, "About 1% per week is sustainable; most evaluations allow far more time than people use."),
      Q("d9", "Maximum recommended trades per day during an evaluation?", [
        "Unlimited", "Two or three", "Twenty", "One per minute",
      ], 1, "Limiting frequency reduces variance and protects the daily limit."),
      Q("d10", "The difference between daily and overall drawdown is…", [
        "There is none",
        "Daily resets each session; overall is a hard floor for the whole account",
        "Overall resets weekly",
        "Daily applies only on Fridays",
      ], 1, "You must respect both simultaneously — the daily limit usually binds first."),
      Q("d11", "Payout discipline after funding means…", [
        "Withdrawing everything immediately",
        "Following a structured plan for withdrawals and account growth",
        "Never withdrawing",
        "Doubling risk after the first payout",
      ], 1, "A structured approach protects the funded account you worked to earn."),
      Q("d12", "Why do firms impose a minimum trading day requirement?", [
        "To collect more fees",
        "To prevent a single lucky day from passing the evaluation",
        "To slow down withdrawals",
        "For tax reasons",
      ], 1, "It ensures the result reflects a repeatable process rather than variance."),
      Q("d13", "The safest approach to the profit target is to treat it as…", [
        "A sprint to finish in days",
        "A slow accumulation over the full available window",
        "Optional",
        "A reason to increase leverage",
      ], 1, "The traders who blow evaluations are almost always the ones who tried to finish in a week."),
      Q("d14", "Correlated positions during a challenge are dangerous because…", [
        "They reduce commission",
        "They multiply effective exposure and can breach the daily limit at once",
        "They are prohibited by law",
        "They slow execution",
      ], 1, "Correlated trades move together, so a single adverse move hits every position simultaneously."),
      Q("d15", "After passing phase 1, your approach should…", [
        "Become much more aggressive",
        "Stay essentially identical — the rules still apply",
        "Abandon the stop loss",
        "Switch to a new untested strategy",
      ], 1, "Phase 2 usually has the same risk rules with a lower target; consistency remains key."),
      Q("d16", "A challenge is fundamentally testing…", [
        "Whether you can make 10% once",
        "Whether you can make 10% the same way, repeatedly",
        "Your internet speed",
        "Your account size",
      ], 1, "It is a behaviour test disguised as a trading test."),
    ],
  },
];

export const getQuiz = (courseId: string) => QUIZZES.find((q) => q.courseId === courseId);
