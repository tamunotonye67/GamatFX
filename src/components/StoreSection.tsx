import { useStore } from "../lib/store";
import { naira } from "../lib/courses";
import { navigate } from "../lib/router";
import {
  ShoppingBag, Bot, LineChart, BookOpen, Target, Sparkles,
  ArrowRight, ArrowUpRight, CheckCircle2, ShieldCheck, Download,
} from "lucide-react";

export default function StoreSection() {
  const { publishedStoreProducts } = useStore();
  const featured = publishedStoreProducts.slice(0, 3);

  const categoryIcon = (cat: string) => {
    switch (cat) {
      case "bot": return Bot;
      case "indicator": return LineChart;
      case "ebook": return BookOpen;
      case "strategy": return Target;
      default: return ShoppingBag;
    }
  };

  return (
    <section className="bg-cream/60 py-20 sm:py-28 border-t border-line">
      <div className="container-x">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="eyebrow flex items-center gap-2">
              <ShoppingBag className="h-3.5 w-3.5 text-brand" /> Store & Trading Tools
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight">
              Institutional Bots, Indicators & Playbooks
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">
              Equip your trading arsenal with algorithmic MetaTrader expert advisors, custom Smart Money indicators, and battle-tested execution blueprints engineered by GAMAT mentors.
            </p>
          </div>

          <button
            onClick={() => navigate("/store")}
            className="btn-primary !py-3 !px-6 text-sm font-bold shrink-0 self-start md:self-auto"
          >
            Explore All Store Tools <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Featured Product Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {featured.map((prod) => {
            const CatIcon = categoryIcon(prod.category);
            const discount = prod.originalPrice
              ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)
              : null;

            return (
              <div
                key={prod.id}
                className="flex flex-col justify-between rounded-3xl border border-line bg-white p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-brand/40 transition-all duration-300 group"
              >
                <div>
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

                  <h3 className="mt-4 font-display text-xl font-extrabold text-ink group-hover:text-brand transition leading-snug">
                    {prod.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed line-clamp-2">
                    {prod.tagline}
                  </p>

                  <ul className="mt-4 space-y-1.5 text-xs text-ink/80 border-t border-line/60 pt-4">
                    {prod.features.slice(0, 3).map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-line flex items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-xl font-black text-ink">{naira(prod.price)}</p>
                    {prod.originalPrice && (
                      <p className="text-[11px] text-muted line-through">{naira(prod.originalPrice)}</p>
                    )}
                  </div>

                  <button
                    onClick={() => navigate("/store")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand-dark transition"
                  >
                    Get Instant Access <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
