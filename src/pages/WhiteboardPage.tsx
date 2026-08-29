import { useState, useRef, useEffect, useMemo } from "react";
import Logo from "../components/Logo";
import {
  Pencil,
  Square,
  Circle,
  TrendingUp,
  Minus,
  Type,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Trash2,
  Download,
  TrendingDown,
  Sparkles,
  ChevronDown,
  MousePointer,
  BarChart2,
} from "lucide-react";

/* ========================================================================== */
/*                               TYPES & DATA                                 */
/* ========================================================================== */

type Tool =
  | "select"
  | "pencil"
  | "trendline"
  | "horizontal"
  | "fibonacci"
  | "orderblock_bull"
  | "orderblock_bear"
  | "fvg"
  | "rectangle"
  | "circle"
  | "text"
  | "long_pos"
  | "short_pos"
  | "eraser";

type Shape = {
  id: string;
  type: Tool;
  color: string;
  width: number;
  points: { x: number; y: number }[];
  text?: string;
  entryPrice?: number;
  targetPrice?: number;
  stopPrice?: number;
};

type Pair = { symbol: string; name: string; basePrice: number; pipDecimals: number };

const PAIRS: Pair[] = [
  { symbol: "EUR/USD", name: "Euro / US Dollar", basePrice: 1.0850, pipDecimals: 4 },
  { symbol: "GBP/USD", name: "British Pound / US Dollar", basePrice: 1.2720, pipDecimals: 4 },
  { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", basePrice: 154.30, pipDecimals: 2 },
  { symbol: "AUD/USD", name: "Australian Dollar / US Dollar", basePrice: 0.6580, pipDecimals: 4 },
  { symbol: "USD/CAD", name: "US Dollar / Canadian Dollar", basePrice: 1.3650, pipDecimals: 4 },
  { symbol: "XAU/USD", name: "Gold / US Dollar", basePrice: 2420.50, pipDecimals: 2 },
  { symbol: "BTC/USD", name: "Bitcoin / US Dollar", basePrice: 62450.00, pipDecimals: 2 },
];

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1D", "1W"];
const CHART_TYPES = ["candlestick", "line", "area"] as const;
const STROKE_COLORS = ["#dc3545", "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ffffff", "#16181c"];

/* Strategy Templates to pre-load whiteboard analysis */
const TEMPLATES = [
  { id: "smc", name: "SMC Order Block & FVG", desc: "Institutional Liquidity Grab + BOS" },
  { id: "fib", name: "Fibonacci Golden Pocket", desc: "61.8% - 78.6% OTE Retracement Zone" },
  { id: "london", name: "London Kill Zone Breakout", desc: "Judas Swing & Asian Range Sweep" },
];

/* ========================================================================== */
/*                             MAIN COMPONENT                                 */
/* ========================================================================== */

export default function WhiteboardPage() {
  const [selectedPair, setSelectedPair] = useState<Pair>(PAIRS[0]);
  const [timeframe, setTimeframe] = useState("1h");
  const [chartType, setChartType] = useState<"candlestick" | "line" | "area">("candlestick");
  const [activeTool, setActiveTool] = useState<Tool>("pencil");
  const [strokeColor, setStrokeColor] = useState("#dc3545");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [bgTheme, setBgTheme] = useState<"dark" | "light" | "blueprint">("dark");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Drawing State
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [redoStack, setRedoStack] = useState<Shape[]>([]);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos] = useState<{ x: number; y: number } | null>(null);

  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  // Synthetic Market Data Generation
  const chartData = useMemo(() => {
    const candles = [];
    let price = selectedPair.basePrice;
    const count = 45;
    const volatility = selectedPair.basePrice * 0.0025;

    for (let i = 0; i < count; i++) {
      const open = price;
      const change = (Math.random() - 0.48) * volatility;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * (volatility * 0.5);
      const low = Math.min(open, close) - Math.random() * (volatility * 0.5);
      candles.push({ open, high, low, close, index: i });
      price = close;
    }
    return candles;
  }, [selectedPair, timeframe]);

  /* -------------------------- Canvas Render Loop -------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match canvas width to parent container
    const width = canvas.parentElement?.clientWidth || 1000;
    const height = canvas.parentElement?.clientHeight || 600;
    canvas.width = width;
    canvas.height = height;

    // Clear Background
    if (bgTheme === "dark") {
      ctx.fillStyle = "#0c0d10";
    } else if (bgTheme === "blueprint") {
      ctx.fillStyle = "#0f172a";
    } else {
      ctx.fillStyle = "#ffffff";
    }
    ctx.fillRect(0, 0, width, height);

    // Render Grid Lines
    ctx.strokeStyle = bgTheme === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Render Financial Chart Background
    renderChart(ctx, width, height, chartData, chartType, selectedPair, bgTheme);

    // Render All Whiteboard Shapes
    const allShapes = [...shapes, ...(currentShape ? [currentShape] : [])];
    allShapes.forEach((shape) => renderShape(ctx, shape));
  }, [shapes, currentShape, bgTheme, chartData, chartType, selectedPair]);

  /* ------------------------- Drawing Event Handlers ----------------------- */

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);
    isDrawing.current = true;

    if (activeTool === "text") {
      setTextPos(pt);
      return;
    }

    const newShape: Shape = {
      id: `shape_${Date.now()}`,
      type: activeTool,
      color: strokeColor,
      width: strokeWidth,
      points: [pt],
    };

    setCurrentShape(newShape);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !currentShape) return;
    const pt = getCanvasCoords(e);

    if (currentShape.type === "pencil") {
      setCurrentShape({
        ...currentShape,
        points: [...currentShape.points, pt],
      });
    } else {
      // For shapes with start and end points (trendline, rectangle, fibonacci, etc.)
      setCurrentShape({
        ...currentShape,
        points: [currentShape.points[0], pt],
      });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (currentShape) {
      setShapes((prev) => [...prev, currentShape]);
      setCurrentShape(null);
      setRedoStack([]);
    }
  };

  const handleAddText = () => {
    if (!textInput.trim() || !textPos) return;
    const textShape: Shape = {
      id: `shape_${Date.now()}`,
      type: "text",
      color: strokeColor,
      width: strokeWidth,
      points: [textPos],
      text: textInput.trim(),
    };
    setShapes((prev) => [...prev, textShape]);
    setTextInput("");
    setTextPos(null);
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
    a.download = `GAMAT_FX_Whiteboard_${selectedPair.symbol.replace("/", "_")}_${timeframe}.png`;
    a.click();
    showToast("Whiteboard Analysis exported as PNG!");
  };

  const loadStrategyTemplate = (templateId: string) => {
    const width = canvasRef.current?.width || 1000;
    const height = canvasRef.current?.height || 600;

    if (templateId === "smc") {
      setShapes([
        {
          id: "t1",
          type: "orderblock_bull",
          color: "#10b981",
          width: 2,
          points: [
            { x: width * 0.25, y: height * 0.55 },
            { x: width * 0.65, y: height * 0.72 },
          ],
        },
        {
          id: "t2",
          type: "fvg",
          color: "#f59e0b",
          width: 2,
          points: [
            { x: width * 0.45, y: height * 0.35 },
            { x: width * 0.75, y: height * 0.48 },
          ],
        },
        {
          id: "t3",
          type: "text",
          color: "#10b981",
          width: 2,
          points: [{ x: width * 0.26, y: height * 0.52 }],
          text: "1H Institutional Bullish Order Block (OB)",
        },
      ]);
      showToast("Loaded SMC Order Block & FVG Template!");
    } else if (templateId === "fib") {
      setShapes([
        {
          id: "f1",
          type: "fibonacci",
          color: "#dc3545",
          width: 2,
          points: [
            { x: width * 0.2, y: height * 0.75 },
            { x: width * 0.8, y: height * 0.2 },
          ],
        },
      ]);
      showToast("Loaded Fibonacci Golden Pocket Template!");
    } else {
      setShapes([
        {
          id: "l1",
          type: "rectangle",
          color: "#3b82f6",
          width: 2,
          points: [
            { x: width * 0.15, y: height * 0.3 },
            { x: width * 0.45, y: height * 0.6 },
          ],
        },
        {
          id: "l2",
          type: "text",
          color: "#3b82f6",
          width: 2,
          points: [{ x: width * 0.16, y: height * 0.26 }],
          text: "Asian Session Consolidation Range",
        },
      ]);
      showToast("Loaded London Breakout Template!");
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
    <div ref={containerRef} className="min-h-screen bg-ink text-white font-sans flex flex-col overflow-hidden">
      {/* Toast Notification */}
      {statusMsg && (
        <div className="fixed top-20 right-6 z-50 rounded-2xl bg-brand text-white px-5 py-3 shadow-2xl flex items-center gap-2 font-bold text-xs animate-in fade-in slide-in-from-top-3">
          <Sparkles className="h-4 w-4" /> {statusMsg}
        </div>
      )}

      {/* Top Header / Pair & Timeframe Selector Bar */}
      <header className="h-16 border-b border-white/10 bg-slate-950 px-4 flex items-center justify-between gap-4 shrink-0 z-30">
        <div className="flex items-center gap-4">
          <Logo variant="light" />
          <span className="hidden sm:inline-block h-6 w-px bg-white/10" />

          {/* Currency Pair Selector */}
          <div className="relative">
            <select
              value={selectedPair.symbol}
              onChange={(e) => setSelectedPair(PAIRS.find((p) => p.symbol === e.target.value) || PAIRS[0])}
              className="appearance-none rounded-xl border border-white/15 bg-white/10 px-4 py-2 pr-8 text-xs font-black text-white outline-none focus:border-brand cursor-pointer"
            >
              {PAIRS.map((p) => (
                <option key={p.symbol} value={p.symbol} className="bg-slate-900 text-white">
                  {p.symbol} ({p.name})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-white/60" />
          </div>

          {/* Timeframes */}
          <div className="hidden md:flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  timeframe === tf ? "bg-brand text-white shadow-md" : "text-white/70 hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Type */}
          <div className="hidden xl:flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            {CHART_TYPES.map((ct) => (
              <button
                key={ct}
                type="button"
                onClick={() => setChartType(ct)}
                className={`rounded-lg px-2 py-1 text-[11px] font-bold capitalize transition ${
                  chartType === ct ? "bg-white text-ink shadow-md" : "text-white/70 hover:text-white"
                }`}
              >
                {ct}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Strategy Template Dropdown */}
          <div className="hidden lg:flex items-center gap-1.5">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => loadStrategyTemplate(t.id)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-white/80 hover:bg-brand/20 hover:border-brand/40 hover:text-white transition"
              >
                ⚡ {t.name}
              </button>
            ))}
          </div>

          <span className="hidden sm:inline-block h-6 w-px bg-white/10" />

          {/* Export PNG */}
          <button
            type="button"
            onClick={handleExportPNG}
            className="btn-primary !py-2 text-xs font-bold"
            title="Export Whiteboard Analysis as PNG"
          >
            <Download className="h-4 w-4" /> <span className="hidden sm:inline">Export PNG</span>
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-xl border border-white/15 bg-white/10 p-2 text-white hover:bg-white/20 transition"
            title="Toggle Fullscreen Teaching View"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Main Workspace (Left Dock + Central Whiteboard Canvas) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar Dock */}
        <aside className="w-16 border-r border-white/10 bg-slate-950 p-2 flex flex-col items-center justify-between gap-3 shrink-0 z-20">
          <div className="space-y-1.5 w-full">
            <ToolButton
              active={activeTool === "select"}
              onClick={() => setActiveTool("select")}
              title="Select / Pointer"
              icon={MousePointer}
            />
            <ToolButton
              active={activeTool === "pencil"}
              onClick={() => setActiveTool("pencil")}
              title="Freehand Pencil / Marker"
              icon={Pencil}
            />
            <ToolButton
              active={activeTool === "trendline"}
              onClick={() => setActiveTool("trendline")}
              title="Trend Line"
              icon={TrendingUp}
            />
            <ToolButton
              active={activeTool === "horizontal"}
              onClick={() => setActiveTool("horizontal")}
              title="Horizontal Support/Resistance"
              icon={Minus}
            />
            <ToolButton
              active={activeTool === "fibonacci"}
              onClick={() => setActiveTool("fibonacci")}
              title="Fibonacci Retracement (0% - 100%)"
              icon={BarChart2}
            />
            <ToolButton
              active={activeTool === "orderblock_bull"}
              onClick={() => setActiveTool("orderblock_bull")}
              title="Bullish Order Block (OB)"
              icon={Square}
              badge="OB+"
            />
            <ToolButton
              active={activeTool === "orderblock_bear"}
              onClick={() => setActiveTool("orderblock_bear")}
              title="Bearish Order Block (OB)"
              icon={Square}
              badge="OB-"
            />
            <ToolButton
              active={activeTool === "rectangle"}
              onClick={() => setActiveTool("rectangle")}
              title="Demand / Supply Box"
              icon={Square}
            />
            <ToolButton
              active={activeTool === "circle"}
              onClick={() => setActiveTool("circle")}
              title="Liquidity Circle"
              icon={Circle}
            />
            <ToolButton
              active={activeTool === "text"}
              onClick={() => setActiveTool("text")}
              title="Add Teaching Text / Callout"
              icon={Type}
            />
            <ToolButton
              active={activeTool === "long_pos"}
              onClick={() => setActiveTool("long_pos")}
              title="Long Position & R:R Calculator"
              icon={TrendingUp}
              badge="BUY"
            />
            <ToolButton
              active={activeTool === "short_pos"}
              onClick={() => setActiveTool("short_pos")}
              title="Short Position & R:R Calculator"
              icon={TrendingDown}
              badge="SELL"
            />
          </div>

          {/* Bottom Toolbar Actions: Undo, Redo, Clear */}
          <div className="space-y-1.5 w-full border-t border-white/10 pt-2">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={handleUndo}
                disabled={shapes.length === 0}
                className="h-9 rounded-xl flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30"
                title="Undo"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="h-9 rounded-xl flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30"
                title="Redo"
              >
                <RotateCw className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleClear}
              disabled={shapes.length === 0}
              className="w-full h-9 rounded-xl flex items-center justify-center text-rose-400 hover:bg-rose-500/20 disabled:opacity-30"
              title="Clear Whiteboard"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </aside>

        {/* Interactive Canvas Workspace */}
        <main className="flex-1 relative bg-ink overflow-hidden cursor-crosshair">
          {/* Top Floating Color & Stroke Settings Dock */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-3 rounded-2xl border border-white/15 bg-slate-950/90 p-2.5 backdrop-blur-md shadow-xl">
            {/* Color Palette */}
            <div className="flex items-center gap-1.5">
              {STROKE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setStrokeColor(c)}
                  className={`h-6 w-6 rounded-full transition-transform ${
                    strokeColor === c ? "scale-125 ring-2 ring-brand ring-offset-2 ring-offset-slate-950" : "hover:scale-110"
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>

            <span className="h-5 w-px bg-white/15" />

            {/* Line Width */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-white/60">Width:</span>
              {[1, 2, 4, 6].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setStrokeWidth(w)}
                  className={`h-7 w-7 rounded-lg text-xs font-bold transition ${
                    strokeWidth === w ? "bg-brand text-white" : "bg-white/10 text-white/70 hover:text-white"
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>

            <span className="h-5 w-px bg-white/15" />

            {/* Whiteboard Background Selector */}
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setBgTheme("dark")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                  bgTheme === "dark" ? "bg-white text-ink" : "text-white/60 hover:text-white"
                }`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setBgTheme("blueprint")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                  bgTheme === "blueprint" ? "bg-blue-600 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                Blueprint
              </button>
              <button
                type="button"
                onClick={() => setBgTheme("light")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                  bgTheme === "light" ? "bg-cream text-ink font-extrabold" : "text-white/60 hover:text-white"
                }`}
              >
                Light
              </button>
            </div>
          </div>

          {/* Interactive HTML5 Canvas */}
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="w-full h-full block"
          />

          {/* Text Input Modal Overlay */}
          {textPos && (
            <div
              className="absolute z-40 rounded-2xl border border-brand bg-slate-950 p-4 shadow-2xl space-y-3"
              style={{ left: Math.min(textPos.x, (canvasRef.current?.width || 800) - 260), top: textPos.y }}
            >
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5 text-brand" /> Add Teaching Note
              </p>
              <input
                type="text"
                autoFocus
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddText()}
                placeholder="Type lesson note or signal alert..."
                className="w-64 rounded-xl border border-white/20 bg-slate-900 p-2.5 text-xs text-white outline-none focus:border-brand"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTextPos(null)}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white/70 hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddText}
                  className="btn-primary !py-1.5 !px-3 text-xs font-bold"
                >
                  Add Note
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
/*                           CANVAS DRAWING ENGINE                            */
/* ========================================================================== */

