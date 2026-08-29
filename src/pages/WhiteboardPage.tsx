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
  GraduationCap,
  PlayCircle,
  Lightbulb,
} from "lucide-react";
import { useStore } from "../lib/store";

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
  | "eraser"
  | "zoom"
  | "fibo"
  | "long"
  | "short";

type StickyColor = "#fef08a" | "#fbcfe8" | "#bae6fd" | "#bbf7d0" | "#ddd6fe";

type Shape = {
  id: string;
  type: Tool;
  name?: string;
  color: string;
  strokeWidth: number;
  lineStyle?: "solid" | "dashed";
  points: { x: number; y: number }[];
  text?: string;
  stickyColor?: StickyColor;
  isLocked?: boolean;
  isHidden?: boolean;
};

type DiagramTab = {
  id: string;
  name: string;
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

type ResizeHandle = "tl" | "tr" | "bl" | "br";

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
      { label: "Precision Eraser", keys: ["E"] },
      { label: "Zoom Tool", keys: ["Z"] },
    ],
  },
  {
    category: "Forex & Trading Setups",
    items: [
      { label: "Fibonacci Retracement", keys: ["F"] },
      { label: "Long Position (Risk:Reward)", keys: ["L"] },
      { label: "Short Position (Risk:Reward)", keys: ["S"] },
    ],
  },
  {
    category: "Canvas Navigation & Gestures",
    items: [
      { label: "Pan Across Canvas", keys: ["Space + Drag"] },
      { label: "Zoom In (+15%)", keys: ["+"] },
      { label: "Zoom Out (-15%)", keys: ["-"] },
      { label: "Zoom with Mouse", keys: ["Ctrl", "Wheel"] },
      { label: "Deselect All / Close Menus", keys: ["Esc"] },
      { label: "Open Shortcuts Reference", keys: ["?"] },
    ],
  },
  {
    category: "Object Manipulation & Layers",
    items: [
      { label: "Undo Last Action", keys: ["Ctrl", "Z"] },
      { label: "Redo Last Action", keys: ["Ctrl", "Y"] },
      { label: "Save Diagram Draft", keys: ["Ctrl", "S"] },
      { label: "Select All Objects", keys: ["Ctrl", "A"] },
      { label: "Duplicate Object", keys: ["Ctrl", "D"] },
      { label: "Duplicate with Mouse", keys: ["Alt + Drag"] },
      { label: "Lock / Unlock Object", keys: ["Ctrl", "L"] },
      { label: "Delete Selected", keys: ["Delete"] },
      { label: "Bring Layer Up", keys: ["]"] },
      { label: "Send Layer Down", keys: ["["] },
    ],
  },
];

/* ========================================================================== */
/*                      FIGMA-STYLE WHITEBOARD HUB TYPES & DATA               */
/* ========================================================================== */

interface HubSampleTemplate {
  id: string;
  name: string;
  category: string;
  tag: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  desc: string;
  shapesCount: number;
  previewType: "mindmap" | "smc" | "risk" | "eurusd" | "london";
}

const HUB_SAMPLES: HubSampleTemplate[] = [
  {
    id: "mindmap",
    name: "Forex Basics Mind Map",
    category: "Concept Mind Map",
    tag: "Fundamentals",
    difficulty: "Beginner",
    desc: "A structured conceptual diagram organizing Market Structure, 1% Risk Rules, and Trading Psychology.",
    shapesCount: 3,
    previewType: "mindmap",
  },
  {
    id: "smc",
    name: "SMC Order Block & Liquidity",
    category: "Strategy Setup",
    tag: "Smart Money",
    difficulty: "Intermediate",
    desc: "Institutional order flow model demonstrating Bullish Order Blocks, Liquidity Sweeps, and Entry Confirmation.",
    shapesCount: 4,
    previewType: "smc",
  },
  {
    id: "risk",
    name: "Risk Management Matrix",
    category: "Framework",
    tag: "Risk & Psychology",
    difficulty: "Beginner",
    desc: "Visual matrix detailing minimum 1:3 Risk-to-Reward ratio parameters, position sizing rules, and stop loss placement.",
    shapesCount: 3,
    previewType: "risk",
  },
  {
    id: "class_chart_eurusd",
    name: "EUR/USD H4 BOS & FVG Class Chart",
    category: "Live Class Setup",
    tag: "Technical Analysis",
    difficulty: "Advanced",
    desc: "Full multi-timeframe lesson chart with Candlesticks, H4 Break of Structure (BOS) line, Fair Value Gap (FVG) demand box, and Buy Limit position.",
    shapesCount: 10,
    previewType: "eurusd",
  },
  {
    id: "sample_london_sweep",
    name: "London Asian Sweep Class Setup",
    category: "Live Class Setup",
    tag: "Session Trading",
    difficulty: "Advanced",
    desc: "London open liquidity purge setup featuring Asian Session consolidation box, Judas Swing sweep arrow, and bullish expansion trend.",
    shapesCount: 8,
    previewType: "london",
  },
];

interface HubResourceGuide {
  id: string;
  title: string;
  category: string;
  readTime: string;
  desc: string;
  iconName: "activity" | "palette" | "percent" | "keyboard";
  color: string;
  points: string[];
}

const HUB_RESOURCES: HubResourceGuide[] = [
  {
    id: "patterns",
    title: "Price Action & Classical Chart Patterns",
    category: "Technical Cheatsheet",
    readTime: "3 min read",
    desc: "Essential reversal and continuation patterns including Double Tops/Bottoms, Head & Shoulders, and Bull/Bear Flags.",
    iconName: "activity",
    color: "#3b82f6",
    points: [
      "Double Bottom (W-Pattern): Bullish reversal off key structural support.",
      "Head & Shoulders: Exhaustion pattern marking reversal at high timeframes.",
      "Bull Flag: High-probability continuation impulse following volume breakout.",
      "Break of Structure (BOS): Validated by full candle close beyond previous swing high/low.",
    ],
  },
  {
    id: "smc_guide",
    title: "Smart Money Concepts (SMC) Master Key",
    category: "Strategy Guide",
    readTime: "4 min read",
    desc: "Institutional liquidity playbook explaining Order Blocks, Change of Character, and Imbalances.",
    iconName: "palette",
    color: "#8b5cf6",
    points: [
      "Order Block (OB): The last opposing candle before an aggressive displacement move.",
      "Change of Character (CHoCH): Early warning signal of an impending trend shift.",
      "Fair Value Gap (FVG): Three-candle price imbalance offering high-probability pullback entries.",
      "Liquidity Pools: Clustered stop losses residing above swing highs (BSL) and below swing lows (SSL).",
    ],
  },
  {
    id: "position_sizing",
    title: "Position Sizing & Risk Calculator Formula",
    category: "Math & Risk Guide",
    readTime: "2 min read",
    desc: "Mathematical guide to calculating lot sizes and controlling account drawdown per trade.",
    iconName: "percent",
    color: "#10b981",
    points: [
      "Position Size = (Account Balance × Risk %) / (Stop Loss in Pips × Pip Value)",
      "Standard 1% Rule: Never risk more than 1.0% of total capital on any single setup.",
      "Asymmetric Risk: Minimum 1:3 Risk-to-Reward ratio ensures profitability even with 35% winrate.",
      "Daily Max Drawdown: Cease live trading if daily loss reaches 3.0% to protect psychology.",
    ],
  },
  {
    id: "hotkeys",
    title: "Master Whiteboard Keybindings & Shortcuts",
    category: "Cheat Sheet",
    readTime: "1 min read",
    desc: "Full list of keyboard hotkeys and mouse actions for high-speed technical diagramming.",
    iconName: "keyboard",
    color: "#f59e0b",
    points: [
      "V / 1: Select & Transform | H / 2: Pan Canvas | P / 3: Pen | L / 4: Line | T / 5: Text",
      "Ctrl + Z: Undo | Ctrl + Y: Redo | Ctrl + S: Save Draft | Ctrl + A: Select All",
      "Ctrl + D: Duplicate Object | Alt + Drag: Quick Mouse Clone",
      "Ctrl + L: Lock/Unlock Layer | Delete / Backspace: Remove Selected",
    ],
  },
];

