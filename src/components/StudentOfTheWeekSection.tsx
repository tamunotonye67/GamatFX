import { useStore } from "../lib/store";
import { useReveal } from "../lib/useReveal";
import { Trophy, TrendingUp, Zap, Star, ShieldCheck, ArrowRight, Flame } from "lucide-react";
import { navigate } from "../lib/router";

function formatReturn(val?: string): string {
  if (!val) return "+0.0%";
  const cleaned = val.replace(/\s*Return/i, "").trim();
  return cleaned || "+0.0%";
}

function formatTier(rank?: string): string {
  if (!rank) return "Tier 1";
  const match = rank.match(/Tier\s*(\d+)/i);
  if (match) return `Tier ${match[1]}`;
  const lvlMatch = rank.match(/(?:Level|Lv\.?)\s*(\d+)/i);
  if (lvlMatch) return `Tier ${lvlMatch[1]}`;
  return rank.length <= 8 ? rank : "Tier 1";
}

export default function StudentOfTheWeekSection() {
  const { studentOfTheWeek } = useStore();
  const { ref, visible } = useReveal<HTMLDivElement>();
  const sotw = studentOfTheWeek;

  if (!sotw || !sotw.studentName) return null;

  return (
    <section className="section bg-slate-950 text-white overflow-hidden relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-brand/20 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/10 blur-[110px] pointer-events-none rounded-full" />

      <div ref={ref} className="container-x relative z-10">
        <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
            <Trophy className="h-4 w-4 text-amber-400 shrink-0" />
            Academy Spotlight
          </div>
          <h2 className="section-title text-white">Student of the Week</h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Every week, GAMAT FX mentors honor the student who demonstrated the highest execution discipline, risk management, and market analysis consistency.
          </p>
        </div>

        <div className={`reveal ${visible ? "is-visible" : ""} mx-auto max-w-4xl rounded-3xl border border-white/10 bg-slate-900/90 p-5 sm:p-8 backdrop-blur-xl shadow-2xl`}>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Student Photo Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group w-full max-w-xs">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand via-amber-500 to-rose-600 blur opacity-75 group-hover:opacity-100 transition duration-500" />
                <div className="relative rounded-2xl bg-slate-950 p-2.5 border border-white/10 overflow-hidden shadow-xl">
                  <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-slate-900">
                    <img
                      src={sotw.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"}
                      alt={sotw.studentName}
                      className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-black uppercase text-slate-950 shadow-md">
                      <Star className="h-3 w-3 fill-slate-950" /> Weekly Champion
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{sotw.weekPeriod}</p>
                      <h3 className="text-lg font-black">{sotw.studentName}</h3>
                      <p className="text-xs text-slate-300 font-medium">{sotw.track}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Stats & Mentor Note */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">{sotw.weekPeriod}</span>
                <h3 className="mt-1 text-2xl sm:text-3xl font-black text-white">{sotw.studentName}</h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">{sotw.track}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-400 text-[10px] font-bold uppercase mb-0.5">
                    <TrendingUp className="h-3.5 w-3.5" /> Win Rate
                  </div>
                  <span className="text-lg font-black text-white">{sotw.winRate}</span>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-emerald-400 text-[10px] font-bold uppercase mb-0.5">
                    <Flame className="h-3.5 w-3.5" /> Return
                  </div>
                  <span className="text-lg font-black text-white">{formatReturn(sotw.weeklyReturn)}</span>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-rose-400 text-[10px] font-bold uppercase mb-0.5">
                    <Zap className="h-3.5 w-3.5" /> Quiz XP
                  </div>
                  <span className="text-lg font-black text-white">{sotw.quizXP}</span>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-purple-400 text-[10px] font-bold uppercase mb-0.5">
                    <Trophy className="h-3.5 w-3.5" /> Rank
                  </div>
                  <span className="text-lg font-black text-white">{formatTier(sotw.combatRank)}</span>
                </div>
              </div>

              {/* Mentor Note */}
              {sotw.performanceReview ? (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1 text-xs">
                    <ShieldCheck className="h-4 w-4" /> Mentor Evaluation
                  </div>
                  <p className="line-clamp-3">{sotw.performanceReview}</p>
                </div>
              ) : null}

              {/* CTA link */}
              <div className="pt-1 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/fun/student-of-the-week")}
                  className="btn-primary inline-flex items-center gap-2 !py-2.5 !text-xs sm:!text-sm"
                >
                  View Full Spotlight & Wall of Fame <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
