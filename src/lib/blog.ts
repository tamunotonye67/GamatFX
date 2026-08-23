export type Block =
  | { t: "p"; v: string }
  | { t: "h"; v: string }
  | { t: "quote"; v: string }
  | { t: "list"; v: string[] };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Fundamentals" | "Technical" | "Psychology" | "Risk" | "News";
  author: string;
  authorRole: string;
  date: string;
  readMins: number;
  image: string;
  featured?: boolean;
  tags: string[];
  body: Block[];
};

const IMG = {
  charts: "https://images.pexels.com/videos/38484636/bitcoin-crypto-forex-hacker-38484636.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=720&w=1280",
  desk: "https://images.pexels.com/videos/38581107/bitcoin-crypto-forex-hacker-38581107.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=720&w=1280",
  screens: "https://images.pexels.com/videos/38358369/bitcoin-crypto-forex-hacker-38358369.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=720&w=1280",
  tablet: "https://images.pexels.com/videos/35606120/analysis-analytics-bitcoin-business-35606120.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=720&w=1280",
};

export const POSTS: Post[] = [
  {
    slug: "reading-the-economic-calendar",
    title: "How to Actually Read the Economic Calendar (Without Gambling)",
    excerpt: "Most traders check the calendar for red folders and nothing else. Here's the framework we teach for turning scheduled data into an actual directional bias.",
    category: "Fundamentals",
    author: "Tonye S. Taylor",
    authorRole: "Founder & Lead Mentor",
    date: "2026-02-18",
    readMins: 8,
    image: IMG.charts,
    featured: true,
    tags: ["NFP", "CPI", "Central Banks"],
    body: [
      { t: "p", v: "Ask ten retail traders what the economic calendar is for and nine will tell you it's a list of times to avoid. That is a defensive use of the single most predictable information source in the market — and it leaves most of the value on the table." },
      { t: "h", v: "Why the calendar matters more than any indicator" },
      { t: "p", v: "Currencies are priced on relative expectations about interest rates. Interest rates are set by central banks. Central banks respond to inflation and employment data. The calendar is simply the schedule on which that chain of causation becomes public." },
      { t: "p", v: "If you understand what a data release tells a central bank, you understand what it tells the currency. Everything else is noise dressed up as analysis." },
      { t: "h", v: "The three tiers of data" },
      { t: "list", v: [
        "Tier 1 — Rate decisions and forward guidance. These move currencies for weeks, not hours.",
        "Tier 2 — Inflation (CPI, PCE) and employment (NFP, unemployment rate). These shift expectations of Tier 1.",
        "Tier 3 — Sentiment surveys, PMIs, retail sales. These confirm or question the existing narrative.",
      ]},
      { t: "p", v: "A common mistake is treating all three tiers as equally tradeable. They are not. Tier 3 data rarely changes a bias — it adjusts conviction. Tier 1 data creates the bias in the first place." },
      { t: "h", v: "Expectation, not outcome" },
      { t: "p", v: "The single most important idea in fundamental trading: markets price expectations, not events. A country can post terrible employment data and its currency can rally — because the market had already priced in something worse." },
      { t: "quote", v: "You are never trading the number. You are trading the distance between the number and what the market thought the number would be." },
      { t: "p", v: "This is why the consensus forecast column on your calendar matters more than the actual figure. Before any release, write down three things: the consensus, what a beat would imply for rates, and what a miss would imply. If you cannot articulate all three, you should not have a position through that release." },
      { t: "h", v: "A practical pre-release routine" },
      { t: "list", v: [
        "On Sunday, mark every Tier 1 and Tier 2 event for the week ahead.",
        "For each, note the consensus and the previous reading.",
        "Write a one-sentence bias for each affected pair before the week starts.",
        "Do not open new positions in the 30 minutes before a Tier 1 release.",
        "After the release, wait for the first 15-minute candle to close before acting.",
      ]},
      { t: "p", v: "That last rule alone saves more accounts than any indicator we have ever seen. The initial spike on a data release is dominated by algorithmic execution and thin liquidity. The move that matters usually begins after it." },
      { t: "h", v: "Putting it together" },
      { t: "p", v: "Fundamentals give you direction and conviction. Technicals give you entry and risk. Traders who fight about which is better have usually mastered neither. Use the calendar to decide what you want to do, then use the chart to decide where you do it." },
    ],
  },
  {
    slug: "supply-and-demand-zones-explained",
    title: "Supply and Demand Zones: What Institutions Actually Leave Behind",
    excerpt: "Forget drawing boxes on every swing. A real zone has three specific characteristics — and most of what retail traders mark is none of them.",
    category: "Technical",
    author: "Amara Okonkwo",
    authorRole: "Head of Education",
    date: "2026-02-09",
    readMins: 7,
    image: IMG.screens,
    tags: ["Supply & Demand", "Order Flow"],
    body: [
      { t: "p", v: "Supply and demand is the most misused concept in retail trading. Most traders draw a rectangle around any obvious swing point, call it a zone, and then wonder why price cuts through it like it isn't there." },
      { t: "h", v: "What a zone actually represents" },
      { t: "p", v: "A genuine zone marks a price area where a large participant was unable to fill their entire order. They moved price away in the process, leaving unfilled interest behind. When price returns, that remaining interest can execute — which is why the area reacts." },
      { t: "p", v: "If no large order was left behind, there is nothing at that level. The rectangle is decoration." },
      { t: "h", v: "The three characteristics of a valid zone" },
      { t: "list", v: [
        "A sharp, decisive departure. Price should leave the area quickly and with conviction, not drift away.",
        "An imbalance in the departure. Look for consecutive candles with minimal overlap — evidence that one side overwhelmed the other.",
        "A structural consequence. The move away should break a meaningful high or low, not just wander into space.",
      ]},
      { t: "p", v: "If a level has all three, mark it. If it has two, watch it. If it has one, ignore it. Discipline in what you mark is discipline in what you trade." },
      { t: "h", v: "Fresh versus tested" },
      { t: "p", v: "A zone that has never been revisited holds the most unfilled interest. Each time price returns and reacts, some of that interest is consumed. By the third test, most zones are exhausted. This is why patient traders wait for first touches and impatient traders keep buying levels that already worked twice." },
      { t: "quote", v: "A zone is not a magic line. It is a probability that decays every time price visits it." },
      { t: "h", v: "Combining zones with bias" },
      { t: "p", v: "The highest-quality setups occur when a fresh demand zone aligns with a bullish fundamental bias and a higher-timeframe uptrend. You are then trading with the institutional flow, into an area where institutional orders remain, in the direction the macro picture supports." },
      { t: "p", v: "That is three layers of confluence. Two is usually enough. One is a coin flip with extra steps." },
    ],
  },
  {
    slug: "risk-management-position-sizing",
    title: "The Only Position Sizing Formula You Need",
    excerpt: "Blown accounts are almost never an analysis problem. Here is the arithmetic of survival, and why 2% is not as safe as you think.",
    category: "Risk",
    author: "Tunde Bello",
    authorRole: "Senior Market Analyst",
    date: "2026-01-28",
    readMins: 6,
    image: IMG.tablet,
    tags: ["Risk", "Drawdown", "Position Size"],
    body: [
      { t: "p", v: "Most traders can find a decent setup. Very few can survive a normal losing streak. The difference between those two groups is almost entirely position sizing." },
      { t: "h", v: "The formula" },
      { t: "p", v: "Position size = (Account balance × Risk percentage) ÷ (Stop distance in pips × Pip value). That's it. There is no second formula. If you are sizing any other way — round lots, gut feeling, doubling after a loss — you are not managing risk, you are expressing emotion." },
      { t: "h", v: "Why 2% is riskier than it sounds" },
      { t: "p", v: "Risking 2% per trade feels conservative. But run the arithmetic on a ten-trade losing streak, which every strategy produces eventually. You are down roughly 18%. To recover an 18% drawdown you need a 22% gain. At 5% risk, ten losses puts you down 40% — and you now need a 67% gain to break even." },
      { t: "quote", v: "Drawdown is not symmetrical. Losses compound against you faster than gains compound for you." },
      { t: "list", v: [
        "10% drawdown requires an 11% gain to recover.",
        "25% drawdown requires a 33% gain.",
        "50% drawdown requires a 100% gain.",
        "75% drawdown requires a 300% gain.",
      ]},
      { t: "h", v: "What we actually recommend" },
      { t: "p", v: "For traders in their first year: 0.5% per trade. It feels painfully slow. That is the point. Your first year is for building process, not returns. Once you have a hundred journaled trades and a documented edge, 1% is reasonable. Very few situations justify more than 2%." },
      { t: "h", v: "Correlation is hidden leverage" },
      { t: "p", v: "Three separate 1% positions on EURUSD, GBPUSD and AUDUSD is not three trades at 1%. Those pairs share a dollar leg. In a strong dollar move, it behaves closer to a single 3% position. Always size by total exposure to a currency, not by trade count." },
    ],
  },
  {
    slug: "trading-psychology-revenge-trading",
    title: "Why You Revenge Trade — And the System That Stops It",
    excerpt: "Revenge trading isn't a discipline failure. It's a predictable neurological response, and you beat it with structure rather than willpower.",
    category: "Psychology",
    author: "Ngozi Eze",
    authorRole: "Student Success Lead",
    date: "2026-01-15",
    readMins: 6,
    image: IMG.desk,
    tags: ["Psychology", "Discipline", "Journaling"],
    body: [
      { t: "p", v: "Every trader who has revenge traded knows exactly what happened. You took a loss, felt the urge to make it back immediately, and entered something you would never have taken an hour earlier. Afterwards you told yourself you needed more discipline." },
      { t: "p", v: "You didn't. Willpower is a depleting resource and it is at its weakest precisely when you need it most — immediately after a loss. The solution is not to try harder. It is to remove the decision entirely." },
      { t: "h", v: "What's actually happening" },
      { t: "p", v: "A loss registers as a threat. Your body responds with elevated cortisol and adrenaline, narrowing your focus onto the source of the threat and pushing you toward immediate corrective action. This is an excellent survival response and a catastrophic trading response." },
      { t: "quote", v: "You cannot out-discipline your own physiology. You can only build a system that does not require you to." },
      { t: "h", v: "The circuit breaker system" },
      { t: "list", v: [
        "Define a daily loss limit before the week starts — typically 2 to 3 times your per-trade risk.",
        "When you hit it, the platform closes. Not 'consider stopping'. Closes.",
        "Impose a mandatory 20-minute gap after any loss before a new entry is permitted.",
        "Write one sentence in your journal after every loss, before you look at another chart.",
        "Review the week's losses on Sunday, when you are calm and nothing is at stake.",
      ]},
      { t: "p", v: "Notice that none of these rules require discipline in the moment. They are structural. The decision was made in advance, by a version of you that was not flooded with stress hormones." },
      { t: "h", v: "The journal sentence" },
      { t: "p", v: "That single sentence after each loss is the highest-leverage habit in our entire mentorship program. Not a paragraph — one sentence answering: was this a good trade that lost, or a bad trade? Those are completely different events, and traders who cannot tell them apart end up abandoning profitable strategies during normal drawdown." },
    ],
  },
  {
    slug: "prop-firm-challenges-what-nobody-tells-you",
    title: "Prop Firm Challenges: What Nobody Tells You Before You Pay",
    excerpt: "Most challenge failures have nothing to do with analysis. They are rule failures — and the rules are designed around behaviours you probably have.",
    category: "Risk",
    author: "Tonye S. Taylor",
    authorRole: "Founder & Lead Mentor",
    date: "2025-12-20",
    readMins: 7,
    image: IMG.charts,
    tags: ["Prop Firms", "Funded", "Consistency"],
    body: [
      { t: "p", v: "Prop firm evaluations look like trading tests. They are actually behaviour tests. The profit target is usually the easiest part; the rules around how you reach it are where the majority of candidates fail." },
      { t: "h", v: "The daily drawdown trap" },
      { t: "p", v: "Most firms enforce a daily loss limit calculated from your starting balance each day — and critically, many calculate it including floating losses on open positions. A trade that is temporarily 3% underwater can breach your limit even if it later recovers to profit." },
      { t: "p", v: "This single mechanic ends more challenges than any other. If your strategy involves holding through drawdown, it is structurally incompatible with most evaluations regardless of how profitable it is long term." },
      { t: "h", v: "Consistency scoring" },
      { t: "p", v: "Many firms now require that no single day contributes more than a set percentage of your total profit. A trader who makes the entire target in one lucky session fails, even having hit the number. They are screening for repeatable process, not one good week." },
      { t: "quote", v: "The challenge is not asking 'can you make 10%?'. It is asking 'can you make 10% the same way, ten times?'" },
      { t: "h", v: "A challenge-safe framework" },
      { t: "list", v: [
        "Risk 0.25% to 0.5% per trade, not your normal size. The target is time, not speed.",
        "Cap yourself at two or three trades per day, maximum.",
        "Stop trading for the day after two consecutive losses, regardless of remaining limit.",
        "Target roughly 1% per week. Most evaluations allow far more time than people use.",
        "Never hold through a scheduled Tier 1 news event.",
      ]},
      { t: "p", v: "This framework is deliberately boring. Boring passes. The traders who blow evaluations are almost always the ones who tried to finish in a week." },
    ],
  },
  {
    slug: "beginner-mistakes-first-year",
    title: "Seven Mistakes Almost Every Trader Makes in Year One",
    excerpt: "We have onboarded thousands of beginners. The same seven errors show up again and again — and all of them are avoidable.",
    category: "Psychology",
    author: "Amara Okonkwo",
    authorRole: "Head of Education",
    date: "2025-12-04",
    readMins: 5,
    image: IMG.screens,
    tags: ["Beginners", "Mindset"],
    body: [
      { t: "p", v: "After thousands of student onboardings, the pattern is remarkably consistent. Year one failures are rarely creative — they cluster around the same seven behaviours." },
      { t: "h", v: "1. Going live too early" },
      { t: "p", v: "Demo trading is not a waste of time; it is where you build process at zero cost. Most beginners spend two weeks on demo and two years recovering from going live too soon." },
      { t: "h", v: "2. Strategy hopping" },
      { t: "p", v: "Abandoning a method after five losing trades guarantees you never experience any method's edge. Every profitable strategy loses regularly. You need at least fifty trades before the data means anything." },
      { t: "h", v: "3. Over-leveraging on 'sure things'" },
      { t: "p", v: "The setups that feel most certain are frequently the ones where you are most emotionally invested — and least objective. Conviction should never change position size." },
      { t: "h", v: "4. No written plan" },
      { t: "p", v: "If your entry criteria only exist in your head, they will change to accommodate whatever you feel like doing. Write them down. Trade only what matches." },
      { t: "h", v: "5. Ignoring the higher timeframe" },
      { t: "p", v: "A beautiful five-minute setup against a daily downtrend is not a setup. It is a donation." },
      { t: "h", v: "6. Not journaling" },
      { t: "p", v: "You cannot improve what you do not measure. Traders who journal consistently reach profitability dramatically faster — not because journaling is magic, but because it makes patterns visible." },
      { t: "h", v: "7. Trading to make money" },
      { t: "quote", v: "In year one your job is not to make money. It is to build a process that could make money indefinitely." },
      { t: "p", v: "Traders who need income from the market immediately take bad trades out of necessity. Traders who treat year one as tuition tend to still be trading in year five." },
    ],
  },
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
export const CATEGORIES = ["All", "Fundamentals", "Technical", "Psychology", "Risk", "News"] as const;

export const fmtPostDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
