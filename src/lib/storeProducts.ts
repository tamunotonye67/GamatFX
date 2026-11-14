export type StoreProductCategory = "all" | "ebook" | "indicator" | "bot" | "strategy" | "tool";

export type StoreProduct = {
  id: string;
  title: string;
  tagline: string;
  category: "ebook" | "indicator" | "bot" | "strategy" | "tool";
  price: number; // in Naira (0 for free items)
  originalPrice?: number;
  isFree?: boolean; // Set as 100% Free tool / resource
  isPreorder?: boolean; // Set as Pre-order tool / upcoming release
  preorderReleaseDate?: string; // Estimated release window e.g. "April 2026"
  preorderNote?: string; // Preorder notice or early-bird perks
  rating: number;
  reviewCount: number;
  badge?: string; // e.g. "Best Seller #1", "Prop-Firm Verified", "New Release"
  author: string; // e.g. "By GAMAT Institutional Research Team"
  description: string;
  features: string[];
  deliverableType: string; // e.g. "Instant PDF + Cheatsheet", "MT4/MT5 Robot File"
  downloadUrl?: string;
  fileName?: string;
  accessInstructions?: string;
  published: boolean;
  salesCount: number;
  image: string;
  gallery?: string[];
  fileSize?: string;
  compatibility?: string[]; // e.g. ["TradingView", "MT4", "MT5", "PDF"]
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
    badge: "Best Seller #1",
    author: "By Lead Mentor Tonye & GAMAT Research Desk",
    description: "Written by Chief Mentor Tonye and the GAMAT senior trading desk, this handbook walks you through the exact structural models institutions use to engineer liquidity, sweep retail stops, and execute high-probability order flow continuations. Packed with 120+ high-definition annotated chart case studies.",
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
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1000&q=80",
    ],
    fileSize: "28 MB (High-Res PDF)",
    compatibility: ["PDF Reader", "Adobe Acrobat", "iPad / Kindle", "Mobile"],
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
    author: "By GAMAT Algorithmic Quant Team",
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
    image: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
    ],
    fileSize: "45 MB (ZIP Archive)",
    compatibility: ["MetaTrader 4", "MetaTrader 5", "Windows VPS", "macOS"],
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
    badge: "Top Rated ★",
    author: "By GAMAT Technical Tools Lab",
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
    image: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1000&q=80",
    ],
    fileSize: "14 MB (Compiled Script)",
    compatibility: ["TradingView", "MetaTrader 5", "Web / Mobile"],
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
    author: "By Senior Prop Trader Joshua & Desk",
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
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80",
    ],
    fileSize: "18 MB (Excel + HD Video)",
    compatibility: ["Google Sheets", "Microsoft Excel", "Video Player"],
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
    author: "By GAMAT Quant Engineering",
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
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1000&q=80",
    ],
    fileSize: "32 MB (ZIP Archive)",
    compatibility: ["MetaTrader 5", "Windows", "VPS"],
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
    author: "By GAMAT Official Merchandise Desk",
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
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80",
    ],
    fileSize: "Physical Courier / Notion Link",
    compatibility: ["Physical Book", "Notion App", "Printable PDF"],
    createdAt: "2026-01-05T08:00:00Z",
  },
  {
    id: "gamat-smc-starter-kit",
    title: "SMC Liquidity & Market Structure Starter Kit",
    tagline: "Free 45-page cheat sheet, high-probability entry checklist, and Fair Value Gap identification guide for aspiring funded traders.",
    category: "strategy",
    price: 0,
    originalPrice: 15000,
    isFree: true,
    rating: 4.9,
    reviewCount: 420,
    badge: "Free Resource",
    author: "By GAMAT Academy Education Desk",
    description: "Kickstart your institutional trading journey with our essential Smart Money Concepts (SMC) starter kit. Includes visual diagrams for liquidity sweeps, internal vs external market structure, and our pre-trade execution checklist.",
    features: [
      "45-page downloadable high-resolution visual PDF",
      "FVG & Order Block mitigation visual checklist",
      "Asian range & London Killzone timing cheat sheet",
      "Printable desk markup guide for fast reference",
      "Free lifetime community access",
    ],
    deliverableType: "Instant Free PDF Cheatsheet & Checklist",
    downloadUrl: "https://gamatfxacademy.com/assets/downloads/GAMAT_SMC_Starter_Kit.pdf",
    accessInstructions: "Instant 1-click download unlocked immediately.",
    published: true,
    salesCount: 650,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
    ],
    fileSize: "12 MB (PDF Guide)",
    compatibility: ["PDF Reader", "Mobile", "Tablet", "Desktop"],
    createdAt: "2026-02-10T08:00:00Z",
  },
  {
    id: "gamat-quantum-orderflow-bot",
    title: "GAMAT Quantum Order Flow Scalper EA (MT5)",
    tagline: "Next-generation institutional volume profile and tick-level delta divergence algorithmic execution robot.",
    category: "bot",
    price: 49999,
    originalPrice: 120000,
    isPreorder: true,
    preorderReleaseDate: "April 2026",
    preorderNote: "Lock in 58% early-bird discount before public rollout. Includes 1-on-1 VPS setup & private launch webinar.",
    rating: 5.0,
    reviewCount: 34,
    badge: "Pre-Order",
    author: "By GAMAT Algorithmic Quant Team",
    description: "The Quantum Order Flow EA combines live volume tick delta analysis with session liquidity sweeps. Engineered specifically for passing $100k-$200k prop firm accounts with strict automated equity protection.",
    features: [
      "MetaTrader 5 (MT5) exclusive tick-delta engine",
      "Real-time volume imbalance sweep triggers",
      "Pre-order early access build released April 2026",
      "Automated hard equity stop-out protection",
      "Includes lifetime license and private quant channel access",
    ],
    deliverableType: "Pre-order Access Pass + Compiled EA (April 2026)",
    downloadUrl: "https://gamatfxacademy.com/assets/downloads/Quantum_EA_EarlyAccess_Pass.pdf",
    accessInstructions: "Pre-order pass is delivered instantly. Your EA license key and installation guide will be unlocked in your dashboard on release day.",
    published: true,
    salesCount: 52,
    image: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1000&q=80",
    ],
    fileSize: "Pre-order Pass (Instant)",
    compatibility: ["MetaTrader 5", "Windows VPS"],
    createdAt: "2026-03-01T10:00:00Z",
  },
];

