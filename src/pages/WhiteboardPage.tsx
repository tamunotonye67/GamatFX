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
  | "arrow"
  | "bezier"
  | "text"
  | "eraser"
  | "zoom";

type StickyColor = "#fef08a" | "#fbcfe8" | "#bae6fd" | "#bbf7d0" | "#ddd6fe";

type Shape = {
  id: string;
  type: Tool;
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

  const [activeTool, setActiveTool] = useState<Tool>("pencil");
  const [activeShapeTool, setActiveShapeTool] = useState<"rectangle" | "circle" | "diamond">("rectangle");
  const [activeLineTool, setActiveLineTool] = useState<"arrow" | "bezier">("arrow");
  const [activePenTool, setActivePenTool] = useState<"pencil" | "highlighter">("pencil");

  // TradingView Style Floating Favorites Toolbar State (Floats anywhere on whole page!)
  const [favoritedTools, setFavoritedTools] = useState<Tool[]>(["select", "pencil", "rectangle", "bezier", "sticky"]);
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

  // Preference Setting: Show Tooltip Explanations
  const [showTooltips, setShowTooltips] = useState(true);

  // Inspector & Photoshop Layers Panel State
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<"inspector" | "layers">("inspector");

  // Modals & Flyout Dropdowns
  const [exportOpen, setExportOpen] = useState(false);
  const [bgOpen, setBgOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [maxTabPromptOpen, setMaxTabPromptOpen] = useState(false);
  const [flyoutGroup, setFlyoutGroup] = useState<"shapes" | "lines" | "pen" | "single" | null>(null);

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

  /* -------------------------- Page Scroll Lock Fix ------------------------- */

  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  /* -------------------------- Non-Passive Canvas Wheel Event --------------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleNonPassiveWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((z) => Math.min(3.0, Math.max(0.3, z * zoomFactor)));
    };

    canvas.addEventListener("wheel", handleNonPassiveWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", handleNonPassiveWheel);
    };
  }, []);

  /* -------------------------- Keyboard Handlers ---------------------------- */

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;

      if ((e.key === "Delete" || e.key === "Backspace") && selectedShapeIds.length > 0) {
        // Only delete unlocked shapes!
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
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        handleUndo();
      }

      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) {
        handleRedo();
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
        renderMiroShape(ctx, s, selectedShapeIds.includes(s.id));
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
  }, [shapes, currentShape, selectedShapeIds, marqueeBox, bgGrid, pan, zoom]);

  /* ------------------------- Coordinate Conversions ----------------------- */

  const getCanvasCoords = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    return {
      x: (screenX - pan.x) / zoom,
      y: (screenY - pan.y) / zoom,
    };
  };

  /* ------------------------- Precision Part-By-Part Eraser ---------------- */

  const performPrecisionErasing = (eraserPt: { x: number; y: number }, radius: number = 18) => {
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
      performPrecisionErasing(pt, 18);
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

    const newShape: Shape = {
      id: `miro_${Date.now()}`,
      type: activeTool,
      color: strokeColor,
      strokeWidth,
      lineStyle,
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
      performPrecisionErasing(pt, 18);
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

  /* Tab Management Functions with MAX 5 TABS POPUP PROMPT */
  const handleAddNewTab = () => {
    if (tabs.length >= 5) {
      setMaxTabPromptOpen(true);
      showToast("Tab limit reached! (Maximum 5 tabs)");
      return;
    }

    const newId = `tab_${Date.now()}`;
    const newName = `Canvas ${tabs.length + 1}`;
    setTabs((prev) => [...prev, { id: newId, name: newName }]);
    setActiveTabId(newId);
    setShapes([]);
    showToast(`Created new diagram tab: ${newName}`);
  };

  const handleCloseTab = (tabIdToClose: string) => {
    if (tabs.length === 1) {
      showToast("Cannot close the only open tab.");
      return;
    }

    const updatedTabs = tabs.filter((t) => t.id !== tabIdToClose);
    setTabs(updatedTabs);
    if (activeTabId === tabIdToClose) {
      setActiveTabId(updatedTabs[updatedTabs.length - 1].id);
      handleSelectTab(updatedTabs[updatedTabs.length - 1].id);
    }
    showToast("Tab closed!");
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
    const url = canvas.toDataURL(mime, 0.95);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GAMAT_FX_Whiteboard_${Date.now()}.${format}`;
    a.click();
    showToast(`Exported diagram as ${format.toUpperCase()}!`);
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
    } else {
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

      {/* TradingView-Style Floating Draggable Favorites Toolbar */}
      {favoritedTools.length > 0 && (
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
                className={`h-9 w-9 rounded-xl flex items-center justify-center transition ${
                  activeTool === tKey ? "bg-brand text-white shadow-md" : "text-ink hover:bg-cream"
                }`}
                title={TOOL_EXPLANATIONS[tKey]?.title || tKey}
              >
                <IconComponent className="h-4 w-4" />
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
              <Grid className="h-4 w-4 text-brand" /> Canvas Theme <ChevronDown className="h-3.5 w-3.5 text-muted" />
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
                  <FileImage className="h-4 w-4 text-brand" /> Export PNG
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("jpeg")}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                >
                  <FileImage className="h-4 w-4 text-emerald-600" /> Export JPEG
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("svg")}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                >
                  <FileCode className="h-4 w-4 text-blue-600" /> Export SVG
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

          {/* Whiteboard Settings Button */}
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

      {/* Sub-Header Tabs Bar: Back to Site -> Vertical Line | -> Diagram Tabs (Clean without tab text/icon) */}
      <div className="h-10 border-b border-line bg-slate-100 px-4 flex items-center gap-3 shrink-0 z-20 overflow-x-auto">
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

        {/* Diagram Tabs Bar */}
        <div className="flex items-center gap-1.5 shrink-0">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={`group flex items-center gap-1.5 rounded-t-xl px-3 py-1 text-xs font-bold cursor-pointer transition-all border-t border-x ${
                activeTabId === tab.id
                  ? "bg-white text-brand border-line shadow-sm"
                  : "border-transparent text-muted hover:text-ink hover:bg-white/60"
              }`}
            >
              {/* Ellipsis Truncated Tab Name */}
              <span className="truncate max-w-[110px] inline-block align-bottom" title={tab.name}>
                {tab.name}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseTab(tab.id);
                }}
                className="rounded-full p-0.5 opacity-60 hover:opacity-100 hover:bg-rose-100 hover:text-rose-600 transition"
                title="Close Tab"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* New Tab Button */}
          <button
            type="button"
            onClick={handleAddNewTab}
            className="flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-2 py-1 text-xs font-bold text-muted hover:border-brand hover:text-brand hover:bg-white transition ml-1"
            title="Create New Diagram Tab (Max 5)"
          >
            <Plus className="h-3.5 w-3.5" /> New Tab
          </button>
        </div>
      </div>

      {/* Main Miro Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar Dock */}
        <aside className="w-16 border-r border-line bg-white p-2 flex flex-col items-center justify-between gap-3 shrink-0 z-20 shadow-md">
          <div className="space-y-1.5 w-full">
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

            {/* 1. FREEHAND GROUP */}
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
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold ${activePenTool === "pencil" ? "bg-brand-light text-brand" : "hover:bg-cream"}`}
                  >
                    <span className="flex items-center gap-2"><Pencil className="h-4 w-4" /> Freehand Pen</span>
                    <span title={favoritedTools.includes("pencil") ? "Remove from Favorites Toolbar" : "Add to Favorites Toolbar"}>
                      <Star
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteTool("pencil"); }}
                        className={`h-4 w-4 cursor-pointer p-0.5 rounded ${favoritedTools.includes("pencil") ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`}
                      />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActivePenTool("highlighter"); setActiveTool("highlighter"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold ${activePenTool === "highlighter" ? "bg-brand-light text-brand" : "hover:bg-cream"}`}
                  >
                    <span className="flex items-center gap-2"><Highlighter className="h-4 w-4 text-amber-500" /> Highlighter</span>
                    <span title={favoritedTools.includes("highlighter") ? "Remove from Favorites Toolbar" : "Add to Favorites Toolbar"}>
                      <Star
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteTool("highlighter"); }}
                        className={`h-4 w-4 cursor-pointer p-0.5 rounded ${favoritedTools.includes("highlighter") ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`}
                      />
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. SHAPES GROUP */}
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
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold ${activeShapeTool === "rectangle" ? "bg-brand-light text-brand" : "hover:bg-cream"}`}
                  >
                    <span className="flex items-center gap-2"><Square className="h-4 w-4" /> Rectangle Zone</span>
                    <span title={favoritedTools.includes("rectangle") ? "Remove from Favorites Toolbar" : "Add to Favorites Toolbar"}>
                      <Star
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteTool("rectangle"); }}
                        className={`h-4 w-4 cursor-pointer p-0.5 rounded ${favoritedTools.includes("rectangle") ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`}
                      />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveShapeTool("circle"); setActiveTool("circle"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold ${activeShapeTool === "circle" ? "bg-brand-light text-brand" : "hover:bg-cream"}`}
                  >
                    <span className="flex items-center gap-2"><Circle className="h-4 w-4" /> Circle Node</span>
                    <span title={favoritedTools.includes("circle") ? "Remove from Favorites Toolbar" : "Add to Favorites Toolbar"}>
                      <Star
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteTool("circle"); }}
                        className={`h-4 w-4 cursor-pointer p-0.5 rounded ${favoritedTools.includes("circle") ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`}
                      />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveShapeTool("diamond"); setActiveTool("diamond"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold ${activeShapeTool === "diamond" ? "bg-brand-light text-brand" : "hover:bg-cream"}`}
                  >
                    <span className="flex items-center gap-2"><Diamond className="h-4 w-4" /> Decision Diamond</span>
                    <span title={favoritedTools.includes("diamond") ? "Remove from Favorites Toolbar" : "Add to Favorites Toolbar"}>
                      <Star
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteTool("diamond"); }}
                        className={`h-4 w-4 cursor-pointer p-0.5 rounded ${favoritedTools.includes("diamond") ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`}
                      />
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. LINES GROUP */}
            <div className="relative">
              <MiroToolBtn
                active={activeTool === "arrow" || activeTool === "bezier"}
                onClick={() => setActiveTool(activeLineTool)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setFlyoutGroup(flyoutGroup === "lines" ? null : "lines");
                }}
                title="Lines & Paths (Right click to change line type or favorite)"
                toolKey={activeLineTool}
                icon={activeLineTool === "bezier" ? Activity : ArrowRight}
                badge={activeLineTool === "bezier" ? "PATH" : undefined}
                hasFlyout
                showTooltips={showTooltips}
              />
              {flyoutGroup === "lines" && (
                <div className="absolute left-full top-0 ml-2 w-56 rounded-2xl border border-line bg-white p-2 shadow-2xl z-50 animate-in fade-in">
                  <p className="px-3 py-1 text-[10px] font-black uppercase text-muted tracking-wider">Line & Path Tools</p>
                  <button
                    type="button"
                    onClick={() => { setActiveLineTool("arrow"); setActiveTool("arrow"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold ${activeLineTool === "arrow" ? "bg-brand-light text-brand" : "hover:bg-cream"}`}
                  >
                    <span className="flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Connector Arrow</span>
                    <span title={favoritedTools.includes("arrow") ? "Remove from Favorites Toolbar" : "Add to Favorites Toolbar"}>
                      <Star
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteTool("arrow"); }}
                        className={`h-4 w-4 cursor-pointer p-0.5 rounded ${favoritedTools.includes("arrow") ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`}
                      />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveLineTool("bezier"); setActiveTool("bezier"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold ${activeLineTool === "bezier" ? "bg-brand-light text-brand" : "hover:bg-cream"}`}
                  >
                    <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-brand" /> Chart Pattern Path</span>
                    <span title={favoritedTools.includes("bezier") ? "Remove from Favorites Toolbar" : "Add to Favorites Toolbar"}>
                      <Star
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteTool("bezier"); }}
                        className={`h-4 w-4 cursor-pointer p-0.5 rounded ${favoritedTools.includes("bezier") ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`}
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
          <div className="space-y-1.5 w-full border-t border-line pt-2">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={handleUndo}
                disabled={shapes.length === 0}
                className="h-9 rounded-xl flex items-center justify-center text-ink/70 hover:bg-cream disabled:opacity-30"
                title="Undo (Ctrl + Z)"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="h-9 rounded-xl flex items-center justify-center text-ink/70 hover:bg-cream disabled:opacity-30"
                title="Redo (Ctrl + Y)"
              >
                <RotateCw className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleClear}
              disabled={shapes.length === 0}
              className="w-full h-9 rounded-xl flex items-center justify-center text-rose-600 hover:bg-rose-50 disabled:opacity-30"
              title="Clear Whiteboard"
            >
              <Trash2 className="h-4 w-4" />
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
                    <span>Selected {contextMenu.targetShape.type.toUpperCase()}</span>
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
                      setIsStickyMode(true);
                      setTextModalPos(contextMenu.canvasPt);
                      setActiveTool("sticky");
                      setContextMenu(null);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                  >
                    <StickyNote className="h-3.5 w-3.5 text-amber-500" /> Add Sticky Note Here
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
                    <Type className="h-3.5 w-3.5 text-brand" /> Add Text Label Here
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTool("pencil"); setContextMenu(null); }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                  >
                    <Pencil className="h-3.5 w-3.5 text-ink" /> Freehand Pen
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTool("bezier"); setContextMenu(null); }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                  >
                    <Activity className="h-3.5 w-3.5 text-brand" /> Chart Pattern Path
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTool("rectangle"); setContextMenu(null); }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                  >
                    <Square className="h-3.5 w-3.5 text-blue-600" /> Rectangle Zone Box
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTool("eraser"); setContextMenu(null); }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
                  >
                    <Eraser className="h-3.5 w-3.5 text-rose-500" /> Eraser Tool
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

          {/* Settings Preferences Modal */}
          {settingsOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm animate-in fade-in">
              <div className="w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-brand" />
                    <h3 className="font-display font-extrabold text-ink text-base">Whiteboard Preferences</h3>
                  </div>
                  <button onClick={() => setSettingsOpen(false)} className="rounded-lg p-1 text-muted hover:text-ink">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-ink block mb-1">Default Canvas Theme</label>
                    <select
                      value={bgGrid}
                      onChange={(e) => setBgGrid(e.target.value as any)}
                      className="w-full rounded-xl border border-line bg-cream p-2.5 font-bold text-ink outline-none focus:border-brand"
                    >
                      {CANVAS_THEMES.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-ink block mb-1">Default Stroke Width</label>
                    <div className="flex gap-2">
                      {[1, 2, 4, 6].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setStrokeWidth(w)}
                          className={`flex-1 py-2 rounded-xl font-extrabold transition ${
                            strokeWidth === w ? "bg-brand text-white" : "bg-cream text-ink hover:bg-slate-200"
                          }`}
                        >
                          {w}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tooltip Explanation Preference Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-line">
                    <div>
                      <label className="font-bold text-ink flex items-center gap-1.5">
                        <Info className="h-4 w-4 text-brand" /> Show Tooltip Explanations & Animated Demos
                      </label>
                      <p className="text-[10px] text-muted">Displays guide cards with GIF-style animations when hovering tools</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowTooltips(!showTooltips);
                        showToast(showTooltips ? "Disabled tool explanations" : "Enabled tool explanations");
                      }}
                      className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
                        showTooltips ? "bg-brand justify-end" : "bg-slate-300 justify-start"
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full bg-white shadow-md" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
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
                            {selectedShape.type}
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

                {/* TAB 2: PHOTOSHOP-STYLE LAYERS PANEL */}
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
                              <div className="flex items-center gap-2 truncate">
                                {/* Color Swatch Badge */}
                                <span
                                  className="h-3.5 w-3.5 rounded-full border border-black/20 shrink-0"
                                  style={{ background: shape.stickyColor || shape.color }}
                                />
                                <IconComponent className="h-4 w-4 text-brand shrink-0" />
                                <span className="truncate text-ink font-bold capitalize">
                                  {shape.text ? `"${shape.text.slice(0, 14)}..."` : `${shape.type}`}
                                </span>
                              </div>

                              {/* Layer Actions: Reorder Up/Down, Visibility & Lock */}
                              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
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
      className="relative w-full group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        onClick={onClick}
        onContextMenu={onContextMenu}
        title={explanation?.title || title}
        className={`relative h-11 w-full rounded-xl flex items-center justify-center transition-all ${
          active
            ? "bg-brand text-white shadow-lg shadow-brand/20 scale-105"
            : "text-ink/65 hover:bg-cream hover:text-ink"
        }`}
      >
        <Icon className="h-4.5 w-4.5" />
        {badge && (
          <span className="absolute -top-1 -right-1 text-[8px] font-black uppercase tracking-tighter bg-amber-400 text-slate-950 px-1 rounded">
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
    case "arrow": return ArrowRight;
    case "bezier": return Activity;
    case "sticky": return StickyNote;
    case "text": return Type;
    case "eraser": return Eraser;
    case "zoom": return Search;
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

  if (shape.type === "rectangle" || shape.type === "circle" || shape.type === "diamond") {
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

/** Renders shapes and Miro sticky notes on canvas */
function renderMiroShape(ctx: CanvasRenderingContext2D, shape: Shape, isSelected: boolean = false) {
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

  // Render Lock Indicator Badge on Canvas if Locked 🔒
  if (shape.isLocked) {
    let minX = Math.min(...pts.map((p) => p.x));
    let minY = Math.min(...pts.map((p) => p.y));

    if (shape.type === "sticky") {
      minX = pts[0].x;
      minY = pts[0].y;
    }

    ctx.fillStyle = "#d97706";
    ctx.beginPath();
    ctx.arc(minX - 10, minY - 10, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "10px sans-serif";
    ctx.fillText("🔒", minX - 14, minY - 6);
  }

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
