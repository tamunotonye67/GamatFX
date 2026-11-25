export type RoleGuide = {
  slug: string;
  category: string;
  categoryId: string;
  title: string;
  subtitle: string;
  engagementType: string;
  weeklyHours: string;
  overview: string;
  whatTheyDo: string;
  responsibilities: string[];
  requirements: string[];
  tracks: {
    name: string;
    commitment: string;
    level: string;
    points: string[];
  }[];
  faqs: { q: string; a: string }[];
};

export function slugifyRoleTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const DEFAULT_FAQS = [
  {
    q: "Is this a volunteering role or a paid position?",
    a: "Most entry and contributor tracks at GAMAT Fx start as structured volunteering fellowships—giving you real production experience, direct mentorship, and full academy access. High-impact contributors are prioritized first when paid stipends or full-time contracts open up.",
  },
  {
    q: "How many hours per week are expected?",
    a: "Typically 5 to 12 hours per week on a flexible, remote-first schedule. We care about shipped milestones and reliability rather than clocking hours at a desk.",
  },
  {
    q: "What perks do GAMAT Fx volunteers receive?",
    a: "Verified experience certificates, portfolio-ready real-world projects, complimentary access to GAMAT Fx courses and live market sessions, a formal recommendation letter, and priority consideration for paid roles.",
  },
  {
    q: "Do I need prior trading experience to volunteer?",
    a: "For Trading & Analysis roles, yes—we look for real chart experience and risk discipline. For Engineering, Design, Marketing, Writing, and Support roles, strong craft in your specialty matters most; we'll teach you the trading context.",
  },
];

