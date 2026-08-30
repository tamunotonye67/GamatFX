export type Lesson = {
  id: string;
  title: string;
  duration: string;
  free?: boolean;
};

export type Module = {
  title: string;
  lessons: Lesson[];
};

export type Course = {
  id: string;
  tag: "Fundamental" | "Technical" | "Mentorship" | "Beginner";
  level: string;
  title: string;
  short: string;
  desc: string;
  duration: string;
  enrolled: number;
  rating: number;
  price: number;
  oldPrice?: number;
  featured?: boolean;
  poster: string;
  video: string;
  outcomes: string[];
  requirements: string[];
  modules: Module[];
};

const V1 = "https://videos.pexels.com/video-files/38484636/16343740_3840_2160_50fps.mp4";
const V2 = "https://videos.pexels.com/video-files/38581107/16386444_3840_2160_50fps.mp4";
const V3 = "https://videos.pexels.com/video-files/38358369/16288463_3840_2160_25fps.mp4";
const V4 = "https://videos.pexels.com/video-files/35606120/15089547_3840_2160_25fps.mp4";

const P1 = "https://images.pexels.com/videos/38484636/bitcoin-crypto-forex-hacker-38484636.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=720&w=1280";
const P2 = "https://images.pexels.com/videos/38581107/bitcoin-crypto-forex-hacker-38581107.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=720&w=1280";
const P3 = "https://images.pexels.com/videos/38358369/bitcoin-crypto-forex-hacker-38358369.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=720&w=1280";
const P4 = "https://images.pexels.com/videos/35606120/analysis-analytics-bitcoin-business-35606120.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=720&w=1280";