function ToolButton({
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
          ? "bg-brand text-white shadow-lg shadow-brand/30 scale-105"
          : "text-white/65 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      {badge && (
        <span className="absolute -top-1 -right-1 text-[8px] font-black uppercase tracking-tighter bg-amber-400 text-slate-950 px-1 rounded">
          {badge}
        </span>
      )}
    </button>
  );
}

/** Renders the market candlestick/line/area background chart */
function renderChart(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: any[],
  type: string,
  pair: Pair,
  bgTheme: string
) {
  const chartHeight = height * 0.75;
  const chartTop = height * 0.15;
  const paddingX = 60;

  const minPrice = Math.min(...data.map((d) => d.low));
  const maxPrice = Math.max(...data.map((d) => d.high));
  const priceRange = maxPrice - minPrice || 1;

  const candleWidth = (width - paddingX * 2) / data.length;

  const getY = (p: number) => {
    return chartTop + chartHeight - ((p - minPrice) / priceRange) * chartHeight;
  };

  // 1. Draw Candlestick / Line
  data.forEach((d, i) => {
    const x = paddingX + i * candleWidth + candleWidth / 2;
    const openY = getY(d.open);
    const closeY = getY(d.close);
    const highY = getY(d.high);
    const lowY = getY(d.low);

    const isBull = d.close >= d.open;
    const candleColor = isBull ? "#10b981" : "#dc3545";

    if (type === "candlestick") {
      // Wick
      ctx.strokeStyle = candleColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body
      ctx.fillStyle = candleColor;
      const bodyY = Math.min(openY, closeY);
      const bodyH = Math.max(Math.abs(closeY - openY), 2);
      ctx.fillRect(x - candleWidth * 0.35, bodyY, candleWidth * 0.7, bodyH);
    }
  });

  // Price Y-Axis Labels
  const steps = 5;
  ctx.fillStyle = bgTheme === "light" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.4)";
  ctx.font = "10px Inter, sans-serif";
  ctx.textAlign = "right";
  for (let s = 0; s <= steps; s++) {
    const p = minPrice + (priceRange / steps) * s;
    const y = getY(p);
    ctx.fillText(p.toFixed(pair.pipDecimals), width - 12, y + 3);
  }
}

