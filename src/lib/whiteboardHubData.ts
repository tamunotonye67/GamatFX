/* ========================================================================== */
/*           WHITEBOARD HUB DATA LAYER (SAMPLES, RESOURCES & GUIDES)          */
/* ========================================================================== */

export interface WhiteboardShapePoint {
  x: number;
  y: number;
}

export interface WhiteboardShape {
  id: string;
  type: string;
  color: string;
  strokeWidth: number;
  points: WhiteboardShapePoint[];
  text?: string;
  stickyColor?: string;
  lineStyle?: "solid" | "dashed";
  candleStyle?: "solid" | "translucent" | "hollow";
  strokeColor?: string;
  fillColor?: string;
  fillStyle?: "solid" | "gradient" | "none" | "translucent";
  gradientEndColor?: string;
  opacity?: number;
  cornerRadius?: number;
  upperWickLength?: number;
  lowerWickLength?: number;
  wickColor?: string;
  isLocked?: boolean;
}

export interface HubSampleTemplate {
  id: string;
  name: string;
  category: string;
  tag: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  desc: string;
  shapesCount: number;
  shapes: WhiteboardShape[];
}

export interface HubResourceCard {
  id: string;
  title: string;
  category: string;
  badge: string;
  badgeColor: string;
  desc: string;
  points: string[];
  actionLabel: string;
}

export interface HubLessonItem {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  desc: string;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
  items: { label: string; value: string; isMono?: boolean }[];
}

/* ========================================================================== */
/*                           DEFAULT INSTITUTIONAL DATA                       */
/* ========================================================================== */

export const DEFAULT_SAMPLE_MINDMAP_SHAPES: WhiteboardShape[] = [
  {
    id: "mm_center",
    type: "sticky",
    color: "#0f172a",
    strokeWidth: 2,
    points: [{ x: 340, y: 160 }],
    text: "🏛️ FOREX TRADING SYSTEM\n\n• Market Structure (Trend)\n• Smart Money (POI)\n• Risk Management (1%)\n• Trade Execution Rules",
    stickyColor: "#fef08a",
  },
  {
    id: "mm_line1",
    type: "arrow",
    color: "#3b82f6",
    strokeWidth: 2,
    points: [{ x: 340, y: 220 }, { x: 230, y: 220 }],
  },
  {
    id: "mm_node1",
    type: "sticky",
    color: "#0f172a",
    strokeWidth: 2,
    points: [{ x: 80, y: 180 }],
    text: "📈 MARKET STRUCTURE\n\n• High Timeframe (HTF) Trend\n• Break of Structure (BOS)\n• Change of Character (CHoCH)\n• Premium vs Discount Zones",
    stickyColor: "#bae6fd",
  },
  {
    id: "mm_line2",
    type: "arrow",
    color: "#8b5cf6",
    strokeWidth: 2,
    points: [{ x: 490, y: 220 }, { x: 600, y: 220 }],
  },
  {
    id: "mm_node2",
    type: "sticky",
    color: "#0f172a",
    strokeWidth: 2,
    points: [{ x: 600, y: 180 }],
    text: "🎯 SMART MONEY POI\n\n• Unmitigated Order Blocks\n• Fair Value Gaps (FVG)\n• Liquidity Sweeps (BSL/SSL)\n• 50% Mean Threshold (MT)",
    stickyColor: "#e9d5ff",
  },
  {
    id: "mm_line3",
    type: "arrow",
    color: "#10b981",
    strokeWidth: 2,
    points: [{ x: 415, y: 310 }, { x: 415, y: 390 }],
  },
  {
    id: "mm_node3",
    type: "sticky",
    color: "#0f172a",
    strokeWidth: 2,
    points: [{ x: 340, y: 390 }],
    text: "⚖️ RISK DISCIPLINE\n\n• Strict 1.0% Max Risk / Trade\n• Minimum 1:3 Risk:Reward\n• Partial Profits at 1:2\n• Break-Even at +20 Pips",
    stickyColor: "#bbf7d0",
  },
];

