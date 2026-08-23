import { useMemo, useState } from "react";
import PageHero from "../components/PageHero";
import PageCta from "../components/PageCta";
import { useStore, type NewsItem } from "../lib/store";
import { navigate } from "../lib/router";
import { useReveal } from "../lib/useReveal";
import {
  Newspaper, ChevronRight, ArrowLeft, Clock, Zap, AlertTriangle,
} from "lucide-react";

const IMPACT: Record<NewsItem["impact"], { label: string; tone: string }> = {
  high: { label: "High impact", tone: "bg-brand text-white" },
  medium: { label: "Medium", tone: "bg-amber-100 text-amber-800" },
  low: { label: "Low", tone: "bg-line text-muted" },
};

const fmt = (iso: string) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : "—";

export function NewsPage() {
  const { publishedNews } = useStore();
  const [q, setQ] = useState("");
  const [impact, setImpact] = useState<"all" | NewsItem["impact"]>("all");
  const { ref, visible } = useReveal<HTMLDivElement>();

  const list = useMemo(() => {
    return publishedNews.filter((n) => {
      const mq = `${n.title} ${n.summary} ${n.pair ?? ""} ${n.source ?? ""}`.toLowerCase().includes(q.toLowerCase());
      return mq && (impact === "all" || n.impact === impact);
    });
  }, [publishedNews, q, impact]);

  const featured = list[0];
  const rest = list.slice(1);

  return (
    <>
      <PageHero
        crumb="News Events"
        eyebrow="Updates"
        image="/images/hero.jpg"
        title={<>Market <span className="text-brand">News Events</span></>}
        subtitle="High-signal market headlines and desk notes from the GAMAT team — filtered for traders, not noise."
      />

      <section className="section bg-cream">
        <div ref={ref} className="container-x">
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search news…"
              className="w-full max-w-xs rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
            <div className="flex flex-wrap gap-2">
              {(["all", "high", "medium", "low"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setImpact(v)}
                  className={`rounded-full px-4 py-2 text-xs font-bold capitalize transition ${
                    impact === v ? "bg-brand text-white" : "border border-line bg-white text-ink/70 hover:border-brand hover:text-brand"
                  }`}
                >
                  {v === "all" ? "All impact" : v}
                </button>
              ))}
            </div>
            <span className="ml-auto text-sm text-muted">{list.length} story(ies)</span>
          </div>

          {!list.length ? (
            <div className="mt-12 rounded-3xl border border-dashed border-line bg-white p-14 text-center">
              <Newspaper className="mx-auto h-12 w-12 text-brand/35" />
              <h3 className="mt-5 font-display text-xl font-bold text-ink">No news published yet</h3>
              <p className="mt-2 text-sm text-muted">Check back soon — the desk posts regularly.</p>
            </div>
          ) : (
            <>
              {featured && (
                <button
                  onClick={() => navigate(`/news/${featured.id}`)}
                  className={`mt-10 grid w-full gap-0 overflow-hidden rounded-3xl border border-line bg-ink text-left text-white shadow-xl transition hover:-translate-y-1 reveal ${visible ? "is-visible" : ""} lg:grid-cols-[1.2fr_1fr]`}
                >
                  <div className="p-8 sm:p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${IMPACT[featured.impact].tone}`}>
                          {IMPACT[featured.impact].label}
                        </span>
                        {featured.pair && <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold">{featured.pair}</span>}
                      </div>
                      <h2 className="mt-4 font-display text-2xl font-extrabold leading-snug sm:text-3xl">
                        {featured.title}
                      </h2>
                      <p className="mt-3 max-w-xl text-white/70">{featured.summary}</p>
                    </div>

                    <p className="mt-6 flex items-center gap-2 text-xs text-white/45">
                      <Clock className="h-3.5 w-3.5" /> {fmt(featured.publishedAt)}
                      {featured.source && <> · {featured.source}</>}
                    </p>
                  </div>

                  {/* Fixed Aspect Ratio Thumbnail */}
                  <div className="relative aspect-[16/9] lg:aspect-auto h-full w-full overflow-hidden bg-gradient-to-br from-brand/40 to-ink group">
                    {featured.image ? (
                      <img
                        src={featured.image}
                        alt={featured.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Zap className="h-20 w-20 text-white/20" />
                      </div>
                    )}
                  </div>
                </button>
              )}

              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {rest.map((n, i) => (
                  <button
                    key={n.id}
                    onClick={() => navigate(`/news/${n.id}`)}
                    className={`card group text-left overflow-hidden !p-0 reveal ${visible ? "is-visible" : ""}`}
                    style={{ transitionDelay: `${(i % 3) * 90}ms` }}
                  >
                    {/* Fixed 16:9 Aspect Ratio Thumbnail Container */}
                    {n.image && (
                      <div className="aspect-[16/9] w-full overflow-hidden bg-ink/10">
                        <img
                          src={n.image}
                          alt={n.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${IMPACT[n.impact].tone}`}>
                          {IMPACT[n.impact].label}
                        </span>
                        {n.pair && <span className="text-[11px] font-bold text-muted">{n.pair}</span>}
                      </div>
                      <h3 className="mt-3 font-display text-lg font-bold leading-snug text-ink group-hover:text-brand">
                        {n.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm text-muted">{n.summary}</p>
                      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
                        <Clock className="h-3.5 w-3.5 text-brand" /> {fmt(n.publishedAt)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <PageCta
        tone="light"
        title="Want the full daily plan?"
        body="Read the Daily Outlook for pair-by-pair bias, levels and risk notes from the desk."
        primaryLabel="Open Daily Outlook"
        primaryTo="/outlook"
      />
    </>
  );
}

export function NewsDetailPage({ id }: { id: string }) {
  const { publishedNews } = useStore();
  const item = publishedNews.find((n) => n.id === id);

  if (!item) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
        <h1 className="font-display text-3xl font-extrabold text-ink">Story not found</h1>
        <button onClick={() => navigate("/news")} className="btn-primary mt-8">Back to News</button>
      </section>
    );
  }

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(55%_55%_at_85%_15%,rgba(220,53,69,0.3),transparent_60%)]" />
        <div className="container-x pb-16 pt-36 md:pt-44">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/55">
            <button onClick={() => navigate("/")} className="hover:text-white">Home</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <button onClick={() => navigate("/news")} className="hover:text-white">News</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-brand-light">Story</span>
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${IMPACT[item.impact].tone}`}>
              {IMPACT[item.impact].label}
            </span>
            {item.pair && <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold">{item.pair}</span>}
          </div>
          <h1 className="mt-4 max-w-4xl font-display text-3xl font-extrabold leading-tight md:text-5xl">{item.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/70">{item.summary}</p>
          <p className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/50">
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-brand" /> {fmt(item.publishedAt)}</span>
            {item.authorName && <span>{item.authorName}</span>}
            {item.source && <span>{item.source}</span>}
          </p>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-x mx-auto max-w-3xl">
          <article className="rounded-3xl border border-line bg-white p-8 shadow-sm md:p-12">
            {/* Full Picture on Article Detail View */}
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                className="mb-8 w-full rounded-2xl object-cover shadow-md max-h-[500px]"
              />
            )}

            <div className="space-y-5 text-[15px] leading-[1.85] text-ink/80">
              {item.body.split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="mt-8 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs leading-relaxed text-amber-900">
                Educational commentary only — not a trade recommendation. Always manage your own risk.
              </p>
            </div>
            <button onClick={() => navigate("/news")} className="btn-outline-dark mt-8">
              <ArrowLeft className="h-4 w-4" /> All news
            </button>
          </article>
        </div>
      </section>
    </>
  );
}