/** Renders whiteboard drawings (trendlines, OB boxes, Fib, text) */
function renderShape(ctx: CanvasRenderingContext2D, shape: Shape) {
  ctx.strokeStyle = shape.color;
  ctx.fillStyle = shape.color;
  ctx.lineWidth = shape.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const pts = shape.points;
  if (pts.length === 0) return;

  if (shape.type === "pencil") {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.stroke();
  } else if (shape.type === "trendline" && pts.length >= 2) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.stroke();
  } else if (shape.type === "horizontal" && pts.length >= 1) {
    ctx.beginPath();
    ctx.moveTo(0, pts[0].y);
    ctx.lineTo(2000, pts[0].y);
    ctx.stroke();
  } else if (shape.type === "fibonacci" && pts.length >= 2) {
    const startY = pts[0].y;
    const endY = pts[1].y;
    const diff = endY - startY;
    const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0];

    levels.forEach((lvl) => {
      const y = startY + diff * lvl;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, y);
      ctx.lineTo(pts[1].x, y);
      ctx.strokeStyle = shape.color;
      ctx.globalAlpha = 0.7;
      ctx.stroke();

      ctx.fillStyle = shape.color;
      ctx.font = "10px Inter, sans-serif";
      ctx.fillText(`Fib ${(lvl * 100).toFixed(1)}%`, pts[0].x + 5, y - 4);
    });
    ctx.globalAlpha = 1;
  } else if (shape.type.startsWith("orderblock") && pts.length >= 2) {
    const w = pts[1].x - pts[0].x;
    const h = pts[1].y - pts[0].y;
    const isBull = shape.type === "orderblock_bull";

    ctx.fillStyle = isBull ? "rgba(16, 185, 129, 0.25)" : "rgba(220, 53, 69, 0.25)";
    ctx.strokeStyle = isBull ? "#10b981" : "#dc3545";
    ctx.fillRect(pts[0].x, pts[0].y, w, h);
    ctx.strokeRect(pts[0].x, pts[0].y, w, h);

    ctx.fillStyle = isBull ? "#10b981" : "#dc3545";
    ctx.font = "11px Sora, sans-serif";
    ctx.fillText(isBull ? "BULLISH OB ZONE" : "BEARISH OB ZONE", pts[0].x + 6, pts[0].y + 16);
  } else if (shape.type === "rectangle" && pts.length >= 2) {
    const w = pts[1].x - pts[0].x;
    const h = pts[1].y - pts[0].y;
    ctx.globalAlpha = 0.2;
    ctx.fillRect(pts[0].x, pts[0].y, w, h);
    ctx.globalAlpha = 1;
    ctx.strokeRect(pts[0].x, pts[0].y, w, h);
  } else if (shape.type === "text" && shape.text) {
    ctx.font = "bold 13px Inter, sans-serif";
    ctx.fillText(shape.text, pts[0].x, pts[0].y);
  }
}
