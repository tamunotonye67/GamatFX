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
  RotateCcw,
  RotateCw,
  Trash2,
  Download,
  Maximize2,
  Minimize2,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RefreshCw,
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
  | "text"
  | "eraser";

type StickyColor = "#fef08a" | "#fbcfe8" | "#bae6fd" | "#bbf7d0" | "#ddd6fe";

type Shape = {
  id: string;
  type: Tool;
  color: string;
  fillColor?: string;
  strokeWidth: number;
  points: { x: number; y: number }[];
  text?: string;
  stickyColor?: StickyColor;
};

const STICKY_COLORS: { color: StickyColor; name: string }[] = [
  { color: "#fef08a", name: "Yellow" },
  { color: "#fbcfe8", name: "Pink" },
  { color: "#bae6fd", name: "Blue" },
  { color: "#bbf7d0", name: "Green" },
  { color: "#ddd6fe", name: "Purple" },
];

const PALETTE = ["#dc3545", "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#16181c", "#ffffff"];

/* Miro Teaching Diagrams */
const LESSON_PRESETS = [
  { id: "mindmap", name: "Forex Basics Mind Map", desc: "Core Pillars: Analysis, Risk & Mindset" },
  { id: "smc_diag", name: "SMC Liquidity Diagram", desc: "Order Block, BOS & Liquidity Sweep" },
  { id: "risk_diag", name: "Risk Management Matrix", desc: "1% Risk Rule & R:R Ratio Breakdown" },
];

/* ========================================================================== */
/*                             MAIN COMPONENT                                 */
/* ========================================================================== */

