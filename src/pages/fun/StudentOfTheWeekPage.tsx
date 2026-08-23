import { useStore } from "../../lib/store";
import PageCta from "../../components/PageCta";
import {
  Trophy, TrendingUp, Zap, Star, Quote,
  Calendar, ShieldCheck, Flame, ArrowRight,
} from "lucide-react";
import { navigate } from "../../lib/router";

export function StudentOfTheWeekPage() {
  const { studentOfTheWeek, studentOfTheWeekHistory } = useStore();
  const sotw = studentOfTheWeek;
  const history = (studentOfTheWeekHistory || []).filter((h) => h.id !== sotw.id);

  return (
    <div className="bg-cream">
      {/* Hero Spotlight Section */}
      <section className="relative overflow-hidden bg-slate-950 py-16 sm:py-24 text-white">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] rounded-full bg-amber-500/10 blur-[90px] pointer-events-none" />

        <div className="container relative z-10 mx-auto px-4 max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 backdrop-blur-md mb-6">
            <Trophy className="h-4 w-4 text-amber-400 animate-bounce" /> GAMAT Student of the Week Spotlight
          </div>

          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Student Photo Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group w-full max-w-md">
                <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-brand via-amber-500 to-rose-600 blur opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse" />
                <div className="relative rounded-3xl bg-slate-900 p-4 border border-white/10 shadow-2xl overflow-hidden">
                  <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-slate-950">
                    <img
                      src={sotw.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"}
                      alt={sotw.studentName}
                      className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    {/* Ribbon Badge */}
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3.5 py-1 text-xs font-black uppercase text-slate-950 shadow-lg">
                      <Star className="h-3.5 w-3.5 fill-slate-950" /> Weekly Champion
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">{sotw.weekPeriod}</p>
                      <h2 className="text-2xl font-black">{sotw.studentName}</h2>
                      <p className="text-xs text-slate-300 font-medium">{sotw.track}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Breakdown */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">{sotw.weekPeriod}</p>
                <h1 className="mt-2 text-4xl sm:text-5xl font-black tracking-tight text-white">
                  Meet {sotw.studentName}
                </h1>
                <p className="mt-3 text-lg text-slate-300">
                  Honoring high precision execution, strict risk management, and outstanding academic performance across GAMAT FX Academy modules.
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-amber-400 mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Win Rate</span>
                  </div>
                  <p className="text-2xl font-black text-white">{sotw.winRate}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-rose-400 mb-1">
                    <Zap className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Quiz XP</span>
                  </div>
                  <p className="text-2xl font-black text-white">{sotw.quizXP}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-purple-400 mb-1">
                    <Trophy className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Combat Rank</span>
                  </div>
                  <p className="text-sm font-bold text-white leading-tight mt-1">{sotw.combatRank}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-emerald-400 mb-1">
                    <Flame className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Gain</span>
                  </div>
                  <p className="text-2xl font-black text-white">{sotw.weeklyReturn}</p>
                </div>
              </div>

              {/* Performance Review Note */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 backdrop-blur-md text-amber-100/90 text-sm leading-relaxed space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <ShieldCheck className="h-4 w-4" /> Mentor Evaluation Notes
                </div>
                <p>{sotw.performanceReview}</p>
              </div>

              {/* Mentor Quote */}
              {sotw.mentorQuote && (
                <div className="relative rounded-2xl border border-white/10 bg-slate-900/90 p-5 text-sm italic text-slate-300">
                  <Quote className="absolute top-3 right-3 h-8 w-8 text-white/5" />
                  <p className="relative z-10">"{sotw.mentorQuote}"</p>
                  <p className="mt-2 text-xs font-semibold not-italic text-brand">— GAMAT Senior Desk Mentor</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* History Hall of Champions */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-brand">Wall of Fame</p>
              <h2 className="text-3xl font-black text-ink">Past Students of the Week</h2>
            </div>
            <button onClick={() => navigate("/fun")} className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:underline">
              Back to Fun Zone <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((item) => (
              <div key={item.id} className="group relative rounded-3xl border border-line bg-white p-6 shadow-sm transition hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <img
                    src={item.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"}
                    alt={item.studentName}
                    className="h-16 w-16 rounded-2xl object-cover border-2 border-brand/20 shadow-md"
                  />
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                      <Calendar className="h-3 w-3" /> {item.weekPeriod}
                    </span>
                    <h3 className="text-lg font-bold text-ink mt-1">{item.studentName}</h3>
                    <p className="text-xs text-muted font-medium line-clamp-1">{item.track}</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-cream p-2">
                    <span className="block text-[10px] uppercase font-bold text-muted">Win Rate</span>
                    <span className="font-extrabold text-brand">{item.winRate}</span>
                  </div>
                  <div className="rounded-xl bg-cream p-2">
                    <span className="block text-[10px] uppercase font-bold text-muted">Quiz XP</span>
                    <span className="font-extrabold text-ink">{item.quizXP}</span>
                  </div>
                </div>

                <p className="mt-4 text-xs text-muted leading-relaxed line-clamp-3">
                  "{item.performanceReview}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageCta
        title="Ready to Excel Next Week?"
        body="Join GAMAT FX Academy, master our price action framework, and compete for Student of the Week honor."
        primaryLabel="Join Academy Now"
        primaryTo="/signup"
        tone="red"
      />
    </div>
  );
}
