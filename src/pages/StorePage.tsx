import { useState, useMemo, useEffect } from "react";
import { useStore } from "../lib/store";
import { type StoreProduct, type StoreProductCategory } from "../lib/storeProducts";
import { naira } from "../lib/courses";
import { navigate } from "../lib/router";
import PageHero from "../components/PageHero";
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
  Coins,
  Loader2,
  Compass,
  CheckCheck,
  Layers,
  Award,
  Calculator,
  BookMarked,
} from "lucide-react";
import { payWithBachs, generateTxRef } from "../lib/bachs";

type SortOption = "featured" | "price-asc" | "price-desc" | "rating" | "sales";

/* =========================================================================
   CATEGORY CARDS HUB CONFIGURATION
   ========================================================================= */

export interface TradingCategoryCard {
  id: string;
  catId: StoreProductCategory;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  searchQuery?: string;
  desc?: string;
}

export const TRADING_CATEGORY_CARDS: TradingCategoryCard[] = [
  {
    id: "bots",
    catId: "bot",
    title: "AI Bots & Expert Advisors",
    icon: Bot,
    desc: "Proprietary algorithmic trading robots for MT4 and MT5.",
  },
  {
    id: "indicators",
    catId: "indicator",
    title: "Indicators & Chart Scripts",
    icon: LineChart,
    desc: "TradingView invite-only scripts and MT5 custom indicators.",
  },
  {
    id: "smc",
    catId: "indicator",
    title: "Smart Money & SMC Radar",
    icon: Layers,
    searchQuery: "smart money",
    desc: "Fair Value Gap (FVG) and institutional liquidity radars.",
  },
  {
    id: "strategy",
    catId: "strategy",
    title: "Strategy Blueprints",
    icon: Compass,
    desc: "Execution frameworks and institutional risk models.",
  },
  {
    id: "ebooks",
    catId: "ebook",
    title: "Books & PDF Manuals",
    icon: BookOpen,
    desc: "High-resolution annotated playbooks and trade markups.",
  },
  {
    id: "prop",
    catId: "strategy",
    title: "Prop Firm Passing",
    icon: Award,
    searchQuery: "prop",
    desc: "Drawdown insulation blueprints and lot-size consistency tools.",
  },
  {
    id: "calculators",
    catId: "strategy",
    title: "Risk & Lot Calculators",
    icon: Calculator,
    searchQuery: "calculator",
    desc: "Interactive risk calculators and position sizing models.",
  },
  {
    id: "scalpers",
    catId: "bot",
    title: "Session Scalpers",
    icon: Zap,
    searchQuery: "judas",
    desc: "London and New York session sweep automation bots.",
  },
  {
    id: "journals",
    catId: "tool",
    title: "Physical Journals & Tools",
    icon: BookMarked,
    desc: "Hardcover 90-day trader discipline planners and Notion logs.",
  },
  {
    id: "all",
    catId: "all",
    title: "All Products & Tools",
    icon: LayoutGrid,
    desc: "Browse our entire repository of quantitative trading tools.",
  },
];

/* =========================================================================
   MAIN STORE & TOOLS COMPONENT (Dual View: Hub Page & Catalog Page)
   ========================================================================= */

interface StorePageProps {
  categoryParam?: string;
}

