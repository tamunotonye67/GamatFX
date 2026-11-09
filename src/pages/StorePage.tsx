import { useState, useMemo } from "react";
import { useStore } from "../lib/store";
import { type StoreProduct, type StoreProductCategory } from "../lib/storeProducts";
import { naira } from "../lib/courses";
import { navigate } from "../lib/router";
import Logo from "../components/Logo";
import {
  ShoppingBag, Bot, LineChart, BookOpen, Target, CheckCircle2,
  Download, Star, ShieldCheck, ArrowRight, Search, Sparkles, Filter,
  FileText, ExternalLink, Zap, HelpCircle, Package, Lock, X, Tag
} from "lucide-react";

export default function StorePage() {
  const { publishedStoreProducts, recordPayment, coupons, validateCoupon, user, isAuthed } = useStore();
  const [q, setQ] = useState("");
  const [selectedCat, setSelectedCat] = useState<StoreProductCategory>("all");
  const [activeProduct, setActiveProduct] = useState<StoreProduct | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<StoreProduct | null>(null);
  
  // Checkout form state
  const [buyerName, setBuyerName] = useState(user ? `${user.firstName} ${user.lastName}` : "");
  const [buyerEmail, setBuyerEmail] = useState(user?.email ?? "");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">("transfer");
  const [purchasedProduct, setPurchasedProduct] = useState<StoreProduct | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const categories = [
    { id: "all", label: "All Products", icon: Sparkles },
    { id: "bot", label: "AI Bots & EAs", icon: Bot },
    { id: "indicator", label: "Indicators & Scripts", icon: LineChart },
    { id: "ebook", label: "E-Books & Guides", icon: BookOpen },
    { id: "strategy", label: "Strategy Blueprints", icon: Target },
    { id: "tool", label: "Physical Journals & Tools", icon: Package },
  ];

  const filtered = useMemo(() => {
    return publishedStoreProducts.filter((p) => {
      const matchCat = selectedCat === "all" || p.category === selectedCat;
      const matchSearch =
        p.title.toLowerCase().includes(q.toLowerCase()) ||
        p.tagline.toLowerCase().includes(q.toLowerCase()) ||
        p.deliverableType.toLowerCase().includes(q.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [publishedStoreProducts, selectedCat, q]);

  const handleApplyCoupon = () => {
    setCouponError(null);
    if (!couponCode.trim()) return;
    const res = validateCoupon(couponCode, "all");
    if (res.ok && res.discountPercent) {
      setCouponDiscount(res.discountPercent);
    } else {
      setCouponDiscount(0);
      setCouponError(res.error || "Invalid or expired coupon code.");
    }
  };

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutProduct) return;
    if (!buyerName.trim() || !buyerEmail.trim()) {
      alert("Please provide your full name and email address.");
      return;
    }

    setIsProcessing(true);
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

      setPurchasedProduct(checkoutProduct);
      setCheckoutProduct(null);
      setIsProcessing(false);
    }, 700);
  };

  const categoryIcon = (cat: StoreProduct["category"]) => {
    switch (cat) {
      case "bot": return Bot;
      case "indicator": return LineChart;
      case "ebook": return BookOpen;
      case "strategy": return Target;
      default: return Package;
    }
  };

  return (
    <div className="min-h-screen bg-cream pt-[var(--header-h,72px)]">
      {/* Hero Header */}
      <section className="bg-ink text-white py-14 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#dc3545_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="container-x relative z-10 max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand/20 border border-brand/30 px-3.5 py-1 text-xs font-bold text-brand uppercase tracking-wider">
            <ShoppingBag className="h-3.5 w-3.5" /> GAMAT Official Store & Tools
          </span>
          <h1 className="mt-4 font-display text-3xl sm:text-5xl font-extrabold tracking-tight">
            Institutional Indicators, AI Bots & Trading Books
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/75 leading-relaxed max-w-2xl mx-auto">
            Supercharge your execution with battle-tested MetaTrader expert advisors, proprietary TradingView radar indicators, institutional order-flow playbooks, and prop-firm risk models.
          </p>

          {/* Search bar */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search bots, indicators, books, or strategy playbooks…"
              className="w-full rounded-2xl border border-white/20 bg-white/10 py-3.5 pl-12 pr-4 text-sm text-white placeholder-white/45 backdrop-blur-md outline-none focus:border-brand focus:bg-white/15 transition shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Filter Tabs & Catalog */}
      <section className="container-x py-10 sm:py-14">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pb-8 border-b border-line">
          {categories.map((c) => {
            const Icon = c.icon;
            const active = selectedCat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.id as StoreProductCategory)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition ${
                  active
                    ? "bg-brand text-white shadow-md shadow-brand/20"
                    : "bg-white text-ink/80 border border-line hover:border-brand/50 hover:bg-cream"
                }`}
              >
                <Icon className="h-4 w-4" /> {c.label}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        <div className="mt-10">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filtered.map((prod) => {
                const CatIcon = categoryIcon(prod.category);
                const discountPct = prod.originalPrice
                  ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)
                  : null;

                return (
                  <div
                    key={prod.id}
                    className="flex flex-col justify-between rounded-3xl border border-line bg-white p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-brand/40 transition-all duration-300 group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-cream px-2.5 py-1 text-xs font-bold text-ink/80">
                          <CatIcon className="h-3.5 w-3.5 text-brand" /> {prod.category.toUpperCase()}
                        </span>
                        {prod.badge && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-extrabold text-brand">
                            <Sparkles className="h-3 w-3" /> {prod.badge}
                          </span>
                        )}
                      </div>

                      {/* Title & Tagline */}
                      <h3 className="mt-4 font-display text-xl font-extrabold text-ink group-hover:text-brand transition leading-snug">
                        {prod.title}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed line-clamp-2">
                        {prod.tagline}
                      </p>

                      {/* Deliverable Badge */}
                      <div className="mt-4 rounded-xl bg-cream/70 border border-line/60 p-2.5 text-xs text-ink/80 font-medium flex items-center gap-2">
                        <Package className="h-4 w-4 text-brand shrink-0" />
                        <span className="truncate">{prod.deliverableType}</span>
                      </div>

                      {/* Feature Bullets */}
                      <ul className="mt-4 space-y-1.5 text-xs text-ink/80">
                        {prod.features.slice(0, 3).map((f, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span className="line-clamp-1">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Bottom Pricing & CTA */}
                    <div className="mt-7 pt-4 border-t border-line">
                      <div className="flex items-baseline justify-between gap-2">
                        <div>
                          <p className="font-display text-2xl font-black text-ink">{naira(prod.price)}</p>
                          {prod.originalPrice && (
                            <p className="text-xs text-muted line-through">{naira(prod.originalPrice)}</p>
                          )}
                        </div>
                        {discountPct && (
                          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                            Save {discountPct}%
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveProduct(prod)}
                          className="btn-outline-dark !py-2.5 text-xs font-bold justify-center"
                        >
                          Overview
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCheckoutProduct(prod);
                            setCouponCode("");
                            setCouponDiscount(0);
                            setCouponError(null);
                          }}
                          className="btn-primary !py-2.5 text-xs font-bold justify-center"
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
            <div className="rounded-3xl border border-line bg-white p-12 text-center max-w-md mx-auto">
              <Package className="mx-auto h-12 w-12 text-muted" />
              <h3 className="mt-4 font-display text-lg font-bold text-ink">No products found</h3>
              <p className="mt-1 text-sm text-muted">Try searching with a different term or select another category filter.</p>
              <button
                type="button"
                onClick={() => { setQ(""); setSelectedCat("all"); }}
                className="btn-outline-dark mt-5 !py-2 text-xs font-bold"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="bg-white border-y border-line py-12">
        <div className="container-x max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-base font-bold text-ink">Instant Access Delivery</p>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  Download files, robots, and guides immediately after payment confirmation.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-base font-bold text-ink">Verified & Safe</p>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  Engineered with strict risk controls, no dangerous martingales, and prop-firm safety.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-base font-bold text-ink">Direct Desk Support</p>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  Access 1-on-1 VPS and setup assistance from GAMAT trading engineers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setActiveProduct(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-cream text-muted hover:text-ink hover:bg-line transition"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="inline-flex items-center gap-1.5 rounded-lg bg-cream px-2.5 py-1 text-xs font-bold text-ink/80">
              {activeProduct.category.toUpperCase()} · {activeProduct.badge || "Verified Product"}
            </span>

            <h2 className="mt-3 font-display text-2xl sm:text-3xl font-black text-ink pr-8">
              {activeProduct.title}
            </h2>
            <p className="mt-1.5 text-sm text-brand font-semibold">{activeProduct.tagline}</p>

            <div className="mt-4 flex items-center gap-4 text-xs text-muted border-b border-line pb-4">
              <span className="flex items-center gap-1 font-bold text-ink">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {activeProduct.rating} ({activeProduct.reviewCount} Reviews)
              </span>
              <span>·</span>
              <span>{activeProduct.salesCount} Verified Downloads</span>
              <span>·</span>
              <span>{activeProduct.deliverableType}</span>
            </div>

            <div className="mt-6 space-y-4 text-sm text-ink/80 leading-relaxed">
              <p>{activeProduct.description}</p>

              <div>
                <p className="font-bold text-ink text-sm uppercase tracking-wide">Included in this package:</p>
                <ul className="mt-2.5 space-y-2">
                  {activeProduct.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-cream p-4 border border-line text-xs">
                <p className="font-bold text-ink">Delivery & Setup Notes:</p>
                <p className="mt-1 text-muted leading-relaxed">{activeProduct.accessInstructions}</p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4 pt-4 border-t border-line">
              <div>
                <p className="text-xs text-muted">Total Price</p>
                <p className="font-display text-2xl font-black text-ink">{naira(activeProduct.price)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveProduct(null)}
                  className="btn-outline-dark !py-2.5"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCheckoutProduct(activeProduct);
                    setActiveProduct(null);
                    setCouponCode("");
                    setCouponDiscount(0);
                  }}
                  className="btn-primary !py-2.5"
                >
                  Buy Now <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setCheckoutProduct(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-cream text-muted hover:text-ink hover:bg-line transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-display text-xl font-extrabold text-ink">Checkout & Instant Access</h3>
            <p className="mt-1 text-xs text-muted">Complete your purchase to receive instant download access.</p>

            {/* Item summary */}
            <div className="mt-4 rounded-2xl bg-cream p-4 border border-line flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-bold text-sm text-ink">{checkoutProduct.title}</p>
                <p className="text-xs text-muted truncate">{checkoutProduct.deliverableType}</p>
              </div>
              <p className="font-display text-lg font-extrabold text-brand shrink-0">
                {naira(checkoutProduct.price)}
              </p>
            </div>

            <form onSubmit={handlePurchase} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted">Full Name</label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Adebayo Ogunlesi"
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted">Email Address (Delivery)</label>
                <input
                  type="email"
                  required
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="mt-1 w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-brand"
                />
              </div>

              {/* Coupon Code Input */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted">Have a Coupon?</label>
                <div className="mt-1 flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="e.g. GAMAT20"
                      className="w-full rounded-xl border border-line bg-white pl-9 pr-3 py-2 text-sm text-ink uppercase outline-none focus:border-brand font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="btn-outline-dark !py-2 !px-4 text-xs font-bold"
                  >
                    Apply
                  </button>
                </div>
                {couponDiscount > 0 && (
                  <p className="mt-1 text-xs font-bold text-emerald-600">
                    Coupon applied! {couponDiscount}% discount applied.
                  </p>
                )}
                {couponError && (
                  <p className="mt-1 text-xs font-bold text-brand">{couponError}</p>
                )}
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-muted">Payment Method</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("transfer")}
                    className={`rounded-xl border p-3 text-left transition ${
                      paymentMethod === "transfer" ? "border-brand bg-brand-light" : "border-line bg-white"
                    }`}
                  >
                    <p className="text-xs font-bold text-ink">Bank Transfer</p>
                    <p className="text-[11px] text-muted">Direct Naira transfer</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`rounded-xl border p-3 text-left transition ${
                      paymentMethod === "card" ? "border-brand bg-brand-light" : "border-line bg-white"
                    }`}
                  >
                    <p className="text-xs font-bold text-ink">Debit Card</p>
                    <p className="text-[11px] text-muted">Paystack / Instant</p>
                  </button>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="pt-2 border-t border-line flex items-center justify-between text-sm">
                <span className="text-muted">Total Due:</span>
                <span className="font-display text-xl font-extrabold text-ink">
                  {naira(Math.max(0, checkoutProduct.price - (couponDiscount > 0 ? (checkoutProduct.price * couponDiscount) / 100 : 0)))}
                </span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="btn-primary w-full !py-3 text-sm font-bold justify-center"
              >
                {isProcessing ? "Authorizing Payment…" : `Confirm & Pay ${naira(Math.max(0, checkoutProduct.price - (couponDiscount > 0 ? (checkoutProduct.price * couponDiscount) / 100 : 0)))}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Confirmed & Instant Access Modal */}
      {purchasedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="mt-4 font-display text-2xl font-black text-ink">Order Confirmed!</h3>
            <p className="mt-1 text-sm text-muted">
              Thank you for purchasing <strong>{purchasedProduct.title}</strong>.
            </p>

            <div className="mt-5 rounded-2xl bg-cream p-4 border border-line text-left text-xs space-y-2">
              <p className="font-bold text-ink">Your Deliverable Access:</p>
              <p className="text-muted">{purchasedProduct.accessInstructions}</p>
              {purchasedProduct.downloadUrl && (
                <div className="pt-2">
                  <a
                    href={purchasedProduct.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full !py-2.5 text-xs font-bold justify-center"
                  >
                    <Download className="h-4 w-4" /> Download Files Now
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setPurchasedProduct(null)}
                className="btn-outline-dark !py-2.5 text-xs font-bold"
              >
                Done / Back to Store
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
