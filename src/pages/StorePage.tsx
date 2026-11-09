import { useState, useMemo } from "react";
import { useStore } from "../lib/store";
import { type StoreProduct, type StoreProductCategory } from "../lib/storeProducts";
import { naira } from "../lib/courses";
import { navigate } from "../lib/router";
import {
  ShoppingBag,
  Bot,
  LineChart,
  BookOpen,
  Target,
  CheckCircle2,
  Download,
  Star,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  FileText,
  ExternalLink,
  Zap,
  HelpCircle,
  Package,
  Lock,
  X,
  Tag,
  ChevronRight,
  ArrowUpDown,
  LayoutGrid,
  List,
  Check,
  AlertCircle,
  Clock,
  Share2,
  ThumbsUp,
  CreditCard,
  Building2,
  Smartphone,
  Loader2,
  Compass,
  CheckCheck,
} from "lucide-react";
import { payWithPaystack, generateTxRef } from "../lib/paystack";

type SortOption = "featured" | "price-asc" | "price-desc" | "rating" | "sales";

/* =========================================================================
   VECTOR DIAGRAMS FOR CATEGORY INTENT CARDS
   ========================================================================= */

/** Vector Diagram 1: AI Bots & Expert Advisors */
function BotVectorDiagram() {
  return (
    <svg viewBox="0 0 400 210" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="botBg" x1="0" y1="0" x2="400" y2="210" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0a0f1d" />
          <stop offset="1" stopColor="#040711" />
        </linearGradient>
      </defs>
      <rect width="400" height="210" rx="14" fill="url(#botBg)" />

      {/* Grid Pattern */}
      <path d="M 0 35 H 400 M 0 70 H 400 M 0 105 H 400 M 0 140 H 400 M 0 175 H 400" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
      <path d="M 50 0 V 210 M 100 0 V 210 M 150 0 V 210 M 200 0 V 210 M 250 0 V 210 M 300 0 V 210 M 350 0 V 210" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />

      {/* Input Tick Feed */}
      <circle cx="35" cy="105" r="4" fill="#38bdf8" />
      <path d="M 39 105 H 125" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
      <text x="35" y="93" fill="#94a3b8" fontSize="9" fontFamily="monospace" fontWeight="bold">TICK FEED</text>

      {/* Central Microprocessor Core */}
      <rect x="130" y="55" width="140" height="100" rx="12" fill="#0f172a" stroke="#0284c7" strokeWidth="2" />
      <rect x="140" y="65" width="120" height="80" rx="8" fill="#1e293b" />

      {/* Processor Pins */}
      <path d="M 155 47 V 55 M 175 47 V 55 M 195 47 V 55 M 215 47 V 55 M 235 47 V 55" stroke="#38bdf8" strokeWidth="2" />
      <path d="M 155 155 V 163 M 175 155 V 163 M 195 155 V 163 M 215 155 V 163 M 235 155 V 163" stroke="#38bdf8" strokeWidth="2" />

      {/* Core Labels */}
      <text x="200" y="92" fill="#ffffff" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="monospace">GAMAT ALGO EA</text>
      <text x="200" y="106" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">NEURAL RISK CORE</text>
      <rect x="155" y="116" width="90" height="18" rx="4" fill="#0284c7" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="1" />
      <text x="200" y="128" fill="#67e8f9" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">0.2ms EXECUTION</text>

      {/* Output Trade Signals */}
      <path d="M 270 85 H 330 L 350 65" stroke="#10b981" strokeWidth="2" />
      <circle cx="350" cy="65" r="5" fill="#10b981" />
      <rect x="295" y="48" width="75" height="20" rx="5" fill="#065f46" stroke="#10b981" strokeWidth="1" />
      <text x="332" y="62" fill="#a7f3d0" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">BUY: +42 PIPS</text>

      <path d="M 270 125 H 330 L 350 145" stroke="#ef4444" strokeWidth="2" />
      <circle cx="350" cy="145" r="5" fill="#ef4444" />
      <rect x="295" y="142" width="75" height="20" rx="5" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1" />
      <text x="332" y="156" fill="#fecaca" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">EQUITY SHIELD</text>

      {/* Platform Badges */}
      <rect x="20" y="172" width="85" height="22" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
      <text x="62" y="187" fill="#cbd5e1" fontSize="9" fontWeight="bold" textAnchor="middle">MT4 / MT5 ROBOT</text>

      <rect x="290" y="172" width="92" height="22" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
      <text x="336" y="187" fill="#34d399" fontSize="9" fontWeight="bold" textAnchor="middle">PROP-FIRM READY</text>
    </svg>
  );
}

