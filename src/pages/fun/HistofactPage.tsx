import { useState, useMemo, useEffect } from "react";
import PageHero from "../../components/PageHero";
import PageCta from "../../components/PageCta";
import { HISTOFACTS, type HistoFact, type HistoFactCategory, type HistoFactTheme } from "../../lib/histofact";
import { useReveal } from "../../lib/useReveal";
import {
  History, Zap, RotateCw, Search, CheckCircle2,
  Landmark, Coins, Globe, Lightbulb, HelpCircle, Eye, EyeOff, User, ChevronLeft, ChevronRight
} from "lucide-react";

/** Theme style definitions for mystery card backs */
const THEME_STYLES: Record<HistoFactTheme, { bg: string; border: string; accent: string; rankColor: string }> = {
  obsidian: {
    bg: "bg-gradient-to-br from-[#121318] via-[#1a1c23] to-[#0a0b0e]",
    border: "border-amber-500/40",
    accent: "text-amber-400",
    rankColor: "text-amber-400",
  },
  crimson: {
    bg: "bg-gradient-to-br from-[#4a0e17] via-[#851828] to-[#2d080e]",
    border: "border-rose-400/40",
    accent: "text-rose-300",
    rankColor: "text-rose-400",
  },
  gold: {
    bg: "bg-gradient-to-br from-[#42320b] via-[#785c18] to-[#2b2006]",
    border: "border-amber-300/50",
    accent: "text-amber-300",
    rankColor: "text-amber-300",
  },
  sapphire: {
    bg: "bg-gradient-to-br from-[#0c2340] via-[#163c6e] to-[#071526]",
    border: "border-sky-400/40",
    accent: "text-sky-300",
    rankColor: "text-sky-400",
  },
  emerald: {
    bg: "bg-gradient-to-br from-[#0b3820] via-[#165e38] to-[#062414]",
    border: "border-emerald-400/40",
    accent: "text-emerald-300",
    rankColor: "text-emerald-400",
  },
  purple: {
    bg: "bg-gradient-to-br from-[#2e1045] via-[#521c7a] to-[#1c092c]",
    border: "border-purple-400/40",
    accent: "text-purple-300",
    rankColor: "text-purple-300",
  },
};

