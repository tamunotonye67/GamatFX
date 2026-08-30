import { useState, useRef, useEffect } from "react";
import Logo from "../components/Logo";
import { navigate } from "../lib/router";
import {
  MousePointer,
  Hand,
  Pencil,
  Highlighter,
  Square,
  Circle,
  Diamond,
  ArrowRight,
  ArrowUpRight,
  Home,
  Type,
  StickyNote,
  Eraser,
  RotateCcw,
  RotateCw,
  Trash2,
  Download,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Activity,
  ChevronDown,
  FileImage,
  FileCode,
  Layers,
  Grid,
  Magnet,
  X,
  Plus,
  Settings,
  Keyboard,
  Check,
  Search,
  ChevronRight,
  Copy,
  ArrowUp,
  ArrowDown,
  Edit3,
  SlidersHorizontal,
  PanelRightClose,
  PanelRightOpen,
  Info,
  GripVertical,
  Star,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Percent,
  Minus,
  Link2,
  Monitor,
  Smartphone,
  Laptop,
  Scan,
  BoxSelect,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  CaseUpper,
  CaseLower,
} from "lucide-react";
import {
  getStoredSamples,
  getStoredResources,
  getStoredLessons,
  DEFAULT_SAMPLE_MINDMAP_SHAPES,
  DEFAULT_SAMPLE_SMC_SHAPES,
  DEFAULT_SAMPLE_RISK_SHAPES,
  DEFAULT_SAMPLE_EURUSD_SHAPES,
  DEFAULT_SAMPLE_LONDON_SHAPES,
  type HubSampleTemplate,
  type HubResourceCard as HubResourceGuide,
  type HubLessonItem,
} from "../lib/whiteboardHubData";
import {
  LayoutTemplate,
  Palette,
  Boxes,
  MousePointerClick,
  Crosshair,
  Save,
  FolderKanban,
  BookOpen,
  Clock,
  FileText,
  User,
  ShieldCheck,
  LogOut,
  LayoutGrid,
  List,
  ArrowLeft,
  FolderOpen,
  FilePlus2,
  Compass,
  HelpCircle,
  CheckCircle2,
  Zap,
  Target,
  GraduationCap,
  PlayCircle,
  Lightbulb,
} from "lucide-react";
import { useStore } from "../lib/store";

/* Custom Forex SVG Icons (Ultra-Minimalist Lucide-Style Line Art) */
const FvgCandlesIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Left candle base */}
    <line x1="5" y1="12" x2="5" y2="20" />
    <rect x="3.5" y="14" width="3" height="4" rx="0.5" />

    {/* Center impulse candle (creates the imbalance gap) */}
    <line x1="12" y1="3" x2="12" y2="21" />
    <rect x="10.5" y="6" width="3" height="12" rx="0.5" />

    {/* Right candle high */}
    <line x1="19" y1="4" x2="19" y2="12" />
    <rect x="17.5" y="6" width="3" height="4" rx="0.5" />
  </svg>
);

const BosIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Structural resistance line */}
    <line x1="8" y1="9" x2="21" y2="9" strokeDasharray="2 2" strokeWidth="1.5" />
    {/* Clean breakout pathway */}
    <polyline points="3 17 8 9 13 13 21 5" />
    <polyline points="16 5 21 5 21 10" />
  </svg>
);

const TradingViewLongIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <line x1="4" y1="13" x2="20" y2="13" />
    <polyline points="9 8 12 5 15 8" />
    <line x1="12" y1="5" x2="12" y2="10" />
  </svg>
);

const TradingViewShortIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <line x1="4" y1="11" x2="20" y2="11" />
    <polyline points="9 16 12 19 15 16" />
    <line x1="12" y1="14" x2="12" y2="19" />
  </svg>
);

const BullishCandleIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="2" x2="12" y2="6" />
    <rect x="7" y="6" width="10" height="11" rx="1" />
    <line x1="12" y1="17" x2="12" y2="22" />
    <polyline points="10 11 12 9 14 11" strokeWidth="1.5" />
  </svg>
);

const BearishCandleIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="2" x2="12" y2="7" />
    <rect x="7" y="7" width="10" height="11" rx="1" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <polyline points="10 13 12 15 14 13" strokeWidth="1.5" />
  </svg>
);

const OrderBlockIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <line x1="3" y1="12" x2="21" y2="12" strokeDasharray="2 2" strokeWidth="1.5" />
  </svg>
);

const LiquidityIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12" strokeDasharray="3 3" strokeWidth="1.5" />
    <circle cx="7" cy="12" r="1.75" fill="currentColor" />
    <circle cx="12" cy="12" r="1.75" fill="currentColor" />
    <circle cx="17" cy="12" r="1.75" fill="currentColor" />
  </svg>
);

const AnnotationIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Target Pin Circle */}
    <circle cx="5" cy="19" r="2" />
    {/* Leader Line to text box */}
    <path d="M7 17L12 12H19" />
    {/* Annotation Text Badge */}
    <rect x="12" y="5" width="9" height="7" rx="1.5" />
    <line x1="14.5" y1="8.5" x2="18.5" y2="8.5" />
  </svg>
);

/* ========================================================================== */
/*                               TYPES & DATA                                 */
/* ========================================================================== */

type Tool =
  | "select"
  | "hand"
  | "pencil"
  | "highlighter"
  | "sticky"
  | "rectangle"
  | "circle"
  | "diamond"
  | "line"
  | "arrow"
  | "bezier"
  | "text"
  | "annotation"
  | "eraser"
  | "zoom"
  | "marquee_zoom"
  | "fibo"
  | "long"
  | "short"
  | "orderblock"
  | "fvg"
  | "bos"
  | "liquidity"
  | "bullish_candle"
  | "bearish_candle";

type StickyColor = "#fef08a" | "#fbcfe8" | "#bae6fd" | "#bbf7d0" | "#ddd6fe";

type Shape = {
  id: string;
  type: Tool;
  name?: string;
  color: string;
  strokeColor?: string;
  fillColor?: string;
  fillStyle?: "solid" | "gradient" | "none" | "translucent";
  gradientEndColor?: string;
  opacity?: number;
  cornerRadius?: number;
  strokeWidth: number;
  lineStyle?: "solid" | "dashed";
  candleStyle?: "solid" | "translucent" | "hollow";
  upperWickLength?: number;
  lowerWickLength?: number;
  wickColor?: string;
  points: { x: number; y: number }[];
  text?: string;
  stickyColor?: StickyColor;
  isLocked?: boolean;
  isHidden?: boolean;
  // Typography & Character Features
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline" | "line-through";
  textAlign?: "left" | "center" | "right";
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  letterSpacing?: number;
  lineHeight?: number;
  textColor?: string;
  textBgColor?: string;
};

type DiagramTab = {
  id: string;
  name: string;
  shapes?: Shape[];
  theme?: "dots" | "lines" | "blank" | "dark" | "chalkboard";
  snapToGrid?: boolean;
};

type TrashedTab = {
  id: string;
  name: string;
  shapes: Shape[];
  deletedAt: number;
};

type SavedDraft = {
  id: string;
  name: string;
  shapes: Shape[];
  savedAt: number;
};

type ResizeHandle = "tl" | "tr" | "bl" | "br" | "tm" | "bm" | "ml" | "mr";

const STICKY_COLORS: { color: StickyColor; name: string }[] = [
  { color: "#fef08a", name: "Yellow" },
  { color: "#fbcfe8", name: "Pink" },
  { color: "#bae6fd", name: "Blue" },
  { color: "#bbf7d0", name: "Green" },
  { color: "#ddd6fe", name: "Purple" },
];

const PALETTE = ["#dc3545", "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#16181c", "#ffffff"];

const CANVAS_THEMES = [
  { id: "dots", name: "Dots Grid" },
  { id: "lines", name: "Square Grid" },
  { id: "blank", name: "Pure White" },
  { id: "dark", name: "Dark Theme" },
  { id: "chalkboard", name: "Chalkboard Green" },
];

const TOOL_EXPLANATIONS: Record<string, { title: string; desc: string; shortcut?: string }> = {
  select: {
    title: "Select & Move Tool",
    desc: "Click to select, move or drag corner handles to resize. Hold Alt while dragging to duplicate objects.",
    shortcut: "V / Alt+Drag",
  },
  hand: {
    title: "Pan / Hand Tool",
    desc: "Click and drag anywhere on the canvas background to move around your forex teaching diagram.",
    shortcut: "H / Space",
  },
  pencil: {
    title: "Freehand Pen",
    desc: "Draw freehand diagrams, market trendlines, and handwritten teaching annotations.",
    shortcut: "P",
  },
  highlighter: {
    title: "Highlighter Pen",
    desc: "Highlight key order block zones and price structures with translucent yellow ink.",
    shortcut: "Shift+P",
  },
  rectangle: {
    title: "Rectangle Zone Box",
    desc: "Draw rectangular boxes for Support, Resistance, Supply & Demand, or Order Block zones.",
    shortcut: "R",
  },
  circle: {
    title: "Circle Node",
    desc: "Draw circular target nodes, stop loss circles, or price liquidity levels.",
    shortcut: "C",
  },
  diamond: {
    title: "Decision Diamond",
    desc: "Draw decision tree diamonds for trading rules, entry triggers, and risk matrices.",
    shortcut: "D",
  },
  line: {
    title: "Straight Line",
    desc: "Draw clean straight trendlines, support/resistance levels, or chart boundary lines.",
    shortcut: "Shift+L",
  },
  arrow: {
    title: "Connector Arrow",
    desc: "Draw directional trend arrows to show price movement and liquidity flow.",
    shortcut: "A",
  },
  bezier: {
    title: "Chart Pattern Path",
    desc: "Draw continuous multi-point Forex chart patterns (Head & Shoulders, Flags, Triangles). Double-click to complete.",
    shortcut: "B",
  },
  sticky: {
    title: "Teaching Sticky Note",
    desc: "Add colorful teaching sticky notes to write trading rules, teaching tips, or trade setups.",
    shortcut: "N",
  },
  text: {
    title: "Text Label Tool",
    desc: "Click anywhere on the whiteboard to add clear text titles, price levels, or notes.",
    shortcut: "T",
  },
  annotation: {
    title: "Annotation Leader Line",
    desc: "Draw a leader line from any object with an attached callout annotation label badge.",
    shortcut: "W",
  },
  eraser: {
    title: "Precision Eraser",
    desc: "Erases only the exact line stroke segments touched by the eraser tip without deleting whole shapes.",
    shortcut: "E",
  },
  zoom: {
    title: "Zoom Tool",
    desc: "Click to zoom into details or use your mouse scroll wheel to zoom in and out smoothly.",
    shortcut: "Z / Scroll",
  },
  fibo: {
    title: "Fibonacci Retracement",
    desc: "Draw Golden Ratio Fibonacci levels (0.618 Golden Pocket, 0.5 Equilibrium, 0.786, 0.382) between Swing Low and Swing High.",
    shortcut: "F",
  },
  long: {
    title: "Long Position Calculator",
    desc: "TradingView-style Long Position tool showing Green Take Profit target, Red Stop Loss zone, and Risk-to-Reward ratio.",
    shortcut: "L",
  },
  short: {
    title: "Short Position Calculator",
    desc: "TradingView-style Short Position tool showing Red Stop Loss zone, Green Take Profit target, and Risk-to-Reward ratio.",
    shortcut: "S",
  },
  orderblock: {
    title: "Order Block (OB / POI Zone)",
    desc: "Draw institutional supply & demand Order Blocks with 50% Mean Threshold (MT) mitigation line.",
    shortcut: "O",
  },
  fvg: {
    title: "Fair Value Gap (FVG / Imbalance)",
    desc: "Draw 3-candle price imbalance Fair Value Gaps with 50% Consequent Encroachment (C.E.) midline.",
    shortcut: "G",
  },
  bos: {
    title: "Break of Structure (BOS / CHoCH)",
    desc: "Draw market structure shift trendlines labeled with BOS (Trend Continuation) or CHoCH (Trend Reversal).",
    shortcut: "K",
  },
  liquidity: {
    title: "Liquidity Pool ($$$ / BSL / SSL)",
    desc: "Mark Buy-Side (BSL) and Sell-Side (SSL) liquidity sweep pools and equal highs/lows.",
    shortcut: "Q",
  },
  bullish_candle: {
    title: "Bullish Candlestick",
    desc: "Draw an authentic TradingView-style green Bullish Candlestick with upper and lower wicks.",
    shortcut: "U",
  },
  bearish_candle: {
    title: "Bearish Candlestick",
    desc: "Draw an authentic TradingView-style red Bearish Candlestick with upper and lower wicks.",
    shortcut: "J",
  },
};

interface ShortcutItem {
  label: string;
  keys: string[];
}

interface ShortcutCategory {
  category: string;
  items: ShortcutItem[];
}

const SHORTCUT_GROUPS: ShortcutCategory[] = [
  {
    category: "Drawing & Diagram Tools",
    items: [
      { label: "Select & Move Object", keys: ["V"] },
      { label: "Marquee Multi-Select", keys: ["Drag Canvas"] },
      { label: "Add/Remove Selection", keys: ["Shift + Click"] },
      { label: "Hand / Pan Canvas", keys: ["H"] },
      { label: "Freehand Pen", keys: ["P"] },
      { label: "Highlighter Pen", keys: ["Shift", "P"] },
      { label: "Rectangle Zone Box", keys: ["R"] },
      { label: "Circle Node", keys: ["C"] },
      { label: "Decision Diamond", keys: ["D"] },
      { label: "Straight Line", keys: ["Shift", "L"] },
      { label: "Connector Arrow", keys: ["A"] },
      { label: "Chart Pattern Path (Bezier)", keys: ["B"] },
      { label: "Teaching Sticky Note", keys: ["N"] },
      { label: "Text Label Tool", keys: ["T"] },
      { label: "Annotation Leader Line", keys: ["W"] },
      { label: "Precision Eraser", keys: ["E"] },
      { label: "Click Zoom Tool", keys: ["Z"] },
      { label: "Marquee Zoom Box", keys: ["Shift", "Z"] },
    ],
  },
  {
    category: "Forex & Trading Setups",
    items: [
      { label: "Fibonacci Retracement", keys: ["F"] },
      { label: "Long Position Setup", keys: ["L"] },
      { label: "Short Position Setup", keys: ["S"] },
      { label: "Order Block (OB Zone)", keys: ["O"] },
      { label: "Fair Value Gap (FVG)", keys: ["G"] },
      { label: "Break of Structure (BOS)", keys: ["K"] },
      { label: "Liquidity Pool ($$$)", keys: ["Q"] },
      { label: "Bullish Candlestick", keys: ["U"] },
      { label: "Bearish Candlestick", keys: ["J"] },
    ],
  },
  {
    category: "Canvas Navigation & Gestures",
    items: [
      { label: "Pan Across Canvas", keys: ["Space + Drag"] },
      { label: "Marquee Zoom into Region", keys: ["Shift + Z", "Drag Box"] },
      { label: "Zoom In (+15%)", keys: ["+"] },
      { label: "Zoom Out (-15%)", keys: ["-"] },
      { label: "Zoom with Mouse Wheel", keys: ["Ctrl", "Wheel"] },
      { label: "Reset View to 100%", keys: ["Reset Button"] },
      { label: "Deselect All / Close Menus", keys: ["Esc"] },
      { label: "Open Shortcuts Reference", keys: ["?"] },
    ],
  },
  {
    category: "Object Manipulation, Layers & Tabs",
    items: [
      { label: "Undo Last Action", keys: ["Ctrl", "Z"] },
      { label: "Redo Last Action", keys: ["Ctrl", "Y"] },
      { label: "Save Diagram Draft", keys: ["Ctrl", "S"] },
      { label: "Select All Objects", keys: ["Ctrl", "A"] },
      { label: "Duplicate Object", keys: ["Ctrl", "D"] },
      { label: "Duplicate with Mouse", keys: ["Alt + Drag"] },
      { label: "Proportional Resizing", keys: ["Shift + Resize"] },
      { label: "Lock / Unlock Object", keys: ["Ctrl", "L"] },
      { label: "Delete Selected", keys: ["Delete"] },
      { label: "Bring Layer Up", keys: ["]"] },
      { label: "Send Layer Down", keys: ["["] },
      { label: "Close Tab & Return to Hub", keys: ["X on Tab"] },
    ],
  },
];

/* ========================================================================== */
/*                      FIGMA-STYLE ALIGNMENT SVG ICONS                       */
/* ========================================================================== */

const AlignLeftIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2.5" y1="2" x2="2.5" y2="14" strokeWidth="2" />
    <rect x="5.5" y="4" width="8" height="3" rx="0.75" fill="currentColor" fillOpacity="0.25" />
    <rect x="5.5" y="9" width="5" height="3" rx="0.75" fill="currentColor" fillOpacity="0.25" />
  </svg>
);

const AlignCenterHIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="2" x2="8" y2="14" strokeDasharray="2 2" strokeWidth="1.25" />
    <rect x="3.5" y="4" width="9" height="3" rx="0.75" fill="currentColor" fillOpacity="0.25" />
    <rect x="5" y="9" width="6" height="3" rx="0.75" fill="currentColor" fillOpacity="0.25" />
  </svg>
);

const AlignRightIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="13.5" y1="2" x2="13.5" y2="14" strokeWidth="2" />
    <rect x="2.5" y="4" width="8" height="3" rx="0.75" fill="currentColor" fillOpacity="0.25" />
    <rect x="5.5" y="9" width="5" height="3" rx="0.75" fill="currentColor" fillOpacity="0.25" />
  </svg>
);

const AlignTopIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="2.5" x2="14" y2="2.5" strokeWidth="2" />
    <rect x="4" y="5.5" width="3" height="8" rx="0.75" fill="currentColor" fillOpacity="0.25" />
    <rect x="9" y="5.5" width="3" height="5" rx="0.75" fill="currentColor" fillOpacity="0.25" />
  </svg>
);

const AlignMiddleVIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="8" x2="14" y2="8" strokeDasharray="2 2" strokeWidth="1.25" />
    <rect x="4" y="3.5" width="3" height="9" rx="0.75" fill="currentColor" fillOpacity="0.25" />
    <rect x="9" y="5" width="3" height="6" rx="0.75" fill="currentColor" fillOpacity="0.25" />
  </svg>
);

const AlignBottomIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="13.5" x2="14" y2="13.5" strokeWidth="2" />
    <rect x="4" y="2.5" width="3" height="8" rx="0.75" fill="currentColor" fillOpacity="0.25" />
    <rect x="9" y="5.5" width="3" height="5" rx="0.75" fill="currentColor" fillOpacity="0.25" />
  </svg>
);

const DistributeHIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="2" x2="2" y2="14" strokeWidth="1.5" />
    <line x1="14" y1="2" x2="14" y2="14" strokeWidth="1.5" />
    <rect x="6" y="4" width="4" height="8" rx="0.75" fill="currentColor" fillOpacity="0.25" />
  </svg>
);

const DistributeVIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="2" x2="14" y2="2" strokeWidth="1.5" />
    <line x1="2" y1="14" x2="14" y2="14" strokeWidth="1.5" />
    <rect x="4" y="6" width="8" height="4" rx="0.75" fill="currentColor" fillOpacity="0.25" />
  </svg>
);

const INITIAL_TABS: DiagramTab[] = [
  { id: "canvas_1", name: "Canvas 1", shapes: [], theme: "dots", snapToGrid: true },
];

/* ========================================================================== */
/*                             MAIN COMPONENT                                 */
/* ========================================================================== */

export default function WhiteboardPage() {
  const { user, isAuthed, logout, isAdmin } = useStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Screen Size Detection for Mobile Restriction Guard
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Whiteboard View Mode (Defaults to Canvas)
  const [viewMode, setViewMode] = useState<"hub" | "canvas">("canvas");
  const [hubTab, setHubTab] = useState<"drafts" | "samples" | "resources" | "trash" | "guide">("drafts");
  const [hubSearch, setHubSearch] = useState("");
  const [selectedResource, setSelectedResource] = useState<HubResourceGuide | null>(null);
  const [hubLayout, setHubLayout] = useState<"grid" | "list">(() => {
    try {
      const saved = localStorage.getItem("gamat_hub_layout");
      return saved === "list" ? "list" : "grid";
    } catch {
      return "grid";
    }
  });

  const handleToggleHubLayout = (layout: "grid" | "list") => {
    setHubLayout(layout);
    try {
      localStorage.setItem("gamat_hub_layout", layout);
    } catch {}
  };

  const [tabs, setTabs] = useState<DiagramTab[]>(INITIAL_TABS);
  const [activeTabId, setActiveTabId] = useState("canvas_1");
  const [draggedTabIdx, setDraggedTabIdx] = useState<number | null>(null);

  // Saved Drafts & Trashed Tabs State (Persistent LocalStorage)
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>([]);
  const [trashedTabs, setTrashedTabs] = useState<TrashedTab[]>([]);

  // Dynamic Whiteboard Hub Collections (Synced with Admin Manager)
  const [hubSamples, setHubSamples] = useState<HubSampleTemplate[]>(() => getStoredSamples());
  const [hubResources, setHubResources] = useState<HubResourceGuide[]>(() => getStoredResources());
  const [hubLessons, setHubLessons] = useState<HubLessonItem[]>(() => getStoredLessons());

  useEffect(() => {
    const handleHubDataUpdate = () => {
      setHubSamples(getStoredSamples());
      setHubResources(getStoredResources());
      setHubLessons(getStoredLessons());
    };
    window.addEventListener("gamat_whiteboard_data_updated", handleHubDataUpdate);
    return () => window.removeEventListener("gamat_whiteboard_data_updated", handleHubDataUpdate);
  }, []);

  // Sub-Header Action Dropdown States
  const [diagramsMenuOpen, setDiagramsMenuOpen] = useState(false);
  const [activeMenuTab, setActiveMenuTab] = useState<"drafts" | "samples" | "trash">("drafts");

  const [activeTool, setActiveTool] = useState<Tool>("pencil");
  const [activeShapeTool, setActiveShapeTool] = useState<"rectangle" | "circle" | "diamond">("rectangle");
  const [activeLineTool, setActiveLineTool] = useState<"line" | "arrow" | "bezier">("bezier");
  const [activePenTool, setActivePenTool] = useState<"pencil" | "highlighter">("pencil");
  const [activeForexTool, setActiveForexTool] = useState<"fibo" | "long" | "short" | "orderblock" | "fvg" | "bos" | "liquidity" | "bullish_candle" | "bearish_candle">("fibo");
  const [activeNoteTool, setActiveNoteTool] = useState<"text" | "sticky" | "annotation">("text");

  // TradingView Style Floating Favorites Toolbar State (Floats anywhere on whole page!)
  const [favoritedTools, setFavoritedTools] = useState<Tool[]>(["select", "pencil", "line", "fibo", "long", "short", "orderblock", "fvg", "bos", "liquidity", "bullish_candle", "bearish_candle"]);
  const [favPos, setFavPos] = useState({ x: 90, y: 130 });
  const isDraggingFav = useRef(false);
  const dragFavStart = useRef({ x: 0, y: 0 });

  const [strokeColor, setStrokeColor] = useState("#dc3545");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [lineStyle, setLineStyle] = useState<"solid" | "dashed">("solid");
  const [fillColor, setFillColor] = useState("#3b82f6");
  const [fillStyle, setFillStyle] = useState<"solid" | "gradient" | "none" | "translucent">("translucent");
  const [gradientEndColor, setGradientEndColor] = useState("#8b5cf6");
  const [opacity, setOpacity] = useState<number>(1);
  const [cornerRadius, setCornerRadius] = useState<number>(4);
  const [upperWickLength, setUpperWickLength] = useState<number>(25);
  const [lowerWickLength, setLowerWickLength] = useState<number>(25);
  const [wickColor, setWickColor] = useState<string>("#10b981");
  const [bgGrid, setBgGrid] = useState<"dots" | "lines" | "blank" | "dark" | "chalkboard">("dots");
  const [stickyColor, setStickyColor] = useState<StickyColor>("#fef08a");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number } | null>(null);

  /* ---------------------- WHITEBOARD SETTINGS PREFERENCES ------------------- */
  const [showTooltips, setShowTooltips] = useState(true);
  const [showFavoritesBar, setShowFavoritesBar] = useState(true);
  const [showCursorCoords, setShowCursorCoords] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSnapSize, setGridSnapSize] = useState<number>(10);
  const [eraserSize, setEraserSize] = useState<number>(18);
  const [defaultRiskReward, setDefaultRiskReward] = useState<number>(3);
  const [mouseWheelMode, setMouseWheelMode] = useState<"zoom" | "pan">("zoom");
  const [highDpiExport, setHighDpiExport] = useState(true);
  const [autoLockObjects, setAutoLockObjects] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"general" | "canvas" | "forex">("general");

  // Inspector & Photoshop Layers Panel State
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<"inspector" | "layers">("inspector");

  // Layer Renaming State
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingLayerName, setEditingLayerName] = useState("");

  // Modals & Flyout Dropdowns
  const [exportOpen, setExportOpen] = useState(false);
  const [bgOpen, setBgOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [shortcutFilter, setShortcutFilter] = useState("");
  const [maxTabPromptOpen, setMaxTabPromptOpen] = useState(false);

  // Tab Renaming & Tab Context Menu State
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTabName, setEditingTabName] = useState("");
  const [tabContextMenu, setTabContextMenu] = useState<{
    x: number;
    y: number;
    tabId: string;
    tabName: string;
  } | null>(null);

  // Comprehensive New Canvas Creator Modal State
  const [createCanvasModalOpen, setCreateCanvasModalOpen] = useState(false);
  const [newCanvasName, setNewCanvasName] = useState("");
  const [newCanvasTheme, setNewCanvasTheme] = useState<"dots" | "lines" | "blank" | "dark" | "chalkboard">("dots");
  const [newCanvasTemplate, setNewCanvasTemplate] = useState<"blank" | "risk_1_3" | "smc_zones" | "killzones" | "top_down">("blank");
  const [newCanvasSnapToGrid, setNewCanvasSnapToGrid] = useState(true);

  // Custom New Tab Naming Modal State
  const [newTabModalOpen, setNewTabModalOpen] = useState(false);
  const [newTabInputName, setNewTabInputName] = useState("");

  const [flyoutGroup, setFlyoutGroup] = useState<"shapes" | "lines" | "pen" | "forex" | "notes" | "single" | null>(null);

  // Context Menu State (Canvas or Object Context)
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    canvasPt: { x: number; y: number };
    targetShape: Shape | null;
  } | null>(null);

  // Selection & Multi-Select Marquee State
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShapeIds, setSelectedShapeIds] = useState<string[]>([]);
  const [marqueeBox, setMarqueeBox] = useState<{ x1: number; y1: number; x2: number; y2: number; mode?: "select" | "zoom" } | null>(null);

  // Interactive Shape Resizing State
  const [activeResizeHandle, setActiveResizeHandle] = useState<{ shapeId: string; handle: ResizeHandle } | null>(null);
  const [hoveredResizeHandle, setHoveredResizeHandle] = useState<{ shapeId: string; handle: ResizeHandle } | null>(null);
  const [isAspectLocked, setIsAspectLocked] = useState(false);

  // Undo/Redo & Active Drawing
  const [redoStack, setRedoStack] = useState<Shape[]>([]);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);

  // Typography & Character Formatting Presets
  const [fontFamily, setFontFamily] = useState<string>("Inter, -apple-system, sans-serif");
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontWeight, setFontWeight] = useState<"normal" | "bold">("bold");
  const [fontStyle, setFontStyle] = useState<"normal" | "italic">("normal");
  const [textDecoration, setTextDecoration] = useState<"none" | "underline" | "line-through">("none");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  const [textTransform, setTextTransform] = useState<"none" | "uppercase" | "lowercase" | "capitalize">("none");
  const [letterSpacing, setLetterSpacing] = useState<number>(0);
  const [lineHeight, setLineHeight] = useState<number>(1.3);

  // In-Place / Inline Canvas Text Editor (Photoshop / MS Word / Figma Style with Flashing Beeper)
  const [inlineEditor, setInlineEditor] = useState<{
    x: number;
    y: number;
    text: string;
    shapeId: string | null;
    isSticky?: boolean;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: "normal" | "bold";
    fontStyle?: "normal" | "italic";
    textDecoration?: "none" | "underline" | "line-through";
    textAlign?: "left" | "center" | "right";
    textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
    letterSpacing?: number;
    lineHeight?: number;
    color?: string;
  } | null>(null);

  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const isDraggingShape = useRef(false);
  const dragStartPt = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const startPan = useRef({ x: 0, y: 0 });
  const isSpacePressed = useRef(false);
  const [isSpaceHeld, setIsSpaceHeld] = useState(false);

  /* -------------------------- Page Scroll Lock & LocalStorage Initializer --- */

  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Load persisted drafts & trashed items from LocalStorage
    try {
      const storedDrafts = localStorage.getItem("gamat_fx_saved_drafts");
      if (storedDrafts) setSavedDrafts(JSON.parse(storedDrafts));

      const storedTrash = localStorage.getItem("gamat_fx_trashed_tabs");
      if (storedTrash) {
        const parsedTrash: TrashedTab[] = JSON.parse(storedTrash);
        // Auto-purge items older than 30 days!
        const validTrash = parsedTrash.filter(
          (item) => Date.now() - item.deletedAt < 30 * 24 * 60 * 60 * 1000
        );
        setTrashedTabs(validTrash);
      }
    } catch (e) {
      console.error("Failed loading LocalStorage drafts/trash", e);
    }

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Close User Menu on Outside Click / Escape
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleDocKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("keydown", handleDocKey);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", handleDocKey);
    };
  }, []);

  // Close Tab Context Menu on Global Outside Click
  useEffect(() => {
    const handleGlobalClick = () => {
      setTabContextMenu(null);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  /* Sync LocalStorage whenever drafts or trash state changes */
  useEffect(() => {
    try {
      localStorage.setItem("gamat_fx_saved_drafts", JSON.stringify(savedDrafts));
    } catch (e) {}
  }, [savedDrafts]);

  useEffect(() => {
    try {
      localStorage.setItem("gamat_fx_trashed_tabs", JSON.stringify(trashedTabs));
    } catch (e) {}
  }, [trashedTabs]);

  /* -------------------------- Non-Passive Canvas Wheel Event --------------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleNonPassiveWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (mouseWheelMode === "zoom") {
        // Smooth cursor-anchored zoom without holding Shift or Ctrl
        const zoomFactor = e.deltaY < 0 ? 1.09 : 0.91;
        setZoom((prevZoom) => {
          const newZoom = Math.min(3.0, Math.max(0.3, prevZoom * zoomFactor));
          setPan((prevPan) => {
            const canvasX = (mouseX - prevPan.x) / prevZoom;
            const canvasY = (mouseY - prevPan.y) / prevZoom;
            return {
              x: mouseX - canvasX * newZoom,
              y: mouseY - canvasY * newZoom,
            };
          });
          return newZoom;
        });
      } else {
        setPan((p) => ({
          x: p.x - e.deltaX * 0.8,
          y: p.y - e.deltaY * 0.8,
        }));
      }
    };

    canvas.addEventListener("wheel", handleNonPassiveWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", handleNonPassiveWheel);
    };
  }, [mouseWheelMode]);

  /* -------------------------- FULL KEYBOARD SHORTCUTS ---------------------- */

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement).tagName;
      if (targetTag === "INPUT" || targetTag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return;

      // Spacebar temporary Hand / Pan tool toggle
      if (e.code === "Space" || e.key === " ") {
        if (!isSpacePressed.current) {
          isSpacePressed.current = true;
          setIsSpaceHeld(true);
        }
        e.preventDefault();
        return;
      }

      const key = e.key.toLowerCase();
      const isCtrl = e.ctrlKey || e.metaKey;

      // 1. Action Shortcuts
      if (isCtrl && key === "n") {
        e.preventDefault();
        openCreateCanvasModal();
        return;
      }

      if (isCtrl && key === "s") {
        e.preventDefault();
        handleSaveCurrentDraft();
        return;
      }

      if (isCtrl && key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      if (isCtrl && (key === "y" || (e.shiftKey && key === "z"))) {
        e.preventDefault();
        handleRedo();
        return;
      }

      if ((e.key === "Delete" || e.key === "Backspace") && selectedShapeIds.length > 0) {
        e.preventDefault();
        const deletable = selectedShapeIds.filter((id) => {
          const target = shapes.find((s) => s.id === id);
          return target && !target.isLocked;
        });

        if (deletable.length > 0) {
          setShapes((prev) => prev.filter((s) => !deletable.includes(s.id)));
          setSelectedShapeIds([]);
          showToast(`Deleted ${deletable.length} unlocked object(s)!`);
        } else {
          showToast("Locked object(s) cannot be deleted!");
        }
        return;
      }

      if (isCtrl && key === "a") {
        e.preventDefault();
        const allUnlockedOrVisible = shapes.filter((s) => !s.isHidden).map((s) => s.id);
        setSelectedShapeIds(allUnlockedOrVisible);
        if (allUnlockedOrVisible.length > 0) showToast(`Selected all ${allUnlockedOrVisible.length} objects! (Ctrl+A)`);
        return;
      }

      if (isCtrl && key === "d" && selectedShapeIds.length > 0) {
        e.preventDefault();
        const toDup = shapes.filter((s) => selectedShapeIds.includes(s.id));
        const dups: Shape[] = toDup.map((s) => ({
          ...s,
          id: `shape_dup_${Date.now()}_${Math.random()}`,
          isLocked: false,
          points: s.points.map((p) => ({ x: p.x + 25, y: p.y + 25 })),
        }));
        setShapes((prev) => [...prev, ...dups]);
        setSelectedShapeIds(dups.map((d) => d.id));
        showToast(`Duplicated ${dups.length} object(s)! (Ctrl+D)`);
        return;
      }

      if (isCtrl && key === "l" && selectedShapeIds.length > 0) {
        e.preventDefault();
        setShapes((prev) =>
          prev.map((s) => (selectedShapeIds.includes(s.id) ? { ...s, isLocked: !s.isLocked } : s))
        );
        showToast("Toggled lock state! (Ctrl+L)");
        return;
      }

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
        return;
      }

      if (e.key === "Escape") {
        setSelectedShapeIds([]);
        setActiveTool("select");
        setContextMenu(null);
        setTabContextMenu(null);
        setEditingTabId(null);
        setDiagramsMenuOpen(false);
        setShortcutsOpen(false);
        setSettingsOpen(false);
        return;
      }

      if (e.key === "[" && selectedShapeIds.length > 0) {
        selectedShapeIds.forEach((id) => {
          const idx = shapes.findIndex((s) => s.id === id);
          if (idx > 0) moveLayerDown(idx);
        });
        return;
      }

      if (e.key === "]" && selectedShapeIds.length > 0) {
        selectedShapeIds.forEach((id) => {
          const idx = shapes.findIndex((s) => s.id === id);
          if (idx >= 0 && idx < shapes.length - 1) moveLayerUp(idx);
        });
        return;
      }

      if (e.key === "+" || e.key === "=") {
        setZoom((z) => Math.min(3.0, z + 0.15));
        return;
      }

      if (e.key === "-") {
        setZoom((z) => Math.max(0.3, z - 0.15));
        return;
      }

      // 2. Whiteboard Tool Switcher Shortcuts
      if (!isCtrl && !e.altKey) {
        if (key === "v") { setActiveTool("select"); showToast("Tool: Select (V)"); }
        else if (key === "h") { setActiveTool("hand"); showToast("Tool: Hand / Pan (H)"); }
        else if (key === "p" && !e.shiftKey) { setActivePenTool("pencil"); setActiveTool("pencil"); showToast("Tool: Freehand Pen (P)"); }
        else if (key === "p" && e.shiftKey) { setActivePenTool("highlighter"); setActiveTool("highlighter"); showToast("Tool: Highlighter (Shift+P)"); }
        else if (key === "r") { setActiveShapeTool("rectangle"); setActiveTool("rectangle"); showToast("Tool: Rectangle (R)"); }
        else if (key === "c") { setActiveShapeTool("circle"); setActiveTool("circle"); showToast("Tool: Circle Node (C)"); }
        else if (key === "d") { setActiveShapeTool("diamond"); setActiveTool("diamond"); showToast("Tool: Decision Diamond (D)"); }
        else if (key === "l" && e.shiftKey) { setActiveLineTool("line"); setActiveTool("line"); showToast("Tool: Straight Line (Shift+L)"); }
        else if (key === "a") { setActiveLineTool("arrow"); setActiveTool("arrow"); showToast("Tool: Arrow (A)"); }
        else if (key === "b") { setActiveLineTool("bezier"); setActiveTool("bezier"); showToast("Tool: Chart Pattern Path (B)"); }
        else if (key === "n") { setActiveNoteTool("sticky"); setActiveTool("sticky"); showToast("Tool: Sticky Note (N)"); }
        else if (key === "t") { setActiveNoteTool("text"); setActiveTool("text"); showToast("Tool: Text Label (T)"); }
        else if (key === "w") { setActiveNoteTool("annotation"); setActiveTool("annotation"); showToast("Tool: Annotation Leader Line (W)"); }
        else if (key === "e") { setActiveTool("eraser"); showToast("Tool: Precision Eraser (E)"); }
        else if (key === "z" && !e.shiftKey) { setActiveTool("zoom"); showToast("Tool: Zoom (Z)"); }
        else if (key === "z" && e.shiftKey) { setActiveTool("marquee_zoom"); showToast("Tool: Marquee Zoom (Shift+Z)"); }
        else if (key === "f") { setActiveForexTool("fibo"); setActiveTool("fibo"); showToast("Forex Tool: Fibonacci Retracement (F)"); }
        else if (key === "l" && !e.shiftKey) { setActiveForexTool("long"); setActiveTool("long"); showToast("Forex Tool: Long Position (L)"); }
        else if (key === "s") { setActiveForexTool("short"); setActiveTool("short"); showToast("Forex Tool: Short Position (S)"); }
        else if (key === "o") { setActiveForexTool("orderblock"); setActiveTool("orderblock"); showToast("Forex Tool: Order Block Zone (O)"); }
        else if (key === "g") { setActiveForexTool("fvg"); setActiveTool("fvg"); showToast("Forex Tool: Fair Value Gap / FVG (G)"); }
        else if (key === "k") { setActiveForexTool("bos"); setActiveTool("bos"); showToast("Forex Tool: Break of Structure / BOS (K)"); }
        else if (key === "q") { setActiveForexTool("liquidity"); setActiveTool("liquidity"); showToast("Forex Tool: Liquidity Pool / $$$ (Q)"); }
        else if (key === "u") { setActiveForexTool("bullish_candle"); setActiveTool("bullish_candle"); showToast("Forex Tool: Bullish Candlestick (U)"); }
        else if (key === "j") { setActiveForexTool("bearish_candle"); setActiveTool("bearish_candle"); showToast("Forex Tool: Bearish Candlestick (J)"); }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        if (isSpacePressed.current) {
          isSpacePressed.current = false;
          setIsSpaceHeld(false);
        }
      }
    };

    const handleBlur = () => {
      if (isSpacePressed.current) {
        isSpacePressed.current = false;
        setIsSpaceHeld(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [selectedShapeIds, shapes, redoStack]);

  /* -------------------------- Canvas Render Loop -------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Background Theme
    if (bgGrid === "dark") {
      ctx.fillStyle = "#121417";
    } else if (bgGrid === "chalkboard") {
      ctx.fillStyle = "#064e3b";
    } else {
      ctx.fillStyle = "#f8fafc";
    }
    ctx.fillRect(0, 0, width, height);

    // Save context transform for Panning & Zooming
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw Grid Background Pattern
    const isDarkBg = bgGrid === "dark" || bgGrid === "chalkboard";
    const gridColor = isDarkBg ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";

    if (bgGrid === "dots") {
      const dotSpacing = 24;
      const startX = Math.floor(-pan.x / zoom / dotSpacing) * dotSpacing;
      const endX = startX + width / zoom + dotSpacing * 2;
      const startY = Math.floor(-pan.y / zoom / dotSpacing) * dotSpacing;
      const endY = startY + height / zoom + dotSpacing * 2;

      ctx.fillStyle = gridColor;
      for (let x = startX; x < endX; x += dotSpacing) {
        for (let y = startY; y < endY; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2 / zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (bgGrid === "lines") {
      const lineSpacing = 30;
      const startX = Math.floor(-pan.x / zoom / lineSpacing) * lineSpacing;
      const endX = startX + width / zoom + lineSpacing * 2;
      const startY = Math.floor(-pan.y / zoom / lineSpacing) * lineSpacing;
      const endY = startY + height / zoom + lineSpacing * 2;

      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1 / zoom;
      ctx.beginPath();
      for (let x = startX; x < endX; x += lineSpacing) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
      }
      for (let y = startY; y < endY; y += lineSpacing) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }
      ctx.stroke();
    }

    // Render All Shapes (Back-to-Front)
    shapes.forEach((s) => {
      if (!s.isHidden) {
        const isSel = selectedShapeIds.includes(s.id);
        renderWhiteboardShape(ctx, s, isSel, defaultRiskReward);
      }
    });

    // Render Currently Active In-Progress Shape
    if (currentShape) {
      renderWhiteboardShape(ctx, currentShape, false, defaultRiskReward);
    }

    // Render Multi-Select or Marquee Zoom Drag Box
    if (marqueeBox) {
      const minX = Math.min(marqueeBox.x1, marqueeBox.x2);
      const maxX = Math.max(marqueeBox.x1, marqueeBox.x2);
      const minY = Math.min(marqueeBox.y1, marqueeBox.y2);
      const maxY = Math.max(marqueeBox.y1, marqueeBox.y2);
      const boxW = maxX - minX;
      const boxH = maxY - minY;

      if (marqueeBox.mode === "zoom") {
        ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
        ctx.fillRect(minX, minY, boxW, boxH);
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1.8 / zoom;
        ctx.setLineDash([5 / zoom, 3 / zoom]);
        ctx.strokeRect(minX, minY, boxW, boxH);
        ctx.setLineDash([]);

        if (boxW > 60 / zoom && boxH > 24 / zoom) {
          ctx.fillStyle = "#d97706";
          ctx.font = `bold ${Math.max(10, 12 / zoom)}px sans-serif`;
          ctx.fillText("🔍 Zoom Area", minX + 6 / zoom, minY + 16 / zoom);
        }
      } else {
        ctx.fillStyle = "rgba(59, 130, 246, 0.12)";
        ctx.fillRect(minX, minY, boxW, boxH);
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 1.5 / zoom;
        ctx.setLineDash([4 / zoom, 4 / zoom]);
        ctx.strokeRect(minX, minY, boxW, boxH);
        ctx.setLineDash([]);
      }
    }

    ctx.restore();
  }, [shapes, currentShape, bgGrid, zoom, pan, selectedShapeIds, marqueeBox, defaultRiskReward]);

  /* ------------------------- Tool Selection & Synced Categories ------------- */

  const selectTool = (tool: ToolType) => {
    setActiveTool(tool);
    if (["fibo", "long", "short", "orderblock", "fvg", "bos", "liquidity", "bullish_candle", "bearish_candle"].includes(tool)) {
      setActiveForexTool(tool as any);
    } else if (tool === "pencil" || tool === "highlighter") {
      setActivePenTool(tool);
    } else if (tool === "rectangle" || tool === "circle" || tool === "diamond") {
      setActiveShapeTool(tool);
    } else if (tool === "line" || tool === "arrow" || tool === "bezier") {
      setActiveLineTool(tool);
    } else if (tool === "text" || tool === "sticky" || tool === "annotation") {
      setActiveNoteTool(tool);
    }
  };

  /* ------------------------- Coordinate Conversions ----------------------- */

  const getCanvasCoords = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const rawPt = {
      x: (screenX - pan.x) / zoom,
      y: (screenY - pan.y) / zoom,
    };

    if (snapToGrid && activeTool !== "pencil" && activeTool !== "highlighter" && activeTool !== "eraser") {
      return {
        x: Math.round(rawPt.x / gridSnapSize) * gridSnapSize,
        y: Math.round(rawPt.y / gridSnapSize) * gridSnapSize,
      };
    }

    return rawPt;
  };

  /* ------------------------- Precision Part-By-Part Eraser ---------------- */

  const performPrecisionErasing = (eraserPt: { x: number; y: number }, radius: number = eraserSize) => {
    setShapes((prevShapes) => {
      let result: Shape[] = [];

      for (const s of prevShapes) {
        // Skip precision erasing on locked or hidden shapes!
        if (s.isLocked || s.isHidden) {
          result.push(s);
          continue;
        }

        if (s.type === "pencil" || s.type === "highlighter" || s.type === "bezier") {
          const subPaths: { x: number; y: number }[][] = [];
          let currentSub: { x: number; y: number }[] = [];

          for (const p of s.points) {
            const dist = Math.hypot(p.x - eraserPt.x, p.y - eraserPt.y);
            if (dist > radius) {
              currentSub.push(p);
            } else {
              if (currentSub.length > 0) {
                subPaths.push(currentSub);
                currentSub = [];
              }
            }
          }
          if (currentSub.length > 0) {
            subPaths.push(currentSub);
          }

          subPaths.forEach((pts, idx) => {
            if (pts.length > (s.type === "pencil" || s.type === "highlighter" ? 1 : 0)) {
              result.push({
                ...s,
                id: `${s.id}_part_${idx}_${Date.now()}`,
                points: pts,
              });
            }
          });
        } else {
          if (!isPointInShape(eraserPt, s)) {
            result.push(s);
          }
        }
      }

      return result;
    });
  };

  /* ------------------------- Favorites Floating Bar Dragging --------------- */

  const handleFavDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    isDraggingFav.current = true;
    dragFavStart.current = { x: e.clientX - favPos.x, y: e.clientY - favPos.y };

    const handleFavMouseMove = (ev: MouseEvent) => {
      if (!isDraggingFav.current) return;
      setFavPos({
        x: Math.max(0, Math.min(window.innerWidth - 100, ev.clientX - dragFavStart.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 50, ev.clientY - dragFavStart.current.y)),
      });
    };

    const handleFavMouseUp = () => {
      isDraggingFav.current = false;
      window.removeEventListener("mousemove", handleFavMouseMove);
      window.removeEventListener("mouseup", handleFavMouseUp);
    };

    window.addEventListener("mousemove", handleFavMouseMove);
    window.addEventListener("mouseup", handleFavMouseUp);
  };

  const toggleFavoriteTool = (toolToToggle: Tool) => {
    setFavoritedTools((prev) =>
      prev.includes(toolToToggle)
        ? prev.filter((t) => t !== toolToToggle)
        : [...prev, toolToToggle]
    );
    showToast(favoritedTools.includes(toolToToggle) ? "Removed from Favorites Toolbar" : "Added to Favorites Toolbar!");
  };

  /* ------------------------- Object Lock Toggle Function -------------------- */

  const toggleLockShape = (shapeId: string) => {
    setShapes((prev) =>
      prev.map((s) => {
        if (s.id !== shapeId) return s;
        const nextLock = !s.isLocked;
        showToast(nextLock ? "Locked object! 🔒 (Cannot be moved or deleted)" : "Unlocked object! 🔓");
        return { ...s, isLocked: nextLock };
      })
    );
    setContextMenu(null);
  };

  /* ------------------------- Object Visibility Toggle Function -------------- */

  const toggleHideShape = (shapeId: string) => {
    setShapes((prev) =>
      prev.map((s) => {
        if (s.id !== shapeId) return s;
        const nextHidden = !s.isHidden;
        showToast(nextHidden ? "Hidden layer 🙈" : "Visible layer 👁️");
        return { ...s, isHidden: nextHidden };
      })
    );
  };

  /* ------------------------- Layer Reordering Functions --------------------- */

  const moveLayerUp = (index: number) => {
    if (index >= shapes.length - 1) return;
    setShapes((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  const moveLayerDown = (index: number) => {
    if (index <= 0) return;
    setShapes((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  /* ------------------------- Drawing & Selection Handlers ------------------- */

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setExportOpen(false);
    setBgOpen(false);
    setSettingsOpen(false);
    setFlyoutGroup(null);
    setContextMenu(null);
    setTabContextMenu(null);
    setDiagramsMenuOpen(false);

    if (activeTool === "hand" || isSpaceHeld || isSpacePressed.current || e.button === 1 || e.buttons === 4) {
      isPanning.current = true;
      startPan.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    const pt = getCanvasCoords(e);

    if (activeTool === "zoom" || activeTool === "marquee_zoom") {
      isDrawing.current = true;
      dragStartPt.current = pt;
      setMarqueeBox({ x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y, mode: "zoom" });
      return;
    }

    if (activeTool === "eraser") {
      performPrecisionErasing(pt, eraserSize);
      return;
    }

    if (activeTool === "select" && selectedShapeIds.length === 1) {
      const selShape = shapes.find((s) => s.id === selectedShapeIds[0]);
      if (selShape && !selShape.isLocked && !selShape.isHidden) {
        const handleHit = getResizeHandleHit(pt, selShape);
        if (handleHit) {
          setActiveResizeHandle({ shapeId: selShape.id, handle: handleHit });
          dragStartPt.current = pt;
          return;
        }
      }
    }

    if (activeTool === "select") {
      const hitShape = [...shapes].reverse().find((s) => !s.isHidden && isPointInShape(pt, s));

      if (hitShape) {
        setIsInspectorOpen(true);
        if (e.altKey && !hitShape.isLocked) {
          const duplicatedShape: Shape = {
            ...hitShape,
            id: `shape_dup_${Date.now()}`,
            points: hitShape.points.map((p) => ({ x: p.x + 20, y: p.y + 20 })),
          };
          setShapes((prev) => [...prev, duplicatedShape]);
          setSelectedShapeIds([duplicatedShape.id]);
          isDraggingShape.current = true;
          dragStartPt.current = pt;
          showToast("Duplicated object! (Alt + Drag)");
          return;
        }

        if (e.shiftKey) {
          setSelectedShapeIds((prev) => (prev.includes(hitShape.id) ? prev.filter((id) => id !== hitShape.id) : [...prev, hitShape.id]));
        } else if (!selectedShapeIds.includes(hitShape.id)) {
          setSelectedShapeIds([hitShape.id]);
        }

        if (!hitShape.isLocked) {
          isDraggingShape.current = true;
          dragStartPt.current = pt;
        } else {
          showToast("Object is locked 🔒");
        }
      } else {
        if (!e.shiftKey) {
          setSelectedShapeIds([]);
          setIsInspectorOpen(false);
        }
        isDrawing.current = true;
        dragStartPt.current = pt;
        setMarqueeBox({ x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y, mode: "select" });
      }
      return;
    }

    // Deselect and collapse inspector panel when clicking empty canvas to draw
    setSelectedShapeIds([]);
    setIsInspectorOpen(false);

    if (activeTool === "bezier") {
      if (currentShape && currentShape.type === "bezier") {
        setCurrentShape({
          ...currentShape,
          points: [...currentShape.points, pt],
        });
      } else {
        const newShape: Shape = {
          id: `shape_${Date.now()}`,
          type: "bezier",
          color: strokeColor,
          strokeWidth,
          lineStyle,
          isLocked: autoLockObjects,
          points: [pt, pt],
        };
        setCurrentShape(newShape);
      }
      return;
    }

    isDrawing.current = true;

    if (activeTool === "text") {
      if (inlineEditor) handleCommitInlineText();
      setInlineEditor({
        x: pt.x,
        y: pt.y,
        text: "",
        shapeId: null,
        isSticky: false,
        fontSize,
        fontFamily,
        fontWeight,
        fontStyle,
        textDecoration,
        textAlign,
        textTransform,
        letterSpacing,
        lineHeight,
        color: strokeColor,
      });
      return;
    }

    if (activeTool === "sticky") {
      if (inlineEditor) handleCommitInlineText();
      setInlineEditor({
        x: pt.x,
        y: pt.y,
        text: "",
        shapeId: null,
        isSticky: true,
        fontSize,
        fontFamily,
        fontWeight,
        fontStyle,
        textDecoration,
        textAlign,
        textTransform,
        letterSpacing,
        lineHeight,
        color: "#1e293b",
      });
      return;
    }

    const defaultForexColor =
      activeTool === "long" || activeTool === "bullish_candle"
        ? "#10b981"
        : activeTool === "short" || activeTool === "bearish_candle"
        ? "#dc3545"
        : activeTool === "orderblock"
        ? "#8b5cf6"
        : activeTool === "fvg"
        ? "#f59e0b"
        : activeTool === "bos"
        ? "#3b82f6"
        : activeTool === "liquidity"
        ? "#e11d48"
        : strokeColor;

    const newShape: Shape = {
      id: `shape_${Date.now()}`,
      type: activeTool,
      color: defaultForexColor,
      strokeWidth,
      lineStyle,
      isLocked: autoLockObjects,
      points: [pt],
      stickyColor: (activeTool as string) === "sticky" ? stickyColor : undefined,
    };

    setCurrentShape(newShape);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning.current) {
      setPan({
        x: e.clientX - startPan.current.x,
        y: e.clientY - startPan.current.y,
      });
      return;
    }

    const pt = getCanvasCoords(e);
    setCursorCoords(pt);

    // 0. Update hovered resize handle for dynamic expandable cursor at node edges
    if (!isDrawing.current && !isDraggingShape.current && !isPanning.current) {
      let foundHandle: { shapeId: string; handle: ResizeHandle } | null = null;
      if (selectedShapeIds.length > 0) {
        for (const id of selectedShapeIds) {
          const shape = shapes.find((s) => s.id === id);
          if (shape && !shape.isLocked && !shape.isHidden) {
            const h = getResizeHandleHit(pt, shape);
            if (h) {
              foundHandle = { shapeId: shape.id, handle: h };
              break;
            }
          }
        }
      }
      setHoveredResizeHandle(foundHandle);
    }

    // 1. Move/Drag existing selected shape
    if (isDraggingShape.current && selectedShapeIds.length > 0) {
      const dx = pt.x - dragStartPt.current.x;
      const dy = pt.y - dragStartPt.current.y;
      dragStartPt.current = pt;

      setShapes((prev) =>
        prev.map((s) => {
          if (selectedShapeIds.includes(s.id) && !s.isLocked) {
            return {
              ...s,
              points: s.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
            };
          }
          return s;
        })
      );
      return;
    }

    // 2. Interactive Resize Handle Drag (Supports Shift-key proportional constraint)
    if (activeResizeHandle) {
      const targetShape = shapes.find((s) => s.id === activeResizeHandle.shapeId);
      if (targetShape && !targetShape.isLocked) {
        const resizedShape = resizeShapePoints(targetShape, activeResizeHandle.handle, pt, e.shiftKey || isAspectLocked);
        setShapes((prev) =>
          prev.map((s) => (s.id === targetShape.id ? resizedShape : s))
        );
      }
      return;
    }

    // 3. Selection or Marquee Zoom Box Drag
    if (isDrawing.current && dragStartPt.current && (activeTool === "select" || activeTool === "zoom" || activeTool === "marquee_zoom")) {
      const mode = (activeTool === "zoom" || activeTool === "marquee_zoom") ? "zoom" : "select";
      setMarqueeBox({
        x1: dragStartPt.current.x,
        y1: dragStartPt.current.y,
        x2: pt.x,
        y2: pt.y,
        mode,
      });
      return;
    }

    // 4. Live Erasing while dragging
    if (isDrawing.current && activeTool === "eraser") {
      performPrecisionErasing(pt, eraserSize);
      return;
    }

    if (!isDrawing.current || !currentShape) return;

    // 5. Draw / Expand active shape
    if (
      currentShape.type === "pencil" ||
      currentShape.type === "pen" ||
      currentShape.type === "highlighter"
    ) {
      setCurrentShape({
        ...currentShape,
        points: [...currentShape.points, pt],
      });
    } else if (
      currentShape.type === "rectangle" ||
      currentShape.type === "circle" ||
      currentShape.type === "diamond" ||
      currentShape.type === "arrow" ||
      currentShape.type === "line" ||
      currentShape.type === "annotation" ||
      currentShape.type === "long" ||
      currentShape.type === "short" ||
      currentShape.type === "fibo" ||
      currentShape.type === "orderblock" ||
      currentShape.type === "fvg" ||
      currentShape.type === "bos" ||
      currentShape.type === "liquidity" ||
      currentShape.type === "bullish_candle" ||
      currentShape.type === "bearish_candle"
    ) {
      setCurrentShape({
        ...currentShape,
        points: [currentShape.points[0], pt],
      });
    }
  };

  const handleMouseUp = () => {
    isPanning.current = false;
    isDraggingShape.current = false;
    setActiveResizeHandle(null);

    // Finalize Multi-Select or Marquee Zoom
    if (marqueeBox) {
      const minX = Math.min(marqueeBox.x1, marqueeBox.x2);
      const maxX = Math.max(marqueeBox.x1, marqueeBox.x2);
      const minY = Math.min(marqueeBox.y1, marqueeBox.y2);
      const maxY = Math.max(marqueeBox.y1, marqueeBox.y2);
      const boxW = maxX - minX;
      const boxH = maxY - minY;

      if (marqueeBox.mode === "zoom") {
        if (boxW >= 10 && boxH >= 10) {
          // Marquee Zoom area
          const canvasEl = canvasRef.current;
          const viewW = canvasEl ? canvasEl.width : window.innerWidth;
          const viewH = canvasEl ? canvasEl.height : window.innerHeight;
          const cx = minX + boxW / 2;
          const cy = minY + boxH / 2;

          const fitZoom = Math.min(3.0, Math.max(0.3, Math.min(viewW / boxW, viewH / boxH) * 0.9));
          const newPanX = viewW / 2 - cx * fitZoom;
          const newPanY = viewH / 2 - cy * fitZoom;

          setZoom(fitZoom);
          setPan({ x: newPanX, y: newPanY });
          showToast(`Marquee Zoom: ${Math.round(fitZoom * 100)}%`);
        } else {
          // Single click point zoom
          const newZoom = Math.min(3.0, zoom * 1.25);
          const startPt = dragStartPt.current || { x: minX, y: minY };
          const newPanX = startPt.x * zoom + pan.x - startPt.x * newZoom;
          const newPanY = startPt.y * zoom + pan.y - startPt.y * newZoom;
          setZoom(newZoom);
          setPan({ x: newPanX, y: newPanY });
        }
      } else {
        // Marquee Selection Mode
        if (boxW >= 4 || boxH >= 4) {
          const enclosedShapes = shapes.filter((s) => isShapeInMarquee(s, minX, maxX, minY, maxY));
          const newSelectedIds = enclosedShapes.map((s) => s.id);
          setSelectedShapeIds(newSelectedIds);
          if (newSelectedIds.length > 0) {
            setIsInspectorOpen(true);
            showToast(`Selected ${newSelectedIds.length} object${newSelectedIds.length > 1 ? "s" : ""}`);
          }
        }
      }

      setMarqueeBox(null);
    }

    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (currentShape) {
      const finalShape = {
        ...currentShape,
        text: currentShape.type === "annotation" && !currentShape.text ? "Annotation" : currentShape.text,
      };
      setShapes((prev) => [...prev, finalShape]);
      if (finalShape.type === "annotation") {
        setSelectedShapeIds([finalShape.id]);
        setIsInspectorOpen(true);
      }
      setCurrentShape(null);
      setRedoStack([]);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentShape && currentShape.type === "bezier") {
      setShapes((prev) => [...prev, currentShape]);
      setCurrentShape(null);
      setRedoStack([]);
      showToast("Chart Pattern Path completed!");
      return;
    }

    const pt = getCanvasCoords(e);
    const hitShape = [...shapes].reverse().find((s) => !s.isHidden && isPointInShape(pt, s));
    if (hitShape && (hitShape.type === "sticky" || hitShape.type === "text" || hitShape.type === "annotation")) {
      if (hitShape.isLocked) {
        showToast("Locked item! Unlock it first to edit 🔓");
        return;
      }
      setSelectedShapeIds([hitShape.id]);
      setInlineEditor({
        x: hitShape.points[0].x,
        y: hitShape.points[0].y,
        text: hitShape.text || "",
        shapeId: hitShape.id,
        isSticky: hitShape.type === "sticky",
        fontSize: hitShape.fontSize || fontSize,
        fontFamily: hitShape.fontFamily || fontFamily,
        fontWeight: hitShape.fontWeight || fontWeight,
        fontStyle: hitShape.fontStyle || fontStyle,
        textDecoration: hitShape.textDecoration || textDecoration,
        textAlign: hitShape.textAlign || textAlign,
        textTransform: hitShape.textTransform || textTransform,
        letterSpacing: hitShape.letterSpacing ?? letterSpacing,
        lineHeight: hitShape.lineHeight || lineHeight,
        color: hitShape.textColor || hitShape.color || strokeColor,
      });
      return;
    }
  };

  /* Commit in-place inline text editor changes (Photoshop / Word / Figma live typing) */
  const handleCommitInlineText = () => {
    if (!inlineEditor) return;
    const txt = inlineEditor.text.trim();
    if (!txt) {
      if (inlineEditor.shapeId) {
        setShapes((prev) => prev.filter((s) => s.id !== inlineEditor.shapeId));
        setSelectedShapeIds([]);
      }
      setInlineEditor(null);
      return;
    }

    if (inlineEditor.shapeId) {
      setShapes((prev) =>
        prev.map((s) =>
          s.id === inlineEditor.shapeId
            ? {
                ...s,
                text: inlineEditor.text,
                fontSize: inlineEditor.fontSize || fontSize,
                fontFamily: inlineEditor.fontFamily || fontFamily,
                fontWeight: inlineEditor.fontWeight || fontWeight,
                fontStyle: inlineEditor.fontStyle || fontStyle,
                textDecoration: inlineEditor.textDecoration || textDecoration,
                textAlign: inlineEditor.textAlign || textAlign,
                textTransform: inlineEditor.textTransform || textTransform,
                letterSpacing: inlineEditor.letterSpacing ?? letterSpacing,
                lineHeight: inlineEditor.lineHeight || lineHeight,
              }
            : s
        )
      );
      setSelectedShapeIds([inlineEditor.shapeId]);
      showToast("Updated text!");
    } else {
      const newShape: Shape = {
        id: `shape_${Date.now()}`,
        type: inlineEditor.isSticky ? "sticky" : "text",
        color: inlineEditor.color || strokeColor,
        strokeWidth,
        lineStyle,
        isLocked: autoLockObjects,
        points: [{ x: inlineEditor.x, y: inlineEditor.y }],
        text: inlineEditor.text,
        stickyColor: inlineEditor.isSticky ? stickyColor : undefined,
        fontSize: inlineEditor.fontSize || fontSize,
        fontFamily: inlineEditor.fontFamily || fontFamily,
        fontWeight: inlineEditor.fontWeight || fontWeight,
        fontStyle: inlineEditor.fontStyle || fontStyle,
        textDecoration: inlineEditor.textDecoration || textDecoration,
        textAlign: inlineEditor.textAlign || textAlign,
        textTransform: inlineEditor.textTransform || textTransform,
        letterSpacing: inlineEditor.letterSpacing ?? letterSpacing,
        lineHeight: inlineEditor.lineHeight || lineHeight,
      };
      setShapes((prev) => [...prev, newShape]);
      setSelectedShapeIds([newShape.id]);
      setActiveTool("select");
      showToast(inlineEditor.isSticky ? "Created sticky note!" : "Created text label!");
    }

    setInlineEditor(null);
  };

  /* Context Menu Object Layering & Duplicate Actions */
  const duplicateSelectedObject = (shapeToDup: Shape) => {
    const dup: Shape = {
      ...shapeToDup,
      id: `shape_dup_${Date.now()}`,
      isLocked: false,
      points: shapeToDup.points.map((p) => ({ x: p.x + 25, y: p.y + 25 })),
    };
    setShapes((prev) => [...prev, dup]);
    setSelectedShapeIds([dup.id]);
    setContextMenu(null);
    showToast("Duplicated object!");
  };

  const deleteSelectedObject = (shapeId: string) => {
    const target = shapes.find((s) => s.id === shapeId);
    if (target?.isLocked) {
      showToast("Locked object cannot be deleted! Unlock it first 🔓");
      return;
    }

    setShapes((prev) => prev.filter((s) => s.id !== shapeId));
    setSelectedShapeIds([]);
    setContextMenu(null);
    showToast("Deleted object!");
  };

  const bringToFront = (shapeId: string) => {
    setShapes((prev) => {
      const target = prev.find((s) => s.id === shapeId);
      if (!target) return prev;
      return [...prev.filter((s) => s.id !== shapeId), target];
    });
    setContextMenu(null);
    showToast("Brought to front!");
  };

  const sendToBack = (shapeId: string) => {
    setShapes((prev) => {
      const target = prev.find((s) => s.id === shapeId);
      if (!target) return prev;
      return [target, ...prev.filter((s) => s.id !== shapeId)];
    });
    setContextMenu(null);
    showToast("Sent to back!");
  };

  /* Bulk Apply Color / Properties */
  const applyColorToSelected = (color: string) => {
    setStrokeColor(color);
    if (selectedShapeIds.length > 0) {
      setShapes((prev) =>
        prev.map((s) => (selectedShapeIds.includes(s.id) && !s.isLocked ? { ...s, color, strokeColor: color } : s))
      );
    }
  };

  const applyFillColorToSelected = (fColor: string) => {
    setFillColor(fColor);
    if (selectedShapeIds.length > 0) {
      setShapes((prev) =>
        prev.map((s) => (selectedShapeIds.includes(s.id) && !s.isLocked ? { ...s, fillColor: fColor } : s))
      );
    }
  };

  const applyFillStyleToSelected = (fStyle: "solid" | "gradient" | "none" | "translucent") => {
    setFillStyle(fStyle);
    if (selectedShapeIds.length > 0) {
      setShapes((prev) =>
        prev.map((s) =>
          selectedShapeIds.includes(s.id) && !s.isLocked
            ? {
                ...s,
                fillStyle: fStyle,
                candleStyle: fStyle === "none" ? "hollow" : fStyle === "solid" ? "solid" : "translucent",
              }
            : s
        )
      );
    }
  };

  const applyGradientEndColorToSelected = (gColor: string) => {
    setGradientEndColor(gColor);
    if (selectedShapeIds.length > 0) {
      setShapes((prev) =>
        prev.map((s) => (selectedShapeIds.includes(s.id) && !s.isLocked ? { ...s, gradientEndColor: gColor } : s))
      );
    }
  };

  const applyOpacityToSelected = (op: number) => {
    setOpacity(op);
    if (selectedShapeIds.length > 0) {
      setShapes((prev) =>
        prev.map((s) => (selectedShapeIds.includes(s.id) && !s.isLocked ? { ...s, opacity: op } : s))
      );
    }
  };

  const applyCornerRadiusToSelected = (rad: number) => {
    setCornerRadius(rad);
    if (selectedShapeIds.length > 0) {
      setShapes((prev) =>
        prev.map((s) => (selectedShapeIds.includes(s.id) && !s.isLocked ? { ...s, cornerRadius: rad } : s))
      );
    }
  };

  const applyUpperWickLengthToSelected = (len: number) => {
    setUpperWickLength(len);
    if (selectedShapeIds.length > 0) {
      setShapes((prev) =>
        prev.map((s) => (selectedShapeIds.includes(s.id) && !s.isLocked ? { ...s, upperWickLength: len } : s))
      );
    }
  };

  const applyLowerWickLengthToSelected = (len: number) => {
    setLowerWickLength(len);
    if (selectedShapeIds.length > 0) {
      setShapes((prev) =>
        prev.map((s) => (selectedShapeIds.includes(s.id) && !s.isLocked ? { ...s, lowerWickLength: len } : s))
      );
    }
  };

  const applyWickColorToSelected = (wColor: string) => {
    setWickColor(wColor);
    if (selectedShapeIds.length > 0) {
      setShapes((prev) =>
        prev.map((s) => (selectedShapeIds.includes(s.id) && !s.isLocked ? { ...s, wickColor: wColor } : s))
      );
    }
  };

  const applyStickyColorToSelected = (sColor: StickyColor) => {
    setStickyColor(sColor);
    if (selectedShapeIds.length > 0) {
      setShapes((prev) =>
        prev.map((s) => (selectedShapeIds.includes(s.id) && !s.isLocked ? { ...s, stickyColor: sColor } : s))
      );
    }
  };

  /* Alignment Engine (Figma-Standard: Align to selection bounding box / distribute evenly) */
  const handleAlignShapes = (alignType: "left" | "centerH" | "right" | "top" | "middleV" | "bottom" | "distributeH" | "distributeV") => {
    const targetIds = selectedShapeIds.length > 0 ? selectedShapeIds : selectedShapeId ? [selectedShapeId] : [];
    if (targetIds.length === 0) return;

    setShapes((prev) => {
      const activeShapes = prev.filter((s) => targetIds.includes(s.id) && !s.isLocked);
      if (activeShapes.length === 0) return prev;

      // Compute bounding boxes for all active selected shapes
      const bboxes = activeShapes.map((s) => {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        s.points.forEach((p) => {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        });
        if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 50; maxY = 50; }
        return {
          id: s.id,
          minX,
          minY,
          maxX,
          maxY,
          w: Math.max(1, maxX - minX),
          h: Math.max(1, maxY - minY),
          cx: (minX + maxX) / 2,
          cy: (minY + maxY) / 2,
        };
      });

      const overallMinX = Math.min(...bboxes.map((b) => b.minX));
      const overallMaxX = Math.max(...bboxes.map((b) => b.maxX));
      const overallMinY = Math.min(...bboxes.map((b) => b.minY));
      const overallMaxY = Math.max(...bboxes.map((b) => b.maxY));
      const overallCx = (overallMinX + overallMaxX) / 2;
      const overallCy = (overallMinY + overallMaxY) / 2;

      const offsets = new Map<string, { dx: number; dy: number }>();

      if (alignType === "left") {
        bboxes.forEach((b) => offsets.set(b.id, { dx: overallMinX - b.minX, dy: 0 }));
      } else if (alignType === "centerH") {
        bboxes.forEach((b) => offsets.set(b.id, { dx: overallCx - b.cx, dy: 0 }));
      } else if (alignType === "right") {
        bboxes.forEach((b) => offsets.set(b.id, { dx: overallMaxX - b.maxX, dy: 0 }));
      } else if (alignType === "top") {
        bboxes.forEach((b) => offsets.set(b.id, { dx: 0, dy: overallMinY - b.minY }));
      } else if (alignType === "middleV") {
        bboxes.forEach((b) => offsets.set(b.id, { dx: 0, dy: overallCy - b.cy }));
      } else if (alignType === "bottom") {
        bboxes.forEach((b) => offsets.set(b.id, { dx: 0, dy: overallMaxY - b.maxY }));
      } else if (alignType === "distributeH" && bboxes.length >= 2) {
        const sorted = [...bboxes].sort((a, b) => a.minX - b.minX);
        const totalW = sorted.reduce((sum, b) => sum + b.w, 0);
        const totalGap = (overallMaxX - overallMinX) - totalW;
        const gap = sorted.length > 1 ? totalGap / (sorted.length - 1) : 0;
        let curX = overallMinX;
        sorted.forEach((b) => {
          offsets.set(b.id, { dx: curX - b.minX, dy: 0 });
          curX += b.w + gap;
        });
      } else if (alignType === "distributeV" && bboxes.length >= 2) {
        const sorted = [...bboxes].sort((a, b) => a.minY - b.minY);
        const totalH = sorted.reduce((sum, b) => sum + b.h, 0);
        const totalGap = (overallMaxY - overallMinY) - totalH;
        const gap = sorted.length > 1 ? totalGap / (sorted.length - 1) : 0;
        let curY = overallMinY;
        sorted.forEach((b) => {
          offsets.set(b.id, { dx: 0, dy: curY - b.minY });
          curY += b.h + gap;
        });
      }

      return prev.map((s) => {
        const off = offsets.get(s.id);
        if (!off || (off.dx === 0 && off.dy === 0)) return s;
        return {
          ...s,
          points: s.points.map((p) => ({
            x: Math.round(p.x + off.dx),
            y: Math.round(p.y + off.dy),
          })),
        };
      });
    });
    showToast(`Aligned object(s): ${alignType}`);
  };

  /* Tab Management Functions with Custom Tab Name Input Modal & MAX 5 TABS PROMPT */
  const openCreateCanvasModal = (initialName?: string) => {
    if (tabs.length >= 5) {
      setMaxTabPromptOpen(true);
      showToast("Tab limit reached! (Maximum 5 tabs)");
      return;
    }
    setNewCanvasName(initialName || `Canvas ${tabs.length + 1}`);
    setCreateCanvasModalOpen(true);
  };

  const handleAddNewTab = () => {
    openCreateCanvasModal();
  };

  const handleSetBgGrid = (newTheme: "dots" | "lines" | "blank" | "dark" | "chalkboard") => {
    setBgGrid(newTheme);
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, theme: newTheme } : t))
    );
  };

  const handleConfirmCreateCustomCanvas = () => {
    const finalName = newCanvasName.trim() || `Canvas ${tabs.length + 1}`;
    if (tabs.length >= 5 && !tabs.some((t) => t.name === finalName)) {
      setMaxTabPromptOpen(true);
      showToast("Maximum 5 tabs reached! Please close a tab first.");
      return;
    }

    const newId = `canvas_${Date.now()}`;

    // Generate template shapes
    let initialShapes: Shape[] = [];
    if (newCanvasTemplate === "risk_1_3") {
      initialShapes = [
        { id: "pos", type: "long", color: "#10b981", strokeWidth: 2, points: [{ x: 180, y: 300 }, { x: 440, y: 140 }] },
        { id: "sl_line", type: "line", color: "#ef4444", strokeWidth: 2, lineStyle: "dashed", points: [{ x: 140, y: 360 }, { x: 480, y: 360 }] },
        { id: "sltxt", type: "text", color: "#ef4444", strokeWidth: 2, points: [{ x: 150, y: 380 }], text: "Stop Loss Invalidation (-20 Pips)" },
        { id: "tp_line", type: "line", color: "#10b981", strokeWidth: 2, lineStyle: "dashed", points: [{ x: 140, y: 140 }, { x: 480, y: 140 }] },
        { id: "tptxt", type: "text", color: "#10b981", strokeWidth: 2, points: [{ x: 150, y: 120 }], text: "Take Profit Target 1:3 (+60 Pips)" },
        {
          id: "note_risk",
          type: "sticky",
          color: "#16181c",
          strokeWidth: 2,
          points: [{ x: 520, y: 120 }],
          text: `📊 TRADE PLAN & RISK RULES\n\n• Entry Model: 1:3 R:R Institutional Setup\n• Max Risk: 1.0% Capital\n• Target: Liquidity High Pool\n• Invalidation: Below Key Low`,
          stickyColor: "#bbf7d0",
        },
      ];
    } else if (newCanvasTemplate === "smc_zones") {
      initialShapes = [
        { id: "ob", type: "rectangle", color: "#8b5cf6", strokeWidth: 2, points: [{ x: 120, y: 260 }, { x: 320, y: 340 }] },
        { id: "obtxt", type: "text", color: "#8b5cf6", strokeWidth: 2, points: [{ x: 130, y: 295 }], text: "Bullish Order Block (OB Demand Zone)" },
        { id: "fvg", type: "rectangle", color: "#f59e0b", strokeWidth: 2, points: [{ x: 260, y: 180 }, { x: 420, y: 240 }] },
        { id: "fvgtxt", type: "text", color: "#f59e0b", strokeWidth: 2, points: [{ x: 270, y: 210 }], text: "Fair Value Gap (FVG Imbalance)" },
        { id: "bos", type: "arrow", color: "#3b82f6", strokeWidth: 3, points: [{ x: 320, y: 300 }, { x: 550, y: 120 }] },
        { id: "bostxt", type: "text", color: "#3b82f6", strokeWidth: 2, points: [{ x: 420, y: 190 }], text: "Break of Structure (BOS) ↗" },
        {
          id: "note_smc",
          type: "sticky",
          color: "#16181c",
          strokeWidth: 2,
          points: [{ x: 580, y: 120 }],
          text: `⚡ SMC ANALYSIS GUIDE\n\n• HTF Trend Bias: Bullish Order Flow\n• Target Zone: External Range Liquidity\n• Confirmation: LTF CHoCH Trigger\n• Entry: 50% FVG Mitigation`,
          stickyColor: "#bae6fd",
        },
      ];
    } else if (newCanvasTemplate === "killzones") {
      initialShapes = [
        { id: "asia_box", type: "rectangle", color: "#64748b", strokeWidth: 2, points: [{ x: 100, y: 180 }, { x: 260, y: 320 }] },
        { id: "asia_txt", type: "text", color: "#64748b", strokeWidth: 2, points: [{ x: 110, y: 200 }], text: "Asian Range (00:00 - 06:00 GMT)" },
        { id: "london_box", type: "rectangle", color: "#3b82f6", strokeWidth: 2, points: [{ x: 290, y: 140 }, { x: 480, y: 350 }] },
        { id: "london_txt", type: "text", color: "#3b82f6", strokeWidth: 2, points: [{ x: 300, y: 160 }], text: "London Killzone (07:00 - 10:00 GMT)" },
        { id: "ny_box", type: "rectangle", color: "#ea580c", strokeWidth: 2, points: [{ x: 510, y: 120 }, { x: 700, y: 380 }] },
        { id: "ny_txt", type: "text", color: "#ea580c", strokeWidth: 2, points: [{ x: 520, y: 140 }], text: "New York Killzone (12:00 - 15:00 GMT)" },
        {
          id: "note_kz",
          type: "sticky",
          color: "#16181c",
          strokeWidth: 2,
          points: [{ x: 740, y: 120 }],
          text: `⏱️ KILLZONES RULES\n\n• Look for Asian High/Low manipulation.\n• London Judas Swing sweeps liquidity.\n• New York Open continuation impulse.`,
          stickyColor: "#fef08a",
        },
      ];
    } else if (newCanvasTemplate === "top_down") {
      initialShapes = [
        { id: "htf_box", type: "rectangle", color: "#3b82f6", strokeWidth: 2, points: [{ x: 100, y: 120 }, { x: 320, y: 420 }] },
        { id: "htf_txt", type: "text", color: "#3b82f6", strokeWidth: 2, points: [{ x: 110, y: 145 }], text: "1. High Timeframe (Daily/4H)" },
        { id: "itf_box", type: "rectangle", color: "#8b5cf6", strokeWidth: 2, points: [{ x: 350, y: 120 }, { x: 570, y: 420 }] },
        { id: "itf_txt", type: "text", color: "#8b5cf6", strokeWidth: 2, points: [{ x: 360, y: 145 }], text: "2. Intermediate (1H/15m)" },
        { id: "ltf_box", type: "rectangle", color: "#10b981", strokeWidth: 2, points: [{ x: 600, y: 120 }, { x: 820, y: 420 }] },
        { id: "ltf_txt", type: "text", color: "#10b981", strokeWidth: 2, points: [{ x: 610, y: 145 }], text: "3. Low Timeframe (5m/1m Trigger)" },
        {
          id: "note_td",
          type: "sticky",
          color: "#16181c",
          strokeWidth: 2,
          points: [{ x: 850, y: 120 }],
          text: `🔍 TOP-DOWN FRAMEWORK\n\n• HTF: Directional Order Flow\n• ITF: Key Supply/Demand POIs\n• LTF: Entry confirmation & tight SL`,
          stickyColor: "#ddd6fe",
        },
      ];
    }

    const newTab: DiagramTab = {
      id: newId,
      name: finalName,
      shapes: initialShapes,
      theme: newCanvasTheme,
      snapToGrid: newCanvasSnapToGrid,
    };

    // Save active tab state and add new tab
    setTabs((prev) => {
      const updated = prev.map((t) =>
        t.id === activeTabId ? { ...t, shapes, theme: bgGrid, snapToGrid } : t
      );
      return [...updated, newTab];
    });

    setActiveTabId(newId);
    setShapes(initialShapes);
    setBgGrid(newCanvasTheme);
    setSnapToGrid(newCanvasSnapToGrid);
    setCreateCanvasModalOpen(false);
    setViewMode("canvas");
    showToast(`Created canvas: "${finalName}"!`);
  };

  const handleConfirmCreateTab = () => {
    handleConfirmCreateCustomCanvas();
  };

  const handleStartRenameTab = (tabId: string, currentName: string) => {
    setEditingTabId(tabId);
    setEditingTabName(currentName);
    setTabContextMenu(null);
  };

  const handleSaveRenameTab = () => {
    if (!editingTabId) return;
    const finalName = editingTabName.trim() || "Untitled Canvas";
    setTabs((prev) => prev.map((t) => (t.id === editingTabId ? { ...t, name: finalName } : t)));
    setEditingTabId(null);
    setEditingTabName("");
    showToast(`Renamed tab to "${finalName}"`);
  };

  const handleDuplicateTab = (tabIdToDup: string) => {
    if (tabs.length >= 5) {
      setMaxTabPromptOpen(true);
      showToast("Tab limit reached! (Maximum 5 tabs)");
      return;
    }
    const sourceTab = tabs.find((t) => t.id === tabIdToDup);
    if (!sourceTab) return;
    const newId = `tab_${Date.now()}`;
    const newName = `${sourceTab.name} (Copy)`;
    const newTabShapes = sourceTab.id === activeTabId ? shapes : (sourceTab.shapes || []);
    const newTabTheme = sourceTab.id === activeTabId ? bgGrid : (sourceTab.theme || "dots");
    const newTabSnap = sourceTab.id === activeTabId ? snapToGrid : (sourceTab.snapToGrid ?? true);

    const duplicatedTab: DiagramTab = {
      id: newId,
      name: newName,
      shapes: newTabShapes,
      theme: newTabTheme,
      snapToGrid: newTabSnap,
    };

    setTabs((prev) => {
      const updated = prev.map((t) =>
        t.id === activeTabId ? { ...t, shapes, theme: bgGrid, snapToGrid } : t
      );
      return [...updated, duplicatedTab];
    });

    setActiveTabId(newId);
    setShapes(newTabShapes);
    setBgGrid(newTabTheme);
    setSnapToGrid(newTabSnap);
    setTabContextMenu(null);
    showToast(`Duplicated tab: "${newName}"`);
  };

  const handleCloseTab = (tabIdToClose: string) => {
    const tabToRemove = tabs.find((t) => t.id === tabIdToClose);
    if (tabToRemove) {
      const trashedItem: TrashedTab = {
        id: tabToRemove.id,
        name: tabToRemove.name,
        shapes: tabToRemove.id === activeTabId ? shapes : (tabToRemove.shapes || []),
        deletedAt: Date.now(),
      };
      setTrashedTabs((prev) => [trashedItem, ...prev]);
    }

    const remaining = tabs.filter((t) => t.id !== tabIdToClose);

    if (remaining.length === 0) {
      // Closing the single/last tab sends user directly back to Whiteboard Hub
      setTabs(INITIAL_TABS);
      setActiveTabId("canvas_1");
      setShapes([]);
      setViewMode("hub");
      setHubTab("drafts");
      showToast(`Closed "${tabToRemove?.name || "canvas"}" and returned to Whiteboard Hub`);
      return;
    }

    setTabs(remaining);
    if (activeTabId === tabIdToClose) {
      const nextTab = remaining[0];
      setActiveTabId(nextTab.id);
      setShapes(nextTab.shapes || []);
      setBgGrid(nextTab.theme || "dots");
      if (typeof nextTab.snapToGrid === "boolean") setSnapToGrid(nextTab.snapToGrid);
    }
    showToast(`Tab moved to Trash (retained for 30 days)`);
  };

  /* ---------------------- DRAFTS, SAMPLES, TRASH & SAVE HANDLERS ------------- */

  const handleSaveCurrentDraft = () => {
    const activeTab = tabs.find((t) => t.id === activeTabId);
    const draftName = activeTab ? activeTab.name : "Saved Whiteboard Draft";

    const newDraft: SavedDraft = {
      id: `draft_${Date.now()}`,
      name: draftName,
      shapes: [...shapes],
      savedAt: Date.now(),
    };

    setSavedDrafts((prev) => [newDraft, ...prev.filter((d) => d.name !== draftName)]);
    showToast(`Draft "${draftName}" saved successfully! You can resume anytime.`);
  };

  const loadSavedDraft = (draft: SavedDraft) => {
    if (tabs.length >= 5 && !tabs.some((t) => t.name === draft.name)) {
      setMaxTabPromptOpen(true);
      showToast("Max 5 tabs reached! Close a tab to load this draft.");
      return;
    }

    const existingTab = tabs.find((t) => t.name === draft.name);
    if (existingTab) {
      setActiveTabId(existingTab.id);
    } else {
      const newTabId = `tab_${Date.now()}`;
      setTabs((prev) => [...prev, { id: newTabId, name: draft.name }]);
      setActiveTabId(newTabId);
    }

    setShapes(draft.shapes);
    setDiagramsMenuOpen(false);
    showToast(`Loaded draft "${draft.name}"!`);
  };

  const handleDeleteCanvas = (canvasId: string, isTab?: boolean) => {
    // 1. Find if it matches a draft in savedDrafts
    const targetDraft = savedDrafts.find((d) => d.id === canvasId);
    if (targetDraft || !isTab) {
      setSavedDrafts((prev) => prev.filter((d) => d.id !== canvasId));
    }

    // 2. Find any open tab matching this tab/draft (by id or by name)
    const matchingTab = tabs.find((t) => t.id === canvasId || (targetDraft && t.name === targetDraft.name));

    if (matchingTab) {
      // Add to trashed tabs so user can restore if needed
      setTrashedTabs((prev) => [
        {
          id: matchingTab.id,
          name: matchingTab.name,
          shapes: matchingTab.id === activeTabId ? shapes : (matchingTab.shapes || []),
          deletedAt: Date.now(),
        },
        ...prev.filter((t) => t.id !== matchingTab.id),
      ]);

      if (tabs.length > 1) {
        const remaining = tabs.filter((t) => t.id !== matchingTab.id);
        setTabs(remaining);
        if (activeTabId === matchingTab.id) {
          const nextTab = remaining[0];
          setActiveTabId(nextTab.id);
          setShapes(nextTab.shapes || []);
          setBgGrid(nextTab.theme || "dots");
          if (typeof nextTab.snapToGrid === "boolean") setSnapToGrid(nextTab.snapToGrid);
        }
      } else {
        // If it was the only open tab, reset to a fresh default Canvas 1 with empty shapes
        const defaultTabId = `tab_${Date.now()}`;
        setTabs([{ id: defaultTabId, name: "Canvas 1" }]);
        setActiveTabId(defaultTabId);
        setShapes([]);
      }
    }

    showToast("Canvas deleted successfully!");
  };

  const deleteDraft = (draftId: string) => {
    handleDeleteCanvas(draftId);
  };

  const restoreTrashedTab = (item: TrashedTab) => {
    if (tabs.length >= 5) {
      setMaxTabPromptOpen(true);
      showToast("Cannot restore! Maximum 5 active tabs allowed.");
      return;
    }

    setTabs((prev) => [...prev, { id: item.id, name: item.name }]);
    setTrashedTabs((prev) => prev.filter((t) => t.id !== item.id));
    setActiveTabId(item.id);
    setShapes(item.shapes);
    setDiagramsMenuOpen(false);
    showToast(`Restored "${item.name}" from Trash!`);
  };

  const deleteTrashedTabPermanently = (itemId: string) => {
    setTrashedTabs((prev) => prev.filter((t) => t.id !== itemId));
    showToast("Permanently deleted tab from Trash.");
  };

  const loadSampleClassChart = (sampleType: string) => {
    let targetShapes: Shape[] = [];
    let tabName = "Class Diagram";
    let tabKey = sampleType;

    const found = hubSamples.find((s) => s.id === sampleType || s.name.toLowerCase().includes(sampleType.toLowerCase()));
    if (found) {
      tabName = found.name;
      tabKey = found.id;
      targetShapes = (found.shapes || []) as Shape[];
    } else if (sampleType === "mindmap") {
      tabName = "Forex Basics Mind Map";
      tabKey = "mindmap";
      targetShapes = DEFAULT_SAMPLE_MINDMAP_SHAPES as Shape[];
    } else if (sampleType === "smc") {
      tabName = "SMC Liquidity Diagram";
      tabKey = "smc_diag";
      targetShapes = DEFAULT_SAMPLE_SMC_SHAPES as Shape[];
    } else if (sampleType === "risk") {
      tabName = "Risk Management Matrix";
      tabKey = "risk_diag";
      targetShapes = DEFAULT_SAMPLE_RISK_SHAPES as Shape[];
    } else if (sampleType === "class_chart_eurusd") {
      tabName = "EUR/USD H4 Class Analysis";
      tabKey = "sample_eurusd";
      targetShapes = DEFAULT_SAMPLE_EURUSD_SHAPES as Shape[];
    } else if (sampleType === "sample_london_sweep") {
      tabName = "London Sweep Class Setup";
      tabKey = "sample_london";
      targetShapes = DEFAULT_SAMPLE_LONDON_SHAPES as Shape[];
    }

    if (tabs.length >= 5 && !tabs.some((t) => t.id === tabKey)) {
      setMaxTabPromptOpen(true);
      showToast("Max 5 tabs reached! Close a tab to load sample chart.");
      return;
    }

    if (!tabs.some((t) => t.id === tabKey)) {
      setTabs((prev) => [...prev, { id: tabKey, name: tabName, shapes: targetShapes, theme: "dots", snapToGrid: true }]);
    } else {
      setTabs((prev) => prev.map((t) => t.id === tabKey ? { ...t, shapes: targetShapes } : t));
    }

    setActiveTabId(tabKey);
    setShapes(targetShapes);
    setBgGrid("dots");
    setSnapToGrid(true);
    showToast(`Loaded "${tabName}" Template!`);
    setDiagramsMenuOpen(false);
  };

  /* ----------------- FIGMA-STYLE HUB ACTION HANDLERS ------------------------ */
  const handleCreateNewCanvasFromHub = (customName?: string) => {
    openCreateCanvasModal(customName);
  };

  const handleCreateCanvasFromResource = (resource: HubResourceGuide) => {
    const finalName = resource.title;
    if (tabs.length >= 5 && !tabs.some((t) => t.name === finalName)) {
      setMaxTabPromptOpen(true);
      showToast("Maximum 5 tabs reached! Please close a tab first.");
      return;
    }

    let guideShapes: Shape[] = [];

    if (resource.id === "patterns") {
      guideShapes = [
        { id: "p_sup", type: "line", color: "#3b82f6", strokeWidth: 2.5, lineStyle: "dashed", points: [{ x: 100, y: 360 }, { x: 550, y: 360 }] },
        { id: "p_suptxt", type: "text", color: "#3b82f6", strokeWidth: 2, points: [{ x: 110, y: 385 }], text: "Key Structural Support Level" },
        { id: "p_wpath", type: "bezier", color: "#10b981", strokeWidth: 3, points: [{ x: 120, y: 200 }, { x: 220, y: 360 }, { x: 320, y: 260 }, { x: 420, y: 360 }, { x: 540, y: 160 }] },
        { id: "p_neck", type: "line", color: "#f59e0b", strokeWidth: 2, lineStyle: "dashed", points: [{ x: 280, y: 260 }, { x: 580, y: 260 }] },
        { id: "p_necktxt", type: "text", color: "#f59e0b", strokeWidth: 2, points: [{ x: 440, y: 245 }], text: "Neckline Breakout Level" },
        { id: "p_bos", type: "bos", color: "#10b981", strokeWidth: 2, points: [{ x: 420, y: 260 }, { x: 540, y: 160 }], text: "BOS ↗" },
        { id: "p_bull", type: "bullish_candle", color: "#10b981", strokeWidth: 2, points: [{ x: 480, y: 180 }, { x: 510, y: 260 }], text: "Impulse Candle" },
        {
          id: "p_guide_sticky",
          type: "sticky",
          color: "#16181c",
          strokeWidth: 2,
          points: [{ x: 620, y: 140 }],
          text: `📐 PRICE ACTION & PATTERNS GUIDE\n\n• Double Bottom (W): Price rejects support twice, signaling buyer accumulation.\n• Neckline Breakout: Validated by aggressive candle body close above swing high.\n• Execution: Enter on retest of neckline with Stop Loss below right bottom.`,
          stickyColor: "#bae6fd",
        },
      ];
    } else if (resource.id === "smc_guide") {
      guideShapes = [
        { id: "smc_ob", type: "orderblock", color: "#8b5cf6", strokeWidth: 2, points: [{ x: 100, y: 300 }, { x: 300, y: 390 }], text: "H4 Bullish Order Block" },
        { id: "smc_fvg", type: "fvg", color: "#f59e0b", strokeWidth: 2, points: [{ x: 260, y: 210 }, { x: 460, y: 270 }], text: "Fair Value Gap (FVG)" },
        { id: "smc_bos", type: "bos", color: "#3b82f6", strokeWidth: 2, points: [{ x: 280, y: 180 }, { x: 540, y: 180 }], text: "BOS ↗" },
        { id: "smc_liq", type: "liquidity", color: "#e11d48", strokeWidth: 2, points: [{ x: 380, y: 120 }, { x: 640, y: 120 }], text: "Buy-Side Liquidity ($$$)" },
        { id: "smc_c1", type: "bearish_candle", color: "#ef4444", strokeWidth: 2, points: [{ x: 140, y: 300 }, { x: 170, y: 390 }], text: "Last Down Candle (OB)" },
        { id: "smc_c2", type: "bullish_candle", color: "#10b981", strokeWidth: 2, points: [{ x: 200, y: 180 }, { x: 230, y: 330 }], text: "Impulsive Expansion" },
        { id: "smc_pos", type: "long", color: "#10b981", strokeWidth: 2, points: [{ x: 380, y: 300 }, { x: 560, y: 120 }], text: "1:3.5 R:R" },
        {
          id: "smc_sticky",
          type: "sticky",
          color: "#16181c",
          strokeWidth: 2,
          points: [{ x: 700, y: 120 }],
          text: `⚡ SMART MONEY CONCEPTS MASTER GUIDE\n\n1. Identify Market Structure & Trend Bias (HTF BOS)\n2. Locate Validated Order Block (Last opposing candle before displacement)\n3. Mark Fair Value Gap (FVG) Imbalance area\n4. Target External Liquidity Pool ($$$) with minimum 1:3 R:R`,
          stickyColor: "#ddd6fe",
        },
      ];
    } else if (resource.id === "position_sizing") {
      guideShapes = [
        { id: "ps_pos", type: "long", color: "#10b981", strokeWidth: 2, points: [{ x: 140, y: 280 }, { x: 420, y: 100 }], text: "1:3.0 Target" },
        { id: "ps_tp", type: "line", color: "#10b981", strokeWidth: 2, lineStyle: "dashed", points: [{ x: 100, y: 100 }, { x: 460, y: 100 }] },
        { id: "ps_tptxt", type: "text", color: "#10b981", strokeWidth: 2, points: [{ x: 110, y: 80 }], text: "Take Profit Target: +60 Pips (+$300 on $10k)" },
        { id: "ps_entry", type: "line", color: "#3b82f6", strokeWidth: 2, points: [{ x: 100, y: 280 }, { x: 460, y: 280 }] },
        { id: "ps_entrytxt", type: "text", color: "#3b82f6", strokeWidth: 2, points: [{ x: 110, y: 265 }], text: "Entry Level @ 1.08500" },
        { id: "ps_sl", type: "line", color: "#ef4444", strokeWidth: 2, lineStyle: "dashed", points: [{ x: 100, y: 340 }, { x: 460, y: 340 }] },
        { id: "ps_sltxt", type: "text", color: "#ef4444", strokeWidth: 2, points: [{ x: 110, y: 360 }], text: "Stop Loss Invalidation: -20 Pips (-$100 Risk = 1.0%)" },
        {
          id: "ps_sticky1",
          type: "sticky",
          color: "#16181c",
          strokeWidth: 2,
          points: [{ x: 500, y: 90 }],
          text: `📊 POSITION SIZING FORMULA\n\nLot Size = (Account Balance × Risk %) / (Stop Loss Pips × Pip Value)\n\nExample for $10,000 Account:\n• 1% Risk = $100\n• Stop Loss = 20 Pips\n• Lot Size = $100 / (20 × $10) = 0.50 Lots`,
          stickyColor: "#bbf7d0",
        },
        {
          id: "ps_sticky2",
          type: "sticky",
          color: "#16181c",
          strokeWidth: 2,
          points: [{ x: 500, y: 310 }],
          text: `🛡️ CAPITAL PROTECTION RULES\n\n• Never exceed 1.0% risk on any single trade.\n• Maintain strict 1:3 minimum Risk-to-Reward ratio.\n• Stop trading for the day if daily drawdown hits 3.0%.`,
          stickyColor: "#fef08a",
        },
      ];
    } else if (resource.id === "hotkeys") {
      guideShapes = [
        {
          id: "hk_tool_card",
          type: "sticky",
          color: "#16181c",
          strokeWidth: 2,
          points: [{ x: 100, y: 120 }],
          text: `⌨️ DRAWING & TOOL SHORTCUTS\n\n• V / 1: Select & Transform Tool\n• H / 2: Pan Canvas Tool\n• P / 3: Freehand Pen / Pencil\n• L / 4: Straight Line\n• A: Connector Arrow\n• B: Chart Pattern Path (Bezier)\n• R: Rectangle Zone / Order Block\n• C: Circle Node\n• D: Decision Diamond\n• T / 5: Text Label\n• N / S: Sticky Note\n• F: Fibonacci Retracement\n• G: Long Position Tool\n• K: Short Position Tool\n• U: Bullish Candlestick\n• J: Bearish Candlestick\n• E: Eraser Tool\n• Z: Zoom Tool`,
          stickyColor: "#fef08a",
        },
        {
          id: "hk_edit_card",
          type: "sticky",
          color: "#16181c",
          strokeWidth: 2,
          points: [{ x: 420, y: 120 }],
          text: `⚡ CANVAS & EDITING COMMANDS\n\n• Ctrl + Z: Undo action\n• Ctrl + Y / Ctrl + Shift + Z: Redo\n• Ctrl + S: Save Draft\n• Ctrl + A: Select All Objects\n• Ctrl + D: Duplicate Selected\n• Alt + Drag: Quick Clone on Canvas\n• Ctrl + L: Lock / Unlock Selected\n• Delete / Backspace: Delete Selected\n• Space + Drag: Pan Around Canvas\n• Mouse Wheel: Zoom In / Zoom Out\n• Shift + Drag: Constrain Proportions`,
          stickyColor: "#bae6fd",
        },
        {
          id: "hk_demo_candle",
          type: "bullish_candle",
          color: "#10b981",
          strokeWidth: 2,
          points: [{ x: 740, y: 140 }, { x: 780, y: 260 }],
          text: "Hotkeys Active",
        },
        {
          id: "hk_demo_box",
          type: "orderblock",
          color: "#8b5cf6",
          strokeWidth: 2,
          points: [{ x: 740, y: 290 }, { x: 880, y: 380 }],
          text: "Try Pressing Hotkeys!",
        },
      ];
    } else {
      guideShapes = [
        {
          id: "guide_default",
          type: "sticky",
          color: "#16181c",
          strokeWidth: 2,
          points: [{ x: 150, y: 140 }],
          text: `📘 ${resource.title.toUpperCase()}\n\n${resource.desc}\n\nKey Rules:\n${resource.points.map((p) => `• ${p}`).join("\n")}`,
          stickyColor: "#bae6fd",
        },
      ];
    }

    const newId = `guide_${resource.id}_${Date.now()}`;
    const newTab: DiagramTab = {
      id: newId,
      name: finalName,
      shapes: guideShapes,
      theme: "dots",
      snapToGrid: true,
    };

    setTabs((prev) => {
      const updated = prev.map((t) =>
        t.id === activeTabId ? { ...t, shapes, theme: bgGrid, snapToGrid } : t
      );
      if (!updated.some((t) => t.name === finalName)) {
        return [...updated, newTab];
      }
      return updated.map((t) => (t.name === finalName ? { ...t, shapes: guideShapes } : t));
    });

    setActiveTabId(newId);
    setShapes(guideShapes);
    setBgGrid("dots");
    setSnapToGrid(true);
    setViewMode("canvas");
    showToast(`Loaded "${resource.title}" guide setup into whiteboard!`);
  };

  const handleOpenDraftFromHub = (draft: SavedDraft) => {
    loadSavedDraft(draft);
    setViewMode("canvas");
  };

  const handleOpenSampleFromHub = (sampleId: string) => {
    loadSampleClassChart(sampleId);
    setViewMode("canvas");
  };

  const handleOpenTabFromHub = (tabId: string) => {
    handleSelectTab(tabId);
    setViewMode("canvas");
  };

  const handleReturnToHub = () => {
    if (shapes.length > 0) {
      handleSaveCurrentDraft();
    }
    setViewMode("hub");
    showToast("Returned to Workspace Hub");
  };

  const handleDuplicateDraft = (draft: SavedDraft) => {
    const duplicate: SavedDraft = {
      id: `draft_${Date.now()}`,
      name: `${draft.name} (Copy)`,
      shapes: [...draft.shapes],
      savedAt: Date.now(),
    };
    setSavedDrafts((prev) => [duplicate, ...prev]);
    showToast(`Duplicated "${draft.name}"!`);
  };

  /* Toolbar Actions */
  const handleUndo = () => {
    if (shapes.length === 0) return;
    const last = shapes[shapes.length - 1];
    setShapes((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, last]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const last = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setShapes((prev) => [...prev, last]);
  };

  const handleClear = () => {
    setShapes([]);
    setRedoStack([]);
    setSelectedShapeIds([]);
  };

  const handleExport = (format: "png" | "jpeg" | "svg") => {
    setExportOpen(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (format === "svg") {
      const svgHeader = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">`;
      const svgFooter = `</svg>`;
      const blob = new Blob([svgHeader + `<rect width="100%" height="100%" fill="#ffffff"/>` + svgFooter], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GAMAT_FX_Whiteboard_${Date.now()}.svg`;
      a.click();
      showToast("Exported as SVG Vector File!");
      return;
    }

    const mime = format === "jpeg" ? "image/jpeg" : "image/png";
    const url = canvas.toDataURL(mime, highDpiExport ? 1.0 : 0.8);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GAMAT_FX_Whiteboard_${Date.now()}.${format}`;
    a.click();
    showToast(`Exported diagram as ${format.toUpperCase()} ${highDpiExport ? "(High DPI)" : ""}!`);
  };

  const handleSelectTab = (tabId: string) => {
    if (tabId === activeTabId) return;

    // 1. Save current active tab state into tabs array
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId ? { ...t, shapes, theme: bgGrid, snapToGrid } : t
      )
    );

    // 2. Find target tab
    const target = tabs.find((t) => t.id === tabId);
    setActiveTabId(tabId);

    if (target) {
      let targetShapes = target.shapes || [];
      // If sample tab with predefined shapes not yet populated
      if (targetShapes.length === 0) {
        if (tabId === "mindmap") {
          targetShapes = SAMPLE_MINDMAP_SHAPES;
        } else if (tabId === "smc_diag" || tabId === "smc") {
          targetShapes = SAMPLE_SMC_SHAPES;
        } else if (tabId === "risk_diag" || tabId === "risk") {
          targetShapes = SAMPLE_RISK_SHAPES;
        } else if (tabId === "sample_eurusd" || tabId === "class_chart_eurusd") {
          targetShapes = SAMPLE_EURUSD_SHAPES;
        } else if (tabId === "sample_london" || tabId === "sample_london_sweep") {
          targetShapes = SAMPLE_LONDON_SHAPES;
        }
      }

      const targetTheme = target.theme || "dots";
      const targetSnap = target.snapToGrid ?? true;

      setShapes(targetShapes);
      setBgGrid(targetTheme);
      setSnapToGrid(targetSnap);
      showToast(`Switched to "${target.name}"`);
    }
  };

  const showToast = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const selectedShape = shapes.find((s) => s.id === selectedShapeIds[0]);

  // Authentication Gate: Require user to have an active account & be logged in
  if (!isAuthed || !user) {
    return (
      <div className="fixed inset-0 h-screen w-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden select-none">
        {/* Ambient Gradient Glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[180px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center space-y-6 animate-in fade-in zoom-in-95">
          <div className="flex justify-center">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-brand/20 border border-brand/40 flex items-center justify-center text-brand shadow-inner">
                <Lock className="h-8 w-8" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[10px] font-black text-white shadow-md">
                FX
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl font-black text-white tracking-tight">
              Member Account Required
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              Please sign in or create an account to access the GAMAT FX Technical Analysis Whiteboard, interactive Forex setups, Fibonacci tools, and cloud drafts.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full py-3.5 rounded-2xl bg-brand text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-brand/30 hover:bg-brand-dark transition transform active:scale-[0.98]"
            >
              Sign In to Your Account
            </button>
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="w-full py-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider hover:bg-slate-700 hover:text-white transition transform active:scale-[0.98]"
            >
              Create a Free Account
            </button>
          </div>

          <div className="border-t border-slate-800/80 pt-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-medium"
            >
              <Home className="h-3.5 w-3.5" /> Back to GAMAT FX Platform
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered collections for Figma-Style Hub View (Deduplicated so open tabs and saved drafts remain synchronized)
  const allDraftsList = [
    ...tabs.map((t) => ({
      id: t.id,
      name: t.name,
      shapes: t.id === activeTabId ? shapes : (t.shapes || []),
      isTab: true,
      savedAt: Date.now(),
    })),
    ...savedDrafts
      .filter((d) => !tabs.some((t) => t.name === d.name || t.id === d.id))
      .map((d) => ({ ...d, isTab: false })),
  ];

  const filteredDrafts = allDraftsList.filter((d) =>
    !hubSearch.trim() || d.name.toLowerCase().includes(hubSearch.toLowerCase())
  );

  const filteredSamples = hubSamples.filter((s) =>
    !hubSearch.trim() ||
    s.name.toLowerCase().includes(hubSearch.toLowerCase()) ||
    s.tag.toLowerCase().includes(hubSearch.toLowerCase()) ||
    s.category.toLowerCase().includes(hubSearch.toLowerCase()) ||
    s.desc.toLowerCase().includes(hubSearch.toLowerCase())
  );

  const filteredResources = hubResources.filter((r) =>
    !hubSearch.trim() ||
    r.title.toLowerCase().includes(hubSearch.toLowerCase()) ||
    r.category.toLowerCase().includes(hubSearch.toLowerCase()) ||
    r.desc.toLowerCase().includes(hubSearch.toLowerCase()) ||
    r.points.some((p) => p.toLowerCase().includes(hubSearch.toLowerCase()))
  );

  const filteredTrash = trashedTabs.filter((t) =>
    !hubSearch.trim() || t.name.toLowerCase().includes(hubSearch.toLowerCase())
  );

  const filteredLessons = hubLessons.filter((l) =>
    !hubSearch.trim() ||
    l.title.toLowerCase().includes(hubSearch.toLowerCase()) ||
    l.subtitle.toLowerCase().includes(hubSearch.toLowerCase()) ||
    l.desc.toLowerCase().includes(hubSearch.toLowerCase()) ||
    l.items.some((item) => item.label.toLowerCase().includes(hubSearch.toLowerCase()) || item.value.toLowerCase().includes(hubSearch.toLowerCase()))
  );

  /* -------------------------------------------------------------------------- */
  /*               SHARED CREATE CANVAS & TAB LIMIT MODAL RENDERERS             */
  /* -------------------------------------------------------------------------- */
  const renderMaxTabPromptModal = () => {
    if (!maxTabPromptOpen) return null;
    return (
      <div className="fixed inset-0 z-[250] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm animate-in fade-in">
        <div className="w-full max-w-sm rounded-3xl border border-line bg-white p-6 shadow-2xl space-y-4 text-center">
          <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="font-display font-extrabold text-ink text-base">Maximum 5 Tabs Reached</h3>
          <p className="text-xs text-muted leading-relaxed font-medium">
            You have reached the maximum limit of <strong>5 diagram tabs</strong> open at once. Please close an existing tab before creating a new one.
          </p>
          <button
            type="button"
            onClick={() => setMaxTabPromptOpen(false)}
            className="btn-primary w-full !py-2.5 text-xs font-bold cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    );
  };

  const renderCreateCanvasModal = () => {
    if (!createCanvasModalOpen) return null;
    return (
      <div className="fixed inset-0 z-[250] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto">
        <div className="w-full max-w-xl rounded-3xl border border-line bg-white p-6 shadow-2xl space-y-5 text-left my-auto max-h-[92vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-brand-light text-brand flex items-center justify-center font-extrabold shadow-xs">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-ink text-base">Create New Canvas</h3>
                <p className="text-xs text-muted font-medium">Configure diagram name, theme, and trading setup.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCreateCanvasModalOpen(false)}
              className="h-8 w-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-cream transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Canvas Name & Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-ink flex items-center justify-between">
              <span>Canvas Name</span>
              <span className="text-[10px] text-muted font-normal">Press Enter to create</span>
            </label>
            <input
              autoFocus
              type="text"
              value={newCanvasName}
              onChange={(e) => setNewCanvasName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmCreateCustomCanvas();
              }}
              placeholder="e.g. EUR/USD London Session Markup"
              className="w-full rounded-xl border border-line bg-cream p-3 text-xs font-bold text-ink outline-none focus:border-brand transition"
            />
            {/* Quick Preset Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                "EUR/USD Technical Breakdown",
                "London Killzone Setup",
                "SMC Liquidity Markup",
                "Gold (XAU/USD) Scalp",
                "Weekly Trade Journal",
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setNewCanvasName(preset)}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-brand-light hover:text-brand transition cursor-pointer"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Workspace Theme & Grid Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-ink">Choose Canvas Theme</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                {
                  id: "dots" as const,
                  name: "Dots Grid",
                  desc: "Figma style",
                  bgClass: "bg-white border-slate-300",
                  indicator: "radial-gradient(#94a3b8 1.5px, transparent 1.5px)",
                  indicatorSize: "8px 8px",
                },
                {
                  id: "lines" as const,
                  name: "Tech Lines",
                  desc: "Graph paper",
                  bgClass: "bg-white border-slate-300",
                  indicator: "linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)",
                  indicatorSize: "10px 10px",
                },
                {
                  id: "blank" as const,
                  name: "Clean Blank",
                  desc: "Pure white",
                  bgClass: "bg-slate-50 border-slate-300",
                  indicator: "none",
                  indicatorSize: "auto",
                },
                {
                  id: "dark" as const,
                  name: "Obsidian",
                  desc: "Dark mode",
                  bgClass: "bg-slate-900 border-slate-700 text-white",
                  indicator: "radial-gradient(#475569 1px, transparent 1px)",
                  indicatorSize: "8px 8px",
                },
                {
                  id: "chalkboard" as const,
                  name: "Chalkboard",
                  desc: "Classic green",
                  bgClass: "bg-emerald-950 border-emerald-800 text-white",
                  indicator: "none",
                  indicatorSize: "auto",
                },
              ].map((th) => {
                const isSelected = newCanvasTheme === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setNewCanvasTheme(th.id)}
                    className={`relative flex flex-col items-center justify-between p-2.5 rounded-2xl border-2 transition cursor-pointer text-center ${
                      isSelected
                        ? "border-brand bg-brand-light/30 shadow-xs ring-2 ring-brand/20"
                        : "border-line hover:border-slate-300 bg-white"
                    }`}
                  >
                    {/* Theme Preview Swatch */}
                    <div
                      className={`h-10 w-full rounded-xl border ${th.bgClass} flex items-center justify-center relative overflow-hidden mb-1.5`}
                      style={{
                        backgroundImage: th.indicator,
                        backgroundSize: th.indicatorSize,
                      }}
                    >
                      {isSelected && (
                        <div className="h-5 w-5 rounded-full bg-brand text-white flex items-center justify-center shadow-xs">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-ink leading-tight">{th.name}</span>
                    <span className="text-[9px] text-muted">{th.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Starter Template Pack */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink">Starter Template Setup</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  id: "blank" as const,
                  title: "Blank Clean Slate",
                  desc: "Pure empty workspace ready for freehand technical analysis.",
                },
                {
                  id: "risk_1_3" as const,
                  title: "1:3 Risk Management Plan",
                  desc: "Pre-places 1:3 Long setup with SL invalidation & risk note.",
                },
                {
                  id: "smc_zones" as const,
                  title: "SMC Liquidity & Order Blocks",
                  desc: "Pre-loads Bullish OB demand zone, FVG imbalance & BOS arrow.",
                },
                {
                  id: "killzones" as const,
                  title: "London & NY Session Killzones",
                  desc: "Pre-places Asian, London & New York session time boxes.",
                },
                {
                  id: "top_down" as const,
                  title: "Multi-Timeframe Top-Down",
                  desc: "3-column structured template for HTF, ITF & LTF alignment.",
                },
              ].map((tpl) => {
                const isSelected = newCanvasTemplate === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setNewCanvasTemplate(tpl.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                      isSelected
                        ? "border-brand bg-brand-light/30 ring-2 ring-brand/20 shadow-xs"
                        : "border-line bg-white hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 border ${
                        isSelected ? "border-brand bg-brand text-white" : "border-slate-300 bg-slate-50"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-ink">{tpl.title}</div>
                      <div className="text-[10px] text-muted leading-tight mt-0.5">{tpl.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid Snapping Preference */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-cream border border-line">
            <div className="flex items-center gap-2.5">
              <Magnet className="h-4 w-4 text-brand" />
              <div>
                <span className="text-xs font-bold text-ink block">Snap Elements to Grid</span>
                <span className="text-[10px] text-muted">Automatically align objects to clean 20px grid increments</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={newCanvasSnapToGrid}
              onChange={(e) => setNewCanvasSnapToGrid(e.target.checked)}
              className="h-4 w-4 rounded text-brand focus:ring-brand cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2 border-t border-line">
            <button
              type="button"
              onClick={() => setCreateCanvasModalOpen(false)}
              className="flex-1 rounded-xl bg-cream py-2.5 text-xs font-bold text-muted hover:text-ink transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmCreateCustomCanvas}
              className="btn-primary flex-1 !py-2.5 text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Create & Open Canvas</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------------------- */
  /*               MOBILE RESTRICTION GUARD (< 1024px VIEWPORT)                 */
  /* -------------------------------------------------------------------------- */
  if (isMobileScreen) {
    return (
      <div className="fixed inset-0 z-[99999] h-screen w-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 overflow-y-auto select-none">
        {/* Background Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.18)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Logo Header */}
          <div className="flex justify-center">
            <Logo variant="light" />
          </div>

          {/* Desktop & Restricted Phone Graphic Visual */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-brand/20 animate-pulse" />
            <div className="relative z-10 h-20 w-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-2xl backdrop-blur-md">
              <Monitor className="h-10 w-10 text-brand" />
              <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-slate-950">
                <Smartphone className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          {/* Badge & Headings */}
          <div className="space-y-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[10.5px] font-black uppercase tracking-wider">
              <AlertTriangle className="h-3.5 w-3.5" /> Desktop Experience Only
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
              Desktop Screen Required
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
              The GAMAT FX Institutional Whiteboard is designed exclusively for desktop and laptop displays with precision keyboard and mouse markup controls.
            </p>
          </div>

          {/* Features Included on Desktop */}
          <div className="p-4.5 rounded-2xl bg-white/[0.04] border border-white/10 text-left space-y-3 text-xs text-slate-200">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Desktop-Optimized Workspace:</p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-medium">
              <div className="flex items-center gap-2">
                <span className="text-brand font-black">✓</span>
                <span>Infinite 4K Canvas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand font-black">✓</span>
                <span>SMC Order Block Tools</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand font-black">✓</span>
                <span>Multi-Tab Syncing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand font-black">✓</span>
                <span>Candlestick Wick Adjusters</span>
              </div>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full btn-primary !py-3 text-xs font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="h-4 w-4" /> Return to Platform
            </button>
            <button
              type="button"
              onClick={() => navigate("/courses")}
              className="w-full py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="h-4 w-4" /> Explore Academy Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                        VIEW MODE 1: FIGMA-STYLE HUB                        */
  /* -------------------------------------------------------------------------- */
  if (viewMode === "hub") {
    return (
      <div className="fixed inset-0 h-screen w-screen bg-slate-50 text-ink font-sans flex overflow-hidden select-none">
        {/* Toast Notification */}
        {statusMsg && (
          <div className="fixed top-6 right-6 z-[120] rounded-2xl bg-brand text-white px-5 py-3 shadow-2xl flex items-center gap-2 font-bold text-xs animate-in fade-in slide-in-from-top-3">
            <Check className="h-4 w-4" /> {statusMsg}
          </div>
        )}

        {/* ======================= LEFT NAVIGATION PANEL ======================= */}
        <aside className="w-72 border-r border-line bg-white p-5 flex flex-col justify-between shrink-0 z-20 shadow-xs">
          <div className="space-y-4">
            {/* GAMAT Brand Logo & Hub Header */}
            <div className="flex items-center justify-between">
              <Logo variant="dark" asDiv />
              <span className="px-2 py-0.5 rounded-lg bg-brand-light text-brand text-[10px] font-black uppercase tracking-wider">
                Whiteboard
              </span>
            </div>

            {/* Real-time Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={hubSearch}
                onChange={(e) => setHubSearch(e.target.value)}
                placeholder="Search files, samples, guides..."
                className="w-full pl-9 pr-7 py-2 bg-slate-100/90 focus:bg-white text-xs rounded-xl border border-transparent focus:border-brand focus:ring-2 focus:ring-brand/20 transition outline-none font-medium text-slate-800 placeholder-slate-400"
              />
              {hubSearch && (
                <button
                  type="button"
                  onClick={() => setHubSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Primary Action Button: + Create New Canvas */}
            <button
              type="button"
              onClick={() => handleCreateNewCanvasFromHub()}
              className="w-full flex items-center justify-between gap-2 rounded-2xl bg-gradient-to-r from-brand to-brand-dark text-white px-4 py-3 text-xs font-black shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/35 transition transform active:scale-[0.98] group cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                Create New Canvas
              </span>
              <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded text-white/90">Ctrl+N</span>
            </button>

            {/* Navigation Menu List */}
            <div className="space-y-0.5 pt-1">
              <p className="px-2.5 py-1 text-[9px] font-black uppercase text-muted tracking-wider">Workspace</p>

              {/* 1. Drafts */}
              <button
                type="button"
                onClick={() => setHubTab("drafts")}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-[11.5px] font-bold transition cursor-pointer ${
                  hubTab === "drafts" ? "bg-brand-light text-brand shadow-xs font-extrabold" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <FolderKanban className="h-3.5 w-3.5" /> Drafts & Files
                </span>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                  hubTab === "drafts" ? "bg-brand text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {hubSearch ? filteredDrafts.length : allDraftsList.length}
                </span>
              </button>

              {/* 2. Samples */}
              <button
                type="button"
                onClick={() => setHubTab("samples")}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-[11.5px] font-bold transition cursor-pointer ${
                  hubTab === "samples" ? "bg-brand-light text-brand shadow-xs font-extrabold" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <LayoutTemplate className="h-3.5 w-3.5" /> Samples & Templates
                </span>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                  hubTab === "samples" ? "bg-brand text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {hubSearch ? filteredSamples.length : hubSamples.length}
                </span>
              </button>

              {/* 3. Resources */}
              <button
                type="button"
                onClick={() => setHubTab("resources")}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-[11.5px] font-bold transition cursor-pointer ${
                  hubTab === "resources" ? "bg-brand-light text-brand shadow-xs font-extrabold" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5" /> Resources & Guides
                </span>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                  hubTab === "resources" ? "bg-brand text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {hubSearch ? filteredResources.length : hubResources.length}
                </span>
              </button>

              {/* 4. Trash */}
              <button
                type="button"
                onClick={() => setHubTab("trash")}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-[11.5px] font-bold transition cursor-pointer ${
                  hubTab === "trash" ? "bg-rose-50 text-rose-700 shadow-xs font-extrabold" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="h-3.5 w-3.5" /> Trash
                </span>
                {(hubSearch ? filteredTrash.length > 0 : trashedTabs.length > 0) && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    {hubSearch ? filteredTrash.length : trashedTabs.length}
                  </span>
                )}
              </button>

              {/* Horizontal Divider */}
              <div className="border-t border-line my-1.5" />

              {/* 5. Learn Workspace */}
              <button
                type="button"
                onClick={() => setHubTab("guide")}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-[11.5px] font-bold transition cursor-pointer ${
                  hubTab === "guide" ? "bg-brand-light text-brand shadow-xs font-extrabold" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-3.5 w-3.5 text-black" /> Learn Workspace
                </span>
                <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                  hubTab === "guide" ? "bg-brand text-white" : "bg-brand/10 text-brand"
                }`}>
                  {hubSearch ? `${filteredLessons.length}` : "Guide"}
                </span>
              </button>

              {/* 6. Admin Whiteboard Manager (Visible to Admins only) */}
              {isAdmin && (
                <>
                  <div className="border-t border-line my-1.5" />
                  <button
                    type="button"
                    onClick={() => navigate("/admin/whiteboard")}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-[11.5px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 transition cursor-pointer border border-amber-200 shadow-2xs"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-700" /> Admin Hub Manager
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-900">
                      Admin
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Sidebar Bottom Quick Utilities */}
          <div className="space-y-0.5 border-t border-line pt-2.5 text-[11.5px]">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-ink font-bold transition cursor-pointer"
            >
              <Settings className="h-3.5 w-3.5 text-slate-500" /> Preferences
            </button>
            <button
              type="button"
              onClick={() => setShortcutsOpen(true)}
              className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-ink font-bold transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Keyboard className="h-3.5 w-3.5 text-slate-500" /> Shortcuts
              </span>
              <span className="text-[9px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-muted">?</span>
            </button>
          </div>
        </aside>

        {/* ===================== RIGHT MAIN PREVIEW AREA ===================== */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          {/* Top Header Bar with Avatar at Top Right */}
          <header className="h-16 border-b border-line bg-white px-8 flex items-center justify-between gap-4 shrink-0 z-20">
            <div>
              <h2 className="font-display font-black text-base text-ink">
                {hubTab === "drafts" && "Drafts & Workspaces"}
                {hubTab === "samples" && "Interactive Samples & Lesson Templates"}
                {hubTab === "resources" && "Trading Resources & Cheatsheets"}
                {hubTab === "trash" && "Trash Bin"}
                {hubTab === "guide" && "Learn Whiteboard Workspace"}
              </h2>
              <p className="text-xs text-muted font-medium">
                {hubTab === "drafts" && "Resume where you left off or start a fresh technical analysis canvas"}
                {hubTab === "samples" && "Pre-built technical setups, Smart Money Concepts, and lesson chart models"}
                {hubTab === "resources" && "Price action cheatsheets, risk calculation formulas, and quick references"}
                {hubTab === "trash" && "Closed diagram tabs (automatically purged after 30 days)"}
                {hubTab === "guide" && "Interactive master guide to technical analysis markup, Smart Money tools, and keyboard controls"}
              </p>
            </div>

            {/* Header Right Actions & User Avatar */}
            <div className="flex items-center gap-3">
              {/* Layout Grid / List Switcher */}
              <div className="flex items-center rounded-lg bg-slate-200/80 p-0.5 border border-line gap-0.5">
                <button
                  type="button"
                  onClick={() => handleToggleHubLayout("grid")}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${
                    hubLayout === "grid"
                      ? "bg-brand text-white shadow-xs font-black"
                      : "text-slate-600 hover:text-ink hover:bg-white/60 font-medium"
                  }`}
                  title="Switch to Grid View"
                >
                  <LayoutGrid className="h-3 w-3" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleHubLayout("list")}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${
                    hubLayout === "list"
                      ? "bg-brand text-white shadow-xs font-black"
                      : "text-slate-600 hover:text-ink hover:bg-white/60 font-medium"
                  }`}
                  title="Switch to List View"
                >
                  <List className="h-3 w-3" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>

              {/* Vertical Separator */}
              <span className="h-6 w-[1.5px] bg-slate-300 shrink-0" />

              {/* Top Right User Avatar & Profile Dropdown */}
              <div ref={userMenuRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-2xl p-1 hover:bg-slate-100 transition group cursor-pointer"
                  title={`${user.firstName} ${user.lastName} (${user.email})`}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.firstName}
                      className="h-8 w-8 rounded-full object-cover border border-line shadow-xs group-hover:ring-2 group-hover:ring-brand transition shrink-0"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-xs font-extrabold text-white shadow-xs group-hover:ring-2 group-hover:ring-brand transition shrink-0">
                      {`${user.firstName?.[0] ?? "U"}${user.lastName?.[0] ?? ""}`.toUpperCase()}
                    </span>
                  )}
                  <ChevronDown className={`h-3.5 w-3.5 text-muted transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Profile Popover Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-line bg-white shadow-2xl z-[100] animate-in fade-in overflow-hidden">
                    <div className="border-b border-line bg-cream p-3.5">
                      <div className="flex items-center gap-2.5">
                        {user.avatar ? (
                          <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover border border-line" />
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-xs font-black text-white">
                            {`${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold text-xs text-ink truncate">{user.firstName} {user.lastName}</p>
                          <p className="text-[10px] text-muted truncate">{user.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-brand-light text-brand text-[9px] font-black uppercase tracking-wider">
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 space-y-1 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => { setUserMenuOpen(false); navigate("/dashboard"); }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-ink hover:bg-brand-light hover:text-brand transition text-left cursor-pointer"
                      >
                        <User className="h-4 w-4 text-slate-700" /> Student Dashboard
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => { setUserMenuOpen(false); navigate("/admin"); }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-ink hover:bg-brand-light hover:text-brand transition text-left cursor-pointer"
                        >
                          <ShieldCheck className="h-4 w-4 text-slate-700" /> Admin Console
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => { setUserMenuOpen(false); navigate("/"); }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-ink hover:bg-cream transition text-left cursor-pointer"
                      >
                        <Home className="h-4 w-4 text-slate-700" /> Platform Home
                      </button>
                      <div className="border-t border-line my-1" />
                      <button
                        type="button"
                        onClick={() => { setUserMenuOpen(false); setSettingsOpen(true); }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-ink hover:bg-brand-light hover:text-brand transition text-left cursor-pointer"
                      >
                        <Settings className="h-4 w-4 text-slate-700" /> Whiteboard Settings
                      </button>
                      <button
                        type="button"
                        onClick={() => { setUserMenuOpen(false); setShortcutsOpen(true); }}
                        className="flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-ink hover:bg-brand-light hover:text-brand transition text-left cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <Keyboard className="h-4 w-4 text-slate-700" /> Keyboard Shortcuts
                        </span>
                        <span className="rounded-md border border-line bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-muted">?</span>
                      </button>
                      <div className="border-t border-line my-1" />
                      <button
                        type="button"
                        onClick={() => { setUserMenuOpen(false); logout(); }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Gallery Area */}
          <main className="flex-1 overflow-y-auto p-8 space-y-6">
            {/* Active Search Filter Status Banner */}
            {hubSearch.trim() && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-line shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Search className="h-4 w-4 text-brand" />
                  <span>
                    Searching for <strong className="text-ink">"{hubSearch}"</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setHubSearch("")}
                  className="flex items-center gap-1 text-xs font-extrabold text-brand hover:text-brand-dark px-2.5 py-1 rounded-lg hover:bg-brand-light transition cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" /> Clear Search Filter
                </button>
              </div>
            )}

            {/* ===================== TAB 1: DRAFTS & WORKSPACES ===================== */}
            {hubTab === "drafts" && (
              <div className="space-y-6">
                {filteredDrafts.length === 0 && hubSearch.trim() ? (
                  <div className="text-center py-12 space-y-3 rounded-2xl border border-line bg-white p-8">
                    <Search className="h-10 w-10 text-slate-300 mx-auto" />
                    <h3 className="font-extrabold text-sm text-ink">No drafts match "{hubSearch}"</h3>
                    <p className="text-xs text-muted max-w-sm mx-auto">
                      Try searching in other sections or clear the search query.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      {filteredSamples.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setHubTab("samples")}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-light hover:text-brand text-xs font-bold transition cursor-pointer"
                        >
                          View in Samples ({filteredSamples.length})
                        </button>
                      )}
                      {filteredResources.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setHubTab("resources")}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-light hover:text-brand text-xs font-bold transition cursor-pointer"
                        >
                          View in Resources ({filteredResources.length})
                        </button>
                      )}
                      {filteredLessons.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setHubTab("guide")}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-light hover:text-brand text-xs font-bold transition cursor-pointer"
                        >
                          View in Guides ({filteredLessons.length})
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setHubSearch("")}
                        className="px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-dark transition cursor-pointer"
                      >
                        Clear Search
                      </button>
                    </div>
                  </div>
                ) : hubLayout === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* Quick Create Blank Canvas Card */}
                    <div
                      onClick={() => handleCreateNewCanvasFromHub()}
                      title="Create a new blank canvas"
                      className="group cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand bg-white p-5 flex flex-col items-center justify-center text-center space-y-3 min-h-[220px] transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <div className="h-12 w-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-ink group-hover:text-brand transition-colors">
                          New Blank Canvas
                        </h3>
                        <p className="text-[11px] text-muted mt-1">Start technical markup from scratch</p>
                      </div>
                    </div>

                    {/* Active Tabs & Saved Drafts Preview Cards */}
                    {filteredDrafts.map((draft) => (
                      <div
                        key={draft.id}
                        onClick={() => {
                          if (draft.isTab) handleOpenTabFromHub(draft.id);
                          else handleOpenDraftFromHub(draft as SavedDraft);
                        }}
                        title={`Click to open "${draft.name}" in Whiteboard`}
                        className="group cursor-pointer rounded-2xl border border-line hover:border-brand/60 bg-white overflow-hidden shadow-xs hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col justify-between"
                      >
                        {/* Miniature Canvas Diagram Preview */}
                        <div className="h-36 w-full border-b border-line bg-slate-50 relative overflow-hidden flex items-center justify-center">
                          <HubDiagramThumbnail shapes={draft.shapes} />
                          {draft.isTab && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-brand text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                              Active Tab
                            </span>
                          )}
                          {/* Sleek Tooltip indicator on hover */}
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <span className="px-2 py-1 rounded-lg bg-slate-900/90 text-white font-bold text-[10px] shadow-md backdrop-blur-xs">
                              Open Canvas →
                            </span>
                          </div>
                        </div>

                        {/* Card Content & Action Bar */}
                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-sm text-ink truncate group-hover:text-brand transition-colors" title={draft.name}>
                              {draft.name}
                            </h3>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-muted">
                            <span>{draft.shapes?.length || 0} layers</span>
                            <span>{new Date(draft.savedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className="pt-2 border-t border-line flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            {!draft.isTab && (
                              <button
                                type="button"
                                onClick={() => handleDuplicateDraft(draft as SavedDraft)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-brand hover:bg-slate-100 transition cursor-pointer"
                                title="Duplicate Draft"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteCanvas(draft.id, draft.isTab)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title={draft.isTab ? "Close & Delete Canvas" : "Delete Draft"}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* LIST VIEW */
                  <div className="rounded-2xl border border-line bg-white divide-y divide-line overflow-hidden shadow-xs">
                    {filteredDrafts.map((draft) => (
                      <div
                        key={draft.id}
                        onClick={() => {
                          if (draft.isTab) handleOpenTabFromHub(draft.id);
                          else handleOpenDraftFromHub(draft as SavedDraft);
                        }}
                        title={`Click to open "${draft.name}" in Whiteboard`}
                        className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="h-10 w-16 rounded-lg border border-line bg-slate-100 overflow-hidden shrink-0">
                            <HubDiagramThumbnail shapes={draft.shapes} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-sm text-ink truncate">{draft.name}</h4>
                            <p className="text-xs text-muted">{draft.shapes?.length || 0} layers • Saved {new Date(draft.savedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              if (draft.isTab) handleOpenTabFromHub(draft.id);
                              else handleOpenDraftFromHub(draft as SavedDraft);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-brand text-white font-bold text-xs hover:bg-brand-dark transition shadow-xs cursor-pointer"
                          >
                            Open Canvas
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCanvas(draft.id, draft.isTab)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title={draft.isTab ? "Close & Delete Canvas" : "Delete Draft"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===================== TAB 2: SAMPLES & TEMPLATES ===================== */}
            {hubTab === "samples" && (
              <div className="space-y-6">
                {filteredSamples.length === 0 && hubSearch.trim() ? (
                  <div className="text-center py-12 space-y-3 rounded-2xl border border-line bg-white p-8">
                    <Search className="h-10 w-10 text-slate-300 mx-auto" />
                    <h3 className="font-extrabold text-sm text-ink">No samples match "{hubSearch}"</h3>
                    <p className="text-xs text-muted max-w-sm mx-auto">
                      Try searching in other sections or clear the search query.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      {filteredResources.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setHubTab("resources")}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-light hover:text-brand text-xs font-bold transition cursor-pointer"
                        >
                          View in Resources ({filteredResources.length})
                        </button>
                      )}
                      {filteredLessons.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setHubTab("guide")}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-light hover:text-brand text-xs font-bold transition cursor-pointer"
                        >
                          View in Guides ({filteredLessons.length})
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setHubSearch("")}
                        className="px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-dark transition cursor-pointer"
                      >
                        Clear Search
                      </button>
                    </div>
                  </div>
                ) : hubLayout === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSamples.map((sample) => (
                      <div
                        key={sample.id}
                        onClick={() => handleOpenSampleFromHub(sample.id)}
                        title={`Click to open "${sample.name}" template in Whiteboard`}
                        className="group cursor-pointer rounded-2xl border border-line hover:border-brand/60 bg-white overflow-hidden shadow-xs hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col justify-between"
                      >
                        {/* Interactive Diagram Preview Banner */}
                        <div className="h-40 w-full border-b border-line bg-slate-50 relative overflow-hidden flex items-center justify-center">
                          <HubDiagramThumbnail shapes={sample.shapes} />
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider">
                              {sample.tag}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              sample.difficulty === "Beginner" ? "bg-emerald-100 text-emerald-800" :
                              sample.difficulty === "Intermediate" ? "bg-amber-100 text-amber-800" :
                              "bg-purple-100 text-purple-800"
                            }`}>
                              {sample.difficulty}
                            </span>
                          </div>
                          {/* Sleek Tooltip indicator on hover */}
                          <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-white font-bold text-[10px] shadow-md backdrop-blur-xs">
                              Use Template →
                            </span>
                          </div>
                        </div>

                        {/* Card Meta & Description */}
                        <div className="p-5 space-y-2.5 flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase text-muted tracking-wider">{sample.category}</p>
                            <h3 className="font-extrabold text-base text-ink group-hover:text-brand transition-colors mt-0.5">
                              {sample.name}
                            </h3>
                            <p className="text-xs text-muted leading-relaxed mt-1 font-medium line-clamp-2">
                              {sample.desc}
                            </p>
                          </div>
                          <div className="pt-3 border-t border-line flex items-center justify-between text-xs">
                            <span className="text-muted font-bold">{sample.shapesCount} pre-configured layers</span>
                            <span className="font-extrabold text-brand flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              Use Template <ChevronRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* SAMPLES LIST VIEW */
                  <div className="rounded-2xl border border-line bg-white divide-y divide-line overflow-hidden shadow-xs">
                    {filteredSamples.map((sample) => (
                      <div
                        key={sample.id}
                        onClick={() => handleOpenSampleFromHub(sample.id)}
                        title={`Click to open "${sample.name}" template in Whiteboard`}
                        className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="h-14 w-24 rounded-xl border border-line bg-slate-100 overflow-hidden shrink-0">
                            <HubDiagramThumbnail shapes={sample.shapes} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-ink truncate">{sample.name}</h4>
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[9px] font-black uppercase">
                                {sample.tag}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                sample.difficulty === "Beginner" ? "bg-emerald-100 text-emerald-800" :
                                sample.difficulty === "Intermediate" ? "bg-amber-100 text-amber-800" :
                                "bg-purple-100 text-purple-800"
                              }`}>
                                {sample.difficulty}
                              </span>
                            </div>
                            <p className="text-xs text-muted truncate mt-0.5 font-medium">{sample.desc}</p>
                            <p className="text-[10px] text-muted font-bold mt-1">{sample.category} • {sample.shapesCount} shapes</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenSampleFromHub(sample.id)}
                          className="px-4 py-2 rounded-xl bg-brand text-white font-bold text-xs hover:bg-brand-dark transition shadow-xs shrink-0 ml-4 cursor-pointer"
                        >
                          Use Template →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===================== TAB 3: RESOURCES & GUIDES ===================== */}
            {hubTab === "resources" && (
              <div className="space-y-6">
                {filteredResources.length === 0 && hubSearch.trim() ? (
                  <div className="text-center py-12 space-y-3 rounded-2xl border border-line bg-white p-8">
                    <Search className="h-10 w-10 text-slate-300 mx-auto" />
                    <h3 className="font-extrabold text-sm text-ink">No resources match "{hubSearch}"</h3>
                    <p className="text-xs text-muted max-w-sm mx-auto">
                      Try searching in other sections or clear the search query.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      {filteredSamples.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setHubTab("samples")}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-light hover:text-brand text-xs font-bold transition cursor-pointer"
                        >
                          View in Samples ({filteredSamples.length})
                        </button>
                      )}
                      {filteredLessons.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setHubTab("guide")}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-light hover:text-brand text-xs font-bold transition cursor-pointer"
                        >
                          View in Guides ({filteredLessons.length})
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setHubSearch("")}
                        className="px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-dark transition cursor-pointer"
                      >
                        Clear Search
                      </button>
                    </div>
                  </div>
                ) : hubLayout === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredResources.map((res) => (
                      <div
                        key={res.id}
                        className="rounded-3xl border border-line bg-white p-6 shadow-xs hover:shadow-xl transition flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                              {res.category}
                            </span>
                            <span className="text-xs text-muted font-bold flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> {res.readTime}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-extrabold text-base text-ink">{res.title}</h3>
                            <p className="text-xs text-muted mt-1 leading-relaxed">{res.desc}</p>
                          </div>

                          {/* Key Takeaways */}
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-line space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-wider text-muted">Core Principles</p>
                            <ul className="space-y-1.5 text-xs text-slate-700">
                              {res.points.map((pt, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                                  <span className="leading-snug">{pt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-line flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleCreateCanvasFromResource(res)}
                            className="btn-primary !py-2 px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md"
                          >
                            <Plus className="h-3.5 w-3.5" /> Create Canvas with Guide
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedResource(res)}
                            className="text-xs font-bold text-slate-600 hover:text-brand transition cursor-pointer"
                          >
                            View Full Details →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* RESOURCES LIST VIEW */
                  <div className="rounded-2xl border border-line bg-white divide-y divide-line overflow-hidden shadow-xs">
                    {filteredResources.map((res) => (
                      <div
                        key={res.id}
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-100 text-slate-700">
                              {res.category}
                            </span>
                            <span className="text-[11px] text-muted font-bold">{res.readTime}</span>
                          </div>
                          <h4 className="font-extrabold text-sm text-ink">{res.title}</h4>
                          <p className="text-xs text-muted font-medium line-clamp-1">{res.desc}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedResource(res)}
                            className="px-3 py-2 rounded-xl border border-line text-slate-700 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCreateCanvasFromResource(res)}
                            className="px-4 py-2 rounded-xl bg-brand text-white font-bold text-xs hover:bg-brand-dark transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" /> Create Canvas with Guide
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===================== TAB 4: TRASH BIN ===================== */}
            {hubTab === "trash" && (
              <div className="space-y-6">
                {trashedTabs.length === 0 ? (
                  <div className="text-center py-16 space-y-3 rounded-2xl border border-line bg-white p-8">
                    <Trash2 className="h-12 w-12 text-slate-300 mx-auto" />
                    <h3 className="font-extrabold text-base text-ink">Trash is Empty</h3>
                    <p className="text-xs text-muted max-w-sm mx-auto">
                      Any closed or discarded whiteboard tabs will appear here and are automatically cleaned up after 30 days.
                    </p>
                  </div>
                ) : hubLayout === "grid" ? (
                  /* TRASH GRID VIEW */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredTrash.map((item) => {
                      const daysLeft = Math.max(0, 30 - Math.floor((Date.now() - item.deletedAt) / (1000 * 60 * 60 * 24)));
                      return (
                        <div key={item.id} className="rounded-2xl border border-line bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {daysLeft} days left
                              </span>
                              <span className="text-[11px] text-muted font-bold">{item.shapes.length} layers</span>
                            </div>
                            <h4 className="font-extrabold text-sm text-ink truncate">{item.name}</h4>
                          </div>
                          <div className="pt-2 border-t border-line flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => { restoreTrashedTab(item); setViewMode("canvas"); }}
                              className="flex-1 py-2 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                            >
                              <RotateCcw className="h-3.5 w-3.5" /> Restore
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTrashedTabPermanently(item.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                              title="Delete Permanently"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* TRASH LIST VIEW */
                  <div className="rounded-2xl border border-line bg-white divide-y divide-line overflow-hidden shadow-xs">
                    {filteredTrash.map((item) => {
                      const daysLeft = Math.max(0, 30 - Math.floor((Date.now() - item.deletedAt) / (1000 * 60 * 60 * 24)));
                      return (
                        <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-sm text-ink">{item.name}</h4>
                            <p className="text-xs text-amber-600 font-bold flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Auto-purges in {daysLeft} days • {item.shapes.length} layers
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => { restoreTrashedTab(item); setViewMode("canvas"); }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                            >
                              <RotateCcw className="h-3.5 w-3.5" /> Restore to Canvas
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTrashedTabPermanently(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Delete Permanently"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ===================== TAB 5: LEARN WORKSPACE ===================== */}
            {hubTab === "guide" && (
              <div className="space-y-6 max-w-5xl">
                {/* Hero Guide Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-brand-dark p-8 text-white shadow-xl">
                  {/* Subtle Graduation Cap Watermark */}
                  <GraduationCap className="absolute -right-8 -bottom-10 h-64 w-64 text-white/5 pointer-events-none rotate-12" />

                  <div className="relative z-10 max-w-2xl space-y-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand/30 border border-brand/40 text-brand-light text-xs font-black uppercase tracking-wider">
                      Workspace Learning Center
                    </span>
                    <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                      Master Technical Analysis & Whiteboard Charting
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                      Master the complete suite of institutional Forex tools: multi-timeframe top-down charting, Smart Money Concepts (Order Blocks, FVGs, BOS), automated 1:3 Risk-to-Reward calculators, Fibonacci retracements, and trade journal workspaces.
                    </p>
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleCreateNewCanvasFromHub("Interactive Practice Setup")}
                        className="flex items-center gap-2 rounded-2xl bg-brand text-white px-5 py-3 text-xs font-black shadow-lg shadow-brand/30 hover:bg-brand-dark transition transform active:scale-95 cursor-pointer"
                      >
                        <PlayCircle className="h-4 w-4" /> Open Practice Canvas
                      </button>
                      <button
                        type="button"
                        onClick={() => setShortcutsOpen(true)}
                        className="flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white px-4 py-3 text-xs font-bold transition backdrop-blur-xs cursor-pointer"
                      >
                        <Keyboard className="h-4 w-4 text-slate-300" /> View Keyboard Shortcuts (?)
                      </button>
                    </div>
                  </div>
                </div>

                {/* 10 Interactive Comprehensive Lessons (Filterable) */}
                {filteredLessons.length === 0 && hubSearch.trim() ? (
                  <div className="text-center py-12 space-y-3 rounded-2xl border border-line bg-white p-8">
                    <Search className="h-10 w-10 text-slate-300 mx-auto" />
                    <h3 className="font-extrabold text-sm text-ink">No lessons match "{hubSearch}"</h3>
                    <p className="text-xs text-muted max-w-sm mx-auto">
                      Try searching for "Fibonacci", "SMC", "Risk", "Order Block", or "Navigation".
                    </p>
                    <button
                      type="button"
                      onClick={() => setHubSearch("")}
                      className="px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-dark transition cursor-pointer"
                    >
                      Clear Search
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="rounded-3xl border border-line bg-white p-6 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-2xl ${lesson.colorClass} flex items-center justify-center font-black text-sm shrink-0`}>
                              {lesson.num}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-ink">{lesson.title}</h4>
                              <p className="text-xs text-muted font-medium">{lesson.subtitle}</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {lesson.desc}
                          </p>
                          <div className="space-y-2 pt-1 text-xs">
                            {lesson.items.map((item, idx) => (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-xl ${lesson.badgeBg} border flex items-center justify-between ${lesson.badgeText}`}
                              >
                                <span className="font-bold">{item.label}</span>
                                <span className={item.isMono ? "font-mono text-[10px] font-bold" : "font-medium text-[11px]"}>
                                  {item.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-line flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleCreateNewCanvasFromHub(`Lesson ${lesson.num}: ${lesson.title}`)}
                            className="flex items-center gap-1.5 text-xs font-extrabold text-brand hover:text-brand-dark transition cursor-pointer"
                          >
                            <PlayCircle className="h-3.5 w-3.5" /> Practice this Setup →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>

        {/* RESOURCE FULL DETAILS MODAL */}
        {selectedResource && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-xl rounded-3xl border border-line bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-light text-brand text-[10px] font-black uppercase tracking-wider">
                      {selectedResource.category}
                    </span>
                    <span className="text-xs text-muted font-bold flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {selectedResource.readTime}
                    </span>
                  </div>
                  <h3 className="font-display font-black text-lg text-ink">
                    {selectedResource.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedResource(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-ink hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {selectedResource.desc}
              </p>

              {/* Core Principles & Checklist */}
              <div className="space-y-2.5 rounded-2xl bg-slate-50 p-4 border border-line">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand" /> Institutional Trading Playbook
                </p>
                <ul className="space-y-2 text-xs text-slate-700 font-medium">
                  {selectedResource.points.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-brand shrink-0 mt-1.5" />
                      <span className="leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => {
                    const textToCopy = `${selectedResource.title}\n\n${selectedResource.points.join("\n")}`;
                    navigator.clipboard.writeText(textToCopy);
                    showToast("Copied guide points to clipboard!");
                  }}
                  className="flex items-center gap-2 rounded-xl border border-line bg-cream px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy Reference
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedResource(null)}
                    className="rounded-xl px-4 py-2.5 text-xs font-bold text-muted hover:text-ink transition cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const res = selectedResource;
                      setSelectedResource(null);
                      handleCreateCanvasFromResource(res);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-brand text-white px-5 py-2.5 text-xs font-black hover:bg-brand-dark shadow-md shadow-brand/20 transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Create Canvas with Guide
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EXPANDED RICH WHITEBOARD PREFERENCES SETTINGS MODAL (ACCESSIBLE IN HUB) */}
        {settingsOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-lg rounded-3xl border border-line bg-white p-6 shadow-2xl space-y-4">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-brand" />
                  <h3 className="font-display font-extrabold text-ink text-base">Whiteboard Preferences</h3>
                </div>
                <button onClick={() => setSettingsOpen(false)} className="rounded-lg p-1 text-muted hover:text-ink cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Preference Category Tabs */}
              <div className="flex items-center gap-1.5 rounded-2xl bg-cream p-1 border border-line">
                <button
                  type="button"
                  onClick={() => setSettingsTab("general")}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    settingsTab === "general" ? "bg-brand text-white shadow-sm" : "text-ink hover:text-brand"
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" /> General & UI
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsTab("canvas")}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    settingsTab === "canvas" ? "bg-brand text-white shadow-sm" : "text-ink hover:text-brand"
                  }`}
                >
                  <Grid className="h-3.5 w-3.5" /> Canvas & Tools
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsTab("forex")}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    settingsTab === "forex" ? "bg-brand text-white shadow-sm" : "text-ink hover:text-brand"
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5" /> Forex & Risk
                </button>
              </div>

              {/* TAB 1: GENERAL & UI PREFERENCES */}
              {settingsTab === "general" && (
                <div className="space-y-3 text-xs max-h-[55vh] overflow-y-auto pr-1">
                  {/* Tooltip Explanation & GIF Demo Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-line bg-cream/50">
                    <div>
                      <label className="font-bold text-ink flex items-center gap-1.5">
                        <Info className="h-4 w-4 text-brand" /> Show Tooltips & GIF Demos
                      </label>
                      <p className="text-[10px] text-muted">Displays guide cards with GIF-style animations when hovering tools</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowTooltips(!showTooltips);
                        showToast(showTooltips ? "Disabled tool explanations" : "Enabled tool explanations");
                      }}
                      className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center cursor-pointer ${
                        showTooltips ? "bg-brand justify-end" : "bg-slate-300 justify-start"
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full bg-white shadow-md" />
                    </button>
                  </div>

                  {/* Show TradingView Floating Favorites Bar Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-line bg-cream/50">
                    <div>
                      <label className="font-bold text-ink flex items-center gap-1.5">
                        <Star className="h-4 w-4 text-amber-500" /> Show Floating Favorites Toolbar
                      </label>
                      <p className="text-[10px] text-muted">Displays the TradingView-style draggable floating favorites bar</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowFavoritesBar(!showFavoritesBar);
                        showToast(showFavoritesBar ? "Hidden favorites toolbar" : "Shown favorites toolbar");
                      }}
                      className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center cursor-pointer ${
                        showFavoritesBar ? "bg-brand justify-end" : "bg-slate-300 justify-start"
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full bg-white shadow-md" />
                    </button>
                  </div>

                  {/* Show Cursor Canvas Coordinates Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-line bg-cream/50">
                    <div>
                      <label className="font-bold text-ink flex items-center gap-1.5">
                        <Crosshair className="h-4 w-4 text-blue-600" /> Show Cursor Coordinates (X, Y)
                      </label>
                      <p className="text-[10px] text-muted">Displays live mouse position X & Y coordinates in the bottom status bar</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCursorCoords(!showCursorCoords);
                        showToast(showCursorCoords ? "Disabled cursor coordinates" : "Enabled cursor coordinates");
                      }}
                      className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center cursor-pointer ${
                        showCursorCoords ? "bg-brand justify-end" : "bg-slate-300 justify-start"
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full bg-white shadow-md" />
                    </button>
                  </div>

                  {/* Mouse Scroll Wheel Action */}
                  <div className="p-3 rounded-2xl border border-line bg-cream/50 space-y-1.5">
                    <label className="font-bold text-ink flex items-center gap-1.5">
                      <MousePointerClick className="h-4 w-4 text-brand" /> Mouse Wheel Action
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setMouseWheelMode("zoom")}
                        className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          mouseWheelMode === "zoom" ? "bg-brand text-white" : "bg-white text-ink hover:bg-slate-200"
                        }`}
                      >
                        Zoom In / Out
                      </button>
                      <button
                        type="button"
                        onClick={() => setMouseWheelMode("pan")}
                        className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          mouseWheelMode === "pan" ? "bg-brand text-white" : "bg-white text-ink hover:bg-slate-200"
                        }`}
                      >
                        Pan Canvas
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CANVAS & DRAWING PREFERENCES */}
              {settingsTab === "canvas" && (
                <div className="space-y-3 text-xs max-h-[55vh] overflow-y-auto pr-1">
                  {/* Default Canvas Grid Theme */}
                  <div className="p-3 rounded-2xl border border-line bg-cream/50 space-y-1">
                    <label className="font-bold text-ink block">Default Canvas Grid Theme</label>
                    <select
                      value={bgGrid}
                      onChange={(e) => handleSetBgGrid(e.target.value as any)}
                      className="w-full rounded-xl border border-line bg-white p-2.5 font-bold text-ink outline-none focus:border-brand"
                    >
                      {CANVAS_THEMES.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Snap to Grid Preference */}
                  <div className="p-3 rounded-2xl border border-line bg-cream/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-bold text-ink flex items-center gap-1.5">
                          <Grid className="h-4 w-4 text-emerald-600" /> Snap to Grid
                        </label>
                        <p className="text-[10px] text-muted">Automatically aligns shape coordinates to grid steps</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSnapToGrid(!snapToGrid);
                          showToast(snapToGrid ? "Disabled grid snapping" : "Enabled grid snapping");
                        }}
                        className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center cursor-pointer ${
                          snapToGrid ? "bg-brand justify-end" : "bg-slate-300 justify-start"
                        }`}
                      >
                        <span className="h-4 w-4 rounded-full bg-white shadow-md" />
                      </button>
                    </div>
                  </div>

                  {/* High DPI Image Export */}
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-line bg-cream/50">
                    <div>
                      <label className="font-bold text-ink flex items-center gap-1.5">
                        <Save className="h-4 w-4 text-brand" /> High-Resolution 2x Export
                      </label>
                      <p className="text-[10px] text-muted">Exports crisp, high-DPI screenshots for trade journal submissions</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setHighDpiExport(!highDpiExport);
                        showToast(highDpiExport ? "Standard 1x export active" : "Ultra-crisp 2x export active");
                      }}
                      className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center cursor-pointer ${
                        highDpiExport ? "bg-brand justify-end" : "bg-slate-300 justify-start"
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full bg-white shadow-md" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: FOREX & RISK PREFERENCES */}
              {settingsTab === "forex" && (
                <div className="space-y-3 text-xs max-h-[55vh] overflow-y-auto pr-1">
                  {/* Default Risk:Reward Ratio */}
                  <div className="p-3 rounded-2xl border border-line bg-cream/50 space-y-1.5">
                    <label className="font-bold text-ink flex items-center justify-between">
                      <span>Default Position Risk-to-Reward Ratio</span>
                      <strong className="text-brand">1:{defaultRiskReward}</strong>
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                      {[1, 1.5, 2, 3, 5].map((rr) => (
                        <button
                          key={rr}
                          type="button"
                          onClick={() => {
                            setDefaultRiskReward(rr);
                            showToast(`Set default R:R ratio to 1:${rr}`);
                          }}
                          className={`py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                            defaultRiskReward === rr ? "bg-brand text-white" : "bg-white text-ink hover:bg-slate-200"
                          }`}
                        >
                          1:{rr}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-line">
                <button onClick={() => setSettingsOpen(false)} className="btn-primary w-full !py-2.5 text-xs font-bold cursor-pointer">
                  Save & Apply Preferences
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EXPANDED KEYBOARD SHORTCUTS REFERENCE MODAL (ACCESSIBLE IN HUB) */}
        {shortcutsOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-2xl rounded-3xl border border-line bg-white p-6 shadow-2xl space-y-4 max-h-[88vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-line pb-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-brand-light text-brand flex items-center justify-center shrink-0">
                    <Keyboard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-ink text-base">Keyboard Shortcuts & Quick Controls</h3>
                    <p className="text-[11px] text-muted font-medium">Quick reference cheat-sheet for fast technical analysis & charting</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShortcutsOpen(false)}
                  className="rounded-xl p-1.5 text-muted hover:text-ink hover:bg-cream transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative shrink-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                <input
                  type="text"
                  value={shortcutFilter}
                  onChange={(e) => setShortcutFilter(e.target.value)}
                  placeholder="Search shortcuts (e.g., select, fibo, undo, duplicate, path, eraser)..."
                  className="w-full pl-10 pr-14 py-2 rounded-2xl border border-line bg-cream text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition"
                />
                {shortcutFilter && (
                  <button
                    type="button"
                    onClick={() => setShortcutFilter("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-muted hover:text-ink cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Shortcuts List by Categories */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                {SHORTCUT_GROUPS.map((group) => {
                  const filteredItems = group.items.filter((item) =>
                    !shortcutFilter ||
                    item.label.toLowerCase().includes(shortcutFilter.toLowerCase()) ||
                    item.keys.some((k) => k.toLowerCase().includes(shortcutFilter.toLowerCase()))
                  );

                  if (filteredItems.length === 0) return null;

                  return (
                    <div key={group.category} className="space-y-2 rounded-2xl border border-line bg-cream/50 p-3.5">
                      <div className="flex items-center justify-between text-ink font-extrabold text-xs">
                        <h4>{group.category}</h4>
                        <span className="text-[10px] text-muted font-normal">({filteredItems.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {filteredItems.map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center justify-between p-2 rounded-xl bg-white border border-line shadow-xs"
                          >
                            <span className="font-semibold text-slate-800 text-[11px]">{item.label}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {item.keys.map((key) => (
                                <kbd
                                  key={key}
                                  className="px-2 py-0.5 rounded-lg border border-slate-300 bg-slate-100 font-mono text-[10px] font-extrabold text-slate-800 shadow-xs"
                                >
                                  {key}
                                </kbd>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Note */}
              <div className="flex items-center justify-between border-t border-line pt-3 text-[11px] text-muted shrink-0">
                <div className="flex items-center gap-1.5">
                  <span>Press <kbd className="px-1.5 py-0.5 rounded border border-slate-300 bg-slate-100 font-mono text-[10px] font-bold text-ink">?</kbd> anywhere to toggle this cheat-sheet</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShortcutsOpen(false)}
                  className="btn-primary !py-1.5 !px-4 text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Maximum 5 Tabs Limit Prompt Modal (Accessible in Hub) */}
        {renderMaxTabPromptModal()}

        {/* Interactive Create New Canvas & Environment Setup Modal (Accessible in Hub) */}
        {renderCreateCanvasModal()}
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                        VIEW MODE 2: LIVE CANVAS MODE                       */
  /* -------------------------------------------------------------------------- */
  return (
    <div ref={containerRef} className="fixed inset-0 h-screen w-screen bg-slate-900 text-ink font-sans flex flex-col overflow-hidden select-none touch-none">
      {/* Toast Notification */}
      {statusMsg && (
        <div className="fixed top-20 right-6 z-50 rounded-2xl bg-brand text-white px-5 py-3 shadow-2xl flex items-center gap-2 font-bold text-xs animate-in fade-in slide-in-from-top-3">
          <Check className="h-4 w-4" /> {statusMsg}
        </div>
      )}

      {/* Maximum 5 Tabs Limit Prompt Modal */}
      {renderMaxTabPromptModal()}

      {/* Interactive Create New Canvas & Environment Setup Modal */}
      {renderCreateCanvasModal()}

      {/* TradingView-Style Floating Draggable Favorites Toolbar */}
      {favoritedTools.length > 0 && showFavoritesBar && (
        <div
          className="fixed z-[150] flex items-center gap-1 rounded-2xl border border-line bg-white/95 backdrop-blur-md p-1.5 shadow-2xl animate-in fade-in cursor-default"
          style={{ left: favPos.x, top: favPos.y }}
        >
          <div
            onMouseDown={handleFavDragStart}
            className="cursor-move px-1 text-slate-400 hover:text-slate-700 flex items-center justify-center"
            title="Drag TradingView Favorites Toolbar Anywhere on Page"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          {favoritedTools.map((tKey) => {
            const IconComponent = getToolIcon(tKey);
            return (
              <button
                key={tKey}
                type="button"
                onClick={() => setActiveTool(tKey)}
                className={`h-8 w-8 rounded-xl flex items-center justify-center transition ${
                  activeTool === tKey ? "bg-brand text-white shadow-md" : "text-slate-700 hover:bg-cream"
                }`}
                title={TOOL_EXPLANATIONS[tKey]?.title || tKey}
              >
                <IconComponent className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Header Bar */}
      <header className="h-16 border-b border-line bg-white px-5 flex items-center justify-between gap-4 shrink-0 z-[60] relative shadow-sm">
        {/* Left Section: GAMAT Logo & Board Title */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Logo variant="dark" asDiv />
          <span className="h-6 w-[1.5px] bg-slate-300 shrink-0 hidden sm:inline" />
          <span className="hidden md:inline text-xs font-bold text-ink/70">
            Technical Analysis Whiteboard
          </span>
        </div>

        {/* Right Section: Photoshop-Style Menu Bar with Vertical Dividers */}
        <div className="flex items-center gap-2 shrink-0 text-xs font-bold text-ink">
          {/* Diagrams Workspace Options Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDiagramsMenuOpen(!diagramsMenuOpen)}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 transition ${
                diagramsMenuOpen ? "bg-brand-light text-brand" : "hover:bg-slate-100 text-ink"
              }`}
              title="Click to view Drafts, Samples & Trash"
            >
              <FolderKanban className="h-4 w-4 text-slate-700" />
              <span>Diagrams</span>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${diagramsMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Unified Popover Dropdown Menu */}
            {diagramsMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-84 rounded-2xl border border-line bg-white p-3.5 shadow-2xl z-[100] animate-in fade-in space-y-3">
                {/* Header & Close Button */}
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <span className="font-extrabold text-xs text-ink flex items-center gap-1.5">
                    <FolderKanban className="h-4 w-4 text-slate-700" /> Diagram Workspace Manager
                  </span>
                  <button
                    type="button"
                    onClick={() => setDiagramsMenuOpen(false)}
                    className="text-slate-400 hover:text-ink p-1 rounded-lg hover:bg-slate-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Save Current Draft Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    handleSaveCurrentDraft();
                    setActiveMenuTab("drafts");
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand text-white py-2 text-xs font-extrabold hover:bg-brand-dark transition shadow-md"
                >
                  <Save className="h-4 w-4" /> Save Current Canvas as Draft
                </button>

                {/* Dropdown Section Switcher Tabs: Drafts | Samples | Trash */}
                <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-line">
                  <button
                    type="button"
                    onClick={() => setActiveMenuTab("drafts")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1 ${
                      activeMenuTab === "drafts" ? "bg-white text-brand shadow-sm" : "text-slate-600 hover:text-ink"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5 text-slate-700" /> Drafts ({tabs.length + savedDrafts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMenuTab("samples")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1 ${
                      activeMenuTab === "samples" ? "bg-white text-brand shadow-sm" : "text-slate-600 hover:text-ink"
                    }`}
                  >
                    <BookOpen className="h-3.5 w-3.5 text-slate-700" /> Samples
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMenuTab("trash")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1 ${
                      activeMenuTab === "trash" ? "bg-white text-rose-600 shadow-sm" : "text-slate-600 hover:text-ink"
                    }`}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-slate-700" /> Trash ({trashedTabs.length})
                  </button>
                </div>

                {/* SECTION 1: DRAFTS */}
                {activeMenuTab === "drafts" && (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    <p className="text-[10px] font-black uppercase text-muted tracking-wider">Active Open Tabs</p>
                    {tabs.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => { handleSelectTab(t.id); setDiagramsMenuOpen(false); }}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition ${
                          activeTabId === t.id ? "border-brand bg-brand-light/30 font-bold" : "border-line hover:bg-cream"
                        }`}
                      >
                        <span className="truncate text-ink flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-slate-700" /> {t.name}
                        </span>
                        {activeTabId === t.id && <span className="text-[10px] bg-brand text-white px-1.5 py-0.5 rounded font-bold">Active</span>}
                      </div>
                    ))}

                    {savedDrafts.length > 0 && (
                      <>
                        <p className="text-[10px] font-black uppercase text-muted tracking-wider pt-2">Saved Draft Presets</p>
                        {savedDrafts.map((d) => (
                          <div
                            key={d.id}
                            className="flex items-center justify-between p-2 rounded-xl border border-line bg-cream hover:bg-white text-xs transition"
                          >
                            <div className="truncate flex-1 cursor-pointer" onClick={() => { loadSavedDraft(d); setDiagramsMenuOpen(false); }}>
                              <p className="font-bold text-ink truncate">{d.name}</p>
                              <p className="text-[9px] text-muted">{d.shapes.length} layers • Saved {new Date(d.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteDraft(d.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition"
                              title="Delete Draft"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {/* SECTION 2: SAMPLES */}
                {activeMenuTab === "samples" && (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {hubSamples.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => { loadSampleClassChart(sample.id); setDiagramsMenuOpen(false); }}
                        className="flex w-full items-center justify-between rounded-xl border border-line p-2.5 text-left text-xs font-bold text-ink hover:border-brand/40 hover:bg-brand-light/20 transition cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black uppercase text-brand bg-brand-light px-1.5 py-0.5 rounded">
                              {sample.category}
                            </span>
                            <span className="font-extrabold text-ink truncate">{sample.name}</span>
                          </div>
                          <p className="text-[10px] text-muted line-clamp-1 mt-0.5">{sample.desc}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-2">
                          {sample.shapes?.length || 0} layers
                        </span>
                      </button>
                    ))}

                    {isAdmin && (
                      <div className="pt-2 border-t border-line">
                        <button
                          type="button"
                          onClick={() => navigate("/admin/whiteboard")}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 p-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition cursor-pointer"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-amber-700" /> Manage Templates in Admin Hub
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* SECTION 3: TRASH */}
                {activeMenuTab === "trash" && (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {trashedTabs.length === 0 ? (
                      <div className="text-center py-6 space-y-1">
                        <Trash2 className="h-8 w-8 text-slate-300 mx-auto" />
                        <p className="font-bold text-xs text-ink">Trash is Empty</p>
                        <p className="text-[10px] text-muted">Closed tabs appear here and automatically disappear after 30 days.</p>
                      </div>
                    ) : (
                      trashedTabs.map((item) => {
                        const daysLeft = Math.max(0, 30 - Math.floor((Date.now() - item.deletedAt) / (1000 * 60 * 60 * 24)));
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2.5 rounded-xl border border-line bg-cream text-xs space-x-2"
                          >
                            <div className="truncate flex-1">
                              <p className="font-bold text-ink truncate">{item.name}</p>
                              <p className="text-[9px] text-amber-600 font-bold flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Deletes in {daysLeft} days
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => { restoreTrashedTab(item); setDiagramsMenuOpen(false); }}
                                className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold text-[10px] flex items-center gap-1 transition"
                                title="Restore Tab"
                              >
                                <RotateCcw className="h-3 w-3" /> Restore
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteTrashedTabPermanently(item.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                                title="Delete Permanently"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Vertical Divider */}
          <span className="h-6 w-[1.5px] bg-slate-300 shrink-0" />

          {/* Canvas Background Theme Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setBgOpen(!bgOpen)}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 transition ${
                bgOpen ? "bg-brand-light text-brand" : "hover:bg-slate-100 text-ink"
              }`}
              title="Canvas Background Theme"
            >
              <Grid className="h-4 w-4 text-slate-700" />
              <span>Theme</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted" />
            </button>

            {bgOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-line bg-white p-2 shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2">
                <p className="px-3 py-1 text-[10px] font-black uppercase text-muted tracking-wider">Background Theme</p>
                {CANVAS_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      handleSetBgGrid(theme.id as any);
                      setBgOpen(false);
                      showToast(`Switched canvas to ${theme.name}!`);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition ${
                      bgGrid === theme.id ? "bg-brand-light text-brand" : "text-ink hover:bg-cream"
                    }`}
                  >
                    {theme.name}
                    {bgGrid === theme.id && <span className="h-2 w-2 rounded-full bg-brand" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vertical Divider */}
          <span className="h-6 w-[1.5px] bg-slate-300 shrink-0" />

          {/* Snap to Grid Button */}
          <button
            type="button"
            onClick={() => {
              setSnapToGrid(!snapToGrid);
              showToast(snapToGrid ? "Snap to Grid: Disabled" : `Snap to Grid: Enabled (${gridSnapSize}px)`);
            }}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-1.5 font-bold transition-all ${
              snapToGrid
                ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 backdrop-blur-xs shadow-xs"
                : "border border-transparent hover:bg-slate-100 text-ink"
            }`}
            title="Toggle Snap to Grid (Active by Default)"
          >
            <Magnet className={`h-4 w-4 ${snapToGrid ? "text-emerald-600" : "text-slate-700"}`} />
            <span>Snap</span>
          </button>

          {/* Vertical Divider */}
          <span className="h-6 w-[1.5px] bg-slate-300 shrink-0" />

          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportOpen(!exportOpen)}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 transition ${
                exportOpen ? "bg-brand-light text-brand" : "hover:bg-slate-100 text-ink"
              }`}
              title="Export Canvas"
            >
              <Download className="h-4 w-4 text-slate-700" />
              <span>Export</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted" />
            </button>

            {exportOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl border border-line bg-white p-2 shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2">
                <button
                  type="button"
                  onClick={() => handleExport("png")}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                >
                  <FileImage className="h-4 w-4 text-slate-700" /> Export PNG
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("jpeg")}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                >
                  <FileImage className="h-4 w-4 text-slate-700" /> Export JPEG
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("svg")}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                >
                  <FileCode className="h-4 w-4 text-slate-700" /> Export SVG
                </button>
              </div>
            )}
          </div>

          {/* Vertical Divider */}
          <span className="h-6 w-[1.5px] bg-slate-300 shrink-0" />

          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center justify-center rounded-xl p-1.5 text-ink hover:bg-slate-100 transition shrink-0"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4 text-slate-700" /> : <Maximize2 className="h-4 w-4 text-slate-700" />}
          </button>

          {/* Vertical Divider */}
          <span className="h-6 w-[1.5px] bg-slate-300 shrink-0" />

          {/* User Account Avatar & Profile Menu (Avatar + Dropdown Only) */}
          <div ref={userMenuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-2xl p-1 hover:bg-slate-100 transition group"
              title={`${user.firstName} ${user.lastName} (${user.email})`}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.firstName}
                  className="h-8 w-8 rounded-full object-cover border border-line shadow-xs group-hover:ring-2 group-hover:ring-brand transition shrink-0"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-xs font-extrabold text-white shadow-xs group-hover:ring-2 group-hover:ring-brand transition shrink-0">
                  {`${user.firstName?.[0] ?? "U"}${user.lastName?.[0] ?? ""}`.toUpperCase()}
                </span>
              )}
              <ChevronDown className={`h-3.5 w-3.5 text-muted transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Profile Popover Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-line bg-white shadow-2xl z-[100] animate-in fade-in overflow-hidden">
                <div className="border-b border-line bg-cream p-3.5">
                  <div className="flex items-center gap-2.5">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover border border-line" />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-xs font-black text-white">
                        {`${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-xs text-ink truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-[10px] text-muted truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-brand-light text-brand text-[9px] font-black uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-2 space-y-1 text-xs">
                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); navigate("/dashboard"); }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-ink font-bold hover:bg-brand-light hover:text-brand transition text-left"
                  >
                    <User className="h-4 w-4 text-slate-700" /> Student Dashboard
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); navigate("/admin"); }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-ink font-bold hover:bg-brand-light hover:text-brand transition text-left"
                    >
                      <ShieldCheck className="h-4 w-4 text-slate-700" /> Admin Console
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); navigate("/"); }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-ink font-bold hover:bg-cream transition text-left"
                  >
                    <Home className="h-4 w-4 text-slate-700" /> Platform Home
                  </button>

                  <div className="border-t border-line my-1" />

                  {/* Whiteboard Preferences Settings */}
                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); setSettingsOpen(true); }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-ink font-bold hover:bg-brand-light hover:text-brand transition text-left"
                  >
                    <Settings className="h-4 w-4 text-slate-700" /> Whiteboard Settings
                  </button>

                  {/* Keyboard Shortcuts right under Settings */}
                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); setShortcutsOpen(true); }}
                    className="flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-ink font-bold hover:bg-brand-light hover:text-brand transition text-left"
                  >
                    <span className="flex items-center gap-2.5">
                      <Keyboard className="h-4 w-4 text-slate-700" /> Keyboard Shortcuts
                    </span>
                    <span className="rounded-md border border-line bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-muted">
                      ?
                    </span>
                  </button>

                  <div className="border-t border-line my-1" />

                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); logout(); }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-rose-600 font-bold hover:bg-rose-50 transition text-left"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Outer Viewport Container: Sub-Header Tabs + Canvas Workspace + Full-Height Floating Inspector */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Sub-Header Drag-and-Drop Reorderable Tabs Bar */}
        <div className="h-10 border-b border-line bg-slate-100 px-4 flex items-center justify-between gap-3 shrink-0 z-20 relative">
        {/* Left Side: Home Icon Hub Link & Active Tabs List */}
        <div className="flex items-center gap-3 shrink-0 min-w-0 flex-1 overflow-hidden">
          <button
            type="button"
            onClick={handleReturnToHub}
            className="flex items-center justify-center p-1 text-slate-600 hover:text-brand transition shrink-0 cursor-pointer"
            title="Return to Files Hub (Auto-saves current canvas)"
          >
            <Home className="h-4 w-4" />
          </button>

          {/* Vertical Separator Line */}
          <span className="h-5 w-px bg-line/80 shrink-0" />

          {/* Diagram Tabs Bar with Drag & Drop Reordering (Locally Scrollable - No Visible Scrollbar) */}
          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto py-1 max-w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab, idx) => (
              <div
                key={tab.id}
                draggable={editingTabId !== tab.id}
                onDragStart={() => setDraggedTabIdx(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggedTabIdx !== null && draggedTabIdx !== idx) {
                    setTabs((prev) => {
                      const copy = [...prev];
                      const [moved] = copy.splice(draggedTabIdx, 1);
                      copy.splice(idx, 0, moved);
                      return copy;
                    });
                    setDraggedTabIdx(null);
                    showToast("Reordered diagram tab!");
                  }
                }}
                onClick={() => handleSelectTab(tab.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setTabContextMenu({
                    x: Math.min(e.clientX, window.innerWidth - 220),
                    y: Math.min(e.clientY, window.innerHeight - 260),
                    tabId: tab.id,
                    tabName: tab.name,
                  });
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleStartRenameTab(tab.id, tab.name);
                }}
                className={`group flex items-center gap-1.5 rounded-t-xl px-2.5 py-1 text-[11px] font-semibold cursor-grab active:cursor-grabbing transition-all border-t border-x shrink-0 select-none ${
                  activeTabId === tab.id
                    ? "bg-white text-brand border-line shadow-xs font-bold"
                    : "border-transparent text-muted hover:text-ink hover:bg-white/60"
                }`}
                title={`Right-click for options • Double-click to rename • Drag to reorder "${tab.name}"`}
              >
                <GripVertical className="h-2.5 w-2.5 text-slate-300 group-hover:text-slate-500 opacity-60 shrink-0" />
                {/* Editable / Truncated Tab Name */}
                {editingTabId === tab.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editingTabName}
                    onChange={(e) => setEditingTabName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveRenameTab();
                      else if (e.key === "Escape") setEditingTabId(null);
                    }}
                    onBlur={handleSaveRenameTab}
                    onClick={(e) => e.stopPropagation()}
                    className="px-1 py-0.5 rounded border border-brand bg-white text-[11px] font-bold text-ink outline-none w-24 shadow-xs"
                  />
                ) : (
                  <span
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleStartRenameTab(tab.id, tab.name);
                    }}
                    className="truncate max-w-[130px] inline-block align-bottom text-[11px]"
                  >
                    {tab.name}
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(tab.id);
                  }}
                  className="rounded-full p-0.5 opacity-60 hover:opacity-100 hover:bg-rose-100 hover:text-rose-600 transition cursor-pointer"
                  title="Move to Trash"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}

            {/* New Tab Plus Button */}
            <button
              type="button"
              onClick={handleAddNewTab}
              className="flex items-center justify-center h-6 w-6 rounded-lg border border-dashed border-slate-300 text-muted hover:border-brand hover:text-brand hover:bg-white transition ml-1 shrink-0 cursor-pointer"
              title="Create New Diagram Tab (Max 5)"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Whiteboard Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar Dock */}
        <aside className="w-14 border-r border-line bg-white p-1.5 flex flex-col items-center justify-between gap-2 shrink-0 z-20 shadow-md">
          <div className="space-y-1 w-full">
            <WhiteboardToolBtn
              active={activeTool === "select"}
              onClick={() => setActiveTool("select")}
              onContextMenu={(e) => {
                e.preventDefault();
                toggleFavoriteTool("select");
              }}
              title="Select, Move, Resize & Alt+Drag Duplicate (Right click to favorite)"
              toolKey="select"
              icon={MousePointer}
              showTooltips={showTooltips}
            />
            <WhiteboardToolBtn
              active={activeTool === "hand"}
              onClick={() => setActiveTool("hand")}
              onContextMenu={(e) => {
                e.preventDefault();
                toggleFavoriteTool("hand");
              }}
              title="Pan / Hand Tool (Right click to favorite)"
              toolKey="hand"
              icon={Hand}
              showTooltips={showTooltips}
            />

            {/* 1. FOREX TRADING TOOLS GROUP (NESTED GROUP) */}
            <div className="relative">
              <WhiteboardToolBtn
                active={["fibo", "long", "short", "orderblock", "fvg", "bos", "liquidity", "bullish_candle", "bearish_candle"].includes(activeTool)}
                onClick={() => selectTool(activeForexTool)}
                onFlyoutToggle={() => setFlyoutGroup(flyoutGroup === "forex" ? null : "forex")}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setFlyoutGroup(flyoutGroup === "forex" ? null : "forex");
                }}
                title="Forex & SMC Tools (Click arrow or right-click to choose tool)"
                toolKey={activeForexTool}
                icon={getToolIcon(activeForexTool)}
                hasFlyout
                isFlyoutOpen={flyoutGroup === "forex"}
                showTooltips={showTooltips}
              />

              {flyoutGroup === "forex" && (
                <div className="absolute left-full top-0 ml-2 w-60 rounded-2xl border border-line bg-white p-2 shadow-2xl z-50 animate-in fade-in space-y-1">
                  <p className="px-3 py-1 text-[10px] font-black uppercase text-muted tracking-wider">Forex & SMC Tools</p>

                  <FlyoutToolItem
                    toolKey="fibo"
                    label="Fibonacci Retracement"
                    icon={Percent}
                    isActive={activeForexTool === "fibo"}
                    isFavorited={favoritedTools.includes("fibo")}
                    onSelect={() => { selectTool("fibo"); setFlyoutGroup(null); }}
                    onToggleFavorite={() => toggleFavoriteTool("fibo")}
                    showTooltips={showTooltips}
                  />
                  <FlyoutToolItem
                    toolKey="long"
                    label="Long Position"
                    icon={TradingViewLongIcon}
                    isActive={activeForexTool === "long"}
                    isFavorited={favoritedTools.includes("long")}
                    onSelect={() => { selectTool("long"); setFlyoutGroup(null); }}
                    onToggleFavorite={() => toggleFavoriteTool("long")}
                    showTooltips={showTooltips}
                  />
                  <FlyoutToolItem
                    toolKey="short"
                    label="Short Position"
                    icon={TradingViewShortIcon}
                    isActive={activeForexTool === "short"}
                    isFavorited={favoritedTools.includes("short")}
                    onSelect={() => { selectTool("short"); setFlyoutGroup(null); }}
                    onToggleFavorite={() => toggleFavoriteTool("short")}
                    showTooltips={showTooltips}
                  />
                  <FlyoutToolItem
                    toolKey="orderblock"
                    label="Order Block (OB Zone)"
                    icon={OrderBlockIcon}
                    isActive={activeForexTool === "orderblock"}
                    isFavorited={favoritedTools.includes("orderblock")}
                    onSelect={() => { selectTool("orderblock"); setFlyoutGroup(null); }}
                    onToggleFavorite={() => toggleFavoriteTool("orderblock")}
                    showTooltips={showTooltips}
                  />
                  <FlyoutToolItem
                    toolKey="fvg"
                    label="Fair Value Gap (FVG)"
                    icon={FvgCandlesIcon}
                    isActive={activeForexTool === "fvg"}
                    isFavorited={favoritedTools.includes("fvg")}
                    onSelect={() => { selectTool("fvg"); setFlyoutGroup(null); }}
                    onToggleFavorite={() => toggleFavoriteTool("fvg")}
                    showTooltips={showTooltips}
                  />
                  <FlyoutToolItem
                    toolKey="bos"
                    label="Break of Structure (BOS)"
                    icon={BosIcon}
                    isActive={activeForexTool === "bos"}
                    isFavorited={favoritedTools.includes("bos")}
                    onSelect={() => { selectTool("bos"); setFlyoutGroup(null); }}
                    onToggleFavorite={() => toggleFavoriteTool("bos")}
                    showTooltips={showTooltips}
                  />
                  <FlyoutToolItem
                    toolKey="liquidity"
                    label="Liquidity Pool ($$$)"
                    icon={LiquidityIcon}
                    isActive={activeForexTool === "liquidity"}
                    isFavorited={favoritedTools.includes("liquidity")}
                    onSelect={() => { selectTool("liquidity"); setFlyoutGroup(null); }}
                    onToggleFavorite={() => toggleFavoriteTool("liquidity")}
                    showTooltips={showTooltips}
                  />
                  <FlyoutToolItem
                    toolKey="bullish_candle"
                    label="Bullish Candlestick"
                    icon={BullishCandleIcon}
                    isActive={activeForexTool === "bullish_candle"}
                    isFavorited={favoritedTools.includes("bullish_candle")}
                    onSelect={() => { selectTool("bullish_candle"); setFlyoutGroup(null); }}
                    onToggleFavorite={() => toggleFavoriteTool("bullish_candle")}
                    showTooltips={showTooltips}
                  />
                  <FlyoutToolItem
                    toolKey="bearish_candle"
                    label="Bearish Candlestick"
                    icon={BearishCandleIcon}
                    isActive={activeForexTool === "bearish_candle"}
                    isFavorited={favoritedTools.includes("bearish_candle")}
                    onSelect={() => { selectTool("bearish_candle"); setFlyoutGroup(null); }}
                    onToggleFavorite={() => toggleFavoriteTool("bearish_candle")}
                    showTooltips={showTooltips}
                  />
                </div>
              )}
            </div>

            {/* 2. FREEHAND GROUP */}
            <div className="relative">
              <WhiteboardToolBtn
                active={activeTool === "pencil" || activeTool === "highlighter"}
                onClick={() => selectTool(activePenTool)}
                onFlyoutToggle={() => setFlyoutGroup(flyoutGroup === "pen" ? null : "pen")}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setFlyoutGroup(flyoutGroup === "pen" ? null : "pen");
                }}
                title="Freehand Pen (Click arrow or right-click to change tool)"
                toolKey={activePenTool}
                icon={activePenTool === "highlighter" ? Highlighter : Pencil}
                hasFlyout
                isFlyoutOpen={flyoutGroup === "pen"}
                showTooltips={showTooltips}
              />
              {flyoutGroup === "pen" && (
                <div className="absolute left-full top-0 ml-2 w-48 rounded-2xl border border-line bg-white p-2 shadow-2xl z-50 animate-in fade-in space-y-1">
                  <p className="px-3 py-1 text-[10px] font-black uppercase text-muted tracking-wider">Pen Tools</p>
                  <FlyoutToolItem
                    toolKey="pencil"
                    label="Freehand Pen"
                    icon={Pencil}
                    isActive={activePenTool === "pencil"}
                    isFavorited={favoritedTools.includes("pencil")}
                    onSelect={() => { selectTool("pencil"); setFlyoutGroup(null); }}
                    onToggleFavorite={() => toggleFavoriteTool("pencil")}
                    showTooltips={showTooltips}
                  />
                  <FlyoutToolItem
                    toolKey="highlighter"
                    label="Highlighter"
                    icon={Highlighter}
                    isActive={activePenTool === "highlighter"}
                    isFavorited={favoritedTools.includes("highlighter")}
                    onSelect={() => { selectTool("highlighter"); setFlyoutGroup(null); }}
                    onToggleFavorite={() => toggleFavoriteTool("highlighter")}
                    showTooltips={showTooltips}
                  />
                </div>
              )}
            </div>

            {/* 3. SHAPES GROUP */}
            <div className="relative">
              <WhiteboardToolBtn
                active={activeTool === "rectangle" || activeTool === "circle" || activeTool === "diamond"}
                onClick={() => selectTool(activeShapeTool)}
                onFlyoutToggle={() => setFlyoutGroup(flyoutGroup === "shapes" ? null : "shapes")}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setFlyoutGroup(flyoutGroup === "shapes" ? null : "shapes");
                }}
                title="Geometric Shapes (Click arrow or right-click to change shape)"
                toolKey={activeShapeTool}
                icon={activeShapeTool === "circle" ? Circle : activeShapeTool === "diamond" ? Diamond : Square}
                hasFlyout
                isFlyoutOpen={flyoutGroup === "shapes"}
                showTooltips={showTooltips}
              />
              {flyoutGroup === "shapes" && (
                <div className="absolute left-full top-0 ml-2 w-52 rounded-2xl border border-line bg-white p-2 shadow-2xl z-50 animate-in fade-in space-y-1">
                  <p className="px-3 py-1 text-[10px] font-black uppercase text-muted tracking-wider">Shape Tools</p>
                  <FlyoutToolItem
                    toolKey="rectangle"
                    label="Rectangle Zone"
                    icon={Square}
                    isActive={activeShapeTool === "rectangle"}
                    isFavorited={favoritedTools.includes("rectangle")}
                    onSelect={() => { selectTool("rectangle"); setFlyoutGroup(null); }}
                    onToggleFavorite={() => toggleFavoriteTool("rectangle")}
                    showTooltips={showTooltips}
                  />
                  <FlyoutToolItem
                    toolKey="circle"
                    label="Circle Node"
                    icon={Circle}
                    isActive={activeShapeTool === "circle"}
                    isFavorited={favoritedTools.includes("circle")}
                    onSelect={() => { selectTool("circle"); setFlyoutGroup(null); }}
                    onToggleFavorite={() => toggleFavoriteTool("circle")}
                    showTooltips={showTooltips}
                  />
                  <FlyoutToolItem
                    toolKey="diamond"
                    label="Decision Diamond"
                    icon={Diamond}
                    isActive={activeShapeTool === "diamond"}
                    isFavorited={favoritedTools.includes("diamond")}
                    onSelect={() => { selectTool("diamond"); setFlyoutGroup(null); }}
                    onToggleFavorite={() => toggleFavoriteTool("diamond")}
                    showTooltips={showTooltips}
                  />
                </div>
              )}
            </div>

            {/* 4. LINES & PATHS GROUP */}
            <div className="relative">
              <WhiteboardToolBtn
                active={activeTool === "line" || activeTool === "arrow" || activeTool === "bezier"}
                onClick={() => selectTool(activeLineTool)}
                onFlyoutToggle={() => setFlyoutGroup(flyoutGroup === "lines" ? null : "lines")}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setFlyoutGroup(flyoutGroup === "lines" ? null : "lines");
                }}
                title="Lines & Paths (Click arrow or right-click to change line type)"
                toolKey={activeLineTool}
                icon={activeLineTool === "line" ? Minus : activeLineTool === "bezier" ? Activity : ArrowUpRight}
                hasFlyout
                isFlyoutOpen={flyoutGroup === "lines"}
                showTooltips={showTooltips}
              />
              {flyoutGroup === "lines" && (
                <div className="absolute left-full top-0 ml-2 w-56 rounded-2xl border border-line bg-white p-2 shadow-2xl z-50 animate-in fade-in space-y-1">
                  <p className="px-3 py-1 text-[10px] font-black uppercase text-muted tracking-wider">Line & Path Tools</p>
                  <FlyoutToolItem
                    toolKey="line"
                    label="Straight Line"
                    icon={Minus}
                    isActive={activeLineTool === "line"}
                    isFavorited={favoritedTools.includes("line")}
                    onSelect={() => { selectTool("line"); setFlyoutGroup(null); }}
                    onToggleFavorite={() => toggleFavoriteTool("line")}
                    showTooltips={showTooltips}
                  />
                  <FlyoutToolItem
                    toolKey="arrow"
                    label="Connector Arrow"
                    icon={ArrowUpRight}
                    isActive={activeLineTool === "arrow"}
                    isFavorited={favoritedTools.includes("arrow")}
                    onSelect={() => { selectTool("arrow"); setFlyoutGroup(null); }}
                    onToggleFavorite={() => toggleFavoriteTool("arrow")}
                    showTooltips={showTooltips}
                  />
                  <FlyoutToolItem
                    toolKey="bezier"
                    label="Chart Pattern Path"
                    icon={Activity}
                    isActive={activeLineTool === "bezier"}
                    isFavorited={favoritedTools.includes("bezier")}
                    onSelect={() => { selectTool("bezier"); setFlyoutGroup(null); }}
                    onToggleFavorite={() => toggleFavoriteTool("bezier")}
                    showTooltips={showTooltips}
                  />
                </div>
              )}
            </div>

            {/* 5. TEXT & STICKY NOTES GROUP */}
            <div className="relative">
              <WhiteboardToolBtn
                active={activeTool === "text" || activeTool === "sticky" || activeTool === "annotation"}
                onClick={() => selectTool(activeNoteTool)}
                onFlyoutToggle={() => setFlyoutGroup(flyoutGroup === "notes" ? null : "notes")}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setFlyoutGroup(flyoutGroup === "notes" ? null : "notes");
                }}
                title="Text, Notes & Annotations (Click arrow or right-click to choose tool)"
                toolKey={activeNoteTool}
                icon={activeNoteTool === "sticky" ? StickyNote : activeNoteTool === "annotation" ? AnnotationIcon : Type}
                hasFlyout
                isFlyoutOpen={flyoutGroup === "notes"}
                showTooltips={showTooltips}
              />
              {flyoutGroup === "notes" && (
                <div className="absolute left-full top-0 ml-2 w-56 rounded-2xl border border-line bg-white p-2 shadow-2xl z-50 animate-in fade-in space-y-1">
                  <p className="px-3 py-1 text-[10px] font-black uppercase text-muted tracking-wider">Text & Annotation Tools</p>
                  <FlyoutToolItem
                    toolKey="text"
                    label="Text Label (T)"
                    icon={Type}
                    isActive={activeNoteTool === "text"}
                    isFavorited={favoritedTools.includes("text")}
                    onSelect={() => { selectTool("text"); setFlyoutGroup(null); }}
                    onToggleFavorite={() => toggleFavoriteTool("text")}
                    showTooltips={showTooltips}
                  />
                  <FlyoutToolItem
                    toolKey="annotation"
                    label="Annotation Leader (W)"
                    icon={AnnotationIcon}
                    isActive={activeNoteTool === "annotation"}
                    isFavorited={favoritedTools.includes("annotation")}
                    onSelect={() => { selectTool("annotation"); setFlyoutGroup(null); }}
                    onToggleFavorite={() => toggleFavoriteTool("annotation")}
                    showTooltips={showTooltips}
                  />
                  <FlyoutToolItem
                    toolKey="sticky"
                    label="Sticky Note (N)"
                    icon={StickyNote}
                    isActive={activeNoteTool === "sticky"}
                    isFavorited={favoritedTools.includes("sticky")}
                    onSelect={() => { selectTool("sticky"); setFlyoutGroup(null); }}
                    onToggleFavorite={() => toggleFavoriteTool("sticky")}
                    showTooltips={showTooltips}
                  />
                </div>
              )}
            </div>

            <div className="relative">
              <WhiteboardToolBtn
                active={activeTool === "eraser"}
                onClick={() => selectTool("eraser")}
                onContextMenu={(e) => {
                  e.preventDefault();
                  toggleFavoriteTool("eraser");
                }}
                title="Precision Eraser Tool (Right click to favorite)"
                toolKey="eraser"
                icon={Eraser}
                showTooltips={showTooltips}
              />
            </div>

            <div className="relative">
              <WhiteboardToolBtn
                active={activeTool === "zoom"}
                onClick={() => selectTool("zoom")}
                onContextMenu={(e) => {
                  e.preventDefault();
                  toggleFavoriteTool("zoom");
                }}
                title="Zoom Tool (Right click to favorite)"
                toolKey="zoom"
                icon={Search}
                showTooltips={showTooltips}
              />
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="space-y-1 w-full border-t border-line pt-2">
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={handleUndo}
                disabled={shapes.length === 0}
                className="h-8 rounded-xl flex items-center justify-center text-slate-700 hover:bg-cream disabled:opacity-30 cursor-pointer"
                title="Undo (Ctrl + Z)"
              >
                <RotateCcw className="h-3.5 w-3.5 shrink-0" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="h-8 rounded-xl flex items-center justify-center text-slate-700 hover:bg-cream disabled:opacity-30 cursor-pointer"
                title="Redo (Ctrl + Y)"
              >
                <RotateCw className="h-3.5 w-3.5 shrink-0" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleClear}
              disabled={shapes.length === 0}
              className="w-full h-8 rounded-xl flex items-center justify-center text-rose-600 hover:bg-rose-50 disabled:opacity-30 cursor-pointer"
              title="Clear Whiteboard"
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" />
            </button>
          </div>
        </aside>

        {/* Central Whiteboard Drawing Canvas */}
        <main className="flex-1 relative overflow-hidden">
          {/* Bottom Zoom & Navigation Bar */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-xl border border-line bg-white/95 p-2 backdrop-blur shadow-lg text-xs font-bold">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))}
              className="p-1.5 text-ink hover:bg-cream rounded-lg"
              title="Zoom Out (or scroll wheel)"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-ink">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3.0, z + 0.15))}
              className="p-1.5 text-ink hover:bg-cream rounded-lg"
              title="Zoom In (or scroll wheel)"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1.5 text-brand hover:bg-brand-light rounded-lg ml-1"
              title="Reset View"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>

            {/* Marquee Zoom Tool Button */}
            <span className="h-4 w-px bg-line/80 mx-0.5" />
            <button
              type="button"
              onClick={() => {
                if (activeTool === "marquee_zoom") {
                  setActiveTool("select");
                  showToast("Switched back to Select Tool");
                } else {
                  setActiveTool("marquee_zoom");
                  showToast("Marquee Zoom active: Drag a rectangle over any area to zoom in!");
                }
              }}
              className={`px-2 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer text-xs font-bold ${
                activeTool === "marquee_zoom"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-100 hover:text-amber-600"
              }`}
              title="Marquee Zoom: Drag a rectangle over any chart area to zoom into that exact area"
            >
              <Scan className="h-3.5 w-3.5 shrink-0" />
              <span>Marquee Zoom</span>
            </button>

            {/* Optional Cursor Coordinates Indicator */}
            {showCursorCoords && cursorCoords && (
              <>
                <span className="h-4 w-px bg-line/80 mx-1" />
                <span className="text-[10px] text-muted flex items-center gap-1 font-mono">
                  <Crosshair className="h-3 w-3 text-brand" />
                  X: {Math.round(cursorCoords.x)} Y: {Math.round(cursorCoords.y)}
                </span>
              </>
            )}
          </div>

          {/* Canvas with Dynamic Tool Cursor, Mouse Wheel Zoom & Contextual Right-Click */}
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
            style={getToolCursorStyle(isSpaceHeld || isSpacePressed.current ? "hand" : activeTool, hoveredResizeHandle?.handle || activeResizeHandle?.handle)}
            className="w-full h-full block"
          />

          {/* Contextual Right-Click Popover Menu */}
          {contextMenu && (
            <div
              className="fixed z-50 w-56 rounded-2xl border border-line bg-white p-2 shadow-2xl animate-in fade-in"
              style={{ left: contextMenu.x, top: contextMenu.y }}
            >
              {contextMenu.targetShape ? (
                <div className="space-y-1">
                  <p className="px-3 py-1 text-[10px] font-black uppercase text-muted tracking-wider flex items-center justify-between">
                    <span>Selected {contextMenu.targetShape.name || contextMenu.targetShape.type.toUpperCase()}</span>
                    {contextMenu.targetShape.isLocked && <span className="text-amber-600 font-extrabold flex items-center gap-0.5"><Lock className="h-3 w-3" /> Locked</span>}
                  </p>

                  {!contextMenu.targetShape.isLocked && (
                    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-line pb-2 mb-1">
                      {PALETTE.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => applyColorToSelected(c)}
                          className={`h-4.5 w-4.5 rounded-full border border-line transition-transform ${
                            strokeColor === c ? "scale-125 ring-2 ring-brand" : "hover:scale-110"
                          }`}
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Lock / Unlock Object Button */}
                  <button
                    type="button"
                    onClick={() => toggleLockShape(contextMenu.targetShape!.id)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                  >
                    {contextMenu.targetShape.isLocked ? (
                      <><Unlock className="h-3.5 w-3.5 text-emerald-600" /> Unlock Object 🔓</>
                    ) : (
                      <><Lock className="h-3.5 w-3.5 text-amber-600" /> Lock Object 🔒</>
                    )}
                  </button>

                  {!contextMenu.targetShape.isLocked && (contextMenu.targetShape.type === "text" || contextMenu.targetShape.type === "sticky") && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = contextMenu.targetShape!;
                        setSelectedShapeIds([target.id]);
                        setInlineEditor({
                          x: target.points[0].x,
                          y: target.points[0].y,
                          text: target.text || "",
                          shapeId: target.id,
                          isSticky: target.type === "sticky",
                          fontSize: target.fontSize || fontSize,
                          fontFamily: target.fontFamily || fontFamily,
                          fontWeight: target.fontWeight || fontWeight,
                          fontStyle: target.fontStyle || fontStyle,
                          textDecoration: target.textDecoration || textDecoration,
                          textAlign: target.textAlign || textAlign,
                          textTransform: target.textTransform || textTransform,
                          letterSpacing: target.letterSpacing ?? letterSpacing,
                          lineHeight: target.lineHeight || lineHeight,
                          color: target.textColor || target.color || strokeColor,
                        });
                        setContextMenu(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-brand" /> {contextMenu.targetShape.type === "sticky" ? "Edit Sticky Note" : "Edit Text"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => duplicateSelectedObject(contextMenu.targetShape!)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                  >
                    <Copy className="h-3.5 w-3.5 text-blue-600" /> Duplicate (Alt + Drag)
                  </button>

                  {!contextMenu.targetShape.isLocked && (
                    <>
                      <button
                        type="button"
                        onClick={() => bringToFront(contextMenu.targetShape!.id)}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                      >
                        <ArrowUp className="h-3.5 w-3.5 text-emerald-600" /> Bring to Front
                      </button>

                      <button
                        type="button"
                        onClick={() => sendToBack(contextMenu.targetShape!.id)}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                      >
                        <ArrowDown className="h-3.5 w-3.5 text-amber-600" /> Send to Back
                      </button>
                    </>
                  )}

                  <div className="border-t border-line pt-1 mt-1">
                    <button
                      type="button"
                      onClick={() => deleteSelectedObject(contextMenu.targetShape!.id)}
                      className={`flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        contextMenu.targetShape.isLocked ? "text-slate-400 cursor-not-allowed" : "text-rose-600 hover:bg-rose-50"
                      }`}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete Object
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="px-3 py-1 text-[10px] font-black uppercase text-muted tracking-wider">Canvas Quick Tools</p>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTool("fibo");
                      setContextMenu(null);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                  >
                    <Percent className="h-3.5 w-3.5 text-slate-700" /> Fibonacci Retracement
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTool("long");
                      setContextMenu(null);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                  >
                    <TradingViewLongIcon className="h-3.5 w-3.5" /> Long Position Box
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTool("short");
                      setContextMenu(null);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                  >
                    <TradingViewShortIcon className="h-3.5 w-3.5" /> Short Position Box
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsStickyMode(true);
                      setTextModalPos(contextMenu.canvasPt);
                      setActiveTool("sticky");
                      setContextMenu(null);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                  >
                    <StickyNote className="h-3.5 w-3.5 text-slate-700" /> Add Sticky Note Here
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsStickyMode(false);
                      setTextModalPos(contextMenu.canvasPt);
                      setActiveTool("text");
                      setContextMenu(null);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                  >
                    <Type className="h-3.5 w-3.5 text-slate-700" /> Add Text Label Here
                  </button>

                  <div className="border-t border-line pt-1 mt-1">
                    <button
                      type="button"
                      onClick={() => { handleClear(); setContextMenu(null); }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Clear Whiteboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB RIGHT-CLICK CONTEXT MENU */}
          {tabContextMenu && (
            <div
              className="fixed z-[200] w-52 rounded-2xl border border-line bg-white/95 p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 text-xs font-medium"
              style={{ left: tabContextMenu.x, top: tabContextMenu.y }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-muted border-b border-line mb-1 truncate">
                {tabContextMenu.tabName}
              </div>
              <button
                type="button"
                onClick={() => handleStartRenameTab(tabContextMenu.tabId, tabContextMenu.tabName)}
                className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-slate-700 hover:bg-cream hover:text-brand transition cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Rename Tab</span>
              </button>
              <button
                type="button"
                onClick={() => handleDuplicateTab(tabContextMenu.tabId)}
                className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-slate-700 hover:bg-cream hover:text-brand transition cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Duplicate Tab</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setBgOpen(true);
                  setTabContextMenu(null);
                }}
                className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-slate-700 hover:bg-cream hover:text-brand transition cursor-pointer"
              >
                <Grid className="h-3.5 w-3.5" />
                <span>Change Theme / Grid</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSaveCurrentDraft();
                  setTabContextMenu(null);
                }}
                className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-slate-700 hover:bg-cream hover:text-brand transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Save as Draft</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setExportOpen(true);
                  setTabContextMenu(null);
                }}
                className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-slate-700 hover:bg-cream hover:text-brand transition cursor-pointer"
              >
                <FileImage className="h-3.5 w-3.5" />
                <span>Export Diagram</span>
              </button>
              <div className="h-px bg-line my-1" />
              <button
                type="button"
                onClick={() => {
                  handleCloseTab(tabContextMenu.tabId);
                  setTabContextMenu(null);
                }}
                className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Close & Move to Trash</span>
              </button>
            </div>
          )}

          {/* EXPANDED KEYBOARD SHORTCUTS REFERENCE MODAL */}
          {shortcutsOpen && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm animate-in fade-in">
              <div className="w-full max-w-2xl rounded-3xl border border-line bg-white p-6 shadow-2xl space-y-4 max-h-[88vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-line pb-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-brand-light text-brand flex items-center justify-center shrink-0">
                      <Keyboard className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-ink text-base">Keyboard Shortcuts & Quick Controls</h3>
                      <p className="text-[11px] text-muted font-medium">Quick reference cheat-sheet for fast technical analysis & charting</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShortcutsOpen(false)}
                    className="rounded-xl p-1.5 text-muted hover:text-ink hover:bg-cream transition cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative shrink-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                  <input
                    type="text"
                    value={shortcutFilter}
                    onChange={(e) => setShortcutFilter(e.target.value)}
                    placeholder="Search shortcuts (e.g., select, fibo, undo, duplicate, path, eraser)..."
                    className="w-full pl-10 pr-14 py-2 rounded-2xl border border-line bg-cream text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition"
                  />
                  {shortcutFilter && (
                    <button
                      type="button"
                      onClick={() => setShortcutFilter("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-muted hover:text-ink"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Shortcuts List by Categories */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                  {SHORTCUT_GROUPS.map((group) => {
                    const filteredItems = group.items.filter((item) =>
                      !shortcutFilter ||
                      item.label.toLowerCase().includes(shortcutFilter.toLowerCase()) ||
                      item.keys.some((k) => k.toLowerCase().includes(shortcutFilter.toLowerCase()))
                    );

                    if (filteredItems.length === 0) return null;

                    return (
                      <div key={group.category} className="space-y-2 rounded-2xl border border-line bg-cream/50 p-3.5">
                        <div className="flex items-center justify-between text-ink font-extrabold text-xs">
                          <h4>{group.category}</h4>
                          <span className="text-[10px] text-muted font-normal">({filteredItems.length})</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {filteredItems.map((item) => (
                            <div
                              key={item.label}
                              className="flex items-center justify-between p-2 rounded-xl bg-white border border-line shadow-xs"
                            >
                              <span className="font-semibold text-slate-800 text-[11px]">{item.label}</span>
                              <div className="flex items-center gap-1 shrink-0">
                                {item.keys.map((key) => (
                                  <kbd
                                    key={key}
                                    className="px-2 py-0.5 rounded-lg border border-slate-300 bg-slate-100 font-mono text-[10px] font-extrabold text-slate-800 shadow-xs"
                                  >
                                    {key}
                                  </kbd>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Note */}
                <div className="flex items-center justify-between border-t border-line pt-3 text-[11px] text-muted shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span>Press <kbd className="px-1.5 py-0.5 rounded border border-slate-300 bg-slate-100 font-mono text-[10px] font-bold text-ink">?</kbd> anywhere to toggle this cheat-sheet</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShortcutsOpen(false)}
                    className="btn-primary !py-1.5 !px-4 text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EXPANDED RICH WHITEBOARD PREFERENCES SETTINGS MODAL */}
          {settingsOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm animate-in fade-in">
              <div className="w-full max-w-lg rounded-3xl border border-line bg-white p-6 shadow-2xl space-y-4">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-brand" />
                    <h3 className="font-display font-extrabold text-ink text-base">Whiteboard Preferences</h3>
                  </div>
                  <button onClick={() => setSettingsOpen(false)} className="rounded-lg p-1 text-muted hover:text-ink">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Preference Category Tabs */}
                <div className="flex items-center gap-1.5 rounded-2xl bg-cream p-1 border border-line">
                  <button
                    type="button"
                    onClick={() => setSettingsTab("general")}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
                      settingsTab === "general" ? "bg-brand text-white shadow-sm" : "text-ink hover:text-brand"
                    }`}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" /> General & UI
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsTab("canvas")}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
                      settingsTab === "canvas" ? "bg-brand text-white shadow-sm" : "text-ink hover:text-brand"
                    }`}
                  >
                    <Grid className="h-3.5 w-3.5" /> Canvas & Tools
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsTab("forex")}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
                      settingsTab === "forex" ? "bg-brand text-white shadow-sm" : "text-ink hover:text-brand"
                    }`}
                  >
                    <TrendingUp className="h-3.5 w-3.5" /> Forex & Risk
                  </button>
                </div>

                {/* TAB 1: GENERAL & UI PREFERENCES */}
                {settingsTab === "general" && (
                  <div className="space-y-3 text-xs max-h-[55vh] overflow-y-auto pr-1">
                    {/* Tooltip Explanation & GIF Demo Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-2xl border border-line bg-cream/50">
                      <div>
                        <label className="font-bold text-ink flex items-center gap-1.5">
                          <Info className="h-4 w-4 text-brand" /> Show Tooltips & GIF Demos
                        </label>
                        <p className="text-[10px] text-muted">Displays guide cards with GIF-style animations when hovering tools</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowTooltips(!showTooltips);
                          showToast(showTooltips ? "Disabled tool explanations" : "Enabled tool explanations");
                        }}
                        className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center ${
                          showTooltips ? "bg-brand justify-end" : "bg-slate-300 justify-start"
                        }`}
                      >
                        <span className="h-4 w-4 rounded-full bg-white shadow-md" />
                      </button>
                    </div>

                    {/* Show TradingView Floating Favorites Bar Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-2xl border border-line bg-cream/50">
                      <div>
                        <label className="font-bold text-ink flex items-center gap-1.5">
                          <Star className="h-4 w-4 text-amber-500" /> Show Floating Favorites Toolbar
                        </label>
                        <p className="text-[10px] text-muted">Displays the TradingView-style draggable floating favorites bar</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowFavoritesBar(!showFavoritesBar);
                          showToast(showFavoritesBar ? "Hidden favorites toolbar" : "Shown favorites toolbar");
                        }}
                        className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center ${
                          showFavoritesBar ? "bg-brand justify-end" : "bg-slate-300 justify-start"
                        }`}
                      >
                        <span className="h-4 w-4 rounded-full bg-white shadow-md" />
                      </button>
                    </div>

                    {/* Show Cursor Canvas Coordinates Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-2xl border border-line bg-cream/50">
                      <div>
                        <label className="font-bold text-ink flex items-center gap-1.5">
                          <Crosshair className="h-4 w-4 text-blue-600" /> Show Cursor Coordinates (X, Y)
                        </label>
                        <p className="text-[10px] text-muted">Displays live mouse position X & Y coordinates in the bottom status bar</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCursorCoords(!showCursorCoords);
                          showToast(showCursorCoords ? "Disabled cursor coordinates" : "Enabled cursor coordinates");
                        }}
                        className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center ${
                          showCursorCoords ? "bg-brand justify-end" : "bg-slate-300 justify-start"
                        }`}
                      >
                        <span className="h-4 w-4 rounded-full bg-white shadow-md" />
                      </button>
                    </div>

                    {/* Mouse Scroll Wheel Action */}
                    <div className="p-3 rounded-2xl border border-line bg-cream/50 space-y-1.5">
                      <label className="font-bold text-ink flex items-center gap-1.5">
                        <MousePointerClick className="h-4 w-4 text-brand" /> Mouse Wheel Action
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setMouseWheelMode("zoom")}
                          className={`py-2 rounded-xl text-xs font-bold transition ${
                            mouseWheelMode === "zoom" ? "bg-brand text-white" : "bg-white text-ink hover:bg-slate-200"
                          }`}
                        >
                          Zoom In / Out
                        </button>
                        <button
                          type="button"
                          onClick={() => setMouseWheelMode("pan")}
                          className={`py-2 rounded-xl text-xs font-bold transition ${
                            mouseWheelMode === "pan" ? "bg-brand text-white" : "bg-white text-ink hover:bg-slate-200"
                          }`}
                        >
                          Pan Canvas
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: CANVAS & DRAWING PREFERENCES */}
                {settingsTab === "canvas" && (
                  <div className="space-y-3 text-xs max-h-[55vh] overflow-y-auto pr-1">
                    {/* Default Canvas Grid Theme */}
                    <div className="p-3 rounded-2xl border border-line bg-cream/50 space-y-1">
                      <label className="font-bold text-ink block">Default Canvas Grid Theme</label>
                      <select
                        value={bgGrid}
                        onChange={(e) => handleSetBgGrid(e.target.value as any)}
                        className="w-full rounded-xl border border-line bg-white p-2.5 font-bold text-ink outline-none focus:border-brand"
                      >
                        {CANVAS_THEMES.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Snap to Grid Preference */}
                    <div className="p-3 rounded-2xl border border-line bg-cream/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-bold text-ink flex items-center gap-1.5">
                            <Grid className="h-4 w-4 text-emerald-600" /> Snap to Grid
                          </label>
                          <p className="text-[10px] text-muted">Automatically aligns shape coordinates to grid steps</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSnapToGrid(!snapToGrid);
                            showToast(snapToGrid ? "Disabled grid snapping" : "Enabled grid snapping");
                          }}
                          className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center ${
                            snapToGrid ? "bg-brand justify-end" : "bg-slate-300 justify-start"
                          }`}
                        >
                          <span className="h-4 w-4 rounded-full bg-white shadow-md" />
                        </button>
                      </div>

                      {snapToGrid && (
                        <div className="flex items-center justify-between pt-1 border-t border-line">
                          <span className="text-[11px] font-bold text-ink">Grid Step Increment</span>
                          <div className="flex gap-1">
                            {[5, 10, 20, 50].map((sz) => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => setGridSnapSize(sz)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition ${
                                  gridSnapSize === sz ? "bg-brand text-white" : "bg-white text-ink hover:bg-slate-200"
                                }`}
                              >
                                {sz}px
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Precision Eraser Tip Size */}
                    <div className="p-3 rounded-2xl border border-line bg-cream/50 space-y-1.5">
                      <label className="font-bold text-ink flex items-center justify-between">
                        <span>Precision Eraser Tip Size</span>
                        <strong className="text-brand">{eraserSize}px</strong>
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { size: 10, label: "Small" },
                          { size: 18, label: "Medium" },
                          { size: 28, label: "Large" },
                          { size: 45, label: "XL" },
                        ].map((item) => (
                          <button
                            key={item.size}
                            type="button"
                            onClick={() => setEraserSize(item.size)}
                            className={`py-1.5 rounded-xl text-xs font-bold transition ${
                              eraserSize === item.size ? "bg-brand text-white" : "bg-white text-ink hover:bg-slate-200"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Default Stroke Width */}
                    <div className="p-3 rounded-2xl border border-line bg-cream/50 space-y-1.5">
                      <label className="font-bold text-ink block">Default Line Stroke Width</label>
                      <div className="flex gap-2">
                        {[1, 2, 4, 6].map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setStrokeWidth(w)}
                            className={`flex-1 py-2 rounded-xl font-extrabold transition ${
                              strokeWidth === w ? "bg-brand text-white" : "bg-white text-ink hover:bg-slate-200"
                            }`}
                          >
                            {w}px
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: FOREX & RISK PREFERENCES */}
                {settingsTab === "forex" && (
                  <div className="space-y-3 text-xs max-h-[55vh] overflow-y-auto pr-1">
                    {/* Default Risk:Reward Ratio */}
                    <div className="p-3 rounded-2xl border border-line bg-cream/50 space-y-1.5">
                      <label className="font-bold text-ink flex items-center justify-between">
                        <span>Default Position Risk-to-Reward Ratio</span>
                        <strong className="text-brand">1:{defaultRiskReward}</strong>
                      </label>
                      <div className="grid grid-cols-5 gap-1">
                        {[1, 1.5, 2, 3, 5].map((rr) => (
                          <button
                            key={rr}
                            type="button"
                            onClick={() => {
                              setDefaultRiskReward(rr);
                              showToast(`Set default R:R ratio to 1:${rr}`);
                            }}
                            className={`py-2 rounded-xl text-xs font-extrabold transition ${
                              defaultRiskReward === rr ? "bg-brand text-white" : "bg-white text-ink hover:bg-slate-200"
                            }`}
                          >
                            1:{rr}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Default Sticky Note Color */}
                    <div className="p-3 rounded-2xl border border-line bg-cream/50 space-y-1.5">
                      <label className="font-bold text-ink block">Default Sticky Note Color</label>
                      <div className="flex items-center gap-2">
                        {STICKY_COLORS.map((s) => (
                          <button
                            key={s.color}
                            type="button"
                            onClick={() => setStickyColor(s.color)}
                            className={`flex-1 py-2.5 rounded-xl border border-black/10 transition-transform ${
                              stickyColor === s.color ? "scale-110 ring-2 ring-brand font-bold" : "hover:scale-105"
                            }`}
                            style={{ background: s.color }}
                            title={s.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Auto-Lock Created Objects Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-2xl border border-line bg-cream/50">
                      <div>
                        <label className="font-bold text-ink flex items-center gap-1.5">
                          <Lock className="h-4 w-4 text-amber-600" /> Auto-Lock Newly Drawn Objects
                        </label>
                        <p className="text-[10px] text-muted">Automatically locks shapes as soon as they are completed</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAutoLockObjects(!autoLockObjects);
                          showToast(autoLockObjects ? "Disabled auto-lock" : "Enabled auto-lock");
                        }}
                        className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center ${
                          autoLockObjects ? "bg-brand justify-end" : "bg-slate-300 justify-start"
                        }`}
                      >
                        <span className="h-4 w-4 rounded-full bg-white shadow-md" />
                      </button>
                    </div>

                    {/* Ultra High-DPI Export Resolution Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-2xl border border-line bg-cream/50">
                      <div>
                        <label className="font-bold text-ink flex items-center gap-1.5">
                          <Download className="h-4 w-4 text-brand" /> Ultra High-DPI Image Exports
                        </label>
                        <p className="text-[10px] text-muted">Exports PNG & JPEG image files in maximum crisp resolution</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setHighDpiExport(!highDpiExport);
                          showToast(highDpiExport ? "Standard resolution export" : "Ultra High-DPI export enabled");
                        }}
                        className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center ${
                          highDpiExport ? "bg-brand justify-end" : "bg-slate-300 justify-start"
                        }`}
                      >
                        <span className="h-4 w-4 rounded-full bg-white shadow-md" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2 border-t border-line">
                  <button onClick={() => setSettingsOpen(false)} className="btn-primary w-full !py-2.5 text-xs font-bold">
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Flexible In-Place / Inline Canvas Text Editor (Photoshop / Word / Figma Style with Flashing Beeper) */}
          {inlineEditor && (
            <div
              className="absolute z-50 pointer-events-auto"
              style={{
                left: inlineEditor.x * zoom + pan.x,
                top: inlineEditor.y * zoom + pan.y,
              }}
            >
              <div
                className={`relative rounded-lg p-1.5 transition-all ${
                  inlineEditor.isSticky
                    ? "shadow-xl border border-black/15"
                    : "border-2 border-dashed border-brand bg-white/95 shadow-2xl backdrop-blur-xs"
                }`}
                style={{
                  backgroundColor: inlineEditor.isSticky ? (stickyColor || "#fef08a") : undefined,
                  minWidth: inlineEditor.isSticky ? `${180 * zoom}px` : `${140 * zoom}px`,
                  minHeight: inlineEditor.isSticky ? `${120 * zoom}px` : `${38 * zoom}px`,
                }}
              >
                <textarea
                  autoFocus
                  value={inlineEditor.text}
                  onChange={(e) => setInlineEditor((prev) => (prev ? { ...prev, text: e.target.value } : null))}
                  onBlur={() => handleCommitInlineText()}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setInlineEditor(null);
                    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleCommitInlineText();
                    }
                  }}
                  placeholder={inlineEditor.isSticky ? "Type note here..." : "Type text here..."}
                  style={{
                    fontSize: `${(inlineEditor.fontSize || fontSize) * zoom}px`,
                    fontFamily: inlineEditor.fontFamily || fontFamily,
                    fontWeight: inlineEditor.fontWeight || fontWeight,
                    fontStyle: inlineEditor.fontStyle || fontStyle,
                    textDecoration: inlineEditor.textDecoration || textDecoration,
                    textAlign: inlineEditor.textAlign || textAlign,
                    textTransform: (inlineEditor.textTransform || textTransform) as any,
                    lineHeight: inlineEditor.lineHeight || lineHeight,
                    color: inlineEditor.color || strokeColor,
                  }}
                  className="w-full h-full bg-transparent outline-none resize-none border-none p-0 overflow-hidden font-sans caret-brand"
                  rows={Math.max(1, (inlineEditor.text.match(/\n/g) || []).length + 1)}
                />
                {/* Visual Beeper / Caret Status Helper */}
                <div className="absolute -top-6 left-0 flex items-center gap-1 bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-md pointer-events-none select-none whitespace-nowrap animate-in fade-in">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Esc to cancel • Click outside or Ctrl+Enter to save</span>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Right Inspector & Photoshop-Style Layers Panel (Spanning from Tab Area Top to Viewport Bottom) */}
        {isInspectorOpen && (
          <aside className="w-80 border-l border-line bg-white/95 backdrop-blur-md flex flex-col shadow-xl overflow-hidden animate-in slide-in-from-right duration-200 shrink-0 z-20">
          {/* FIXED UNMOVABLE Panel Header & Inspector / Layers Tab Switcher (h-10 matches Sub-Header Tabs Bar height) */}
          <div className="h-10 border-b border-line px-3.5 bg-white/95 backdrop-blur-md flex items-center justify-between shrink-0 z-10">
            <div className="flex items-center gap-1 rounded-xl bg-cream p-0.5 border border-line">
              <button
                type="button"
                onClick={() => setRightPanelTab("inspector")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                  rightPanelTab === "inspector" ? "bg-brand text-white shadow-xs" : "text-ink hover:text-brand"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" /> Inspector
              </button>
              <button
                type="button"
                onClick={() => setRightPanelTab("layers")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                  rightPanelTab === "layers" ? "bg-brand text-white shadow-xs" : "text-ink hover:text-brand"
                }`}
              >
                <Layers className="h-3.5 w-3.5" /> Layers ({shapes.length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsInspectorOpen(false)}
              className="rounded-lg p-1 text-muted hover:text-ink hover:bg-cream transition cursor-pointer"
              title="Collapse Panel"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          </div>

              {/* INDEPENDENTLY SCROLLABLE CONTENT BODY */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 [scrollbar-width:thin]">
                {/* TAB 1: FIGMA-STANDARD CONTEXTUAL INSPECTOR TAB */}
                {rightPanelTab === "inspector" && (() => {
                  const targetTool: Tool = selectedShape ? selectedShape.type : activeTool;
                  const pts = selectedShape?.points || [];
                  const minX = pts.length > 0 ? Math.round(Math.min(...pts.map((p) => p.x))) : 0;
                  const maxX = pts.length > 0 ? Math.round(Math.max(...pts.map((p) => p.x))) : 0;
                  const minY = pts.length > 0 ? Math.round(Math.min(...pts.map((p) => p.y))) : 0;
                  const maxY = pts.length > 0 ? Math.round(Math.max(...pts.map((p) => p.y))) : 0;
                  const calcW = Math.max(maxX - minX, selectedShape?.type === "sticky" ? 180 : selectedShape?.type === "text" ? 140 : 0);
                  const calcH = Math.max(maxY - minY, selectedShape?.type === "sticky" ? 140 : selectedShape?.type === "text" ? 24 : 0);
                  const IconComp = getToolIcon(targetTool);

                  return (
                    <div className="space-y-3.5 animate-in fade-in duration-150">
                      {/* 1. SELECTION / TOOL IDENTITY - JUST ICON AND TOOL NAME */}
                      <div className="rounded-xl border border-line bg-slate-50/90 px-3 py-2 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2.5 font-extrabold text-xs text-ink min-w-0 flex-1">
                          <span className="p-1 rounded-lg bg-white border border-line text-brand shadow-2xs shrink-0 flex items-center justify-center">
                            <IconComp className="h-3.5 w-3.5" />
                          </span>
                          <span className="font-extrabold text-xs text-ink truncate">
                            {selectedShape ? (selectedShape.name || selectedShape.type.toUpperCase()) : targetTool.toUpperCase()}
                          </span>
                        </div>
                        {selectedShape && (
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <button
                              type="button"
                              onClick={() => toggleLockShape(selectedShape.id)}
                              className={`p-1 rounded-lg border text-xs transition cursor-pointer ${
                                selectedShape.isLocked
                                  ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                                  : "bg-white text-slate-400 hover:text-ink border-line"
                              }`}
                              title={selectedShape.isLocked ? "Unlock Element" : "Lock Element"}
                            >
                              {selectedShape.isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 1. FIGMA-STYLE ALIGNMENT TOOLBAR (USING CRISP ICONS) */}
                      <div className="rounded-2xl border border-line bg-white p-2.5 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-muted px-1">
                          <span>Alignment</span>
                          <span className="text-[9px] text-muted font-medium">Position & Distribute</span>
                        </div>
                        <div className="grid grid-cols-8 gap-1">
                          <button
                            type="button"
                            onClick={() => handleAlignShapes("left")}
                            disabled={!selectedShape || selectedShape.isLocked}
                            className="p-1.5 rounded-xl border border-line bg-slate-50 hover:bg-brand-light hover:text-brand hover:border-brand/40 text-slate-700 transition flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Align Left"
                          >
                            <AlignLeftIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAlignShapes("centerH")}
                            disabled={!selectedShape || selectedShape.isLocked}
                            className="p-1.5 rounded-xl border border-line bg-slate-50 hover:bg-brand-light hover:text-brand hover:border-brand/40 text-slate-700 transition flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Align Horizontal Center"
                          >
                            <AlignCenterHIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAlignShapes("right")}
                            disabled={!selectedShape || selectedShape.isLocked}
                            className="p-1.5 rounded-xl border border-line bg-slate-50 hover:bg-brand-light hover:text-brand hover:border-brand/40 text-slate-700 transition flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Align Right"
                          >
                            <AlignRightIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAlignShapes("top")}
                            disabled={!selectedShape || selectedShape.isLocked}
                            className="p-1.5 rounded-xl border border-line bg-slate-50 hover:bg-brand-light hover:text-brand hover:border-brand/40 text-slate-700 transition flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Align Top"
                          >
                            <AlignTopIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAlignShapes("middleV")}
                            disabled={!selectedShape || selectedShape.isLocked}
                            className="p-1.5 rounded-xl border border-line bg-slate-50 hover:bg-brand-light hover:text-brand hover:border-brand/40 text-slate-700 transition flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Align Vertical Center"
                          >
                            <AlignMiddleVIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAlignShapes("bottom")}
                            disabled={!selectedShape || selectedShape.isLocked}
                            className="p-1.5 rounded-xl border border-line bg-slate-50 hover:bg-brand-light hover:text-brand hover:border-brand/40 text-slate-700 transition flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Align Bottom"
                          >
                            <AlignBottomIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAlignShapes("distributeH")}
                            disabled={!selectedShape || selectedShape.isLocked}
                            className="p-1.5 rounded-xl border border-line bg-slate-50 hover:bg-brand-light hover:text-brand hover:border-brand/40 text-slate-700 transition flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Distribute Horizontally"
                          >
                            <DistributeHIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAlignShapes("distributeV")}
                            disabled={!selectedShape || selectedShape.isLocked}
                            className="p-1.5 rounded-xl border border-line bg-slate-50 hover:bg-brand-light hover:text-brand hover:border-brand/40 text-slate-700 transition flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Distribute Vertically"
                          >
                            <DistributeVIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* 2. FIGMA TRANSFORM / BOUNDS (Fully editable dimensions and position from inspection panel) */}
                      {selectedShape && pts.length > 0 && (
                        <div className="rounded-2xl border border-line bg-white p-3 space-y-2.5 shadow-2xs">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-muted">
                            <span>Dimensions & Position</span>
                            <button
                              type="button"
                              onClick={() => setIsAspectLocked(!isAspectLocked)}
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-[9px] font-bold transition cursor-pointer ${
                                isAspectLocked
                                  ? "bg-brand text-white border-brand shadow-xs"
                                  : "bg-slate-50 text-muted border-line hover:text-ink hover:bg-white"
                              }`}
                              title={isAspectLocked ? "Aspect Ratio Locked (Proportional)" : "Aspect Ratio Unlocked (Free)"}
                            >
                              <Link2 className="h-2.5 w-2.5" />
                              <span>{isAspectLocked ? "Locked" : "Ratio"}</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {/* X Position */}
                            <div className="flex items-center rounded-xl border border-line bg-slate-50 focus-within:border-brand focus-within:bg-white px-2 py-1 transition">
                              <span className="text-[10px] font-black text-muted w-3.5 select-none">X</span>
                              <input
                                type="number"
                                value={minX}
                                disabled={selectedShape.isLocked}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  if (isNaN(val)) return;
                                  const dx = val - minX;
                                  setShapes((prev) =>
                                    prev.map((s) =>
                                      s.id === selectedShape.id && !s.isLocked
                                        ? { ...s, points: s.points.map((p) => ({ x: Math.round(p.x + dx), y: p.y })) }
                                        : s
                                    )
                                  );
                                }}
                                className="w-full bg-transparent font-mono font-bold text-xs text-ink outline-none text-right pr-1 disabled:opacity-50"
                              />
                              <span className="text-[10px] text-muted font-medium select-none">px</span>
                            </div>

                            {/* Y Position */}
                            <div className="flex items-center rounded-xl border border-line bg-slate-50 focus-within:border-brand focus-within:bg-white px-2 py-1 transition">
                              <span className="text-[10px] font-black text-muted w-3.5 select-none">Y</span>
                              <input
                                type="number"
                                value={minY}
                                disabled={selectedShape.isLocked}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  if (isNaN(val)) return;
                                  const dy = val - minY;
                                  setShapes((prev) =>
                                    prev.map((s) =>
                                      s.id === selectedShape.id && !s.isLocked
                                        ? { ...s, points: s.points.map((p) => ({ x: p.x, y: Math.round(p.y + dy) })) }
                                        : s
                                    )
                                  );
                                }}
                                className="w-full bg-transparent font-mono font-bold text-xs text-ink outline-none text-right pr-1 disabled:opacity-50"
                              />
                              <span className="text-[10px] text-muted font-medium select-none">px</span>
                            </div>

                            {/* W (Width) */}
                            <div className="flex items-center rounded-xl border border-line bg-slate-50 focus-within:border-brand focus-within:bg-white px-2 py-1 transition">
                              <span className="text-[10px] font-black text-muted w-3.5 select-none">W</span>
                              <input
                                type="number"
                                min={5}
                                value={calcW}
                                disabled={selectedShape.isLocked}
                                onChange={(e) => {
                                  const targetW = Math.max(5, parseInt(e.target.value, 10) || 5);
                                  const curW = Math.max(1, maxX - minX);
                                  const curH = Math.max(1, maxY - minY);
                                  const aspect = curW / curH;
                                  const targetH = isAspectLocked ? Math.round(targetW / aspect) : curH;

                                  setShapes((prev) =>
                                    prev.map((s) => {
                                      if (s.id !== selectedShape.id || s.isLocked) return s;
                                      const sPts = s.points;
                                      if (sPts.length === 2) {
                                        const signX = sPts[1].x >= sPts[0].x ? 1 : -1;
                                        const signY = sPts[1].y >= sPts[0].y ? 1 : -1;
                                        return {
                                          ...s,
                                          points: [
                                            sPts[0],
                                            {
                                              x: Math.round(sPts[0].x + signX * targetW),
                                              y: isAspectLocked ? Math.round(sPts[0].y + signY * targetH) : sPts[1].y,
                                            },
                                          ],
                                        };
                                      }
                                      if (sPts.length > 2) {
                                        const scaleX = targetW / curW;
                                        const scaleY = isAspectLocked ? targetH / curH : 1;
                                        return {
                                          ...s,
                                          points: sPts.map((p) => ({
                                            x: Math.round(minX + (p.x - minX) * scaleX),
                                            y: isAspectLocked ? Math.round(minY + (p.y - minY) * scaleY) : p.y,
                                          })),
                                        };
                                      }
                                      return s;
                                    })
                                  );
                                }}
                                className="w-full bg-transparent font-mono font-bold text-xs text-ink outline-none text-right pr-1 disabled:opacity-50"
                              />
                              <span className="text-[10px] text-muted font-medium select-none">px</span>
                            </div>

                            {/* H (Height) */}
                            <div className="flex items-center rounded-xl border border-line bg-slate-50 focus-within:border-brand focus-within:bg-white px-2 py-1 transition">
                              <span className="text-[10px] font-black text-muted w-3.5 select-none">H</span>
                              <input
                                type="number"
                                min={5}
                                value={calcH}
                                disabled={selectedShape.isLocked}
                                onChange={(e) => {
                                  const targetH = Math.max(5, parseInt(e.target.value, 10) || 5);
                                  const curW = Math.max(1, maxX - minX);
                                  const curH = Math.max(1, maxY - minY);
                                  const aspect = curW / curH;
                                  const targetW = isAspectLocked ? Math.round(targetH * aspect) : curW;

                                  setShapes((prev) =>
                                    prev.map((s) => {
                                      if (s.id !== selectedShape.id || s.isLocked) return s;
                                      const sPts = s.points;
                                      if (sPts.length === 2) {
                                        const signX = sPts[1].x >= sPts[0].x ? 1 : -1;
                                        const signY = sPts[1].y >= sPts[0].y ? 1 : -1;
                                        return {
                                          ...s,
                                          points: [
                                            sPts[0],
                                            {
                                              x: isAspectLocked ? Math.round(sPts[0].x + signX * targetW) : sPts[1].x,
                                              y: Math.round(sPts[0].y + signY * targetH),
                                            },
                                          ],
                                        };
                                      }
                                      if (sPts.length > 2) {
                                        const scaleY = targetH / curH;
                                        const scaleX = isAspectLocked ? targetW / curW : 1;
                                        return {
                                          ...s,
                                          points: sPts.map((p) => ({
                                            x: Math.round(minX + (p.x - minX) * scaleX),
                                            y: isAspectLocked ? Math.round(minY + (p.y - minY) * scaleY) : p.y,
                                          })),
                                        };
                                      }
                                      return s;
                                    })
                                  );
                                }}
                                className="w-full bg-transparent font-mono font-bold text-xs text-ink outline-none text-right pr-1 disabled:opacity-50"
                              />
                              <span className="text-[10px] text-muted font-medium select-none">px</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-muted px-1">
                            <span>Hold <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded font-bold text-[9px] text-ink">Shift</kbd> on canvas to scale evenly</span>
                          </div>
                        </div>
                      )}

                      {/* 3. FILL & COLOR SYSTEM (SOLID / GRADIENT / TRANSLUCENT / NONE WITH COLOR PICKER) */}
                      {(targetTool === "rectangle" || targetTool === "circle" || targetTool === "diamond" || targetTool === "orderblock" || targetTool === "fvg" || targetTool === "bullish_candle" || targetTool === "bearish_candle" || targetTool === "sticky") && (
                        <div className="rounded-2xl border border-line bg-white p-3 space-y-3 shadow-2xs">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-muted">
                            <span>Fill & Gradient</span>
                            <span className="text-[9px] font-bold text-brand uppercase">{selectedShape?.fillStyle || fillStyle}</span>
                          </div>

                          {/* Mode Switch: Solid / Gradient / Soft / None */}
                          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl">
                            {(["translucent", "solid", "gradient", "none"] as const).map((styleOpt) => (
                              <button
                                key={styleOpt}
                                type="button"
                                onClick={() => applyFillStyleToSelected(styleOpt)}
                                disabled={selectedShape?.isLocked}
                                className={`py-1 rounded-lg text-[10px] font-bold capitalize transition cursor-pointer ${
                                  (selectedShape?.fillStyle || fillStyle) === styleOpt
                                    ? "bg-white text-ink shadow-xs"
                                    : "text-muted hover:text-ink"
                                } ${selectedShape?.isLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                              >
                                {styleOpt === "translucent" ? "Soft" : styleOpt}
                              </button>
                            ))}
                          </div>

                          {/* Primary Fill Color */}
                          {(selectedShape?.fillStyle || fillStyle) !== "none" && (
                            <div>
                              <label className="text-[11px] font-bold text-ink block mb-1.5 flex items-center justify-between">
                                <span>{(selectedShape?.fillStyle || fillStyle) === "gradient" ? "Start Fill Color" : "Fill Color"}</span>
                                <span className="text-[9px] font-mono text-muted uppercase">{selectedShape?.fillColor || fillColor}</span>
                              </label>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {PALETTE.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => applyFillColorToSelected(c)}
                                    disabled={selectedShape?.isLocked}
                                    className={`h-6 w-6 rounded-full transition-transform border border-line ${
                                      (selectedShape?.fillColor || fillColor) === c ? "scale-125 ring-2 ring-brand" : "hover:scale-110"
                                    } ${selectedShape?.isLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                                    style={{ background: c }}
                                  />
                                ))}
                                <label
                                  className="h-6 w-6 rounded-full border border-line flex items-center justify-center cursor-pointer hover:scale-110 transition relative overflow-hidden shadow-2xs"
                                  title="Custom Hex Fill Color Picker"
                                >
                                  <input
                                    type="color"
                                    value={selectedShape?.fillColor || fillColor}
                                    onChange={(e) => applyFillColorToSelected(e.target.value)}
                                    disabled={selectedShape?.isLocked}
                                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                  />
                                  <span
                                    className="w-full h-full rounded-full border"
                                    style={{ background: selectedShape?.fillColor || fillColor }}
                                  />
                                </label>
                              </div>
                            </div>
                          )}

                          {/* Secondary Gradient End Color */}
                          {(selectedShape?.fillStyle || fillStyle) === "gradient" && (
                            <div className="pt-2 border-t border-line animate-in fade-in">
                              <label className="text-[11px] font-bold text-ink block mb-1.5 flex items-center justify-between">
                                <span>Gradient End Color</span>
                                <span className="text-[9px] font-mono text-muted uppercase">{selectedShape?.gradientEndColor || gradientEndColor}</span>
                              </label>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {PALETTE.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => applyGradientEndColorToSelected(c)}
                                    disabled={selectedShape?.isLocked}
                                    className={`h-6 w-6 rounded-full transition-transform border border-line ${
                                      (selectedShape?.gradientEndColor || gradientEndColor) === c ? "scale-125 ring-2 ring-brand" : "hover:scale-110"
                                    } ${selectedShape?.isLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                                    style={{ background: c }}
                                  />
                                ))}
                                <label
                                  className="h-6 w-6 rounded-full border border-line flex items-center justify-center cursor-pointer hover:scale-110 transition relative overflow-hidden shadow-2xs"
                                  title="Custom Hex Gradient End Color Picker"
                                >
                                  <input
                                    type="color"
                                    value={selectedShape?.gradientEndColor || gradientEndColor}
                                    onChange={(e) => applyGradientEndColorToSelected(e.target.value)}
                                    disabled={selectedShape?.isLocked}
                                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                  />
                                  <span
                                    className="w-full h-full rounded-full border"
                                    style={{ background: selectedShape?.gradientEndColor || gradientEndColor }}
                                  />
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 4. STROKE COLOR & THICKNESS & PATTERN */}
                      <div className="rounded-2xl border border-line bg-white p-3 space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-muted">
                          <span>Stroke & Outline</span>
                          <span className="text-[9px] font-mono text-muted uppercase">{selectedShape?.strokeColor || selectedShape?.color || strokeColor}</span>
                        </div>

                        {/* Stroke Palette + HTML5 Color Picker */}
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {PALETTE.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => applyColorToSelected(c)}
                                disabled={selectedShape?.isLocked}
                                className={`h-6 w-6 rounded-full transition-transform border border-line ${
                                  (selectedShape?.strokeColor || selectedShape?.color || strokeColor) === c ? "scale-125 ring-2 ring-brand" : "hover:scale-110"
                                } ${selectedShape?.isLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                                style={{ background: c }}
                              />
                            ))}
                            <label
                              className="h-6 w-6 rounded-full border border-line flex items-center justify-center cursor-pointer hover:scale-110 transition relative overflow-hidden shadow-2xs"
                              title="Custom Hex Stroke Color Picker"
                            >
                              <input
                                type="color"
                                value={selectedShape?.strokeColor || selectedShape?.color || strokeColor}
                                onChange={(e) => applyColorToSelected(e.target.value)}
                                disabled={selectedShape?.isLocked}
                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                              />
                              <span
                                className="w-full h-full rounded-full border"
                                style={{ background: selectedShape?.strokeColor || selectedShape?.color || strokeColor }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Stroke Width Buttons */}
                        <div>
                          <label className="text-[11px] font-bold text-ink flex items-center justify-between mb-1.5">
                            <span>Stroke Width</span>
                            <strong className="text-brand">{selectedShape?.strokeWidth || strokeWidth}px</strong>
                          </label>
                          <div className="grid grid-cols-5 gap-1">
                            {[1, 2, 3, 4, 6].map((w) => (
                              <button
                                key={w}
                                type="button"
                                onClick={() => {
                                  setStrokeWidth(w);
                                  if (selectedShapeIds.length > 0) {
                                    setShapes((prev) => prev.map((s) => (selectedShapeIds.includes(s.id) && !s.isLocked ? { ...s, strokeWidth: w } : s)));
                                  }
                                }}
                                disabled={selectedShape?.isLocked}
                                className={`py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                                  (selectedShape?.strokeWidth || strokeWidth) === w ? "bg-brand text-white" : "bg-slate-100 text-ink hover:bg-slate-200"
                                } ${selectedShape?.isLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                              >
                                {w}px
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Stroke Pattern (Solid / Dashed) */}
                        <div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setLineStyle("solid");
                                if (selectedShapeIds.length > 0) {
                                  setShapes((prev) => prev.map((s) => (selectedShapeIds.includes(s.id) && !s.isLocked ? { ...s, lineStyle: "solid" } : s)));
                                }
                              }}
                              disabled={selectedShape?.isLocked}
                              className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                                (selectedShape?.lineStyle || lineStyle) === "solid" ? "bg-ink text-white border-ink shadow-xs" : "bg-slate-50 text-slate-700 border-line hover:bg-white"
                              } ${selectedShape?.isLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                            >
                              Solid
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setLineStyle("dashed");
                                if (selectedShapeIds.length > 0) {
                                  setShapes((prev) => prev.map((s) => (selectedShapeIds.includes(s.id) && !s.isLocked ? { ...s, lineStyle: "dashed" } : s)));
                                }
                              }}
                              disabled={selectedShape?.isLocked}
                              className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                                (selectedShape?.lineStyle || lineStyle) === "dashed" ? "bg-ink text-white border-ink shadow-xs" : "bg-slate-50 text-slate-700 border-line hover:bg-white"
                              } ${selectedShape?.isLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                            >
                              Dashed
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 5. APPEARANCE (OPACITY & CORNER RADIUS) */}
                      <div className="rounded-2xl border border-line bg-white p-3 space-y-3 shadow-2xs">
                        <p className="text-[10px] font-black uppercase tracking-wider text-muted">Appearance</p>

                        {/* Opacity Slider */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-bold text-ink mb-1.5">
                            <span>Layer Opacity</span>
                            <span className="font-mono text-brand">{Math.round((selectedShape?.opacity !== undefined ? selectedShape.opacity : opacity) * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min={5}
                            max={100}
                            step={5}
                            value={Math.round((selectedShape?.opacity !== undefined ? selectedShape.opacity : opacity) * 100)}
                            onChange={(e) => applyOpacityToSelected(parseInt(e.target.value, 10) / 100)}
                            disabled={selectedShape?.isLocked}
                            className="w-full accent-brand cursor-pointer disabled:opacity-50"
                          />
                        </div>

                        {/* Corner Radius (for shapes with corners) */}
                        {(targetTool === "rectangle" || targetTool === "orderblock" || targetTool === "fvg" || targetTool === "sticky") && (
                          <div className="pt-2 border-t border-line">
                            <div className="flex items-center justify-between text-[11px] font-bold text-ink mb-1.5">
                              <span>Corner Radius</span>
                              <span className="font-mono text-brand">{selectedShape?.cornerRadius ?? cornerRadius}px</span>
                            </div>
                            <div className="grid grid-cols-5 gap-1">
                              {[0, 4, 8, 16, 24].map((rad) => (
                                <button
                                  key={rad}
                                  type="button"
                                  onClick={() => applyCornerRadiusToSelected(rad)}
                                  disabled={selectedShape?.isLocked}
                                  className={`py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                                    (selectedShape?.cornerRadius ?? cornerRadius) === rad
                                      ? "bg-brand text-white"
                                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                  } ${selectedShape?.isLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                                >
                                  {rad}px
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 6. BULLISH & BEARISH CANDLESTICK WICK ADJUSTMENT & STYLING */}
                      {(targetTool === "bullish_candle" || targetTool === "bearish_candle") && (
                        <div className="rounded-2xl border border-line bg-white p-3 space-y-3 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-wider text-muted">
                              {targetTool === "bullish_candle" ? "Bullish Candle Setup" : "Bearish Candle Setup"}
                            </p>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              targetTool === "bullish_candle" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}>
                              {targetTool === "bullish_candle" ? "Bullish" : "Bearish"}
                            </span>
                          </div>

                          {/* Upper Wick Length */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-bold text-ink">
                              <span>Upper Wick Length</span>
                              <span className="font-mono text-brand">{selectedShape?.upperWickLength ?? upperWickLength}px</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={80}
                              step={2}
                              value={selectedShape?.upperWickLength ?? upperWickLength}
                              onChange={(e) => applyUpperWickLengthToSelected(parseInt(e.target.value, 10))}
                              disabled={selectedShape?.isLocked}
                              className="w-full accent-brand cursor-pointer disabled:opacity-50"
                            />
                            <div className="grid grid-cols-4 gap-1">
                              {[
                                { label: "None", val: 0 },
                                { label: "Short", val: 12 },
                                { label: "Normal", val: 25 },
                                { label: "Rejection", val: 55 },
                              ].map((preset) => (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => applyUpperWickLengthToSelected(preset.val)}
                                  disabled={selectedShape?.isLocked}
                                  className={`py-1 rounded-lg text-[9px] font-bold transition cursor-pointer ${
                                    (selectedShape?.upperWickLength ?? upperWickLength) === preset.val
                                      ? "bg-brand text-white"
                                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                  } ${selectedShape?.isLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Lower Wick Length */}
                          <div className="space-y-1.5 pt-2 border-t border-line">
                            <div className="flex items-center justify-between text-[11px] font-bold text-ink">
                              <span>Lower Wick Length</span>
                              <span className="font-mono text-brand">{selectedShape?.lowerWickLength ?? lowerWickLength}px</span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={80}
                              step={2}
                              value={selectedShape?.lowerWickLength ?? lowerWickLength}
                              onChange={(e) => applyLowerWickLengthToSelected(parseInt(e.target.value, 10))}
                              disabled={selectedShape?.isLocked}
                              className="w-full accent-brand cursor-pointer disabled:opacity-50"
                            />
                            <div className="grid grid-cols-4 gap-1">
                              {[
                                { label: "None", val: 0 },
                                { label: "Short", val: 12 },
                                { label: "Normal", val: 25 },
                                { label: "Rejection", val: 55 },
                              ].map((preset) => (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => applyLowerWickLengthToSelected(preset.val)}
                                  disabled={selectedShape?.isLocked}
                                  className={`py-1 rounded-lg text-[9px] font-bold transition cursor-pointer ${
                                    (selectedShape?.lowerWickLength ?? lowerWickLength) === preset.val
                                      ? "bg-brand text-white"
                                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                  } ${selectedShape?.isLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Independent Wick Color */}
                          <div className="pt-2 border-t border-line">
                            <label className="text-[11px] font-bold text-ink block mb-1.5 flex items-center justify-between">
                              <span>Wick Color</span>
                              <span className="text-[9px] font-mono text-muted uppercase">{selectedShape?.wickColor || wickColor}</span>
                            </label>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {PALETTE.map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => applyWickColorToSelected(c)}
                                  disabled={selectedShape?.isLocked}
                                  className={`h-6 w-6 rounded-full transition-transform border border-line ${
                                    (selectedShape?.wickColor || wickColor) === c ? "scale-125 ring-2 ring-brand" : "hover:scale-110"
                                  } ${selectedShape?.isLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                                  style={{ background: c }}
                                />
                              ))}
                              <label
                                className="h-6 w-6 rounded-full border border-line flex items-center justify-center cursor-pointer hover:scale-110 transition relative overflow-hidden shadow-2xs"
                                title="Custom Hex Wick Color"
                              >
                                <input
                                  type="color"
                                  value={selectedShape?.wickColor || wickColor}
                                  onChange={(e) => applyWickColorToSelected(e.target.value)}
                                  disabled={selectedShape?.isLocked}
                                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                />
                                <span
                                  className="w-full h-full rounded-full border"
                                  style={{ background: selectedShape?.wickColor || wickColor }}
                                />
                              </label>
                            </div>
                          </div>

                          {/* Micro Label / Pattern Tag */}
                          {selectedShape && (
                            <div className="pt-2 border-t border-line">
                              <label className="text-[11px] font-bold text-ink block mb-1.5 flex items-center justify-between">
                                <span>Pattern Micro Label</span>
                                <span className="text-[9px] text-muted font-normal">Optional Tag</span>
                              </label>
                              <input
                                type="text"
                                value={selectedShape.text ?? ""}
                                placeholder={targetTool === "bullish_candle" ? "e.g. Bullish Engulfing, Hammer..." : "e.g. Bearish Engulfing, Shooting Star..."}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setShapes((prev) =>
                                    prev.map((s) => (s.id === selectedShape.id ? { ...s, text: val } : s))
                                  );
                                }}
                                disabled={selectedShape.isLocked}
                                className="w-full rounded-xl border border-line bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-ink outline-none focus:border-brand focus:bg-white transition"
                              />
                            </div>
                          )}

                          <div className={`p-2.5 rounded-xl text-xs font-medium space-y-1 ${
                            targetTool === "bullish_candle" ? "bg-emerald-50 text-emerald-900 border border-emerald-200" : "bg-rose-50 text-rose-900 border border-rose-200"
                          }`}>
                            <div className="flex items-center justify-between font-bold">
                              <span>{targetTool === "bullish_candle" ? "Bullish Candlestick" : "Bearish Candlestick"}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                targetTool === "bullish_candle" ? "bg-emerald-200 text-emerald-800" : "bg-rose-200 text-rose-800"
                              }`}>
                                {targetTool === "bullish_candle" ? "Close > Open" : "Close < Open"}
                              </span>
                            </div>
                            <p className={`text-[11px] ${targetTool === "bullish_candle" ? "text-emerald-700" : "text-rose-700"}`}>
                              Independent wick length adjusters with clean edge alignment.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 7. CONTEXT-SPECIFIC TECHNICAL FOREX TOOL CARDS */}

                      {/* (A) CHARACTER & TYPOGRAPHY PANEL (PHOTOSHOP / FIGMA / WORD STYLE) */}
                      {(targetTool === "text" || (selectedShape && (selectedShape.type === "text" || selectedShape.type === "sticky" || selectedShape.type === "annotation"))) && (
                        <div className="rounded-2xl border border-line bg-white p-3 space-y-3 shadow-2xs animate-in fade-in">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-muted">
                            <span className="flex items-center gap-1.5">
                              <Type className="h-3.5 w-3.5 text-brand" /> Character & Typography
                            </span>
                            <span className="text-[9px] font-mono text-muted uppercase">
                              {(selectedShape?.fontFamily || fontFamily).split(",")[0].replace(/'/g, "")}
                            </span>
                          </div>

                          {/* Font Family Selector */}
                          <div>
                            <label className="text-[10.5px] font-bold text-ink block mb-1">Font Family</label>
                            <select
                              value={selectedShape?.fontFamily || fontFamily}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFontFamily(val);
                                if (selectedShape && !selectedShape.isLocked) {
                                  setShapes((prev) =>
                                    prev.map((s) => (s.id === selectedShape.id ? { ...s, fontFamily: val } : s))
                                  );
                                }
                              }}
                              disabled={selectedShape?.isLocked}
                              className="w-full rounded-xl border border-line bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-ink outline-none focus:border-brand focus:bg-white transition cursor-pointer"
                            >
                              <option value="Inter, -apple-system, sans-serif">Inter (Modern Sans)</option>
                              <option value="'Roboto', sans-serif">Roboto (Clean Sans)</option>
                              <option value="'Playfair Display', Georgia, serif">Playfair Display (Editorial Serif)</option>
                              <option value="'Merriweather', Georgia, serif">Merriweather (Classic Serif)</option>
                              <option value="'JetBrains Mono', 'Courier New', monospace">JetBrains Mono (Technical / Code)</option>
                              <option value="'Caveat', cursive, sans-serif">Caveat (Handwriting / Sketch)</option>
                              <option value="'Impact', 'Oswald', sans-serif">Impact / Oswald (Display Bold)</option>
                            </select>
                          </div>

                          {/* Font Size & Line Height Stepper Grid */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {/* Font Size */}
                            <div>
                              <label className="text-[10.5px] font-bold text-ink block mb-1">Size (px)</label>
                              <div className="flex items-center rounded-xl border border-line bg-slate-50 focus-within:border-brand focus-within:bg-white px-2 py-1 transition">
                                <span className="text-[10px] font-black text-muted w-3.5 select-none">T</span>
                                <input
                                  type="number"
                                  min={8}
                                  max={120}
                                  value={selectedShape?.fontSize || fontSize}
                                  disabled={selectedShape?.isLocked}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10) || 16;
                                    setFontSize(val);
                                    if (selectedShape && !selectedShape.isLocked) {
                                      setShapes((prev) =>
                                        prev.map((s) => (s.id === selectedShape.id ? { ...s, fontSize: val } : s))
                                      );
                                    }
                                  }}
                                  className="w-full bg-transparent font-mono font-bold text-xs text-ink outline-none text-right pr-1"
                                />
                                <span className="text-[10px] text-muted font-medium select-none">px</span>
                              </div>
                            </div>

                            {/* Line Height / Leading */}
                            <div>
                              <label className="text-[10.5px] font-bold text-ink block mb-1">Line Height</label>
                              <div className="flex items-center rounded-xl border border-line bg-slate-50 focus-within:border-brand focus-within:bg-white px-2 py-1 transition">
                                <span className="text-[10px] font-black text-muted w-3.5 select-none">↕</span>
                                <input
                                  type="number"
                                  step="0.1"
                                  min={0.8}
                                  max={3.0}
                                  value={selectedShape?.lineHeight || lineHeight}
                                  disabled={selectedShape?.isLocked}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 1.3;
                                    setLineHeight(val);
                                    if (selectedShape && !selectedShape.isLocked) {
                                      setShapes((prev) =>
                                        prev.map((s) => (s.id === selectedShape.id ? { ...s, lineHeight: val } : s))
                                      );
                                    }
                                  }}
                                  className="w-full bg-transparent font-mono font-bold text-xs text-ink outline-none text-right pr-1"
                                />
                                <span className="text-[10px] text-muted font-medium select-none">em</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Size Presets */}
                          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none]">
                            {[12, 14, 16, 18, 24, 32, 48].map((sz) => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => {
                                  setFontSize(sz);
                                  if (selectedShape && !selectedShape.isLocked) {
                                    setShapes((prev) =>
                                      prev.map((s) => (s.id === selectedShape.id ? { ...s, fontSize: sz } : s))
                                    );
                                  }
                                }}
                                disabled={selectedShape?.isLocked}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer shrink-0 ${
                                  (selectedShape?.fontSize || fontSize) === sz
                                    ? "bg-brand text-white border-brand shadow-xs"
                                    : "bg-slate-50 text-slate-700 border-line hover:bg-slate-100"
                                }`}
                              >
                                {sz}
                              </button>
                            ))}
                          </div>

                          {/* Character Styles Toolbar (Bold, Italic, Underline, Strike, Alignments, Transforms) */}
                          <div className="pt-2 border-t border-line space-y-2">
                            <label className="text-[10.5px] font-bold text-ink block">Formatting & Alignment</label>
                            <div className="grid grid-cols-7 gap-1">
                              {/* Bold */}
                              <button
                                type="button"
                                onClick={() => {
                                  const nextWeight = (selectedShape?.fontWeight || fontWeight) === "bold" ? "normal" : "bold";
                                  setFontWeight(nextWeight);
                                  if (selectedShape && !selectedShape.isLocked) {
                                    setShapes((prev) =>
                                      prev.map((s) => (s.id === selectedShape.id ? { ...s, fontWeight: nextWeight } : s))
                                    );
                                  }
                                }}
                                disabled={selectedShape?.isLocked}
                                className={`p-1.5 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                                  (selectedShape?.fontWeight || fontWeight) === "bold"
                                    ? "bg-brand text-white border-brand shadow-xs"
                                    : "bg-slate-50 border-line text-slate-700 hover:bg-slate-100"
                                }`}
                                title="Bold (B)"
                              >
                                <Bold className="h-3.5 w-3.5" />
                              </button>

                              {/* Italic */}
                              <button
                                type="button"
                                onClick={() => {
                                  const nextStyle = (selectedShape?.fontStyle || fontStyle) === "italic" ? "normal" : "italic";
                                  setFontStyle(nextStyle);
                                  if (selectedShape && !selectedShape.isLocked) {
                                    setShapes((prev) =>
                                      prev.map((s) => (s.id === selectedShape.id ? { ...s, fontStyle: nextStyle } : s))
                                    );
                                  }
                                }}
                                disabled={selectedShape?.isLocked}
                                className={`p-1.5 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                                  (selectedShape?.fontStyle || fontStyle) === "italic"
                                    ? "bg-brand text-white border-brand shadow-xs"
                                    : "bg-slate-50 border-line text-slate-700 hover:bg-slate-100"
                                }`}
                                title="Italic (I)"
                              >
                                <Italic className="h-3.5 w-3.5" />
                              </button>

                              {/* Underline */}
                              <button
                                type="button"
                                onClick={() => {
                                  const nextDec = (selectedShape?.textDecoration || textDecoration) === "underline" ? "none" : "underline";
                                  setTextDecoration(nextDec);
                                  if (selectedShape && !selectedShape.isLocked) {
                                    setShapes((prev) =>
                                      prev.map((s) => (s.id === selectedShape.id ? { ...s, textDecoration: nextDec } : s))
                                    );
                                  }
                                }}
                                disabled={selectedShape?.isLocked}
                                className={`p-1.5 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                                  (selectedShape?.textDecoration || textDecoration) === "underline"
                                    ? "bg-brand text-white border-brand shadow-xs"
                                    : "bg-slate-50 border-line text-slate-700 hover:bg-slate-100"
                                }`}
                                title="Underline (U)"
                              >
                                <Underline className="h-3.5 w-3.5" />
                              </button>

                              {/* Strikethrough */}
                              <button
                                type="button"
                                onClick={() => {
                                  const nextDec = (selectedShape?.textDecoration || textDecoration) === "line-through" ? "none" : "line-through";
                                  setTextDecoration(nextDec);
                                  if (selectedShape && !selectedShape.isLocked) {
                                    setShapes((prev) =>
                                      prev.map((s) => (s.id === selectedShape.id ? { ...s, textDecoration: nextDec } : s))
                                    );
                                  }
                                }}
                                disabled={selectedShape?.isLocked}
                                className={`p-1.5 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                                  (selectedShape?.textDecoration || textDecoration) === "line-through"
                                    ? "bg-brand text-white border-brand shadow-xs"
                                    : "bg-slate-50 border-line text-slate-700 hover:bg-slate-100"
                                }`}
                                title="Strikethrough"
                              >
                                <Strikethrough className="h-3.5 w-3.5" />
                              </button>

                              {/* Align Left */}
                              <button
                                type="button"
                                onClick={() => {
                                  setTextAlign("left");
                                  if (selectedShape && !selectedShape.isLocked) {
                                    setShapes((prev) =>
                                      prev.map((s) => (s.id === selectedShape.id ? { ...s, textAlign: "left" } : s))
                                    );
                                  }
                                }}
                                disabled={selectedShape?.isLocked}
                                className={`p-1.5 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                                  (selectedShape?.textAlign || textAlign) === "left"
                                    ? "bg-brand text-white border-brand shadow-xs"
                                    : "bg-slate-50 border-line text-slate-700 hover:bg-slate-100"
                                }`}
                                title="Align Left"
                              >
                                <AlignLeft className="h-3.5 w-3.5" />
                              </button>

                              {/* Align Center */}
                              <button
                                type="button"
                                onClick={() => {
                                  setTextAlign("center");
                                  if (selectedShape && !selectedShape.isLocked) {
                                    setShapes((prev) =>
                                      prev.map((s) => (s.id === selectedShape.id ? { ...s, textAlign: "center" } : s))
                                    );
                                  }
                                }}
                                disabled={selectedShape?.isLocked}
                                className={`p-1.5 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                                  (selectedShape?.textAlign || textAlign) === "center"
                                    ? "bg-brand text-white border-brand shadow-xs"
                                    : "bg-slate-50 border-line text-slate-700 hover:bg-slate-100"
                                }`}
                                title="Align Center"
                              >
                                <AlignCenter className="h-3.5 w-3.5" />
                              </button>

                              {/* Align Right */}
                              <button
                                type="button"
                                onClick={() => {
                                  setTextAlign("right");
                                  if (selectedShape && !selectedShape.isLocked) {
                                    setShapes((prev) =>
                                      prev.map((s) => (s.id === selectedShape.id ? { ...s, textAlign: "right" } : s))
                                    );
                                  }
                                }}
                                disabled={selectedShape?.isLocked}
                                className={`p-1.5 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                                  (selectedShape?.textAlign || textAlign) === "right"
                                    ? "bg-brand text-white border-brand shadow-xs"
                                    : "bg-slate-50 border-line text-slate-700 hover:bg-slate-100"
                                }`}
                                title="Align Right"
                              >
                                <AlignRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Direct Content Input & Instructions */}
                          {selectedShape ? (
                            <div className="pt-2 border-t border-line">
                              <label className="text-[10.5px] font-bold text-ink block mb-1">Live Text Content</label>
                              <textarea
                                rows={2}
                                value={selectedShape.text ?? ""}
                                onChange={(e) => {
                                  const newTxt = e.target.value;
                                  if (selectedShape && !selectedShape.isLocked) {
                                    setShapes((prev) =>
                                      prev.map((s) => (s.id === selectedShape.id ? { ...s, text: newTxt } : s))
                                    );
                                  }
                                }}
                                disabled={selectedShape.isLocked}
                                placeholder="Type text or double click on canvas..."
                                className="w-full rounded-xl border border-line bg-slate-50 p-2 text-xs font-bold text-ink outline-none focus:border-brand focus:bg-white resize-none transition"
                              />
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-muted">
                              💡 Click on canvas with the Text tool or double click any existing text to type live with the beeper!
                            </div>
                          )}
                        </div>
                      )}

                      {/* (B) ANNOTATION LEADER PIN */}
                      {targetTool === "annotation" && (
                        <div className="rounded-2xl border border-line bg-white p-3 space-y-3 shadow-2xs">
                          <p className="text-[10px] font-black uppercase tracking-wider text-muted">Annotation Leader Pin</p>

                          {selectedShape ? (
                            <div>
                              <label className="text-[11px] font-bold text-ink block mb-1.5">Callout Badge Label</label>
                              <input
                                type="text"
                                value={selectedShape.text || ""}
                                onChange={(e) => {
                                  const newTxt = e.target.value;
                                  setShapes((prev) =>
                                    prev.map((s) => (s.id === selectedShape.id && !s.isLocked ? { ...s, text: newTxt } : s))
                                  );
                                }}
                                disabled={selectedShape.isLocked}
                                placeholder="e.g. Key POI, Rejection Wick..."
                                className={`w-full rounded-xl border border-line bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-ink outline-none focus:border-brand focus:bg-white transition ${
                                  selectedShape.isLocked ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                              />
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-muted">
                              Drag on chart to point a leader line to an object.
                            </div>
                          )}
                        </div>
                      )}

                      {/* (C) STICKY NOTES */}
                      {targetTool === "sticky" && (
                        <div className="rounded-2xl border border-line bg-white p-3 space-y-3 shadow-2xs">
                          <p className="text-[10px] font-black uppercase tracking-wider text-muted">Sticky Note Content & Color</p>

                          {selectedShape ? (
                            <div>
                              <label className="text-[11px] font-bold text-ink block mb-1.5">Note Content</label>
                              <textarea
                                rows={3}
                                value={selectedShape.text || ""}
                                onChange={(e) => {
                                  const newTxt = e.target.value;
                                  setShapes((prev) =>
                                    prev.map((s) => (s.id === selectedShape.id && !s.isLocked ? { ...s, text: newTxt } : s))
                                  );
                                }}
                                disabled={selectedShape.isLocked}
                                placeholder="Type note content..."
                                className={`w-full rounded-xl border border-line bg-cream/30 p-2 text-xs text-ink outline-none focus:border-brand resize-none font-medium ${
                                  selectedShape.isLocked ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                              />
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-cream/60 text-xs text-muted">
                              Click on canvas to drop a sticky note card.
                            </div>
                          )}

                          {/* Sticky Paper Color Swatches */}
                          <div>
                            <label className="text-[11px] font-bold text-ink block mb-1.5">Paper Color</label>
                            <div className="flex items-center gap-2">
                              {STICKY_COLORS.map((s) => (
                                <button
                                  key={s.color}
                                  type="button"
                                  onClick={() => applyStickyColorToSelected(s.color)}
                                  disabled={selectedShape?.isLocked}
                                  className={`h-7 w-7 rounded-xl transition-transform border border-black/10 shadow-2xs ${
                                    stickyColor === s.color ? "scale-125 ring-2 ring-brand" : "hover:scale-110"
                                  } ${selectedShape?.isLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                                  style={{ background: s.color }}
                                  title={s.name}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* (D) FIBONACCI RETRACEMENT */}
                      {targetTool === "fibo" && (
                        <div className="rounded-2xl border border-line bg-white p-3 space-y-3 shadow-2xs">
                          <p className="text-[10px] font-black uppercase tracking-wider text-muted">Fibonacci Retracement Levels</p>
                          <div className="space-y-1.5 text-xs font-mono">
                            <div className="flex items-center justify-between py-0.5 px-2 rounded-lg bg-red-50 text-red-700 font-bold">
                              <span>0.0% (1.000)</span> <span>Invalidation</span>
                            </div>
                            <div className="flex items-center justify-between py-0.5 px-2 rounded-lg bg-amber-50 text-amber-700 font-bold">
                              <span>38.2% (0.382)</span> <span>Shallow Pullback</span>
                            </div>
                            <div className="flex items-center justify-between py-0.5 px-2 rounded-lg bg-yellow-50 text-yellow-800 font-bold border border-yellow-300">
                              <span>50.0% Equilibrium</span> <span>Fair Value</span>
                            </div>
                            <div className="flex items-center justify-between py-0.5 px-2 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-300">
                              <span>61.8% Golden Pocket</span> <span>Prime Entry ★</span>
                            </div>
                            <div className="flex items-center justify-between py-0.5 px-2 rounded-lg bg-blue-50 text-blue-700 font-bold">
                              <span>78.6% (0.786)</span> <span>Deep Retracement</span>
                            </div>
                            <div className="flex items-center justify-between py-0.5 px-2 rounded-lg bg-purple-50 text-purple-700 font-bold">
                              <span>100.0% (0.000)</span> <span>Swing Anchor</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* (E) LONG / SHORT POSITION */}
                      {(targetTool === "long" || targetTool === "short") && (
                        <div className="rounded-2xl border border-line bg-white p-3 space-y-3 shadow-2xs">
                          <p className="text-[10px] font-black uppercase tracking-wider text-muted">
                            {targetTool === "long" ? "Long Position (Bullish)" : "Short Position (Bearish)"}
                          </p>

                          <div>
                            <label className="text-[11px] font-bold text-ink flex items-center justify-between mb-1.5">
                              <span>Risk : Reward Ratio</span>
                              <strong className="text-emerald-600 font-black">1 : {defaultRiskReward}</strong>
                            </label>
                            <div className="grid grid-cols-4 gap-1.5">
                              {[1, 2, 3, 4].map((rr) => (
                                <button
                                  key={rr}
                                  type="button"
                                  onClick={() => setDefaultRiskReward(rr)}
                                  className={`py-1 rounded-lg text-xs font-extrabold transition ${
                                    defaultRiskReward === rr ? "bg-emerald-600 text-white" : "bg-cream text-ink hover:bg-slate-200"
                                  }`}
                                >
                                  1:{rr}
                                </button>
                              ))}
                            </div>
                          </div>

                          {selectedShape && (
                            <div>
                              <label className="text-[11px] font-bold text-ink block mb-1.5 flex items-center justify-between">
                                <span>Micro Label</span>
                                <span className="text-[9px] text-muted font-normal">TradingView Tag</span>
                              </label>
                              <input
                                type="text"
                                value={selectedShape.text ?? `1:${defaultRiskReward.toFixed(1)}`}
                                placeholder="e.g. 1:3.0, TP 1..."
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setShapes((prev) =>
                                    prev.map((s) => (s.id === selectedShape.id ? { ...s, text: val } : s))
                                  );
                                }}
                                disabled={selectedShape.isLocked}
                                className="w-full rounded-xl border border-line bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-ink outline-none focus:border-brand focus:bg-white transition"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* (F) ORDER BLOCK & FVG MICRO LABELS */}
                      {(targetTool === "orderblock" || targetTool === "fvg" || targetTool === "bos" || targetTool === "liquidity") && selectedShape && (
                        <div className="rounded-2xl border border-line bg-white p-3 space-y-2 shadow-2xs">
                          <label className="text-[11px] font-bold text-ink block flex items-center justify-between">
                            <span>TradingView Micro Tag</span>
                            <span className="text-[9px] text-muted font-mono">{targetTool.toUpperCase()}</span>
                          </label>
                          <input
                            type="text"
                            value={selectedShape.text ?? targetTool.toUpperCase()}
                            placeholder="e.g. H4 OB, M15 FVG, BOS..."
                            onChange={(e) => {
                              const val = e.target.value;
                              setShapes((prev) =>
                                prev.map((s) => (s.id === selectedShape.id ? { ...s, text: val } : s))
                              );
                            }}
                            disabled={selectedShape.isLocked}
                            className="w-full rounded-xl border border-line bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-ink outline-none focus:border-brand focus:bg-white transition"
                          />
                        </div>
                      )}

                      {/* (H) CANVAS / ENVIRONMENT (When no shape is selected and navigation tool active) */}
                      {!selectedShape && (targetTool === "select" || targetTool === "hand" || targetTool === "zoom" || targetTool === "eraser") && (
                        <div className="rounded-2xl border border-line bg-white p-3 space-y-3 shadow-2xs">
                          <p className="text-[10px] font-black uppercase tracking-wider text-muted">Canvas Environment</p>
                          
                          <div>
                            <label className="text-[11px] font-bold text-ink block mb-1.5">Grid Background</label>
                            <select
                              value={bgGrid}
                              onChange={(e) => handleSetBgGrid(e.target.value as any)}
                              className="w-full rounded-xl border border-line bg-white p-2 text-xs font-bold text-ink outline-none focus:border-brand"
                            >
                              {CANVAS_THEMES.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center justify-between text-xs font-medium pt-1">
                            <span className="text-muted">Snap to Grid</span>
                            <button
                              type="button"
                              onClick={() => setSnapToGrid(!snapToGrid)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                snapToGrid ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {snapToGrid ? "Enabled" : "Disabled"}
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs font-medium pt-1">
                            <span className="text-muted">Zoom: {Math.round(zoom * 100)}%</span>
                            <button
                              type="button"
                              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                              className="px-2 py-0.5 rounded-lg border border-line bg-cream text-xs font-bold text-ink hover:bg-white"
                            >
                              Reset 100%
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 4. FIGMA OBJECT ACTIONS & LAYERING (Only when a shape is selected) */}
                      {selectedShape && (
                        <div className="rounded-2xl border border-line bg-white p-3 space-y-2 shadow-2xs">
                          <p className="text-[10px] font-black uppercase tracking-wider text-muted">Object Layer & Actions</p>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => bringToFront(selectedShape.id)}
                              disabled={selectedShape.isLocked}
                              className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-cream py-1.5 text-xs font-bold text-ink hover:bg-white transition disabled:opacity-40 cursor-pointer"
                            >
                              <ArrowUp className="h-3.5 w-3.5 text-emerald-600" /> Bring Front
                            </button>
                            <button
                              type="button"
                              onClick={() => sendToBack(selectedShape.id)}
                              disabled={selectedShape.isLocked}
                              className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-cream py-1.5 text-xs font-bold text-ink hover:bg-white transition disabled:opacity-40 cursor-pointer"
                            >
                              <ArrowDown className="h-3.5 w-3.5 text-amber-600" /> Send Back
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => duplicateSelectedObject(selectedShape)}
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-line bg-cream py-1.5 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition cursor-pointer"
                          >
                            <Copy className="h-3.5 w-3.5 text-blue-600" /> Duplicate (Ctrl + D)
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteSelectedObject(selectedShape.id)}
                            disabled={selectedShape.isLocked}
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete (Backspace)
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* TAB 2: PHOTOSHOP-STYLE LAYERS PANEL WITH INLINE RENAMING */}
                {rightPanelTab === "layers" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted">Canvas Stack (Top to Bottom)</span>
                      <span className="text-[10px] font-bold text-brand">{shapes.length} Layers</span>
                    </div>

                    {shapes.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-xs text-muted space-y-1">
                        <Layers className="h-8 w-8 text-slate-300 mx-auto" />
                        <p className="font-bold text-ink">No Layers Yet</p>
                        <p className="text-[11px]">Draw shapes, notes or lines on the canvas to see them in this layers stack.</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-[55vh] overflow-y-auto pr-1">
                        {/* Reverse to show Top Layer first (Photoshop style Z-order) */}
                        {[...shapes].reverse().map((shape, revIdx) => {
                          const realIdx = shapes.length - 1 - revIdx;
                          const isSelected = selectedShapeIds.includes(shape.id);
                          const IconComponent = getToolIcon(shape.type);

                          return (
                            <div
                              key={shape.id}
                              onClick={() => setSelectedShapeIds([shape.id])}
                              className={`group flex items-center justify-between rounded-2xl border p-2 text-xs transition cursor-pointer ${
                                isSelected
                                  ? "border-brand bg-brand-light/40 font-bold"
                                  : "border-line bg-cream hover:bg-white"
                              } ${shape.isHidden ? "opacity-40" : ""}`}
                            >
                              <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                                {/* Color Swatch Badge */}
                                <span
                                  className="h-3.5 w-3.5 rounded-full border border-black/20 shrink-0"
                                  style={{ background: shape.stickyColor || shape.color }}
                                />
                                <IconComponent className="h-4 w-4 text-brand shrink-0" />

                                {editingLayerId === shape.id ? (
                                  <input
                                    autoFocus
                                    type="text"
                                    value={editingLayerName}
                                    onChange={(e) => setEditingLayerName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        setShapes((prev) =>
                                          prev.map((s) => (s.id === shape.id ? { ...s, name: editingLayerName.trim() || s.name || s.type } : s))
                                        );
                                        setEditingLayerId(null);
                                        showToast("Renamed layer!");
                                      } else if (e.key === "Escape") {
                                        setEditingLayerId(null);
                                      }
                                    }}
                                    onBlur={() => {
                                      setShapes((prev) =>
                                        prev.map((s) => (s.id === shape.id ? { ...s, name: editingLayerName.trim() || s.name || s.type } : s))
                                      );
                                      setEditingLayerId(null);
                                    }}
                                    className="w-28 rounded border border-brand bg-white px-1.5 py-0.5 text-xs font-bold text-ink outline-none"
                                  />
                                ) : (
                                  <span
                                    onDoubleClick={() => {
                                      setEditingLayerId(shape.id);
                                      setEditingLayerName(shape.name || (shape.text ? `"${shape.text.slice(0, 14)}..."` : shape.type));
                                    }}
                                    className="truncate text-ink font-bold capitalize flex-1 cursor-text"
                                    title="Double-click to rename layer"
                                  >
                                    {shape.name || (shape.text ? `"${shape.text.slice(0, 14)}..."` : shape.type)}
                                  </span>
                                )}
                              </div>

                              {/* Layer Actions: Rename, Reorder Up/Down, Visibility, Lock & Delete */}
                              <div className="flex items-center gap-0.5 shrink-0 ml-1" onClick={(e) => e.stopPropagation()}>
                                {/* Inline Rename Edit Button */}
                                {editingLayerId !== shape.id && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingLayerId(shape.id);
                                      setEditingLayerName(shape.name || (shape.text ? `"${shape.text.slice(0, 14)}..."` : shape.type));
                                    }}
                                    className="p-1 rounded text-slate-400 hover:text-brand"
                                    title="Rename Layer"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </button>
                                )}

                                {/* Move Up in Z-stack */}
                                <button
                                  type="button"
                                  onClick={() => moveLayerUp(realIdx)}
                                  disabled={realIdx >= shapes.length - 1}
                                  className="p-1 rounded text-slate-400 hover:text-brand disabled:opacity-20"
                                  title="Move Layer Up (Bring Forward)"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </button>

                                {/* Move Down in Z-stack */}
                                <button
                                  type="button"
                                  onClick={() => moveLayerDown(realIdx)}
                                  disabled={realIdx <= 0}
                                  className="p-1 rounded text-slate-400 hover:text-brand disabled:opacity-20"
                                  title="Move Layer Down (Send Backward)"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </button>

                                {/* Hide / Show Eye Toggle */}
                                <button
                                  type="button"
                                  onClick={() => toggleHideShape(shape.id)}
                                  className="p-1 rounded text-slate-400 hover:text-blue-600"
                                  title={shape.isHidden ? "Unhide Layer" : "Hide Layer"}
                                >
                                  {shape.isHidden ? <EyeOff className="h-3.5 w-3.5 text-rose-500" /> : <Eye className="h-3.5 w-3.5 text-slate-500" />}
                                </button>

                                {/* Lock / Unlock Toggle */}
                                <button
                                  type="button"
                                  onClick={() => toggleLockShape(shape.id)}
                                  className="p-1 rounded text-slate-400 hover:text-amber-600"
                                  title={shape.isLocked ? "Unlock Layer" : "Lock Layer"}
                                >
                                  {shape.isLocked ? <Lock className="h-3.5 w-3.5 text-amber-600" /> : <Unlock className="h-3.5 w-3.5 text-slate-400" />}
                                </button>

                                {/* Delete Layer Trash Button */}
                                <button
                                  type="button"
                                  onClick={() => deleteSelectedObject(shape.id)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                                  title={shape.isLocked ? "Cannot delete locked layer" : "Delete Layer"}
                                >
                                  <Trash2 className={`h-3.5 w-3.5 ${shape.isLocked ? "text-slate-300" : "text-rose-500"}`} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* FIXED Panel Footer Stats */}
              <div className="border-t border-line px-4 py-2 bg-cream/60 text-[10px] text-muted flex items-center justify-between font-bold shrink-0">
                <span>Total Layers: {shapes.length}</span>
                <span>Zoom: {Math.round(zoom * 100)}%</span>
              </div>
            </aside>
          )}

          {/* Right Vertical Tool Bar Dock holding Inspector and Layers (Photoshop / Illustrator / Figma Style) */}
          <aside className="w-12 border-l border-line bg-white flex flex-col items-center justify-between py-2.5 shrink-0 z-30 shadow-xs">
            <div className="flex flex-col items-center gap-2 w-full">
              {/* Inspector Tab Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  if (isInspectorOpen && rightPanelTab === "inspector") {
                    setIsInspectorOpen(false);
                  } else {
                    setRightPanelTab("inspector");
                    setIsInspectorOpen(true);
                  }
                }}
                className={`h-9 w-9 rounded-xl flex items-center justify-center transition cursor-pointer relative group ${
                  isInspectorOpen && rightPanelTab === "inspector"
                    ? "bg-brand text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                }`}
                title="Inspector & Character Typography"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="absolute right-full mr-2 hidden group-hover:block bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none">
                  Inspector
                </span>
              </button>

              {/* Layers Tab Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  if (isInspectorOpen && rightPanelTab === "layers") {
                    setIsInspectorOpen(false);
                  } else {
                    setRightPanelTab("layers");
                    setIsInspectorOpen(true);
                  }
                }}
                className={`h-9 w-9 rounded-xl flex items-center justify-center transition cursor-pointer relative group ${
                  isInspectorOpen && rightPanelTab === "layers"
                    ? "bg-brand text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                }`}
                title="Layers Panel"
              >
                <Layers className="h-4 w-4" />
                {shapes.length > 0 && (
                  <span className={`absolute -top-1 -right-1 text-[8.5px] font-black px-1.5 py-0.2 rounded-full shadow-2xs ${
                    isInspectorOpen && rightPanelTab === "layers" ? "bg-amber-400 text-slate-900" : "bg-brand text-white"
                  }`}>
                    {shapes.length}
                  </span>
                )}
                <span className="absolute right-full mr-2 hidden group-hover:block bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none">
                  Layers ({shapes.length})
                </span>
              </button>
            </div>

            {/* Bottom Panel Collapse / Expand Button */}
            <div className="flex flex-col items-center gap-2 w-full pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setIsInspectorOpen((prev) => !prev)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-ink transition cursor-pointer"
                title={isInspectorOpen ? "Collapse Panel" : "Expand Panel"}
              >
                {isInspectorOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/*                          WHITEBOARD DRAWING ENGINE                         */
/* ========================================================================== */

/** Visual SVG Preview for Templates and Saved Drafts (Renders actual contents dynamically) */
function HubDiagramThumbnail({
  type,
  shapes,
}: {
  type?: "mindmap" | "smc" | "risk" | "eurusd" | "london";
  shapes?: Shape[];
}) {
  // If template type is given and no custom shapes, render the signature vector layout
  if (type === "mindmap" && (!shapes || shapes.length === 0)) {
    return (
      <svg className="w-full h-full" viewBox="0 0 200 120">
        <rect width="200" height="120" fill="#f8fafc" />
        <line x1="100" y1="35" x2="45" y2="75" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="100" y1="35" x2="155" y2="75" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
        {/* Center Node */}
        <rect x="55" y="14" width="90" height="34" rx="6" fill="#fef08a" stroke="#eab308" strokeWidth="1.5" />
        <text x="100" y="28" textAnchor="middle" fill="#854d0e" fontSize="8.5" fontWeight="bold">FOREX MASTERY</text>
        <text x="100" y="39" textAnchor="middle" fill="#a16207" fontSize="7">Mind Map Core</text>
        {/* Left Node */}
        <rect x="15" y="68" width="65" height="34" rx="6" fill="#bae6fd" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="47" y="82" textAnchor="middle" fill="#0369a1" fontSize="8" fontWeight="bold">Technical</text>
        <text x="47" y="93" textAnchor="middle" fill="#0284c7" fontSize="7">BOS & FVG</text>
        {/* Right Node */}
        <rect x="120" y="68" width="65" height="34" rx="6" fill="#fbcfe8" stroke="#f472b6" strokeWidth="1.5" />
        <text x="152" y="82" textAnchor="middle" fill="#9d174d" fontSize="8" fontWeight="bold">Risk Control</text>
        <text x="152" y="93" textAnchor="middle" fill="#be185d" fontSize="7">1:3 Min R:R</text>
      </svg>
    );
  }

  if (type === "smc" && (!shapes || shapes.length === 0)) {
    return (
      <svg className="w-full h-full" viewBox="0 0 200 120">
        <rect width="200" height="120" fill="#f8fafc" />
        {/* Price movement trend */}
        <polyline points="20,40 50,70 80,30 110,80 140,45 180,20" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Institutional Order Block */}
        <rect x="35" y="58" width="60" height="28" rx="4" fill="rgba(139, 92, 246, 0.25)" stroke="#8b5cf6" strokeWidth="1.5" />
        <text x="65" y="75" textAnchor="middle" fill="#7c3aed" fontSize="8" fontWeight="bold">OB Demand</text>
        {/* Liquidity Sweep Arrow */}
        <line x1="110" y1="80" x2="110" y2="105" stroke="#ef4444" strokeWidth="2" strokeDasharray="2 2" />
        <text x="110" y="114" textAnchor="middle" fill="#dc2626" fontSize="7" fontWeight="bold">Sweep ⚡</text>
      </svg>
    );
  }

  if (type === "risk" && (!shapes || shapes.length === 0)) {
    return (
      <svg className="w-full h-full" viewBox="0 0 200 120">
        <rect width="200" height="120" fill="#f8fafc" />
        {/* Take profit green zone */}
        <rect x="35" y="18" width="130" height="45" rx="4" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth="1.5" />
        <text x="100" y="44" textAnchor="middle" fill="#047857" fontSize="9.5" fontWeight="bold">TP Target: +90 pips</text>
        {/* Entry line */}
        <line x1="25" y1="63" x2="175" y2="63" stroke="#3b82f6" strokeWidth="2.5" />
        {/* Stop loss red zone */}
        <rect x="35" y="63" width="130" height="38" rx="4" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth="1.5" />
        <text x="100" y="86" textAnchor="middle" fill="#dc2626" fontSize="8.5" fontWeight="bold">SL Risk: -30 pips (1:3)</text>
      </svg>
    );
  }

  if (type === "eurusd" && (!shapes || shapes.length === 0)) {
    return (
      <svg className="w-full h-full" viewBox="0 0 200 120">
        <rect width="200" height="120" fill="#f8fafc" />
        {/* Red Candle */}
        <line x1="35" y1="30" x2="35" y2="45" stroke="#ef4444" strokeWidth="1.5" />
        <rect x="28" y="45" width="14" height="35" fill="rgba(239, 68, 68, 0.35)" stroke="#ef4444" strokeWidth="1.5" rx="2" />
        <line x1="35" y1="80" x2="35" y2="95" stroke="#ef4444" strokeWidth="1.5" />
        {/* Green Candle */}
        <line x1="60" y1="18" x2="60" y2="28" stroke="#10b981" strokeWidth="1.5" />
        <rect x="53" y="28" width="14" height="42" fill="rgba(16, 185, 129, 0.35)" stroke="#10b981" strokeWidth="1.5" rx="2" />
        <line x1="60" y1="70" x2="60" y2="85" stroke="#10b981" strokeWidth="1.5" />
        {/* BOS Line */}
        <line x1="50" y1="28" x2="180" y2="28" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3 3" />
        <text x="120" y="22" textAnchor="middle" fill="#2563eb" fontSize="8" fontWeight="bold">H4 BOS ↗</text>
        {/* FVG Box */}
        <rect x="80" y="45" width="85" height="30" rx="4" fill="rgba(245, 158, 11, 0.25)" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="122" y="63" textAnchor="middle" fill="#b45309" fontSize="8" fontWeight="bold">FVG Demand</text>
      </svg>
    );
  }

  if (type === "london" && (!shapes || shapes.length === 0)) {
    return (
      <svg className="w-full h-full" viewBox="0 0 200 120">
        <rect width="200" height="120" fill="#f8fafc" />
        {/* Asian Box */}
        <rect x="25" y="35" width="70" height="45" rx="4" fill="rgba(139, 92, 246, 0.2)" stroke="#8b5cf6" strokeWidth="1.5" />
        <text x="60" y="60" textAnchor="middle" fill="#6d28d9" fontSize="8" fontWeight="bold">Asian Range</text>
        {/* Sweep */}
        <path d="M 95 65 L 115 100" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <text x="115" y="112" textAnchor="middle" fill="#dc2626" fontSize="7" fontWeight="bold">Judas Sweep</text>
        {/* Surge Arrow */}
        <path d="M 115 100 Q 140 40, 180 20" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        <polygon points="185,18 175,22 178,28" fill="#10b981" />
      </svg>
    );
  }

  // Dynamic Real Shapes Render Engine for Drafts and Files
  if (shapes && shapes.length > 0) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    shapes.forEach((s) => {
      s.points.forEach((p) => {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      });
    });

    if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
      minX = 0; minY = 0; maxX = 800; maxY = 500;
    }

    const contentW = Math.max(60, maxX - minX);
    const contentH = Math.max(40, maxY - minY);
    const padding = 14;
    const viewW = 200;
    const viewH = 120;
    const availW = viewW - padding * 2;
    const availH = viewH - padding * 2;

    const scale = Math.min(availW / contentW, availH / contentH, 1.2);
    const offsetX = padding + (availW - contentW * scale) / 2 - minX * scale;
    const offsetY = padding + (availH - contentH * scale) / 2 - minY * scale;

    const tx = (x: number) => x * scale + offsetX;
    const ty = (y: number) => y * scale + offsetY;

    return (
      <svg className="w-full h-full" viewBox="0 0 200 120">
        <rect width="200" height="120" fill="#f8fafc" />
        {/* Subtle grid background */}
        <circle cx="20" cy="20" r="0.75" fill="#cbd5e1" />
        <circle cx="60" cy="20" r="0.75" fill="#cbd5e1" />
        <circle cx="100" cy="20" r="0.75" fill="#cbd5e1" />
        <circle cx="140" cy="20" r="0.75" fill="#cbd5e1" />
        <circle cx="180" cy="20" r="0.75" fill="#cbd5e1" />
        <circle cx="20" cy="60" r="0.75" fill="#cbd5e1" />
        <circle cx="60" cy="60" r="0.75" fill="#cbd5e1" />
        <circle cx="100" cy="60" r="0.75" fill="#cbd5e1" />
        <circle cx="140" cy="60" r="0.75" fill="#cbd5e1" />
        <circle cx="180" cy="60" r="0.75" fill="#cbd5e1" />
        <circle cx="20" cy="100" r="0.75" fill="#cbd5e1" />
        <circle cx="60" cy="100" r="0.75" fill="#cbd5e1" />
        <circle cx="100" cy="100" r="0.75" fill="#cbd5e1" />
        <circle cx="140" cy="100" r="0.75" fill="#cbd5e1" />
        <circle cx="180" cy="100" r="0.75" fill="#cbd5e1" />

        {shapes.map((s, idx) => {
          const color = s.color || "#3b82f6";
          const pts = s.points;
          if (!pts || pts.length === 0) return null;

          if ((s.type === "rectangle" || s.type === "orderblock" || s.type === "fvg") && pts.length >= 2) {
            const rx = Math.min(tx(pts[0].x), tx(pts[1].x));
            const ry = Math.min(ty(pts[0].y), ty(pts[1].y));
            const rw = Math.max(4, Math.abs(tx(pts[1].x) - tx(pts[0].x)));
            const rh = Math.max(4, Math.abs(ty(pts[1].y) - ty(pts[0].y)));
            return (
              <g key={s.id || idx}>
                <rect x={rx} y={ry} width={rw} height={rh} rx={3} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={1.25} />
                {s.type === "orderblock" && (
                  <line x1={rx} y1={ry + rh / 2} x2={rx + rw} y2={ry + rh / 2} stroke={color} strokeWidth={0.75} strokeDasharray="2 2" />
                )}
                {s.text && rw > 25 && (
                  <text x={rx + 3} y={ry + 8} fill={color} fontSize={5.5} fontWeight="bold">{s.text}</text>
                )}
              </g>
            );
          }

          if (s.type === "circle" && pts.length >= 2) {
            const cx = tx(pts[0].x);
            const cy = ty(pts[0].y);
            const r = Math.max(3, Math.hypot(tx(pts[1].x) - cx, ty(pts[1].y) - cy));
            return (
              <circle key={s.id || idx} cx={cx} cy={cy} r={r} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={1.25} />
            );
          }

          if (s.type === "diamond" && pts.length >= 2) {
            const minPx = Math.min(tx(pts[0].x), tx(pts[1].x));
            const minPy = Math.min(ty(pts[0].y), ty(pts[1].y));
            const maxPx = Math.max(tx(pts[0].x), tx(pts[1].x));
            const maxPy = Math.max(ty(pts[0].y), ty(pts[1].y));
            const midPx = (minPx + maxPx) / 2;
            const midPy = (minPy + maxPy) / 2;
            const pointsStr = `${midPx},${minPy} ${maxPx},${midPy} ${midPx},${maxPy} ${minPx},${midPy}`;
            return (
              <polygon key={s.id || idx} points={pointsStr} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={1.25} />
            );
          }

          if ((s.type === "line" || s.type === "bos" || s.type === "liquidity") && pts.length >= 2) {
            return (
              <g key={s.id || idx}>
                <line
                  x1={tx(pts[0].x)}
                  y1={ty(pts[0].y)}
                  x2={tx(pts[1].x)}
                  y2={ty(pts[1].y)}
                  stroke={color}
                  strokeWidth={s.type === "bos" ? 1.5 : 1.25}
                  strokeDasharray={s.lineStyle === "dashed" || s.type === "bos" || s.type === "liquidity" ? "3 2" : undefined}
                />
                {s.text && (
                  <text x={(tx(pts[0].x) + tx(pts[1].x)) / 2} y={(ty(pts[0].y) + ty(pts[1].y)) / 2 - 2} textAnchor="middle" fill={color} fontSize={5.5} fontWeight="bold">
                    {s.text}
                  </text>
                )}
              </g>
            );
          }

          if (s.type === "arrow" && pts.length >= 2) {
            const x1 = tx(pts[0].x);
            const y1 = ty(pts[0].y);
            const x2 = tx(pts[1].x);
            const y2 = ty(pts[1].y);
            return (
              <g key={s.id || idx}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
                <circle cx={x2} cy={y2} r={2} fill={color} />
              </g>
            );
          }

          if ((s.type === "pencil" || s.type === "highlighter" || s.type === "bezier") && pts.length >= 2) {
            const polyPoints = pts.map((p) => `${tx(p.x)},${ty(p.y)}`).join(" ");
            return (
              <polyline
                key={s.id || idx}
                points={polyPoints}
                fill="none"
                stroke={color}
                strokeWidth={s.type === "highlighter" ? 4 : 1.5}
                strokeOpacity={s.type === "highlighter" ? 0.4 : 1}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          }

          if (s.type === "bullish_candle" && pts.length >= 2) {
            const y1 = ty(pts[0].y);
            const y2 = ty(pts[1].y);
            const yHigh = Math.min(y1, y2);
            const yLow = Math.max(y1, y2);
            const totalH = Math.max(8, yLow - yHigh);
            const bodyW = Math.max(5, Math.abs(tx(pts[1].x) - tx(pts[0].x)) || 8);
            const cx = tx(pts[0].x);
            const bx = cx - bodyW / 2;
            const bodyH = Math.max(4, totalH * 0.62);
            const by = yHigh + (totalH - bodyH) / 2;
            const candleColor = s.color || "#10b981";

            return (
              <g key={s.id || idx}>
                <line x1={cx} y1={yHigh} x2={cx} y2={by} stroke={candleColor} strokeWidth={1} />
                <rect x={bx} y={by} width={bodyW} height={bodyH} fill={candleColor} fillOpacity={0.35} stroke={candleColor} strokeWidth={1} rx={1} />
                <line x1={cx} y1={by + bodyH} x2={cx} y2={yLow} stroke={candleColor} strokeWidth={1} />
              </g>
            );
          }

          if (s.type === "bearish_candle" && pts.length >= 2) {
            const y1 = ty(pts[0].y);
            const y2 = ty(pts[1].y);
            const yHigh = Math.min(y1, y2);
            const yLow = Math.max(y1, y2);
            const totalH = Math.max(8, yLow - yHigh);
            const bodyW = Math.max(5, Math.abs(tx(pts[1].x) - tx(pts[0].x)) || 8);
            const cx = tx(pts[0].x);
            const bx = cx - bodyW / 2;
            const bodyH = Math.max(4, totalH * 0.62);
            const by = yHigh + (totalH - bodyH) / 2;
            const candleColor = s.color || "#ef4444";

            return (
              <g key={s.id || idx}>
                <line x1={cx} y1={yHigh} x2={cx} y2={by} stroke={candleColor} strokeWidth={1} />
                <rect x={bx} y={by} width={bodyW} height={bodyH} fill={candleColor} fillOpacity={0.35} stroke={candleColor} strokeWidth={1} rx={1} />
                <line x1={cx} y1={by + bodyH} x2={cx} y2={yLow} stroke={candleColor} strokeWidth={1} />
              </g>
            );
          }

          if ((s.type === "long" || s.type === "short") && pts.length >= 2) {
            const x1 = tx(pts[0].x);
            const y1 = ty(pts[0].y);
            const x2 = tx(pts[1].x);
            const y2 = ty(pts[1].y);
            const minXBox = Math.min(x1, x2);
            const bw = Math.abs(x2 - x1) || 40;
            const bh = Math.abs(y2 - y1) || 25;
            const isLong = s.type === "long";

            return (
              <g key={s.id || idx}>
                <rect x={minXBox} y={isLong ? y1 - bh : y1} width={bw} height={bh} fill={isLong ? "#10b981" : "#ef4444"} fillOpacity={0.25} stroke={isLong ? "#10b981" : "#ef4444"} strokeWidth={1} rx={2} />
                <line x1={minXBox} y1={y1} x2={minXBox + bw} y2={y1} stroke="#3b82f6" strokeWidth={1.5} />
                <rect x={minXBox} y={isLong ? y1 : y1 - bh / 3} width={bw} height={bh / 3} fill={isLong ? "#ef4444" : "#10b981"} fillOpacity={0.25} stroke={isLong ? "#ef4444" : "#10b981"} strokeWidth={1} rx={2} />
              </g>
            );
          }

          if (s.type === "sticky" && pts.length >= 1) {
            const sx = tx(pts[0].x);
            const sy = ty(pts[0].y);
            return (
              <g key={s.id || idx}>
                <rect x={sx} y={sy} width={45} height={30} rx={3} fill={s.stickyColor || "#fef08a"} stroke="#ca8a04" strokeWidth={0.75} />
                <line x1={sx + 4} y1={sy + 8} x2={sx + 38} y2={sy + 8} stroke="#854d0e" strokeWidth={1} strokeLinecap="round" />
                <line x1={sx + 4} y1={sy + 15} x2={sx + 30} y2={sy + 15} stroke="#854d0e" strokeWidth={1} strokeLinecap="round" />
                <line x1={sx + 4} y1={sy + 22} x2={sx + 34} y2={sy + 22} stroke="#854d0e" strokeWidth={1} strokeLinecap="round" />
              </g>
            );
          }

          if (s.type === "text" && pts.length >= 1) {
            return (
              <text key={s.id || idx} x={tx(pts[0].x)} y={ty(pts[0].y)} fill={color} fontSize={6} fontWeight="bold">
                {s.text?.slice(0, 16) || "Text"}
              </text>
            );
          }

          if (s.type === "annotation" && pts.length >= 2) {
            const x0 = tx(pts[0].x);
            const y0 = ty(pts[0].y);
            const x1 = tx(pts[1].x);
            const y1 = ty(pts[1].y);
            const labelStr = s.text?.slice(0, 12) || "Note";
            return (
              <g key={s.id || idx}>
                <circle cx={x0} cy={y0} r={2} fill={color} />
                <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={color} strokeWidth={1} strokeDasharray={s.lineStyle === "dashed" ? "2 1" : undefined} />
                <rect x={x1 >= x0 ? x1 : x1 - 32} y={y1 - 7} width={32} height={14} rx={2} fill="#ffffff" stroke={color} strokeWidth={0.75} />
                <text x={(x1 >= x0 ? x1 : x1 - 32) + 3} y={y1 + 3} fill={color} fontSize={5} fontWeight="bold">
                  {labelStr}
                </text>
              </g>
            );
          }

          return null;
        })}
      </svg>
    );
  }

  // Blank Canvas Fallback
  return (
    <svg className="w-full h-full" viewBox="0 0 200 120">
      <rect width="200" height="120" fill="#f8fafc" />
      <circle cx="20" cy="20" r="0.75" fill="#cbd5e1" />
      <circle cx="60" cy="20" r="0.75" fill="#cbd5e1" />
      <circle cx="100" cy="20" r="0.75" fill="#cbd5e1" />
      <circle cx="140" cy="20" r="0.75" fill="#cbd5e1" />
      <circle cx="180" cy="20" r="0.75" fill="#cbd5e1" />
      <circle cx="20" cy="60" r="0.75" fill="#cbd5e1" />
      <circle cx="60" cy="60" r="0.75" fill="#cbd5e1" />
      <circle cx="100" cy="60" r="0.75" fill="#cbd5e1" />
      <circle cx="140" cy="60" r="0.75" fill="#cbd5e1" />
      <circle cx="180" cy="60" r="0.75" fill="#cbd5e1" />
      <circle cx="20" cy="100" r="0.75" fill="#cbd5e1" />
      <circle cx="60" cy="100" r="0.75" fill="#cbd5e1" />
      <circle cx="100" cy="100" r="0.75" fill="#cbd5e1" />
      <circle cx="140" cy="100" r="0.75" fill="#cbd5e1" />
      <circle cx="180" cy="100" r="0.75" fill="#cbd5e1" />
      <rect x="40" y="30" width="120" height="60" rx="8" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
      <text x="100" y="65" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">Blank Canvas</text>
    </svg>
  );
}

interface FlyoutToolItemProps {
  toolKey: Tool;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  isFavorited: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  showTooltips?: boolean;
}

function FlyoutToolItem({
  toolKey,
  label,
  icon: Icon,
  isActive,
  isFavorited,
  onSelect,
  onToggleFavorite,
  showTooltips = true,
}: FlyoutToolItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const explanation = TOOL_EXPLANATIONS[toolKey];

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
          isActive ? "bg-brand text-white" : "text-slate-700 hover:bg-cream"
        }`}
      >
        <span className="flex items-center gap-2.5">
          <span className="w-4 h-4 flex items-center justify-center shrink-0">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span>{label}</span>
        </span>
        <span title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}>
          <Star
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`h-3.5 w-3.5 cursor-pointer p-0.5 rounded ${
              isFavorited ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"
            }`}
          />
        </span>
      </button>

      {/* Rich Interactive Preview Tooltip for Nested Tool */}
      {showTooltips && isHovered && explanation && (
        <div className="absolute left-full top-0 ml-2 w-52 rounded-2xl border border-slate-700 bg-slate-900 text-white p-2.5 shadow-2xl z-50 animate-in fade-in slide-in-from-left-2 pointer-events-none space-y-2">
          <div className="w-full h-28 rounded-xl border border-slate-800 bg-slate-950/80 flex items-center justify-center overflow-hidden relative">
            <ToolGifAnimation toolKey={toolKey} />
          </div>

          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1">
              <h4 className="font-extrabold text-xs text-amber-400">{explanation.title}</h4>
              {explanation.shortcut && (
                <span className="text-[9px] font-black uppercase tracking-wider bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                  {explanation.shortcut}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-300 leading-snug font-medium">{explanation.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function WhiteboardToolBtn({
  active,
  onClick,
  onContextMenu,
  onFlyoutToggle,
  title,
  toolKey,
  icon: Icon,
  hasFlyout = false,
  isFlyoutOpen = false,
  showTooltips,
}: {
  active: boolean;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onFlyoutToggle?: (e: React.MouseEvent) => void;
  title: string;
  toolKey: string;
  icon: React.ComponentType<{ className?: string }>;
  hasFlyout?: boolean;
  isFlyoutOpen?: boolean;
  showTooltips: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const explanation = TOOL_EXPLANATIONS[toolKey];

  return (
    <div
      className="relative w-full group flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          onClick();
          if (hasFlyout && onFlyoutToggle && active) {
            onFlyoutToggle(e);
          }
        }}
        onContextMenu={onContextMenu}
        title={explanation?.title || title}
        className={`relative h-10 w-10 aspect-square rounded-xl flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
          active
            ? "bg-brand text-white shadow-md shadow-brand/20"
            : "text-slate-700 hover:bg-cream hover:text-ink"
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {hasFlyout && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              if (onFlyoutToggle) onFlyoutToggle(e);
            }}
            className="absolute -right-0.5 top-0 bottom-0 px-0.5 flex items-center justify-center text-slate-400 hover:text-ink hover:scale-125 transition cursor-pointer"
            title="Expand tool options"
          >
            <ChevronRight className="h-2.5 w-2.5" />
          </span>
        )}
      </button>

      {/* Rich Interactive Tooltip Popover with Compact Visual Illustration */}
      {showTooltips && isHovered && explanation && !isFlyoutOpen && (
        <div className="absolute left-full top-0 ml-3 w-52 rounded-2xl border border-slate-700 bg-slate-900 text-white p-2.5 shadow-2xl z-50 animate-in fade-in slide-in-from-left-2 pointer-events-none space-y-2">
          {/* Visual Illustration Container - Compact and Proportional */}
          <div className="w-full h-28 rounded-xl border border-slate-800 bg-slate-950/80 flex items-center justify-center overflow-hidden relative">
            <ToolGifAnimation toolKey={toolKey} />
          </div>

          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1">
              <h4 className="font-extrabold text-xs text-amber-400">{explanation.title}</h4>
              {explanation.shortcut && (
                <span className="text-[9px] font-black uppercase tracking-wider bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                  {explanation.shortcut}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-300 leading-snug font-medium">{explanation.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/** Animated GIF-style SVG Visual Illustrations for Tool Usage */
function ToolGifAnimation({ toolKey }: { toolKey: string }) {
  if (toolKey === "bullish_candle") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        {/* Upper Wick */}
        <line x1="70" y1="12" x2="70" y2="28" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        {/* Bullish Green Body */}
        <rect x="52" y="28" width="36" height="42" rx="3" fill="rgba(16, 185, 129, 0.35)" stroke="#10b981" strokeWidth="2" className="animate-pulse" />
        {/* Lower Wick */}
        <line x1="70" y1="70" x2="70" y2="84" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        <text x="70" y="52" textAnchor="middle" fill="#10b981" fontSize="8.5" fontWeight="bold">BULLISH</text>
      </svg>
    );
  }

  if (toolKey === "bearish_candle") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        {/* Upper Wick */}
        <line x1="70" y1="12" x2="70" y2="28" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        {/* Bearish Red Body */}
        <rect x="52" y="28" width="36" height="42" rx="3" fill="rgba(239, 68, 68, 0.35)" stroke="#ef4444" strokeWidth="2" className="animate-pulse" />
        {/* Lower Wick */}
        <line x1="70" y1="70" x2="70" y2="84" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        <text x="70" y="52" textAnchor="middle" fill="#ef4444" fontSize="8.5" fontWeight="bold">BEARISH</text>
      </svg>
    );
  }

  if (toolKey === "fibo") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        <line x1="15" y1="12" x2="105" y2="12" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x="108" y="15" fill="#f43f5e" fontSize="7.5" fontWeight="bold">0.0%</text>
        <line x1="15" y1="30" x2="105" y2="30" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="108" y="33" fill="#f59e0b" fontSize="7.5" fontWeight="bold">0.382</text>
        <rect x="15" y="42" width="90" height="15" fill="rgba(234, 179, 8, 0.25)" />
        <line x1="15" y1="42" x2="105" y2="42" stroke="#eab308" strokeWidth="2" />
        <text x="108" y="45" fill="#eab308" fontSize="7.5" fontWeight="bold">0.50</text>
        <line x1="15" y1="57" x2="105" y2="57" stroke="#10b981" strokeWidth="2" className="animate-pulse" />
        <text x="108" y="60" fill="#10b981" fontSize="7.5" fontWeight="bold">0.618</text>
        <line x1="15" y1="78" x2="105" y2="78" stroke="#3b82f6" strokeWidth="1.5" />
        <text x="108" y="81" fill="#3b82f6" fontSize="7.5" fontWeight="bold">1.00</text>
      </svg>
    );
  }

  if (toolKey === "long") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        <rect x="20" y="12" width="100" height="34" rx="4" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth="1.5" />
        <text x="70" y="33" textAnchor="middle" fill="#10b981" fontSize="8.5" fontWeight="bold">TP: +90 pips</text>
        <line x1="20" y1="46" x2="120" y2="46" stroke="#3b82f6" strokeWidth="2.5" />
        <rect x="20" y="46" width="100" height="34" rx="4" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth="1.5" />
        <text x="70" y="67" textAnchor="middle" fill="#ef4444" fontSize="8.5" fontWeight="bold">SL: -30 pips (1:3)</text>
      </svg>
    );
  }

  if (toolKey === "short") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        <rect x="20" y="12" width="100" height="34" rx="4" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth="1.5" />
        <text x="70" y="33" textAnchor="middle" fill="#ef4444" fontSize="8.5" fontWeight="bold">SL: -25 pips (1:3)</text>
        <line x1="20" y1="46" x2="120" y2="46" stroke="#3b82f6" strokeWidth="2.5" />
        <rect x="20" y="46" width="100" height="34" rx="4" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth="1.5" />
        <text x="70" y="67" textAnchor="middle" fill="#10b981" fontSize="8.5" fontWeight="bold">TP: +75 pips</text>
      </svg>
    );
  }

  if (toolKey === "orderblock") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        <rect x="18" y="18" width="104" height="58" rx="4" fill="rgba(139, 92, 246, 0.25)" stroke="#8b5cf6" strokeWidth="1.5" />
        <line x1="18" y1="47" x2="122" y2="47" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3 3" />
        <text x="70" y="36" textAnchor="middle" fill="#8b5cf6" fontSize="9" fontWeight="bold">ORDER BLOCK (OB)</text>
        <text x="70" y="60" textAnchor="middle" fill="#a78bfa" fontSize="7.5" fontWeight="bold">50% Mean Threshold</text>
      </svg>
    );
  }

  if (toolKey === "fvg") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        {/* Shaded FVG Imbalance Box */}
        <rect x="25" y="32" width="90" height="26" rx="4" fill="rgba(245, 158, 11, 0.22)" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="25" y1="45" x2="115" y2="45" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />

        {/* Candle 1 (Left base candle) */}
        <line x1="38" y1="58" x2="38" y2="82" stroke="#64748b" strokeWidth="2" />
        <rect x="33" y="64" width="10" height="14" rx="2" fill="#ef4444" />

        {/* Candle 2 (Center tall green impulse candle) */}
        <line x1="70" y1="12" x2="70" y2="84" stroke="#10b981" strokeWidth="2" />
        <rect x="64" y="20" width="12" height="56" rx="2" fill="#10b981" />

        {/* Candle 3 (Right high candle) */}
        <line x1="102" y1="14" x2="102" y2="32" stroke="#64748b" strokeWidth="2" />
        <rect x="97" y="16" width="10" height="12" rx="2" fill="#10b981" />

        {/* FVG Label */}
        <text x="70" y="48" textAnchor="middle" fill="#d97706" fontSize="9" fontWeight="900">FVG (50% C.E.)</text>
      </svg>
    );
  }

  if (toolKey === "bos") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        {/* Horizontal Structure Level Line */}
        <line x1="45" y1="42" x2="125" y2="42" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
        <text x="126" y="44" fill="#3b82f6" fontSize="7.5" fontWeight="bold">BOS LEVEL</text>

        {/* Impulsive Zig-Zag Breakout Path */}
        <polyline points="20,78 45,42 72,62 118,22" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Breakout Arrowhead */}
        <polygon points="126,16 112,20 120,28" fill="#3b82f6" />

        {/* Peak Trigger Point */}
        <circle cx="45" cy="42" r="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" />

        {/* BOS Badge */}
        <rect x="85" y="24" width="30" height="15" rx="4" fill="#3b82f6" />
        <text x="100" y="34.5" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">BOS ↗</text>
      </svg>
    );
  }

  if (toolKey === "liquidity") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        <line x1="20" y1="45" x2="120" y2="45" stroke="#e11d48" strokeWidth="2" strokeDasharray="3 3" />
        <text x="70" y="36" textAnchor="middle" fill="#e11d48" fontSize="9" fontWeight="bold">$$$ LIQUIDITY POOL</text>
        <text x="70" y="62" textAnchor="middle" fill="#fb7185" fontSize="7.5" fontWeight="bold">BSL / SSL Target</text>
      </svg>
    );
  }

  if (toolKey === "select") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        <rect x="25" y="18" width="80" height="54" rx="6" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="25" cy="18" r="3.5" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" />
        <circle cx="105" cy="18" r="3.5" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" />
        <circle cx="105" cy="72" r="3.5" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" />
        <circle cx="25" cy="72" r="3.5" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" />
        <g className="animate-pulse">
          <path d="M 105 72 L 120 84" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" />
          <polygon points="105,72 114,72 105,81" fill="#dc3545" />
        </g>
      </svg>
    );
  }

  if (toolKey === "pencil") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        <path d="M 18 68 Q 45 15, 75 55 T 122 28" fill="none" stroke="#dc3545" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
        <circle cx="122" cy="28" r="4" fill="#dc3545" />
      </svg>
    );
  }

  if (toolKey === "highlighter") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        <rect x="15" y="32" width="110" height="28" rx="6" fill="rgba(253, 224, 71, 0.4)" />
        <line x1="20" y1="46" x2="120" y2="46" stroke="#fef08a" strokeWidth="8" strokeLinecap="round" className="animate-pulse" />
      </svg>
    );
  }

  if (toolKey === "rectangle") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        <rect x="20" y="20" width="100" height="55" rx="8" fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth="2" className="animate-pulse" />
        <text x="70" y="52" textAnchor="middle" fill="#93c5fd" fontSize="9.5" fontWeight="bold">ORDER BLOCK</text>
      </svg>
    );
  }

  if (toolKey === "circle") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        <circle cx="70" cy="48" r="30" fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="2" className="animate-pulse" />
        <circle cx="70" cy="48" r="4" fill="#10b981" />
      </svg>
    );
  }

  if (toolKey === "diamond") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        <polygon points="70,14 115,48 70,82 25,48" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" strokeWidth="2" className="animate-pulse" />
        <text x="70" y="51" textAnchor="middle" fill="#fde68a" fontSize="8.5" fontWeight="bold">TRIGGER</text>
      </svg>
    );
  }

  if (toolKey === "line") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        <line x1="20" y1="72" x2="120" y2="24" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
      </svg>
    );
  }

  if (toolKey === "arrow") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        <line x1="20" y1="48" x2="110" y2="48" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        <polygon points="122,48 108,39 108,57" fill="#10b981" className="animate-pulse" />
      </svg>
    );
  }

  if (toolKey === "bezier") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        <polyline points="15,75 45,30 75,65 102,22 125,58" fill="none" stroke="#dc3545" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="15" cy="75" r="3" fill="#ffffff" stroke="#dc3545" strokeWidth="1.5" />
        <circle cx="45" cy="30" r="3" fill="#ffffff" stroke="#dc3545" strokeWidth="1.5" />
        <circle cx="75" cy="65" r="3" fill="#ffffff" stroke="#dc3545" strokeWidth="1.5" />
        <circle cx="102" cy="22" r="3" fill="#ffffff" stroke="#dc3545" strokeWidth="1.5" />
        <circle cx="125" cy="58" r="3" fill="#ffffff" stroke="#dc3545" strokeWidth="1.5" />
      </svg>
    );
  }

  if (toolKey === "sticky") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        <rect x="35" y="16" width="70" height="62" rx="4" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
        <line x1="45" y1="28" x2="95" y2="28" stroke="#854d0e" strokeWidth="2" strokeLinecap="round" />
        <line x1="45" y1="40" x2="88" y2="40" stroke="#854d0e" strokeWidth="2" strokeLinecap="round" />
        <line x1="45" y1="52" x2="92" y2="52" stroke="#854d0e" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (toolKey === "text") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        <text x="20" y="52" fill="#38bdf8" fontSize="13" fontWeight="bold" fontFamily="sans-serif">EUR/USD +150</text>
        <line x1="122" y1="36" x2="122" y2="54" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
      </svg>
    );
  }

  if (toolKey === "annotation") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        {/* Anchor Pin on Object */}
        <circle cx="28" cy="65" r="4" fill="#3b82f6" className="animate-ping" />
        <circle cx="28" cy="65" r="4" fill="#3b82f6" />
        {/* Leader line to callout box */}
        <path d="M 31 62 L 58 36 H 115" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
        {/* Callout Badge */}
        <rect x="58" y="24" width="62" height="24" rx="4" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="1.5" />
        <text x="89" y="39" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold">Key POI Level</text>
      </svg>
    );
  }

  if (toolKey === "eraser") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        <path d="M 15 48 L 70 48" stroke="#475569" strokeWidth="3" strokeDasharray="4 4" />
        <path d="M 70 48 L 125 48" stroke="#f43f5e" strokeWidth="3" />
        <rect x="58" y="34" width="24" height="24" rx="4" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" className="animate-bounce" />
      </svg>
    );
  }

  if (toolKey === "zoom") {
    return (
      <svg className="w-full h-full" viewBox="0 0 140 95">
        <circle cx="60" cy="44" r="22" fill="none" stroke="#38bdf8" strokeWidth="3" />
        <line x1="76" y1="60" x2="98" y2="82" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
        <path d="M 48 48 L 56 38 L 64 50 L 72 34" fill="none" stroke="#10b981" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg className="w-full h-full" viewBox="0 0 140 95">
      <path d="M 25 48 Q 70 18, 115 48" fill="none" stroke="#38bdf8" strokeWidth="3" className="animate-pulse" />
    </svg>
  );
}

/** Helper function to map tool keys to Lucide icons */
function getToolIcon(toolKey: Tool): React.ElementType {
  switch (toolKey) {
    case "select": return MousePointer;
    case "hand": return Hand;
    case "pencil": return Pencil;
    case "highlighter": return Highlighter;
    case "rectangle": return Square;
    case "circle": return Circle;
    case "diamond": return Diamond;
    case "line": return Minus;
    case "arrow": return ArrowUpRight;
    case "bezier": return Activity;
    case "sticky": return StickyNote;
    case "text": return Type;
    case "annotation": return AnnotationIcon;
    case "eraser": return Eraser;
    case "zoom": return Search;
    case "marquee_zoom": return Scan;
    case "fibo": return Percent;
    case "long": return TradingViewLongIcon;
    case "short": return TradingViewShortIcon;
    case "orderblock": return OrderBlockIcon;
    case "fvg": return FvgCandlesIcon;
    case "bos": return BosIcon;
    case "liquidity": return LiquidityIcon;
    case "bullish_candle": return BullishCandleIcon;
    case "bearish_candle": return BearishCandleIcon;
    default: return Pencil;
  }
}

/** Check if point is inside shape */
function isPointInShape(pt: { x: number; y: number }, shape: Shape): boolean {
  const pts = shape.points;
  if (!pts.length) return false;

  if (shape.type === "sticky") {
    const p = pts[0];
    return pt.x >= p.x && pt.x <= p.x + 180 && pt.y >= p.y && pt.y <= p.y + 140;
  }

  const minX = Math.min(...pts.map((p) => p.x)) - 10;
  const maxX = Math.max(...pts.map((p) => p.x)) + 10;
  const minY = Math.min(...pts.map((p) => p.y)) - 10;
  const maxY = Math.max(...pts.map((p) => p.y)) + 10;

  return pt.x >= minX && pt.x <= maxX && pt.y >= minY && pt.y <= maxY;
}

function getShapeBounds(shape: Shape): { minX: number; maxX: number; minY: number; maxY: number } {
  const pts = shape.points;
  if (!pts || !pts.length) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };

  let minX = Math.min(...pts.map((p) => p.x));
  let maxX = Math.max(...pts.map((p) => p.x));
  let minY = Math.min(...pts.map((p) => p.y));
  let maxY = Math.max(...pts.map((p) => p.y));

  if (shape.type === "sticky") {
    minX = pts[0].x;
    minY = pts[0].y;
    maxX = pts[0].x + 180;
    maxY = pts[0].y + 140;
  } else if (shape.type === "text") {
    const fSize = shape.fontSize || 16;
    const lHeight = (shape.lineHeight || 1.3) * fSize;
    const lines = (shape.text || "Text").split("\n");
    const maxLen = Math.max(...lines.map((l) => l.length), 4);
    const approxW = maxLen * (fSize * 0.65);
    const totalH = lines.length * lHeight;
    const tAlign = shape.textAlign || "left";

    minX = tAlign === "center" ? pts[0].x - approxW / 2 - 4 : tAlign === "right" ? pts[0].x - approxW - 4 : pts[0].x - 4;
    minY = pts[0].y - 4;
    maxX = minX + approxW + 8;
    maxY = minY + totalH + 8;
  } else if (shape.type === "bullish_candle" || shape.type === "bearish_candle") {
    const upperWick = shape.upperWickLength ?? 25;
    const lowerWick = shape.lowerWickLength ?? 25;
    minY = Math.min(minY, minY - upperWick);
    maxY = Math.max(maxY, maxY + lowerWick);
  }
  return { minX, maxX, minY, maxY };
}

function isShapeInMarquee(shape: Shape, mMinX: number, mMaxX: number, mMinY: number, mMaxY: number): boolean {
  if (shape.isHidden) return false;
  // 1. Any point of shape is inside marquee
  if (shape.points.some((p) => p.x >= mMinX && p.x <= mMaxX && p.y >= mMinY && p.y <= mMaxY)) return true;
  // 2. Bounding box overlaps with marquee box
  const b = getShapeBounds(shape);
  const overlapX = !(b.maxX < mMinX || b.minX > mMaxX);
  const overlapY = !(b.maxY < mMinY || b.minY > mMaxY);
  return overlapX && overlapY;
}

/** Check hit test on 8 resize handle nodes (4 corners + 4 center edges) */
function getResizeHandleHit(pt: { x: number; y: number }, shape: Shape): ResizeHandle | null {
  const pts = shape.points;
  if (!pts.length) return null;

  let minX = Math.min(...pts.map((p) => p.x));
  let maxX = Math.max(...pts.map((p) => p.x));
  let minY = Math.min(...pts.map((p) => p.y));
  let maxY = Math.max(...pts.map((p) => p.y));

  if (shape.type === "sticky") {
    minX = pts[0].x;
    minY = pts[0].y;
    maxX = pts[0].x + 180;
    maxY = pts[0].y + 140;
  } else if (shape.type === "text") {
    minX = pts[0].x - 4;
    minY = pts[0].y - 18;
    maxX = pts[0].x + Math.max(60, (shape.text?.length || 4) * 9);
    maxY = pts[0].y + 6;
  }

  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const pad = 6;

  const handles: { handle: ResizeHandle; x: number; y: number }[] = [
    { handle: "tl", x: minX - pad, y: minY - pad },
    { handle: "tm", x: midX, y: minY - pad },
    { handle: "tr", x: maxX + pad, y: minY - pad },
    { handle: "mr", x: maxX + pad, y: midY },
    { handle: "br", x: maxX + pad, y: maxY + pad },
    { handle: "bm", x: midX, y: maxY + pad },
    { handle: "bl", x: minX - pad, y: maxY + pad },
    { handle: "ml", x: minX - pad, y: midY },
  ];

  const hit = handles.find((c) => Math.hypot(pt.x - c.x, pt.y - c.y) <= 10);
  return hit ? hit.handle : null;
}

/** Smoothly resizes shape points when user drags any corner or center edge handle, preserving aspect ratio when holding Shift */
function resizeShapePoints(
  shape: Shape,
  handle: ResizeHandle,
  pt: { x: number; y: number },
  isShiftPressed: boolean = false
): Shape {
  const pts = shape.points;
  if (!pts.length) return shape;

  let minX = Math.min(...pts.map((p) => p.x));
  let maxX = Math.max(...pts.map((p) => p.x));
  let minY = Math.min(...pts.map((p) => p.y));
  let maxY = Math.max(...pts.map((p) => p.y));

  if (shape.type === "sticky") {
    minX = pts[0].x;
    minY = pts[0].y;
    maxX = pts[0].x + 180;
    maxY = pts[0].y + 140;
  }

  const origW = Math.max(1, maxX - minX);
  const origH = Math.max(1, maxY - minY);
  const origAspect = origW / origH;

  let newMinX = minX;
  let newMaxX = maxX;
  let newMinY = minY;
  let newMaxY = maxY;

  if (handle === "br") {
    newMaxX = pt.x;
    newMaxY = pt.y;
    if (isShiftPressed) {
      const curW = Math.max(1, newMaxX - newMinX);
      const curH = Math.max(1, newMaxY - newMinY);
      const maxDim = Math.max(curW, curH * origAspect);
      newMaxX = newMinX + maxDim;
      newMaxY = newMinY + maxDim / origAspect;
    }
  } else if (handle === "tl") {
    newMinX = pt.x;
    newMinY = pt.y;
    if (isShiftPressed) {
      const curW = Math.max(1, newMaxX - newMinX);
      const curH = Math.max(1, newMaxY - newMinY);
      const maxDim = Math.max(curW, curH * origAspect);
      newMinX = newMaxX - maxDim;
      newMinY = newMaxY - maxDim / origAspect;
    }
  } else if (handle === "tr") {
    newMaxX = pt.x;
    newMinY = pt.y;
    if (isShiftPressed) {
      const curW = Math.max(1, newMaxX - newMinX);
      const curH = Math.max(1, newMaxY - newMinY);
      const maxDim = Math.max(curW, curH * origAspect);
      newMaxX = newMinX + maxDim;
      newMinY = newMaxY - maxDim / origAspect;
    }
  } else if (handle === "bl") {
    newMinX = pt.x;
    newMaxY = pt.y;
    if (isShiftPressed) {
      const curW = Math.max(1, newMaxX - newMinX);
      const curH = Math.max(1, newMaxY - newMinY);
      const maxDim = Math.max(curW, curH * origAspect);
      newMinX = newMaxX - maxDim;
      newMaxY = newMinY + maxDim / origAspect;
    }
  } else if (handle === "tm") {
    newMinY = pt.y;
    if (isShiftPressed) {
      const curH = Math.max(1, newMaxY - newMinY);
      const newW = curH * origAspect;
      const midX = (newMinX + newMaxX) / 2;
      newMinX = midX - newW / 2;
      newMaxX = midX + newW / 2;
    }
  } else if (handle === "bm") {
    newMaxY = pt.y;
    if (isShiftPressed) {
      const curH = Math.max(1, newMaxY - newMinY);
      const newW = curH * origAspect;
      const midX = (newMinX + newMaxX) / 2;
      newMinX = midX - newW / 2;
      newMaxX = midX + newW / 2;
    }
  } else if (handle === "ml") {
    newMinX = pt.x;
    if (isShiftPressed) {
      const curW = Math.max(1, newMaxX - newMinX);
      const newH = curW / origAspect;
      const midY = (newMinY + newMaxY) / 2;
      newMinY = midY - newH / 2;
      newMaxY = midY + newH / 2;
    }
  } else if (handle === "mr") {
    newMaxX = pt.x;
    if (isShiftPressed) {
      const curW = Math.max(1, newMaxX - newMinX);
      const newH = curW / origAspect;
      const midY = (newMinY + newMaxY) / 2;
      newMinY = midY - newH / 2;
      newMaxY = midY + newH / 2;
    }
  }

  const finalMinX = Math.min(newMinX, newMaxX);
  const finalMaxX = Math.max(newMinX, newMaxX);
  const finalMinY = Math.min(newMinY, newMaxY);
  const finalMaxY = Math.max(newMinY, newMaxY);

  if (pts.length === 2) {
    const p0 = {
      x: pts[0].x <= pts[1].x ? finalMinX : finalMaxX,
      y: pts[0].y <= pts[1].y ? finalMinY : finalMaxY,
    };
    const p1 = {
      x: pts[1].x >= pts[0].x ? finalMaxX : finalMinX,
      y: pts[1].y >= pts[0].y ? finalMaxY : finalMinY,
    };
    return { ...shape, points: [p0, p1] };
  }

  if (pts.length > 2) {
    const scaleX = (finalMaxX - finalMinX) / origW;
    const scaleY = (finalMaxY - finalMinY) / origH;
    const newPts = pts.map((p) => ({
      x: finalMinX + (p.x - minX) * scaleX,
      y: finalMinY + (p.y - minY) * scaleY,
    }));
    return { ...shape, points: newPts };
  }

  if (pts.length === 1) {
    return { ...shape, points: [{ x: finalMinX, y: finalMinY }] };
  }

  return shape;
}

/** Renders shapes, sticky notes, and Forex Trading Tools on canvas */
function renderWhiteboardShape(ctx: CanvasRenderingContext2D, shape: Shape, isSelected: boolean = false, defaultRiskReward: number = 3) {
  const pts = shape.points;
  if (pts.length === 0) return;

  ctx.strokeStyle = shape.color;
  ctx.fillStyle = shape.color;
  ctx.lineWidth = shape.strokeWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (shape.lineStyle === "dashed") {
    ctx.setLineDash([8, 6]);
  } else {
    ctx.setLineDash([]);
  }

  if (shape.type === "pencil") {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.stroke();
  } else if (shape.type === "highlighter") {
    ctx.strokeStyle = "rgba(253, 224, 71, 0.45)";
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.stroke();
  } else if (shape.type === "line" && pts.length >= 2) {
    /* STRAIGHT LINE TOOL */
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.stroke();
  } else if (shape.type === "sticky") {
    const p = pts[0];
    const w = 180;
    const h = 140;

    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(p.x + 4, p.y + 4, w, h);

    ctx.fillStyle = shape.stickyColor || "#fef08a";
    ctx.fillRect(p.x, p.y, w, h);
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.strokeRect(p.x, p.y, w, h);

    ctx.fillStyle = "rgba(0,0,0,0.10)";
    ctx.beginPath();
    ctx.moveTo(p.x + w - 16, p.y + h);
    ctx.lineTo(p.x + w, p.y + h - 16);
    ctx.lineTo(p.x + w - 16, p.y + h - 16);
    ctx.fill();

    if (shape.text) {
      const fSize = shape.fontSize || 12;
      const fFamily = shape.fontFamily || "Inter, -apple-system, sans-serif";
      const fWeight = shape.fontWeight || "bold";
      const fStyle = shape.fontStyle || "normal";
      const tAlign = shape.textAlign || "left";
      const lHeight = (shape.lineHeight || 1.3) * fSize;

      ctx.save();
      ctx.fillStyle = shape.textColor || "#1e293b";
      ctx.font = `${fStyle} ${fWeight} ${fSize}px ${fFamily}`;
      ctx.textAlign = tAlign;
      ctx.textBaseline = "top";

      const lines = shape.text.split("\n");
      const textX = tAlign === "center" ? p.x + w / 2 : tAlign === "right" ? p.x + w - 14 : p.x + 14;
      lines.forEach((line, idx) => {
        ctx.fillText(line, textX, p.y + 20 + idx * lHeight, w - 28);
      });
      ctx.restore();
    }
  } else if (shape.type === "fibo" && pts.length >= 2) {
    /* 1. FIBONACCI RETRACEMENT TOOL */
    const x1 = pts[0].x;
    const y1 = pts[0].y;
    const x2 = pts[1].x;
    const y2 = pts[1].y;

    const width = x2 - x1;
    const height = y2 - y1;

    const fibLevels = [
      { ratio: 0.0, label: "0.0% (1.000)", color: "#ef4444" },
      { ratio: 0.236, label: "23.6% (0.236)", color: "#f97316" },
      { ratio: 0.382, label: "38.2% (0.382)", color: "#f59e0b" },
      { ratio: 0.5, label: "50.0% Equilibrium (0.50)", color: "#eab308" },
      { ratio: 0.618, label: "61.8% Golden Pocket (0.618)", color: "#10b981" },
      { ratio: 0.786, label: "78.6% (0.786)", color: "#3b82f6" },
      { ratio: 1.0, label: "100.0% (0.000)", color: "#8b5cf6" },
    ];

    // Shaded Golden Pocket Zone (Between 0.5 and 0.618)
    const y50 = y1 + height * 0.5;
    const y618 = y1 + height * 0.618;
    ctx.fillStyle = "rgba(234, 179, 8, 0.18)";
    ctx.fillRect(Math.min(x1, x2), Math.min(y50, y618), Math.abs(width), Math.abs(y618 - y50));

    // Draw level lines & subtle micro-percentage labels
    fibLevels.forEach((lvl) => {
      const ly = y1 + height * lvl.ratio;
      ctx.strokeStyle = lvl.color;
      ctx.lineWidth = lvl.ratio === 0.618 || lvl.ratio === 0.5 ? 2 : 1;
      ctx.setLineDash(lvl.ratio === 0.5 ? [4, 4] : []);
      ctx.beginPath();
      ctx.moveTo(x1, ly);
      ctx.lineTo(x2, ly);
      ctx.stroke();

      ctx.fillStyle = lvl.color;
      ctx.font = "bold 8.5px Inter, -apple-system, sans-serif";
      ctx.fillText(lvl.label.split(" ")[0], Math.max(x1, x2) + 6, ly + 3);
    });
  } else if (shape.type === "long" && pts.length >= 2) {
    /* 2. LONG POSITION CALCULATOR TOOL */
    const x1 = pts[0].x;
    const yEntry = pts[0].y;
    const x2 = pts[1].x;
    const yExt = pts[1].y;

    const minX = Math.min(x1, x2);
    const boxW = Math.abs(x2 - x1) || 160;

    const targetHeight = Math.abs(yExt - yEntry) || 80;
    const stopHeight = targetHeight / defaultRiskReward;

    // Target Green Box (Top)
    ctx.fillStyle = "rgba(16, 185, 129, 0.22)";
    ctx.fillRect(minX, yEntry - targetHeight, boxW, targetHeight);
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(minX, yEntry - targetHeight, boxW, targetHeight);

    // Stop Loss Red Box (Bottom)
    ctx.fillStyle = "rgba(239, 68, 68, 0.22)";
    ctx.fillRect(minX, yEntry, boxW, stopHeight);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(minX, yEntry, boxW, stopHeight);

    // Entry Line (Center)
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(minX, yEntry);
    ctx.lineTo(minX + boxW, yEntry);
    ctx.stroke();

    // TradingView Micro-Label
    const labelText = shape.text !== undefined ? shape.text : `1:${defaultRiskReward.toFixed(1)}`;
    if (labelText) {
      ctx.fillStyle = "#10b981";
      ctx.font = "bold 8.5px Inter, -apple-system, sans-serif";
      ctx.fillText(labelText, minX + 6, yEntry - 5);
    }
  } else if (shape.type === "short" && pts.length >= 2) {
    /* 3. SHORT POSITION CALCULATOR TOOL */
    const x1 = pts[0].x;
    const yEntry = pts[0].y;
    const x2 = pts[1].x;
    const yExt = pts[1].y;

    const minX = Math.min(x1, x2);
    const boxW = Math.abs(x2 - x1) || 160;

    const targetHeight = Math.abs(yExt - yEntry) || 80;
    const stopHeight = targetHeight / defaultRiskReward;

    // Stop Loss Red Box (Top)
    ctx.fillStyle = "rgba(239, 68, 68, 0.22)";
    ctx.fillRect(minX, yEntry - stopHeight, boxW, stopHeight);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(minX, yEntry - stopHeight, boxW, stopHeight);

    // Target Green Box (Bottom)
    ctx.fillStyle = "rgba(16, 185, 129, 0.22)";
    ctx.fillRect(minX, yEntry, boxW, targetHeight);
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(minX, yEntry, boxW, targetHeight);

    // Entry Line (Center)
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(minX, yEntry);
    ctx.lineTo(minX + boxW, yEntry);
    ctx.stroke();

    // TradingView Micro-Label
    const labelText = shape.text !== undefined ? shape.text : `1:${defaultRiskReward.toFixed(1)}`;
    if (labelText) {
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 8.5px Inter, -apple-system, sans-serif";
      ctx.fillText(labelText, minX + 6, yEntry - 5);
    }
  } else if (shape.type === "orderblock" && pts.length >= 2) {
    /* 4. ORDER BLOCK / POI ZONE */
    const minX = Math.min(pts[0].x, pts[1].x);
    const minY = Math.min(pts[0].y, pts[1].y);
    const boxW = Math.abs(pts[1].x - pts[0].x) || 160;
    const boxH = Math.abs(pts[1].y - pts[0].y) || 60;
    const midY = minY + boxH / 2;
    const strokeCol = shape.strokeColor || shape.color || "#8b5cf6";
    const fillCol = shape.fillColor || strokeCol;
    const fillStyle = shape.fillStyle || "translucent";
    const rad = shape.cornerRadius || 4;

    if (fillStyle !== "none") {
      const alpha = shape.opacity !== undefined ? shape.opacity : fillStyle === "solid" ? 1 : 0.22;
      ctx.globalAlpha = alpha;
      if (fillStyle === "gradient" && shape.gradientEndColor) {
        const grad = ctx.createLinearGradient(minX, minY, minX + boxW, minY + boxH);
        grad.addColorStop(0, fillCol);
        grad.addColorStop(1, shape.gradientEndColor);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = fillCol;
      }
      if (typeof (ctx as any).roundRect === "function") {
        ctx.beginPath();
        (ctx as any).roundRect(minX, minY, boxW, boxH, rad);
        ctx.fill();
      } else {
        ctx.fillRect(minX, minY, boxW, boxH);
      }
      ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = shape.strokeWidth || 1.5;
    if (typeof (ctx as any).roundRect === "function") {
      ctx.beginPath();
      (ctx as any).roundRect(minX, minY, boxW, boxH, rad);
      ctx.stroke();
    } else {
      ctx.strokeRect(minX, minY, boxW, boxH);
    }

    // 50% Mean Threshold line
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(minX, midY);
    ctx.lineTo(minX + boxW, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    // TradingView Micro-Label
    const labelText = shape.text !== undefined ? shape.text : "OB";
    if (labelText) {
      ctx.fillStyle = strokeCol;
      ctx.font = "bold 8.5px Inter, -apple-system, sans-serif";
      ctx.fillText(labelText, minX + 6, minY + 11);
    }
  } else if (shape.type === "fvg" && pts.length >= 2) {
    /* 5. FAIR VALUE GAP (FVG / IMBALANCE) */
    const minX = Math.min(pts[0].x, pts[1].x);
    const minY = Math.min(pts[0].y, pts[1].y);
    const boxW = Math.abs(pts[1].x - pts[0].x) || 160;
    const boxH = Math.abs(pts[1].y - pts[0].y) || 60;
    const midY = minY + boxH / 2;
    const strokeCol = shape.strokeColor || shape.color || "#f59e0b";
    const fillCol = shape.fillColor || strokeCol;
    const fillStyle = shape.fillStyle || "translucent";
    const rad = shape.cornerRadius || 4;

    if (fillStyle !== "none") {
      const alpha = shape.opacity !== undefined ? shape.opacity : fillStyle === "solid" ? 1 : 0.22;
      ctx.globalAlpha = alpha;
      if (fillStyle === "gradient" && shape.gradientEndColor) {
        const grad = ctx.createLinearGradient(minX, minY, minX + boxW, minY + boxH);
        grad.addColorStop(0, fillCol);
        grad.addColorStop(1, shape.gradientEndColor);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = fillCol;
      }
      if (typeof (ctx as any).roundRect === "function") {
        ctx.beginPath();
        (ctx as any).roundRect(minX, minY, boxW, boxH, rad);
        ctx.fill();
      } else {
        ctx.fillRect(minX, minY, boxW, boxH);
      }
      ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = shape.strokeWidth || 1.5;
    if (typeof (ctx as any).roundRect === "function") {
      ctx.beginPath();
      (ctx as any).roundRect(minX, minY, boxW, boxH, rad);
      ctx.stroke();
    } else {
      ctx.strokeRect(minX, minY, boxW, boxH);
    }

    // 50% Consequent Encroachment (C.E.) line
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(minX, midY);
    ctx.lineTo(minX + boxW, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    // TradingView Micro-Label
    const labelText = shape.text !== undefined ? shape.text : "FVG";
    if (labelText) {
      ctx.fillStyle = strokeCol;
      ctx.font = "bold 8.5px Inter, -apple-system, sans-serif";
      ctx.fillText(labelText, minX + 6, minY + 11);
    }
  } else if (shape.type === "bos" && pts.length >= 2) {
    /* 6. BREAK OF STRUCTURE (BOS / CHoCH) */
    const p1 = pts[0];
    const p2 = pts[1];

    ctx.strokeStyle = shape.strokeColor || shape.color || "#3b82f6";
    ctx.lineWidth = shape.strokeWidth || 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // TradingView Micro-Label
    const labelText = shape.text !== undefined ? shape.text : "BOS";
    if (labelText) {
      ctx.fillStyle = shape.strokeColor || shape.color || "#3b82f6";
      ctx.font = "bold 8px Inter, -apple-system, sans-serif";
      ctx.fillText(labelText, (p1.x + p2.x) / 2 + 4, (p1.y + p2.y) / 2 - 4);
    }
  } else if (shape.type === "liquidity" && pts.length >= 2) {
    /* 7. LIQUIDITY POOL ($$$ / SWEEP TARGET) */
    const p1 = pts[0];
    const p2 = pts[1];

    ctx.strokeStyle = shape.strokeColor || shape.color || "#e11d48";
    ctx.lineWidth = shape.strokeWidth || 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // TradingView Micro-Label
    const labelText = shape.text !== undefined ? shape.text : "$$$";
    if (labelText) {
      const minX = Math.min(p1.x, p2.x);
      ctx.fillStyle = shape.strokeColor || shape.color || "#e11d48";
      ctx.font = "bold 8.5px Inter, -apple-system, sans-serif";
      ctx.fillText(labelText, minX + 6, Math.min(p1.y, p2.y) - 4);
    }
  } else if (shape.type === "bullish_candle" && pts.length >= 2) {
    /* 8. BULLISH CANDLESTICK TOOL (WITH ADJUSTABLE WICKS & FILLS) */
    const x1 = pts[0].x;
    const y1 = pts[0].y;
    const x2 = pts[1].x;
    const y2 = pts[1].y;

    const yHigh = Math.min(y1, y2);
    const yLow = Math.max(y1, y2);
    const totalH = Math.max(16, yLow - yHigh);
    const bodyW = Math.max(14, Math.abs(x2 - x1) || 22);
    const centerX = pts.length === 2 && Math.abs(x2 - x1) > 5 ? Math.min(x1, x2) + bodyW / 2 : x1;
    const bodyX = centerX - bodyW / 2;

    const candleColor = shape.color || "#10b981";
    const wickColor = shape.wickColor || candleColor;
    const bodyFillColor = shape.fillColor || candleColor;
    const strokeW = shape.strokeWidth || 1.75;
    const style = shape.fillStyle || (shape.candleStyle === "hollow" ? "none" : shape.candleStyle === "solid" ? "solid" : "translucent");

    // Dynamic Upper & Lower Wick Adjustments
    let upperWickH = shape.upperWickLength !== undefined ? shape.upperWickLength : Math.round(totalH * 0.19);
    let lowerWickH = shape.lowerWickLength !== undefined ? shape.lowerWickLength : Math.round(totalH * 0.19);

    if (upperWickH + lowerWickH > totalH - 6) {
      const ratio = (totalH - 6) / Math.max(1, upperWickH + lowerWickH);
      upperWickH = Math.round(upperWickH * ratio);
      lowerWickH = Math.round(lowerWickH * ratio);
    }

    const bodyH = Math.max(6, totalH - upperWickH - lowerWickH);
    const bodyY = yHigh + upperWickH;

    // 1. Upper Wick: High down to Top of Body (Close)
    if (upperWickH > 0) {
      ctx.strokeStyle = wickColor;
      ctx.lineWidth = strokeW;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(centerX, yHigh);
      ctx.lineTo(centerX, bodyY);
      ctx.stroke();
    }

    // 2. Lower Wick: Bottom of Body (Open) down to Low
    if (lowerWickH > 0) {
      ctx.strokeStyle = wickColor;
      ctx.lineWidth = strokeW;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(centerX, bodyY + bodyH);
      ctx.lineTo(centerX, yLow);
      ctx.stroke();
    }

    // 3. Candle Body
    if (style !== "none") {
      const alpha = shape.opacity !== undefined ? shape.opacity : style === "solid" ? 1 : 0.35;
      ctx.globalAlpha = alpha;
      if (style === "gradient" && shape.gradientEndColor) {
        const grad = ctx.createLinearGradient(bodyX, bodyY, bodyX, bodyY + bodyH);
        grad.addColorStop(0, bodyFillColor);
        grad.addColorStop(1, shape.gradientEndColor);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = bodyFillColor;
      }
      ctx.fillRect(bodyX, bodyY, bodyW, bodyH);
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = candleColor;
    ctx.lineWidth = strokeW;
    ctx.strokeRect(bodyX, bodyY, bodyW, bodyH);

    // Optional Micro-Label
    if (shape.text) {
      ctx.fillStyle = candleColor;
      ctx.font = "bold 8.5px Inter, -apple-system, sans-serif";
      ctx.fillText(shape.text, bodyX + bodyW + 4, bodyY + 10);
    }
  } else if (shape.type === "bearish_candle" && pts.length >= 2) {
    /* 9. BEARISH CANDLESTICK TOOL (WITH ADJUSTABLE WICKS & FILLS) */
    const x1 = pts[0].x;
    const y1 = pts[0].y;
    const x2 = pts[1].x;
    const y2 = pts[1].y;

    const yHigh = Math.min(y1, y2);
    const yLow = Math.max(y1, y2);
    const totalH = Math.max(16, yLow - yHigh);
    const bodyW = Math.max(14, Math.abs(x2 - x1) || 22);
    const centerX = pts.length === 2 && Math.abs(x2 - x1) > 5 ? Math.min(x1, x2) + bodyW / 2 : x1;
    const bodyX = centerX - bodyW / 2;

    const candleColor = shape.color || "#ef4444";
    const wickColor = shape.wickColor || candleColor;
    const bodyFillColor = shape.fillColor || candleColor;
    const strokeW = shape.strokeWidth || 1.75;
    const style = shape.fillStyle || (shape.candleStyle === "hollow" ? "none" : shape.candleStyle === "solid" ? "solid" : "translucent");

    // Dynamic Upper & Lower Wick Adjustments
    let upperWickH = shape.upperWickLength !== undefined ? shape.upperWickLength : Math.round(totalH * 0.19);
    let lowerWickH = shape.lowerWickLength !== undefined ? shape.lowerWickLength : Math.round(totalH * 0.19);

    if (upperWickH + lowerWickH > totalH - 6) {
      const ratio = (totalH - 6) / Math.max(1, upperWickH + lowerWickH);
      upperWickH = Math.round(upperWickH * ratio);
      lowerWickH = Math.round(lowerWickH * ratio);
    }

    const bodyH = Math.max(6, totalH - upperWickH - lowerWickH);
    const bodyY = yHigh + upperWickH;

    // 1. Upper Wick: High down to Top of Body (Open)
    if (upperWickH > 0) {
      ctx.strokeStyle = wickColor;
      ctx.lineWidth = strokeW;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(centerX, yHigh);
      ctx.lineTo(centerX, bodyY);
      ctx.stroke();
    }

    // 2. Lower Wick: Bottom of Body (Close) down to Low
    if (lowerWickH > 0) {
      ctx.strokeStyle = wickColor;
      ctx.lineWidth = strokeW;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(centerX, bodyY + bodyH);
      ctx.lineTo(centerX, yLow);
      ctx.stroke();
    }

    // 3. Candle Body
    if (style !== "none") {
      const alpha = shape.opacity !== undefined ? shape.opacity : style === "solid" ? 1 : 0.35;
      ctx.globalAlpha = alpha;
      if (style === "gradient" && shape.gradientEndColor) {
        const grad = ctx.createLinearGradient(bodyX, bodyY, bodyX, bodyY + bodyH);
        grad.addColorStop(0, bodyFillColor);
        grad.addColorStop(1, shape.gradientEndColor);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = bodyFillColor;
      }
      ctx.fillRect(bodyX, bodyY, bodyW, bodyH);
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = candleColor;
    ctx.lineWidth = strokeW;
    ctx.strokeRect(bodyX, bodyY, bodyW, bodyH);

    // Optional Micro-Label
    if (shape.text) {
      ctx.fillStyle = candleColor;
      ctx.font = "bold 8.5px Inter, -apple-system, sans-serif";
      ctx.fillText(shape.text, bodyX + bodyW + 4, bodyY + 10);
    }
  } else if (shape.type === "bezier" && pts.length >= 2) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.stroke();

    pts.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  } else if (shape.type === "rectangle" && pts.length >= 2) {
    const rx = Math.min(pts[0].x, pts[1].x);
    const ry = Math.min(pts[0].y, pts[1].y);
    const rw = Math.abs(pts[1].x - pts[0].x);
    const rh = Math.abs(pts[1].y - pts[0].y);
    const fillStyle = shape.fillStyle || "translucent";
    const fillCol = shape.fillColor || shape.color;
    const strokeCol = shape.strokeColor || shape.color;
    const rad = shape.cornerRadius || 0;

    if (fillStyle !== "none") {
      const alpha = shape.opacity !== undefined ? shape.opacity : fillStyle === "solid" ? 1 : 0.15;
      ctx.globalAlpha = alpha;
      if (fillStyle === "gradient" && shape.gradientEndColor) {
        const grad = ctx.createLinearGradient(rx, ry, rx + rw, ry + rh);
        grad.addColorStop(0, fillCol);
        grad.addColorStop(1, shape.gradientEndColor);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = fillCol;
      }
      if (rad > 0 && typeof (ctx as any).roundRect === "function") {
        ctx.beginPath();
        (ctx as any).roundRect(rx, ry, rw, rh, rad);
        ctx.fill();
      } else {
        ctx.fillRect(rx, ry, rw, rh);
      }
      ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = shape.strokeWidth || 2;
    if (rad > 0 && typeof (ctx as any).roundRect === "function") {
      ctx.beginPath();
      (ctx as any).roundRect(rx, ry, rw, rh, rad);
      ctx.stroke();
    } else {
      ctx.strokeRect(rx, ry, rw, rh);
    }
  } else if (shape.type === "circle" && pts.length >= 2) {
    const r = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
    const fillStyle = shape.fillStyle || "translucent";
    const fillCol = shape.fillColor || shape.color;
    const strokeCol = shape.strokeColor || shape.color;

    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, r, 0, Math.PI * 2);
    if (fillStyle !== "none") {
      const alpha = shape.opacity !== undefined ? shape.opacity : fillStyle === "solid" ? 1 : 0.15;
      ctx.globalAlpha = alpha;
      if (fillStyle === "gradient" && shape.gradientEndColor) {
        const grad = ctx.createRadialGradient(pts[0].x, pts[0].y, 0, pts[0].x, pts[0].y, r);
        grad.addColorStop(0, fillCol);
        grad.addColorStop(1, shape.gradientEndColor);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = fillCol;
      }
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = shape.strokeWidth || 2;
    ctx.stroke();
  } else if (shape.type === "diamond" && pts.length >= 2) {
    const cx = (pts[0].x + pts[1].x) / 2;
    const cy = (pts[0].y + pts[1].y) / 2;
    const rx = Math.abs(pts[1].x - pts[0].x) / 2;
    const ry = Math.abs(pts[1].y - pts[0].y) / 2;
    const fillStyle = shape.fillStyle || "translucent";
    const fillCol = shape.fillColor || shape.color;
    const strokeCol = shape.strokeColor || shape.color;

    ctx.beginPath();
    ctx.moveTo(cx, cy - ry);
    ctx.lineTo(cx + rx, cy);
    ctx.lineTo(cx, cy + ry);
    ctx.lineTo(cx - rx, cy);
    ctx.closePath();

    if (fillStyle !== "none") {
      const alpha = shape.opacity !== undefined ? shape.opacity : fillStyle === "solid" ? 1 : 0.15;
      ctx.globalAlpha = alpha;
      if (fillStyle === "gradient" && shape.gradientEndColor) {
        const grad = ctx.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry);
        grad.addColorStop(0, fillCol);
        grad.addColorStop(1, shape.gradientEndColor);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = fillCol;
      }
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = shape.strokeWidth || 2;
    ctx.stroke();
  } else if (shape.type === "arrow" && pts.length >= 2) {
    const from = pts[0];
    const to = pts[1];
    const headlen = 12;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - headlen * Math.cos(angle - Math.PI / 6), to.y - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(to.x - headlen * Math.cos(angle + Math.PI / 6), to.y - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  } else if (shape.type === "text" && shape.text) {
    const fSize = shape.fontSize || 16;
    const fFamily = shape.fontFamily || "Inter, -apple-system, sans-serif";
    const fWeight = shape.fontWeight || "bold";
    const fStyle = shape.fontStyle || "normal";
    const tAlign = shape.textAlign || "left";
    const tTransform = shape.textTransform || "none";
    const lHeight = (shape.lineHeight || 1.3) * fSize;

    ctx.save();
    ctx.font = `${fStyle} ${fWeight} ${fSize}px ${fFamily}`;
    ctx.textAlign = tAlign;
    ctx.textBaseline = "top";
    ctx.fillStyle = shape.textColor || shape.color || "#1e293b";

    let rawText = shape.text;
    if (tTransform === "uppercase") rawText = rawText.toUpperCase();
    else if (tTransform === "lowercase") rawText = rawText.toLowerCase();
    else if (tTransform === "capitalize") {
      rawText = rawText.replace(/\b\w/g, (c) => c.toUpperCase());
    }

    const lines = rawText.split("\n");
    const startX = pts[0].x;
    const startY = pts[0].y;

    lines.forEach((line, idx) => {
      const lineY = startY + idx * lHeight;
      ctx.fillText(line, startX, lineY);

      if (shape.textDecoration === "underline") {
        const met = ctx.measureText(line);
        const uX = tAlign === "center" ? startX - met.width / 2 : tAlign === "right" ? startX - met.width : startX;
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = Math.max(1, fSize / 14);
        ctx.beginPath();
        ctx.moveTo(uX, lineY + fSize + 2);
        ctx.lineTo(uX + met.width, lineY + fSize + 2);
        ctx.stroke();
      } else if (shape.textDecoration === "line-through") {
        const met = ctx.measureText(line);
        const uX = tAlign === "center" ? startX - met.width / 2 : tAlign === "right" ? startX - met.width : startX;
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = Math.max(1, fSize / 14);
        ctx.beginPath();
        ctx.moveTo(uX, lineY + fSize / 2 + 1);
        ctx.lineTo(uX + met.width, lineY + fSize / 2 + 1);
        ctx.stroke();
      }
    });
    ctx.restore();
  } else if (shape.type === "annotation" && pts.length >= 2) {
    /* ANNOTATION / CALLOUT LEADER LINE TOOL */
    const p0 = pts[0]; // Target Anchor Point on object
    const p1 = pts[1]; // Annotation Callout Badge Position

    const strokeCol = shape.color || "#3b82f6";
    const strokeW = shape.strokeWidth || 2;

    // 1. Target Pin Anchor (Circle dot on the annotated chart element)
    ctx.fillStyle = strokeCol;
    ctx.beginPath();
    ctx.arc(p0.x, p0.y, 4, 0, Math.PI * 2);
    ctx.fill();

    // 2. Leader Line connecting object to callout label
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = strokeW;
    if (shape.lineStyle === "dashed") {
      ctx.setLineDash([5, 4]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Callout Text Badge / Pill
    const textStr = shape.text || "Annotation";
    ctx.font = "bold 11px Inter, -apple-system, sans-serif";
    const textMetrics = ctx.measureText(textStr);
    const badgePadX = 9;
    const badgeW = Math.max(50, textMetrics.width + badgePadX * 2);
    const badgeH = 22;

    const isRight = p1.x >= p0.x;
    const badgeX = isRight ? p1.x : p1.x - badgeW;
    const badgeY = p1.y - badgeH / 2;

    // Callout Box (Clean White Pill Badge with colored border)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(badgeX, badgeY, badgeW, badgeH);

    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);

    // Callout Label Text
    ctx.fillStyle = strokeCol;
    ctx.fillText(textStr, badgeX + badgePadX, badgeY + 15);
  }

  ctx.setLineDash([]);

  // Render Selection Highlight Box & Interactive 4 Corner Resize Nodes
  if (isSelected) {
    let minX = Math.min(...pts.map((p) => p.x));
    let maxX = Math.max(...pts.map((p) => p.x));
    let minY = Math.min(...pts.map((p) => p.y));
    let maxY = Math.max(...pts.map((p) => p.y));

    if (shape.type === "sticky") {
      minX = pts[0].x;
      minY = pts[0].y;
      maxX = pts[0].x + 180;
      maxY = pts[0].y + 140;
    }

    const pad = 6;
    ctx.strokeStyle = shape.isLocked ? "#f59e0b" : "#3b82f6";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(minX - pad, minY - pad, maxX - minX + pad * 2, maxY - minY + pad * 2);
    ctx.setLineDash([]);

    // Resize Handle Nodes (4 corners + 4 center edge handles, only if NOT locked)
    if (!shape.isLocked) {
      const midX = (minX + maxX) / 2;
      const midY = (minY + maxY) / 2;
      const handles = [
        { x: minX - pad, y: minY - pad }, // Top-Left
        { x: midX, y: minY - pad },        // Top-Center
        { x: maxX + pad, y: minY - pad }, // Top-Right
        { x: maxX + pad, y: midY },        // Right-Center
        { x: maxX + pad, y: maxY + pad }, // Bottom-Right
        { x: midX, y: maxY + pad },        // Bottom-Center
        { x: minX - pad, y: maxY + pad }, // Bottom-Left
        { x: minX - pad, y: midY },        // Left-Center
      ];
      handles.forEach((c) => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(c.x - 4.5, c.y - 4.5, 9, 9);
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 1.75;
        ctx.strokeRect(c.x - 4.5, c.y - 4.5, 9, 9);
      });
    }
  }
}

function makeSvgCursor(svg: string, x: number, y: number, fallback: string = "crosshair"): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${x} ${y}, ${fallback}`;
}

/** Generates dynamic contextual realistic minimalist Black & White mouse cursors for active whiteboard tools */
function getToolCursorStyle(tool: Tool, hoveredHandle?: ResizeHandle | null): React.CSSProperties {
  if (hoveredHandle) {
    if (hoveredHandle === "tl" || hoveredHandle === "br") {
      return { cursor: "nwse-resize" };
    }
    if (hoveredHandle === "tr" || hoveredHandle === "bl") {
      return { cursor: "nesw-resize" };
    }
    if (hoveredHandle === "tm" || hoveredHandle === "bm") {
      return { cursor: "ns-resize" };
    }
    if (hoveredHandle === "ml" || hoveredHandle === "mr") {
      return { cursor: "ew-resize" };
    }
  }

  switch (tool) {
    case "hand":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M10 12V4C10 3.45 10.45 3 11 3C11.55 3 12 3.45 12 4V11M12 5.5C12 4.95 12.45 4.5 13 4.5C13.55 4.5 14 4.95 14 5.5V11M14 7C14 6.45 14.45 6 15 6C15.55 6 16 6.45 16 7V12.5C16 16.5 13.5 20 9.5 20C6.5 20 4.5 18 3.5 15L2.5 12.5C2.2 11.8 2.5 11 3.2 10.8C3.9 10.5 4.7 10.8 5 11.5L6.5 14V4C6.5 3.45 6.95 3 7.5 3C8.05 3 8.5 3.45 8.5 4V12" fill="#ffffff" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`,
          10,
          10,
          "grab"
        ),
      };
    case "select":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4.5 2.5V18.5L8.2 14.8L11.8 21.5L14.2 20.2L10.5 13.5L15.8 13.5L4.5 2.5Z" fill="#000000" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>`,
          2,
          2,
          "default"
        ),
      };
    case "zoom":
    case "marquee_zoom":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="9.5" cy="9.5" r="6" fill="#ffffff" stroke="#000000" stroke-width="1.8"/>
            <path d="M14 14L20.5 20.5" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M9.5 7V12M7 9.5H12" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
          </svg>`,
          9,
          9,
          "zoom-in"
        ),
      };
    case "text":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M7 4H17M12 4V20M7 20H17" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
            <path d="M7 4H17M12 4V20M7 20H17" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
          </svg>`,
          12,
          12,
          "text"
        ),
      };
    case "eraser":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M7 21L2.5 16.5C1.8 15.8 1.8 14.7 2.5 14L13 3.5C13.7 2.8 14.8 2.8 15.5 3.5L20.5 8.5C21.2 9.2 21.2 10.3 20.5 11L11 21.5Z" fill="#ffffff" stroke="#000000" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M6 17.5L16 7.5" stroke="#000000" stroke-width="1.2"/>
            <path d="M11 21.5L20.5 11" stroke="#000000" stroke-width="1.5"/>
            <path d="M2 23H14" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
          </svg>`,
          3,
          21,
          "pointer"
        ),
      };
    case "pencil":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19.5 2.5L21.5 4.5L8 18L3.5 19.5L5 15L18.5 1.5L19.5 2.5Z" fill="#000000" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round"/>
            <path d="M2 22L5 18L4 17L2 22Z" fill="#ffffff" stroke="#000000" stroke-width="0.8"/>
            <circle cx="2" cy="22" r="0.8" fill="#000000"/>
            <path d="M15 3.5L18.5 7" stroke="#ffffff" stroke-width="1"/>
          </svg>`,
          2,
          22,
          "crosshair"
        ),
      };
    case "highlighter":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 13L3 19L2 22L5 21L11 15Z" fill="#ffffff" stroke="#000000" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M9 13L15 7L20 12L14 18Z" fill="#000000" stroke="#ffffff" stroke-width="1.2"/>
            <line x1="2" y1="22" x2="5" y2="21" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
          </svg>`,
          2,
          22,
          "crosshair"
        ),
      };
    case "sticky":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
            <path d="M15 21L21 15H15V21Z" fill="#000000"/>
            <line x1="7" y1="7" x2="13" y2="7" stroke="#000000" stroke-width="1.2" stroke-linecap="round"/>
            <line x1="7" y1="10.5" x2="17" y2="10.5" stroke="#000000" stroke-width="1.2" stroke-linecap="round"/>
            <line x1="7" y1="14" x2="13" y2="14" stroke="#000000" stroke-width="1.2" stroke-linecap="round"/>
          </svg>`,
          4,
          4,
          "copy"
        ),
      };
    case "rectangle":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="1.5" fill="#000000" stroke="#ffffff" stroke-width="0.8"/>
            <path d="M12 2V7M12 17V22M2 12H7M17 12H22" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
            <rect x="15" y="15" width="7" height="6" fill="#ffffff" stroke="#000000" stroke-width="1.2" rx="0.5"/>
          </svg>`,
          12,
          12,
          "crosshair"
        ),
      };
    case "circle":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="1.5" fill="#000000" stroke="#ffffff" stroke-width="0.8"/>
            <path d="M12 2V7M12 17V22M2 12H7M17 12H22" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="18" cy="18" r="3.5" fill="#ffffff" stroke="#000000" stroke-width="1.2"/>
          </svg>`,
          12,
          12,
          "crosshair"
        ),
      };
    case "diamond":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="1.5" fill="#000000" stroke="#ffffff" stroke-width="0.8"/>
            <path d="M12 2V7M12 17V22M2 12H7M17 12H22" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
            <polygon points="18,14 22,18 18,22 14,18" fill="#ffffff" stroke="#000000" stroke-width="1.2"/>
          </svg>`,
          12,
          12,
          "crosshair"
        ),
      };
    case "arrow":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="1.5" fill="#000000" stroke="#ffffff" stroke-width="0.8"/>
            <path d="M12 2V7M12 17V22M2 12H7M17 12H22" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M15 9L21 3M21 3H16M21 3V8" stroke="#000000" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`,
          12,
          12,
          "crosshair"
        ),
      };
    case "line":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="1.5" fill="#000000" stroke="#ffffff" stroke-width="0.8"/>
            <path d="M12 2V7M12 17V22M2 12H7M17 12H22" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="16" y1="8" x2="21" y2="3" stroke="#000000" stroke-width="1.3" stroke-linecap="round"/>
          </svg>`,
          12,
          12,
          "crosshair"
        ),
      };
    case "bezier":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="1.5" fill="#000000" stroke="#ffffff" stroke-width="0.8"/>
            <path d="M12 2V7M12 17V22M2 12H7M17 12H22" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M14 6C17 6 18 10 21 10" stroke="#000000" stroke-width="1.3" stroke-linecap="round"/>
            <circle cx="14" cy="6" r="1" fill="#000000"/>
            <circle cx="21" cy="10" r="1" fill="#000000"/>
          </svg>`,
          12,
          12,
          "crosshair"
        ),
      };
    case "fibo":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="1.5" fill="#000000" stroke="#ffffff" stroke-width="0.8"/>
            <path d="M12 2V7M12 17V22M2 12H7M17 12H22" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M15 5H22M15 8H22M15 11H22" stroke="#000000" stroke-width="1" stroke-linecap="round"/>
          </svg>`,
          12,
          12,
          "crosshair"
        ),
      };
    case "long":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="1.5" fill="#000000" stroke="#ffffff" stroke-width="0.8"/>
            <path d="M12 2V7M12 17V22M2 12H7M17 12H22" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
            <rect x="15" y="4" width="7" height="6" fill="#000000" rx="0.5"/>
            <rect x="15" y="10" width="7" height="4" fill="#ffffff" stroke="#000000" stroke-width="1" rx="0.5"/>
            <path d="M18.5 8.5V5.5M17 7L18.5 5.5L20 7" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`,
          12,
          12,
          "crosshair"
        ),
      };
    case "short":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="1.5" fill="#000000" stroke="#ffffff" stroke-width="0.8"/>
            <path d="M12 2V7M12 17V22M2 12H7M17 12H22" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
            <rect x="15" y="4" width="7" height="4" fill="#ffffff" stroke="#000000" stroke-width="1" rx="0.5"/>
            <rect x="15" y="8" width="7" height="6" fill="#000000" rx="0.5"/>
            <path d="M18.5 9.5V12.5M17 11L18.5 12.5L20 11" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`,
          12,
          12,
          "crosshair"
        ),
      };
    case "orderblock":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="1.5" fill="#000000" stroke="#ffffff" stroke-width="0.8"/>
            <path d="M12 2V7M12 17V22M2 12H7M17 12H22" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
            <rect x="14" y="4" width="8" height="6" fill="#000000" stroke="#ffffff" stroke-width="0.8" rx="0.5"/>
            <line x1="14" y1="7" x2="22" y2="7" stroke="#ffffff" stroke-width="0.6" stroke-dasharray="1 1"/>
          </svg>`,
          12,
          12,
          "crosshair"
        ),
      };
    case "fvg":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="1.5" fill="#000000" stroke="#ffffff" stroke-width="0.8"/>
            <path d="M12 2V7M12 17V22M2 12H7M17 12H22" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
            <rect x="14" y="6" width="2" height="4" fill="#000000"/>
            <line x1="15" y1="4" x2="15" y2="12" stroke="#000000" stroke-width="0.7"/>
            <rect x="17" y="4" width="2.5" height="7" fill="#000000"/>
            <line x1="18.25" y1="2" x2="18.25" y2="13" stroke="#000000" stroke-width="0.7"/>
            <rect x="20.5" y="7" width="2" height="4" fill="#000000"/>
            <line x1="21.5" y1="5" x2="21.5" y2="12" stroke="#000000" stroke-width="0.7"/>
          </svg>`,
          12,
          12,
          "crosshair"
        ),
      };
    case "bos":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="1.5" fill="#000000" stroke="#ffffff" stroke-width="0.8"/>
            <path d="M12 2V7M12 17V22M2 12H7M17 12H22" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="15" y1="8" x2="22" y2="8" stroke="#000000" stroke-width="0.8" stroke-dasharray="1.5 1.5"/>
            <path d="M14 11L17 8L19 10L22 5" stroke="#000000" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20 5H22V7" stroke="#000000" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`,
          12,
          12,
          "crosshair"
        ),
      };
    case "liquidity":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="1.5" fill="#000000" stroke="#ffffff" stroke-width="0.8"/>
            <path d="M12 2V7M12 17V22M2 12H7M17 12H22" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="18" cy="7" r="3.5" stroke="#000000" stroke-width="1"/>
            <circle cx="18" cy="7" r="1" fill="#000000"/>
          </svg>`,
          12,
          12,
          "crosshair"
        ),
      };
    case "bullish_candle":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="1.5" fill="#000000" stroke="#ffffff" stroke-width="0.8"/>
            <path d="M12 2V7M12 17V22M2 12H7M17 12H22" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="18" y1="3" x2="18" y2="13" stroke="#000000" stroke-width="0.8"/>
            <rect x="16" y="5" width="4" height="6" fill="#10b981" stroke="#000000" stroke-width="0.8" rx="0.5"/>
          </svg>`,
          12,
          12,
          "crosshair"
        ),
      };
    case "bearish_candle":
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="1.5" fill="#000000" stroke="#ffffff" stroke-width="0.8"/>
            <path d="M12 2V7M12 17V22M2 12H7M17 12H22" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="18" y1="3" x2="18" y2="13" stroke="#000000" stroke-width="0.8"/>
            <rect x="16" y="5" width="4" height="6" fill="#ef4444" stroke="#000000" stroke-width="0.8" rx="0.5"/>
          </svg>`,
          12,
          12,
          "crosshair"
        ),
      };
    default:
      return {
        cursor: makeSvgCursor(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="1.5" fill="#000000" stroke="#ffffff" stroke-width="0.8"/>
            <path d="M12 2V7M12 17V22M2 12H7M17 12H22" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
          </svg>`,
          12,
          12,
          "crosshair"
        ),
      };
  }
}