export const DEFAULT_SAMPLE_SMC_SHAPES: WhiteboardShape[] = [
  {
    id: "smc_fvg_zone",
    type: "fvg",
    color: "#f59e0b",
    strokeWidth: 2,
    points: [{ x: 120, y: 110 }, { x: 500, y: 170 }],
    text: "H4 FVG (Fair Value Gap)",
  },
  {
    id: "smc_c1",
    type: "bullish_candle",
    color: "#10b981",
    strokeWidth: 2,
    points: [{ x: 160, y: 280 }, { x: 200, y: 210 }],
    text: "Impulse Candle 1",
  },
  {
    id: "smc_c2",
    type: "bullish_candle",
    color: "#10b981",
    strokeWidth: 2,
    points: [{ x: 230, y: 220 }, { x: 270, y: 110 }],
    text: "Displacement Candle 2",
  },
  {
    id: "smc_c3",
    type: "bullish_candle",
    color: "#10b981",
    strokeWidth: 2,
    points: [{ x: 300, y: 140 }, { x: 340, y: 80 }],
    text: "Candle 3 (Gap Formed)",
  },
  {
    id: "smc_bos",
    type: "bos",
    color: "#3b82f6",
    strokeWidth: 2,
    points: [{ x: 100, y: 180 }, { x: 620, y: 180 }],
    text: "BOS (Break of Structure)",
  },
  {
    id: "smc_ob_zone",
    type: "orderblock",
    color: "#8b5cf6",
    strokeWidth: 2,
    points: [{ x: 120, y: 310 }, { x: 550, y: 370 }],
    text: "H4 Bullish Order Block (POI)",
  },
  {
    id: "smc_c_bear",
    type: "bearish_candle",
    color: "#ef4444",
    strokeWidth: 2,
    points: [{ x: 160, y: 320 }, { x: 200, y: 360 }],
    text: "Last Down Candle",
  },
  {
    id: "smc_liq",
    type: "liquidity",
    color: "#ef4444",
    strokeWidth: 2,
    points: [{ x: 100, y: 70 }, { x: 650, y: 70 }],
    text: "$$$ Buy-Side Liquidity Pool",
  },
  {
    id: "smc_long",
    type: "long",
    color: "#10b981",
    strokeWidth: 2,
    points: [{ x: 420, y: 340 }, { x: 580, y: 70 }],
    text: "1:4.5 R:R Long Entry",
  },
  {
    id: "smc_callout",
    type: "annotation",
    color: "#8b5cf6",
    strokeWidth: 2,
    points: [{ x: 480, y: 340 }, { x: 620, y: 400 }],
    text: "Optimal Trade Entry at 50% Mean Threshold",
    lineStyle: "dashed",
  },
];

export const DEFAULT_SAMPLE_RISK_SHAPES: WhiteboardShape[] = [
  {
    id: "risk_panel",
    type: "rectangle",
    color: "#0f172a",
    strokeWidth: 2,
    points: [{ x: 60, y: 80 }, { x: 740, y: 460 }],
  },
  {
    id: "risk_note1",
    type: "sticky",
    color: "#0f172a",
    strokeWidth: 2,
    points: [{ x: 90, y: 120 }],
    text: "💰 ACCOUNT CAPITAL\n\nBalance: $10,000\nMax Risk (1.0%): $100\nDaily Loss Cap: 3.0%\nLeverage: 1:100",
    stickyColor: "#bae6fd",
  },
  {
    id: "risk_note2",
    type: "sticky",
    color: "#0f172a",
    strokeWidth: 2,
    points: [{ x: 300, y: 120 }],
    text: "🎯 RISK TO REWARD (1:3)\n\nStop Loss: 20 Pips ($100)\nTake Profit: 60 Pips ($300)\nPosition Size: 0.50 Lots\nWinrate Needed: 33%",
    stickyColor: "#bbf7d0",
  },
  {
    id: "risk_note3",
    type: "sticky",
    color: "#0f172a",
    strokeWidth: 2,
    points: [{ x: 510, y: 120 }],
    text: "🛡️ EXECUTION RULES\n\n1. Wait for H4 POI Mitigation\n2. M15 CHoCH Confirmation\n3. Set Hard Stop Loss Always\n4. No Revenge Trading!",
    stickyColor: "#fef08a",
  },
  {
    id: "risk_pos",
    type: "long",
    color: "#10b981",
    strokeWidth: 2,
    points: [{ x: 260, y: 390 }, { x: 540, y: 290 }],
    text: "1:3.0 Target",
  },
];

