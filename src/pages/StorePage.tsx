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
  Layers,
  Award,
  Calculator,
  BookMarked,
} from "lucide-react";
import { payWithPaystack, generateTxRef } from "../lib/paystack";

type SortOption = "featured" | "price-asc" | "price-desc" | "rating" | "sales";

/* =========================================================================
   SIMPLE & MINIMALIST TRADING CATEGORY CONFIGURATION
   ========================================================================= */

export interface TradingCategoryCard {
  id: string;
  catId: StoreProductCategory;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  searchQuery?: string;
}

export const TRADING_CATEGORY_CARDS: TradingCategoryCard[] = [
  {
    id: "bots",
    catId: "bot",
    title: "AI Bots & Expert Advisors",
    icon: Bot,
  },
  {
    id: "indicators",
    catId: "indicator",
    title: "Indicators & Chart Scripts",
    icon: LineChart,
  },
  {
    id: "smc",
    catId: "indicator",
    title: "Smart Money & SMC Radar",
    icon: Layers,
    searchQuery: "smart money",
  },
  {
    id: "strategy",
    catId: "strategy",
    title: "Strategy Blueprints",
    icon: Compass,
  },
  {
    id: "ebooks",
    catId: "ebook",
    title: "Books & PDF Manuals",
    icon: BookOpen,
  },
  {
    id: "prop",
    catId: "strategy",
    title: "Prop Firm Passing",
    icon: Award,
    searchQuery: "prop",
  },
  {
    id: "calculators",
    catId: "strategy",
    title: "Risk & Lot Calculators",
    icon: Calculator,
    searchQuery: "calculator",
  },
  {
    id: "scalpers",
    catId: "bot",
    title: "Session Scalpers",
    icon: Zap,
    searchQuery: "judas",
  },
  {
    id: "journals",
    catId: "tool",
    title: "Physical Journals & Tools",
    icon: BookMarked,
  },
  {
    id: "all",
    catId: "all",
    title: "All Products & Tools",
    icon: LayoutGrid,
  },
];

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

  const selectCategoryFromCard = (card: TradingCategoryCard) => {
    setSelectedCat(card.catId);
    if (card.searchQuery) {
      setQ(card.searchQuery);
    } else {
      setQ("");
    }
    setPageStep("showcase");
    window.scrollTo({ top: 380, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-[var(--header-h,72px)] text-ink">
      {/* ================= TOP HERO BANNER ================= */}
      <section className="bg-slate-950 text-white border-b border-slate-800">
        <div className="container-x py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading, intro, trust chips */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3.5 py-1 text-xs font-bold text-sky-400 border border-sky-500/20">
                <ShoppingBag className="h-3.5 w-3.5 text-sky-400" />
                <span className="tracking-wide uppercase text-[11px]">GAMAT FX Official Store & Tools</span>
              </div>

              <h1 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
                Institutional Trading Tools, E-Books & Bots
              </h1>
              <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Proprietary software built by our quantitative desk. Instant digital download, license keys, and step-by-step installation guides directly to your email.
              </p>

              {/* Orderly Trust Pills (Clean, no sparkles) */}
              <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
                <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 text-slate-200">
                  <Zap className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="font-semibold">Instant Digital Delivery</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 text-slate-200">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">100% Verified Code & Files</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 text-slate-200">
                  <ThumbsUp className="h-4 w-4 text-sky-400 shrink-0" />
                  <span className="font-semibold">4.9 / 5.0 Rating (1,000+ Students)</span>
                </div>
              </div>
            </div>

            {/* Right Column: Sleek Quant Desk Highlights Card */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Quant Desk Catalog
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
                    LIVE REPOSITORY
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/5 border border-white/5 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Execution Speed</p>
                    <p className="mt-1 font-mono text-sm font-black text-white flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                      <span>Sub-millisecond</span>
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/5 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Format</p>
                    <p className="mt-1 font-mono text-sm font-black text-white">MT4 • MT5 • PDF</p>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/5 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Code Quality</p>
                    <p className="mt-1 font-mono text-sm font-black text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Verified Clean</span>
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/5 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Licensing</p>
                    <p className="mt-1 font-mono text-sm font-black text-white">Lifetime Access</p>
                  </div>
                </div>

                <div className="mt-3.5 flex items-center justify-between rounded-xl bg-sky-500/10 border border-sky-500/20 px-3.5 py-2.5 text-xs text-sky-300">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
                    <span>Instant automated license dispatch</span>
                  </span>
                  <span className="font-mono font-bold text-white text-[11px]">24/7 Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STEP 1: CATEGORY INTENT SELECTION HUB ================= */}
      {pageStep === "intent" && (
        <section className="container-x py-10 sm:py-14">
          {/* Section Header: Minimalist and clean like reference */}
          <div className="mb-6 sm:mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Find tools & resources for every type of trading
            </h2>
          </div>

          {/* Simple & Minimalist Category Cards Grid (10 cards matching reference) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
            {TRADING_CATEGORY_CARDS.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => selectCategoryFromCard(cat)}
                  className="group flex flex-col justify-between h-36 sm:h-40 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 text-left hover:border-emerald-500 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="text-emerald-500 group-hover:scale-110 transition-transform">
                    <Icon className="h-7 w-7 sm:h-8 sm:w-8 stroke-[1.75]" />
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors leading-snug">
                    {cat.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick bypass link */}
          <div className="mt-8 sm:mt-10 text-center">
            <button
              type="button"
              onClick={() => {
                setSelectedCat("all");
                setQ("");
                setPageStep("showcase");
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition underline underline-offset-4 cursor-pointer"
            >
              <span>Skip to view all products directly</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* ================= STEP 2: PRODUCT SHOWCASE ================= */}
      {pageStep === "showcase" && (
        <section className="container-x py-8 sm:py-10 animate-[fadeIn_.3s_ease]">
          {/* Modern Orderly Header & Navigation Bar */}
          <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
            {/* Top row: Back Button + Breadcrumbs + Counter */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPageStep("intent");
                    window.scrollTo({ top: 320, behavior: "smooth" });
                  }}
                  className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-brand hover:text-white hover:border-brand transition-all cursor-pointer shadow-2xs"
                >
                  <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span>All Categories</span>
                </button>

                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                  <span>/</span>
                  <span className="text-slate-500 font-medium">Store</span>
                  <span>/</span>
                  <span className="font-bold text-slate-800">
                    {categories.find((c) => c.id === selectedCat)?.label ?? "All Items"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                  {filtered.length} {filtered.length === 1 ? "Product" : "Products"} Available
                </span>
              </div>
            </div>

            {/* Bottom row: Category Title & Description */}
            <div className="pt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2.5">
                  {(() => {
                    const CurrentIcon = categories.find((c) => c.id === selectedCat)?.icon || LayoutGrid;
                    return (
                      <>
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                          <CurrentIcon className="h-4 w-4" />
                        </span>
                        <span>{categories.find((c) => c.id === selectedCat)?.label ?? "All Items"}</span>
                      </>
                    );
                  })()}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Institutional quantitative algorithms, indicators, manuals, and verified tools.
                </p>
              </div>
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
