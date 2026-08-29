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

  const [strokeColor, setStrokeColor] = useState("#dc3545");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [lineStyle, setLineStyle] = useState<"solid" | "dashed">("solid");
  const [bgGrid, setBgGrid] = useState<"dots" | "lines" | "blank" | "dark" | "chalkboard">("dots");
  const [stickyColor, setStickyColor] = useState<StickyColor>("#fef08a");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Modals & Flyout Dropdowns
  const [exportOpen, setExportOpen] = useState(false);
  const [bgOpen, setBgOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [flyoutGroup, setFlyoutGroup] = useState<"shapes" | "lines" | "pen" | null>(null);

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
    // Prevent document body scrolling on Whiteboard page
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
        setShapes((prev) => prev.filter((s) => !selectedShapeIds.includes(s.id)));
        setSelectedShapeIds([]);
        showToast(`Deleted ${selectedShapeIds.length} object(s)!`);
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

    // Render All Shapes & Sticky Notes
    const allShapes = [...shapes, ...(currentShape ? [currentShape] : [])];
    allShapes.forEach((s) => renderMiroShape(ctx, s, selectedShapeIds.includes(s.id)));

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

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
        // Freehand / Bezier path stroke: Erase individual points & split stroke into sub-paths!
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

          // Create new shape sub-paths for remaining segments
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
          // Solid geometric shapes / sticky notes: Remove if touched by eraser
          if (!isPointInShape(eraserPt, s)) {
            result.push(s);
          }
        }
      }

      return result;
    });
  };

  /* ------------------------- Drawing & Selection Handlers ------------------- */

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setExportOpen(false);
    setBgOpen(false);
    setSettingsOpen(false);
    setFlyoutGroup(null);

    if (activeTool === "hand" || e.button === 1 || e.buttons === 4) {
      isPanning.current = true;
      startPan.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    const pt = getCanvasCoords(e);

    // Zoom Tool Click
    if (activeTool === "zoom") {
      setZoom((z) => Math.min(3.0, z + 0.2));
      return;
    }

    // Dedicated Precision Eraser Tool Action
    if (activeTool === "eraser") {
      performPrecisionErasing(pt, 18);
      return;
    }

    // 1. Check for Resize Handles Click on Single Selected Shape
    if (activeTool === "select" && selectedShapeIds.length === 1) {
      const selShape = shapes.find((s) => s.id === selectedShapeIds[0]);
      if (selShape) {
        const handleHit = getResizeHandleHit(pt, selShape);
        if (handleHit) {
          setActiveResizeHandle({ shapeId: selShape.id, handle: handleHit });
          dragStartPt.current = pt;
          return;
        }
      }
    }

    // 2. Select Tool Hit Test & Alt+Drag Duplicate
    if (activeTool === "select") {
      const hitShape = [...shapes].reverse().find((s) => isPointInShape(pt, s));

      if (hitShape) {
        if (e.altKey) {
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

        isDraggingShape.current = true;
        dragStartPt.current = pt;
      } else {
        setSelectedShapeIds([]);
        setMarqueeBox({ x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y });
      }
      return;
    }

    // 3. Bezier / Chart Pattern Tool
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

    // Interactive Shape Resizing
    if (activeResizeHandle) {
      setShapes((prev) =>
        prev.map((s) => {
          if (s.id !== activeResizeHandle.shapeId) return s;
          return resizeShapePoints(s, activeResizeHandle.handle, pt);
        })
      );
      return;
    }

    // Precision Part-by-part Eraser dragging
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
          if (!selectedShapeIds.includes(s.id)) return s;
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

  /* Bulk Apply Color / Properties */
  const applyColorToSelected = (color: string) => {
    setStrokeColor(color);
    if (selectedShapeIds.length > 0) {
      setShapes((prev) =>
        prev.map((s) => (selectedShapeIds.includes(s.id) ? { ...s, color } : s))
      );
    }
  };

  const applyStickyColorToSelected = (sColor: StickyColor) => {
    setStickyColor(sColor);
    if (selectedShapeIds.length > 0) {
      setShapes((prev) =>
        prev.map((s) => (selectedShapeIds.includes(s.id) ? { ...s, stickyColor: sColor } : s))
      );
    }
  };

  /* Tab Management Functions (Add New Tab & Close Tab) */
  const handleAddNewTab = () => {
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

  return (
    <div ref={containerRef} className="fixed inset-0 h-screen w-screen bg-slate-900 text-ink font-sans flex flex-col overflow-hidden select-none touch-none">
      {/* Toast Notification */}
      {statusMsg && (
        <div className="fixed top-20 right-6 z-50 rounded-2xl bg-brand text-white px-5 py-3 shadow-2xl flex items-center gap-2 font-bold text-xs animate-in fade-in slide-in-from-top-3">
          <Check className="h-4 w-4" /> {statusMsg}
        </div>
      )}

      {/* Top Header Bar (GAMAT Logo -> Back to Site -> Vertical Line -> Diagrams Tabs -> Properties -> Settings) */}
      <header className="h-16 border-b border-line bg-white px-4 flex items-center justify-between gap-3 shrink-0 z-30 shadow-sm">
        {/* Left Section: GAMAT Logo -> Back to Site -> Vertical Line | -> Diagrams Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto">
          <Logo variant="dark" />
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-cream px-3 py-1.5 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition shrink-0"
            title="Back to GAMAT FX Website"
          >
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back to Site</span>
          </button>

          {/* Vertical Separator Line */}
          <span className="h-6 w-px bg-line shrink-0" />

          {/* Closeable Diagram Tabs */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-muted flex items-center gap-1 shrink-0">
              <Layers className="h-3.5 w-3.5 text-brand" /> Diagrams:
            </span>
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`group flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer transition-all border ${
                  activeTabId === tab.id
                    ? "bg-brand-light text-brand border-brand/40 shadow-sm"
                    : "border-line bg-cream/70 text-muted hover:text-ink hover:bg-white"
                }`}
              >
                <span>{tab.name}</span>
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
            <button
              type="button"
              onClick={handleAddNewTab}
              className="flex items-center gap-1 rounded-xl border border-dashed border-slate-300 px-2 py-1.5 text-xs font-bold text-muted hover:border-brand hover:text-brand hover:bg-white transition"
              title="Create New Blank Diagram Tab"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Center Section: Dynamic Tool Options & Properties Bar */}
        <div className="hidden lg:flex items-center gap-3 rounded-2xl border border-line bg-cream px-4 py-1.5 shadow-inner">
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
                    setShapes((prev) => prev.map((s) => (selectedShapeIds.includes(s.id) ? { ...s, strokeWidth: w } : s)));
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
                  setShapes((prev) => prev.map((s) => (selectedShapeIds.includes(s.id) ? { ...s, lineStyle: "solid" } : s)));
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
                  setShapes((prev) => prev.map((s) => (selectedShapeIds.includes(s.id) ? { ...s, lineStyle: "dashed" } : s)));
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

        {/* Right Section: Canvas Theme -> Export Dropdown -> Settings -> Fullscreen */}
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

      {/* Main Miro Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar Dock (Grouped Miro Tools with Sub-menu Flyouts) */}
        <aside className="w-16 border-r border-line bg-white p-2 flex flex-col items-center justify-between gap-3 shrink-0 z-20 shadow-md">
          <div className="space-y-1.5 w-full">
            <MiroToolBtn
              active={activeTool === "select"}
              onClick={() => setActiveTool("select")}
              title="Select, Move, Resize & Alt+Drag Duplicate"
              icon={MousePointer}
            />
            <MiroToolBtn
              active={activeTool === "hand"}
              onClick={() => setActiveTool("hand")}
              title="Pan / Hand Tool (Drag background)"
              icon={Hand}
            />

            {/* 1. FREEHAND GROUP (Pencil / Highlighter) */}
            <div className="relative">
              <MiroToolBtn
                active={activeTool === "pencil" || activeTool === "highlighter"}
                onClick={() => {
                  setActiveTool(activePenTool);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setFlyoutGroup(flyoutGroup === "pen" ? null : "pen");
                }}
                title="Freehand Pen (Right click or hover arrow to change tool)"
                icon={activePenTool === "highlighter" ? Highlighter : Pencil}
                hasFlyout
              />
              {flyoutGroup === "pen" && (
                <div className="absolute left-full top-0 ml-2 w-44 rounded-2xl border border-line bg-white p-2 shadow-2xl z-50 animate-in fade-in">
                  <p className="px-3 py-1 text-[10px] font-black uppercase text-muted tracking-wider">Pen Tools</p>
                  <button
                    type="button"
                    onClick={() => { setActivePenTool("pencil"); setActiveTool("pencil"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${activePenTool === "pencil" ? "bg-brand-light text-brand" : "hover:bg-cream"}`}
                  >
                    <Pencil className="h-4 w-4" /> Freehand Pen
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActivePenTool("highlighter"); setActiveTool("highlighter"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${activePenTool === "highlighter" ? "bg-brand-light text-brand" : "hover:bg-cream"}`}
                  >
                    <Highlighter className="h-4 w-4 text-amber-500" /> Highlighter
                  </button>
                </div>
              )}
            </div>

            {/* 2. SHAPES GROUP (Rectangle / Circle / Diamond) */}
            <div className="relative">
              <MiroToolBtn
                active={activeTool === "rectangle" || activeTool === "circle" || activeTool === "diamond"}
                onClick={() => {
                  setActiveTool(activeShapeTool);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setFlyoutGroup(flyoutGroup === "shapes" ? null : "shapes");
                }}
                title="Geometric Shapes (Right click or hover arrow to change shape)"
                icon={activeShapeTool === "circle" ? Circle : activeShapeTool === "diamond" ? Diamond : Square}
                hasFlyout
              />
              {flyoutGroup === "shapes" && (
                <div className="absolute left-full top-0 ml-2 w-48 rounded-2xl border border-line bg-white p-2 shadow-2xl z-50 animate-in fade-in">
                  <p className="px-3 py-1 text-[10px] font-black uppercase text-muted tracking-wider">Shape Tools</p>
                  <button
                    type="button"
                    onClick={() => { setActiveShapeTool("rectangle"); setActiveTool("rectangle"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${activeShapeTool === "rectangle" ? "bg-brand-light text-brand" : "hover:bg-cream"}`}
                  >
                    <Square className="h-4 w-4" /> Rectangle Zone
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveShapeTool("circle"); setActiveTool("circle"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${activeShapeTool === "circle" ? "bg-brand-light text-brand" : "hover:bg-cream"}`}
                  >
                    <Circle className="h-4 w-4" /> Circle Node
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveShapeTool("diamond"); setActiveTool("diamond"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${activeShapeTool === "diamond" ? "bg-brand-light text-brand" : "hover:bg-cream"}`}
                  >
                    <Diamond className="h-4 w-4" /> Decision Diamond
                  </button>
                </div>
              )}
            </div>

            {/* 3. LINES & PATHS GROUP (Arrow / Bezier Chart Pattern) */}
            <div className="relative">
              <MiroToolBtn
                active={activeTool === "arrow" || activeTool === "bezier"}
                onClick={() => {
                  setActiveTool(activeLineTool);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setFlyoutGroup(flyoutGroup === "lines" ? null : "lines");
                }}
                title="Lines & Paths (Right click or hover arrow to change line type)"
                icon={activeLineTool === "bezier" ? Activity : ArrowRight}
                badge={activeLineTool === "bezier" ? "PATH" : undefined}
                hasFlyout
              />
              {flyoutGroup === "lines" && (
                <div className="absolute left-full top-0 ml-2 w-52 rounded-2xl border border-line bg-white p-2 shadow-2xl z-50 animate-in fade-in">
                  <p className="px-3 py-1 text-[10px] font-black uppercase text-muted tracking-wider">Line & Path Tools</p>
                  <button
                    type="button"
                    onClick={() => { setActiveLineTool("arrow"); setActiveTool("arrow"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${activeLineTool === "arrow" ? "bg-brand-light text-brand" : "hover:bg-cream"}`}
                  >
                    <ArrowRight className="h-4 w-4" /> Connector Arrow
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveLineTool("bezier"); setActiveTool("bezier"); setFlyoutGroup(null); }}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${activeLineTool === "bezier" ? "bg-brand-light text-brand" : "hover:bg-cream"}`}
                  >
                    <Activity className="h-4 w-4 text-brand" /> Chart Pattern Path
                  </button>
                </div>
              )}
            </div>

            <MiroToolBtn
              active={activeTool === "sticky"}
              onClick={() => setActiveTool("sticky")}
              title="Sticky Note"
              icon={StickyNote}
              badge="NOTE"
            />
            <MiroToolBtn
              active={activeTool === "text"}
              onClick={() => setActiveTool("text")}
              title="Text Label"
              icon={Type}
            />
            <MiroToolBtn
              active={activeTool === "eraser"}
              onClick={() => setActiveTool("eraser")}
              title="Precision Eraser Tool (Erases touched stroke parts)"
              icon={Eraser}
            />
            <MiroToolBtn
              active={activeTool === "zoom"}
              onClick={() => setActiveTool("zoom")}
              title="Zoom Tool (or use mouse scroll wheel)"
              icon={Search}
            />
          </div>

          {/* Bottom Actions: Undo, Redo, Clear */}
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
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-xl border border-line bg-white/95 p-2 backdrop-blur shadow-lg text-xs font-bold">
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

          {/* Canvas with Mouse Wheel Zoom */}
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            className={`w-full h-full block ${
              activeTool === "hand"
                ? "cursor-grab active:cursor-grabbing"
                : activeTool === "select"
                ? "cursor-default"
                : activeTool === "eraser"
                ? "cursor-pointer"
                : activeTool === "zoom"
                ? "cursor-zoom-in"
                : "cursor-crosshair"
            }`}
          />

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
  icon: Icon,
  badge,
  hasFlyout,
}: {
  active: boolean;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  title: string;
  icon: React.ElementType;
  badge?: string;
  hasFlyout?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onContextMenu={onContextMenu}
      title={title}
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
  );
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
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(minX - pad, minY - pad, maxX - minX + pad * 2, maxY - minY + pad * 2);
    ctx.setLineDash([]);

    // Corner Resize Handle Nodes
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