export const DEFAULT_SAMPLE_EURUSD_SHAPES: WhiteboardShape[] = [
  {
    id: "eur_liq",
    type: "liquidity",
    color: "#ef4444",
    strokeWidth: 2,
    points: [{ x: 100, y: 90 }, { x: 680, y: 90 }],
    text: "Asian High (BSL Liquidity)",
  },
  {
    id: "eur_c1",
    type: "bullish_candle",
    color: "#10b981",
    strokeWidth: 2,
    points: [{ x: 160, y: 220 }, { x: 195, y: 140 }],
    text: "Frankfurt Push",
  },
  {
    id: "eur_c2",
    type: "bearish_candle",
    color: "#ef4444",
    strokeWidth: 2,
    points: [{ x: 220, y: 80 }, { x: 255, y: 170 }],
    text: "London Sweep",
  },
  {
    id: "eur_c3",
    type: "bearish_candle",
    color: "#ef4444",
    strokeWidth: 2,
    points: [{ x: 280, y: 160 }, { x: 315, y: 270 }],
    text: "Displacement",
  },
  {
    id: "eur_bos",
    type: "bos",
    color: "#3b82f6",
    strokeWidth: 2,
    points: [{ x: 140, y: 230 }, { x: 500, y: 230 }],
    text: "M15 CHoCH (Structure Shift)",
  },
  {
    id: "eur_ob",
    type: "orderblock",
    color: "#ef4444",
    strokeWidth: 2,
    points: [{ x: 200, y: 100 }, { x: 440, y: 150 }],
    text: "M15 Bearish Order Block",
  },
  {
    id: "eur_short",
    type: "short",
    color: "#ef4444",
    strokeWidth: 2,
    points: [{ x: 360, y: 140 }, { x: 580, y: 390 }],
    text: "1:4.0 Short Position",
  },
];

export const DEFAULT_SAMPLE_LONDON_SHAPES: WhiteboardShape[] = [
  {
    id: "lon_asian_range",
    type: "rectangle",
    color: "#64748b",
    strokeWidth: 2,
    points: [{ x: 80, y: 180 }, { x: 320, y: 290 }],
    text: "Asian Consolidation Range",
  },
  {
    id: "lon_bsl",
    type: "liquidity",
    color: "#ef4444",
    strokeWidth: 2,
    points: [{ x: 60, y: 170 }, { x: 660, y: 170 }],
    text: "Equal Highs Buy-Side Liquidity",
  },
  {
    id: "lon_ssl",
    type: "liquidity",
    color: "#10b981",
    strokeWidth: 2,
    points: [{ x: 60, y: 300 }, { x: 660, y: 300 }],
    text: "Equal Lows Sell-Side Liquidity",
  },
  {
    id: "lon_sweep_candle",
    type: "bullish_candle",
    color: "#10b981",
    strokeWidth: 2,
    points: [{ x: 350, y: 190 }, { x: 390, y: 140 }],
    text: "08:00 Judas Sweep High",
  },
  {
    id: "lon_dump_candle",
    type: "bearish_candle",
    color: "#ef4444",
    strokeWidth: 2,
    points: [{ x: 410, y: 150 }, { x: 450, y: 340 }],
    text: "True Session Expansion",
  },
  {
    id: "lon_short",
    type: "short",
    color: "#ef4444",
    strokeWidth: 2,
    points: [{ x: 460, y: 170 }, { x: 620, y: 380 }],
    text: "1:3.8 London Expansion Short",
  },
];

