export type StoreProductCategory = "all" | "ebook" | "indicator" | "bot" | "strategy" | "tool";

export type StoreProduct = {
  id: string;
  title: string;
  tagline: string;
  category: "ebook" | "indicator" | "bot" | "strategy" | "tool";
  price: number; // in Naira
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: string; // e.g. "Best Seller", "Prop-Firm Safe", "New Release"
  description: string;
  features: string[];
  deliverableType: string; // e.g. "Instant PDF Download", "MT4/MT5 Expert Advisor", "TradingView Script"
  downloadUrl?: string;
  accessInstructions?: string;
  published: boolean;
  salesCount: number;
  image?: string;
  createdAt: string;
  updatedAt?: string;
};

export const SEED_STORE_PRODUCTS: StoreProduct[] = [
  {
    id: "gamat-playbook-v1",
    title: "Institutional Order Flow & Liquidity Playbook",
    tagline: "The definitive 280-page manual decoding central bank sweeps, institutional volume imbalances, and multi-timeframe precision entries.",
    category: "ebook",
    price: 24999,
    originalPrice: 45000,
    rating: 4.9,
    reviewCount: 148,
    badge: "Best Seller",
    description: "Written by Chief Mentor Taylor and the GAMAT senior trading desk, this handbook walks you through the exact structural models institutions use to engineer liquidity, sweep retail stops, and execute high-probability order flow continuations. Packed with 120+ high-definition annotated chart case studies.",
    features: [
      "280 full-colour pages with annotated trade markups",
      "Step-by-step Fair Value Gap (FVG) and Order Block validation rules",
      "London Open Judas Swing and New York AM Killzone blueprints",
      "Includes printable PDF cheatsheets for your trading desk",
      "Lifetime digital updates whenever new market editions release",
    ],
    deliverableType: "Instant High-Res PDF + Printable Cheatsheet Bundle",
    downloadUrl: "https://gamatfxacademy.com/assets/downloads/GAMAT_OrderFlow_Playbook_v2.pdf",
    accessInstructions: "Instant PDF download link is unlocked in your dashboard upon payment. You also receive an email with your permanent offline copy.",
    published: true,
    salesCount: 312,
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "gamat-apex-bot",
    title: "GAMAT Apex Trend Scalper EA (MT4 / MT5)",
    tagline: "Fully automated algorithmic trading robot designed for disciplined session breakout execution with hard-coded prop-firm risk limits.",
    category: "bot",
    price: 85000,
    originalPrice: 150000,
    rating: 4.9,
    reviewCount: 94,
    badge: "Prop-Firm Safe",
    description: "The Apex Scalper EA is built on GAMAT's proprietary session expansion algorithm. It hunts high-momentum continuations on EUR/USD, GBP/USD, and Gold during the London–New York overlap, with dynamic trailing stops, automatic spread filters, and a hard 2% daily loss lock.",
    features: [
      "Compatible with MetaTrader 4 (MT4) and MetaTrader 5 (MT5)",
      "Strict prop-firm drawdown guard (hard stop at pre-set daily loss)",
      "Zero martingale, grid, or unhedged overnight holding",
      "Pre-configured optimized preset files for major forex pairs",
      "1-on-1 VPS setup walkthrough and private EA support channel",
    ],
    deliverableType: "Compiled EX4/EX5 Robots + Presets + Video Walkthrough",
    downloadUrl: "https://gamatfxacademy.com/assets/downloads/Apex_Scalper_EA_Suite.zip",
    accessInstructions: "Download your compiled EA archive and enter your MT4/MT5 account number in the license portal inside your student dashboard.",
    published: true,
    salesCount: 128,
    createdAt: "2026-02-01T12:00:00Z",
  },
  {
    id: "gamat-fvg-indicator-suite",
    title: "Smart Money FVG & Order Block Radar Suite",
    tagline: "Proprietary chart indicator that identifies institutional displacement candles, unmitigated supply/demand zones, and multi-timeframe structure in real time.",
    category: "indicator",
    price: 35000,
    originalPrice: 60000,
    rating: 4.8,
    reviewCount: 182,
    badge: "Top Rated",
    description: "Eliminate guesswork from your charts. This institutional radar automatically highlights fresh Fair Value Gaps, unmitigated Order Blocks, and Break of Structure (BOS) / Change of Character (CHoCH) swings across any timeframe from 1-minute to Daily.",
    features: [
      "TradingView invite-only script + MetaTrader 5 indicator (.ex5)",
      "Auto-detects fresh vs mitigated order blocks and liquidity sweeps",
      "Customizable push notifications and alerts sent to your phone",
      "Multi-timeframe dashboard overlay on one single chart",
      "Clean visual design that prevents chart clutter",
    ],
    deliverableType: "TradingView Invite Access + MT5 Indicator File",
    downloadUrl: "https://gamatfxacademy.com/assets/downloads/GAMAT_SMC_Radar_MT5.ex5",
    accessInstructions: "Provide your TradingView username or MT5 account number on the confirmation screen to receive instant invite activation.",
    published: true,
    salesCount: 245,
    createdAt: "2026-01-20T14:30:00Z",
  },
  {
    id: "gamat-prop-blueprint",
    title: "Prop Firm Passing Blueprint & Risk Calculator",
    tagline: "The battle-tested phase-1 and phase-2 consistency framework used by 300+ GAMAT funded students to secure payouts.",
    category: "strategy",
    price: 19500,
    originalPrice: 35000,
    rating: 5.0,
    reviewCount: 215,
    badge: "Essential",
    description: "Most prop firm challenges fail because of psychological over-leveraging near the profit target. This blueprint gives you our mathematical drawdown insulation rules, daily trade caps, and an automated Google Sheets risk calculator that prevents breach.",
    features: [
      "Step-by-step 0.25%–0.50% risk runway management model",
      "Interactive Google Sheets risk calculator with live formula inputs",
      "News blackout checklist and lot-size consistency rules",
      "Video walkthrough breakdown of phase-1 to live funded transition",
      "Approved for FTMO, FundedNext, Alpha Capital, and 5%ers",
    ],
    deliverableType: "Video Masterclass + Interactive Risk Model Sheet",
    downloadUrl: "https://gamatfxacademy.com/assets/downloads/GAMAT_Prop_Calculator.xlsx",
    accessInstructions: "Immediate access to the video tutorial portal and a one-click Google Sheets copy link upon checkout.",
    published: true,
    salesCount: 380,
    createdAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "gamat-london-judas-ea",
    title: "ICT London Judas & Killzone Automation EA",
    tagline: "Automated session sweep execution bot targeting the classic London Judas raid and New York AM expansion.",
    category: "bot",
    price: 75000,
    originalPrice: 130000,
    rating: 4.8,
    reviewCount: 68,
    badge: "New Release",
    description: "Designed for traders who understand liquidity sweeps but cannot watch the London open live at 8:00 AM UTC. This EA marks the Asian high/low, waits for an aggressive wick sweep followed by lower-timeframe CHoCH displacement, and triggers entries automatically.",
    features: [
      "MetaTrader 5 (MT5) compatible",
      "Automated Asian range liquidity box calculation",
      "Built-in breakeven trailing stop triggered at +1.5R",
      "Configurable trading hours to ignore holidays and weekend gaps",
      "Complete user documentation and backtesting report included",
    ],
    deliverableType: "MT5 Expert Advisor + Strategy Manual + Setup Video",
    downloadUrl: "https://gamatfxacademy.com/assets/downloads/Judas_Killzone_EA_MT5.zip",
    accessInstructions: "Download your files immediately; private license key sent to your student email.",
    published: true,
    salesCount: 89,
    createdAt: "2026-02-18T16:00:00Z",
  },
  {
    id: "gamat-hardcover-journal",
    title: "Hardcover Trader Discipline Journal & Execution Log",
    tagline: "Premium spiral-bound 90-day trader accountability planner engineered for psychology tracking and R-multiple journaling.",
    category: "tool",
    price: 15000,
    originalPrice: 25000,
    rating: 4.9,
    reviewCount: 160,
    badge: "Physical + Digital",
    description: "Professional trading is built on documentation. This custom-printed 90-day physical logbook features dedicated pages for pre-market top-down narrative, planned stop-loss and R:R calculations, post-trade emotional ratings, and weekly consistency reviews.",
    features: [
      "Premium faux-leather hardcover with thick 120gsm ink-proof paper",
      "Daily pre-market analysis and execution review layout",
      "Emotional tilt scorecards and daily loss limit tracking",
      "Includes instant Notion Digital Trading Journal template",
      "Nationwide courier delivery across Nigeria or office pickup",
    ],
    deliverableType: "Physical Hardcover Book (Delivered) + Notion Digital Template",
    downloadUrl: "https://gamatfxacademy.com/assets/downloads/GAMAT_Notion_Journal_Template.zip",
    accessInstructions: "Digital Notion template unlocked immediately; enter delivery address at checkout for physical shipping.",
    published: true,
    salesCount: 204,
    createdAt: "2026-01-05T08:00:00Z",
  },
];

export const STORE_STORAGE_KEY = "gamat.store_products.v1";

export function loadStoredProducts(): StoreProduct[] {
  try {
    const raw = localStorage.getItem(STORE_STORAGE_KEY);
    if (!raw) return SEED_STORE_PRODUCTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_STORE_PRODUCTS;
  } catch {
    return SEED_STORE_PRODUCTS;
  }
}

export function saveStoredProducts(list: StoreProduct[]): void {
  try {
    localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}