/** Vector Diagram 2: Indicators & Scripts */
function IndicatorVectorDiagram() {
  return (
    <svg viewBox="0 0 400 210" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="indBg" x1="0" y1="0" x2="400" y2="210" gradientUnits="userSpaceOnUse">
          <stop stopColor="#081026" />
          <stop offset="1" stopColor="#040817" />
        </linearGradient>
      </defs>
      <rect width="400" height="210" rx="14" fill="url(#indBg)" />

      {/* Grid */}
      <line x1="25" y1="50" x2="375" y2="50" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
      <line x1="25" y1="100" x2="375" y2="100" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
      <line x1="25" y1="150" x2="375" y2="150" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />

      {/* Order Block Shaded Box */}
      <rect x="65" y="112" width="280" height="42" rx="5" fill="#0284c7" fillOpacity="0.18" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="4 2" />
      <text x="75" y="127" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">INSTITUTIONAL ORDER BLOCK (H4)</text>

      {/* Fair Value Gap (FVG) Shaded Box */}
      <rect x="175" y="68" width="170" height="32" rx="5" fill="#10b981" fillOpacity="0.18" stroke="#34d399" strokeWidth="1.2" strokeDasharray="3 2" />
      <text x="185" y="83" fill="#34d399" fontSize="9" fontWeight="bold" fontFamily="monospace">SMART MONEY RADAR FVG</text>

      {/* Candlesticks */}
      <line x1="45" y1="70" x2="45" y2="130" stroke="#ef4444" strokeWidth="1.5" />
      <rect x="39" y="80" width="12" height="35" rx="2" fill="#ef4444" />

      <line x1="75" y1="95" x2="75" y2="148" stroke="#ef4444" strokeWidth="1.5" />
      <rect x="69" y="105" width="12" height="32" rx="2" fill="#ef4444" />

      {/* Pinbar liquidity sweep */}
      <line x1="105" y1="110" x2="105" y2="160" stroke="#10b981" strokeWidth="1.5" />
      <rect x="99" y="114" width="12" height="16" rx="2" fill="#10b981" />
      <circle cx="105" cy="160" r="3.5" fill="#fbbf24" />
      <text x="105" y="176" fill="#fbbf24" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">SWEEP</text>

      {/* Impulse candle */}
      <line x1="135" y1="55" x2="135" y2="125" stroke="#10b981" strokeWidth="1.5" />
      <rect x="129" y="62" width="12" height="54" rx="2" fill="#10b981" />

      {/* Retest candle */}
      <line x1="165" y1="65" x2="165" y2="105" stroke="#ef4444" strokeWidth="1.5" />
      <rect x="159" y="70" width="12" height="22" rx="2" fill="#ef4444" />

      {/* Expansion candle */}
      <line x1="195" y1="32" x2="195" y2="90" stroke="#10b981" strokeWidth="1.5" />
      <rect x="189" y="40" width="12" height="42" rx="2" fill="#10b981" />

      {/* Breakout Trendline */}
      <line x1="40" y1="75" x2="170" y2="35" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="240" y="42" fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace">STRUCTURE BREAK (BOS)</text>
    </svg>
  );
}

/** Vector Diagram 3: Books, Playbooks & Manuals */
function BookVectorDiagram() {
  return (
    <svg viewBox="0 0 400 210" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bookBg" x1="0" y1="0" x2="400" y2="210" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1a1528" />
          <stop offset="1" stopColor="#0b0816" />
        </linearGradient>
      </defs>
      <rect width="400" height="210" rx="14" fill="url(#bookBg)" />

      {/* Left Page */}
      <path d="M 55 40 Q 120 35 195 44 V 175 Q 120 167 55 173 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
      {/* Right Page */}
      <path d="M 345 40 Q 280 35 205 44 V 175 Q 280 167 345 173 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />

      {/* Center Spine & Red Bookmark */}
      <line x1="200" y1="42" x2="200" y2="177" stroke="#dc2626" strokeWidth="3" />
      <path d="M 200 42 V 190 L 205 183 L 210 190 V 42" fill="#dc2626" />

      {/* Left Page Schematics */}
      <text x="70" y="60" fill="#0f172a" fontSize="8" fontWeight="bold" fontFamily="monospace">CH. 04: LIQUIDITY SWEEPS</text>
      <line x1="70" y1="67" x2="180" y2="67" stroke="#e2e8f0" strokeWidth="1" />

      <rect x="70" y="75" width="105" height="52" rx="4" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.8" />
      <path d="M 80 114 L 100 95 L 115 107 L 140 85 L 160 93" stroke="#dc2626" strokeWidth="1.5" />
      <line x1="80" y1="87" x2="165" y2="87" stroke="#0284c7" strokeWidth="1" strokeDasharray="2 2" />
      <text x="122" y="83" fill="#0284c7" fontSize="7" fontWeight="bold" textAnchor="middle">BUY-SIDE LIQUIDITY</text>

      <line x1="70" y1="138" x2="175" y2="138" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="146" x2="160" y2="146" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="154" x2="170" y2="154" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />

      {/* Right Page Checklists */}
      <text x="220" y="60" fill="#0f172a" fontSize="8" fontWeight="bold" fontFamily="monospace">EXECUTION PLAYBOOK</text>
      <line x1="220" y1="67" x2="330" y2="67" stroke="#e2e8f0" strokeWidth="1" />

      <circle cx="228" cy="80" r="3.5" fill="#10b981" />
      <text x="238" y="83" fill="#334155" fontSize="8" fontWeight="bold">Asian Range Swept</text>

      <circle cx="228" cy="96" r="3.5" fill="#10b981" />
      <text x="238" y="99" fill="#334155" fontSize="8" fontWeight="bold">Judas Swing Validated</text>

      <circle cx="228" cy="112" r="3.5" fill="#10b981" />
      <text x="238" y="115" fill="#334155" fontSize="8" fontWeight="bold">NY Killzone Entry Open</text>

      {/* Official Stamp */}
      <circle cx="295" cy="144" r="18" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3 2" />
      <text x="295" y="142" fill="#dc2626" fontSize="7" fontWeight="black" textAnchor="middle">GAMAT</text>
      <text x="295" y="150" fill="#dc2626" fontSize="6" fontWeight="bold" textAnchor="middle">VERIFIED</text>

      {/* Top Banner Tag */}
      <rect x="25" y="14" width="110" height="20" rx="5" fill="#991b1b" stroke="#f87171" strokeWidth="1" />
      <text x="80" y="27" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">280-PAGE HD PLAYBOOK</text>
    </svg>
  );
}