export const DEFAULT_HUB_SAMPLES: HubSampleTemplate[] = [
  {
    id: "mindmap",
    name: "Forex Trading System Mind Map",
    category: "Mind Maps",
    tag: "Strategy Architecture",
    difficulty: "Beginner",
    desc: "Complete visual map linking Market Structure, Smart Money Concepts, and Risk Management.",
    shapesCount: DEFAULT_SAMPLE_MINDMAP_SHAPES.length,
    shapes: DEFAULT_SAMPLE_MINDMAP_SHAPES,
  },
  {
    id: "smc",
    name: "Smart Money Concepts (SMC) Master Diagram",
    category: "Smart Money Concepts",
    tag: "Order Blocks & FVG",
    difficulty: "Intermediate",
    desc: "Institutional market structure template displaying Order Blocks, Fair Value Gaps, BOS, and 50% Mean Threshold.",
    shapesCount: DEFAULT_SAMPLE_SMC_SHAPES.length,
    shapes: DEFAULT_SAMPLE_SMC_SHAPES,
  },
  {
    id: "risk",
    name: "Institutional Risk Management Matrix",
    category: "Risk Management",
    tag: "Capital Preservation",
    difficulty: "Beginner",
    desc: "Professional trade journal setup with 1:3 Risk-to-Reward parameters, lot sizing, and drawdown rules.",
    shapesCount: DEFAULT_SAMPLE_RISK_SHAPES.length,
    shapes: DEFAULT_SAMPLE_RISK_SHAPES,
  },
  {
    id: "class_chart_eurusd",
    name: "EUR/USD H4 Institutional Setup",
    category: "Technical Analysis",
    tag: "H4 Liquidity Sweep",
    difficulty: "Intermediate",
    desc: "Live class markup featuring Asian range liquidity sweep, displacement breakdown, and POI entry.",
    shapesCount: DEFAULT_SAMPLE_EURUSD_SHAPES.length,
    shapes: DEFAULT_SAMPLE_EURUSD_SHAPES,
  },
  {
    id: "sample_london_sweep",
    name: "London Open Judas Sweep Setup",
    category: "Technical Analysis",
    tag: "Session Playbook",
    difficulty: "Advanced",
    desc: "Mastery setup illustrating Asian liquidity trapping followed by London open true expansion.",
    shapesCount: DEFAULT_SAMPLE_LONDON_SHAPES.length,
    shapes: DEFAULT_SAMPLE_LONDON_SHAPES,
  },
];

export const DEFAULT_HUB_RESOURCES: HubResourceCard[] = [
  {
    id: "res_smc",
    title: "SMC Institutional POI Playbook",
    category: "Smart Money Concepts",
    badge: "Most Popular",
    badgeColor: "bg-purple-100 text-purple-700",
    desc: "Comprehensive reference guide on identifying high-probability unmitigated Order Blocks, Fair Value Gaps (FVG), and liquidity sweeps.",
    points: [
      "50% Mean Threshold (MT) equilibrium mitigation rules",
      "Valid vs invalid 3-candle Fair Value Gaps",
      "Equal Highs (BSL) and Equal Lows (SSL) liquidity sweeps",
      "Breaker block vs mitigation block identification",
    ],
    actionLabel: "Create Canvas with Guide",
  },
  {
    id: "res_risk",
    title: "Position Sizing & 1:3 R:R Calculator Guide",
    category: "Risk Management",
    badge: "Essential",
    badgeColor: "bg-emerald-100 text-emerald-700",
    desc: "Mathematical risk management principles to guarantee asymmetric profit delivery across currency and gold pairs.",
    points: [
      "Strict 1% max capital risk per trade calculation",
      "Dynamic lot sizing based on stop loss pips",
      "Scale-out milestones (Take 50% off at 1:2 R:R)",
      "Daily maximum drawdown protection rules",
    ],
    actionLabel: "Open Risk Template",
  },
  {
    id: "res_sessions",
    title: "Forex Market Sessions & Killzones Cheatsheet",
    category: "Market Timing",
    badge: "Session Timing",
    badgeColor: "bg-blue-100 text-blue-700",
    desc: "Detailed timing reference for London Open, New York Open, and Asian range liquidity traps.",
    points: [
      "Asian Range (00:00 - 06:00 GMT) liquidity accumulation",
      "London Open Killzone (07:00 - 10:00 GMT) Judas swing",
      "New York Open (13:00 - 16:00 GMT) trend continuation",
      "London Close (15:30 - 17:00 GMT) counter-trend profit taking",
    ],
    actionLabel: "Apply Session Guide",
  },
  {
    id: "res_topdown",
    title: "Multi-Timeframe Top-Down Analysis Blueprint",
    category: "Technical Analysis",
    badge: "Execution Flow",
    badgeColor: "bg-amber-100 text-amber-700",
    desc: "Step-by-step workflow for aligning Weekly/Daily macro trend bias with 15m/5m execution entry triggers.",
    points: [
      "HTF (Daily/H4): Major institutional bias and key zones",
      "ITF (1H/15m): Intermediate structural shift and POI framing",
      "LTF (5m/1m): Entry refinement with minimum drawdown",
      "Confirmation checklist before clicking Buy or Sell",
    ],
    actionLabel: "Load Blueprint Chart",
  },
];

