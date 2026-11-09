import { useState, useEffect } from "react";
import { Tag, X, Check, ArrowRight, Gift } from "lucide-react";
import { navigate } from "../lib/router";
import { useStore } from "../lib/store";

export default function TopCouponBar() {
  const { coupons } = useStore();
  const [dismissed, setDismissed] = useState(true);
  const [copied, setCopied] = useState(false);

  // Active coupon code to display
  const activeCoupon = (coupons || []).find((c) => c.status === "active") || {
    code: "WELCOME10",
    discountPercent: 10,
  };

  useEffect(() => {
    const isDismissed = sessionStorage.getItem("gamat_dismiss_coupon_bar") === "true";
    setDismissed(isDismissed);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("gamat_dismiss_coupon_bar", "true");
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(activeCoupon.code);
    } catch {
      /* ignore fallback */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (dismissed) return null;

  return (
    <div className="relative z-50 overflow-hidden bg-gradient-to-r from-[#4d0711] via-[#851828] to-[#3b040c] text-white shadow-xl border-b border-amber-500/30 transition-all duration-300 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent">
      <div className="container-x flex items-center justify-between gap-2 py-2 text-xs">
        {/* Left Badge + Message */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-3">
          <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 border border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.2)] shrink-0">
            <Gift className="h-3.5 w-3.5 text-amber-400 animate-bounce" /> Special Visitor Offer
          </span>

          <Gift className="h-3.5 w-3.5 shrink-0 text-amber-400 animate-bounce md:hidden" />

          <p className="truncate text-white/90 font-medium text-[11px] sm:text-xs md:text-sm">
            <span className="hidden xs:inline">Claim </span>
            <strong className="text-amber-300 font-extrabold">{activeCoupon.discountPercent}% OFF</strong>
            <span className="hidden lg:inline"> all Mentorships &amp; Courses!</span>
            <span className="hidden sm:inline"> Use Code:</span>
          </p>

          {/* Classical Dashed Ticket Coupon Box */}
          <button
            type="button"
            onClick={handleCopy}
            title="Click to copy coupon code"
            className="group relative inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-black/40 hover:bg-black/70 px-2 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-mono font-bold tracking-wider sm:tracking-widest text-amber-300 border border-dashed border-amber-400/60 hover:border-amber-300 transition-all duration-200 active:scale-95 shadow-inner"
          >
            <Tag className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="uppercase text-amber-200">{activeCoupon.code}</span>
            {copied ? (
              <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] text-emerald-400 font-extrabold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40 animate-pulse">
                <Check className="h-2.5 w-2.5 text-emerald-400" /> Copied
              </span>
            ) : (
              <span className="hidden sm:inline text-[10px] text-amber-400/70 font-normal group-hover:text-amber-300 transition-colors ml-0.5 uppercase">
                Copy
              </span>
            )}
          </button>
        </div>

        {/* Right CTA + Dismiss Button */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <button
            onClick={() => navigate("/courses")}
            className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 py-1 sm:px-3.5 text-[10px] sm:text-xs font-black uppercase tracking-wide text-slate-950 shadow-md hover:from-amber-300 hover:to-amber-400 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Claim</span>
            <span className="hidden sm:inline"> Offer</span>
            <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>

          <button
            onClick={handleDismiss}
            aria-label="Dismiss offer banner"
            className="rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