/** Vector Diagram 4: Strategy Blueprints */
function StrategyVectorDiagram() {
  return (
    <svg viewBox="0 0 400 210" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="stratBg" x1="0" y1="0" x2="400" y2="210" gradientUnits="userSpaceOnUse">
          <stop stopColor="#141419" />
          <stop offset="1" stopColor="#09090c" />
        </linearGradient>
      </defs>
      <rect width="400" height="210" rx="14" fill="url(#stratBg)" />

      {/* Concentric Precision Radar Circles */}
      <circle cx="120" cy="105" r="75" stroke="#334155" strokeWidth="1" strokeDasharray="4 3" />
      <circle cx="120" cy="105" r="50" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" />
      <circle cx="120" cy="105" r="25" stroke="#10b981" strokeWidth="1.5" />

      {/* Crosshairs */}
      <line x1="25" y1="105" x2="215" y2="105" stroke="#475569" strokeWidth="1" />
      <line x1="120" y1="15" x2="120" y2="195" stroke="#475569" strokeWidth="1" />

      {/* Scanning Cone */}
      <path d="M 120 105 L 180 55 A 75 75 0 0 0 120 30 Z" fill="#38bdf8" fillOpacity="0.15" />
      <circle cx="120" cy="105" r="3.5" fill="#ef4444" />

      {/* Session Timeline Cards */}
      <rect x="225" y="30" width="155" height="42" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
      <text x="235" y="47" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">PHASE 1: LONDON OPEN</text>
      <text x="235" y="61" fill="#94a3b8" fontSize="8">Judas swing sweeps Asian high</text>

      <rect x="225" y="82" width="155" height="42" rx="8" fill="#1e293b" stroke="#10b981" strokeWidth="1" />
      <text x="235" y="99" fill="#10b981" fontSize="9" fontWeight="bold" fontFamily="monospace">PHASE 2: NY KILLZONE</text>
      <text x="235" y="113" fill="#94a3b8" fontSize="8">FVG retest + 1:3 R:R execution</text>

      <rect x="225" y="134" width="155" height="42" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
      <text x="235" y="151" fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="monospace">PHASE 3: TARGET SECURED</text>
      <text x="235" y="165" fill="#94a3b8" fontSize="8">Profit locked + journal record</text>

      <circle cx="155" cy="80" r="6" fill="#10b981" fillOpacity="0.3" stroke="#10b981" strokeWidth="1.5" />
      <circle cx="155" cy="80" r="2.5" fill="#10b981" />
      <text x="155" y="68" fill="#10b981" fontSize="7" fontWeight="bold" textAnchor="middle">ENTRY ZONE</text>
    </svg>
  );
}

/** Vector Diagram 5: Physical Journals & Desk Tools */
function ToolVectorDiagram() {
  return (
    <svg viewBox="0 0 400 210" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="toolBg" x1="0" y1="0" x2="400" y2="210" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0f172a" />
          <stop offset="1" stopColor="#070c18" />
        </linearGradient>
      </defs>
      <rect width="400" height="210" rx="14" fill="url(#toolBg)" />

      {/* Hardcover Physical Journal Notebook */}
      <rect x="45" y="30" width="165" height="150" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
      <rect x="55" y="40" width="145" height="130" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" />

      <text x="127" y="70" fill="#fbbf24" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="2">GAMAT FX</text>
      <text x="127" y="84" fill="#cbd5e1" fontSize="8" textAnchor="middle" letterSpacing="1">TRADER'S JOURNAL</text>

      <line x1="70" y1="104" x2="185" y2="104" stroke="#334155" strokeWidth="1" />
      <line x1="70" y1="118" x2="185" y2="118" stroke="#334155" strokeWidth="1" />
      <line x1="70" y1="132" x2="185" y2="132" stroke="#334155" strokeWidth="1" />
      <line x1="70" y1="146" x2="185" y2="146" stroke="#334155" strokeWidth="1" />

      {/* Technical Drafting Pen */}
      <path d="M 205 25 L 220 10 L 228 18 L 160 155 L 148 157 L 152 145 Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
      <polygon points="148,157 142,163 152,155" fill="#dc2626" />

      {/* Position Size & Risk Calculator Suite */}
      <rect x="235" y="40" width="135" height="130" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
      <rect x="245" y="50" width="115" height="22" rx="4" fill="#1e293b" />
      <text x="302" y="65" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">LOT CALCULATOR</text>

      <text x="248" y="90" fill="#94a3b8" fontSize="8">Account Balance:</text>
      <text x="350" y="90" fill="#f8fafc" fontSize="8" fontWeight="bold" textAnchor="end">$10,000</text>

      <text x="248" y="106" fill="#94a3b8" fontSize="8">Risk / Trade:</text>
      <text x="350" y="106" fill="#34d399" fontSize="8" fontWeight="bold" textAnchor="end">1.0% ($100)</text>

      <text x="248" y="122" fill="#94a3b8" fontSize="8">Stop Loss Size:</text>
      <text x="350" y="122" fill="#f87171" fontSize="8" fontWeight="bold" textAnchor="end">12.5 Pips</text>

      <rect x="245" y="134" width="115" height="24" rx="5" fill="#047857" />
      <text x="302" y="150" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">CALCULATED: 0.80 LOT</text>
    </svg>
  );
}

