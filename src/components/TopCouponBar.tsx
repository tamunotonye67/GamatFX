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
      <div className="container-x flex flex-wrap items-center justify-between gap-3 py-2.5 px-4 text-xs">
        {/* Left Badge + Message */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 border border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.2)]">
            <Gift className="h-3.5 w-3.5 text-amber-400 animate-bounce" /> Special Visitor Offer
          </span>

          <p className="text-white/90 font-medium text-xs sm:text-sm">
            Claim <strong className="text-amber-300 font-extrabold">{activeCoupon.discountPercent}% OFF</strong> all Mentorships & Courses! Use Code:
          </p>

          {/* Classical Dashed Ticket Coupon Box */}
          <button
            type="button"
            onClick={handleCopy}
            title="Click to copy coupon code"
            className="group relative inline-flex items-center gap-2 rounded-lg bg-black/40 hover:bg-black/70 px-3 py-1 text-xs font-mono font-bold tracking-widest text-amber-300 border border-dashed border-amber-400/60 hover:border-amber-300 transition-all duration-200 active:scale-95 shadow-inner"
          >
            <Tag className="h-3.5 w-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="uppercase text-amber-200">{activeCoupon.code}</span>
            {copied ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-extrabold bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/40 animate-pulse ml-1">
                <Check className="h-3 w-3 text-emerald-400" /> Copied!
              </span>
            ) : (
              <span className="text-[10px] text-amber-400/70 font-normal group-hover:text-amber-300 transition-colors ml-1 uppercase">
                Copy
              </span>
            )}
          </button>
        </div>

        {/* Right CTA + Dismiss Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/courses")}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3.5 py-1 text-xs font-black uppercase tracking-wide text-slate-950 shadow-md hover:from-amber-300 hover:to-amber-400 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            Claim Offer <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleDismiss}
            aria-label="Dismiss offer banner"
            className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
