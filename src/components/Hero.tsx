import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, PlayCircle, Zap } from "lucide-react";
import Counter from "./Counter";
import { navigate } from "../lib/router";
import { useStore } from "../lib/store";
import MarketClock, { MobileSessionDockTrigger, MobileSessionDockModal } from "./MarketClock";

export default function Hero() {
  const { allEvents, events } = useStore();
  const [clockOpen, setClockOpen] = useState(false);
  const [heroInView, setHeroInView] = useState(true);
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const checkScroll = () => {
      const el = heroRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Hide docker once user scrolls down past the hero section
      setHeroInView(rect.bottom > 120);
    };
    checkScroll();
    window.addEventListener("scroll", checkScroll, { passive: true });
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  const eventList = allEvents || events || [];
  const latestEvent = eventList.find((e) => e.status === "published") || eventList[0] || {
    title: "Forex Mentorship Class 2026",
    month: "Aug",
    day: "10",
  };

  return (
    <>
      <section ref={heroRef} id="home" className="relative isolate overflow-hidden">
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

        <div className="container-x flex flex-col justify-center pb-14 pt-[calc(var(--header-h,104px)+3.25rem)] sm:pb-16 sm:pt-40 lg:min-h-screen text-white">
          {/* Animated Synced Latest Event Announcement */}
          <div
            data-aos-delay="100"
            className="mb-6 sm:mb-8 inline-flex max-w-full w-fit items-center gap-2 sm:gap-3 rounded-full border border-white/15 bg-white/5 py-1.5 pl-1.5 pr-3 sm:py-2 sm:pl-2 sm:pr-4 backdrop-blur-sm"
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand via-rose-600 to-brand px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-white shadow-md animate-pulse shrink-0">
              <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> New
            </span>

            {/* Gliding Event Line moving out of the slim white terminal cursor and disappearing before Register button */}
            <div className="relative flex min-w-0 flex-1 items-center overflow-hidden max-w-[185px] xs:max-w-[230px] sm:max-w-[360px] md:max-w-[440px] [mask-image:linear-gradient(to_right,rgba(0,0,0,1)_82%,rgba(0,0,0,0)_100%)]">
              <span className="inline-block h-3.5 w-[2px] bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.9)] mr-2 shrink-0 z-10" />
              <div className="whitespace-nowrap animate-cursor-ticker text-xs sm:text-sm text-white/85">
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
              <h1 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
                Build elite traders through{" "}
                <span className="text-brand">high-quality forex education</span>
              </h1>
              <p className="mt-4 sm:mt-6 max-w-xl text-base sm:text-lg text-white/75">
                We build elite traders through high-quality forex education, actionable
                market insights, and a results-driven mentorship system designed for real,
                consistent profitability.
              </p>

              <div className="mt-7 sm:mt-9 flex flex-nowrap items-center gap-2.5 sm:gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/courses")}
                  className="btn-primary flex-1 justify-center whitespace-nowrap !px-3.5 !py-2.5 !text-xs sm:flex-initial sm:!px-6 sm:!py-3.5 sm:!text-sm"
                >
                  Explore Courses <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/how-it-works")}
                  className="btn-ghost group flex-1 justify-center whitespace-nowrap !px-3.5 !py-2.5 !text-xs sm:flex-initial sm:!px-6 sm:!py-3.5 sm:!text-sm"
                >
                  <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 transition-transform group-hover:scale-110" />
                  Watch How It Works
                </button>
              </div>
            </div>

            {/* Live market-session clock (inline on desktop only; docked on mobile/tablet) */}
            <div className="hidden lg:flex lg:justify-end lg:translate-x-4 xl:translate-x-8">
              <MarketClock />
            </div>
          </div>

          {/* Stats strip + Mobile right-edge session docker aligned beside 40,000+ & 4.9/5 */}
          <div className="relative mt-10 sm:mt-14">
            <div className="grid max-w-3xl grid-cols-2 gap-4 pr-8 sm:pr-0 sm:gap-6 border-t border-white/10 pt-6 sm:pt-8 sm:grid-cols-4">
              {[
                { value: 4000, suffix: "+", label: "Students Trained" },
                { value: 40000, suffix: "+", label: "Telegram Members" },
                { value: 6, suffix: "+", label: "Years Experience" },
                { value: 4.9, suffix: "/5", label: "Avg. Rating", decimal: true },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-display text-2xl font-extrabold text-white sm:text-3xl md:text-4xl">
                    {s.decimal ? (
                      <span>
                        {s.value}
                        {s.suffix}
                      </span>
                    ) : (
                      <Counter end={s.value} suffix={s.suffix} />
                    )}
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-white/60">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Right-edge session clock docker positioned beside 40,000+ and 4.9/5 */}
            <MobileSessionDockTrigger
              open={clockOpen}
              visible={heroInView}
              onOpen={() => setClockOpen(true)}
            />
          </div>
        </div>
      </section>

      {/* Full-viewport expanded Market Sessions modal for mobile & tablet */}
      <MobileSessionDockModal
        open={clockOpen}
        onClose={() => setClockOpen(false)}
      />
    </>
  );
}