export const DEFAULT_HUB_LESSONS: HubLessonItem[] = [
  {
    id: "nav",
    num: "01",
    title: "Canvas Navigation & Controls",
    subtitle: "Fluid infinite canvas movement",
    desc: "Pan seamlessly across your chart by holding the Spacebar and dragging with your mouse, or select the Hand Tool (H). Zoom in and out using Ctrl + Mouse Wheel or the bottom zoom bar.",
    colorClass: "bg-blue-50 text-blue-600",
    badgeBg: "bg-slate-50 border-line",
    badgeText: "text-slate-700",
    items: [
      { label: "Pan Canvas", value: "Space + Drag / H", isMono: true },
      { label: "Zoom In / Out", value: "Ctrl + Scroll / + -", isMono: true },
      { label: "Reset View (100%)", value: "Ctrl + 0", isMono: true },
    ]
  },
  {
    id: "smc",
    num: "02",
    title: "Smart Money Concepts (SMC) Markup",
    subtitle: "Institutional supply/demand zones",
    desc: "Highlight institutional order blocks using Rectangles (R) with 20% opacity. Mark Break of Structure (BOS) and Change of Character (CHoCH) with labeled arrows, and use the Path Tool (P) to map multi-leg Elliott Wave impulses.",
    colorClass: "bg-purple-50 text-purple-600",
    badgeBg: "bg-purple-50/60 border-purple-100",
    badgeText: "text-purple-900",
    items: [
      { label: "Order Blocks (OB)", value: "Translucent Demand Zones" },
      { label: "Fair Value Gaps (FVG)", value: "3-Candle Imbalances" },
      { label: "Break of Structure (BOS)", value: "Trend continuation lines" },
    ]
  },
  {
    id: "risk",
    num: "03",
    title: "Risk Tool & Trade Journals",
    subtitle: "Automated 1:3 Risk-to-Reward setup",
    desc: "Plot Long/Short Positions (S) to calculate Stop Loss vs Take Profit zones automatically. Add Sticky Notes (N) directly onto your charts to write execution checklists, entry confirmations, and pre-session trade ideas.",
    colorClass: "bg-emerald-50 text-emerald-600",
    badgeBg: "bg-emerald-50/60 border-emerald-100",
    badgeText: "text-emerald-900",
    items: [
      { label: "Position Tool", value: "Press S", isMono: true },
      { label: "Editable Sticky Notes", value: "Press N", isMono: true },
      { label: "Candlestick Patterns", value: "Press K", isMono: true },
    ]
  },
  {
    id: "multitab",
    num: "04",
    title: "Multi-Tabs, Auto-Save & Exports",
    subtitle: "Never lose analysis progress",
    desc: "Open up to 5 concurrent charts in the top tab bar. Every markup stroke is automatically saved locally. Closed tabs are moved to the Trash Bin with a 30-day grace period. Export crystal-clear High-DPI PNGs, SVGs, or JPEGs anytime.",
    colorClass: "bg-amber-50 text-amber-600",
    badgeBg: "bg-amber-50/60 border-amber-100",
    badgeText: "text-amber-900",
    items: [
      { label: "New Canvas Tab", value: "Ctrl + N", isMono: true },
      { label: "Export PNG Diagram", value: "Ctrl + E", isMono: true },
      { label: "Restore Trashed Charts", value: "Hub → Trash Bin" },
    ]
  },
  {
    id: "fibo",
    num: "05",
    title: "Fibonacci Retracement & Golden Pocket",
    subtitle: "Precision 61.8% - 78.6% reversal levels",
    desc: "Drag the Fibonacci Tool (F) from swing low to swing high in an uptrend to reveal optimal trade entry (OTE) zones. The 0.618 Golden Ratio and 0.786 deep discount offer the highest probability entries when aligned with Order Blocks.",
    colorClass: "bg-indigo-50 text-indigo-600",
    badgeBg: "bg-indigo-50/60 border-indigo-100",
    badgeText: "text-indigo-900",
    items: [
      { label: "0.618 - 0.786 Zone", value: "Golden Pocket Confluence" },
      { label: "0.500 Equilibrium", value: "Premium / Discount Boundary" },
      { label: "Fib Tool Hotkey", value: "Press F", isMono: true },
    ]
  },
  {
    id: "topdown",
    num: "06",
    title: "Multi-Timeframe Top-Down Analysis",
    subtitle: "Aligning Daily bias with 5m execution",
    desc: "Start on Daily / 4H charts to identify the directional trend and high-liquidity sweep pools. Switch to 15m / 5m charts to capture tight-spread execution entries with minimal drawdowns and maximum risk-to-reward ratios.",
    colorClass: "bg-cyan-50 text-cyan-600",
    badgeBg: "bg-cyan-50/60 border-cyan-100",
    badgeText: "text-cyan-900",
    items: [
      { label: "High Timeframe (HTF)", value: "Daily & 4H Directional Bias" },
      { label: "Intermediate (ITF)", value: "1H & 15m Key Structural Zones" },
      { label: "Low Timeframe (LTF)", value: "5m & 1m Entry Trigger Execution" },
    ]
  },
];