interface HubLessonItem {
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

const HUB_LESSONS: HubLessonItem[] = [
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
  {
    id: "candles",
    num: "07",
    title: "Candlestick Entry Formations",
    subtitle: "High-probability trigger signals",
    desc: "Validate key support and resistance bounces using high-probability candlestick signals: Pin Bars (rejection wicks), Engulfing Candles (momentum displacement), and Morning/Evening Stars.",
    colorClass: "bg-rose-50 text-rose-600",
    badgeBg: "bg-rose-50/60 border-rose-100",
    badgeText: "text-rose-900",
    items: [
      { label: "Pin Bar Rejection", value: "Long wick sweeping liquidity" },
      { label: "Engulfing Candle", value: "Full body overtaking previous candle" },
      { label: "Plot Candlesticks Tool", value: "Press K", isMono: true },
    ]
  },
  {
    id: "layers",
    num: "08",
    title: "Layers, Locking & Z-Index Ordering",
    subtitle: "Pro Photoshop-style layer stacking",
    desc: "Keep complex chart breakdowns clean by locking chart backgrounds and order block rectangles with Ctrl + L. Use the right-hand Layers Inspector to reorder elements, toggle visibility, and adjust layer transparency.",
    colorClass: "bg-teal-50 text-teal-600",
    badgeBg: "bg-teal-50/60 border-teal-100",
    badgeText: "text-teal-900",
    items: [
      { label: "Lock / Unlock Object", value: "Ctrl + L", isMono: true },
      { label: "Bring Layer to Front", value: "Ctrl + ]", isMono: true },
      { label: "Send Layer to Back", value: "Ctrl + [", isMono: true },
    ]
  },
  {
    id: "killzones",
    num: "09",
    title: "London & NY Session Killzones",
    subtitle: "Institutional volatility windows",
    desc: "Highlight peak liquidity sessions using vertical shading boxes: London Open (07:00 - 10:00 GMT) and New York Open (12:00 - 15:00 GMT). Look for early fakeouts (Judas Swings) that take out Asian highs/lows before running the true trend.",
    colorClass: "bg-orange-50 text-orange-600",
    badgeBg: "bg-orange-50/60 border-orange-100",
    badgeText: "text-orange-900",
    items: [
      { label: "Asian Range Sweep", value: "00:00 - 06:00 GMT High/Low mark" },
      { label: "London Killzone", value: "07:00 - 10:00 GMT expansion" },
      { label: "New York Killzone", value: "12:00 - 15:00 GMT continuation" },
    ]
  },
  {
    id: "journal",
    num: "10",
    title: "Trade Journaling & Homework Submission",
    subtitle: "Document setups for mentor grading",
    desc: "Attach Sticky Notes (N) outlining your pre-trade checklist: Entry Reason, HTF Confluence, Stop Loss Pips, and Take Profit Target. Export high-resolution PNGs with Ctrl + E to submit homework assignments to GAMATFX coaches.",
    colorClass: "bg-emerald-50 text-emerald-600",
    badgeBg: "bg-emerald-50/60 border-emerald-100",
    badgeText: "text-emerald-900",
    items: [
      { label: "Sticky Note Checklist", value: "Press N", isMono: true },
      { label: "Ultra-HD 2x Diagram Export", value: "Ctrl + E", isMono: true },
      { label: "Duplicate Trade Setup", value: "Ctrl + D", isMono: true },
    ]
  }
];

const INITIAL_TABS: DiagramTab[] = [
  { id: "canvas_1", name: "Canvas 1" },
];

/* ========================================================================== */
/*                             MAIN COMPONENT                                 */
/* ========================================================================== */

export default function WhiteboardPage() {
  const { user, isAuthed, logout, isAdmin } = useStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Figma-Style Whiteboard Hub Launcher State (Defaults to Hub on Login)
  const [viewMode, setViewMode] = useState<"hub" | "canvas">("hub");
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

  // Sub-Header Action Dropdown States
  const [diagramsMenuOpen, setDiagramsMenuOpen] = useState(false);
  const [activeMenuTab, setActiveMenuTab] = useState<"drafts" | "samples" | "trash">("drafts");

  const [activeTool, setActiveTool] = useState<Tool>("pencil");
  const [activeShapeTool, setActiveShapeTool] = useState<"rectangle" | "circle" | "diamond">("rectangle");
  const [activeLineTool, setActiveLineTool] = useState<"line" | "arrow" | "bezier">("arrow");
  const [activePenTool, setActivePenTool] = useState<"pencil" | "highlighter">("pencil");
  const [activeForexTool, setActiveForexTool] = useState<"fibo" | "long" | "short">("fibo");
  const [activeNoteTool, setActiveNoteTool] = useState<"text" | "sticky">("text");

  // TradingView Style Floating Favorites Toolbar State (Floats anywhere on whole page!)
  const [favoritedTools, setFavoritedTools] = useState<Tool[]>(["select", "pencil", "line", "fibo", "long", "short"]);
  const [favPos, setFavPos] = useState({ x: 90, y: 130 });
  const isDraggingFav = useRef(false);
  const dragFavStart = useRef({ x: 0, y: 0 });

  const [strokeColor, setStrokeColor] = useState("#dc3545");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [lineStyle, setLineStyle] = useState<"solid" | "dashed">("solid");
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
  const [marqueeBox, setMarqueeBox] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  // Interactive Shape Resizing State
  const [activeResizeHandle, setActiveResizeHandle] = useState<{ shapeId: string; handle: ResizeHandle } | null>(null);

  // Undo/Redo & Active Drawing
  const [redoStack, setRedoStack] = useState<Shape[]>([]);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);

  // Text Modal Input & Note Editing State
  const [textModalPos, setTextModalPos] = useState<{ x: number; y: number } | null>(null);
  const [textValue, setTextValue] = useState("");
  const [isStickyMode, setIsStickyMode] = useState(false);
  const [editingShapeId, setEditingShapeId] = useState<string | null>(null);

  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const isDraggingShape = useRef(false);
  const dragStartPt = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const startPan = useRef({ x: 0, y: 0 });

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
      if (mouseWheelMode === "zoom") {
        const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
        setZoom((z) => Math.min(3.0, Math.max(0.3, z * zoomFactor)));
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
        else if (key === "e") { setActiveTool("eraser"); showToast("Tool: Precision Eraser (E)"); }
        else if (key === "z") { setActiveTool("zoom"); showToast("Tool: Zoom (Z)"); }
        else if (key === "f") { setActiveForexTool("fibo"); setActiveTool("fibo"); showToast("Forex Tool: Fibonacci Retracement (F)"); }
        else if (key === "l" && !e.shiftKey) { setActiveForexTool("long"); setActiveTool("long"); showToast("Forex Tool: Long Position (L)"); }
        else if (key === "s") { setActiveForexTool("short"); setActiveTool("short"); showToast("Forex Tool: Short Position (S)"); }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
      ctx.fillStyle = gridColor;
      const step = 28;
      for (let x = -2000; x < 4000; x += step) {
        for (let y = -2000; y < 4000; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (bgGrid === "lines") {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.8;
      const step = 32;
      for (let x = -2000; x < 4000; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, -2000);
        ctx.lineTo(x, 4000);
        ctx.stroke();
      }
      for (let y = -2000; y < 4000; y += step) {
        ctx.beginPath();
        ctx.moveTo(-2000, y);
        ctx.lineTo(4000, y);
        ctx.stroke();
      }
    }

    // Render All Shapes & Sticky Notes (skip hidden shapes!)
    const allShapes = [...shapes, ...(currentShape ? [currentShape] : [])];
    allShapes.forEach((s) => {
      if (!s.isHidden) {
        renderWhiteboardShape(ctx, s, selectedShapeIds.includes(s.id), defaultRiskReward);
      }
    });

    // Render Marquee Selection Rubberband Box
    if (marqueeBox) {
      const minX = Math.min(marqueeBox.x1, marqueeBox.x2);
      const maxX = Math.max(marqueeBox.x1, marqueeBox.x2);
      const minY = Math.min(marqueeBox.y1, marqueeBox.y2);
      const maxY = Math.max(marqueeBox.y1, marqueeBox.y2);

      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 1;
      ctx.fillStyle = "rgba(59, 130, 246, 0.12)";
      ctx.setLineDash([4, 4]);
      ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
      ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
      ctx.setLineDash([]);
    }

    ctx.restore();
  }, [shapes, currentShape, selectedShapeIds, marqueeBox, bgGrid, pan, zoom, defaultRiskReward]);

  /* ------------------------- Tool Selection & Synced Categories ------------- */