export default function WhiteboardPage() {
  const [activeTool, setActiveTool] = useState<Tool>("pencil");
  const [strokeColor, setStrokeColor] = useState("#dc3545");
  const [strokeWidth] = useState(3);
  const [bgGrid, setBgGrid] = useState<"dots" | "lines" | "blank" | "dark" | "chalkboard">("dots");
  const [stickyColor, setStickyColor] = useState<StickyColor>("#fef08a");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Drawing State
  const [shapes, setShapes] = useState<Shape[]>([]);
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
  const isPanning = useRef(false);
  const startPan = useRef({ x: 0, y: 0 });

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

    // Draw Miro Grid Background
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

    // Render Shapes & Miro Sticky Notes
    const allShapes = [...shapes, ...(currentShape ? [currentShape] : [])];
    allShapes.forEach((s) => renderMiroShape(ctx, s));

    ctx.restore();
  }, [shapes, currentShape, bgGrid, pan, zoom]);

  /* ------------------------- Coordinate Conversions ----------------------- */

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Convert Screen Space to Canvas World Space based on Pan & Zoom
    return {
      x: (screenX - pan.x) / zoom,
      y: (screenY - pan.y) / zoom,
    };
  };

  /* ------------------------- Drawing Event Handlers ----------------------- */

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === "hand" || e.button === 1 || e.buttons === 4) {
      isPanning.current = true;
      startPan.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    const pt = getCanvasCoords(e);
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

    if (!isDrawing.current || !currentShape) return;
    const pt = getCanvasCoords(e);

    if (currentShape.type === "pencil" || currentShape.type === "highlighter") {
      setCurrentShape({
        ...currentShape,
        points: [...currentShape.points, pt],
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
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (currentShape) {
      setShapes((prev) => [...prev, currentShape]);
      setCurrentShape(null);
      setRedoStack([]);
    }
  };

  const handleAddTextOrSticky = () => {
    if (!textValue.trim() || !textModalPos) return;

    const newShape: Shape = {
      id: `miro_${Date.now()}`,
      type: isStickyMode ? "sticky" : "text",
      color: strokeColor,
      strokeWidth,
      points: [textModalPos],
      text: textValue.trim(),
      stickyColor: isStickyMode ? stickyColor : undefined,
    };

    setShapes((prev) => [...prev, newShape]);
    setTextValue("");
    setTextModalPos(null);
  };

  /* ---------------------------- Toolbar Actions ---------------------------- */

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
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `GAMAT_FX_Miro_Whiteboard_${Date.now()}.png`;
    a.click();
    showToast("Miro Teaching Diagram exported as PNG!");
  };

  const loadPresetDiagram = (presetId: string) => {
    if (presetId === "mindmap") {
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
      showToast("Loaded Forex Basics Mind Map!");
    } else if (presetId === "smc_diag") {
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
      showToast("Loaded SMC Liquidity Diagram!");
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
      showToast("Loaded Risk Management Matrix!");
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
    <div ref={containerRef} className="min-h-screen bg-slate-900 text-ink font-sans flex flex-col overflow-hidden select-none">
      {/* Toast Notification */}
      {statusMsg && (
        <div className="fixed top-20 right-6 z-50 rounded-2xl bg-brand text-white px-5 py-3 shadow-2xl flex items-center gap-2 font-bold text-xs animate-in fade-in slide-in-from-top-3">
          <Sparkles className="h-4 w-4" /> {statusMsg}
        </div>
      )}

      {/* Miro Header Toolbar */}
      <header className="h-16 border-b border-line bg-white px-5 flex items-center justify-between gap-4 shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-cream px-3 py-1.5 text-xs font-bold text-ink hover:bg-brand-light hover:text-brand transition"
            title="Back to GAMAT FX Website"
          >
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back to Site</span>
          </button>
          <span className="h-6 w-px bg-line" />
          <Logo variant="dark" />
          <span className="hidden sm:inline-block h-6 w-px bg-line" />
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-brand-light px-2.5 py-1 text-xs font-black text-brand">MIRO WHITEBOARD</span>
            <span className="hidden md:inline-block text-xs font-semibold text-muted">Forex Teaching & Diagram Canvas</span>
          </div>
        </div>

        {/* Preset Diagram Templates */}
        <div className="hidden lg:flex items-center gap-2">
          {LESSON_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => loadPresetDiagram(p.id)}
              className="rounded-xl border border-line bg-cream px-3 py-1.5 text-xs font-bold text-ink-soft hover:bg-brand-light hover:text-brand hover:border-brand/40 transition"
            >
              ⚡ {p.name}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportPNG}
            className="btn-primary !py-2 text-xs font-bold"
            title="Export Miro Diagram as PNG"
          >
            <Download className="h-4 w-4" /> <span className="hidden sm:inline">Export PNG</span>
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
        {/* Left Toolbar Dock (Miro Tools) */}
        <aside className="w-16 border-r border-line bg-white p-2 flex flex-col items-center justify-between gap-3 shrink-0 z-20 shadow-md">
          <div className="space-y-1.5 w-full">
            <MiroToolBtn
              active={activeTool === "select"}
              onClick={() => setActiveTool("select")}
              title="Select Tool"
              icon={MousePointer}
            />
            <MiroToolBtn
              active={activeTool === "hand"}
              onClick={() => setActiveTool("hand")}
              title="Pan / Hand Tool (Drag background)"
              icon={Hand}
            />
            <MiroToolBtn
              active={activeTool === "pencil"}
              onClick={() => setActiveTool("pencil")}
              title="Pen / Marker"
              icon={Pencil}
            />
            <MiroToolBtn
              active={activeTool === "highlighter"}
              onClick={() => setActiveTool("highlighter")}
              title="Yellow Highlighter"
              icon={Highlighter}
            />
            <MiroToolBtn
              active={activeTool === "sticky"}
              onClick={() => setActiveTool("sticky")}
              title="Miro Sticky Note"
              icon={StickyNote}
              badge="NOTE"
            />
            <MiroToolBtn
              active={activeTool === "rectangle"}
              onClick={() => setActiveTool("rectangle")}
              title="Rectangle Zone"
              icon={Square}
            />
            <MiroToolBtn
              active={activeTool === "circle"}
              onClick={() => setActiveTool("circle")}
              title="Circle Node"
              icon={Circle}
            />
            <MiroToolBtn
              active={activeTool === "diamond"}
              onClick={() => setActiveTool("diamond")}
              title="Decision Diamond Node"
              icon={Diamond}
            />
            <MiroToolBtn
              active={activeTool === "arrow"}
              onClick={() => setActiveTool("arrow")}
              title="Connector Arrow Line"
              icon={ArrowRight}
            />
            <MiroToolBtn
              active={activeTool === "text"}
              onClick={() => setActiveTool("text")}
              title="Text Label"
              icon={Type}
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
                title="Undo"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="h-9 rounded-xl flex items-center justify-center text-ink/70 hover:bg-cream disabled:opacity-30"
                title="Redo"
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
          {/* Top Floating Color & Sticky Note Palette Bar */}
          <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white/95 p-2.5 backdrop-blur shadow-xl">
            {/* Pen Stroke Palette */}
            <div className="flex items-center gap-1.5">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setStrokeColor(c)}
                  className={`h-6 w-6 rounded-full transition-transform border border-line ${
                    strokeColor === c ? "scale-125 ring-2 ring-brand ring-offset-2" : "hover:scale-110"
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>

            <span className="h-5 w-px bg-line" />

            {/* Sticky Note Colors */}
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className="text-muted text-[11px]">Sticky:</span>
              {STICKY_COLORS.map((s) => (
                <button
                  key={s.color}
                  type="button"
                  onClick={() => {
                    setStickyColor(s.color);
                    setActiveTool("sticky");
                  }}
                  className={`h-6 w-6 rounded-lg transition-transform border border-black/10 ${
                    stickyColor === s.color && activeTool === "sticky" ? "scale-125 ring-2 ring-brand" : "hover:scale-110"
                  }`}
                  style={{ background: s.color }}
                  title={`${s.name} Sticky Note`}
                />
              ))}
            </div>

            <span className="h-5 w-px bg-line" />

            {/* Background Grid Pattern Selector */}
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setBgGrid("dots")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                  bgGrid === "dots" ? "bg-brand text-white" : "text-muted hover:text-ink"
                }`}
              >
                Dots
              </button>
              <button
                type="button"
                onClick={() => setBgGrid("lines")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                  bgGrid === "lines" ? "bg-brand text-white" : "text-muted hover:text-ink"
                }`}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setBgGrid("blank")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                  bgGrid === "blank" ? "bg-brand text-white" : "text-muted hover:text-ink"
                }`}
              >
                White
              </button>
              <button
                type="button"
                onClick={() => setBgGrid("dark")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                  bgGrid === "dark" ? "bg-slate-950 text-white" : "text-muted hover:text-ink"
                }`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setBgGrid("chalkboard")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                  bgGrid === "chalkboard" ? "bg-emerald-800 text-white" : "text-muted hover:text-ink"
                }`}
              >
                Chalk
              </button>
            </div>
          </div>

          {/* Bottom Zoom & Navigation Bar */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-xl border border-line bg-white/95 p-2 backdrop-blur shadow-lg text-xs font-bold">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
              className="p-1.5 text-ink hover:bg-cream rounded-lg"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-ink">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
              className="p-1.5 text-ink hover:bg-cream rounded-lg"
              title="Zoom In"
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

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className={`w-full h-full block ${activeTool === "hand" ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"}`}
          />

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
  title,
  icon: Icon,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  icon: React.ElementType;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
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
    </button>
  );
}

/** Renders shapes and Miro sticky notes on canvas */
function renderMiroShape(ctx: CanvasRenderingContext2D, shape: Shape) {
  const pts = shape.points;
  if (pts.length === 0) return;

  ctx.strokeStyle = shape.color;
  ctx.fillStyle = shape.color;
  ctx.lineWidth = shape.strokeWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

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

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(p.x + 4, p.y + 4, w, h);

    // Sticky Note Body
    ctx.fillStyle = shape.stickyColor || "#fef08a";
    ctx.fillRect(p.x, p.y, w, h);
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.strokeRect(p.x, p.y, w, h);

    // Folded Corner
    ctx.fillStyle = "rgba(0,0,0,0.10)";
    ctx.beginPath();
    ctx.moveTo(p.x + w - 16, p.y + h);
    ctx.lineTo(p.x + w, p.y + h - 16);
    ctx.lineTo(p.x + w - 16, p.y + h - 16);
    ctx.fill();

    // Sticky Note Text
    if (shape.text) {
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 12px Inter, sans-serif";
      const lines = shape.text.split("\n");
      lines.forEach((line, idx) => {
        ctx.fillText(line, p.x + 12, p.y + 26 + idx * 18, w - 24);
      });
    }
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

    // Arrow Head
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
}