function mod(title: string, lessons: [string, string, boolean?][]): Module {
  return {
    title,
    lessons: lessons.map(([t, d, free], i) => ({
      id: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${i}`,
      title: t,
      duration: d,
      free,
    })),
  };
}

export const COURSES: Course[] = [
  {
    id: "fundamental-supply-demand",
    tag: "Fundamental",
    level: "Intermediate",
    title: "Fundamental & Supply and Demand",
    short: "Master the economic drivers behind price and the supply & demand model institutions actually trade.",
    desc: "Our flagship program. You'll learn to read the economic calendar, interpret central bank policy, and combine that macro bias with precise supply and demand zones on the chart. This is the exact framework our mentors trade every single week.",
    duration: "14hr 40min",
    enrolled: 7623,
    rating: 4.9,
    price: 99999,
    oldPrice: 149999,
    featured: true,
    poster: P1,
    video: V1,
    outcomes: ["Read and trade economic data releases", "Map institutional supply & demand zones", "Build a top-down fundamental bias", "Combine macro and technical confluence", "Manage news-event volatility safely"],
    requirements: ["A laptop or smartphone with internet", "A free MT4/MT5 or charting account", "No prior experience required"],
    modules: [
      mod("Getting Started", [["Welcome & how to use this course", "6:12", true], ["Setting up your charts", "11:40", true], ["The trader's mindset", "9:05"]]),
      mod("Market Fundamentals", [["What actually moves currency pairs", "14:22"], ["Reading the economic calendar", "18:35"], ["Interest rates & central banks", "21:10"], ["Inflation, CPI and NFP explained", "19:48"], ["Building a fundamental bias", "16:30"]]),
      mod("Supply & Demand", [["Anatomy of an institutional zone", "17:55"], ["Drawing zones correctly", "22:14"], ["Fresh vs tested zones", "13:20"], ["Multi-timeframe zone alignment", "20:05"]]),
      mod("Execution", [["Entry models & confirmation", "24:30"], ["Stop placement and sizing", "18:12"], ["Trade management & partials", "16:44"], ["Full live trade walkthrough", "28:50"]]),
    ],
  },
  {
    id: "forex-foundations",
    tag: "Beginner",
    level: "Beginner",
    title: "Forex Foundations",
    short: "Everything a complete beginner needs — platforms, order types, lot sizing and your first demo trades.",
    desc: "If you have never placed a trade before, start here. We cover how the forex market actually works, how to navigate MT4/MT5, what pips and lots really mean, and how to place your first trades safely on a demo account.",
    duration: "6hr 20min",
    enrolled: 2880,
    rating: 4.8,
    price: 39999,
    poster: P2,
    video: V2,
    outcomes: ["Navigate MT4, MT5 and charting platforms", "Understand pips, lots and leverage", "Place, modify and close trades safely", "Read basic candlestick structure", "Build your first trading routine"],
    requirements: ["No experience needed", "A device with internet access"],
    modules: [
      mod("Welcome", [["What is the forex market?", "10:05", true], ["Who moves the market", "12:18", true]]),
      mod("Platforms & Orders", [["Setting up MT4 / MT5", "15:22"], ["Chart platform essentials", "13:40"], ["Order types explained", "16:55"]]),
      mod("Position Sizing", [["Pips, lots and contract size", "14:10"], ["Leverage and margin safely", "17:30"], ["Your first demo trade", "19:02"]]),
    ],
  },
  {
    id: "price-action-mastery",
    tag: "Technical",
    level: "Intermediate",
    title: "Price Action Mastery",
    short: "Read candlesticks, market structure and liquidity like a professional desk trader.",
    desc: "Strip away the indicators. This course teaches you to read raw price — market structure, liquidity sweeps, order blocks and imbalance — so you can time precise entries with tight risk.",
    duration: "9hr 10min",
    enrolled: 3140,
    rating: 4.8,
    price: 74999,
    poster: P3,
    video: V3,
    outcomes: ["Identify true market structure shifts", "Trade liquidity sweeps and stop hunts", "Spot order blocks and imbalance", "Time precise low-risk entries"],
    requirements: ["Basic chart familiarity recommended", "Forex Foundations or equivalent"],
    modules: [
      mod("Structure", [["Highs, lows and real structure", "16:20", true], ["Break of structure vs liquidity grab", "19:45"], ["Trend, range and transition", "14:08"]]),
      mod("Liquidity", [["Where stops actually sit", "18:33"], ["Sweep and reverse model", "21:12"], ["Session liquidity patterns", "17:26"]]),
      mod("Entries", [["Order blocks explained", "20:14"], ["Imbalance and fair value gaps", "18:50"], ["Refining to lower timeframes", "22:35"]]),
    ],
  },
  {
    id: "risk-trade-management",
    tag: "Technical",
    level: "Advanced",
    title: "Risk & Trade Management",
    short: "The module most traders skip — and most blown accounts needed.",
    desc: "Position sizing, drawdown control, correlation risk and portfolio thinking. This is the course that keeps you in the game long enough for your edge to play out.",
    duration: "5hr 05min",
    enrolled: 1960,
    rating: 4.9,
    price: 49999,
    poster: P4,
    video: V4,
    outcomes: ["Size every position correctly", "Survive and recover from drawdown", "Manage correlated exposure", "Scale position size safely"],
    requirements: ["Some trading experience helpful"],
    modules: [
      mod("Risk Basics", [["Risk per trade and expectancy", "15:40", true], ["The maths of drawdown", "18:22"]]),
      mod("Advanced Control", [["Correlation and cluster risk", "16:15"], ["Scaling in and out", "19:30"], ["Building your risk rulebook", "21:05"]]),
    ],
  },
  {
    id: "pro-trader-mentorship",
    tag: "Mentorship",
    level: "All levels",
    title: "Pro Trader Mentorship",
    short: "Twelve weeks of live coaching, weekly reviews and direct mentor access.",
    desc: "Our most hands-on program. Twelve weeks of live sessions, personal trade reviews, a structured growth plan and direct access to mentors inside a private cohort of serious traders.",
    duration: "12 weeks",
    enrolled: 1205,
    rating: 5.0,
    price: 249999,
    oldPrice: 299999,
    poster: P1,
    video: V1,
    outcomes: ["Weekly one-on-one trade reviews", "Live session trading with mentors", "A personal growth and risk plan", "Cohort accountability and support"],
    requirements: ["Commitment of 5+ hours per week", "A funded or demo trading account"],
    modules: [
      mod("Onboarding", [["Cohort welcome & goal setting", "22:10", true], ["Your baseline trading audit", "18:40"]]),
      mod("Live Coaching", [["Week 1–4: Building the plan", "45:00"], ["Week 5–8: Execution under pressure", "48:20"], ["Week 9–12: Consistency & scaling", "51:15"]]),
      mod("Graduation", [["Final performance review", "30:25"], ["Your next 90 days", "24:10"]]),
    ],
  },
  {
    id: "funded-trader-prep",
    tag: "Mentorship",
    level: "Advanced",
    title: "Funded Trader Prep",
    short: "Pass prop firm evaluations with a rules-based plan built for challenge conditions.",
    desc: "Prop firm challenges fail traders on rules, not analysis. This program builds a challenge-specific plan around daily drawdown limits, consistency scoring and payout discipline.",
    duration: "8 weeks",
    enrolled: 740,
    rating: 4.9,
    price: 149999,
    poster: P2,
    video: V2,
    outcomes: ["Build a challenge-safe risk model", "Understand consistency scoring", "Manage daily drawdown limits", "Develop payout discipline"],
    requirements: ["Prior trading experience required", "Understanding of basic risk management"],
    modules: [
      mod("Challenge Rules", [["How prop firms really evaluate you", "20:15", true], ["Daily vs overall drawdown", "17:50"]]),
      mod("The Plan", [["Building your challenge plan", "24:30"], ["Consistency and lot sizing", "19:10"], ["Passing phase 1 and 2", "26:05"]]),
      mod("After Funding", [["Payout discipline", "18:20"], ["Scaling your funded account", "21:40"]]),
    ],
  },
];

export function getCourse(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id) || MENTORSHIP_PLANS[id];
}

export const MENTORSHIP_PLANS: Record<string, Course> = {
  "mentorship-starter": {
    id: "mentorship-starter",
    tag: "Mentorship",
    level: "Beginner to Intermediate",
    title: "Mentorship: Starter Package",
    short: "Perfect for beginners who want to learn the basics at their own pace with mentor support.",
    desc: "Includes Forex Fundamentals, Risk & Money Management, course community access, and 1-on-1 email support with GAMAT lead mentors.",
    duration: "1 Month",
    enrolled: 480,
    rating: 4.8,
    price: 30000,
    oldPrice: 45000,
    featured: false,
    poster: P1,
    video: V1,
    outcomes: ["Forex Fundamentals course", "Risk & Money Management module", "Course community access", "Email support", "30-day money back guarantee"],
    requirements: ["No experience required", "A device with internet connection"],
    modules: [
      mod("Starter Mentorship Onboarding", [["Welcome to Mentorship", "10:00", true], ["Setting up your learning path", "15:00"]]),
    ],
  },
  "mentorship-pro": {
    id: "mentorship-pro",
    tag: "Mentorship",
    level: "Intermediate to Advanced",
    title: "Mentorship: Pro Trader Package",
    short: "Our flagship mentorship plan. Everything you need to become consistently profitable.",
    desc: "Includes Price Action Mastery, Live Trading Room, Private WhatsApp & Discord, 2 x 1-on-1 coaching calls per month, and daily signal alerts.",
    duration: "3 Months",
    enrolled: 1205,
    rating: 5.0,
    price: 88000,
    oldPrice: 120000,
    featured: true,
    poster: P2,
    video: V2,
    outcomes: ["Price Action Mastery", "Live Trading Room (daily)", "Private WhatsApp & Discord", "2 x 1-on-1 calls per month", "Daily signal alerts"],
    requirements: ["Basic understanding of trading platforms"],
    modules: [
      mod("Pro Mentorship Onboarding", [["Live Market Access & WhatsApp Setup", "15:00", true], ["Personal Trade Journal Audit", "25:00"]]),
    ],
  },
  "mentorship-elite": {
    id: "mentorship-elite",
    tag: "Mentorship",
    level: "Advanced / Funded Trader",
    title: "Mentorship: Elite Package",
    short: "For serious traders ready to go full-time, pass prop firm challenges, or manage capital.",
    desc: "Includes 4 x 1-on-1 calls per month, Prop Firm Challenge Coaching, Weekly Portfolio Review, Dedicated Account Manager, and Lifetime course access.",
    duration: "6 Months",
    enrolled: 340,
    rating: 5.0,
    price: 158000,
    oldPrice: 220000,
    featured: true,
    poster: P3,
    video: V3,
    outcomes: ["4 x 1-on-1 calls per month", "Prop firm challenge coaching", "Weekly portfolio review", "Dedicated account manager", "Lifetime course access"],
    requirements: ["Dedicated trading routine & capital plan"],
    modules: [
      mod("Elite Mentorship Onboarding", [["Dedicated Account Executive Audit", "20:00", true], ["Prop Challenge Execution Plan", "30:00"]]),
    ],
  },
};

export function totalLessons(course: Course): number {
  return course.modules.reduce((n, m) => n + m.lessons.length, 0);
}

export function allLessons(course: Course): Lesson[] {
  return course.modules.flatMap((m) => m.lessons);
}

export const naira = (n: number) => `₦${n.toLocaleString()}`;

/** Loose shape accepted from admin-managed courses. */
export type AnyCourseInput = {
  id: string;
  title: string;
  short?: string;
  desc?: string;
  tag?: string;
  level?: string;
  duration?: string;
  price?: number;
  oldPrice?: number;
  featured?: boolean;
  poster?: string;
  video?: string;
  outcomes?: string[];
  requirements?: string[];
  modules?: { title: string; lessons: { id: string; title: string; duration: string; free?: boolean; videoUrl?: string }[] }[];
  enrolled?: number;
  rating?: number;
};

/** Normalise a managed course into the shared Course shape used by detail/checkout/learn. */
export function asCourse(c: AnyCourseInput): Course {
  const modules = (c.modules ?? []).map((m, mi) => {
    const rawTitle = (m.title ?? "").trim();
    const cleanTitle =
      rawTitle && rawTitle.toLowerCase() !== "module"
        ? rawTitle
        : `Module ${mi + 1}: Core Concepts`;
    return {
      title: cleanTitle,
      lessons: (m.lessons ?? []).map((l, li) => ({
        id: l.id || `${c.id}-m${mi}-l${li}`,
        title: (l.title ?? "").trim() || `Lesson ${li + 1}`,
        duration: l.duration || "10:00",
        free: !!l.free,
        // Carry optional video for the player via a side channel on the object.
        ...(l.videoUrl ? { videoUrl: l.videoUrl } as object : {}),
      })),
    };
  });

  return {
    id: c.id,
    tag: (c.tag as Course["tag"]) || "Fundamental",
    level: c.level || "All levels",
    title: c.title,
    short: c.short || c.desc || "",
    desc: c.desc || c.short || "",
    duration: c.duration || "Self-paced",
    enrolled: c.enrolled ?? 0,
    rating: c.rating ?? 5,
    price: c.price ?? 0,
    oldPrice: c.oldPrice,
    featured: !!c.featured,
    poster: c.poster || "/images/about-hero.jpg",
    video: c.video || V1,
    outcomes: c.outcomes ?? [],
    requirements: c.requirements ?? [],
    modules: modules.length
      ? modules
      : [{ title: "Getting Started", lessons: [{ id: `${c.id}-intro`, title: "Welcome", duration: "05:00", free: true }] }],
  };
}

/** Lesson may carry an optional per-lesson video URL from the course manager. */
export type LessonWithVideo = Lesson & { videoUrl?: string };