/** Expanded Near Full-Screen Card Modal View */
function ExpandedMysteryCardModal({
  fact,
  onClose,
  isLearned,
  onToggleLearned,
}: {
  fact: HistoFact | null;
  onClose: () => void;
  isLearned: boolean;
  onToggleLearned: (id: string) => void;
}) {
  if (!fact) return null;
  const t = THEME_STYLES[fact.theme];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6 backdrop-blur-md animate-[fadeIn_.3s_ease] overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-3xl overflow-hidden rounded-3xl border-2 ${t.border} ${t.bg} p-6 sm:p-8 text-white shadow-2xl animate-[scaleUp_.35s_cubic-bezier(0.16,1,0.3,1)] my-auto`}
      >
        {/* Top Header Controls */}
        <div className="flex items-center justify-between border-b border-white/15 pb-4">
          <div className="flex items-center gap-2">
            <span className={`font-display text-xl font-extrabold ${t.rankColor}`}>
              {fact.cardRank}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              Mystery Card #{fact.cardNumber} · {fact.category}
            </span>
            <span className="rounded-full bg-brand/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              {fact.era}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white/80 transition hover:bg-white/20 hover:text-white"
          >
            <RotateCw className="h-3.5 w-3.5" /> Flip Back to Deck
          </button>
        </div>

        {/* Historical Face / Event Banner Picture */}
        {fact.image && (
          <div className="relative mt-5 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/20 shadow-2xl bg-black/40">
            <img
              src={fact.image}
              alt={fact.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            {/* Key Historical Figure Badge */}
            {fact.keyFigure && (
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-black/85 px-4 py-2 text-xs font-bold text-amber-300 backdrop-blur shadow-lg">
                  <User className="h-4 w-4 text-amber-400" /> Key Figure: {fact.keyFigure}
                </div>
                <span className="rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white/80 backdrop-blur">
                  {fact.badge}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Card Body & Story */}
        <div className="mt-6 space-y-4">
          <h2 className="font-display text-2xl font-extrabold leading-snug text-white sm:text-3xl">
            {fact.title}
          </h2>

          <p className="text-sm sm:text-base leading-relaxed text-white/90 font-medium">
            {fact.summary}
          </p>

          {/* Historical Detail Bullet Points */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white/60">
              📜 Key Historical Milestones
            </h4>
            {fact.details.map((d, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/80 leading-relaxed">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                <span>{d}</span>
              </div>
            ))}
          </div>

          {/* Trader Wisdom Callout */}
          <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 to-brand/10 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300 uppercase tracking-wider">
              <Lightbulb className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Trader Lesson & Takeaway</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-amber-100 italic">
              "{fact.takeaway}"
            </p>
          </div>
        </div>

        {/* Bottom Footer Controls */}
        <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-4">
          <button
            type="button"
            onClick={() => onToggleLearned(fact.id)}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition shadow-md ${
              isLearned
                ? "bg-emerald-600 text-white"
                : "bg-white/15 text-white hover:bg-white/25"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" /> {isLearned ? "Learned & Mastered" : "Mark as Learned"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn-primary !py-2.5 !px-6 text-xs font-bold"
          >
            Flip Back to Deck <RotateCw className="h-3.5 w-3.5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

const CARDS_PER_PAGE = 12;

export default function HistofactPage() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [learnedCards, setLearnedCards] = useState<Record<string, boolean>>({});
  const [expandedFact, setExpandedFact] = useState<HistoFact | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const handleCardClick = (fact: HistoFact) => {
    setFlippedCards((prev) => ({ ...prev, [fact.id]: true }));
    setExpandedFact(fact);
  };

  const toggleFlipInline = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleLearned = (id: string) => {
    setLearnedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categories: (string | HistoFactCategory)[] = ["All", "Forex", "Crypto", "Macro & History"];

  const filteredFacts = useMemo(() => {
    return HISTOFACTS.filter((fact) => {
      const matchCat = selectedCategory === "All" || fact.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQ =
        !q ||
        fact.title.toLowerCase().includes(q) ||
        fact.teaser.toLowerCase().includes(q) ||
        fact.summary.toLowerCase().includes(q) ||
        fact.era.toLowerCase().includes(q) ||
        (fact.keyFigure && fact.keyFigure.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [selectedCategory, searchQuery]);

  const totalPages = Math.ceil(filteredFacts.length / CARDS_PER_PAGE) || 1;

  const paginatedFacts = useMemo(() => {
    const start = (currentPage - 1) * CARDS_PER_PAGE;
    return filteredFacts.slice(start, start + CARDS_PER_PAGE);
  }, [filteredFacts, currentPage]);

  const totalFlipped = Object.values(flippedCards).filter(Boolean).length;
  const totalLearned = Object.values(learnedCards).filter(Boolean).length;

  const flipRandom = () => {
    const randomFact = filteredFacts[Math.floor(Math.random() * filteredFacts.length)];
    if (!randomFact) return;
    handleCardClick(randomFact);
  };

  const flipAllToggle = () => {
    if (totalFlipped > 0) {
      setFlippedCards({});
    } else {
      const allFlipped: Record<string, boolean> = {};
      filteredFacts.forEach((f) => (allFlipped[f.id] = true));
      setFlippedCards(allFlipped);
    }
  };

  return (
    <>
      <PageHero
        crumb="Histofact"
        eyebrow="100-Card Mystery Deck"
        image="/images/hero.jpg"
        title={<>Forex & Crypto <span className="text-brand">100-Card Deck</span></>}
        subtitle="Explore 100 legendary market events, central bank shocks, and crypto pioneers. Flip any card to grow it out and master historical market wisdom!"
      />

      {/* Control & Filter Bar */}
      <section className="border-b border-line bg-white/95 py-6 sticky top-20 z-20 backdrop-blur-md">
        <div className="container-x flex flex-wrap items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  selectedCategory === cat
                    ? "bg-brand text-white shadow-md shadow-brand/20"
                    : "bg-cream text-ink/70 hover:bg-line/60 hover:text-ink"
                }`}
              >
                {cat === "Forex" && <Globe className="mr-1.5 inline h-3.5 w-3.5" />}
                {cat === "Crypto" && <Coins className="mr-1.5 inline h-3.5 w-3.5" />}
                {cat === "Macro & History" && <Landmark className="mr-1.5 inline h-3.5 w-3.5" />}
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search mystery cards…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-52 rounded-full border border-line bg-cream pl-9 pr-4 py-2 text-xs text-ink placeholder-muted outline-none transition focus:border-brand focus:bg-white sm:w-60"
              />
            </div>

            <button
              onClick={flipRandom}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-4 py-2 text-xs font-bold text-ink transition hover:border-brand hover:bg-brand-light hover:text-brand"
            >
              <Zap className="h-3.5 w-3.5 text-amber-500" /> Draw Random Card
            </button>

            <button
              onClick={flipAllToggle}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-xs font-bold text-muted transition hover:text-ink"
            >
              {totalFlipped > 0 ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {totalFlipped > 0 ? "Hide All Cards" : "Reveal All Deck"}
            </button>
          </div>
        </div>
      </section>

      {/* Deck Stats Bar */}
      <section className="bg-cream border-b border-line py-3.5">
        <div className="container-x flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-muted">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-brand" />
            <span>Mystery Deck: <strong>{filteredFacts.length}</strong> cards available</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span>Flipped: <strong>{totalFlipped}</strong> / {filteredFacts.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Learned: <strong>{totalLearned}</strong> / {HISTOFACTS.length}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Mystery Deck Cards */}
      <section className="section bg-cream">
        <div ref={ref} className="container-x">
          {filteredFacts.length ? (
            <>
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedFacts.map((fact, idx) => {
                  const isFlipped = !!flippedCards[fact.id];
                  const isLearned = !!learnedCards[fact.id];
                  const t = THEME_STYLES[fact.theme];

                  return (
                    <div
                      id={`fact-card-${fact.id}`}
                      key={fact.id}
                      onClick={() => handleCardClick(fact)}
                      className={`group relative aspect-square w-full cursor-pointer perspective-1000 reveal ${
                        visible ? "is-visible" : ""
                      }`}
                      style={{ transitionDelay: `${(idx % 4) * 90}ms` }}
                    >
                      {/* Inner Flipper Container */}
                      <div
                        className={`relative h-full w-full rounded-3xl transition-transform duration-700 transform-style-3d shadow-xl group-hover:shadow-2xl ${
                          isFlipped ? "rotate-y-180" : ""
                        }`}
                      >
                        {/* FRONT OF CARD — MYSTERY PLAYING CARD BACK */}
                        <div
                          className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-3xl border-2 ${t.border} ${t.bg} p-4 sm:p-5 text-white backface-hidden shadow-2xl`}
                        >
                          {/* Metallic playing card lattice pattern overlay */}
                          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

                          {/* Playing card corners (Top-Left) */}
                          <div className="flex items-start justify-between relative z-10">
                            <div className="flex flex-col items-center">
                              <span className={`font-display text-lg sm:text-xl font-extrabold leading-none ${t.rankColor}`}>
                                {fact.cardRank}
                              </span>
                            </div>

                            <span className="rounded-full border border-white/20 bg-black/40 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/80 backdrop-blur">
                              Card #{fact.cardNumber}
                            </span>
                          </div>

                          {/* Center Mystery Ornament */}
                          <div className="relative z-10 my-auto flex flex-col items-center text-center p-2">
                            <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl border-2 border-white/20 bg-white/10 shadow-2xl backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
                              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/20 to-transparent" />
                              <span className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-widest">
                                {fact.suit}
                              </span>
                            </div>

                            <span className="mt-2.5 font-display text-xs sm:text-sm font-bold uppercase tracking-widest text-white/90">
                              Mystery Fact #{fact.cardNumber}
                            </span>
                            <p className="mt-0.5 text-[10px] sm:text-[11px] text-white/70 tracking-wider">
                              Tap to Grow & Reveal History
                            </p>
                          </div>

                          {/* Bottom Prompt & Playing Card Corner (Bottom-Right) */}
                          <div className="flex items-end justify-between relative z-10 border-t border-white/15 pt-2 sm:pt-3">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold ${t.accent} transition group-hover:scale-105`}>
                              <RotateCw className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin-slow" /> Tap to Grow & Flip
                            </span>

                            <span className={`font-display text-base sm:text-lg font-bold leading-none ${t.rankColor} rotate-180`}>
                              {fact.cardRank}
                            </span>
                          </div>
                        </div>

                        {/* BACK OF CARD — REVEALED HISTORICAL FACT INLINE */}
                        <div className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-brand/40 bg-ink p-4 sm:p-5 text-white rotate-y-180 backface-hidden shadow-2xl">
                          {fact.image && (
                            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl border border-white/15 bg-black/40 shrink-0">
                              <img src={fact.image} alt={fact.title} className="h-full w-full object-cover" />
                              {fact.keyFigure && (
                                <div className="absolute bottom-1 left-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 backdrop-blur">
                                  👤 {fact.keyFigure}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="mt-1.5 overflow-y-auto pr-1 flex-1">
                            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                              <span className="rounded-full bg-brand/90 px-2 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-white">
                                {fact.era} · {fact.category}
                              </span>
                              <button
                                onClick={(e) => toggleFlipInline(e, fact.id)}
                                className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-white/70 hover:text-white"
                              >
                                <RotateCw className="h-3 w-3" /> Flip Back
                              </button>
                            </div>

                            <h4 className="mt-1.5 font-display text-xs sm:text-sm font-bold text-white leading-snug">
                              {fact.title}
                            </h4>

                            <p className="mt-1 text-[10px] sm:text-[11px] leading-relaxed text-white/80 line-clamp-3">
                              {fact.summary}
                            </p>
                          </div>

                          <div className="mt-1.5 border-t border-white/10 pt-1.5 shrink-0">
                            <div className="flex items-center justify-between">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedFact(fact);
                                }}
                                className="text-[10px] sm:text-[11px] font-bold text-brand hover:underline"
                              >
                                View Full Dossier →
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLearned(fact.id);
                                }}
                                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] sm:text-[9px] font-bold transition ${
                                  isLearned ? "bg-emerald-600 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
                                }`}
                              >
                                <CheckCircle2 className="h-3 w-3" /> {isLearned ? "Learned" : "Mark Learned"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
                  <p className="text-xs font-semibold text-muted">
                    Showing <strong>{(currentPage - 1) * CARDS_PER_PAGE + 1}–{Math.min(currentPage * CARDS_PER_PAGE, filteredFacts.length)}</strong> of <strong>{filteredFacts.length}</strong> cards
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (currentPage > 1) {
                          setCurrentPage((p) => p - 1);
                          window.scrollTo({ top: 400, behavior: "smooth" });
                        }
                      }}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-1 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-bold text-ink transition hover:border-brand hover:text-brand disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </button>

                    <div className="flex items-center gap-1 overflow-x-auto max-w-[280px] sm:max-w-none py-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 400, behavior: "smooth" });
                          }}
                          className={`h-9 w-9 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                            currentPage === pageNum
                              ? "bg-brand text-white shadow-md shadow-brand/20"
                              : "border border-line bg-white text-ink/80 hover:border-brand hover:text-brand"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        if (currentPage < totalPages) {
                          setCurrentPage((p) => p + 1);
                          window.scrollTo({ top: 400, behavior: "smooth" });
                        }
                      }}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-1 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-bold text-ink transition hover:border-brand hover:text-brand disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink cursor-pointer disabled:cursor-not-allowed"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-line bg-white p-12 text-center">
              <History className="mx-auto h-10 w-10 text-muted" />
              <h3 className="mt-4 font-display text-lg font-bold text-ink">No mystery cards found</h3>
              <p className="mt-2 text-xs text-muted">Try clearing your search query or selecting a different category.</p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="btn-outline-dark mt-6 !py-2 text-xs"
              >
                Reset Deck Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Expanded Near Full-Screen Card View Modal */}
      <ExpandedMysteryCardModal
        fact={expandedFact}
        onClose={() => setExpandedFact(null)}
        isLearned={expandedFact ? !!learnedCards[expandedFact.id] : false}
        onToggleLearned={toggleLearned}
      />

      {/* CTA */}
      <PageCta
        tone="red"
        title="Ready to put history into strategy?"
        body="Join our structured academy tracks to master price action, risk management, and market mechanics."
        primaryLabel="Explore Courses"
        primaryTo="/courses"
      />
    </>
  );
}
