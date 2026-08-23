import { useMemo, useState } from "react";
import PageHero from "../components/PageHero";
import PageCta from "../components/PageCta";
import { useStore, type OutlookItem } from "../lib/store";
import { navigate } from "../lib/router";
import { useReveal } from "../lib/useReveal";
import {
  Sun, ChevronRight, ArrowLeft, CalendarDays, TrendingUp, TrendingDown,
  Minus, Shuffle, AlertTriangle,
} from "lucide-react";

const BIAS: Record<OutlookItem["bias"], { label: string; tone: string; icon: React.ElementType }> = {
  bullish: { label: "Bullish", tone: "bg-emerald-100 text-emerald-800", icon: TrendingUp },
  bearish: { label: "Bearish", tone: "bg-brand-light text-brand", icon: TrendingDown },
  neutral: { label: "Neutral", tone: "bg-line text-muted", icon: Minus },
  mixed: { label: "Mixed", tone: "bg-amber-100 text-amber-800", icon: Shuffle },
};

const fmtDate = (d: string) =>
  new Date(d + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

export function OutlookPage() {
  const { publishedOutlooks } = useStore();
  const [q, setQ] = useState("");
  const { ref, visible } = useReveal<HTMLDivElement>();

  const list = useMemo(
    () => publishedOutlooks.filter((o) =>
      `${o.title} ${o.summary} ${o.pairs.join(" ")}`.toLowerCase().includes(q.toLowerCase())
    ),
    [publishedOutlooks, q]
  );

  const today = list[0];

  return (
    <>
      <PageHero
        crumb="Daily Outlook"
        eyebrow="Updates"
        image="/images/about-hero.jpg"
        title={<>Daily <span className="text-brand">Market Outlook</span></>}
        subtitle="Pair-by-pair bias, key levels and risk notes from the GAMAT desk — updated before the London open."
      />

      <section className="section bg-cream">
        <div ref={ref} className="container-x">
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search outlooks or pairs…"
              className="w-full max-w-xs rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
            <span className="ml-auto text-sm text-muted">{list.length} outlook(s)</span>
          </div>

          {!list.length ? (
            <div className="mt-12 rounded-3xl border border-dashed border-line bg-white p-14 text-center">
              <Sun className="mx-auto h-12 w-12 text-brand/35" />
              <h3 className="mt-5 font-display text-xl font-bold text-ink">No outlook published yet</h3>
              <p className="mt-2 text-sm text-muted">The desk posts before the London open on trading days.</p>
            </div>
          ) : (
            <>
              {today && (
                <button
                  onClick={() => navigate(`/outlook/${today.id}`)}
                  className={`mt-10 w-full rounded-3xl border border-line bg-white p-8 text-left shadow-lg transition hover:-translate-y-1 reveal ${visible ? "is-visible" : ""} sm:p-10`}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="chip"><CalendarDays className="h-3.5 w-3.5" /> {fmtDate(today.date)}</span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase ${BIAS[today.bias].tone}`}>
                      {(() => { const I = BIAS[today.bias].icon; return <I className="h-3.5 w-3.5" />; })()}
                      {BIAS[today.bias].label}
                    </span>
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-extrabold text-ink sm:text-3xl">{today.title}</h2>
                  <p className="mt-3 max-w-3xl text-muted">{today.summary}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {today.pairs.map((p) => (
                      <span key={p} className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-ink">{p}</span>
                    ))}
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand">
                    Read full outlook <ChevronRight className="h-4 w-4" />
                  </span>
                </button>
              )}

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {list.slice(1).map((o, i) => {
                  const B = BIAS[o.bias];
                  return (
                    <button
                      key={o.id}
                      onClick={() => navigate(`/outlook/${o.id}`)}
                      className={`card text-left reveal ${visible ? "is-visible" : ""}`}
                      style={{ transitionDelay: `${(i % 2) * 90}ms` }}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-muted">{fmtDate(o.date)}</span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${B.tone}`}>
                          <B.icon className="h-3 w-3" /> {B.label}
                        </span>
                      </div>
                      <h3 className="mt-3 font-display text-lg font-bold text-ink">{o.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-muted">{o.summary}</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {o.pairs.slice(0, 4).map((p) => (
                          <span key={p} className="rounded-full bg-cream px-2.5 py-0.5 text-[11px] font-bold text-ink/70">{p}</span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      <PageCta
        tone="red"
        title="Stay ahead of the session"
        body="Pair the Daily Outlook with our News Events feed for a complete pre-market routine."
        primaryLabel="Read News Events"
        primaryTo="/news"
      />
    </>
  );
}

export function OutlookDetailPage({ id }: { id: string }) {
  const { publishedOutlooks } = useStore();
  const item = publishedOutlooks.find((o) => o.id === id);

  if (!item) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
        <h1 className="font-display text-3xl font-extrabold text-ink">Outlook not found</h1>
        <button onClick={() => navigate("/outlook")} className="btn-primary mt-8">Back to Outlooks</button>
      </section>
    );
  }

  const B = BIAS[item.bias];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(55%_55%_at_85%_15%,rgba(220,53,69,0.3),transparent_60%)]" />
        <div className="container-x pb-16 pt-36 md:pt-44">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/55">
            <button onClick={() => navigate("/")} className="hover:text-white">Home</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <button onClick={() => navigate("/outlook")} className="hover:text-white">Daily Outlook</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-brand-light">Detail</span>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
              <CalendarDays className="h-3.5 w-3.5 text-brand" /> {fmtDate(item.date)}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase ${B.tone}`}>
              <B.icon className="h-3.5 w-3.5" /> {B.label}
            </span>
          </div>
          <h1 className="mt-4 max-w-4xl font-display text-3xl font-extrabold leading-tight md:text-5xl">{item.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/70">{item.summary}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {item.pairs.map((p) => (
              <span key={p} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{p}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-x mx-auto max-w-3xl space-y-6">
          <article className="rounded-3xl border border-line bg-white p-8 shadow-sm md:p-12">
            <h2 className="font-display text-xl font-bold text-ink">Desk notes</h2>
            <div className="mt-5 space-y-4 text-[15px] leading-[1.85] text-ink/80">
              {item.body.split(/\n{2,}/).map((p, i) => (
                <p key={i} className="whitespace-pre-wrap">{p}</p>
              ))}
            </div>

            {item.levels && (
              <div className="mt-8 rounded-2xl border border-line bg-cream p-6">
                <h3 className="font-display text-base font-bold text-ink">Key levels</h3>
                <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink/80">{item.levels}</pre>
              </div>
            )}

            <div className="mt-8 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs leading-relaxed text-amber-900">
                Educational market commentary only. Not financial advice. Always use your own risk rules.
              </p>
            </div>

            <button onClick={() => navigate("/outlook")} className="btn-outline-dark mt-8">
              <ArrowLeft className="h-4 w-4" /> All outlooks
            </button>
          </article>
        </div>
      </section>
    </>
  );
}