export default function StorePage({ categoryParam }: StorePageProps) {
  const { publishedStoreProducts, recordPayment, coupons, validateCoupon, user, isAuthed, myStorePurchases } = useStore();

  // Determine initial page view: "hub" (category cards page) or "catalog" (products showcase page)
  const isCatalogInitial = Boolean(categoryParam) || window.location.hash.includes("/store/catalog");
  const [view, setView] = useState<"hub" | "catalog">(isCatalogInitial ? "catalog" : "hub");

  // Matched category from categoryParam or default
  const matchedInitial = TRADING_CATEGORY_CARDS.find(
    (c) => c.id === categoryParam || c.catId === categoryParam
  );

  const [selectedCardId, setSelectedCardId] = useState<string>(matchedInitial ? matchedInitial.id : "all");
  const [selectedCat, setSelectedCat] = useState<StoreProductCategory>(matchedInitial ? matchedInitial.catId : "all");
  const [q, setQ] = useState(matchedInitial?.searchQuery || "");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeProduct, setActiveProduct] = useState<StoreProduct | null>(null);
  const [activeGalleryImg, setActiveGalleryImg] = useState<string | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<StoreProduct | null>(null);

  // Sync if categoryParam prop changes
  useEffect(() => {
    if (categoryParam) {
      const match = TRADING_CATEGORY_CARDS.find(
        (c) => c.id === categoryParam || c.catId === categoryParam
      );
      if (match) {
        setSelectedCardId(match.id);
        setSelectedCat(match.catId);
        setQ(match.searchQuery || "");
      }
      setView("catalog");
    }
  }, [categoryParam]);

  // Checkout form state
  const [buyerName, setBuyerName] = useState(user ? `${user.firstName} ${user.lastName}` : "");
  const [buyerEmail, setBuyerEmail] = useState(user?.email ?? "");
  const [buyerPhone, setBuyerPhone] = useState(user?.phone ?? "");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer" | "crypto">("card");
  const [purchasedProduct, setPurchasedProduct] = useState<StoreProduct | null>(null);
  const [purchasedTxRef, setPurchasedTxRef] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter category pills
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

    const subtotal = checkoutProduct.price;
    const discountAmount = couponDiscount > 0 ? Math.round((subtotal * couponDiscount) / 100) : 0;
    const totalAmount = Math.max(0, subtotal - discountAmount);

    const onFinishPayment = (finalTxRef: string, methodUsed: "card" | "transfer") => {
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
        method: methodUsed,
        coupon: couponDiscount > 0 ? couponCode.trim().toUpperCase() : undefined,
      });

      setPurchasedTxRef(finalTxRef);
      setPurchasedProduct(checkoutProduct);
      setCheckoutProduct(null);
      setIsProcessing(false);
    };

    if (totalAmount > 0) {
      payWithBachs({
        amount: totalAmount,
        currency: "NGN",
        email: buyerEmail.trim(),
        name: buyerName.trim(),
        phone: buyerPhone.trim(),
        reference: txRef,
        metadata: {
          product_id: checkoutProduct.id,
          product_title: checkoutProduct.title,
          customer_name: buyerName.trim(),
          preferred_channel: paymentMethod,
        },
        onSuccess: (session) => {
          onFinishPayment(session.reference || txRef, paymentMethod);
        },
        onClose: () => setIsProcessing(false),
        onError: (err) => {
          setIsProcessing(false);
          alert(`Payment could not be completed: ${err.message}`);
        },
      });
      return;
    }

    setTimeout(() => {
      onFinishPayment(txRef, paymentMethod);
    }, 600);
  };

  const openQuickView = (prod: StoreProduct) => {
    setActiveProduct(prod);
    setActiveGalleryImg(prod.gallery?.[0] || prod.image);
  };

  // Navigates from Category Hub Page to the Dedicated Products Page
  const handleSelectCard = (cat: TradingCategoryCard) => {
    setSelectedCardId(cat.id);
    setSelectedCat(cat.catId);
    setQ(cat.searchQuery || "");
    setView("catalog");
    navigate(cat.id === "all" ? "/store/catalog" : `/store/${cat.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Returns back to the Category Hub Page
  const handleBackToHub = () => {
    setView("hub");
    navigate("/store");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryPillSelect = (catId: StoreProductCategory) => {
    setSelectedCat(catId);
    setQ("");
    const matchedCard = TRADING_CATEGORY_CARDS.find((c) => c.catId === catId && !c.searchQuery);
    setSelectedCardId(matchedCard ? matchedCard.id : (catId === "all" ? "all" : ""));
  };

  /* =========================================================================
     PAGE 1: CATEGORY HUB (Shown when view === "hub")
     ========================================================================= */
  if (view === "hub") {
    return (
      <div className="min-h-screen bg-cream text-ink">
        {/* ================= OFFICIAL PAGE HERO ================= */}
        <PageHero
          eyebrow="Official Store & Trading Tools"
          title={
            <>
              Institutional Tools, <span className="text-brand">E-Books & Bots</span>
            </>
          }
          subtitle="Battle-tested trading software, proprietary MT4/MT5 algorithms, institutional playbooks, and discipline journals engineered by GAMAT FX mentors."
          image="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=2000&q=80"
          crumb="Store & Trading Tools"
        />

        {/* ================= CATEGORY SELECTION HUB ================= */}
        <section className="py-10 sm:py-16 bg-white border-b border-line">
          <div className="container-x">
            {/* Header: Minimalist and clean matching reference */}
            <div className="max-w-2xl">
              <span className="eyebrow">Product Categories</span>
              <h2 className="section-title mt-2">
                Find tools & resources for every type of trading
              </h2>
              <p className="mt-3 text-muted text-sm sm:text-base">
                Explore our quantitative algorithms, indicators, manuals, and trading journals engineered for serious market practitioners.
              </p>
            </div>

            {/* Simple & Minimalist Category Cards Grid (10 cards matching reference) */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
              {TRADING_CATEGORY_CARDS.map((cat) => {
                const Icon = cat.icon;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCard(cat)}
                    className="group flex flex-col justify-between min-h-[160px] sm:min-h-[175px] md:h-44 rounded-2xl border border-line bg-white p-5 sm:p-6 text-left hover:border-brand/70 hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    <div className="text-brand group-hover:scale-105 transition-transform duration-200">
                      <Icon className="h-8 w-8 sm:h-9 sm:w-9 stroke-[1.5]" />
                    </div>
                    <div>
                      <span className="text-base sm:text-lg lg:text-[19px] font-normal leading-snug tracking-tight text-ink group-hover:text-brand transition-colors">
                        {cat.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-10 text-center">
              <p className="text-xs sm:text-sm text-muted">
                Click any category above to view our dedicated trading tools, bots, and resources.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* =========================================================================
     PAGE 2: DEDICATED PRODUCTS SHOWCASE (Shown on separate page after click)
     ========================================================================= */
  const activeCategoryInfo =
    TRADING_CATEGORY_CARDS.find((c) => c.id === selectedCardId) ||
    TRADING_CATEGORY_CARDS.find((c) => c.catId === selectedCat);

  const CurrentIcon = activeCategoryInfo?.icon || categories.find((c) => c.id === selectedCat)?.icon || LayoutGrid;

  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* ================= COMPACT HERO HEADER FOR CATALOG PAGE ================= */}
      <PageHero
        eyebrow="GAMAT FX Tools Catalog"
        title={
          <>
            Trading Tools, <span className="text-brand">E-Books & Bots</span>
          </>
        }
        subtitle="Download verified trading algorithms, prop-firm passing tools, and institutional playbooks with instant digital delivery."
        image="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=2000&q=80"
        crumb="Store Catalog"
      />

      {/* ================= DEDICATED CATALOG SHOWCASE SECTION ================= */}
      <section className="py-8 sm:py-12 bg-cream">
        <div className="container-x">
          {/* Top Header Card (Matches User's Reference Screenshot) */}
          <div className="mb-6 rounded-2xl border border-line bg-white p-4 sm:p-5 shadow-xs">
            {/* Top row: Breadcrumb + Back Button + Counter */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3.5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBackToHub}
                  className="group inline-flex items-center gap-2 rounded-xl border border-line bg-cream px-3 py-1.5 text-xs font-bold text-ink hover:bg-brand hover:text-white hover:border-brand transition-all cursor-pointer shadow-2xs"
                >
                  <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span>All Categories</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>/</span>
                  <span className="font-semibold text-ink">Catalog</span>
                  <span>/</span>
                  <span className="font-bold text-brand">
                    {activeCategoryInfo?.title || categories.find((c) => c.id === selectedCat)?.label || "All Items"}
                  </span>
                  {q && (
                    <>
                      <span>/</span>
                      <span className="text-ink font-medium italic">"{q}"</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(selectedCat !== "all" || q) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCat("all");
                      setSelectedCardId("all");
                      setQ("");
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 hover:bg-slate-200 px-3 py-1 text-xs font-semibold text-ink transition cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                    <span>Reset Filter</span>
                  </button>
                )}
                <span className="inline-flex items-center rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand">
                  {filtered.length} {filtered.length === 1 ? "Product" : "Products"} Available
                </span>
              </div>
            </div>

            {/* Bottom row: Category Title & Description */}
            <div className="pt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-ink tracking-tight flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-light text-brand">
                    <CurrentIcon className="h-4 w-4" />
                  </span>
                  <span>
                    {activeCategoryInfo?.title || categories.find((c) => c.id === selectedCat)?.label || "All Items"}
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-muted mt-1">
                  {activeCategoryInfo?.desc ||
                    "Proprietary trading robots, institutional scripts, strategy manuals, and accountability tools."}
                </p>
              </div>
            </div>
          </div>

          {/* Search, Filter & Utility Toolbar (Matches User's Reference Screenshot) */}
          <div className="rounded-2xl border border-line bg-white p-4 shadow-sm mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search tools, bots, books, indicators..."
                  className="w-full rounded-xl border border-line bg-cream/50 py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium text-ink placeholder:text-muted focus:border-brand focus:bg-white focus:outline-none transition"
                />
                {q && (
                  <button
                    type="button"
                    onClick={() => setQ("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort Dropdown & Layout Mode */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted ml-0.5 shrink-0" />
                  <span className="hidden sm:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="rounded-xl border border-line bg-white pl-3.5 pr-8 py-2 text-xs font-bold text-ink focus:border-brand focus:outline-none cursor-pointer"
                  >
                    <option value="featured">Featured & Best Selling</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Highest Customer Rating</option>
                    <option value="sales">Most Popular</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="hidden sm:flex items-center rounded-xl border border-line bg-cream/60 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      viewMode === "grid" ? "bg-white text-brand shadow-sm font-bold" : "text-muted hover:text-ink"
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      viewMode === "list" ? "bg-white text-brand shadow-sm font-bold" : "text-muted hover:text-ink"
                    }`}
                    title="Detailed List View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Category Filter Pills */}
            <div className="mt-4 pt-4 border-t border-line flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((c) => {
                const Icon = c.icon;
                const active = selectedCat === c.id;
                const count = publishedStoreProducts.filter((p) => c.id === "all" || p.category === c.id).length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleCategoryPillSelect(c.id as StoreProductCategory)}
                    className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                      active
                        ? "bg-brand text-white shadow-sm"
                        : "bg-cream text-ink hover:bg-brand-light/60"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{c.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${active ? "bg-white/20 text-white" : "bg-white text-ink font-bold"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Products Results List or Grid */}
          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-line bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-ink">No products found</h3>
              <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
                No items match your active search filter or category. Try clearing the search or view another category.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCat("all");
                    setSelectedCardId("all");
                    setQ("");
                  }}
                  className="rounded-xl bg-brand hover:bg-brand-dark px-4 py-2 text-xs font-bold text-white transition cursor-pointer"
                >
                  View All Products
                </button>
                <button
                  type="button"
                  onClick={handleBackToHub}
                  className="rounded-xl border border-line px-4 py-2 text-xs font-bold text-ink hover:bg-slate-50 transition cursor-pointer"
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
                    className="group flex flex-col justify-between rounded-2xl border border-line bg-white overflow-hidden shadow-sm hover:shadow-xl hover:border-brand/50 transition-all duration-300"
                  >
                    <div>
                      {/* Product Mockup Image */}
                      <div
                        onClick={() => openQuickView(prod)}
                        className="relative aspect-[16/10] overflow-hidden bg-ink cursor-pointer"
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
                            <span className="inline-flex items-center rounded-md bg-brand px-2 py-0.5 text-[10px] font-black text-white shadow-md">
                              Save {discount}%
                            </span>
                          )}
                        </div>

                        {/* Bottom deliverable pill */}
                        <div className="absolute bottom-3 left-3 text-[11px] text-white">
                          <span className="inline-flex items-center gap-1 font-semibold bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/20">
                            <Package className="h-3 w-3 text-brand-light shrink-0" />
                            <span className="truncate max-w-[200px]">{prod.deliverableType}</span>
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted truncate">
                          {prod.author}
                        </p>

                        <h4
                          onClick={() => openQuickView(prod)}
                          className="mt-1 font-display text-base font-bold text-ink group-hover:text-brand transition leading-snug line-clamp-2 cursor-pointer"
                        >
                          {prod.title}
                        </h4>

                        {/* Star Rating */}
                        <div className="mt-2 flex items-center gap-1.5 text-xs">
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                            ))}
                          </div>
                          <span className="font-extrabold text-ink">{prod.rating.toFixed(1)}</span>
                          <span className="text-muted">({prod.reviewCount})</span>
                        </div>

                        <p className="mt-2 text-xs text-muted line-clamp-2 leading-relaxed">
                          {prod.tagline}
                        </p>

                        {/* Compatibility Badges */}
                        {prod.compatibility && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {prod.compatibility.map((c) => (
                              <span
                                key={c}
                                className="inline-flex items-center rounded-lg bg-cream px-2 py-0.5 text-[10px] font-bold text-muted border border-line"
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
                      <div className="pt-3 border-t border-line flex items-center justify-between">
                        <div>
                          <span className="font-display text-xl font-bold text-ink">
                            {naira(prod.price)}
                          </span>
                          {prod.originalPrice && (
                            <span className="ml-2 text-xs text-muted line-through">
                              {naira(prod.originalPrice)}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setCheckoutProduct(prod)}
                          className="rounded-xl bg-brand hover:bg-brand-dark text-white px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <span>Get Access</span>
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
                    className="flex flex-col sm:flex-row items-stretch justify-between rounded-2xl border border-line bg-white overflow-hidden shadow-sm hover:shadow-md transition p-4 gap-5"
                  >
                    <div className="flex flex-col sm:flex-row gap-5 flex-1 min-w-0">
                      <div
                        onClick={() => openQuickView(prod)}
                        className="relative w-full sm:w-56 aspect-[16/10] sm:aspect-auto rounded-xl overflow-hidden bg-ink shrink-0 cursor-pointer"
                      >
                        <img src={prod.image} alt={prod.title} className="h-full w-full object-cover" loading="lazy" />
                        {discount && (
                          <span className="absolute top-2 left-2 rounded bg-brand px-2 py-0.5 text-[9px] font-black text-white">
                            Save {discount}%
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{prod.author}</p>
                        <h4
                          onClick={() => openQuickView(prod)}
                          className="mt-1 font-display text-base font-bold text-ink hover:text-brand transition cursor-pointer"
                        >
                          {prod.title}
                        </h4>

                        <div className="mt-1.5 flex items-center gap-2 text-xs">
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                            ))}
                          </div>
                          <span className="font-bold text-ink">{prod.rating.toFixed(1)}</span>
                          <span className="text-muted">({prod.salesCount} downloads)</span>
                        </div>

                        <p className="mt-2 text-xs text-muted line-clamp-2">{prod.tagline}</p>

                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted">
                          <span className="inline-flex items-center gap-1">
                            <Package className="h-3.5 w-3.5 text-brand" />
                            {prod.deliverableType}
                          </span>
                          {prod.fileSize && (
                            <span className="inline-flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5 text-muted" />
                              {prod.fileSize}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-line pt-3 sm:pt-0 sm:pl-6 shrink-0 gap-3">
                      <div className="text-left sm:right">
                        <div className="font-display text-xl font-bold text-ink">{naira(prod.price)}</div>
                        {prod.originalPrice && (
                          <div className="text-xs text-muted line-through">{naira(prod.originalPrice)}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openQuickView(prod)}
                          className="rounded-xl border border-line bg-cream hover:bg-white px-3 py-2 text-xs font-bold text-ink transition cursor-pointer"
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => setCheckoutProduct(prod)}
                          className="rounded-xl bg-brand hover:bg-brand-dark px-4 py-2 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <span>Get Access</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Institutional Trust Guarantees Bar */}
          <div className="mt-12 rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="font-display font-bold text-ink text-sm">Instant Delivery</h5>
                  <p className="mt-1 text-xs text-muted">Direct digital download link and license keys delivered straight to your email.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="font-display font-bold text-ink text-sm">Verified Clean Code</h5>
                  <p className="mt-1 text-xs text-muted">Zero malicious DLLs or hidden telemetry. Audited by GAMAT institutional quant traders.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="font-display font-bold text-ink text-sm">Prop-Firm Friendly</h5>
                  <p className="mt-1 text-xs text-muted">Engineered with hard stop-loss risk parameters to safeguard drawdown rules.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="font-display font-bold text-ink text-sm">Desk Mentorship Support</h5>
                  <p className="mt-1 text-xs text-muted">Private Telegram & WhatsApp technical assistance for setup and installation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= QUICK VIEW PRODUCT MODAL ================= */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveProduct(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-muted hover:bg-cream hover:text-ink transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Image Preview & Gallery */}
              <div>
                <div className="aspect-[16/11] overflow-hidden rounded-2xl bg-ink">
                  <img
                    src={activeGalleryImg || activeProduct.image}
                    alt={activeProduct.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                {activeProduct.gallery && activeProduct.gallery.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {activeProduct.gallery.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveGalleryImg(img)}
                        className={`h-14 w-14 shrink-0 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                          activeGalleryImg === img ? "border-brand" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Compatibility Badges */}
                {activeProduct.compatibility && (
                  <div className="mt-4 rounded-xl border border-line bg-cream p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Supported Platforms</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {activeProduct.compatibility.map((c) => (
                        <span key={c} className="rounded-md bg-white border border-line px-2 py-0.5 text-xs font-semibold text-ink">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-brand-light px-2.5 py-0.5 text-[11px] font-bold text-brand uppercase">
                      {activeProduct.category}
                    </span>
                    {activeProduct.badge && (
                      <span className="rounded-md bg-amber-400/20 text-amber-800 px-2 py-0.5 text-[11px] font-bold">
                        ★ {activeProduct.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 font-display text-xl sm:text-2xl font-bold text-ink leading-snug">
                    {activeProduct.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted font-medium">{activeProduct.author}</p>

                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-ink">{activeProduct.rating.toFixed(1)}</span>
                    <span className="text-xs text-muted">({activeProduct.reviewCount} customer reviews)</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-line">
                    <p className="text-xs sm:text-sm text-ink leading-relaxed">
                      {activeProduct.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">What is included:</p>
                    <ul className="space-y-1.5">
                      {activeProduct.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-ink">
                          <CheckCircle2 className="h-3.5 w-3.5 text-brand shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Checkout Row */}
                <div className="mt-6 pt-4 border-t border-line">
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <span className="text-xs text-muted block">One-time payment</span>
                      <span className="font-display text-2xl font-bold text-ink">
                        {naira(activeProduct.price)}
                      </span>
                      {activeProduct.originalPrice && (
                        <span className="ml-2 text-xs text-muted line-through">
                          {naira(activeProduct.originalPrice)}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted">Lifetime updates included</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const p = activeProduct;
                      setActiveProduct(null);
                      setCheckoutProduct(p);
                    }}
                    className="w-full rounded-xl bg-brand hover:bg-brand-dark py-3 px-6 text-sm font-bold text-white transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Proceed to Instant Access</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= CHECKOUT MODAL ================= */}
      {checkoutProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setCheckoutProduct(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-muted hover:bg-cream hover:text-ink transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand">
                Instant Digital Checkout
              </span>
              <h3 className="mt-2 font-display text-xl font-bold text-ink">Complete Your Order</h3>
              <p className="mt-1 text-xs text-muted">
                Receive instant download link and license activation keys right after payment.
              </p>
            </div>

            {/* Selected Product Summary */}
            <div className="mt-5 rounded-2xl border border-line bg-cream p-4 flex items-center gap-3.5">
              <img
                src={checkoutProduct.image}
                alt={checkoutProduct.title}
                className="h-14 w-14 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-ink truncate">{checkoutProduct.title}</p>
                <p className="text-[11px] text-muted truncate">{checkoutProduct.deliverableType}</p>
                <p className="text-xs font-bold text-brand mt-0.5">{naira(checkoutProduct.price)}</p>
              </div>
            </div>

            <form onSubmit={handlePurchase} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Samuel Adekunle"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs text-ink focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Email Address (For File Delivery) *</label>
                <input
                  type="email"
                  required
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs text-ink focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">WhatsApp / Phone Number</label>
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs text-ink focus:border-brand focus:outline-none"
                />
              </div>

              {/* Coupon Code Input */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Have a discount coupon?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 rounded-xl border border-line bg-white px-3.5 py-2 text-xs uppercase text-ink focus:border-brand focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="rounded-xl border border-line bg-cream hover:bg-slate-100 px-4 py-2 text-xs font-bold text-ink transition cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponMsg && <p className="mt-1 text-[11px] font-bold text-brand">{couponMsg}</p>}
                {couponError && <p className="mt-1 text-[11px] font-bold text-rose-600">{couponError}</p>}
              </div>

              {/* Minimalist Bachs Payment Notice */}
              <div className="rounded-2xl border border-line bg-white px-4 py-3 text-xs shadow-2xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 items-center justify-center rounded-lg bg-cream/80 px-2 shrink-0 border border-line/60">
                      <img
                        src="/images/bachs-logo.png"
                        alt="Bachs"
                        className="h-3 w-auto object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-ink truncate">Bachs Secure Payment</p>
                      <p className="text-[10px] text-muted truncate">Cards, Bank Transfer & Crypto</p>
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                    <ShieldCheck className="h-3 w-3" /> Secure
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="rounded-xl bg-cream p-3 text-xs space-y-1.5">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span>{naira(checkoutProduct.price)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-brand font-bold">
                    <span>Coupon Discount ({couponDiscount}%)</span>
                    <span>-{naira(Math.round((checkoutProduct.price * couponDiscount) / 100))}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-ink pt-2 border-t border-line">
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
                <p className="mt-2 text-center text-[11px] text-muted">
                  🔒 256-bit encrypted checkout via Card, Bank Transfer, or Crypto
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= PURCHASE CONFIRMATION & DOWNLOAD MODAL ================= */}
      {purchasedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h3 className="font-display text-xl font-bold text-ink">Payment Confirmed!</h3>
            <p className="mt-1 text-xs text-muted">
              Transaction Reference: <span className="font-mono font-bold text-ink">{purchasedTxRef}</span>
            </p>

            {/* Direct Download Card */}
            <div className="mt-6 rounded-2xl border border-line bg-cream p-4 text-left">
              <div className="flex items-center gap-3">
                <img src={purchasedProduct.image} alt="" className="h-12 w-12 rounded-xl object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-ink truncate">{purchasedProduct.title}</p>
                  <p className="text-[11px] text-muted truncate">{purchasedProduct.deliverableType}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-line flex flex-col sm:flex-row gap-2">
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
                  className="rounded-xl border border-line bg-white py-2.5 px-4 text-xs font-bold text-ink hover:bg-slate-50 text-center cursor-pointer"
                >
                  View in Dashboard
                </button>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-muted">
              A copy of your license key and download instructions have also been sent to your email.
            </p>

            <button
              type="button"
              onClick={() => setPurchasedProduct(null)}
              className="mt-6 text-xs font-bold text-muted hover:text-ink cursor-pointer"
            >
              Continue Browsing Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