/* ========================================================================== */
/*                      STORAGE GETTERS, SETTERS & DISPATCHERS                */
/* ========================================================================== */

const SAMPLES_KEY = "gamat_whiteboard_samples_v2";
const RESOURCES_KEY = "gamat_whiteboard_resources_v2";
const LESSONS_KEY = "gamat_whiteboard_lessons_v2";

export function getStoredSamples(): HubSampleTemplate[] {
  try {
    const raw = localStorage.getItem(SAMPLES_KEY);
    if (!raw) return DEFAULT_HUB_SAMPLES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_HUB_SAMPLES;
  } catch {
    return DEFAULT_HUB_SAMPLES;
  }
}

export function saveStoredSamples(samples: HubSampleTemplate[]): void {
  try {
    localStorage.setItem(SAMPLES_KEY, JSON.stringify(samples));
    window.dispatchEvent(new CustomEvent("gamat_whiteboard_data_updated", { detail: { type: "samples" } }));
  } catch (e) {
    console.error("Failed to save whiteboard samples to storage", e);
  }
}

export function getStoredResources(): HubResourceCard[] {
  try {
    const raw = localStorage.getItem(RESOURCES_KEY);
    if (!raw) return DEFAULT_HUB_RESOURCES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_HUB_RESOURCES;
  } catch {
    return DEFAULT_HUB_RESOURCES;
  }
}

export function saveStoredResources(resources: HubResourceCard[]): void {
  try {
    localStorage.setItem(RESOURCES_KEY, JSON.stringify(resources));
    window.dispatchEvent(new CustomEvent("gamat_whiteboard_data_updated", { detail: { type: "resources" } }));
  } catch (e) {
    console.error("Failed to save whiteboard resources to storage", e);
  }
}

export function getStoredLessons(): HubLessonItem[] {
  try {
    const raw = localStorage.getItem(LESSONS_KEY);
    if (!raw) return DEFAULT_HUB_LESSONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_HUB_LESSONS;
  } catch {
    return DEFAULT_HUB_LESSONS;
  }
}

export function saveStoredLessons(lessons: HubLessonItem[]): void {
  try {
    localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
    window.dispatchEvent(new CustomEvent("gamat_whiteboard_data_updated", { detail: { type: "lessons" } }));
  } catch (e) {
    console.error("Failed to save whiteboard lessons to storage", e);
  }
}

export function resetSamplesToDefault(): HubSampleTemplate[] {
  saveStoredSamples(DEFAULT_HUB_SAMPLES);
  return DEFAULT_HUB_SAMPLES;
}

export function resetResourcesToDefault(): HubResourceCard[] {
  saveStoredResources(DEFAULT_HUB_RESOURCES);
  return DEFAULT_HUB_RESOURCES;
}

export function resetLessonsToDefault(): HubLessonItem[] {
  saveStoredLessons(DEFAULT_HUB_LESSONS);
  return DEFAULT_HUB_LESSONS;
}
