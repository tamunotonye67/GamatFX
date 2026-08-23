import { useReveal } from "../lib/useReveal";
import { Bitcoin, LineChart, TrendingUp, Activity, Send } from "lucide-react";
import { navigate } from "../lib/router";
import { CONTACT } from "../lib/contact";

const markets = [
  {
    icon: Bitcoin,
    title: "Crypto",
    body: "Trade cryptocurrency pairs i.e. BTCUSD, ETHUSD, and more.",
  },
  {
    icon: LineChart,
    title: "Currency",
    body: "Trade currency pairs i.e. AUDUSD, GBPUSD, GBPAUD, GBPJPY, AUDJPY, and more.",
  },
  {
    icon: TrendingUp,
    title: "CFDs",
    body: "Yes! We trade Contracts for Difference across multiple asset classes.",
  },
  {
    icon: Activity,
    title: "Synthetic Indices",
    body: "Trade synthetic indices i.e. Volatility 75 Index and more.",
  },
];

export default function Community() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="community" className="section bg-cream">
      <div ref={ref} className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center">Our telegram community</span>
          <h2 className="section-title mt-4">Join 40K+ traders in our community</h2>
          <p className="mt-4 text-muted">
            Get exclusive forex trading updates, live signals commentary, and daily market insights.
          </p>
        </div>

        {/*
          Two equal-height columns:
          - left photo fills the full height of the right 2x2 card grid
          - tops and bottoms of both columns align exactly
        */}
        <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:items-stretch">
          {/* Image + CTA — stretches to match the cards column */}
          <div
            className={`reveal ${visible ? "is-visible" : ""} relative flex min-h-[480px] overflow-hidden rounded-3xl shadow-xl lg:min-h-full`}
          >
            <img
              src="/images/community.jpg"
              alt="GAMAT Fx Telegram community"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
            {/* Spacer keeps the column height while the content stays pinned to the bottom */}
            <div className="relative mt-auto w-full p-7 text-white sm:p-8">
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-light">
                <Send className="h-4 w-4" /> Official Channel
              </div>
              <h3 className="mt-2 max-w-sm font-display text-xl font-bold leading-snug sm:text-2xl">
                Join our official Telegram community and enjoy exclusive forex trading
                updates
              </h3>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={CONTACT.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                >
                  <Send className="h-4 w-4" /> Join Now
                </a>
                <button type="button" onClick={() => navigate("/community")} className="btn-ghost">
                  Learn More
                </button>
              </div>
            </div>
          </div>

          {/* Market cards — 2×2 grid that defines the shared column height */}
          <div className="grid auto-rows-fr gap-4 sm:grid-cols-2">
            {markets.map((m, i) => (
              <div
                key={m.title}
                className={`card reveal ${visible ? "is-visible" : ""} flex h-full min-h-[180px] flex-col !p-6`}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <m.icon className="h-5 w-5" />
                </span>
                <h4 className="mt-4 font-display text-lg font-bold text-ink">
                  {m.title}
                </h4>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
