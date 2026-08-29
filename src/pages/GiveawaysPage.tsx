import { useMemo, useState } from "react";
import PageHero from "../components/PageHero";
import PageCta from "../components/PageCta";
import { useStore, type Giveaway } from "../lib/store";
import { navigate } from "../lib/router";
import { useReveal } from "../lib/useReveal";
import {
  Gift, ChevronRight, ArrowLeft, Clock, Trophy, Zap, UserRound,
} from "lucide-react";

const fmt = (iso: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "—";

function WinnerCard({
  name, nickname, avatar, note, rank,
}: {
  name: string; nickname?: string; avatar?: string; note?: string; rank: number;
}) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-extrabold text-white">
        {rank}
      </span>
      {avatar ? (
        <img src={avatar} alt={name} className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-brand/20" />
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-sm font-bold text-white">
          {initials || <UserRound className="h-5 w-5" />}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-base font-bold text-ink">{name}</p>
        {nickname && <p className="text-xs font-semibold text-brand">@{nickname}</p>}
        {note && <p className="mt-0.5 text-xs text-muted">{note}</p>}
      </div>
      <Trophy className="h-5 w-5 shrink-0 text-amber-500" />
    </div>
  );
}

export function GiveawaysPage() {
  const { publishedGiveaways } = useStore();
  const [q, setQ] = useState("");
  const { ref, visible } = useReveal<HTMLDivElement>();

  const list = useMemo(
    () => publishedGiveaways.filter((g) =>
      `${g.title} ${g.summary} ${g.reward} ${g.winners.map((w) => w.name).join(" ")}`
        .toLowerCase().includes(q.toLowerCase())
    ),
    [publishedGiveaways, q]
  );

  const featured = list[0];

  return (
    <>
      <PageHero
        crumb="Giveaways"
        eyebrow="Updates"
        image="/images/about.jpg"
        title={<>Student <span className="text-brand">Giveaways</span></>}
        subtitle="Celebrating outstanding process, consistency and special performance — with rewards announced right here."
      />

      <section className="section bg-cream">
        <div ref={ref} className="container-x">
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search winners or rewards…"
              className="w-full max-w-xs rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
            <span className="ml-auto text-sm text-muted">{list.length} announcement(s)</span>
          </div>

          {!list.length ? (
            <div className="mt-12 rounded-3xl border border-dashed border-line bg-white p-14 text-center">
              <Gift className="mx-auto h-12 w-12 text-brand/35" />
              <h3 className="mt-5 font-display text-xl font-bold text-ink">No giveaways yet</h3>
              <p className="mt-2 text-sm text-muted">When students win rewards for special performance, they’ll be announced here.</p>
            </div>
          ) : (
            <>
              {featured && (
                <button
                  type="button"
                  onClick={() => navigate(`/giveaways/${featured.id}`)}
                  className={`mt-10 w-full rounded-3xl border border-line bg-ink p-8 text-left text-white shadow-xl transition hover:-translate-y-1 reveal ${visible ? "is-visible" : ""} sm:p-10`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase">
                      <Zap className="h-3 w-3" /> Latest
                    </span>
                    <span className="text-xs text-white/50">{fmt(featured.announcedAt)}</span>
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-extrabold sm:text-3xl">{featured.title}</h2>
                  <p className="mt-3 max-w-2xl text-white/70">{featured.summary}</p>
                  
                  {featured.taggedClubName && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500/30 to-brand/30 border border-amber-400/40 px-4 py-2 text-amber-300 text-xs font-black uppercase tracking-wider shadow-lg">
                      <Trophy className="h-4 w-4 text-amber-400 animate-bounce" />
                      <span>Winning Syndicate: <strong>{featured.taggedClubName}</strong></span>
                    </div>
                  )}

                  <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-brand-light">
                    <Gift className="h-4 w-4" /> {featured.reward}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {featured.winners.slice(0, 4).map((w) => (
                      <span key={w.name} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
                        {w.avatar ? (
                          <img src={w.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
                        ) : (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[9px] font-bold">
                            {w.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                          </span>
                        )}
                        {w.nickname ? `@${w.nickname}` : w.name}
                      </span>
                    ))}
                    {featured.winners.length > 4 && (
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/60">
                        +{featured.winners.length - 4} more
                      </span>
                    )}
                  </div>
                </button>
              )}

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {list.slice(1).map((g, i) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => navigate(`/giveaways/${g.id}`)}
                    className={`card text-left reveal ${visible ? "is-visible" : ""}`}
                    style={{ transitionDelay: `${(i % 2) * 90}ms` }}
                  >
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <Clock className="h-3.5 w-3.5 text-brand" /> {fmt(g.announcedAt)}
                    </div>
                    <h3 className="mt-3 font-display text-lg font-bold text-ink">{g.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted">{g.summary}</p>
                    <p className="mt-3 text-xs font-bold text-brand">{g.reward}</p>
                    <p className="mt-4 text-xs text-muted">{g.winners.length} winner{g.winners.length === 1 ? "" : "s"}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <PageCta
        tone="red"
        title="Want to be featured next?"
        body="Show up, journal, and stick to your risk rules — consistency is how GAMAT students win rewards."
        primaryLabel="Browse Courses"
        primaryTo="/courses"
      />
    </>
  );
}

export function GiveawayDetailPage({ id }: { id: string }) {
  const { publishedGiveaways } = useStore();
  const item = publishedGiveaways.find((g) => g.id === id) as Giveaway | undefined;

  if (!item) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
        <h1 className="font-display text-3xl font-extrabold text-ink">Giveaway not found</h1>
        <button onClick={() => navigate("/giveaways")} className="btn-primary mt-8">Back to Giveaways</button>
      </section>
    );
  }

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(55%_55%_at_85%_15%,rgba(220,53,69,0.35),transparent_60%)]" />
        <div className="container-x pb-16 pt-36 md:pt-44">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/55">
            <button onClick={() => navigate("/")} className="hover:text-white">Home</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <button onClick={() => navigate("/giveaways")} className="hover:text-white">Giveaways</button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-brand-light">Winners</span>
          </nav>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase">
            <Gift className="h-3 w-3" /> Giveaway
          </span>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-extrabold leading-tight md:text-5xl">{item.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/70">{item.summary}</p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-brand-light">
            <Trophy className="h-4 w-4" /> {item.reward}
          </p>
          <p className="mt-4 text-sm text-white/45">Announced {fmt(item.announcedAt)}{item.authorName ? ` · ${item.authorName}` : ""}</p>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-x mx-auto max-w-3xl space-y-8">
          <article className="rounded-3xl border border-line bg-white p-8 shadow-sm md:p-10">
            <h2 className="font-display text-xl font-bold text-ink">About this reward</h2>
            <div className="mt-4 space-y-4 text-[15px] leading-[1.85] text-ink/80">
              {item.body.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </article>

          <div>
            <h2 className="font-display text-xl font-bold text-ink">
              Tagged winners ({item.winners.length})
            </h2>
            <p className="mt-1 text-sm text-muted">Profiles of students recognised for special performance.</p>
            <div className="mt-5 space-y-3">
              {item.winners.map((w, i) => (
                <WinnerCard
                  key={`${w.name}-${i}`}
                  rank={i + 1}
                  name={w.name}
                  nickname={w.nickname}
                  avatar={w.avatar}
                  note={w.note}
                />
              ))}
            </div>
          </div>

          <button onClick={() => navigate("/giveaways")} className="btn-outline-dark">
            <ArrowLeft className="h-4 w-4" /> All giveaways
          </button>
        </div>
      </section>
    </>
  );
}
