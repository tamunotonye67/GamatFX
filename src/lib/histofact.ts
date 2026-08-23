export type HistoFactCategory = "Forex" | "Crypto" | "Macro & History";

export type HistoFactTheme = "crimson" | "obsidian" | "gold" | "emerald" | "sapphire" | "purple";

export type HistoFact = {
  id: string;
  cardNumber: number;
  cardRank: string; // e.g. "K♠", "Q♦", "J♣"
  suit: "♠" | "♦" | "♣" | "♥";
  theme: HistoFactTheme;
  title: string;
  era: string;
  category: HistoFactCategory;
  teaser: string;
  image: string;
  badge: string;
  summary: string;
  details: string[];
  takeaway: string;
  impactLevel: "Historical Landmark" | "Market Crash" | "Protocol Revolution" | "Systemic Shift";
  keyFigure?: string;
};

const RAW_CARD_TOPICS: Omit<HistoFact, "cardNumber" | "cardRank" | "suit" | "theme">[] = [
  {
    id: "satoshi-nakamoto",
    title: "The Mystery of Satoshi Nakamoto",
    era: "2008–2009",
    category: "Crypto",
    teaser: "Who was behind the 9-page whitepaper that birthed the $1+ Trillion decentralized currency revolution?",
    image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=800&q=80",
    badge: "Mystery & Innovation",
    summary: "On October 31, 2008, Satoshi Nakamoto published 'Bitcoin: A Peer-to-Peer Electronic Cash System'. On January 3, 2009, Nakamoto mined Block 0, embedding the headline: 'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks.'",
    details: [
      "Satoshi Nakamoto held an estimated 1.1 million Bitcoins in early wallets untouched for over 15 years.",
      "In April 2011, Satoshi vanished saying: 'I've moved on to other things. It's in good hands.'",
      "Top candidates over the years include Hal Finney, Nick Szabo, Adam Back, and Dorian Nakamoto.",
    ],
    takeaway: "Total anonymity prevented a single point of failure or centralized regulatory shutdown.",
    impactLevel: "Protocol Revolution",
    keyFigure: "Satoshi Nakamoto",
  },
  {
    id: "bretton-woods",
    title: "The Bretton Woods Agreement",
    era: "July 1944",
    category: "Macro & History",
    teaser: "44 nations gathered in New Hampshire to create the modern international monetary and foreign exchange framework.",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80",
    badge: "Monetary Architecture",
    summary: "Delegates met at Mount Washington Hotel to peg the US Dollar to Gold at $35 an ounce, while all allied currencies were pegged to the US Dollar.",
    details: [
      "Birthed the International Monetary Fund (IMF) and the World Bank.",
      "The US held 2/3 of global gold reserves, making USD the undisputed global reserve currency.",
      "Established fixed exchange rates with a 1% band.",
    ],
    takeaway: "Global reserve currencies rely on institutional trust, physical backing, and geopolitical dominance.",
    impactLevel: "Historical Landmark",
    keyFigure: "John Maynard Keynes & Harry Dexter White",
  },
  {
    id: "black-wednesday",
    title: "Black Wednesday & George Soros",
    era: "Sept 16, 1992",
    category: "Forex",
    teaser: "How a single hedge fund broke the Bank of England and netted $1 Billion in 24 hours trading GBP.",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    badge: "Legendary Trade",
    summary: "Britain was bound to the European Exchange Rate Mechanism. George Soros built a $10 Billion short position on GBP, forcing the Bank of England to surrender after spending billions trying to defend its currency.",
    details: [
      "The Bank of England raised interest rates to 12% and threatened 15% in desperation.",
      "At 7 PM, the UK withdrew GBP from the ERM, handing Soros $1 Billion in single-day profit.",
      "Earned Soros the title 'The Man Who Broke the Bank of England'.",
    ],
    takeaway: "Central bank reserves cannot override macro economic imbalances against relentless global volume.",
    impactLevel: "Systemic Shift",
    keyFigure: "George Soros & Stanley Druckenmiller",
  },
  {
    id: "snb-unpeg",
    title: "The Swiss Franc (CHF) Flash Shock",
    era: "Jan 15, 2015",
    category: "Forex",
    teaser: "The day the Swiss National Bank unexpectedly abandoned its EUR/CHF 1.20 floor, causing a 30% instant currency spike.",
    image: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=800&q=80",
    badge: "Central Bank Surprise",
    summary: "Without warning, the SNB scrapped its 3-year-old minimum floor of 1.20 EUR/CHF. Within seconds, CHF surged over 30%, wiping out major FX brokers like Alpari UK.",
    details: [
      "Liquidity evaporated instantly, creating massive slippage of hundreds of pips.",
      "Retail traders suffered negative balances across the globe.",
      "Remains one of the largest single-day currency spikes in modern history.",
    ],
    takeaway: "Never rely on central bank promises as guaranteed stop-loss zones. High leverage is fatal during unexpected shocks.",
    impactLevel: "Market Crash",
    keyFigure: "Thomas Jordan (SNB Chairman)",
  },
  {
    id: "tulip-mania",
    title: "Tulip Mania: First Speculative Bubble",
    era: "1636–1637",
    category: "Macro & History",
    teaser: "In the Dutch Golden Age, a single rare tulip bulb traded for more than 10 times the annual income of a skilled craftsman.",
    image: "https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=800&q=80",
    badge: "Bubble Psychology",
    summary: "Contracted futures on rare tulip bulbs skyrocketed. Investors traded land, livestock, and homes for tulip contracts until the market collapsed overnight in February 1637.",
    details: [
      "A single Semper Augustus bulb sold for 5,000 guilders — price of an Amsterdam luxury estate.",
      "The market collapsed when a Haarlem auction failed to attract buyers.",
      "Earliest recorded speculative asset bubble in economic history.",
    ],
    takeaway: "Human emotional cycles of FOMO and panic remain identical across 400 years.",
    impactLevel: "Historical Landmark",
    keyFigure: "Dutch Merchants & Futures Brokers",
  },
  {
    id: "plaza-accord",
    title: "The Plaza Accord",
    era: "Sept 22, 1985",
    category: "Forex",
    teaser: "5 major powers met at the Plaza Hotel to deliberately devalue the US Dollar by 51% over two years.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    badge: "Coordination FX",
    summary: "The G5 finance ministers signed an agreement at NYC's Plaza Hotel to jointly intervene in foreign exchange markets to weaken the surging USD.",
    details: [
      "Coordinated central bank selling drove USD down 51% against JPY and DEM over 2 years.",
      "The rapid appreciation of Yen triggered Japan's late-1980s asset bubble.",
      "Proved central bank coordination can fundamentally alter long-term macro trends.",
    ],
    takeaway: "Superpower policy alignments create long-term macroeconomic trends that last for years.",
    impactLevel: "Systemic Shift",
    keyFigure: "James Baker (US Treasury Secretary)",
  },
  {
    id: "euro-launch",
    title: "The Birth of the Euro Currency",
    era: "Jan 1, 1999",
    category: "Forex",
    teaser: "11 European nations replaced their national currencies to launch the second most traded currency on Earth.",
    image: "https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&w=800&q=80",
    badge: "Currency Creation",
    summary: "The Euro was introduced for financial accounting and banking transactions, establishing EUR/USD as the world's most liquid currency pair.",
    details: [
      "Physical banknotes and coins entered circulation on Jan 1, 2002.",
      "Eliminated exchange rate risk and transaction costs across Eurozone members.",
      "Established the European Central Bank (ECB) in Frankfurt.",
    ],
    takeaway: "Consolidating regional markets creates deep liquidity pools.",
    impactLevel: "Historical Landmark",
    keyFigure: "Wim Duisenberg (First ECB President)",
  },
  {
    id: "flash-crash-2010",
    title: "The 2010 Trillion-Dollar Flash Crash",
    era: "May 6, 2010",
    category: "Macro & History",
    teaser: "36 minutes of algorithmic madness where US equity indices plunged 9% and erased $1 Trillion in minutes.",
    image: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80",
    badge: "Algorithmic Chaos",
    summary: "At 2:32 PM EST, high-frequency trading (HFT) algorithms executed automated sell loops as liquidity providers withdrew quotes.",
    details: [
      "Dow Jones fell nearly 1,000 points (9%) in 10 minutes before recovering 36 minutes later.",
      "Multibillion-dollar stocks briefly traded for $0.01 per share.",
      "London day trader Navinder Singh Sarao was charged with order spoofing.",
    ],
    takeaway: "Automated execution cascades can decouple price from fundamental value in seconds.",
    impactLevel: "Market Crash",
    keyFigure: "Navinder Singh Sarao & HFT Algorithms",
  },
  {
    id: "vitalik-ethereum",
    title: "Vitalik Buterin & Ethereum Inception",
    era: "July 2015",
    category: "Crypto",
    teaser: "A 19-year-old programmer expanded blockchain into a global decentralized Turing-complete computer.",
    image: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?auto=format&fit=crop&w=800&q=80",
    badge: "Smart Contracts",
    summary: "Vitalik Buterin published the Ethereum Whitepaper in late 2013. Mainnet launched July 30, 2015, introducing smart contracts and EVM execution.",
    details: [
      "Ethereum ICO raised 31,500 BTC (~$18 Million) in 2014.",
      "Birthed ICOs (2017), DeFi protocols (2020), NFTs (2021), and Layer-2 networks.",
      "In Sept 2022, 'The Merge' reduced network energy consumption by 99.95%.",
    ],
    takeaway: "Programmable smart contracts created decentralized financial primitives.",
    impactLevel: "Protocol Revolution",
    keyFigure: "Vitalik Buterin & Gavin Wood",
  },
  {
    id: "nixon-shock",
    title: "The Nixon Shock",
    era: "Aug 15, 1971",
    category: "Macro & History",
    teaser: "President Richard Nixon unilaterally cancelled USD gold convertibility, ending the Bretton Woods era.",
    image: "https://images.unsplash.com/photo-1561414927-6d86591d0c4f?auto=format&fit=crop&w=800&q=80",
    badge: "Fiat Shift",
    summary: "President Nixon announced a 90-day wage freeze and suspended direct convertibility of dollars into gold, launching the floating exchange rate era.",
    details: [
      "Ended the gold standard, creating the modern pure fiat monetary regime.",
      "Exchange rates between major currencies floated freely, giving birth to retail Forex trading.",
      "Gold prices surged from $35/oz to over $800/oz by 1980.",
    ],
    takeaway: "Fiat currencies inherently introduce exchange rate volatility.",
    impactLevel: "Systemic Shift",
    keyFigure: "Richard Nixon & Paul Volcker",
  },
  {
    id: "lehman-2008",
    title: "The 2008 Global Financial Crisis",
    era: "Sept 15, 2008",
    category: "Macro & History",
    teaser: "158-year-old Lehman Brothers filed for bankruptcy with $619 Billion in debt, sparking global financial panic.",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
    badge: "Systemic Collapse",
    summary: "Toxic subprime Mortgage-Backed Securities (MBS) imploded investment bank balance sheets, causing Lehman's historic failure.",
    details: [
      "Interbank lending froze overnight due to counterparty risk.",
      "Central banks executed massive Quantitative Easing (QE).",
      "Directly inspired Satoshi Nakamoto to create Bitcoin.",
    ],
    takeaway: "Unregulated credit leverage can paralyze global banking liquidity.",
    impactLevel: "Market Crash",
    keyFigure: "Dick Fuld & Ben Bernanke",
  },
  {
    id: "bitcoin-pizza",
    title: "Bitcoin Pizza Day",
    era: "May 22, 2010",
    category: "Crypto",
    teaser: "The first documented commercial Bitcoin transaction: 10,000 Bitcoins for 2 Papa John's pizzas.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    badge: "Milestone",
    summary: "Laszlo Hanyecz paid 10,000 BTC to student Jeremy Sturdivant for two delivered pizzas on the Bitcointalk forum.",
    details: [
      "10,000 BTC was worth ~$41 USD on May 22, 2010.",
      "Worth over $700,000,000 at peak Bitcoin prices.",
      "Celebrated annually worldwide as Bitcoin Pizza Day.",
    ],
    takeaway: "Every new asset class starts with humble utility before institutional liquidity arrives.",
    impactLevel: "Historical Landmark",
    keyFigure: "Laszlo Hanyecz & Jeremy Sturdivant",
  },
];

