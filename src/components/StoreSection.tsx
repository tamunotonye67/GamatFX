import { useStore } from "../lib/store";
import { naira } from "../lib/courses";
import { navigate } from "../lib/router";
import {
  ShoppingBag,
  Star,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Package,
} from "lucide-react";

export default function StoreSection() {
  const { publishedStoreProducts } = useStore();
  const featured = publishedStoreProducts.slice(0, 3);

  return (
    <section className="bg-slate-50/70 py-16 sm:py-24 border-t border-slate-200">
      <div className="container-x">
        {/* Amazon/Selar Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 border border-brand/20 px-3.5 py-1 text-xs font-bold text-brand uppercase tracking-wider">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Official Digital Marketplace</span>
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
              Best Selling Trading Tools & Materials
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              Explore battle-tested MetaTrader expert advisors, Smart Money radar indicators, and institutional execution playbooks delivered instantly to your inbox.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/store")}
            className="rounded-xl bg-slate-900 px-6 py-3.5 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-2 shrink-0 self-start md:self-auto shadow-sm"
          >
            Visit Full Store & Catalog <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Featured Product Grid (Amazon / Selar Style) */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
          {featured.map((prod) => {
            const savings = prod.originalPrice ? prod.originalPrice - prod.price : 0;
            const discount = prod.originalPrice
              ? Math.round((savings / prod.originalPrice) * 100)
              : null;

            return (
              <div
                key={prod.id}
                onClick={() => navigate("/store")}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 cursor-pointer"
              >
                <div>
                  {/* Product Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
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

                    <div className="absolute bottom-3 left-3 text-[11px] text-white">
                      <span className="inline-flex items-center gap-1 font-semibold bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/20">
                        <Package className="h-3 w-3 text-sky-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{prod.deliverableType}</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
                      {prod.author}
                    </p>

                    <h3 className="mt-1 font-display text-base font-extrabold text-slate-900 group-hover:text-brand transition leading-snug line-clamp-2">
                      {prod.title}
                    </h3>

                    {/* Amazon Star Rating */}
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
                  </div>
                </div>

                {/* Footer Pricing & CTA */}
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

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-brand group-hover:translate-x-0.5 transition-transform">
                      View on Selar <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Trust Guarantee Strip */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 flex flex-wrap items-center justify-around gap-4 text-xs font-medium text-slate-600 shadow-sm">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>Instant Digital Download Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Verified Source Code & High-Res PDF</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-sky-600" />
            <span>24/7 Telegram Technical Desk Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