/** Vector Diagram 6: Complete Store & Tools Catalog */
function AllProductsVectorDiagram() {
  return (
    <svg viewBox="0 0 400 210" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="allBg" x1="0" y1="0" x2="400" y2="210" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0b1120" />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>
      </defs>
      <rect width="400" height="210" rx="14" fill="url(#allBg)" />

      {/* Central Trading Desk Monitor Hub */}
      <rect x="130" y="35" width="140" height="90" rx="8" fill="#020617" stroke="#38bdf8" strokeWidth="2" />
      <rect x="140" y="45" width="120" height="70" rx="4" fill="#0f172a" />

      {/* Monitor Stand */}
      <rect x="190" y="125" width="20" height="25" fill="#334155" />
      <rect x="170" y="150" width="60" height="8" rx="4" fill="#475569" />

      {/* Chart inside monitor */}
      <path d="M 145 100 L 165 85 L 180 93 L 205 65 L 225 75 L 250 55" stroke="#10b981" strokeWidth="2" />
      <rect x="195" y="60" width="15" height="15" rx="2" fill="#0284c7" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="1" />

      {/* 4 Connected Floating Ecosystem Nodes */}
      <circle cx="60" cy="65" r="22" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
      <text x="60" y="69" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">AI BOTS</text>
      <line x1="82" y1="70" x2="130" y2="78" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" />

      <circle cx="340" cy="65" r="22" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
      <text x="340" y="69" fill="#10b981" fontSize="8" fontWeight="bold" textAnchor="middle">RADAR</text>
      <line x1="318" y1="70" x2="270" y2="78" stroke="#10b981" strokeWidth="1" strokeDasharray="3 2" />

      <circle cx="60" cy="145" r="22" fill="#1e293b" stroke="#dc2626" strokeWidth="1.5" />
      <text x="60" y="149" fill="#f87171" fontSize="8" fontWeight="bold" textAnchor="middle">BOOKS</text>
      <line x1="82" y1="140" x2="145" y2="125" stroke="#dc2626" strokeWidth="1" strokeDasharray="3 2" />

      <circle cx="340" cy="145" r="22" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="340" y="149" fill="#fbbf24" fontSize="8" fontWeight="bold" textAnchor="middle">TOOLS</text>
      <line x1="318" y1="140" x2="255" y2="125" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" />

      {/* Bottom Summary Bar */}
      <rect x="110" y="172" width="180" height="24" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1" />
      <text x="200" y="188" fill="#f8fafc" fontSize="9" fontWeight="bold" textAnchor="middle">EXPLORE ENTIRE STORE (ALL ITEMS)</text>
    </svg>
  );
}

/* =========================================================================
   MAIN STORE & TOOLS COMPONENT
   ========================================================================= */