// Helper to fill 100 cards systematically with historical market events, legends, and indicators
export const HISTOFACTS: HistoFact[] = Array.from({ length: 100 }, (_, i) => {
  const cardNum = i + 1;
  const suits: ("♠" | "♥" | "♦" | "♣")[] = ["♠", "♥", "♦", "♣"];
  const themes: HistoFactTheme[] = ["obsidian", "crimson", "gold", "sapphire", "emerald", "purple"];
  const ranks = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];
  
  const suit = suits[i % suits.length];
  const theme = themes[i % themes.length];
  const cardRank = `${ranks[i % ranks.length]}${suit}`;

  // If topic exists in curated list, use it
  if (RAW_CARD_TOPICS[i]) {
    const raw = RAW_CARD_TOPICS[i];
    return {
      ...raw,
      cardNumber: cardNum,
      cardRank,
      suit,
      theme,
    };
  }

  // Generate extended historical card topics (Card 13 to 100)
  const categories: HistoFactCategory[] = ["Forex", "Crypto", "Macro & History"];
  const cat = categories[i % categories.length];

  const extendedTopics = [
    { title: "Charles Dow & Dow Theory", key: "Charles Dow", era: "1884", desc: "Formulated the foundations of modern technical analysis and trend confirmation across indices." },
    { title: "Jesse Livermore & 1929 Crash", key: "Jesse Livermore", era: "Oct 1929", desc: "Shorted the 1929 Stock Market Crash to net $100 Million ($1.5B today) in a single week." },
    { title: "Richard Wyckoff & Market Cycles", key: "Richard Wyckoff", era: "1930s", desc: "Mapped Institutional Accumulation, Markup, Distribution, and Markdown phase schematics." },
    { title: "Bank of Japan Negative Rates", key: "Haruhiko Kuroda", era: "Jan 2016", desc: "BOJ introduced -0.1% interest rates to battle deflation, shocking Japanese Yen charts." },
    { title: "Paul Volcker's 20% Rate Shock", key: "Paul Volcker", era: "1980", desc: "Fed Chairman raised interest rates to 20% to break 14% stagflation, causing a 50% USD rally." },
    { title: "Mt. Gox Collapse", key: "Mark Karpelès", era: "Feb 2014", desc: "World's largest Bitcoin exchange lost 850,000 BTC to hackers, causing an 80% price crash." },
    { title: "Silk Road Seizure", key: "Ross Ulbricht", era: "Oct 2013", desc: "FBI seized 144,000 Bitcoins, holding landmark public auctions that brought Wall St interest." },
    { title: "The South Sea Bubble", key: "John Blunt", era: "1720", desc: "British Joint-Stock mania where Sir Isaac Newton lost his fortune, stating 'I can calculate celestial motion, not human madness'." },
    { title: "Mississippi Company Speculation", key: "John Law", era: "1720", desc: "French paper money pioneer John Law triggered hyperinflation when paper notes decoupled from gold." },
    { title: "1987 Black Monday Crash", key: "Wall Street Floor", era: "Oct 19, 1987", desc: "Dow Jones plunged 22.6% in a single trading session across global financial markets." },
    { title: "Federal Reserve Act of 1913", key: "J.P. Morgan & Woodrow Wilson", era: "Dec 1913", desc: "Created the United States central banking system following the 1907 Bank Panic." },
    { title: "Asian Financial Crisis", key: "Thai Baht Float", era: "July 1997", desc: "Thailand unpegged the Baht from USD, triggering currency contagion across East Asia." },
    { title: "Russian Ruble Crisis & LTCM", key: "John Meriwether", era: "Aug 1998", desc: "Russia defaulted on domestic debt, bankrupting Nobel laureate hedge fund LTCM." },
    { title: "The Dot-Com Bubble Peak", key: "Alan Greenspan", era: "March 2000", desc: "NASDAQ surged to 5,048 on speculative internet stocks before falling 78% over two years." },
    { title: "FDR Gold Executive Order 6102", key: "Franklin D. Roosevelt", era: "April 1933", desc: "Forbid gold hoarding, forcing Americans to surrender gold bullion to the Fed at $20.67/oz." },
    { title: "Tang Dynasty Paper Currency", key: "Emperor Hiang Tsung", era: "800 AD", desc: "Invented 'Flying Money' paper drafts, replacing heavy copper coins for international trade." },
    { title: "Bank of Amsterdam Foundation", key: "Dutch Republic", era: "1609", desc: "Created the world's first modern central bank and pioneer of reserve balance transfers." },
    { title: "Medici Double-Entry Bookkeeping", key: "Giovanni di Bicci de' Medici", era: "1397", desc: "Revolutionized banking by tracking assets, debits, and credits across international branches." },
    { title: "Birth of CME Currency Futures", key: "Leo Melamed", era: "May 1972", desc: "Launched International Monetary Market (IMM) at CME, introducing currency futures." },
    { title: "First Retail Online FX Broker", key: "Online FX Pioneers", era: "1996", desc: "Transitioned Foreign Exchange trading from interbank phone dealing to retail web screens." },
    { title: "Sterling Crisis of 1976", key: "Denis Healey", era: "Sept 1976", desc: "UK requested a $3.9 Billion IMF bailout as Sterling reserves collapsed against the US Dollar." },
    { title: "The Tequila Crisis", key: "Mexican Central Bank", era: "Dec 1994", desc: "Mexico devalued the Peso, causing capital flight across South American emerging markets." },
    { title: "Brazilian Real Plan", key: "Fernando Henrique Cardoso", era: "1994", desc: "Replaced hyperinflated Cruzeiro with the Real, taming 2,000% annual inflation." },
    { title: "Japanese Asset Price Bubble", key: "Bank of Japan", era: "1986–1991", desc: "Tokyo real estate values soared until the Imperial Palace grounds were valued higher than California." },
    { title: "The Yen Carry Trade", key: "Global Macro Funds", era: "2000s", desc: "Traders borrowed 0% Yen to invest in 5%+ High Yield AUD & NZD, driving multi-year FX trends." },
    { title: "SWIFT Banking Network Inception", key: "239 Global Banks", era: "May 1973", desc: "Standardized cross-border wire communications across 200+ countries." },
    { title: "Hal Finney & First BTC Transfer", key: "Hal Finney", era: "Jan 12, 2009", desc: "Cryptographer Hal Finney received 10 Bitcoins from Satoshi Nakamoto in Block 170." },
    { title: "Nick Szabo & Bit Gold", key: "Nick Szabo", era: "1998", desc: "Designed decentralized digital store-of-value combining proof-of-work and cryptographic keys." },
    { title: "Adam Back & Hashcash", key: "Adam Back", era: "1997", desc: "Created proof-of-work algorithm used to limit email spam, later adopted by Bitcoin mining." },
    { title: "Wei Dai & b-money", key: "Wei Dai", era: "1998", desc: "Proposed anonymous distributed electronic cash protocol cited in Satoshi's whitepaper." },
    { title: "The DAO Hard Fork", key: "Ethereum Community", era: "July 2016", desc: "Ethereum executed hard fork to reverse a $50M smart contract exploit, creating Ethereum Classic." },
    { title: "The 2017 ICO Mania", key: "Crypto Projects", era: "2017", desc: "Initial Coin Offerings raised billions in ETH for whitepapers, driving Ethereum to $1,400." },
    { title: "Bitcoin Halving Mechanism", key: "Satoshi Protocol", era: "Every 210k Blocks", desc: "Programmed supply reduction halving block rewards every 4 years (50 -> 25 -> 12.5 -> 6.25 -> 3.125 BTC)." },
    { title: "Terra LUNA & UST Implosion", key: "Do Kwon", era: "May 2022", desc: "$60 Billion algorithmic stablecoin UST lost $1 peg, sending LUNA token to zero in 72 hours." },
    { title: "FTX Bankruptcy", key: "Sam Bankman-Fried", era: "Nov 2022", desc: "2nd largest crypto exchange imploded after misusing $8B of customer deposits, leading to SBF conviction." },
    { title: "El Salvador Bitcoin Legal Tender", key: "Nayib Bukele", era: "Sept 2021", desc: "First sovereign nation to make Bitcoin official legal tender alongside the US Dollar." },
    { title: "US Spot Bitcoin ETF Approvals", key: "Larry Fink (BlackRock)", era: "Jan 2024", desc: "SEC approved 11 Spot BTC ETFs, unlocking institutional capital from Wall Street giants." },
    { title: "US Dollar Index (DXY) Creation", key: "Federal Reserve", era: "March 1973", desc: "Created index tracking USD against 6 major world currencies following Bretton Woods collapse." },
    { title: "Cable (GBP/USD) Telegraph Line", key: "Atlantic Telegraph Co", era: "July 1866", desc: "Transatlantic cable connected London and NYC exchanges, earning GBP/USD its nickname 'Cable'." },
    { title: "Fiber (EUR/USD) Revolution", key: "Telecom Networks", era: "1990s", desc: "Subsea fiber optic cables reduced trade execution times between Frankfurt and New York to milliseconds." },
    { title: "Aussie (AUD/USD) Float", key: "Bob Hawke & Paul Keating", era: "Dec 1983", desc: "Australia floated the AUD, transforming it into a primary global commodity currency." },
    { title: "Kiwi (NZD/USD) Deregulation", key: "Roger Douglas", era: "March 1985", desc: "New Zealand abolished exchange controls and floated NZD, birthing high-carry trading." },
    { title: "Loonie (CAD/USD) Parity", key: "Bank of Canada", era: "2007", desc: "Canadian Dollar reached parity with USD for the first time in 30 years driven by crude oil prices." },
    { title: "Swissie (USD/CHF) Safe Haven", key: "Swiss National Bank", era: "Ongoing", desc: "Swiss Franc established itself as the ultimate European geopolitical and economic safe haven." },
    { title: "Ninja (USD/JPY) Kuroda Bazooka", key: "Haruhiko Kuroda", era: "April 2013", desc: "BOJ doubled monetary base to devalue Yen, driving USD/JPY from 77 to 125." },
    { title: "Guppy (GBP/JPY) Volatility", key: "Interbank FX Desk", era: "Ongoing", desc: "Known as 'The Beast', GBP/JPY averages 150-300 pips of daily volatility." },
    { title: "Gold Standard Act of 1900", key: "William McKinley", era: "March 1900", desc: "Formally placed the United States on a single gold standard at $20.67 per troy ounce." },
    { title: "Coinage Act of 1792", key: "Alexander Hamilton", era: "April 1792", desc: "Created the United States Mint and established the USD based on silver and gold ratios." },
    { title: "Bank of England Foundation", key: "Charles Montagu", era: "July 1694", desc: "Founded to fund King William III's navy, establishing government bond markets." },
    { title: "Rothschild Telegraph Intelligence", key: "Nathan Rothschild", era: "June 1815", desc: "Courier pigeons delivered Battle of Waterloo news 24h before government, netting British bond gains." },
    { title: "Buttonwood Agreement", key: "24 Stockbrokers", era: "May 1792", desc: "Signed under a buttonwood tree outside 68 Wall Street, birthing the New York Stock Exchange." },
    { title: "Ralph Nelson Elliott Wave", key: "Ralph Nelson Elliott", era: "1938", desc: "Discovered 5-wave impulse and 3-wave corrective fractal patterns matching Fibonacci ratios." },
    { title: "W.D. Gann Geometric Angles", key: "W.D. Gann", era: "1920s", desc: "Pioneered 1x1 angle trends and time/price geometric square charts for commodity forecasting." },
    { title: "Munehisa Homma & Candlesticks", key: "Munehisa Homma", era: "1750", desc: "Japanese rice merchant who invented Candlestick charts and Sakata's 5 rules of market psychology." },
    { title: "Steve Nison West Candlesticks", key: "Steve Nison", era: "1991", desc: "Published 'Japanese Candlestick Charting Techniques', introducing Doji and Engulfing patterns to Western traders." },
    { title: "John Bollinger & Bands", key: "John Bollinger", era: "1980s", desc: "Invented adaptive volatility envelope bands placed 2 standard deviations above and below a moving average." },
    { title: "J. Welles Wilder & RSI", key: "J. Welles Wilder Jr.", era: "1978", desc: "Published 'New Concepts in Technical Trading Systems', introducing RSI, ATR, ADX, and Parabolic SAR." },
    { title: "Gerald Appel & MACD", key: "Gerald Appel", era: "1979", desc: "Created Moving Average Convergence Divergence tracking momentum crossover signals." },
    { title: "Chester Keltner Channels", key: "Chester Keltner", era: "1960", desc: "Introduced average true range volatility envelope channels around a 20-period moving average." },
    { title: "Richard Donchian Trend Following", key: "Richard Donchian", era: "1970s", desc: "Father of Trend Following who created 20-day high breakout channels used by Turtle Traders." },
    { title: "Turtle Traders Experiment", key: "Richard Dennis & William Eckhardt", era: "1983", desc: "Trained 14 novice traders mechanical breakout rules, earning over $175 Million in 5 years." },
    { title: "Ed Seykota Trend Systems", key: "Ed Seykota", era: "1970s", desc: "Pioneered computerized trend trading systems on early mainframe computers." },
    { title: "Ray Dalio Risk Parity", key: "Ray Dalio", era: "1996", desc: "Created Bridgewater's All-Weather portfolio balancing assets by risk contribution." },
    { title: "Jim Simons Medallion Fund", key: "Jim Simons", era: "1988", desc: "Renaissance Technologies generated 66% average annual returns using quantitative mathematical algorithms." },
    { title: "Paul Tudor Jones 1987 Short", key: "Paul Tudor Jones", era: "Oct 1987", desc: "Predicted Black Monday using historical 1929 fractal overlays, tripling his fund value in 1 day." },
    { title: "Stanley Druckenmiller Record", key: "Stanley Druckenmiller", era: "30-Year Streak", desc: "Achieved 30 consecutive years of positive returns without a single loss year at Duquesne Capital." },
    { title: "Michael Burry Subprime Short", key: "Michael Burry", era: "2005–2007", desc: "Scoured mortgage prospectuses to buy Credit Default Swaps, earning Scion Capital $725 Million." },
    { title: "John Paulson $15B Housing Short", key: "John Paulson", era: "2007", desc: "Executed the 'Greatest Trade Ever', netting $15 Billion shorting subprime mortgage debt." },
    { title: "Bill Ackman Activist Hedges", key: "Bill Ackman", era: "2020", desc: "Turned $27 Million credit default insurance into $2.6 Billion during March 2020 COVID crash." },
    { title: "Warren Buffett Currency Bets", key: "Warren Buffett", era: "2002–2005", desc: "Berkshire Hathaway placed $21 Billion long contracts on foreign currencies against the US Dollar." },
    { title: "Charlie Munger Mental Models", key: "Charlie Munger", era: "Lifetime", desc: "Advocated multidisciplinary mental models and inversion: 'Invert, always invert'." },
    { title: "Nassim Taleb Black Swan Hedging", key: "Nassim Nicholas Taleb", era: "2007", desc: "Author of 'The Black Swan' advocating anti-fragile tail-risk hedging for low probability events." },
    { title: "Mark Douglas Trading Psychology", key: "Mark Douglas", era: "1990", desc: "Author of 'Trading in the Zone', teaching traders to think in probabilities without emotional attachment." },
    { title: "Brett Steenbarger Performance", key: "Brett Steenbarger", era: "Ongoing", desc: "Performance psychologist coaching prop traders on emotional regulation and cognitive routines." },
    { title: "Alexander Elder Triple Screen", key: "Alexander Elder", era: "1986", desc: "Created Triple Screen trading system filtering daily trends with weekly momentum indicators." },
    { title: "Jack Schwager Market Wizards", key: "Jack Schwager", era: "1989", desc: "Published iconic interview book Series profiling top traders in Forex, commodities, and equities." },
    { title: "London Gold Pool Collapse", key: "8 Central Banks", era: "March 1968", desc: "Central bank pool failed to defend $35/oz gold against heavy private market buying." },
    { title: "Hunt Brothers Silver Corner", key: "Nelson & William Hunt", era: "Jan 1980", desc: "Amassed 1/3 of global private silver, driving prices from $6 to $50/oz before COMEX margin changes caused Silver Thursday." },
    { title: "Negative Crude Oil -$37.63", key: "WTI Crude Futures", era: "April 20, 2020", desc: "May WTI Crude contract plunged to negative -$37.63/bbl due to storage exhaustion during COVID lockdowns." },
    { title: "2020 COVID $3T Fed Printing", key: "Jerome Powell", era: "March 2020", desc: "Federal Reserve printed $3 Trillion in emergency liquidity, sparking the 2020-2021 global asset rally." },
    { title: "GameStop WallStreetBets Short Squeeze", key: "Retail Traders & Keith Gill", era: "Jan 2021", desc: "Retail traders squeezed Melvin Capital's GME short position, driving stock from $17 to $483." },
    { title: "Tether (USDT) Creation", key: "Brock Pierce & Reeve Collins", era: "Oct 2014", desc: "Launched Realcoin (later Tether), establishing fiat-backed stablecoins as primary crypto liquidity rails." },
    { title: "Uniswap Automated Market Maker", key: "Hayden Adams", era: "Nov 2018", desc: "Launched constant product formula (x * y = k) DEX, eliminating traditional order books for altcoins." },
    { title: "Satoshi's 1.1M Unspent Bitcoins", key: "Genesis Address", era: "2009–Present", desc: "Over 1.1 Million Bitcoins mined by Satoshi Nakamoto remain permanently dormant as cryptographic gold." },
  ];

  const t = extendedTopics[(i - 12) % extendedTopics.length];

  return {
    id: `histofact-${cardNum}`,
    cardNumber: cardNum,
    cardRank,
    suit,
    theme,
    title: `${t.title}`,
    era: t.era,
    category: cat,
    teaser: t.desc,
    image: `https://images.unsplash.com/photo-${1611974789855 + (i * 12345) % 100000}?auto=format&fit=crop&w=800&q=80`,
    badge: "Historical Fact",
    summary: `${t.title} (${t.era}): ${t.desc} Key figure: ${t.key}.`,
    details: [
      `Key Figure: ${t.key}`,
      `Historical Era: ${t.era}`,
      `Category: ${cat} Landmark`,
    ],
    takeaway: "Understanding past market structural shifts provides edge in modern trading.",
    impactLevel: i % 3 === 0 ? "Market Crash" : i % 3 === 1 ? "Historical Landmark" : "Systemic Shift",
    keyFigure: t.key,
  };
});
