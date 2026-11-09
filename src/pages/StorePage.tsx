import { useState, useMemo } from "react";
import { useStore } from "../lib/store";
import { type StoreProduct, type StoreProductCategory } from "../lib/storeProducts";
import { naira } from "../lib/courses";
import { navigate } from "../lib/router";
import {
  ShoppingBag, Bot, LineChart, BookOpen, Target, CheckCircle2,
  Download, Star, ShieldCheck, ArrowRight, Search, Sparkles, Filter,
  FileText, ExternalLink, Zap, HelpCircle, Package, Lock, X, Tag,
  ChevronRight, ArrowUpDown, LayoutGrid, List, Check, AlertCircle,
  Clock, Share2, ThumbsUp, CreditCard, Building2, Smartphone, Loader2
} from "lucide-react";
import { payWithPaystack, generateTxRef } from "../lib/paystack";

type SortOption = "featured" | "price-asc" | "price-desc" | "rating" | "sales";

export default function StorePage() {
  const { publishedStoreProducts, recordPayment, coupons, validateCoupon, user, isAuthed, myStorePurchases } = useStore();
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

  // Categories
  const categories = [
    { id: "all", label: "All Items", icon: Sparkles },
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
        // featured default keeps curated sequence
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

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-[var(--header-h,72px)] text-ink">
      {/* Selar / Amazon Style Store Hero Banner */}
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

            {/* Amazon / Selar Trust Badges Bar */}
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

      {/* Main Marketplace Container */}
      <section className="container-x py-8 sm:py-12">
        {/* Amazon-Style Search, Filter & Utility Toolbar */}
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
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
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === "grid" ? "bg-white text-brand shadow-sm font-bold" : "text-slate-400 hover:text-slate-700"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === "list" ? "bg-white text-brand shadow-sm font-bold" : "text-slate-400 hover:text-slate-700"
                  }`}
                  title="Detailed List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Selar-Style Category Chips */}
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

        {/* Results Counter */}
        <div className="mb-6 flex items-center justify-between text-xs text-slate-500 font-medium">
          <p>
            Showing <strong className="text-slate-900">{filtered.length}</strong> product{filtered.length === 1 ? "" : "s"} in {categories.find((c) => c.id === selectedCat)?.label}
          </p>
          <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" /> 100% Instant Delivery Available
          </span>
        </div>

        {/* Product Catalog Grid (Amazon / Selar Cards) */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center max-w-md mx-auto">
            <Package className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 font-display text-lg font-bold text-slate-900">No matching products found</h3>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your search keywords or switch category filter to "All Items".
            </p>
            <button
              type="button"
              onClick={() => { setSelectedCat("all"); setQ(""); }}
              className="mt-6 rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-dark transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* Amazon / Selar Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filtered.map((prod) => {
              const savings = prod.originalPrice ? prod.originalPrice - prod.price : 0;
              const discountPct = prod.originalPrice ? Math.round((savings / prod.originalPrice) * 100) : null;

              return (
                <div
                  key={prod.id}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300"
                >
                  {/* Top Image & Badge Section */}
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-900 cursor-pointer" onClick={() => openQuickView(prod)}>
                      <img
                        src={prod.image}
                        alt={prod.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                      {/* Overlaid Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        {prod.badge && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase text-slate-950 shadow-md">
                            ★ {prod.badge}
                          </span>
                        )}
                        {discountPct && (
                          <span className="inline-flex items-center rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white shadow-md">
                            Save {discountPct}%
                          </span>
                        )}
                      </div>

                      {/* Deliverable Pill at bottom of image */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white">
                        <span className="inline-flex items-center gap-1 font-semibold truncate bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20">
                          <Package className="h-3 w-3 text-sky-400 shrink-0" />
                          <span className="truncate">{prod.deliverableType}</span>
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5">
                      {/* Author / Creator Line */}
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
                        {prod.author}
                      </p>

                      {/* Title */}
                      <h3
                        onClick={() => openQuickView(prod)}
                        className="mt-1 font-display text-base font-extrabold text-slate-900 group-hover:text-brand transition leading-snug cursor-pointer line-clamp-2"
                      >
                        {prod.title}
                      </h3>

                      {/* Amazon-Style Star Rating */}
                      <div className="mt-2 flex items-center gap-1.5 text-xs">
                        <div className="flex items-center text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="font-extrabold text-slate-800">{prod.rating.toFixed(1)}</span>
                        <span className="text-slate-400 font-medium">({prod.reviewCount} reviews)</span>
                      </div>

                      {/* Tagline */}
                      <p className="mt-2.5 text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {prod.tagline}
                      </p>

                      {/* Compatibility Chips */}
                      {prod.compatibility && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {prod.compatibility.slice(0, 3).map((c) => (
                            <span key={c} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Pricing & Selar CTAs */}
                  <div className="p-5 pt-0">
                    <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
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
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <Zap className="h-3 w-3" /> Instant Access
                      </span>
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => openQuickView(prod)}
                        className="rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition text-center cursor-pointer"
                      >
                        Quick View
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCheckoutProduct(prod);
                          setCouponCode("");
                          setCouponDiscount(0);
                          setCouponError(null);
                          setCouponMsg(null);
                        }}
                        className="rounded-xl bg-brand py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-dark transition text-center cursor-pointer flex items-center justify-center gap-1"
                      >
                        Buy Now <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Amazon-Style Detailed List View */
          <div className="space-y-4">
            {filtered.map((prod) => {
              const savings = prod.originalPrice ? prod.originalPrice - prod.price : 0;
              const discountPct = prod.originalPrice ? Math.round((savings / prod.originalPrice) * 100) : null;

              return (
                <div
                  key={prod.id}
                  className="flex flex-col sm:flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition gap-6"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0 flex-1">
                    <img
                      src={prod.image}
                      alt={prod.title}
                      className="h-28 w-full sm:w-40 rounded-xl object-cover shrink-0 cursor-pointer shadow-sm"
                      onClick={() => openQuickView(prod)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {prod.badge && (
                          <span className="rounded bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase text-slate-950">
                            ★ {prod.badge}
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{prod.author}</span>
                      </div>
                      <h3
                        onClick={() => openQuickView(prod)}
                        className="font-display text-base font-extrabold text-slate-900 hover:text-brand transition cursor-pointer mt-1"
                      >
                        {prod.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-1">{prod.tagline}</p>
                      
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-400" />
                          ))}
                        </div>
                        <span className="font-bold text-slate-800">{prod.rating.toFixed(1)}</span>
                        <span className="text-slate-400">({prod.reviewCount} verified ratings)</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-48 text-right shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-6">
                    <p className="font-display text-2xl font-black text-slate-950">{naira(prod.price)}</p>
                    {prod.originalPrice && (
                      <p className="text-xs text-slate-400 line-through">{naira(prod.originalPrice)}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutProduct(prod);
                        setCouponCode("");
                        setCouponDiscount(0);
                      }}
                      className="mt-3 w-full rounded-xl bg-brand py-2 text-xs font-bold text-white hover:bg-brand-dark transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      Buy on Selar <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ======================= Selar / Amazon Product Detail Sheet Modal ======================= */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-5 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-brand" />
                Product Details & Specification Sheet
              </span>
              <button
                type="button"
                onClick={() => setActiveProduct(null)}
                className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto p-6 sm:p-8 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left 5 Cols: Gallery */}
                <div className="md:col-span-5 space-y-3">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm">
                    <img
                      src={activeGalleryImg || activeProduct.image}
                      alt={activeProduct.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Thumbnail Row */}
                  {activeProduct.gallery && activeProduct.gallery.length > 1 && (
                    <div className="flex items-center gap-2">
                      {activeProduct.gallery.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveGalleryImg(img)}
                          className={`h-16 w-16 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                            (activeGalleryImg || activeProduct.image) === img
                              ? "border-brand shadow-md"
                              : "border-slate-200 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Merchant & Trust Card */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2.5">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>Verified GAMAT Merchant Guarantee</span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      All indicators, EAs, and manuals are pre-tested by our senior trading desk. Includes setup support and free future version updates.
                    </p>
                    <div className="text-[11px] font-mono text-slate-600">
                      Format: {activeProduct.deliverableType}
                    </div>
                  </div>
                </div>

                {/* Right 7 Cols: Information & Buy Box */}
                <div className="md:col-span-7 space-y-5">
                  <div>
                    <div className="flex items-center gap-2">
                      {activeProduct.badge && (
                        <span className="rounded bg-amber-400 px-2.5 py-0.5 text-xs font-black uppercase text-slate-950">
                          ★ {activeProduct.badge}
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-500 uppercase">{activeProduct.author}</span>
                    </div>
                    
                    <h2 className="mt-2 font-display text-2xl font-black text-slate-950 leading-tight">
                      {activeProduct.title}
                    </h2>
                    
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {activeProduct.tagline}
                    </p>

                    {/* Amazon-Style Rating row */}
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400" />
                        ))}
                      </div>
                      <span className="font-extrabold text-slate-900">{activeProduct.rating.toFixed(1)} / 5.0</span>
                      <span className="text-slate-400">({activeProduct.reviewCount} customer reviews)</span>
                    </div>
                  </div>

                  {/* Amazon Buy Box */}
                  <div className="rounded-2xl border-2 border-brand/20 bg-brand/5 p-5">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="font-display text-3xl font-black text-slate-950">
                          {naira(activeProduct.price)}
                        </span>
                        {activeProduct.originalPrice && (
                          <span className="ml-3 text-sm text-slate-400 line-through">
                            {naira(activeProduct.originalPrice)}
                          </span>
                        )}
                      </div>
                      {activeProduct.originalPrice && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                          Save {Math.round(((activeProduct.originalPrice - activeProduct.price) / activeProduct.originalPrice) * 100)}%
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> In Stock • Instant download access unlocked after payment
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutProduct(activeProduct);
                        setActiveProduct(null);
                        setCouponCode("");
                        setCouponDiscount(0);
                      }}
                      className="mt-4 w-full rounded-xl bg-brand py-3 text-sm font-extrabold text-white shadow-md hover:bg-brand-dark transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="h-4 w-4" /> Buy Now • {naira(activeProduct.price)}
                    </button>
                  </div>

                  {/* What's Included */}
                  <div>
                    <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5">
                      What's Included in This Package
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {activeProduct.features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 font-black" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Technical Specifications */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
                    <h5 className="font-bold text-slate-900">Technical Details</h5>
                    <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
                      <div>
                        <span className="text-slate-400">Download Size:</span> {activeProduct.fileSize || "Digital Archive"}
                      </div>
                      <div>
                        <span className="text-slate-400">License:</span> Commercial Single-User
                      </div>
                      <div>
                        <span className="text-slate-400">Updates:</span> Lifetime Free Revisions
                      </div>
                      <div>
                        <span className="text-slate-400">Support:</span> Telegram VIP Desk
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= Selar-Style 1-Page Checkout Drawer ======================= */}
      {checkoutProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
          <div className="relative h-full w-full max-w-lg bg-white shadow-2xl flex flex-col justify-between overflow-y-auto">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50/90">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-brand" />
                <h3 className="font-display text-base font-extrabold text-slate-900">
                  Selar Express Checkout
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutProduct(null)}
                className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Checkout Form Content */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* Product Thumbnail & Pricing Summary */}
              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                <img
                  src={checkoutProduct.image}
                  alt={checkoutProduct.title}
                  className="h-16 w-16 rounded-xl object-cover shrink-0 shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-display text-xs font-extrabold text-slate-900 truncate">
                    {checkoutProduct.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">{checkoutProduct.deliverableType}</p>
                  <p className="font-display text-sm font-black text-brand mt-0.5">
                    {naira(checkoutProduct.price)}
                  </p>
                </div>
              </div>

              {/* Customer Information */}
              <form id="checkout-form" onSubmit={handlePurchase} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Email Address (for download delivery)</label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="e.g. trader@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">WhatsApp / Phone Number</label>
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="e.g. +234 812 345 6789"
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 focus:border-brand focus:outline-none"
                  />
                </div>

                {/* Coupon Code Input */}
                <div className="pt-2">
                  <label className="block font-bold text-slate-800 mb-1">Coupon / Ambassador Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. GAMATVIP or REF CODE"
                      className="flex-1 rounded-xl border border-slate-200 bg-white p-3 text-xs font-mono font-bold text-slate-900 focus:border-brand focus:outline-none uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponMsg && (
                    <p className="mt-1.5 text-xs text-emerald-600 font-semibold">{couponMsg}</p>
                  )}
                  {couponError && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">{couponError}</p>
                  )}
                </div>

                {/* Payment Method Selector */}
                <div className="pt-2">
                  <label className="block font-bold text-slate-800 mb-1.5">Select Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("transfer")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        paymentMethod === "transfer"
                          ? "border-brand bg-brand/5 text-brand"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Building2 className="h-4 w-4 mb-1" />
                      <p className="font-bold text-xs">Bank Transfer</p>
                      <p className="text-[10px] text-slate-500">Pay from any bank</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        paymentMethod === "card"
                          ? "border-brand bg-brand/5 text-brand"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <CreditCard className="h-4 w-4 mb-1" />
                      <p className="font-bold text-xs">Debit Card</p>
                      <p className="text-[10px] text-slate-500">Mastercard, Visa, Verve</p>
                    </button>
                  </div>
                </div>

                {/* Totals Breakdown */}
                <div className="rounded-2xl bg-slate-50 p-4 space-y-2 border border-slate-200">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Subtotal</span>
                    <span>{naira(checkoutProduct.price)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600 font-bold">
                      <span>Discount ({couponDiscount}%)</span>
                      <span>-{naira(Math.round((checkoutProduct.price * couponDiscount) / 100))}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-display text-base font-extrabold text-slate-900">
                    <span>Total Due</span>
                    <span>
                      {naira(
                        couponDiscount > 0
                          ? Math.max(0, checkoutProduct.price - Math.round((checkoutProduct.price * couponDiscount) / 100))
                          : checkoutProduct.price
                      )}
                    </span>
                  </div>
                </div>
              </form>
            </div>

            {/* Bottom Sticky Action */}
            <div className="p-5 border-t border-slate-100 bg-white">
              <button
                type="submit"
                form="checkout-form"
                disabled={isProcessing}
                className="w-full rounded-xl bg-brand py-3.5 text-sm font-black text-white shadow-md hover:bg-brand-dark transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Complete Purchase & Download ({naira(
                      couponDiscount > 0
                        ? Math.max(0, checkoutProduct.price - Math.round((checkoutProduct.price * couponDiscount) / 100))
                        : checkoutProduct.price
                    )})
                  </>
                )}
              </button>
              <p className="mt-2 text-center text-[11px] text-slate-400">
                🔒 256-Bit SSL Encrypted Payment. Instant email delivery.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================= Post-Purchase Success & Download Hub ======================= */}
      {purchasedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
              <Check className="h-7 w-7" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Payment Confirmed</span>
            <h3 className="mt-1 font-display text-2xl font-black text-slate-900">
              Thank You For Your Order!
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Your purchase of <strong className="text-slate-900">{purchasedProduct.title}</strong> was successful. Order reference: <code className="font-mono font-bold text-brand">{purchasedTxRef}</code>.
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