  const selectTool = (tool: ToolType) => {
    setActiveTool(tool);
    if (tool === "fibo" || tool === "long" || tool === "short") {
      setActiveForexTool(tool);
    } else if (tool === "pencil" || tool === "highlighter") {
      setActivePenTool(tool);
    } else if (tool === "rectangle" || tool === "circle" || tool === "diamond") {
      setActiveShapeTool(tool);
    } else if (tool === "line" || tool === "arrow" || tool === "bezier") {
      setActiveLineTool(tool);
    } else if (tool === "text" || tool === "sticky") {
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

    if (activeTool === "hand" || e.button === 1 || e.buttons === 4) {
      isPanning.current = true;
      startPan.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    const pt = getCanvasCoords(e);

    if (activeTool === "zoom") {
      setZoom((z) => Math.min(3.0, z + 0.2));
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
        setSelectedShapeIds([]);
        setIsInspectorOpen(false);
        setMarqueeBox({ x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y });
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
      setEditingShapeId(null);
      setTextValue("");
      setIsStickyMode(false);
      setTextModalPos(pt);
      return;
    }

    if (activeTool === "sticky") {
      setEditingShapeId(null);
      setTextValue("");
      setIsStickyMode(true);
      setTextModalPos(pt);
      return;
    }

    const defaultForexColor =
      activeTool === "long" ? "#10b981" : activeTool === "short" ? "#dc3545" : strokeColor;

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

    // 2. Interactive Resize Handle Drag
    if (activeResizeHandle) {
      const targetShape = shapes.find((s) => s.id === activeResizeHandle.shapeId);
      if (targetShape && !targetShape.isLocked) {
        const pts = targetShape.points;
        let minX = Math.min(...pts.map((p) => p.x));
        let maxX = Math.max(...pts.map((p) => p.x));
        let minY = Math.min(...pts.map((p) => p.y));
        let maxY = Math.max(...pts.map((p) => p.y));

        if (activeResizeHandle.handle === "tl") {
          minX = pt.x;
          minY = pt.y;
        } else if (activeResizeHandle.handle === "tr") {
          maxX = pt.x;
          minY = pt.y;
        } else if (activeResizeHandle.handle === "br") {
          maxX = pt.x;
          maxY = pt.y;
        } else if (activeResizeHandle.handle === "bl") {
          minX = pt.x;
          maxY = pt.y;
        }

        setShapes((prev) =>
          prev.map((s) => {
            if (s.id === targetShape.id) {
              if (s.type === "sticky" || s.type === "text") {
                return { ...s, points: [{ x: minX, y: minY }] };
              }
              return {
                ...s,
                points: [
                  { x: minX, y: minY },
                  { x: maxX, y: maxY },
                ],
              };
            }
            return s;
          })
        );
      }
      return;
    }

    // 3. Selection Marquee Box
    if (marqueeBox) {
      setMarqueeBox((prev) => (prev ? { ...prev, x2: pt.x, y2: pt.y } : null));
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
      currentShape.type === "long" ||
      currentShape.type === "short" ||
      currentShape.type === "fibo"
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

    // Finalize Multi-Select Marquee
    if (marqueeBox) {
      const minX = Math.min(marqueeBox.x1, marqueeBox.x2);
      const maxX = Math.max(marqueeBox.x1, marqueeBox.x2);
      const minY = Math.min(marqueeBox.y1, marqueeBox.y2);
      const maxY = Math.max(marqueeBox.y1, marqueeBox.y2);

      const enclosedShapes = shapes.filter((s) => {
        if (s.isHidden) return false;
        return s.points.some((p) => p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY);
      });

      setSelectedShapeIds(enclosedShapes.map((s) => s.id));
      setMarqueeBox(null);
    }

    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (currentShape) {
      setShapes((prev) => [...prev, currentShape]);
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
    if (hitShape && (hitShape.type === "sticky" || hitShape.type === "text")) {
      if (hitShape.isLocked) {
        showToast("Locked note! Unlock it first to edit 🔓");
        return;
      }
      setEditingShapeId(hitShape.id);
      setTextValue(hitShape.text || "");
      setIsStickyMode(hitShape.type === "sticky");
      if (hitShape.stickyColor) setStickyColor(hitShape.stickyColor);
      setTextModalPos(hitShape.points[0] || pt);
      setSelectedShapeIds([hitShape.id]);
    }
  };

  /* Contextual Right-Click Handler */
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const pt = getCanvasCoords(e);
    const hitShape = [...shapes].reverse().find((s) => !s.isHidden && isPointInShape(pt, s));

    if (hitShape) {
      setSelectedShapeIds([hitShape.id]);
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        canvasPt: pt,
        targetShape: hitShape,
      });
    } else {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        canvasPt: pt,
        targetShape: null,
      });
    }
  };

  const handleAddTextOrSticky = () => {
    if (!textValue.trim() || !textModalPos) return;

    if (editingShapeId) {
      setShapes((prev) =>
        prev.map((s) =>
          s.id === editingShapeId
            ? {
                ...s,
                text: textValue.trim(),
                stickyColor: isStickyMode ? stickyColor : s.stickyColor,
              }
            : s
        )
      );
      setEditingShapeId(null);
      setTextValue("");
      setTextModalPos(null);
      showToast(isStickyMode ? "Updated Sticky Note!" : "Updated Text Label!");
      return;
    }

    const newShape: Shape = {
      id: `shape_${Date.now()}`,
      type: isStickyMode ? "sticky" : "text",
      color: strokeColor,
      strokeWidth,
      lineStyle,
      isLocked: autoLockObjects,
      points: [textModalPos],
      text: textValue.trim(),
      stickyColor: isStickyMode ? stickyColor : undefined,
    };

    setShapes((prev) => [...prev, newShape]);
    setTextValue("");
    setTextModalPos(null);
    showToast(isStickyMode ? "Added Sticky Note!" : "Added Text Label!");
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
        prev.map((s) => (selectedShapeIds.includes(s.id) && !s.isLocked ? { ...s, color } : s))
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

  const handleConfirmCreateCustomCanvas = () => {
    const finalName = newCanvasName.trim() || `Canvas ${tabs.length + 1}`;
    if (tabs.length >= 5 && !tabs.some((t) => t.name === finalName)) {
      setMaxTabPromptOpen(true);
      showToast("Maximum 5 tabs reached! Please close a tab first.");
      return;
    }

    const newId = `canvas_${Date.now()}`;
    setTabs((prev) => [...prev, { id: newId, name: finalName }]);
    setActiveTabId(newId);

    // Apply selected theme and grid settings
    setBgGrid(newCanvasTheme);
    setSnapToGrid(newCanvasSnapToGrid);

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

    setShapes(initialShapes);
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
    setTabs((prev) => [...prev, { id: newId, name: newName }]);
    if (activeTabId === tabIdToDup) {
      setActiveTabId(newId);
    } else {
      setActiveTabId(newId);
    }
    setTabContextMenu(null);
    showToast(`Duplicated tab: "${newName}"`);
  };

  const handleCloseTab = (tabIdToClose: string) => {
    if (tabs.length === 1) {
      showToast("Cannot close the only open tab.");
      return;
    }

    const tabToRemove = tabs.find((t) => t.id === tabIdToClose);
    if (tabToRemove) {
      const trashedItem: TrashedTab = {
        id: tabToRemove.id,
        name: tabToRemove.name,
        shapes: tabToRemove.id === activeTabId ? shapes : [],
        deletedAt: Date.now(),
      };
      setTrashedTabs((prev) => [trashedItem, ...prev]);
    }

    const remaining = tabs.filter((t) => t.id !== tabIdToClose);
    setTabs(remaining);
    if (activeTabId === tabIdToClose) {
      setActiveTabId(remaining[0].id);
      setShapes([]);
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

  const deleteDraft = (draftId: string) => {
    setSavedDrafts((prev) => prev.filter((d) => d.id !== draftId));
    showToast("Deleted draft!");
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
    if (sampleType === "mindmap") {
      if (tabs.length >= 5 && !tabs.some((t) => t.id === "mindmap")) {
        setMaxTabPromptOpen(true);
        showToast("Max 5 tabs reached! Close a tab to load sample chart.");
        return;
      }
      if (!tabs.some((t) => t.id === "mindmap")) {
        setTabs((prev) => [...prev, { id: "mindmap", name: "Forex Basics Mind Map" }]);
      }
      handleSelectTab("mindmap");
    } else if (sampleType === "smc") {
      if (tabs.length >= 5 && !tabs.some((t) => t.id === "smc_diag")) {
        setMaxTabPromptOpen(true);
        showToast("Max 5 tabs reached! Close a tab to load sample chart.");
        return;
      }
      if (!tabs.some((t) => t.id === "smc_diag")) {
        setTabs((prev) => [...prev, { id: "smc_diag", name: "SMC Liquidity Diagram" }]);
      }
      handleSelectTab("smc_diag");
    } else if (sampleType === "risk") {
      if (tabs.length >= 5 && !tabs.some((t) => t.id === "risk_diag")) {
        setMaxTabPromptOpen(true);
        showToast("Max 5 tabs reached! Close a tab to load sample chart.");
        return;
      }
      if (!tabs.some((t) => t.id === "risk_diag")) {
        setTabs((prev) => [...prev, { id: "risk_diag", name: "Risk Management Matrix" }]);
      }
      handleSelectTab("risk_diag");
    } else if (sampleType === "class_chart_eurusd") {
      if (tabs.length >= 5 && !tabs.some((t) => t.id === "sample_eurusd")) {
        setMaxTabPromptOpen(true);
        showToast("Max 5 tabs reached! Close a tab to load sample chart.");
        return;
      }
      const newTabId = "sample_eurusd";
      if (!tabs.some((t) => t.id === newTabId)) {
        setTabs((prev) => [...prev, { id: newTabId, name: "EUR/USD H4 Class Analysis" }]);
      }
      setActiveTabId(newTabId);
      setShapes([
        // Candlesticks
        { id: "c1", type: "rectangle", color: "#ef4444", strokeWidth: 2, points: [{ x: 100, y: 300 }, { x: 130, y: 380 }] },
        { id: "c1w", type: "line", color: "#ef4444", strokeWidth: 2, points: [{ x: 115, y: 280 }, { x: 115, y: 400 }] },
        { id: "c2", type: "rectangle", color: "#10b981", strokeWidth: 2, points: [{ x: 150, y: 220 }, { x: 180, y: 320 }] },
        { id: "c2w", type: "line", color: "#10b981", strokeWidth: 2, points: [{ x: 165, y: 200 }, { x: 165, y: 340 }] },
        // BOS Line
        { id: "bos", type: "line", color: "#3b82f6", strokeWidth: 2, lineStyle: "dashed", points: [{ x: 140, y: 200 }, { x: 500, y: 200 }] },
        { id: "bostxt", type: "text", color: "#3b82f6", strokeWidth: 2, points: [{ x: 300, y: 185 }], text: "H4 Break of Structure (BOS) ↗" },
        // FVG Box
        { id: "fvg", type: "rectangle", color: "#f59e0b", strokeWidth: 2, points: [{ x: 220, y: 240 }, { x: 420, y: 290 }] },
        { id: "fvgtxt", type: "text", color: "#f59e0b", strokeWidth: 2, points: [{ x: 230, y: 270 }], text: "H4 Fair Value Gap (FVG Demand)" },
        // Long Position Box
        { id: "pos", type: "long", color: "#10b981", strokeWidth: 2, points: [{ x: 450, y: 240 }, { x: 650, y: 100 }] },
        // Class Note Sticky
        { id: "note", type: "sticky", color: "#16181c", strokeWidth: 2, points: [{ x: 690, y: 120 }], text: "🎓 CLASS ANALYSIS NOTE:\nWait for H4 candle close above BOS, then place Buy Limit at top of FVG box!", stickyColor: "#fef08a" }
      ]);
      showToast("Loaded EUR/USD H4 Class Analysis Sample Chart!");
    } else if (sampleType === "sample_london_sweep") {
      if (tabs.length >= 5 && !tabs.some((t) => t.id === "sample_london")) {
        setMaxTabPromptOpen(true);
        showToast("Max 5 tabs reached! Close a tab to load sample chart.");
        return;
      }
      const newTabId = "sample_london";
      if (!tabs.some((t) => t.id === newTabId)) {
        setTabs((prev) => [...prev, { id: newTabId, name: "London Sweep Class Setup" }]);
      }
      setActiveTabId(newTabId);
      setShapes([
        // Asian Range Box
        { id: "asian", type: "rectangle", color: "#8b5cf6", strokeWidth: 2, points: [{ x: 100, y: 200 }, { x: 350, y: 320 }] },
        { id: "asiantxt", type: "text", color: "#8b5cf6", strokeWidth: 2, points: [{ x: 110, y: 180 }], text: "Asian Session Consolidation Range (00:00 - 08:00 UTC)" },
        // Sweep Arrow
        { id: "sweep", type: "arrow", color: "#dc3545", strokeWidth: 3, points: [{ x: 380, y: 300 }, { x: 380, y: 380 }] },
        { id: "sweeptxt", type: "text", color: "#dc3545", strokeWidth: 2, points: [{ x: 400, y: 370 }], text: "Judas Swing Sweeps Asian Low Liquidity ⚡" },
        // Expansion Trendline
        { id: "exp", type: "arrow", color: "#10b981", strokeWidth: 3, points: [{ x: 390, y: 380 }, { x: 650, y: 120 }] },
        { id: "exptxt", type: "text", color: "#10b981", strokeWidth: 2, points: [{ x: 500, y: 220 }], text: "London Bullish Expansion Trend" },
        // Class Note Sticky
        { id: "note2", type: "sticky", color: "#16181c", strokeWidth: 2, points: [{ x: 680, y: 240 }], text: "🏫 LIVE CLASS SETUP:\nLondon open sweeps Asian Low liquidity to trap retail sellers before explosive reversal.", stickyColor: "#bae6fd" }
      ]);
      showToast("Loaded London Sweep Class Setup Sample Chart!");
    }
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

    const newId = `guide_${resource.id}_${Date.now()}`;
    if (!tabs.some((t) => t.name === finalName)) {
      setTabs((prev) => [...prev, { id: newId, name: finalName }]);
    }
    setActiveTabId(newId);

    let initialShapes: Shape[] = [];
    if (resource.id === "patterns") {
      initialShapes = [
        { id: "p1", type: "path", color: "#3b82f6", strokeWidth: 3, points: [{ x: 100, y: 180 }, { x: 180, y: 320 }, { x: 260, y: 220 }, { x: 340, y: 320 }, { x: 420, y: 150 }] },
        { id: "neckline", type: "line", color: "#ef4444", strokeWidth: 2, lineStyle: "dashed", points: [{ x: 150, y: 220 }, { x: 500, y: 220 }] },
        { id: "necktxt", type: "text", color: "#ef4444", strokeWidth: 2, points: [{ x: 280, y: 205 }], text: "Neckline Breakout Level" },
        { id: "target", type: "arrow", color: "#10b981", strokeWidth: 3, points: [{ x: 420, y: 220 }, { x: 420, y: 100 }] },
        { id: "tgttxt", type: "text", color: "#10b981", strokeWidth: 2, points: [{ x: 435, y: 150 }], text: "Measured Target Projection" },
        { id: "note_pat", type: "sticky", color: "#16181c", strokeWidth: 2, points: [{ x: 560, y: 110 }], text: `📘 ${resource.title.toUpperCase()}\n\n• ${resource.points.join("\n• ")}`, stickyColor: "#fef08a" }
      ];
    } else if (resource.id === "smc_guide") {
      initialShapes = [
        { id: "ob", type: "rectangle", color: "#8b5cf6", strokeWidth: 2, points: [{ x: 120, y: 260 }, { x: 320, y: 340 }] },
        { id: "obtxt", type: "text", color: "#8b5cf6", strokeWidth: 2, points: [{ x: 130, y: 295 }], text: "Bullish Order Block (OB Demand Zone)" },
        { id: "fvg", type: "rectangle", color: "#f59e0b", strokeWidth: 2, points: [{ x: 260, y: 180 }, { x: 420, y: 240 }] },
        { id: "fvgtxt", type: "text", color: "#f59e0b", strokeWidth: 2, points: [{ x: 270, y: 210 }], text: "Fair Value Gap (FVG Imbalance)" },
        { id: "bos", type: "arrow", color: "#3b82f6", strokeWidth: 3, points: [{ x: 320, y: 300 }, { x: 550, y: 120 }] },
        { id: "bostxt", type: "text", color: "#3b82f6", strokeWidth: 2, points: [{ x: 420, y: 190 }], text: "Break of Structure (BOS) ↗" },
        { id: "note_smc", type: "sticky", color: "#16181c", strokeWidth: 2, points: [{ x: 580, y: 120 }], text: `⚡ ${resource.title.toUpperCase()}\n\n• ${resource.points.join("\n• ")}`, stickyColor: "#bae6fd" }
      ];
    } else if (resource.id === "position_sizing") {
      initialShapes = [
        { id: "pos", type: "long", color: "#10b981", strokeWidth: 2, points: [{ x: 200, y: 280 }, { x: 460, y: 120 }] },
        { id: "sl_line", type: "line", color: "#ef4444", strokeWidth: 2, lineStyle: "dashed", points: [{ x: 160, y: 340 }, { x: 500, y: 340 }] },
        { id: "sltxt", type: "text", color: "#ef4444", strokeWidth: 2, points: [{ x: 170, y: 360 }], text: "Invalidation Stop Loss: 20 Pips" },
        { id: "tp_line", type: "line", color: "#10b981", strokeWidth: 2, lineStyle: "dashed", points: [{ x: 160, y: 120 }, { x: 500, y: 120 }] },
        { id: "tptxt", type: "text", color: "#10b981", strokeWidth: 2, points: [{ x: 170, y: 100 }], text: "Take Profit Target (1:3 R:R): 60 Pips" },
        { id: "note_risk", type: "sticky", color: "#16181c", strokeWidth: 2, points: [{ x: 550, y: 110 }], text: `📊 ${resource.title.toUpperCase()}\n\n• ${resource.points.join("\n• ")}`, stickyColor: "#bbf7d0" }
      ];
    } else if (resource.id === "hotkeys") {
      initialShapes = [
        { id: "pencil_demo", type: "pencil", color: "#dc3545", strokeWidth: 3, points: [{ x: 140, y: 200 }, { x: 180, y: 160 }, { x: 220, y: 220 }, { x: 280, y: 140 }] },
        { id: "pencil_txt", type: "text", color: "#dc3545", strokeWidth: 2, points: [{ x: 140, y: 240 }], text: "Draw Tool (Pencil: P)" },
        { id: "rect_demo", type: "rectangle", color: "#3b82f6", strokeWidth: 2, points: [{ x: 340, y: 150 }, { x: 480, y: 250 }] },
        { id: "rect_txt", type: "text", color: "#3b82f6", strokeWidth: 2, points: [{ x: 350, y: 270 }], text: "Rectangle Box (R)" },
        { id: "note_keys", type: "sticky", color: "#16181c", strokeWidth: 2, points: [{ x: 550, y: 110 }], text: `⌨️ ${resource.title.toUpperCase()}\n\n• ${resource.points.join("\n• ")}`, stickyColor: "#fef08a" }
      ];
    } else {
      initialShapes = [
        { id: "note_gen", type: "sticky", color: "#16181c", strokeWidth: 2, points: [{ x: 200, y: 160 }], text: `📝 ${resource.title.toUpperCase()}\n\n• ${resource.points.join("\n• ")}`, stickyColor: "#fef08a" }
      ];
    }

    setShapes(initialShapes);
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
    setActiveTabId(tabId);
    if (tabId === "blank") {
      setShapes([]);
      showToast("Opened Blank Canvas!");
    } else if (tabId === "mindmap") {
      setShapes([
        {
          id: "m1",
          type: "sticky",
          color: "#16181c",
          strokeWidth: 2,
          points: [{ x: 300, y: 150 }],
          text: "📊 FOREX MASTERY\n1. Market Structure\n2. Risk Management\n3. Psychology",
          stickyColor: "#fef08a",
        },
        {
          id: "m2",
          type: "sticky",
          color: "#16181c",
          strokeWidth: 2,
          points: [{ x: 50, y: 350 }],
          text: "📈 TECHNICAL ANALYSIS\n• Higher Highs / Higher Lows\n• Order Blocks (OB)\n• Fair Value Gaps (FVG)",
          stickyColor: "#bae6fd",
        },
        {
          id: "m3",
          type: "sticky",
          color: "#16181c",
          strokeWidth: 2,
          points: [{ x: 550, y: 350 }],
          text: "🛡️ RISK MANAGEMENT\n• Max 1% Risk / Trade\n• Minimum 1:3 R:R\n• Strict Stop Loss",
          stickyColor: "#fbcfe8",
        },
      ]);
      showToast("Switched to Forex Basics Mind Map Tab!");
    } else if (tabId === "smc_diag") {
      setShapes([
        {
          id: "s1",
          type: "rectangle",
          color: "#10b981",
          strokeWidth: 2,
          points: [
            { x: 150, y: 220 },
            { x: 450, y: 320 },
          ],
        },
        {
          id: "s2",
          type: "text",
          color: "#10b981",
          strokeWidth: 2,
          points: [{ x: 160, y: 200 }],
          text: "Institutional Bullish Order Block (OB Zone)",
        },
        {
          id: "s3",
          type: "sticky",
          color: "#16181c",
          strokeWidth: 2,
          points: [{ x: 500, y: 200 }],
          text: "💡 TEACHING TIP:\nWait for price to sweep Asian Liquidity & retest OB before entry!",
          stickyColor: "#fef08a",
        },
      ]);
      showToast("Switched to SMC Liquidity Diagram Tab!");
    } else if (tabId === "risk_diag") {
      setShapes([
        {
          id: "r1",
          type: "sticky",
          color: "#16181c",
          strokeWidth: 2,
          points: [{ x: 250, y: 180 }],
          text: "🎯 RISK TO REWARD (1:3)\nRisk: $100 (Stop Loss)\nTarget: $300 (Take Profit)\nWinrate needed: only 30%!",
          stickyColor: "#bbf7d0",
        },
      ]);
      showToast("Switched to Risk Management Matrix Tab!");
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

  // Filtered collections for Figma-Style Hub View
  const allDraftsList = [
    ...tabs.map((t) => ({ id: t.id, name: t.name, shapes: t.id === activeTabId ? shapes : [], isTab: true, savedAt: Date.now() })),
    ...savedDrafts.map((d) => ({ ...d, isTab: false })),
  ];

  const filteredDrafts = allDraftsList.filter((d) =>
    !hubSearch.trim() || d.name.toLowerCase().includes(hubSearch.toLowerCase())
  );

  const filteredSamples = HUB_SAMPLES.filter((s) =>
    !hubSearch.trim() ||
    s.name.toLowerCase().includes(hubSearch.toLowerCase()) ||
    s.tag.toLowerCase().includes(hubSearch.toLowerCase()) ||
    s.category.toLowerCase().includes(hubSearch.toLowerCase()) ||
    s.desc.toLowerCase().includes(hubSearch.toLowerCase())
  );

  const filteredResources = HUB_RESOURCES.filter((r) =>
    !hubSearch.trim() ||
    r.title.toLowerCase().includes(hubSearch.toLowerCase()) ||
    r.category.toLowerCase().includes(hubSearch.toLowerCase()) ||
    r.desc.toLowerCase().includes(hubSearch.toLowerCase()) ||
    r.points.some((p) => p.toLowerCase().includes(hubSearch.toLowerCase()))
  );

  const filteredTrash = trashedTabs.filter((t) =>
    !hubSearch.trim() || t.name.toLowerCase().includes(hubSearch.toLowerCase())
  );

  const filteredLessons = HUB_LESSONS.filter((l) =>
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
                  {hubSearch ? filteredSamples.length : HUB_SAMPLES.length}
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
                  {hubSearch ? filteredResources.length : HUB_RESOURCES.length}
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
                          {!draft.isTab && (
                            <div className="pt-2 border-t border-line flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleDuplicateDraft(draft as SavedDraft)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-brand hover:bg-slate-100 transition cursor-pointer"
                                title="Duplicate Draft"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteDraft(draft.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Delete Draft"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
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
                          {!draft.isTab && (
                            <button
                              type="button"
                              onClick={() => deleteDraft(draft.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
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
                          <HubDiagramThumbnail type={sample.previewType} />
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
                            <HubDiagramThumbnail type={sample.previewType} />
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
                      onChange={(e) => setBgGrid(e.target.value as any)}
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
                    <p className="text-[10px] font-black uppercase text-muted tracking-wider">Concept Mind Maps</p>

                    <button
                      type="button"
                      onClick={() => { loadSampleClassChart("mindmap"); setDiagramsMenuOpen(false); }}
                      className="flex w-full items-center justify-between rounded-xl border border-line p-2 text-left text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                    >
                      <span>Forex Basics Mind Map</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { loadSampleClassChart("smc"); setDiagramsMenuOpen(false); }}
                      className="flex w-full items-center justify-between rounded-xl border border-line p-2 text-left text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                    >
                      <span>SMC Order Block & Liquidity</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { loadSampleClassChart("risk"); setDiagramsMenuOpen(false); }}
                      className="flex w-full items-center justify-between rounded-xl border border-line p-2 text-left text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                    >
                      <span>Risk Management Matrix</span>
                    </button>

                    <p className="text-[10px] font-black uppercase text-muted tracking-wider pt-2">Live Class Chart Analysis</p>

                    <button
                      type="button"
                      onClick={() => { loadSampleClassChart("class_chart_eurusd"); setDiagramsMenuOpen(false); }}
                      className="flex w-full items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-2 text-left text-xs font-bold text-blue-900 hover:bg-blue-100 transition"
                    >
                      <div>
                        <p className="font-extrabold text-blue-950">EUR/USD H4 BOS & FVG Class Chart</p>
                        <p className="text-[10px] text-blue-700 font-normal">Candlesticks, Break of Structure line, FVG box & Buy Limit</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { loadSampleClassChart("sample_london_sweep"); setDiagramsMenuOpen(false); }}
                      className="flex w-full items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-2 text-left text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition"
                    >
                      <div>
                        <p className="font-extrabold text-emerald-950">London Asian Sweep Class Setup</p>
                        <p className="text-[10px] text-emerald-700 font-normal">Asian range box, Judas Swing sweep arrow & reversal target</p>
                      </div>
                    </button>
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
                      setBgGrid(theme.id as any);
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

          {/* Inspector Panel Toggle Button (Icon Only) */}
          <button
            type="button"
            onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            className={`flex items-center justify-center rounded-xl p-1.5 transition ${
              isInspectorOpen ? "bg-brand-light text-brand" : "hover:bg-slate-100 text-ink"
            }`}
            title="Toggle Floating Inspector & Layers Panel"
          >
            <SlidersHorizontal className="h-4 w-4 text-slate-700" />
          </button>

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

      {/* Sub-Header Drag-and-Drop Reorderable Tabs Bar */}
      <div className="h-10 border-b border-line bg-slate-100 px-4 flex items-center justify-between gap-3 shrink-0 z-30 relative">
        {/* Left Side: Home Icon Hub Link & Active Tabs List */}
        <div className="flex items-center gap-3 shrink-0 max-w-[85vw]">
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
          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto py-1 max-w-[70vw] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
                active={["fibo", "long", "short"].includes(activeTool)}
                onClick={() => selectTool(activeForexTool)}
                onFlyoutToggle={() => setFlyoutGroup(flyoutGroup === "forex" ? null : "forex")}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setFlyoutGroup(flyoutGroup === "forex" ? null : "forex");
                }}
                title="Forex Trading Tools (Click arrow or right-click to choose tool)"
                toolKey={activeForexTool}
                icon={
                  activeForexTool === "long"
                    ? TrendingUp
                    : activeForexTool === "short"
                    ? TrendingDown
                    : Percent
                }
                hasFlyout
                showTooltips={showTooltips}
              />

              {flyoutGroup === "forex" && (
                <div className="absolute left-full top-0 ml-2 w-56 rounded-2xl border border-line bg-white p-2 shadow-2xl z-50 animate-in fade-in space-y-1">
                  <p className="px-3 py-1 text-[10px] font-black uppercase text-muted tracking-wider">Forex Tools</p>

                  {/* 1. Fibonacci Retracement */}
                  <button
                    type="button"
                    onClick={() => { selectTool("fibo"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
                      activeForexTool === "fibo" ? "bg-brand text-white" : "text-slate-700 hover:bg-cream"
                    }`}
                  >
                    <span className="flex items-center gap-2"><Percent className="h-3.5 w-3.5" /> Fibonacci Retracement</span>
                    <span title={favoritedTools.includes("fibo") ? "Remove from Favorites" : "Add to Favorites"}>
                      <Star
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteTool("fibo"); }}
                        className={`h-3.5 w-3.5 cursor-pointer p-0.5 rounded ${favoritedTools.includes("fibo") ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`}
                      />
                    </span>
                  </button>

                  {/* 2. Long Position */}
                  <button
                    type="button"
                    onClick={() => { selectTool("long"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
                      activeForexTool === "long" ? "bg-brand text-white" : "text-slate-700 hover:bg-cream"
                    }`}
                  >
                    <span className="flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5" /> Long Position (Risk:Reward)</span>
                    <span title={favoritedTools.includes("long") ? "Remove from Favorites" : "Add to Favorites"}>
                      <Star
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteTool("long"); }}
                        className={`h-3.5 w-3.5 cursor-pointer p-0.5 rounded ${favoritedTools.includes("long") ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`}
                      />
                    </span>
                  </button>

                  {/* 3. Short Position */}
                  <button
                    type="button"
                    onClick={() => { selectTool("short"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
                      activeForexTool === "short" ? "bg-brand text-white" : "text-slate-700 hover:bg-cream"
                    }`}
                  >
                    <span className="flex items-center gap-2"><TrendingDown className="h-3.5 w-3.5" /> Short Position (Risk:Reward)</span>
                    <span title={favoritedTools.includes("short") ? "Remove from Favorites" : "Add to Favorites"}>
                      <Star
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteTool("short"); }}
                        className={`h-3.5 w-3.5 cursor-pointer p-0.5 rounded ${favoritedTools.includes("short") ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`}
                      />
                    </span>
                  </button>
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
                showTooltips={showTooltips}
              />
              {flyoutGroup === "pen" && (
                <div className="absolute left-full top-0 ml-2 w-48 rounded-2xl border border-line bg-white p-2 shadow-2xl z-50 animate-in fade-in">
                  <p className="px-3 py-1 text-[10px] font-black uppercase text-muted tracking-wider">Pen Tools</p>
                  <button
                    type="button"
                    onClick={() => { selectTool("pencil"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${activePenTool === "pencil" ? "bg-brand text-white" : "text-slate-700 hover:bg-cream"}`}
                  >
                    <span className="flex items-center gap-2"><Pencil className="h-3.5 w-3.5" /> Freehand Pen</span>
                    <span title={favoritedTools.includes("pencil") ? "Remove from Favorites" : "Add to Favorites"}>
                      <Star
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteTool("pencil"); }}
                        className={`h-3.5 w-3.5 cursor-pointer p-0.5 rounded ${favoritedTools.includes("pencil") ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`}
                      />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { selectTool("highlighter"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${activePenTool === "highlighter" ? "bg-brand text-white" : "text-slate-700 hover:bg-cream"}`}
                  >
                    <span className="flex items-center gap-2"><Highlighter className="h-3.5 w-3.5" /> Highlighter</span>
                    <span title={favoritedTools.includes("highlighter") ? "Remove from Favorites" : "Add to Favorites"}>
                      <Star
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteTool("highlighter"); }}
                        className={`h-3.5 w-3.5 cursor-pointer p-0.5 rounded ${favoritedTools.includes("highlighter") ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`}
                      />
                    </span>
                  </button>
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
                showTooltips={showTooltips}
              />
              {flyoutGroup === "shapes" && (
                <div className="absolute left-full top-0 ml-2 w-52 rounded-2xl border border-line bg-white p-2 shadow-2xl z-50 animate-in fade-in">
                  <p className="px-3 py-1 text-[10px] font-black uppercase text-muted tracking-wider">Shape Tools</p>
                  <button
                    type="button"
                    onClick={() => { selectTool("rectangle"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${activeShapeTool === "rectangle" ? "bg-brand text-white" : "text-slate-700 hover:bg-cream"}`}
                  >
                    <span className="flex items-center gap-2"><Square className="h-3.5 w-3.5" /> Rectangle Zone</span>
                    <span title={favoritedTools.includes("rectangle") ? "Remove from Favorites" : "Add to Favorites"}>
                      <Star
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteTool("rectangle"); }}
                        className={`h-3.5 w-3.5 cursor-pointer p-0.5 rounded ${favoritedTools.includes("rectangle") ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`}
                      />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { selectTool("circle"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${activeShapeTool === "circle" ? "bg-brand text-white" : "text-slate-700 hover:bg-cream"}`}
                  >
                    <span className="flex items-center gap-2"><Circle className="h-3.5 w-3.5" /> Circle Node</span>
                    <span title={favoritedTools.includes("circle") ? "Remove from Favorites" : "Add to Favorites"}>
                      <Star
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteTool("circle"); }}
                        className={`h-3.5 w-3.5 cursor-pointer p-0.5 rounded ${favoritedTools.includes("circle") ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`}
                      />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { selectTool("diamond"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${activeShapeTool === "diamond" ? "bg-brand text-white" : "text-slate-700 hover:bg-cream"}`}
                  >
                    <span className="flex items-center gap-2"><Diamond className="h-3.5 w-3.5" /> Decision Diamond</span>
                    <span title={favoritedTools.includes("diamond") ? "Remove from Favorites" : "Add to Favorites"}>
                      <Star
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteTool("diamond"); }}
                        className={`h-3.5 w-3.5 cursor-pointer p-0.5 rounded ${favoritedTools.includes("diamond") ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`}
                      />
                    </span>
                  </button>
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
                icon={activeLineTool === "line" ? Minus : activeLineTool === "bezier" ? Activity : ArrowRight}
                hasFlyout
                showTooltips={showTooltips}
              />
              {flyoutGroup === "lines" && (
                <div className="absolute left-full top-0 ml-2 w-56 rounded-2xl border border-line bg-white p-2 shadow-2xl z-50 animate-in fade-in space-y-1">
                  <p className="px-3 py-1 text-[10px] font-black uppercase text-muted tracking-wider">Line & Path Tools</p>
                  
                  {/* Straight Line Tool */}
                  <button
                    type="button"
                    onClick={() => { selectTool("line"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${activeLineTool === "line" ? "bg-brand text-white" : "text-slate-700 hover:bg-cream"}`}
                  >
                    <span className="flex items-center gap-2"><Minus className="h-3.5 w-3.5" /> Straight Line</span>
                    <span title={favoritedTools.includes("line") ? "Remove from Favorites" : "Add to Favorites"}>
                      <Star
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteTool("line"); }}
                        className={`h-3.5 w-3.5 cursor-pointer p-0.5 rounded ${favoritedTools.includes("line") ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`}
                      />
                    </span>
                  </button>

                  {/* Connector Arrow */}
                  <button
                    type="button"
                    onClick={() => { selectTool("arrow"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${activeLineTool === "arrow" ? "bg-brand text-white" : "text-slate-700 hover:bg-cream"}`}
                  >
                    <span className="flex items-center gap-2"><ArrowRight className="h-3.5 w-3.5" /> Connector Arrow</span>
                    <span title={favoritedTools.includes("arrow") ? "Remove from Favorites" : "Add to Favorites"}>
                      <Star
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteTool("arrow"); }}
                        className={`h-3.5 w-3.5 cursor-pointer p-0.5 rounded ${favoritedTools.includes("arrow") ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`}
                      />
                    </span>
                  </button>

                  {/* Chart Pattern Path */}
                  <button
                    type="button"
                    onClick={() => { selectTool("bezier"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${activeLineTool === "bezier" ? "bg-brand text-white" : "text-slate-700 hover:bg-cream"}`}
                  >
                    <span className="flex items-center gap-2"><Activity className="h-3.5 w-3.5" /> Chart Pattern Path</span>
                    <span title={favoritedTools.includes("bezier") ? "Remove from Favorites" : "Add to Favorites"}>
                      <Star
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteTool("bezier"); }}
                        className={`h-3.5 w-3.5 cursor-pointer p-0.5 rounded ${favoritedTools.includes("bezier") ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`}
                      />
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* 5. TEXT & STICKY NOTES GROUP */}
            <div className="relative">
              <WhiteboardToolBtn
                active={activeTool === "text" || activeTool === "sticky"}
                onClick={() => selectTool(activeNoteTool)}
                onFlyoutToggle={() => setFlyoutGroup(flyoutGroup === "notes" ? null : "notes")}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setFlyoutGroup(flyoutGroup === "notes" ? null : "notes");
                }}
                title="Text & Sticky Notes (Click arrow or right-click to choose tool)"
                toolKey={activeNoteTool}
                icon={activeNoteTool === "sticky" ? StickyNote : Type}
                hasFlyout
                showTooltips={showTooltips}
              />
              {flyoutGroup === "notes" && (
                <div className="absolute left-full top-0 ml-2 w-52 rounded-2xl border border-line bg-white p-2 shadow-2xl z-50 animate-in fade-in space-y-1">
                  <p className="px-3 py-1 text-[10px] font-black uppercase text-muted tracking-wider">Text & Note Tools</p>

                  {/* Text Label */}
                  <button
                    type="button"
                    onClick={() => { selectTool("text"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${activeNoteTool === "text" ? "bg-brand text-white" : "text-slate-700 hover:bg-cream"}`}
                  >
                    <span className="flex items-center gap-2"><Type className="h-3.5 w-3.5" /> Text Label (T)</span>
                    <span title={favoritedTools.includes("text") ? "Remove from Favorites" : "Add to Favorites"}>
                      <Star
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteTool("text"); }}
                        className={`h-3.5 w-3.5 cursor-pointer p-0.5 rounded ${favoritedTools.includes("text") ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`}
                      />
                    </span>
                  </button>

                  {/* Sticky Note */}
                  <button
                    type="button"
                    onClick={() => { selectTool("sticky"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${activeNoteTool === "sticky" ? "bg-brand text-white" : "text-slate-700 hover:bg-cream"}`}
                  >
                    <span className="flex items-center gap-2"><StickyNote className="h-3.5 w-3.5" /> Sticky Note (N)</span>
                    <span title={favoritedTools.includes("sticky") ? "Remove from Favorites" : "Add to Favorites"}>
                      <Star
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteTool("sticky"); }}
                        className={`h-3.5 w-3.5 cursor-pointer p-0.5 rounded ${favoritedTools.includes("sticky") ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`}
                      />
                    </span>
                  </button>
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
            style={getToolCursorStyle(activeTool)}
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
                        setEditingShapeId(contextMenu.targetShape!.id);
                        setIsStickyMode(contextMenu.targetShape!.type === "sticky");
                        setTextValue(contextMenu.targetShape!.text || "");
                        if (contextMenu.targetShape!.stickyColor) setStickyColor(contextMenu.targetShape!.stickyColor);
                        setTextModalPos(contextMenu.targetShape!.points[0] || contextMenu.canvasPt);
                        setSelectedShapeIds([contextMenu.targetShape!.id]);
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
                    <TrendingUp className="h-3.5 w-3.5 text-slate-700" /> Long Position Box
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTool("short");
                      setContextMenu(null);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                  >
                    <TrendingDown className="h-3.5 w-3.5 text-slate-700" /> Short Position Box
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
                        onChange={(e) => setBgGrid(e.target.value as any)}
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

          {/* Text / Sticky Note Input Modal */}
          {textModalPos && (
            <div
              className="absolute z-40 rounded-2xl border border-line bg-white p-4 shadow-2xl space-y-3 animate-in fade-in"
              style={{
                left: Math.min(textModalPos.x * zoom + pan.x, (canvasRef.current?.width || 800) - 280),
                top: Math.min(textModalPos.y * zoom + pan.y, (canvasRef.current?.height || 600) - 200),
              }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                  {isStickyMode ? <StickyNote className="h-4 w-4 text-amber-500" /> : <Type className="h-4 w-4 text-brand" />}
                  {editingShapeId ? (isStickyMode ? "Edit Sticky Note" : "Edit Text Label") : (isStickyMode ? "Add Sticky Note" : "Add Teaching Text")}
                </p>
              </div>

              <textarea
                autoFocus
                rows={3}
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder={isStickyMode ? "Type teaching note or rule..." : "Type diagram label..."}
                className="w-64 rounded-xl border border-line bg-cream p-2.5 text-xs text-ink outline-none focus:border-brand resize-none"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTextModalPos(null);
                    setEditingShapeId(null);
                  }}
                  className="rounded-lg bg-cream px-3 py-1.5 text-xs font-bold text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddTextOrSticky}
                  className="btn-primary !py-1.5 !px-3 text-xs font-bold"
                >
                  {editingShapeId ? "Update Note" : "Save Note"}
                </button>
              </div>
            </div>
          )}

          {/* Floating Overlay Right Inspector & Photoshop-Style Layers Panel */}
          {isInspectorOpen ? (
            <aside className="absolute right-4 top-4 z-40 w-80 rounded-3xl border border-line bg-white/95 backdrop-blur-md p-4 flex flex-col justify-between shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-right duration-200">
              <div className="space-y-4">
                {/* Panel Header & Inspector / Layers Tab Switcher */}
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <div className="flex items-center gap-1 rounded-xl bg-cream p-1 border border-line">
                    <button
                      type="button"
                      onClick={() => setRightPanelTab("inspector")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold transition ${
                        rightPanelTab === "inspector" ? "bg-brand text-white shadow-sm" : "text-ink hover:text-brand"
                      }`}
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" /> Inspector
                    </button>
                    <button
                      type="button"
                      onClick={() => setRightPanelTab("layers")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold transition ${
                        rightPanelTab === "layers" ? "bg-brand text-white shadow-sm" : "text-ink hover:text-brand"
                      }`}
                    >
                      <Layers className="h-3.5 w-3.5" /> Layers ({shapes.length})
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsInspectorOpen(false)}
                    className="rounded-lg p-1 text-muted hover:text-ink hover:bg-cream transition"
                    title="Collapse Panel"
                  >
                    <PanelRightClose className="h-4 w-4" />
                  </button>
                </div>

                {/* TAB 1: INSPECTOR TAB */}
                {rightPanelTab === "inspector" && (
                  <div className="space-y-4">
                    {/* SELECTION TYPE & IDENTITY */}
                    <div className="rounded-2xl border border-line bg-cream p-3 space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center justify-between">
                        <span>Active Element</span>
                        {selectedShape?.isLocked && <span className="text-amber-600 font-extrabold flex items-center gap-0.5"><Lock className="h-3 w-3" /> Locked</span>}
                      </p>
                      <p className="font-bold text-xs text-ink uppercase flex items-center justify-between">
                        {selectedShape ? (
                          <span className="text-brand flex items-center gap-1.5">
                            {selectedShape.name || selectedShape.type}
                            {selectedShape.isLocked && <Lock className="h-3.5 w-3.5 text-amber-600" />}
                          </span>
                        ) : selectedShapeIds.length > 1 ? (
                          <span className="text-blue-600">{selectedShapeIds.length} Objects Selected</span>
                        ) : (
                          <span>Tool: {activeTool}</span>
                        )}
                      </p>
                    </div>

                    {/* EDITABLE NOTE / TEXT CONTENT IN INSPECTOR */}
                    {selectedShape && (selectedShape.type === "sticky" || selectedShape.type === "text") && (
                      <div className="rounded-2xl border border-line bg-cream p-3 space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted tracking-wider flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-ink">
                            <Edit3 className="h-3.5 w-3.5 text-brand" />
                            {selectedShape.type === "sticky" ? "Sticky Note Text" : "Text Label"}
                          </span>
                          {selectedShape.isLocked && <span className="text-amber-600 font-extrabold flex items-center gap-0.5"><Lock className="h-3 w-3" /> Locked</span>}
                        </label>
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
                          placeholder={selectedShape.type === "sticky" ? "Type note content..." : "Type text content..."}
                          className={`w-full rounded-xl border border-line bg-white p-2.5 text-xs text-ink outline-none focus:border-brand resize-none font-medium ${
                            selectedShape.isLocked ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        />
                      </div>
                    )}

                    {/* COLOR & STROKE APPEARANCE */}
                    <div className="space-y-3 border-b border-line pb-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted">Appearance</p>

                      {/* Stroke Palette */}
                      <div>
                        <label className="text-[11px] font-bold text-ink block mb-1.5">Stroke Color</label>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {PALETTE.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => applyColorToSelected(c)}
                              disabled={selectedShape?.isLocked}
                              className={`h-6 w-6 rounded-full transition-transform border border-line ${
                                strokeColor === c ? "scale-125 ring-2 ring-brand" : "hover:scale-110"
                              } ${selectedShape?.isLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                              style={{ background: c }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Sticky Note Colors (when sticky) */}
                      {(activeTool === "sticky" || selectedShape?.type === "sticky") && (
                        <div>
                          <label className="text-[11px] font-bold text-ink block mb-1.5">Sticky Note Color</label>
                          <div className="flex items-center gap-1.5">
                            {STICKY_COLORS.map((s) => (
                              <button
                                key={s.color}
                                type="button"
                                onClick={() => applyStickyColorToSelected(s.color)}
                                disabled={selectedShape?.isLocked}
                                className={`h-6 w-6 rounded-lg transition-transform border border-black/10 ${
                                  stickyColor === s.color ? "scale-125 ring-2 ring-brand" : "hover:scale-110"
                                } ${selectedShape?.isLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                                style={{ background: s.color }}
                                title={s.name}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stroke Thickness */}
                      <div>
                        <label className="text-[11px] font-bold text-ink flex items-center justify-between mb-1.5">
                          <span>Stroke Thickness</span>
                          <strong className="text-brand">{strokeWidth}px</strong>
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[1, 2, 4, 6].map((w) => (
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
                              className={`py-1.5 rounded-lg text-xs font-extrabold transition ${
                                strokeWidth === w ? "bg-brand text-white" : "bg-cream text-ink hover:bg-slate-200"
                              } ${selectedShape?.isLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                            >
                              {w}px
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Line Dash Style */}
                      <div>
                        <label className="text-[11px] font-bold text-ink block mb-1.5">Line Pattern</label>
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
                            className={`py-1.5 rounded-xl text-xs font-bold transition ${
                              lineStyle === "solid" ? "bg-ink text-white" : "bg-cream text-ink hover:bg-slate-200"
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
                            className={`py-1.5 rounded-xl text-xs font-bold transition ${
                              lineStyle === "dashed" ? "bg-ink text-white" : "bg-cream text-ink hover:bg-slate-200"
                            } ${selectedShape?.isLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                          >
                            Dashed
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* LOCK, LAYERING & OBJECT ACTIONS */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted">Object Actions</p>

                      {selectedShape ? (
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => toggleLockShape(selectedShape.id)}
                            className={`w-full flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition ${
                              selectedShape.isLocked
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                            }`}
                          >
                            {selectedShape.isLocked ? (
                              <><Unlock className="h-4 w-4" /> Unlock Object 🔓</>
                            ) : (
                              <><Lock className="h-4 w-4" /> Lock Object 🔒</>
                            )}
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => bringToFront(selectedShape.id)}
                              disabled={selectedShape.isLocked}
                              className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-cream py-2 text-xs font-bold text-ink hover:bg-white transition disabled:opacity-40"
                            >
                              <ArrowUp className="h-3.5 w-3.5 text-emerald-600" /> Bring Front
                            </button>
                            <button
                              type="button"
                              onClick={() => sendToBack(selectedShape.id)}
                              disabled={selectedShape.isLocked}
                              className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-cream py-2 text-xs font-bold text-ink hover:bg-white transition disabled:opacity-40"
                            >
                              <ArrowDown className="h-3.5 w-3.5 text-amber-600" /> Send Back
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => duplicateSelectedObject(selectedShape)}
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-line bg-cream py-2 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                          >
                            <Copy className="h-3.5 w-3.5 text-blue-600" /> Duplicate (Alt + Drag)
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteSelectedObject(selectedShape.id)}
                            disabled={selectedShape.isLocked}
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete Selected
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-muted italic">Click any shape on the canvas to inspect & manipulate its position, layer or lock state.</p>
                      )}
                    </div>
                  </div>
                )}

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

              {/* Panel Footer Stats */}
              <div className="border-t border-line pt-2.5 mt-3 text-[10px] text-muted flex items-center justify-between font-bold">
                <span>Total Layers: {shapes.length}</span>
                <span>Zoom: {Math.round(zoom * 100)}%</span>
              </div>
            </aside>
          ) : (
            /* COLLAPSED EXPAND BUTTON */
            <button
              type="button"
              onClick={() => setIsInspectorOpen(true)}
              className="absolute right-4 top-4 z-30 rounded-2xl border border-line bg-white p-2.5 text-ink shadow-2xl hover:bg-brand-light hover:text-brand transition animate-in fade-in"
              title="Expand Inspector & Layers Panel"
            >
              <PanelRightOpen className="h-5 w-5" />
            </button>
          )}
        </main>
      </div>
    </div>
  );
}

/* ========================================================================== */
/*                          WHITEBOARD DRAWING ENGINE                         */
/* ========================================================================== */

/** Visual SVG Preview for Templates and Saved Drafts */
function HubDiagramThumbnail({
  type,
  shapes,
}: {
  type?: "mindmap" | "smc" | "risk" | "eurusd" | "london";
  shapes?: Shape[];
}) {
  if (type === "mindmap") {
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

  if (type === "smc") {
    return (
      <svg className="w-full h-full" viewBox="0 0 200 120">
        <rect width="200" height="120" fill="#f8fafc" />
        {/* Price movement trend */}
        <polyline points="20,40 50,70 80,30 110,80 140,45 180,20" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Institutional Order Block */}
        <rect x="35" y="58" width="60" height="28" rx="4" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth="1.5" />
        <text x="65" y="75" textAnchor="middle" fill="#047857" fontSize="8" fontWeight="bold">OB Demand</text>
        {/* Liquidity Sweep Arrow */}
        <line x1="110" y1="80" x2="110" y2="105" stroke="#ef4444" strokeWidth="2" strokeDasharray="2 2" />
        <text x="110" y="114" textAnchor="middle" fill="#dc2626" fontSize="7" fontWeight="bold">Sweep ⚡</text>
      </svg>
    );
  }

  if (type === "risk") {
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

  if (type === "eurusd") {
    return (
      <svg className="w-full h-full" viewBox="0 0 200 120">
        <rect width="200" height="120" fill="#f8fafc" />
        {/* Candlesticks */}
        <line x1="35" y1="30" x2="35" y2="90" stroke="#ef4444" strokeWidth="1.5" />
        <rect x="28" y="45" width="14" height="35" fill="#ef4444" rx="2" />
        <line x1="60" y1="20" x2="60" y2="85" stroke="#10b981" strokeWidth="1.5" />
        <rect x="53" y="28" width="14" height="42" fill="#10b981" rx="2" />
        {/* BOS Line */}
        <line x1="50" y1="28" x2="180" y2="28" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3 3" />
        <text x="120" y="22" textAnchor="middle" fill="#2563eb" fontSize="8" fontWeight="bold">H4 BOS ↗</text>
        {/* FVG Box */}
        <rect x="80" y="45" width="85" height="30" rx="4" fill="rgba(245, 158, 11, 0.25)" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="122" y="63" textAnchor="middle" fill="#b45309" fontSize="8" fontWeight="bold">FVG Demand</text>
      </svg>
    );
  }

  if (type === "london") {
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

  // Dynamic / Default Draft Preview
  return (
    <svg className="w-full h-full" viewBox="0 0 200 120">
      <rect width="200" height="120" fill="#f8fafc" />
      {/* Background blueprint grid dots */}
      <circle cx="20" cy="20" r="1" fill="#cbd5e1" />
      <circle cx="60" cy="20" r="1" fill="#cbd5e1" />
      <circle cx="100" cy="20" r="1" fill="#cbd5e1" />
      <circle cx="140" cy="20" r="1" fill="#cbd5e1" />
      <circle cx="180" cy="20" r="1" fill="#cbd5e1" />
      <circle cx="20" cy="60" r="1" fill="#cbd5e1" />
      <circle cx="60" cy="60" r="1" fill="#cbd5e1" />
      <circle cx="100" cy="60" r="1" fill="#cbd5e1" />
      <circle cx="140" cy="60" r="1" fill="#cbd5e1" />
      <circle cx="180" cy="60" r="1" fill="#cbd5e1" />
      <circle cx="20" cy="100" r="1" fill="#cbd5e1" />
      <circle cx="60" cy="100" r="1" fill="#cbd5e1" />
      <circle cx="100" cy="100" r="1" fill="#cbd5e1" />
      <circle cx="140" cy="100" r="1" fill="#cbd5e1" />
      <circle cx="180" cy="100" r="1" fill="#cbd5e1" />

      {shapes && shapes.length > 0 ? (
        <g>
          {/* Stylized representation of user diagram */}
          <rect x="35" y="30" width="55" height="35" rx="4" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="1.5" />
          <line x1="100" y1="45" x2="160" y2="45" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />
          <polyline points="40,85 80,70 120,90 165,65" fill="none" stroke="#f43f5e" strokeWidth="2" />
          <rect x="130" y="70" width="45" height="28" rx="3" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
        </g>
      ) : (
        <g className="text-slate-400">
          <rect x="40" y="30" width="120" height="60" rx="8" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
          <text x="100" y="65" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">Blank Canvas</text>
        </g>
      )}
    </svg>
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
  hasFlyout,
  showTooltips,
}: {
  active: boolean;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onFlyoutToggle?: (e: React.MouseEvent) => void;
  title: string;
  toolKey: string;
  icon: React.ElementType;
  hasFlyout?: boolean;
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
      {showTooltips && isHovered && explanation && !hasFlyout && (
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
    case "arrow": return ArrowRight;
    case "bezier": return Activity;
    case "sticky": return StickyNote;
    case "text": return Type;
    case "eraser": return Eraser;
    case "zoom": return Search;
    case "fibo": return Percent;
    case "long": return TrendingUp;
    case "short": return TrendingDown;
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

/** Check hit test on 4 corner resize handle nodes */
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
  }

  const pad = 6;
  const corners: { handle: ResizeHandle; x: number; y: number }[] = [
    { handle: "tl", x: minX - pad, y: minY - pad },
    { handle: "tr", x: maxX + pad, y: minY - pad },
    { handle: "br", x: maxX + pad, y: maxY + pad },
    { handle: "bl", x: minX - pad, y: maxY + pad },
  ];

  const hit = corners.find((c) => Math.hypot(pt.x - c.x, pt.y - c.y) <= 12);
  return hit ? hit.handle : null;
}

/** Smoothly resizes shape points when user drags corner handle */
function resizeShapePoints(shape: Shape, handle: ResizeHandle, pt: { x: number; y: number }): Shape {
  const pts = shape.points;
  if (pts.length < 2) return shape;

  let newPts = [...pts];

  if (
    shape.type === "rectangle" ||
    shape.type === "circle" ||
    shape.type === "diamond" ||
    shape.type === "line" ||
    shape.type === "arrow" ||
    shape.type === "fibo" ||
    shape.type === "long" ||
    shape.type === "short"
  ) {
    let p0 = { ...pts[0] };
    let p1 = { ...pts[1] };

    if (handle === "br") {
      p1 = pt;
    } else if (handle === "tl") {
      p0 = pt;
    } else if (handle === "tr") {
      p1.x = pt.x;
      p0.y = pt.y;
    } else if (handle === "bl") {
      p0.x = pt.x;
      p1.y = pt.y;
    }

    newPts = [p0, p1];
  }

  return { ...shape, points: newPts };
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
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 12px Inter, sans-serif";
      const lines = shape.text.split("\n");
      lines.forEach((line, idx) => {
        ctx.fillText(line, p.x + 12, p.y + 26 + idx * 18, w - 24);
      });
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

    // Draw level lines & text tags
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
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.fillText(lvl.label, Math.max(x1, x2) + 8, ly + 4);
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

    // R:R Statistics Banner - Perfectly Aligned Text!
    const bannerY = yEntry - targetHeight - 22;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(minX, bannerY, boxW, 20);

    ctx.fillStyle = "#34d399";
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`LONG | Target: +${Math.round(targetHeight)} pips | Risk: ${Math.round(stopHeight)} pips | R:R 1:${defaultRiskReward.toFixed(1)}`, minX + boxW / 2, bannerY + 10);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
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

    // R:R Statistics Banner - Perfectly Aligned Text!
    const bannerY = yEntry - stopHeight - 22;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(minX, bannerY, boxW, 20);

    ctx.fillStyle = "#f43f5e";
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`SHORT | Risk: ${Math.round(stopHeight)} pips | Target: +${Math.round(targetHeight)} pips | R:R 1:${defaultRiskReward.toFixed(1)}`, minX + boxW / 2, bannerY + 10);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
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
    const w = pts[1].x - pts[0].x;
    const h = pts[1].y - pts[0].y;
    ctx.globalAlpha = 0.15;
    ctx.fillRect(pts[0].x, pts[0].y, w, h);
    ctx.globalAlpha = 1;
    ctx.strokeRect(pts[0].x, pts[0].y, w, h);
  } else if (shape.type === "circle" && pts.length >= 2) {
    const r = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, r, 0, Math.PI * 2);
    ctx.globalAlpha = 0.15;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.stroke();
  } else if (shape.type === "diamond" && pts.length >= 2) {
    const cx = (pts[0].x + pts[1].x) / 2;
    const cy = (pts[0].y + pts[1].y) / 2;
    const rx = Math.abs(pts[1].x - pts[0].x) / 2;
    const ry = Math.abs(pts[1].y - pts[0].y) / 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy - ry);
    ctx.lineTo(cx + rx, cy);
    ctx.lineTo(cx, cy + ry);
    ctx.lineTo(cx - rx, cy);
    ctx.closePath();
    ctx.globalAlpha = 0.15;
    ctx.fill();
    ctx.globalAlpha = 1;
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
    ctx.font = "bold 15px Inter, sans-serif";
    ctx.fillText(shape.text, pts[0].x, pts[0].y);
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

    // Corner Resize Handle Nodes (only if NOT locked)
    if (!shape.isLocked) {
      const corners = [
        { x: minX - pad, y: minY - pad },
        { x: maxX + pad, y: minY - pad },
        { x: maxX + pad, y: maxY + pad },
        { x: minX - pad, y: maxY + pad },
      ];
      corners.forEach((c) => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(c.x - 5, c.y - 5, 10, 10);
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.strokeRect(c.x - 5, c.y - 5, 10, 10);
      });
    }
  }
}

function makeSvgCursor(svg: string, x: number, y: number, fallback: string = "crosshair"): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${x} ${y}, ${fallback}`;
}

/** Generates dynamic contextual realistic minimalist Black & White mouse cursors for active whiteboard tools */
function getToolCursorStyle(tool: Tool): React.CSSProperties {
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