export const ROLE_GUIDES: RoleGuide[] = [
  // Dev & IT
  {
    slug: "react-and-typescript-engineers",
    category: "Dev & IT",
    categoryId: "Dev & IT",
    title: "React & TypeScript Engineers",
    subtitle: "Dashboard & Web App",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "6–12 hrs / week",
    overview:
      "Help build and refine the GAMAT Fx student dashboard, interactive learning modules, and responsive web experiences used by traders daily.",
    whatTheyDo:
      "As a volunteer React & TypeScript Engineer at GAMAT Fx, you collaborate directly with product leadership to ship fast, clean interfaces in React 19, TypeScript, and Tailwind CSS.",
    responsibilities: [
      "Build responsive UI components for the student dashboard, events, and trading tools",
      "Improve mobile responsiveness, accessibility, and page load performance",
      "Collaborate via GitHub pull requests with clean, maintainable TypeScript",
      "Fix UI bugs and polish interactive flows based on real student feedback",
    ],
    requirements: [
      "Solid grasp of React, TypeScript, and modern CSS / Tailwind",
      "Familiarity with Git/GitHub workflows",
      "Eye for clean spacing, mobile layouts, and user experience",
    ],
    tracks: [
      {
        name: "UI & Component Contributor",
        commitment: "5–8 hrs / week",
        level: "Junior to Intermediate",
        points: ["Responsive Tailwind layouts", "Dashboard cards & modals", "Bug fixes & UI polish"],
      },
      {
        name: "Feature & State Engineer",
        commitment: "8–12 hrs / week",
        level: "Intermediate",
        points: ["End-to-end feature flows", "Supabase data integration", "Performance optimization"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "mql5-and-ea-developers",
    category: "Dev & IT",
    categoryId: "Dev & IT",
    title: "MQL5 & EA Developers",
    subtitle: "MT5 Bots & Indicators",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "6–10 hrs / week",
    overview:
      "Develop custom MetaTrader 5 indicators, risk calculators, and rule-based Expert Advisors that bring GAMAT Fx's institutional concepts onto live charts.",
    whatTheyDo:
      "You translate Smart Money Concepts (liquidity sweeps, FVGs, session highs/lows, and risk management rules) into reliable MQL5 tools for our student store and community.",
    responsibilities: [
      "Code clean, low-latency MQL5 indicators and utility panels",
      "Build automated risk-sizing and trade-management EAs",
      "Backtest and debug scripts across Forex pairs, Gold, and Indices",
      "Document installation and parameter guides for students",
    ],
    requirements: [
      "Experience writing MQL5 / MQL4 indicators or Expert Advisors",
      "Understanding of order types, spread, slippage, and risk-to-reward",
    ],
    tracks: [
      {
        name: "Indicator & Utility Builder",
        commitment: "5–8 hrs / week",
        level: "Intermediate",
        points: ["Session & liquidity indicators", "On-chart R:R panels", "Clean user inputs"],
      },
      {
        name: "EA & Automation Lead",
        commitment: "8–12 hrs / week",
        level: "Intermediate to Expert",
        points: ["Rule-based EA execution", "Strategy Tester validation", "Trade manager utilities"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "supabase-and-api-engineers",
    category: "Dev & IT",
    categoryId: "Dev & IT",
    title: "Supabase & API Engineers",
    subtitle: "Auth, Sync & Payments",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "6–10 hrs / week",
    overview:
      "Strengthen the data backbone of GAMAT Fx—ensuring reliable authentication, real-time sync, and serverless API endpoints.",
    whatTheyDo:
      "You work on Supabase PostgreSQL queries, row-level security, Vercel serverless functions, and cross-device persistence for student progress and admin workflows.",
    responsibilities: [
      "Maintain and optimize Supabase tables, RLS policies, and real-time channels",
      "Build reliable serverless API routes for notifications, webhooks, and emails",
      "Ensure data integrity across student enrollments, certificates, and logs",
    ],
    requirements: [
      "Experience with PostgreSQL / Supabase or REST APIs",
      "Comfort with TypeScript / Node.js serverless functions",
    ],
    tracks: [
      {
        name: "Backend & Data Contributor",
        commitment: "6–10 hrs / week",
        level: "Intermediate",
        points: ["Supabase queries & RLS", "Serverless API endpoints", "Error logging & reliability"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "interactive-canvas-engineers",
    category: "Dev & IT",
    categoryId: "Dev & IT",
    title: "Interactive Canvas Engineers",
    subtitle: "Chart & Whiteboard Tools",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "6–10 hrs / week",
    overview:
      "Enhance the GAMAT Fx Whiteboard Hub and interactive chart simulation tools used by mentors and students during live breakdowns.",
    whatTheyDo:
      "You refine HTML5 Canvas / SVG drawing tools, candlestick replay mechanics, and Risk:Reward measurement widgets.",
    responsibilities: [
      "Improve drawing precision, snap-to-level, and touch support on the Whiteboard",
      "Optimize canvas rendering performance on desktop and mobile",
      "Add institutional markup templates (FVG, Order Blocks, Liquidity Pools)",
    ],
    requirements: [
      "Experience with HTML5 Canvas, SVG, or interactive React graphics",
      "Strong math/coordinate-geometry intuition",
    ],
    tracks: [
      {
        name: "Canvas & Charting Contributor",
        commitment: "6–10 hrs / week",
        level: "Intermediate",
        points: ["HTML5 Canvas drawing tools", "Touch & mobile gestures", "SMC markup presets"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "qa-and-reliability-engineers",
    category: "Dev & IT",
    categoryId: "Dev & IT",
    title: "QA & Reliability Engineers",
    subtitle: "Testing & Performance",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "4–8 hrs / week",
    overview:
      "Keep every student flow—from signup and checkout to live check-ins and certificates—bug-free across mobile and desktop.",
    whatTheyDo:
      "You systematically test new releases, reproduce edge cases, verify mobile layouts, and help maintain zero-regression deployments.",
    responsibilities: [
      "Test new features across iOS Safari, Android Chrome, and Desktop browsers",
      "Document clear bug reports with screenshots and reproduction steps",
      "Verify checkout, authentication, and dashboard flows before launches",
    ],
    requirements: [
      "Strong attention to detail and structured testing mindset",
      "Ability to inspect browser console/network errors",
    ],
    tracks: [
      {
        name: "Manual & Mobile QA",
        commitment: "4–6 hrs / week",
        level: "Entry to Intermediate",
        points: ["Cross-device UI checks", "Release smoke testing", "Clear bug reproduction"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },

  // Trading & Analysis
  {
    slug: "senior-fx-market-analysts",
    category: "Trading & Analysis",
    categoryId: "Trading",
    title: "Senior FX Market Analysts",
    subtitle: "London & NY Sessions",
    engagementType: "Volunteer / Revenue-Share Track · Remote",
    weeklyHours: "6–10 hrs / week",
    overview:
      "Deliver clear, disciplined pre-session market breakdowns and help students understand institutional order flow without hype.",
    whatTheyDo:
      "You prepare structured top-down outlooks on major pairs (EURUSD, GBPUSD, XAUUSD, DXY) and walk students through why setups qualify or get invalidated.",
    responsibilities: [
      "Publish weekly & daily institutional market outlooks with clear invalidation levels",
      "Break down London and New York session liquidity sweeps and HTF bias",
      "Emphasize risk management (1% max risk, strict R:R) in every analysis",
    ],
    requirements: [
      "Consistent track record with SMC / Price Action / Institutional Order Flow",
      "Ability to explain setups clearly without signal-selling hype",
    ],
    tracks: [
      {
        name: "Session Market Analyst",
        commitment: "6–10 hrs / week",
        level: "Intermediate to Expert",
        points: ["Daily HTF markups", "Pre-London/NY outlooks", "Risk-first commentary"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "1-on-1-trading-mentors",
    category: "Trading & Analysis",
    categoryId: "Trading",
    title: "1-on-1 Trading Mentors",
    subtitle: "Trade Journal Audits",
    engagementType: "Volunteer / Stipend Track · Remote",
    weeklyHours: "5–8 hrs / week",
    overview:
      "Guide developing traders by auditing their Trade Journal entries, spotting emotional leaks, and reinforcing rule-based execution.",
    whatTheyDo:
      "You review student trades, give constructive written or 1-on-1 call feedback, and help them stay accountable to their trading plan.",
    responsibilities: [
      "Review student Trade Journal submissions (entry, SL, TP, R:R, and notes)",
      "Host 1-on-1 coaching check-ins to correct overtrading and revenge trading",
      "Track student progress toward quiz and live-session readiness",
    ],
    requirements: [
      "2+ years live market experience with strong emotional discipline",
      "Patient, encouraging, and direct coaching style",
    ],
    tracks: [
      {
        name: "Journal & Mindset Mentor",
        commitment: "5–8 hrs / week",
        level: "Intermediate to Expert",
        points: ["Trade journal reviews", "1-on-1 accountability calls", "Psychology coaching"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "live-session-hosts",
    category: "Trading & Analysis",
    categoryId: "Trading",
    title: "Live Session Hosts",
    subtitle: "Order Flow & Liquidity",
    engagementType: "Volunteer / Stipend Track · Remote",
    weeklyHours: "4–8 hrs / week",
    overview:
      "Co-host weekly live market sessions where students watch price action unfold in real time and learn patience before entering.",
    whatTheyDo:
      "You run live TradingView / GAMAT Whiteboard sessions, answer student questions on the spot, and demonstrate real-time execution discipline.",
    responsibilities: [
      "Lead or co-host 1–2 weekly live trading workshops",
      "Walk through real-time liquidity sweeps, BOS/CHoCH, and entry triggers",
      "Coordinate live check-in codes and Q&A during sessions",
    ],
    requirements: [
      "Confident live speaking and screen-sharing presence",
      "Deep familiarity with multi-timeframe execution",
    ],
    tracks: [
      {
        name: "Live Workshop Host",
        commitment: "4–8 hrs / week",
        level: "Intermediate to Expert",
        points: ["Live chart breakdowns", "Interactive student Q&A", "Session recaps"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "prop-and-risk-coaches",
    category: "Trading & Analysis",
    categoryId: "Trading",
    title: "Prop & Risk Coaches",
    subtitle: "Drawdown & Scaling",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "4–6 hrs / week",
    overview:
      "Help graduating students pass prop firm challenges and protect live capital through strict position sizing and drawdown rules.",
    whatTheyDo:
      "You audit student risk models, help them size lots accurately, and coach them through evaluation phases without blowing daily drawdown limits.",
    responsibilities: [
      "Review student risk-per-trade and daily loss cap plans",
      "Coach challenge candidates on consistency and payout rules",
      "Contribute risk-management templates and calculators",
    ],
    requirements: [
      "Experience passing or managing funded prop accounts",
      "Strong mathematical grasp of risk-of-ruin and R-multiples",
    ],
    tracks: [
      {
        name: "Funded Challenge Coach",
        commitment: "4–6 hrs / week",
        level: "Intermediate to Expert",
        points: ["Drawdown protection plans", "Lot-size & R:R audits", "Challenge readiness reviews"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "daily-outlook-strategists",
    category: "Trading & Analysis",
    categoryId: "Trading",
    title: "Daily Outlook Strategists",
    subtitle: "Macro & HTF Bias",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "4–8 hrs / week",
    overview:
      "Prepare concise daily macro and fundamental briefs so students never get caught off-guard by high-impact news releases.",
    whatTheyDo:
      "You track economic calendar events (CPI, NFP, FOMC, central bank rates) and pair them with higher-timeframe technical levels for the Daily Outlook feed.",
    responsibilities: [
      "Summarize key high-impact news catalysts before London/NY open",
      "Publish clean Daily Outlook cards inside the GAMAT Fx platform",
      "Highlight correlated asset behavior (DXY vs. EURUSD & XAUUSD)",
    ],
    requirements: [
      "Strong understanding of FX fundamentals and macro drivers",
      "Clear, concise written synthesis",
    ],
    tracks: [
      {
        name: "Macro & Calendar Analyst",
        commitment: "4–8 hrs / week",
        level: "Entry to Intermediate",
        points: ["Daily news briefs", "HTF key level maps", "DXY correlation notes"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },

  // Design & Creative
  {
    slug: "short-form-video-editors",
    category: "Design & Creative",
    categoryId: "Design",
    title: "Short-Form Video Editors",
    subtitle: "Reels, TikTok & Shorts",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "5–10 hrs / week",
    overview:
      "Turn raw live trading breakdowns and mentor insights into crisp, high-retention Reels, TikToks, and YouTube Shorts.",
    whatTheyDo:
      "You edit vertical clips with clean captions, chart callouts, and sharp pacing that reflect GAMAT Fx's premium, no-hype brand.",
    responsibilities: [
      "Edit 3–5 short-form clips per week from live session recordings",
      "Add clean kinetic typography, sound design, and chart highlights",
      "Maintain consistent GAMAT Fx visual branding",
    ],
    requirements: [
      "Proficiency in CapCut Pro, Premiere Pro, or DaVinci Resolve",
      "Portfolio of short-form educational or creator edits",
    ],
    tracks: [
      {
        name: "Short-Form Content Editor",
        commitment: "5–10 hrs / week",
        level: "Entry to Intermediate",
        points: ["Reels & TikTok pacing", "Clean subtitle styling", "Chart B-roll integration"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "motion-and-remotion-designers",
    category: "Design & Creative",
    categoryId: "Design",
    title: "Motion & Remotion Designers",
    subtitle: "Product Walkthroughs",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "5–10 hrs / week",
    overview:
      "Create smooth animated explainers, Remotion compositions, and product walkthroughs showcasing GAMAT Fx's platform and trading concepts.",
    whatTheyDo:
      "You design clean motion graphics, animated UI mockups, and visual storytelling pieces for courses and landing pages.",
    responsibilities: [
      "Animate clean product walkthroughs and concept explainers",
      "Work with After Effects or Remotion (React) for data-driven animations",
      "Keep motion calm, intentional, and readable",
    ],
    requirements: [
      "Experience with After Effects, Lottie, or Remotion",
      "Strong sense of timing and minimal typography",
    ],
    tracks: [
      {
        name: "Motion & Explainer Designer",
        commitment: "5–10 hrs / week",
        level: "Intermediate",
        points: ["UI cursor animations", "Concept explainers", "Clean transitions"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "ui-and-product-designers",
    category: "Design & Creative",
    categoryId: "Design",
    title: "UI / Product Designers",
    subtitle: "Trading Tools & UX",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "5–8 hrs / week",
    overview:
      "Shape intuitive interfaces for our student dashboard, Trade Journal, and interactive learning tools.",
    whatTheyDo:
      "You design Figma wireframes, mobile-first layouts, and clean component specs that make complex trading workflows effortless.",
    responsibilities: [
      "Audit existing pages for mobile usability and visual hierarchy",
      "Design clean Figma prototypes for new student and admin features",
      "Collaborate directly with frontend engineers during implementation",
    ],
    requirements: [
      "Strong Figma portfolio showing web & mobile UI systems",
      "Understanding of clean spacing, contrast, and typography",
    ],
    tracks: [
      {
        name: "Product UI Designer",
        commitment: "5–8 hrs / week",
        level: "Entry to Intermediate",
        points: ["Mobile-first Figma flows", "Design system consistency", "Developer handoff"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "brand-and-social-designers",
    category: "Design & Creative",
    categoryId: "Design",
    title: "Brand & Social Designers",
    subtitle: "Thumbnails & Visuals",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "4–8 hrs / week",
    overview:
      "Craft high-CTR YouTube thumbnails, Instagram carousels, and educational infographics that stand out in crowded feeds.",
    whatTheyDo:
      "You translate trading concepts and academy announcements into sharp visual carousels and thumbnails.",
    responsibilities: [
      "Design YouTube thumbnails for weekly market breakdowns",
      "Create educational Instagram/X carousels and quote graphics",
      "Keep all assets aligned with GAMAT Fx's red, ink, and cream palette",
    ],
    requirements: [
      "Proficiency in Figma, Photoshop, or Illustrator",
      "Portfolio of social carousels or YouTube thumbnails",
    ],
    tracks: [
      {
        name: "Social & Thumbnail Designer",
        commitment: "4–8 hrs / week",
        level: "Entry to Intermediate",
        points: ["YouTube thumbnails", "Educational carousels", "Brand templates"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "event-and-bootcamp-creatives",
    category: "Design & Creative",
    categoryId: "Design",
    title: "Event & Bootcamp Creatives",
    subtitle: "Flyers & Certificates",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "4–6 hrs / week",
    overview:
      "Design promotional graphics, event banners, and digital credentials for GAMAT Fx workshops, scholarships, and live bootcamps.",
    whatTheyDo:
      "You prepare cohesive launch kits for upcoming events, speaker announcements, and student recognition spotlights.",
    responsibilities: [
      "Create event hero banners, flyers, and countdown graphics",
      "Design Student of the Week and graduation spotlight visuals",
      "Coordinate launch assets with the Events & Operations team",
    ],
    requirements: [
      "Strong layout and typography skills in Figma / Photoshop / Canva Pro",
    ],
    tracks: [
      {
        name: "Event Visual Designer",
        commitment: "4–6 hrs / week",
        level: "Entry to Intermediate",
        points: ["Bootcamp launch kits", "Speaker & event flyers", "Spotlight cards"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },

  // Marketing
  {
    slug: "paid-ads-and-funnel-specialists",
    category: "Marketing",
    categoryId: "Marketing",
    title: "Paid Ads & Funnel Specialists",
    subtitle: "Meta & YouTube Ads",
    engagementType: "Volunteer / Performance Track · Remote",
    weeklyHours: "5–10 hrs / week",
    overview:
      "Help scale ethical, high-converting acquisition campaigns for GAMAT Fx workshops, scholarships, and mentorship programs.",
    whatTheyDo:
      "You structure ad tests, analyze conversion metrics, and refine landing page messaging to bring committed students into the academy.",
    responsibilities: [
      "Plan and audit Meta, Instagram, and YouTube ad campaigns",
      "Track CPL, registration rates, and funnel drop-offs",
      "Collaborate with creatives on ad hooks and landing pages",
    ],
    requirements: [
      "Hands-on experience with Meta Ads Manager or Google/YouTube Ads",
      "Data-driven approach to creative testing",
    ],
    tracks: [
      {
        name: "Performance Marketing Volunteer",
        commitment: "5–10 hrs / week",
        level: "Intermediate",
        points: ["Ad campaign structure", "Funnel analytics", "A/B hook testing"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "affiliate-and-partner-managers",
    category: "Marketing",
    categoryId: "Marketing",
    title: "Affiliate & Partner Managers",
    subtitle: "Creator & IB Growth",
    engagementType: "Volunteer / Commission Track · Remote",
    weeklyHours: "5–8 hrs / week",
    overview:
      "Grow GAMAT Fx's affiliate and partner network by onboarding aligned trading creators, campus ambassadors, and community leaders.",
    whatTheyDo:
      "You recruit partners, support them with referral assets, and track performance inside the GAMAT Fx Affiliate dashboard.",
    responsibilities: [
      "Identify and reach out to aligned trading educators and creators",
      "Help partners set up their referral links and promo kits",
      "Monitor partner conversions and organize community campaigns",
    ],
    requirements: [
      "Strong relationship-building and outreach skills",
      "Familiarity with creator or affiliate partnerships",
    ],
    tracks: [
      {
        name: "Partner Growth Coordinator",
        commitment: "5–8 hrs / week",
        level: "Entry to Intermediate",
        points: ["Creator outreach", "Ambassador onboarding", "Referral campaign tracking"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "email-broadcast-strategists",
    category: "Marketing",
    categoryId: "Marketing",
    title: "Email Broadcast Strategists",
    subtitle: "Retention & Launches",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "4–6 hrs / week",
    overview:
      "Keep students engaged and informed through well-timed event reminders, market digests, and program updates.",
    whatTheyDo:
      "You plan email sequences and segment broadcasts inside our Admin Email Broadcast console to maximize workshop attendance and course completion.",
    responsibilities: [
      "Craft weekly academy digests and event reminder campaigns",
      "Segment audiences (students, event registrants, newsletter subscribers)",
      "Monitor open rates and refine subject lines",
    ],
    requirements: [
      "Experience with email marketing tools and lifecycle messaging",
      "Clear, trustworthy writing voice",
    ],
    tracks: [
      {
        name: "Lifecycle Email Coordinator",
        commitment: "4–6 hrs / week",
        level: "Entry to Intermediate",
        points: ["Event reminder flows", "Weekly academy digests", "Audience segmentation"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "social-media-managers",
    category: "Marketing",
    categoryId: "Marketing",
    title: "Social Media Managers",
    subtitle: "IG, X & YouTube",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "5–10 hrs / week",
    overview:
      "Own GAMAT Fx's daily social presence across Instagram, X (Twitter), TikTok, and YouTube—building an authentic trading community.",
    whatTheyDo:
      "You schedule posts, engage with comments and DMs, and turn student wins and mentor lessons into consistent daily content.",
    responsibilities: [
      "Manage the weekly content calendar across IG, X, and YouTube",
      "Engage with community replies and route student questions",
      "Track content reach and follower growth trends",
    ],
    requirements: [
      "Active understanding of IG Reels, X threads, and YouTube Shorts",
      "Consistent, responsive communication style",
    ],
    tracks: [
      {
        name: "Social & Community Manager",
        commitment: "5–10 hrs / week",
        level: "Entry to Intermediate",
        points: ["Content scheduling", "Audience engagement", "Trend & analytics tracking"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "seo-and-growth-analysts",
    category: "Marketing",
    categoryId: "Marketing",
    title: "SEO & Growth Analysts",
    subtitle: "Organic Search Traffic",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "4–6 hrs / week",
    overview:
      "Drive sustainable organic traffic to GAMAT Fx's blog, courses, and free resources through smart search optimization.",
    whatTheyDo:
      "You research high-intent forex education keywords, optimize article metadata, and track search performance.",
    responsibilities: [
      "Audit blog articles, course pages, and meta tags for search visibility",
      "Build keyword briefs for Trading & Content writers",
      "Monitor analytics and organic conversion paths",
    ],
    requirements: [
      "Familiarity with on-page SEO, Google Search Console, or analytics tools",
    ],
    tracks: [
      {
        name: "Organic Growth Analyst",
        commitment: "4–6 hrs / week",
        level: "Entry to Intermediate",
        points: ["Keyword research", "On-page optimization", "Search analytics"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },

  // Admin & Support
  {
    slug: "student-success-leads",
    category: "Admin & Support",
    categoryId: "Admin",
    title: "Student Success Leads",
    subtitle: "Onboarding & Support",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "5–10 hrs / week",
    overview:
      "Ensure every new student feels welcomed, onboarded, and supported from day one inside the GAMAT Fx portal.",
    whatTheyDo:
      "You answer student enquiries, guide newcomers through their dashboard, and help resolve enrollment or access questions.",
    responsibilities: [
      "Respond warmly to student enquiries and onboarding questions",
      "Guide students on accessing courses, Trade Journal, and live check-ins",
      "Flag recurring student pain points to the product team",
    ],
    requirements: [
      "Empathetic, clear written communication",
      "Organized and reliable follow-through",
    ],
    tracks: [
      {
        name: "Student Onboarding Specialist",
        commitment: "5–10 hrs / week",
        level: "Entry to Intermediate",
        points: ["Welcome & onboarding", "Enquiry resolution", "Student check-ins"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "community-moderators",
    category: "Admin & Support",
    categoryId: "Admin",
    title: "Community Moderators",
    subtitle: "Forum & Trading Floor",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "4–8 hrs / week",
    overview:
      "Keep the GAMAT Fx Student Forum constructive, spam-free, and focused on disciplined trading growth.",
    whatTheyDo:
      "You welcome new members, encourage thoughtful chart discussions, and enforce community guidelines against spam or signal-hawking.",
    responsibilities: [
      "Moderate daily threads inside the Student Forum",
      "Spark healthy discussions around weekly outlooks and trade reviews",
      "Escalate technical or account issues to staff",
    ],
    requirements: [
      "Active presence and positive, fair moderation style",
      "Basic familiarity with forex terminology",
    ],
    tracks: [
      {
        name: "Forum & Floor Moderator",
        commitment: "4–8 hrs / week",
        level: "Entry",
        points: ["Thread moderation", "Member engagement", "Anti-spam enforcement"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "event-ops-coordinators",
    category: "Admin & Support",
    categoryId: "Admin",
    title: "Event Ops Coordinators",
    subtitle: "Workshops & Check-Ins",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "4–8 hrs / week",
    overview:
      "Coordinate smooth live workshops, bootcamps, and scholarship cohorts from registration to attendance certification.",
    whatTheyDo:
      "You manage event schedules, generate live check-in codes, assist attendees, and verify attendance certificates.",
    responsibilities: [
      "Set up event listings and session check-in codes in Admin",
      "Coordinate speaker/mentor readiness before live workshops",
      "Verify multi-day attendance logs and certificate eligibility",
    ],
    requirements: [
      "Strong organizational and time-management skills",
      "Calm under live-event timelines",
    ],
    tracks: [
      {
        name: "Workshop Operations Volunteer",
        commitment: "4–8 hrs / week",
        level: "Entry to Intermediate",
        points: ["Live check-in management", "Attendee support", "Certificate verification"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "billing-and-enrollment-support",
    category: "Admin & Support",
    categoryId: "Admin",
    title: "Billing & Enrollment Support",
    subtitle: "Invoices & Access",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "4–6 hrs / week",
    overview:
      "Assist students with course checkout, discount coupons, receipts, and instant enrollment verification.",
    whatTheyDo:
      "You help verify payment references, issue receipts, and ensure students receive prompt access to their purchased courses or tools.",
    responsibilities: [
      "Verify payment confirmations and resolve checkout questions",
      "Assist with coupon codes, wallet credits, and invoice requests",
      "Coordinate closely with Admin operations",
    ],
    requirements: [
      "High integrity, accuracy with numbers, and clear communication",
    ],
    tracks: [
      {
        name: "Enrollment Support Volunteer",
        commitment: "4–6 hrs / week",
        level: "Entry to Intermediate",
        points: ["Payment verification", "Receipt support", "Access troubleshooting"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "executive-operations",
    category: "Admin & Support",
    categoryId: "Admin",
    title: "Executive Operations",
    subtitle: "Scheduling & Admin",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "5–8 hrs / week",
    overview:
      "Support GAMAT Fx leadership with calendar coordination, team documentation, and cross-department follow-ups.",
    whatTheyDo:
      "You keep projects moving on time—organizing meeting notes, tracking team action items, and coordinating mentor schedules.",
    responsibilities: [
      "Coordinate weekly leadership and mentor team syncs",
      "Maintain clean internal SOPs and project checklists",
      "Follow up on cross-team deliverables",
    ],
    requirements: [
      "Highly organized, proactive, and discreet",
      "Comfort with Notion, Google Workspace, and async tools",
    ],
    tracks: [
      {
        name: "Operations & Admin Fellow",
        commitment: "5–8 hrs / week",
        level: "Entry to Intermediate",
        points: ["Calendar & sync ops", "SOP documentation", "Task tracking"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },

  // Writing & Content
  {
    slug: "trading-curriculum-writers",
    category: "Writing & Content",
    categoryId: "Writing",
    title: "Trading Curriculum Writers",
    subtitle: "Workbooks & Playbooks",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "5–8 hrs / week",
    overview:
      "Turn institutional trading frameworks into crystal-clear PDF workbooks, checklists, and structured lesson notes.",
    whatTheyDo:
      "You collaborate with mentors to document trading models, risk rules, and step-by-step execution playbooks for students.",
    responsibilities: [
      "Write structured lesson summaries and downloadable PDF workbooks",
      "Create pre-trade mechanical checklists for students",
      "Simplify complex market concepts without losing accuracy",
    ],
    requirements: [
      "Strong educational writing skills and trading literacy",
    ],
    tracks: [
      {
        name: "Curriculum & Playbook Writer",
        commitment: "5–8 hrs / week",
        level: "Intermediate",
        points: ["PDF workbooks", "Execution checklists", "Lesson guides"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "market-news-and-blog-editors",
    category: "Writing & Content",
    categoryId: "Writing",
    title: "Market News & Blog Editors",
    subtitle: "Daily FX Commentary",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "4–8 hrs / week",
    overview:
      "Write and edit insightful articles on trading psychology, risk management, and global macro events for the GAMAT Fx Blog & News hub.",
    whatTheyDo:
      "You publish well-researched, readable posts that educate aspiring traders and build authority for the academy.",
    responsibilities: [
      "Publish 2–3 well-structured blog or news articles weekly",
      "Edit mentor drafts for clarity, flow, and readability",
      "Cover major central bank decisions and market themes",
    ],
    requirements: [
      "Strong editorial English and research skills",
      "Interest in financial markets and trader psychology",
    ],
    tracks: [
      {
        name: "Editorial & News Contributor",
        commitment: "4–8 hrs / week",
        level: "Entry to Intermediate",
        points: ["Blog articles", "Macro news summaries", "Editorial proofreading"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "youtube-and-course-scriptwriters",
    category: "Writing & Content",
    categoryId: "Writing",
    title: "YouTube & Course Scriptwriters",
    subtitle: "Educational Scripts",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "4–8 hrs / week",
    overview:
      "Craft engaging, structured scripts for YouTube breakdowns, course modules, and academy explainer videos.",
    whatTheyDo:
      "You structure hooks, clear visual cues, and concise teaching points so our mentors and editors can record and ship effortlessly.",
    responsibilities: [
      "Write engaging video scripts for YouTube and short-form clips",
      "Structure course module scripts with clear learning outcomes",
      "Collaborate with video editors on visual B-roll cues",
    ],
    requirements: [
      "Portfolio of educational or YouTube scripts",
    ],
    tracks: [
      {
        name: "Video Scriptwriter",
        commitment: "4–8 hrs / week",
        level: "Entry to Intermediate",
        points: ["YouTube hooks & scripts", "Course narration scripts", "Visual cue notes"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "email-and-launch-copywriters",
    category: "Writing & Content",
    categoryId: "Writing",
    title: "Email & Launch Copywriters",
    subtitle: "Campaign Messaging",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "4–6 hrs / week",
    overview:
      "Write clear, persuasive, zero-hype copy for event launches, mentorship intakes, and community announcements.",
    whatTheyDo:
      "You craft landing page copy, email announcements, and student-facing messaging that communicates real value honestly.",
    responsibilities: [
      "Write launch emails and event invitation copy",
      "Refine website headlines and product descriptions",
      "Maintain an authoritative yet approachable brand tone",
    ],
    requirements: [
      "Strong direct-response or brand copywriting samples",
    ],
    tracks: [
      {
        name: "Brand & Launch Copywriter",
        commitment: "4–6 hrs / week",
        level: "Entry to Intermediate",
        points: ["Launch emails", "Landing page copy", "Event announcements"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "quiz-and-assessment-authors",
    category: "Writing & Content",
    categoryId: "Writing",
    title: "Quiz & Assessment Authors",
    subtitle: "Certification Tests",
    engagementType: "Volunteer Fellowship · Remote",
    weeklyHours: "4–6 hrs / week",
    overview:
      "Design practical quizzes, chart-reading scenarios, and certification assessments that verify real student mastery.",
    whatTheyDo:
      "You build multiple-choice and scenario-based questions for course quizzes and the Fun Zone Quiz Arcade.",
    responsibilities: [
      "Author scenario-based questions testing market structure and risk",
      "Write clear answer explanations so students learn from mistakes",
      "Review quiz pass rates and refine unclear questions",
    ],
    requirements: [
      "Strong grasp of trading fundamentals and educational assessment",
    ],
    tracks: [
      {
        name: "Assessment & Quiz Author",
        commitment: "4–6 hrs / week",
        level: "Entry to Intermediate",
        points: ["Course quizzes", "Scenario explanations", "Arcade trivia packs"],
      },
    ],
    faqs: DEFAULT_FAQS,
  },
];

export function findRoleGuideBySlug(slug: string): RoleGuide | undefined {
  return ROLE_GUIDES.find((g) => g.slug === slug);
}