export const STORE_STORAGE_KEY = "gamat.store_products.v2";

export function loadStoredProducts(): StoreProduct[] {
  try {
    const raw = localStorage.getItem(STORE_STORAGE_KEY);
    if (!raw) return SEED_STORE_PRODUCTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure seed products (like gamat-playbook-v1) are always present even if localStorage has older data
      const existingIds = new Set(parsed.map((p: StoreProduct) => p.id));
      const missingSeeds = SEED_STORE_PRODUCTS.filter((sp) => !existingIds.has(sp.id));
      if (missingSeeds.length > 0) {
        const merged = [...missingSeeds, ...parsed];
        try {
          localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(merged));
        } catch {}
        return merged;
      }
      return parsed;
    }
    return SEED_STORE_PRODUCTS;
  } catch {
    return SEED_STORE_PRODUCTS;
  }
}

export function saveStoredProducts(list: StoreProduct[]): void {
  try {
    localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    // Fallback: If localStorage quota is exceeded (e.g. large base64 data URLs), strip oversize base64 and retry
    try {
      const sanitized = list.map((p) => ({
        ...p,
        image: p.image?.startsWith("data:") && p.image.length > 60000
          ? "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1000&q=80"
          : p.image,
        gallery: p.gallery?.map((g) => (g.startsWith("data:") && g.length > 60000 ? "" : g)).filter(Boolean),
        downloadUrl: p.downloadUrl?.startsWith("data:") && p.downloadUrl.length > 60000 ? undefined : p.downloadUrl,
      }));
      localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(sanitized));
    } catch {}
  }
}