export default function StorePage() {
  const { publishedStoreProducts, recordPayment, coupons, validateCoupon, user, isAuthed, myStorePurchases } = useStore();
  const [pageStep, setPageStep] = useState<"intent" | "showcase">("intent");
  const [q, setQ] = useState("");
  const [selectedCat, setSelectedCat] = useState<StoreProductCategory>("all");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeProduct, setActiveProduct] = useState<StoreProduct | null>(null);
  const [activeGalleryImg, setActiveGalleryImg] = useState<string | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<StoreProduct | null>(null);

  // Checkout form state
  const [buyerName, setBuyerName] = useState(user ? `${user.firstName} ${user.lastName}` : "");
  const [buyerEmail, setBuyerEmail] = useState(user?.email ?? "");
  const [buyerPhone, setBuyerPhone] = useState(user?.phone ?? "");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">("transfer");
  const [purchasedProduct, setPurchasedProduct] = useState<StoreProduct | null>(null);
  const [purchasedTxRef, setPurchasedTxRef] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter category pills (without sparkles)
  const categories = [
    { id: "all", label: "All Items", icon: LayoutGrid },
    { id: "bot", label: "AI Bots & EAs", icon: Bot },
    { id: "indicator", label: "Indicators & Scripts", icon: LineChart },
    { id: "ebook", label: "Books & Manuals", icon: BookOpen },
    { id: "strategy", label: "Strategy Blueprints", icon: Target },
    { id: "tool", label: "Physical Journals", icon: Package },
  ];

  // Category Intent Cards Definition
  const categoryCards: {
    id: StoreProductCategory;
    title: string;
    badge: string;
    intent: string;
    description: string;
    features: string[];
    specs: string;
    diagram: React.ReactNode;
  }[] = [
    {
      id: "bot",
      title: "AI Bots & Expert Advisors (EAs)",
      badge: "Automated Algorithmic Execution",
      intent: "I intend to automate my trades with quantitative, latency-free MT4/MT5 algorithms.",
      description: "Hands-free automated trading systems designed for MT4 & MT5 with built-in prop-firm risk protection, trailing stop protocols, and zero emotional bias.",
      features: ["MT4 / MT5 Compatible", "Prop-Firm Validated", "Trailing Stop & Equity Shield"],
      specs: "Instant .ex4 / .ex5 File + Setup Manual",
      diagram: <BotVectorDiagram />,
    },
    {
      id: "indicator",
      title: "Technical Indicators & Scripts",
      badge: "Smart Money Radar & FVG",
      intent: "I intend to spot institutional liquidity sweeps and order blocks directly on my charts.",
      description: "Institutional volume heatmaps, real-time fair value gap radars, and multi-timeframe market structure indicators for TradingView and MT5.",
      features: ["TradingView Pine Script", "Multi-Timeframe Alerts", "Liquidity Sweep Heatmaps"],
      specs: "Protected Script Access + Case Studies",
      diagram: <IndicatorVectorDiagram />,
    },
    {
      id: "ebook",
      title: "Forex Books, Playbooks & Manuals",
      badge: "Institutional Order Flow Literature",
      intent: "I intend to master central bank liquidity sweeps and institutional mechanics in depth.",
      description: "Comprehensive 280-page manuals decoding volume imbalances, killzone entries, and emotional discipline with 120+ high-resolution chart case studies.",
      features: ["High-Res Printable PDF", "120+ Annotated Case Studies", "Desk Cheatsheets Included"],
      specs: "Instant Digital Download + Offline Copy",
      diagram: <BookVectorDiagram />,
    },
    {
      id: "strategy",
      title: "Trade Strategy Blueprints",
      badge: "Rule-Based Mechanical Execution",
      intent: "I intend to follow a validated, step-by-step mechanical entry and risk system.",
      description: "Systematic execution rulebooks covering London Open Judas Swings, New York AM killzone sessions, and high-probability 1:3 risk-to-reward continuation models.",
      features: ["Backtested Edge", "Defined Entry / Exit Checklists", "Session Timeline Guides"],
      specs: "Full Strategy PDF + Video Walkthrough",
      diagram: <StrategyVectorDiagram />,
    },
    {
      id: "tool",
      title: "Physical Journals & Desk Utilities",
      badge: "Disciplined Tracking & Calculations",
      intent: "I intend to track my trades physically and calculate position sizes accurately.",
      description: "Embossed hardcover trading journals, risk management calculator suites, and desk reference cards for disciplined trade execution.",
      features: ["Leatherbound Hardcover", "Lot Size Calculator Suite", "Delivered to Doorstep"],
      specs: "Physical Delivery + Digital Templates",
      diagram: <ToolVectorDiagram />,
    },
    {
      id: "all",
      title: "Complete Store & Tools Catalog",
      badge: "All Categories Combined",
      intent: "I want to browse every trading tool, bot, indicator, and book in one collection.",
      description: "Explore our entire digital catalog of trading tools, automated EAs, indicators, and institutional playbooks in one unified view.",
      features: ["All 5 Categories", "Amazon-Style Filters", "Instant Paystack Express Checkout"],
      specs: "Complete Catalog (All Products)",
      diagram: <AllProductsVectorDiagram />,
    },
  ];

  // Filtered & Sorted products
  const filtered = useMemo(() => {
    let list = publishedStoreProducts.filter((p) => {
      const matchCat = selectedCat === "all" || p.category === selectedCat;
      const matchSearch =
        p.title.toLowerCase().includes(q.toLowerCase()) ||
        p.tagline.toLowerCase().includes(q.toLowerCase()) ||
        p.author.toLowerCase().includes(q.toLowerCase()) ||
        p.deliverableType.toLowerCase().includes(q.toLowerCase());
      return matchCat && matchSearch;
    });

    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
        break;
      case "sales":
        list.sort((a, b) => b.salesCount - a.salesCount);
        break;
      default:
        break;
    }

    return list;
  }, [publishedStoreProducts, selectedCat, q, sortBy]);

  const handleApplyCoupon = () => {
    setCouponError(null);
    setCouponMsg(null);
    if (!couponCode.trim()) return;
    const res = validateCoupon(couponCode, "all");
    if (res.ok && res.discountPercent) {
      setCouponDiscount(res.discountPercent);
      setCouponMsg(`Success! ${res.discountPercent}% discount applied.`);
    } else {
      setCouponDiscount(0);
      setCouponError(res.error || "Invalid or expired coupon code.");
    }
  };

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutProduct) return;
    if (!buyerName.trim() || !buyerEmail.trim()) {
      alert("Please enter your name and email address.");
      return;
    }

    setIsProcessing(true);
    const txRef = generateTxRef("STR");

    setTimeout(() => {
      const subtotal = checkoutProduct.price;
      const discountAmount = couponDiscount > 0 ? Math.round((subtotal * couponDiscount) / 100) : 0;
      const totalAmount = Math.max(0, subtotal - discountAmount);

      recordPayment({
        userId: user?.id ?? `guest_${Date.now()}`,
        userName: buyerName.trim(),
        userEmail: buyerEmail.trim(),
        courseId: `store-${checkoutProduct.id}`,
        courseTitle: checkoutProduct.title,
        subtotal,
        discount: discountAmount,
        vat: 0,
        amount: totalAmount,
        method: paymentMethod,
        coupon: couponDiscount > 0 ? couponCode.trim().toUpperCase() : undefined,
      });

      setPurchasedTxRef(txRef);
      setPurchasedProduct(checkoutProduct);
      setCheckoutProduct(null);
      setIsProcessing(false);
    }, 600);
  };

  const openQuickView = (prod: StoreProduct) => {
    setActiveProduct(prod);
    setActiveGalleryImg(prod.gallery?.[0] || prod.image);
  };

  const selectCategoryFromCard = (catId: StoreProductCategory) => {
    setSelectedCat(catId);
    setPageStep("showcase");
    window.scrollTo({ top: 380, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-[var(--header-h,72px)] text-ink">
      {/* ================= TOP HERO BANNER ================= */}
      <section className="bg-[#0b1120] text-white border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="container-x py-10 sm:py-16 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-sky-400 border border-white/15">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>GAMAT FX OFFICIAL DIGITAL STORE & TOOLS</span>
            </div>

            <h1 className="mt-4 font-display text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Institutional Trading Tools, E-Books & Bots
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Professional software built by our quantitative desk. Instant digital download, license keys, and step-by-step installation guides directly to your email.
            </p>

            {/* Trust Badges */}
            <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-300 border-t border-white/10 pt-5">
              <div className="flex items-center gap-2 font-medium">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>Instant Digital Delivery</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>100% Verified Code & Files</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span>4.9 / 5.0 (1,000+ Students)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STEP 1: CATEGORY INTENT SELECTION HUB ================= */}
      {pageStep === "intent" && (
        <section className="container-x py-12 sm:py-16">
          {/* Section Header */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 border border-brand/20 px-3.5 py-1 text-xs font-bold text-brand uppercase tracking-wider">
              <Compass className="h-3.5 w-3.5" />
              <span>Step 1: Choose Your Trading Intent</span>
            </div>
            <h2 className="mt-3 font-display text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              What do you intend to explore today?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
              Select a category below to explore specialized quantitative trading systems, automated execution robots, or institutional literature tailored to your goals.
            </p>
          </div>

          {/* 6 Category Intent Cards with Vector Diagrams */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {categoryCards.map((cat) => {
              const productCount = publishedStoreProducts.filter(
                (p) => cat.id === "all" || p.category === cat.id
              ).length;

              return (
                <div
                  key={cat.id}
                  onClick={() => selectCategoryFromCard(cat.id)}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 cursor-pointer"
                >
                  <div>
                    {/* Top Vector Diagram Header */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-950 p-2 border-b border-slate-200 group-hover:scale-[1.02] transition-transform duration-500">
                      {cat.diagram}
                      
                      {/* Top badge overlay */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-black/70 backdrop-blur-md border border-white/15 px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-sm">
                          {cat.badge}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center rounded-md bg-brand px-2 py-0.5 text-[10px] font-black text-white shadow-sm">
                          {productCount} {productCount === 1 ? "Item" : "Items"}
                        </span>
                      </div>
                    </div>

                    {/* Body Details */}
                    <div className="p-5 sm:p-6">
                      <h3 className="font-display text-lg font-extrabold text-slate-900 group-hover:text-brand transition leading-snug">
                        {cat.title}
                      </h3>

                      {/* Intent Quote Hook */}
                      <p className="mt-2 text-xs font-bold text-sky-700 bg-sky-50 border border-sky-100 rounded-xl p-2.5 leading-relaxed">
                        "{cat.intent}"
                      </p>

                      <p className="mt-3 text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {cat.description}
                      </p>

                      {/* Feature Pills */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {cat.features.map((f, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                          >
                            <CheckCheck className="h-3 w-3 text-emerald-600" />
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="p-5 sm:p-6 pt-0">
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-mono font-semibold text-slate-500">
                        {cat.specs}
                      </span>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white group-hover:bg-brand transition-colors shadow-sm"
                      >
                        <span>Select Category</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick bypass link */}
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => {
                setSelectedCat("all");
                setPageStep("showcase");
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition underline underline-offset-4 cursor-pointer"
            >
              <span>Already know what you need? Skip to the full product catalog</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* ================= STEP 2: PRODUCT SHOWCASE ================= */}
      {pageStep === "showcase" && (
        <section className="container-x py-8 sm:py-12 animate-[fadeIn_.3s_ease]">
          {/* Back Navigation & Breadcrumb */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <button
              type="button"
              onClick={() => {
                setPageStep("intent");
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-sm cursor-pointer self-start sm:self-auto"
            >
              <ArrowLeft className="h-4 w-4 text-brand" />
              <span>← Back to Categories & Intent Hub</span>
            </button>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span>Showing:</span>
              <span className="font-bold text-slate-950 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {categories.find((c) => c.id === selectedCat)?.label}
              </span>
              <span className="text-slate-400">({filtered.length} products found)</span>
            </div>
          </div>

          {/* Search, Filter & Utility Toolbar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search tools, bots, books, indicators..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none transition"
                />
                {q && (
                  <button
                    type="button"
                    onClick={() => setQ("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort Dropdown & Layout Mode */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-brand focus:outline-none cursor-pointer"
                  >
                    <option value="featured">Featured & Best Selling</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Highest Customer Rating</option>
                    <option value="sales">Most Popular</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="hidden sm:flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      viewMode === "grid" ? "bg-white text-brand shadow-sm font-bold" : "text-slate-400 hover:text-slate-700"
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      viewMode === "list" ? "bg-white text-brand shadow-sm font-bold" : "text-slate-400 hover:text-slate-700"
                    }`}
                    title="Detailed List View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Selar-Style Category Filter Chips */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((c) => {
                const Icon = c.icon;
                const active = selectedCat === c.id;
                const count = publishedStoreProducts.filter((p) => c.id === "all" || p.category === c.id).length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCat(c.id as StoreProductCategory)}
                    className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                      active
                        ? "bg-brand text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{c.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${active ? "bg-white/20 text-white" : "bg-white text-slate-600 font-bold"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Products Results List or Grid */}
          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">No products found</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                No items match your active search filter or category. Try clearing the search or view another category.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => { setQ(""); setSelectedCat("all"); }}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  View All Products
                </button>
                <button
                  type="button"
                  onClick={() => setPageStep("intent")}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Back to Categories Hub
                </button>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            /* ================= GRID VIEW ================= */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {filtered.map((prod) => {
                const savings = prod.originalPrice ? prod.originalPrice - prod.price : 0;
                const discount = prod.originalPrice
                  ? Math.round((savings / prod.originalPrice) * 100)
                  : null;

                return (
                  <div
                    key={prod.id}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300"
                  >
                    <div>
                      {/* Product Mockup Image */}
                      <div
                        onClick={() => openQuickView(prod)}
                        className="relative aspect-[16/10] overflow-hidden bg-slate-900 cursor-pointer"
                      >
                        <img
                          src={prod.image}
                          alt={prod.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          {prod.badge && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase text-slate-950 shadow-md">
                              ★ {prod.badge}
                            </span>
                          )}
                          {discount && (
                            <span className="inline-flex items-center rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white shadow-md">
                              Save {discount}%
                            </span>
                          )}
                        </div>

                        {/* Bottom deliverable pill */}
                        <div className="absolute bottom-3 left-3 text-[11px] text-white">
                          <span className="inline-flex items-center gap-1 font-semibold bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/20">
                            <Package className="h-3 w-3 text-sky-400 shrink-0" />
                            <span className="truncate max-w-[200px]">{prod.deliverableType}</span>
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
                          {prod.author}
                        </p>

                        <h3
                          onClick={() => openQuickView(prod)}
                          className="mt-1 font-display text-base font-extrabold text-slate-900 group-hover:text-brand transition leading-snug line-clamp-2 cursor-pointer"
                        >
                          {prod.title}
                        </h3>

                        {/* Star Rating */}
                        <div className="mt-2 flex items-center gap-1.5 text-xs">
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                            ))}
                          </div>
                          <span className="font-extrabold text-slate-800">{prod.rating.toFixed(1)}</span>
                          <span className="text-slate-400">({prod.reviewCount})</span>
                        </div>

                        <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {prod.tagline}
                        </p>

                        {/* Compatibility Badges */}
                        {prod.compatibility && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {prod.compatibility.map((c) => (
                              <span
                                key={c}
                                className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Pricing & Buy Buttons */}
                    <div className="p-5 pt-0">
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="font-display text-xl font-black text-slate-950">
                            {naira(prod.price)}
                          </span>
                          {prod.originalPrice && (
                            <span className="ml-2 text-xs text-slate-400 line-through">
                              {naira(prod.originalPrice)}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setCheckoutProduct(prod)}
                          className="rounded-xl bg-slate-900 hover:bg-brand text-white px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <span>Buy Now</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ================= DETAILED LIST VIEW ================= */
            <div className="space-y-4">
              {filtered.map((prod) => {
                const savings = prod.originalPrice ? prod.originalPrice - prod.price : 0;
                const discount = prod.originalPrice
                  ? Math.round((savings / prod.originalPrice) * 100)
                  : null;

                return (
                  <div
                    key={prod.id}
                    className="flex flex-col sm:flex-row items-stretch justify-between rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition p-4 gap-5"
                  >
                    <div className="flex flex-col sm:flex-row gap-5 flex-1 min-w-0">
                      <div
                        onClick={() => openQuickView(prod)}
                        className="relative w-full sm:w-56 aspect-[16/10] sm:aspect-auto rounded-xl overflow-hidden bg-slate-900 shrink-0 cursor-pointer"
                      >
                        <img src={prod.image} alt={prod.title} className="h-full w-full object-cover" loading="lazy" />
                        {discount && (
                          <span className="absolute top-2 left-2 rounded bg-emerald-600 px-2 py-0.5 text-[9px] font-black text-white">
                            Save {discount}%
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{prod.author}</p>
                        <h3
                          onClick={() => openQuickView(prod)}
                          className="mt-1 font-display text-base font-extrabold text-slate-900 hover:text-brand transition cursor-pointer"
                        >
                          {prod.title}
                        </h3>

                        <div className="mt-1.5 flex items-center gap-2 text-xs">
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                            ))}
                          </div>
                          <span className="font-extrabold text-slate-800">{prod.rating.toFixed(1)}</span>
                          <span className="text-slate-400">({prod.reviewCount} customer reviews)</span>
                        </div>

                        <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {prod.tagline}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1 font-medium bg-slate-100 px-2.5 py-1 rounded-md">
                            <Package className="h-3.5 w-3.5 text-slate-400" />
                            {prod.deliverableType}
                          </span>
                          {prod.fileSize && (
                            <span className="text-[11px] text-slate-400">• {prod.fileSize}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Price & Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-6 shrink-0 gap-3">
                      <div className="text-left sm:text-right">
                        <p className="font-display text-2xl font-black text-slate-950">{naira(prod.price)}</p>
                        {prod.originalPrice && (
                          <p className="text-xs text-slate-400 line-through">{naira(prod.originalPrice)}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openQuickView(prod)}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={() => setCheckoutProduct(prod)}
                          className="rounded-xl bg-brand hover:bg-brand-dark text-white px-4 py-2 text-xs font-bold transition shadow-sm cursor-pointer"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ================= PRODUCT QUICK VIEW MODAL ================= */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl my-8">
            <button
              type="button"
              onClick={() => setActiveProduct(null)}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Product Gallery */}
              <div>
                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm">
                  <img src={activeGalleryImg || activeProduct.image} alt="" className="h-full w-full object-cover" />
                </div>
                {activeProduct.gallery && activeProduct.gallery.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {activeProduct.gallery.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveGalleryImg(img)}
                        className={`h-14 w-18 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                          activeGalleryImg === img ? "border-brand ring-2 ring-brand/20" : "border-slate-200 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-brand/10 text-brand px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                      {activeProduct.badge || "Verified Product"}
                    </span>
                    <span className="text-[11px] text-slate-400">• {activeProduct.deliverableType}</span>
                  </div>

                  <h3 className="mt-2 font-display text-xl font-extrabold text-slate-900 leading-snug">
                    {activeProduct.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">{activeProduct.author}</p>

                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="font-bold text-slate-800">{activeProduct.rating.toFixed(1)}</span>
                    <span className="text-slate-400">({activeProduct.reviewCount} customer reviews)</span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-display text-3xl font-black text-slate-950">
                      {naira(activeProduct.price)}
                    </span>
                    {activeProduct.originalPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        {naira(activeProduct.originalPrice)}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                    {activeProduct.description}
                  </p>

                  {/* Feature Checklist */}
                  <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                    <p className="text-[11px] font-bold text-slate-900 uppercase">What's Included in Your Download:</p>
                    {activeProduct.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutProduct(activeProduct);
                      setActiveProduct(null);
                    }}
                    className="flex-1 rounded-xl bg-brand hover:bg-brand-dark py-3 px-5 text-xs font-bold text-white transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Instant Express Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= EXPRESS SELAR/PAYSTACK CHECKOUT MODAL ================= */}
      {checkoutProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl my-8">
            <button
              type="button"
              onClick={() => setCheckoutProduct(null)}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <img src={checkoutProduct.image} alt="" className="h-12 w-12 rounded-xl object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Express Digital Checkout</span>
                <h4 className="font-display text-sm font-bold text-slate-900 truncate">{checkoutProduct.title}</h4>
                <p className="text-xs font-black text-slate-950">{naira(checkoutProduct.price)}</p>
              </div>
            </div>

            <form onSubmit={handlePurchase} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Tonye Taylor"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-900 focus:border-brand focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Email Address (For Instant Download Delivery) *</label>
                <input
                  type="email"
                  required
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="e.g. tonye@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-900 focus:border-brand focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">WhatsApp Phone Number</label>
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="e.g. +234 800 000 0000"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-900 focus:border-brand focus:bg-white focus:outline-none"
                />
              </div>

              {/* Coupon Code Box */}
              <div className="rounded-xl border border-dashed border-slate-300 p-3 bg-slate-50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon / Discount Code"
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs uppercase font-mono font-bold text-slate-900 focus:border-brand focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponMsg && <p className="mt-1.5 text-[11px] font-bold text-emerald-600">{couponMsg}</p>}
                {couponError && <p className="mt-1.5 text-[11px] font-bold text-red-600">{couponError}</p>}
              </div>

              {/* Payment Summary */}
              <div className="rounded-xl bg-slate-100 p-3 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{naira(checkoutProduct.price)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount ({couponDiscount}%)</span>
                    <span>-{naira(Math.round((checkoutProduct.price * couponDiscount) / 100))}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-200">
                  <span>Total Amount Due</span>
                  <span>
                    {naira(Math.max(0, checkoutProduct.price - Math.round((checkoutProduct.price * couponDiscount) / 100)))}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full rounded-xl bg-brand hover:bg-brand-dark py-3.5 px-6 text-sm font-bold text-white transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing Secure Order...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Complete Secure Purchase & Download</span>
                    </>
                  )}
                </button>
                <p className="mt-2 text-center text-[11px] text-slate-400">
                  🔒 256-bit encrypted checkout via Paystack / Card / Transfer
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= PURCHASE CONFIRMATION & DOWNLOAD MODAL ================= */}
      {purchasedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h3 className="font-display text-xl font-extrabold text-slate-900">Payment Confirmed!</h3>
            <p className="mt-1 text-xs text-slate-500">
              Transaction Reference: <span className="font-mono font-bold text-slate-800">{purchasedTxRef}</span>
            </p>

            {/* Direct Download Card */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
              <div className="flex items-center gap-3">
                <img src={purchasedProduct.image} alt="" className="h-12 w-12 rounded-xl object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-slate-900 truncate">{purchasedProduct.title}</p>
                  <p className="text-[11px] text-slate-500 truncate">{purchasedProduct.deliverableType}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-2">
                <a
                  href={purchasedProduct.downloadUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-xl bg-brand py-2.5 px-4 text-xs font-bold text-white hover:bg-brand-dark transition text-center flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" /> Download Files Now
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setPurchasedProduct(null);
                    navigate("/dashboard");
                  }}
                  className="rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 text-center cursor-pointer"
                >
                  View in Dashboard
                </button>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-slate-400">
              A copy of your license key and download instructions have also been sent to your email.
            </p>

            <button
              type="button"
              onClick={() => setPurchasedProduct(null)}
              className="mt-6 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Continue Browsing Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
