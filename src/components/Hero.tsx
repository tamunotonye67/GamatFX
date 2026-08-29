import { ArrowUpRight, PlayCircle, Zap } from "lucide-react";
import Counter from "./Counter";
import { navigate } from "../lib/router";
import { useStore } from "../lib/store";
import MarketClock from "./MarketClock";

export default function Hero() {
  const { allEvents, events } = useStore();
  const eventList = allEvents || events || [];
  const latestEvent = eventList.find((e) => e.status === "published") || eventList[0] || {
    title: "Forex Mentorship Class 2026",
    month: "Aug",
    day: "10",
  };

  return (
    <section id="home" className="relative isolate overflow-hidden">
      {/* Background image + dark gradient overlay */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/images/hero.jpg"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/95 via-ink/85 to-[#0c0d10]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_10%,rgba(220,53,69,0.35),transparent_60%)]" />
      </div>

      <div className="container-x flex min-h-screen flex-col justify-center pb-16 pt-32 text-white">
        {/* Animated Synced Latest Event Announcement */}
        <div
          data-aos-delay="100"
          className="mb-8 inline-flex w-fit items-center gap-3 rounded-full border border-white/15 bg-white/5 py-2 pl-2 pr-4 backdrop-blur-sm"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand via-rose-600 to-brand px-3 py-1 text-xs font-semibold text-white shadow-md animate-pulse shrink-0">
            <Zap className="h-3.5 w-3.5" /> New
          </span>

          {/* Gliding Event Line moving out of the slim white terminal cursor and disappearing before Register button */}
          <div className="relative flex items-center overflow-hidden max-w-[280px] sm:max-w-[360px] md:max-w-[440px] [mask-image:linear-gradient(to_right,rgba(0,0,0,1)_82%,rgba(0,0,0,0)_100%)]">
            <span className="inline-block h-3.5 w-[2px] bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.9)] mr-2 shrink-0 z-10" />
            <div className="whitespace-nowrap animate-cursor-ticker text-sm text-white/85">
              <span className="font-semibold text-white">{latestEvent.month} {latestEvent.day}</span> · {latestEvent.title} — seats filling fast.
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/events")}
            className="text-xs font-semibold text-brand-light underline-offset-2 hover:underline shrink-0 z-10"
          >
            Register
          </button>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,0.75fr)] lg:gap-14 xl:gap-20">
        <div className="max-w-3xl lg:max-w-none">
          <span className="eyebrow text-brand-light">
            Financial education &amp; digital empowerment
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
            Build elite traders through{" "}
            <span className="text-brand">high-quality forex education</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/75">
            We build elite traders through high-quality forex education, actionable
            market insights, and a results-driven mentorship system designed for real,
            consistent profitability.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button type="button" onClick={() => navigate("/courses")} className="btn-primary">
              Explore Courses <ArrowUpRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/how-it-works")}
              className="btn-ghost group"
            >
              <PlayCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
              Watch How It Works
            </button>
          </div>
        </div>

          {/* Live market-session clock */}
          <div className="mt-10 flex justify-center lg:mt-0 lg:justify-end lg:translate-x-4 xl:translate-x-8">
            <MarketClock />
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-16 grid max-w-3xl grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4">
          {[
            { value: 4000, suffix: "+", label: "Students Trained" },
            { value: 40000, suffix: "+", label: "Telegram Members" },
            { value: 6, suffix: "+", label: "Years Experience" },
            { value: 4.9, suffix: "/5", label: "Avg. Rating", decimal: true },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-display text-3xl font-extrabold text-white sm:text-4xl">
                {s.decimal ? (
                  <span>
                    {s.value}
                    {s.suffix}
                  </span>
                ) : (
                  <Counter end={s.value} suffix={s.suffix} />
                )}
              </div>
              <p className="mt-1 text-sm text-white/60">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
