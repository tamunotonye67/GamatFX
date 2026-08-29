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
  ArrowLeft,
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
  X,
  Plus,
  Settings,
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
  Sparkles,
  MousePointerClick,
  Crosshair,
  Save,
  FolderKanban,
  BookOpen,
  Clock,
  FileText,
} from "lucide-react";

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
    desc: "Add colorful Miro-style sticky notes to write trading rules, teaching tips, or trade setups.",
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

const INITIAL_TABS: DiagramTab[] = [
  { id: "blank", name: "Blank Canvas" },
  { id: "mindmap", name: "Forex Basics Mind Map" },
  { id: "smc_diag", name: "SMC Liquidity Diagram" },
  { id: "risk_diag", name: "Risk Management Matrix" },
];

/* ========================================================================== */
/*                             MAIN COMPONENT                                 */
/* ========================================================================== */

export default function WhiteboardPage() {
  const [tabs, setTabs] = useState<DiagramTab[]>(INITIAL_TABS);
  const [activeTabId, setActiveTabId] = useState("blank");
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
  const [snapToGrid, setSnapToGrid] = useState(false);
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
  const [maxTabPromptOpen, setMaxTabPromptOpen] = useState(false);

  // Custom New Tab Naming Modal State
  const [newTabModalOpen, setNewTabModalOpen] = useState(false);
  const [newTabInputName, setNewTabInputName] = useState("");

  const [flyoutGroup, setFlyoutGroup] = useState<"shapes" | "lines" | "pen" | "forex" | "single" | null>(null);

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

  // Text Modal Input State
  const [textModalPos, setTextModalPos] = useState<{ x: number; y: number } | null>(null);
  const [textValue, setTextValue] = useState("");
  const [isStickyMode, setIsStickyMode] = useState(false);

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
          id: `miro_dup_${Date.now()}_${Math.random()}`,
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

      if (e.key === "Escape") {
        setSelectedShapeIds([]);
        setActiveTool("select");
        setContextMenu(null);
        setDiagramsMenuOpen(false);
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
        else if (key === "n") { setActiveTool("sticky"); showToast("Tool: Sticky Note (N)"); }
        else if (key === "t") { setActiveTool("text"); showToast("Tool: Text Label (T)"); }
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
        renderMiroShape(ctx, s, selectedShapeIds.includes(s.id), defaultRiskReward);
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

    if (snapToGrid) {
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
        if (e.altKey && !hitShape.isLocked) {
          const duplicatedShape: Shape = {
            ...hitShape,
            id: `miro_dup_${Date.now()}`,
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
        setMarqueeBox({ x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y });
      }
      return;
    }

    if (activeTool === "bezier") {
      if (currentShape && currentShape.type === "bezier") {
        setCurrentShape({
          ...currentShape,
          points: [...currentShape.points, pt],
        });
      } else {
        const newShape: Shape = {
          id: `miro_${Date.now()}`,
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
      setIsStickyMode(false);
      setTextModalPos(pt);
      return;
    }

    if (activeTool === "sticky") {
      setIsStickyMode(true);
      setTextModalPos(pt);
      return;
    }

    const defaultForexColor =
      activeTool === "long" ? "#10b981" : activeTool === "short" ? "#dc3545" : strokeColor;

    const newShape: Shape = {
      id: `miro_${Date.now()}`,
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

    if (activeResizeHandle) {
      setShapes((prev) =>
        prev.map((s) => {
          if (s.id !== activeResizeHandle.shapeId || s.isLocked) return s;
          return resizeShapePoints(s, activeResizeHandle.handle, pt);
        })
      );
      return;
    }

    if (activeTool === "eraser" && e.buttons === 1) {
      performPrecisionErasing(pt, eraserSize);
      return;
    }

    if (marqueeBox) {
      setMarqueeBox((prev) => (prev ? { ...prev, x2: pt.x, y2: pt.y } : null));
      return;
    }

    if (isDraggingShape.current && selectedShapeIds.length > 0) {
      const dx = pt.x - dragStartPt.current.x;
      const dy = pt.y - dragStartPt.current.y;
      dragStartPt.current = pt;

      setShapes((prev) =>
        prev.map((s) => {
          if (!selectedShapeIds.includes(s.id) || s.isLocked) return s;
          return {
            ...s,
            points: s.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
          };
        })
      );
      return;
    }

    if (!isDrawing.current || !currentShape) return;

    if (currentShape.type === "pencil" || currentShape.type === "highlighter") {
      setCurrentShape({
        ...currentShape,
        points: [...currentShape.points, pt],
      });
    } else if (currentShape.type === "bezier") {
      const updatedPts = [...currentShape.points];
      updatedPts[updatedPts.length - 1] = pt;
      setCurrentShape({
        ...currentShape,
        points: updatedPts,
      });
    } else {
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

    if (marqueeBox) {
      const minX = Math.min(marqueeBox.x1, marqueeBox.x2);
      const maxX = Math.max(marqueeBox.x1, marqueeBox.x2);
      const minY = Math.min(marqueeBox.y1, marqueeBox.y2);
      const maxY = Math.max(marqueeBox.y1, marqueeBox.y2);

      const selected = shapes.filter((s) => {
        if (s.isHidden) return false;
        const shapeMinX = Math.min(...s.points.map((p) => p.x));
        const shapeMaxX = Math.max(...s.points.map((p) => p.x));
        const shapeMinY = Math.min(...s.points.map((p) => p.y));
        const shapeMaxY = Math.max(...s.points.map((p) => p.y));
        return shapeMinX >= minX && shapeMaxX <= maxX && shapeMinY >= minY && shapeMaxY <= maxY;
      });

      setSelectedShapeIds(selected.map((s) => s.id));
      setMarqueeBox(null);
      if (selected.length > 0) showToast(`Selected ${selected.length} object(s)!`);
      return;
    }

    if (activeTool === "bezier") return;

    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (currentShape) {
      setShapes((prev) => [...prev, currentShape]);
      setCurrentShape(null);
      setRedoStack([]);
    }
  };

  const handleDoubleClick = () => {
    if (currentShape && currentShape.type === "bezier") {
      setShapes((prev) => [...prev, currentShape]);
      setCurrentShape(null);
      setRedoStack([]);
      showToast("Chart Pattern Path completed!");
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

    const newShape: Shape = {
      id: `miro_${Date.now()}`,
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
  };

  /* Context Menu Object Layering & Duplicate Actions */
  const duplicateSelectedObject = (shapeToDup: Shape) => {
    const dup: Shape = {
      ...shapeToDup,
      id: `miro_dup_${Date.now()}`,
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
  const handleAddNewTab = () => {
    if (tabs.length >= 5) {
      setMaxTabPromptOpen(true);
      showToast("Tab limit reached! (Maximum 5 tabs)");
      return;
    }
    setNewTabInputName(`Canvas ${tabs.length + 1}`);
    setNewTabModalOpen(true);
  };

  const handleConfirmCreateTab = () => {
    const finalName = newTabInputName.trim() || `Canvas ${tabs.length + 1}`;
    const newId = `tab_${Date.now()}`;
    setTabs((prev) => [...prev, { id: newId, name: finalName }]);
    setActiveTabId(newId);
    setShapes([]);
    setNewTabModalOpen(false);
    showToast(`Created new diagram tab: ${finalName}`);
  };

  const handleCloseTab = (tabIdToClose: string) => {
    if (tabs.length === 1) {
      showToast("Cannot close the only open tab.");
      return;
    }

    const tabToClose = tabs.find((t) => t.id === tabIdToClose);
    if (tabToClose) {
      // Move to Trash Bin instead of permanent deletion!
      const trashedItem: TrashedTab = {
        id: tabToClose.id,
        name: tabToClose.name,
        shapes: [...shapes],
        deletedAt: Date.now(),
      };
      setTrashedTabs((prev) => [trashedItem, ...prev.filter((t) => t.id !== tabToClose.id)]);
    }

    const updatedTabs = tabs.filter((t) => t.id !== tabIdToClose);
    setTabs(updatedTabs);
    if (activeTabId === tabIdToClose) {
      setActiveTabId(updatedTabs[updatedTabs.length - 1].id);
      handleSelectTab(updatedTabs[updatedTabs.length - 1].id);
    }
    showToast(`Moved "${tabToClose?.name || 'Tab'}" to Trash (Auto-purges in 30 days)`);
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
      handleSelectTab("mindmap");
    } else if (sampleType === "smc") {
      handleSelectTab("smc_diag");
    } else if (sampleType === "risk") {
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

  return (
    <div ref={containerRef} className="fixed inset-0 h-screen w-screen bg-slate-900 text-ink font-sans flex flex-col overflow-hidden select-none touch-none">
      {/* Toast Notification */}
      {statusMsg && (
        <div className="fixed top-20 right-6 z-50 rounded-2xl bg-brand text-white px-5 py-3 shadow-2xl flex items-center gap-2 font-bold text-xs animate-in fade-in slide-in-from-top-3">
          <Check className="h-4 w-4" /> {statusMsg}
        </div>
      )}

      {/* Maximum 5 Tabs Limit Prompt Modal */}
      {maxTabPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm animate-in fade-in">
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
              className="btn-primary w-full !py-2.5 text-xs font-bold"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}

      {/* Custom New Tab Name Input Modal */}
      {newTabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-line bg-white p-6 shadow-2xl space-y-4 text-center">
            <div className="h-12 w-12 rounded-full bg-brand-light text-brand flex items-center justify-center mx-auto font-extrabold">
              <Plus className="h-6 w-6" />
            </div>
            <h3 className="font-display font-extrabold text-ink text-base">Name Your Diagram Tab</h3>
            <p className="text-xs text-muted leading-relaxed font-medium">
              Enter a custom name for your new whiteboard tab:
            </p>
            <input
              autoFocus
              type="text"
              value={newTabInputName}
              onChange={(e) => setNewTabInputName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmCreateTab();
              }}
              placeholder="e.g. EUR/USD SMC Setup"
              className="w-full rounded-xl border border-line bg-cream p-3 text-xs font-bold text-ink outline-none focus:border-brand"
            />
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewTabModalOpen(false)}
                className="flex-1 rounded-xl bg-cream py-2.5 text-xs font-bold text-muted hover:text-ink transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateTab}
                className="btn-primary flex-1 !py-2.5 text-xs font-bold"
              >
                Create Tab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TradingView-Style Floating Draggable Favorites Toolbar */}
      {favoritedTools.length > 0 && showFavoritesBar && (
        <div
          className="fixed z-50 flex items-center gap-1 rounded-2xl border border-line bg-white/95 backdrop-blur-md p-1.5 shadow-2xl animate-in fade-in cursor-default"
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
      <header className="h-16 border-b border-line bg-white px-5 flex items-center justify-between gap-4 shrink-0 z-30 shadow-sm">
        {/* Left Section: GAMAT Logo */}
        <div className="flex items-center gap-3">
          <Logo variant="dark" />
        </div>

        {/* Center Section: Dynamic Tool Options & Properties Bar */}
        <div className="flex-1 flex justify-center max-w-2xl">
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-cream px-4 py-1.5 shadow-inner">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted shrink-0">
              Tool: <strong className="text-brand uppercase">{activeTool}</strong>
            </span>

            <span className="h-4 w-px bg-line" />

            {/* Stroke Color Palette */}
            <div className="flex items-center gap-1">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => applyColorToSelected(c)}
                  className={`h-5 w-5 rounded-full transition-transform border border-line ${
                    strokeColor === c ? "scale-125 ring-2 ring-brand" : "hover:scale-110"
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>

            {/* Sticky Note Colors (when activeTool === sticky) */}
            {activeTool === "sticky" && (
              <>
                <span className="h-4 w-px bg-line" />
                <div className="flex items-center gap-1">
                  {STICKY_COLORS.map((s) => (
                    <button
                      key={s.color}
                      type="button"
                      onClick={() => applyStickyColorToSelected(s.color)}
                      className={`h-5 w-5 rounded-md transition-transform border border-black/10 ${
                        stickyColor === s.color ? "scale-125 ring-2 ring-brand" : "hover:scale-110"
                      }`}
                      style={{ background: s.color }}
                      title={`${s.name} Sticky Note`}
                    />
                  ))}
                </div>
              </>
            )}

            <span className="h-4 w-px bg-line" />

            {/* Stroke Width Selector */}
            <div className="flex items-center gap-1 text-xs">
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
                  className={`h-6 w-6 rounded-md text-[10px] font-extrabold transition ${
                    strokeWidth === w ? "bg-brand text-white" : "bg-white text-ink hover:bg-white/80"
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>

            <span className="h-4 w-px bg-line" />

            {/* Line Style (Solid / Dashed) */}
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setLineStyle("solid");
                  if (selectedShapeIds.length > 0) {
                    setShapes((prev) => prev.map((s) => (selectedShapeIds.includes(s.id) && !s.isLocked ? { ...s, lineStyle: "solid" } : s)));
                  }
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                  lineStyle === "solid" ? "bg-ink text-white" : "text-muted hover:text-ink"
                }`}
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
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                  lineStyle === "dashed" ? "bg-ink text-white" : "text-muted hover:text-ink"
                }`}
              >
                Dashed
              </button>
            </div>
          </div>
        </div>

        {/* Right Section: Canvas Theme -> Export -> Inspector Toggle -> Settings -> Fullscreen */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Canvas Background Theme Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setBgOpen(!bgOpen)}
              className="rounded-xl border border-line bg-cream px-3 py-1.5 text-xs font-bold text-ink hover:bg-white transition flex items-center gap-1.5"
            >
              <Grid className="h-4 w-4 text-slate-700" /> Canvas Theme <ChevronDown className="h-3.5 w-3.5 text-muted" />
            </button>

            {bgOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-line bg-white p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
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

          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportOpen(!exportOpen)}
              className="btn-primary !py-2 text-xs font-bold flex items-center gap-1.5"
            >
              <Download className="h-4 w-4" /> Export <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {exportOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl border border-line bg-white p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
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

          {/* Inspector Panel Toggle Button */}
          <button
            type="button"
            onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            className={`rounded-xl border p-2 transition ${
              isInspectorOpen ? "border-brand bg-brand-light text-brand" : "border-line bg-cream text-ink hover:bg-white"
            }`}
            title="Toggle Floating Inspector & Layers Panel"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>

          {/* Whiteboard Settings Preferences Button */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="rounded-xl border border-line bg-cream p-2 text-ink hover:bg-white transition"
            title="Whiteboard Preferences Settings"
          >
            <Settings className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-xl border border-line bg-cream p-2 text-ink hover:bg-white transition"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Sub-Header Drag-and-Drop Reorderable Tabs Bar + Right Action Features */}
      <div className="h-10 border-b border-line bg-slate-100 px-4 flex items-center justify-between gap-3 shrink-0 z-30 relative">
        {/* Left Side: Back Home & Active Tabs List */}
        <div className="flex items-center gap-3 shrink-0 max-w-[65vw]">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center justify-center rounded-xl border border-line bg-white p-1.5 text-ink hover:bg-brand-light hover:text-brand transition shrink-0"
            title="Back to GAMAT FX Website"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Vertical Separator Line */}
          <span className="h-5 w-px bg-line/80 shrink-0" />

          {/* Diagram Tabs Bar with Drag & Drop Reordering (Locally Scrollable) */}
          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto py-1 max-w-[50vw] scrollbar-none">
            {tabs.map((tab, idx) => (
              <div
                key={tab.id}
                draggable
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
                className={`group flex items-center gap-1.5 rounded-t-xl px-3 py-1 text-xs font-bold cursor-grab active:cursor-grabbing transition-all border-t border-x shrink-0 ${
                  activeTabId === tab.id
                    ? "bg-white text-brand border-line shadow-sm"
                    : "border-transparent text-muted hover:text-ink hover:bg-white/60"
                }`}
                title={`Drag to reorder "${tab.name}"`}
              >
                <GripVertical className="h-3 w-3 text-slate-300 group-hover:text-slate-500 opacity-60 shrink-0" />
                {/* Ellipsis Truncated Tab Name */}
                <span className="truncate max-w-[110px] inline-block align-bottom">
                  {tab.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(tab.id);
                  }}
                  className="rounded-full p-0.5 opacity-60 hover:opacity-100 hover:bg-rose-100 hover:text-rose-600 transition"
                  title="Move to Trash"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* New Tab Button */}
            <button
              type="button"
              onClick={handleAddNewTab}
              className="flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-2 py-1 text-xs font-bold text-muted hover:border-brand hover:text-brand hover:bg-white transition ml-1 shrink-0"
              title="Create New Diagram Tab (Max 5)"
            >
              <Plus className="h-3.5 w-3.5" /> New Tab
            </button>
          </div>
        </div>

        {/* Right Side Action: Single Working Dropdown Menu for Drafts, Samples & Trash */}
        <div className="relative shrink-0 ml-auto z-40">
          {/* Unified Dropdown Button with Chevron Icon */}
          <button
            type="button"
            onClick={() => setDiagramsMenuOpen(!diagramsMenuOpen)}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-1 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand hover:border-brand transition shadow-sm"
            title="Click to view Drafts, Samples & Trash"
          >
            <FolderKanban className="h-4 w-4 text-slate-700" />
            <span>Diagram Options</span>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${diagramsMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Unified Popover Dropdown Menu */}
          {diagramsMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-84 rounded-2xl border border-line bg-white p-3.5 shadow-2xl z-50 animate-in fade-in space-y-3">
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
                    <span>🧠 Forex Basics Mind Map</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { loadSampleClassChart("smc"); setDiagramsMenuOpen(false); }}
                    className="flex w-full items-center justify-between rounded-xl border border-line p-2 text-left text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                  >
                    <span>⚡ SMC Order Block & Liquidity</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { loadSampleClassChart("risk"); setDiagramsMenuOpen(false); }}
                    className="flex w-full items-center justify-between rounded-xl border border-line p-2 text-left text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                  >
                    <span>🛡️ Risk Management Matrix</span>
                  </button>

                  <p className="text-[10px] font-black uppercase text-muted tracking-wider pt-2">Live Class Chart Analysis</p>

                  <button
                    type="button"
                    onClick={() => { loadSampleClassChart("class_chart_eurusd"); setDiagramsMenuOpen(false); }}
                    className="flex w-full items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-2 text-left text-xs font-bold text-blue-900 hover:bg-blue-100 transition"
                  >
                    <div>
                      <p className="font-extrabold text-blue-950">📈 EUR/USD H4 BOS & FVG Class Chart</p>
                      <p className="text-[10px] text-blue-700 font-normal">Candlesticks, Break of Structure line, FVG box & Buy Limit</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { loadSampleClassChart("sample_london_sweep"); setDiagramsMenuOpen(false); }}
                    className="flex w-full items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-2 text-left text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition"
                  >
                    <div>
                      <p className="font-extrabold text-emerald-950">📉 London Asian Sweep Class Setup</p>
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
      </div>

      {/* Main Miro Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar Dock */}
        <aside className="w-14 border-r border-line bg-white p-1.5 flex flex-col items-center justify-between gap-2 shrink-0 z-20 shadow-md">
          <div className="space-y-1 w-full">
            <MiroToolBtn
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
            <MiroToolBtn
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
              <MiroToolBtn
                active={["fibo", "long", "short"].includes(activeTool)}
                onClick={() => setActiveTool(activeForexTool)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setFlyoutGroup(flyoutGroup === "forex" ? null : "forex");
                }}
                title="Forex Trading Tools (Right click to choose tool or favorite)"
                toolKey={activeForexTool}
                icon={
                  activeForexTool === "long"
                    ? TrendingUp
                    : activeForexTool === "short"
                    ? TrendingDown
                    : Percent
                }
                badge="FX"
                hasFlyout
                showTooltips={showTooltips}
              />

              {flyoutGroup === "forex" && (
                <div className="absolute left-full top-0 ml-2 w-56 rounded-2xl border border-line bg-white p-2 shadow-2xl z-50 animate-in fade-in space-y-1">
                  <p className="px-3 py-1 text-[10px] font-black uppercase text-muted tracking-wider">Forex Tools</p>

                  {/* 1. Fibonacci Retracement */}
                  <button
                    type="button"
                    onClick={() => { setActiveForexTool("fibo"); setActiveTool("fibo"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition ${
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
                    onClick={() => { setActiveForexTool("long"); setActiveTool("long"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition ${
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
                    onClick={() => { setActiveForexTool("short"); setActiveTool("short"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition ${
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
              <MiroToolBtn
                active={activeTool === "pencil" || activeTool === "highlighter"}
                onClick={() => setActiveTool(activePenTool)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setFlyoutGroup(flyoutGroup === "pen" ? null : "pen");
                }}
                title="Freehand Pen (Right click to change tool or favorite)"
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
                    onClick={() => { setActivePenTool("pencil"); setActiveTool("pencil"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition ${activePenTool === "pencil" ? "bg-brand text-white" : "text-slate-700 hover:bg-cream"}`}
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
                    onClick={() => { setActivePenTool("highlighter"); setActiveTool("highlighter"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition ${activePenTool === "highlighter" ? "bg-brand text-white" : "text-slate-700 hover:bg-cream"}`}
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
              <MiroToolBtn
                active={activeTool === "rectangle" || activeTool === "circle" || activeTool === "diamond"}
                onClick={() => setActiveTool(activeShapeTool)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setFlyoutGroup(flyoutGroup === "shapes" ? null : "shapes");
                }}
                title="Geometric Shapes (Right click to change shape or favorite)"
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
                    onClick={() => { setActiveShapeTool("rectangle"); setActiveTool("rectangle"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition ${activeShapeTool === "rectangle" ? "bg-brand text-white" : "text-slate-700 hover:bg-cream"}`}
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
                    onClick={() => { setActiveShapeTool("circle"); setActiveTool("circle"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition ${activeShapeTool === "circle" ? "bg-brand text-white" : "text-slate-700 hover:bg-cream"}`}
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
                    onClick={() => { setActiveShapeTool("diamond"); setActiveTool("diamond"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition ${activeShapeTool === "diamond" ? "bg-brand text-white" : "text-slate-700 hover:bg-cream"}`}
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
              <MiroToolBtn
                active={activeTool === "line" || activeTool === "arrow" || activeTool === "bezier"}
                onClick={() => setActiveTool(activeLineTool)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setFlyoutGroup(flyoutGroup === "lines" ? null : "lines");
                }}
                title="Lines & Paths (Right click to change line type or favorite)"
                toolKey={activeLineTool}
                icon={activeLineTool === "line" ? Minus : activeLineTool === "bezier" ? Activity : ArrowRight}
                badge={activeLineTool === "bezier" ? "PATH" : undefined}
                hasFlyout
                showTooltips={showTooltips}
              />
              {flyoutGroup === "lines" && (
                <div className="absolute left-full top-0 ml-2 w-56 rounded-2xl border border-line bg-white p-2 shadow-2xl z-50 animate-in fade-in space-y-1">
                  <p className="px-3 py-1 text-[10px] font-black uppercase text-muted tracking-wider">Line & Path Tools</p>
                  
                  {/* Straight Line Tool */}
                  <button
                    type="button"
                    onClick={() => { setActiveLineTool("line"); setActiveTool("line"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition ${activeLineTool === "line" ? "bg-brand text-white" : "text-slate-700 hover:bg-cream"}`}
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
                    onClick={() => { setActiveLineTool("arrow"); setActiveTool("arrow"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition ${activeLineTool === "arrow" ? "bg-brand text-white" : "text-slate-700 hover:bg-cream"}`}
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
                    onClick={() => { setActiveLineTool("bezier"); setActiveTool("bezier"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition ${activeLineTool === "bezier" ? "bg-brand text-white" : "text-slate-700 hover:bg-cream"}`}
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

            <div className="relative">
              <MiroToolBtn
                active={activeTool === "sticky"}
                onClick={() => setActiveTool("sticky")}
                onContextMenu={(e) => {
                  e.preventDefault();
                  toggleFavoriteTool("sticky");
                }}
                title="Sticky Note (Right click to favorite)"
                toolKey="sticky"
                icon={StickyNote}
                badge="NOTE"
                showTooltips={showTooltips}
              />
            </div>

            <div className="relative">
              <MiroToolBtn
                active={activeTool === "text"}
                onClick={() => setActiveTool("text")}
                onContextMenu={(e) => {
                  e.preventDefault();
                  toggleFavoriteTool("text");
                }}
                title="Text Label (Right click to favorite)"
                toolKey="text"
                icon={Type}
                showTooltips={showTooltips}
              />
            </div>

            <div className="relative">
              <MiroToolBtn
                active={activeTool === "eraser"}
                onClick={() => setActiveTool("eraser")}
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
              <MiroToolBtn
                active={activeTool === "zoom"}
                onClick={() => setActiveTool("zoom")}
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
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={handleUndo}
                disabled={shapes.length === 0}
                className="h-8 rounded-xl flex items-center justify-center text-slate-700 hover:bg-cream disabled:opacity-30"
                title="Undo (Ctrl + Z)"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="h-8 rounded-xl flex items-center justify-center text-slate-700 hover:bg-cream disabled:opacity-30"
                title="Redo (Ctrl + Y)"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleClear}
              disabled={shapes.length === 0}
              className="w-full h-8 rounded-xl flex items-center justify-center text-rose-600 hover:bg-rose-50 disabled:opacity-30"
              title="Clear Whiteboard"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </aside>

        {/* Central Miro Drawing Canvas */}
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
                        setIsStickyMode(contextMenu.targetShape?.type === "sticky");
                        setTextValue(contextMenu.targetShape?.text || "");
                        setTextModalPos(contextMenu.canvasPt);
                        setContextMenu(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-brand" /> Edit Text
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
                    <Sparkles className="h-3.5 w-3.5" /> General & UI
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
                  {isStickyMode ? "Add Sticky Note" : "Add Teaching Text"}
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
                  onClick={() => setTextModalPos(null)}
                  className="rounded-lg bg-cream px-3 py-1.5 text-xs font-bold text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddTextOrSticky}
                  className="btn-primary !py-1.5 !px-3 text-xs font-bold"
                >
                  Save Note
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
/*                             MIRO DRAWING ENGINE                            */
/* ========================================================================== */

function MiroToolBtn({
  active,
  onClick,
  onContextMenu,
  title,
  toolKey,
  icon: Icon,
  badge,
  hasFlyout,
  showTooltips,
}: {
  active: boolean;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  title: string;
  toolKey: string;
  icon: React.ElementType;
  badge?: string;
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
        onClick={onClick}
        onContextMenu={onContextMenu}
        title={explanation?.title || title}
        className={`relative h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
          active
            ? "bg-brand text-white shadow-md shadow-brand/20 scale-105"
            : "text-slate-700 hover:bg-cream hover:text-ink"
        }`}
      >
        <Icon className="h-4 w-4" />
        {badge && (
          <span className="absolute -top-1 -right-1 text-[7px] font-black uppercase tracking-tighter bg-amber-400 text-slate-950 px-0.5 rounded">
            {badge}
          </span>
        )}
        {hasFlyout && (
          <ChevronRight className="absolute right-0.5 bottom-0.5 h-2.5 w-2.5 opacity-60" />
        )}
      </button>

      {/* Rich Interactive Tooltip Popover with GIF-Style Animated Visual Illustration */}
      {showTooltips && isHovered && explanation && (
        <div className="absolute left-full top-0 ml-3 w-64 rounded-2xl border border-slate-700 bg-slate-900 text-white p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-left-2 pointer-events-none space-y-2.5">
          {/* Animated Visual GIF-Style Illustration Container */}
          <div className="w-full h-24 rounded-xl border border-slate-800 bg-slate-950/80 flex items-center justify-center overflow-hidden relative">
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
            <p className="text-[11px] text-slate-300 leading-snug font-medium">{explanation.desc}</p>
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
      <svg className="w-full h-full" viewBox="0 0 160 90">
        <line x1="20" y1="15" x2="140" y2="15" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x="142" y="18" fill="#f43f5e" fontSize="8" fontWeight="bold">0.0%</text>
        <line x1="20" y1="35" x2="140" y2="35" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="142" y="38" fill="#f59e0b" fontSize="8" fontWeight="bold">0.382</text>
        <rect x="20" y="45" width="120" height="15" fill="rgba(234, 179, 8, 0.25)" />
        <line x1="20" y1="45" x2="140" y2="45" stroke="#eab308" strokeWidth="2" />
        <text x="142" y="48" fill="#eab308" fontSize="8" fontWeight="bold">0.50</text>
        <line x1="20" y1="60" x2="140" y2="60" stroke="#10b981" strokeWidth="2" className="animate-pulse" />
        <text x="142" y="63" fill="#10b981" fontSize="8" fontWeight="bold">0.618</text>
        <line x1="20" y1="75" x2="140" y2="75" stroke="#3b82f6" strokeWidth="1.5" />
        <text x="142" y="78" fill="#3b82f6" fontSize="8" fontWeight="bold">1.00</text>
      </svg>
    );
  }

  if (toolKey === "long") {
    return (
      <svg className="w-full h-full" viewBox="0 0 160 90">
        <rect x="30" y="15" width="100" height="30" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth="1.5" />
        <text x="80" y="34" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold">TP: +90 pips</text>
        <line x1="30" y1="45" x2="130" y2="45" stroke="#3b82f6" strokeWidth="2.5" />
        <rect x="30" y="45" width="100" height="25" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth="1.5" />
        <text x="80" y="61" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">SL: -30 pips (R:R 1:3)</text>
      </svg>
    );
  }

  if (toolKey === "short") {
    return (
      <svg className="w-full h-full" viewBox="0 0 160 90">
        <rect x="30" y="15" width="100" height="25" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth="1.5" />
        <text x="80" y="31" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">SL: -25 pips (R:R 1:3)</text>
        <line x1="30" y1="40" x2="130" y2="40" stroke="#3b82f6" strokeWidth="2.5" />
        <rect x="30" y="40" width="100" height="35" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth="1.5" />
        <text x="80" y="60" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold">TP: +75 pips</text>
      </svg>
    );
  }

  if (toolKey === "select") {
    return (
      <svg className="w-full h-full" viewBox="0 0 160 90">
        <rect x="35" y="20" width="90" height="50" rx="6" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="35" cy="20" r="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" />
        <circle cx="125" cy="20" r="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" />
        <circle cx="125" cy="70" r="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" />
        <circle cx="35" cy="70" r="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" />
        <g className="animate-pulse">
          <path d="M 125 70 L 140 82" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" />
          <polygon points="125,70 135,70 125,80" fill="#dc3545" />
        </g>
      </svg>
    );
  }

  if (toolKey === "pencil") {
    return (
      <svg className="w-full h-full" viewBox="0 0 160 90">
        <path d="M 20 60 Q 50 10, 80 50 T 140 30" fill="none" stroke="#dc3545" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
        <circle cx="140" cy="30" r="4" fill="#dc3545" />
      </svg>
    );
  }

  if (toolKey === "highlighter") {
    return (
      <svg className="w-full h-full" viewBox="0 0 160 90">
        <rect x="20" y="30" width="120" height="20" rx="4" fill="rgba(253, 224, 71, 0.4)" />
        <line x1="25" y1="40" x2="135" y2="40" stroke="#fef08a" strokeWidth="6" strokeLinecap="round" className="animate-pulse" />
      </svg>
    );
  }

  if (toolKey === "rectangle") {
    return (
      <svg className="w-full h-full" viewBox="0 0 160 90">
        <rect x="30" y="20" width="100" height="50" rx="8" fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth="2.5" className="animate-pulse" />
        <text x="80" y="50" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="bold">ORDER BLOCK</text>
      </svg>
    );
  }

  if (toolKey === "circle") {
    return (
      <svg className="w-full h-full" viewBox="0 0 160 90">
        <circle cx="80" cy="45" r="30" fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="2.5" className="animate-pulse" />
        <circle cx="80" cy="45" r="4" fill="#10b981" />
      </svg>
    );
  }

  if (toolKey === "diamond") {
    return (
      <svg className="w-full h-full" viewBox="0 0 160 90">
        <polygon points="80,15 130,45 80,75 30,45" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" strokeWidth="2.5" className="animate-pulse" />
        <text x="80" y="48" textAnchor="middle" fill="#fde68a" fontSize="9" fontWeight="bold">TRIGGER</text>
      </svg>
    );
  }

  if (toolKey === "line") {
    return (
      <svg className="w-full h-full" viewBox="0 0 160 90">
        <line x1="25" y1="65" x2="135" y2="25" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
      </svg>
    );
  }

  if (toolKey === "arrow") {
    return (
      <svg className="w-full h-full" viewBox="0 0 160 90">
        <line x1="25" y1="45" x2="125" y2="45" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        <polygon points="135,45 120,37 120,53" fill="#10b981" className="animate-pulse" />
      </svg>
    );
  }

  if (toolKey === "bezier") {
    return (
      <svg className="w-full h-full" viewBox="0 0 160 90">
        <polyline points="20,70 50,30 80,60 110,20 140,55" fill="none" stroke="#dc3545" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="20" cy="70" r="3.5" fill="#ffffff" stroke="#dc3545" strokeWidth="2" />
        <circle cx="50" cy="30" r="3.5" fill="#ffffff" stroke="#dc3545" strokeWidth="2" />
        <circle cx="80" cy="60" r="3.5" fill="#ffffff" stroke="#dc3545" strokeWidth="2" />
        <circle cx="110" cy="20" r="3.5" fill="#ffffff" stroke="#dc3545" strokeWidth="2" />
        <circle cx="140" cy="55" r="3.5" fill="#ffffff" stroke="#dc3545" strokeWidth="2" />
      </svg>
    );
  }

  if (toolKey === "sticky") {
    return (
      <svg className="w-full h-full" viewBox="0 0 160 90">
        <rect x="45" y="15" width="70" height="60" rx="4" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
        <line x1="55" y1="28" x2="105" y2="28" stroke="#854d0e" strokeWidth="2" strokeLinecap="round" />
        <line x1="55" y1="38" x2="95" y2="38" stroke="#854d0e" strokeWidth="2" strokeLinecap="round" />
        <line x1="55" y1="48" x2="100" y2="48" stroke="#854d0e" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (toolKey === "text") {
    return (
      <svg className="w-full h-full" viewBox="0 0 160 90">
        <text x="30" y="52" fill="#38bdf8" fontSize="16" fontWeight="bold" fontFamily="sans-serif">EUR/USD +150</text>
        <line x1="142" y1="34" x2="142" y2="54" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
      </svg>
    );
  }

  if (toolKey === "eraser") {
    return (
      <svg className="w-full h-full" viewBox="0 0 160 90">
        <path d="M 20 45 L 80 45" stroke="#475569" strokeWidth="3" strokeDasharray="4 4" />
        <path d="M 80 45 L 140 45" stroke="#f43f5e" strokeWidth="3" />
        <rect x="70" y="32" width="24" height="24" rx="4" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" className="animate-bounce" />
      </svg>
    );
  }

  if (toolKey === "zoom") {
    return (
      <svg className="w-full h-full" viewBox="0 0 160 90">
        <circle cx="70" cy="40" r="24" fill="none" stroke="#38bdf8" strokeWidth="3" />
        <line x1="88" y1="58" x2="110" y2="80" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
        <path d="M 55 45 L 65 35 L 75 48 L 85 30" fill="none" stroke="#10b981" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg className="w-full h-full" viewBox="0 0 160 90">
      <path d="M 30 45 Q 80 15, 130 45" fill="none" stroke="#38bdf8" strokeWidth="3" className="animate-pulse" />
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

/** Renders shapes, Miro sticky notes, and Forex Trading Tools on canvas */
function renderMiroShape(ctx: CanvasRenderingContext2D, shape: Shape, isSelected: boolean = false, defaultRiskReward: number = 3) {
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

/** Generates dynamic contextual mouse cursors for active whiteboard tools */
function getToolCursorStyle(tool: Tool): React.CSSProperties {
  if (tool === "hand") {
    return { cursor: "grab" };
  }
  if (tool === "select") {
    return { cursor: "default" };
  }
  if (tool === "eraser") {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>`;
    return { cursor: `url("data:image/svg+xml;utf8,${svg}") 4 20, pointer` };
  }
  if (tool === "pencil") {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23dc3545" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`;
    return { cursor: `url("data:image/svg+xml;utf8,${svg}") 2 22, crosshair` };
  }
  if (tool === "highlighter") {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11-6 6v3h3l6-6"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>`;
    return { cursor: `url("data:image/svg+xml;utf8,${svg}") 4 20, crosshair` };
  }
  if (tool === "text") {
    return { cursor: "text" };
  }
  if (tool === "sticky") {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23fef08a" stroke="%23ca8a04" stroke-width="1.5"><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z"/><path d="M14 3v5a1 1 0 0 0 1 1h5"/></svg>`;
    return { cursor: `url("data:image/svg+xml;utf8,${svg}") 4 4, copy` };
  }
  if (tool === "zoom") {
    return { cursor: "zoom-in" };
  }
  return { cursor: "crosshair" };
}
