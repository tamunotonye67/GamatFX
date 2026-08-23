import PageHero from "../components/PageHero";
import PageCta from "../components/PageCta";
import Counter from "../components/Counter";
import { useReveal } from "../lib/useReveal";
import { CONTACT } from "../lib/contact";
import {
  Send,
  Bitcoin,
  LineChart,
  TrendingUp,
  Activity,
  Bell,
  BookOpen,
  MessageSquare,
  CalendarClock,
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const markets = [
  { icon: LineChart, title: "Currency Pairs", body: "AUDUSD, GBPUSD, GBPAUD, GBPJPY, AUDJPY, EURUSD and more major, minor and exotic pairs." },
  { icon: Bitcoin, title: "Crypto", body: "BTCUSD, ETHUSD and other high-liquidity crypto pairs analysed with the same framework." },
  { icon: TrendingUp, title: "CFDs", body: "Contracts for Difference across commodities, indices and equities." },
  { icon: Activity, title: "Synthetic Indices", body: "Volatility 75 Index and other synthetics that trade 24/7, rain or shine." },
];

const perks = [
  { icon: Bell, title: "Daily market updates", body: "Pre-London and pre-New York briefings so you know what matters before the session opens." },
  { icon: BookOpen, title: "Free educational drops", body: "Regular breakdowns of fundamentals, supply & demand zones and live chart examples." },
  { icon: MessageSquare, title: "Analysis, not signals", body: "We explain the reasoning behind every idea so you learn to spot it yourself next time." },
  { icon: CalendarClock, title: "Event & news alerts", body: "High-impact news reminders — NFP, CPI, rate decisions — with context on likely reactions." },
  { icon: Users, title: "Peer accountability", body: "Share journals, get feedback and grow alongside traders at every experience level." },
  { icon: ShieldCheck, title: "Strictly moderated", body: "Zero tolerance for scams, account-management offers or unsolicited DMs. Ever." },
];

const rules = {
  yes: [
    "Ask questions — no question is too basic",
    "Share your charts and analysis for feedback",
    "Respect every member regardless of experience",
    "Keep discussion focused on trading and markets",
  ],
  no: [
    "No signal selling or paid group promotion",
    "No account management or 'invest with me' offers",
    "No spam, referral links or unsolicited DMs",
    "No guaranteed-profit or get-rich-quick claims",
  ],
};

function Markets() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section className="section bg-cream">
      <div ref={ref} className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center">What we trade</span>
          <h2 className="section-title mt-4">Markets covered in the community</h2>
          <p className="mt-4 text-muted">
            One framework, applied consistently across every market we follow.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {markets.map((m, i) => (
            <div key={m.title} className={`card reveal ${visible ? "is-visible" : ""}`} style={{ transitionDelay: `${i * 100}ms` }}>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
                <m.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-ink">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{m.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Perks() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section className="section bg-white">
      <div ref={ref} className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center">Inside the channel</span>
          <h2 className="section-title mt-4">What you get, completely free</h2>
          <p className="mt-4 text-muted">
            Our Telegram community is free to join and always will be.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {perks.map((p, i) => (
            <div key={p.title} className={`card reveal ${visible ? "is-visible" : ""}`} style={{ transitionDelay: `${(i % 3) * 110}ms` }}>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-ink">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Rules() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section className="section bg-cream">
      <div ref={ref} className="container-x grid items-start gap-8 lg:grid-cols-2">
        <div className={`card reveal ${visible ? "is-visible" : ""}`}>
          <span className="chip">Do</span>
          <h3 className="mt-4 font-display text-xl font-bold text-ink">House rules we love</h3>
          <ul className="mt-5 space-y-3">
            {rules.yes.map((r) => (
              <li key={r} className="flex items-start gap-3 text-sm text-ink/80">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" /> {r}
              </li>
            ))}
          </ul>
        </div>
        <div className={`card reveal ${visible ? "is-visible" : ""}`} style={{ transitionDelay: "120ms" }}>
          <span className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
            Don't
          </span>
          <h3 className="mt-4 font-display text-xl font-bold text-ink">Instantly removable offences</h3>
          <ul className="mt-5 space-y-3">
            {rules.no.map((r) => (
              <li key={r} className="flex items-start gap-3 text-sm text-ink/80">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-ink/40" /> {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function CommunityPage() {
  return (
    <>
      <PageHero
        crumb="Community"
        eyebrow="Our telegram community"
        image="/images/community.jpg"
        title={<>Join <span className="text-brand">40,000+ traders</span> learning together</>}
        subtitle="A free, strictly moderated Telegram community where we share daily market insight, live breakdowns and honest education — with absolutely no signal selling."
      />

      {/* Stats bar */}
      <section className="border-b border-line bg-white py-12">
        <div className="container-x grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          {[
            { end: 40000, suffix: "+", label: "Members" },
            { end: 4000, suffix: "+", label: "Students trained" },
            { end: 250, suffix: "+", label: "Analyses shared monthly" },
            { end: 24, suffix: "/7", label: "Active discussion" },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-display text-3xl font-extrabold text-brand md:text-4xl">
                <Counter end={s.end} suffix={s.suffix} />
              </div>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <Markets />
      <Perks />
      <Rules />

      {/* Join banner */}
      <section className="section bg-ink text-white">
        <div className="container-x grid items-center gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl shadow-2xl">
            <img src="/images/community.jpg" alt="GAMAT Fx Telegram community" className="h-full w-full object-cover" />
          </div>
          <div>
            <span className="eyebrow text-brand-light">Free forever</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight md:text-4xl">
              Three steps to get in
            </h2>
            <ol className="mt-8 space-y-5">
              {[
                "Tap the join button and open our official Telegram channel.",
                "Read the pinned rules and introduce yourself to the community.",
                "Turn on notifications so you never miss a session briefing.",
              ].map((s, i) => (
                <li key={s} className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold">
                    {i + 1}
                  </span>
                  <span className="text-white/75">{s}</span>
                </li>
              ))}
            </ol>
            <a href={CONTACT.telegram} target="_blank" rel="noreferrer" className="btn-primary mt-9">
              <Send className="h-4 w-4" /> Join the Community
            </a>
          </div>
        </div>
      </section>

      <PageCta
        tone="light"
        title="Ready to go beyond the free community?"
        body="Our structured courses take you from market basics to consistent, rule-based execution."
        primaryLabel="Explore Courses"
        primaryTo="/courses"
      />
    </>
  );
}
