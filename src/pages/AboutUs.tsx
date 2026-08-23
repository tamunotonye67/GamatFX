import PageHero from "../components/PageHero";
import Pillars from "../components/Pillars";
import Counter from "../components/Counter";
import Timeline from "../components/Timeline";
import Faq from "../components/Faq";
import { useReveal } from "../lib/useReveal";
import { navigate } from "../lib/router";
import { CONTACT } from "../lib/contact";
import { useStore } from "../lib/store";
import {
  ArrowUpRight,
  BadgeCheck,
  BookOpenCheck,
  BrainCircuit,
  LineChart,
  Quote,
  ShieldCheck,
  Users,
  Send,
} from "lucide-react";

/* ---------------------------------- Story --------------------------------- */

function Story() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="section bg-cream">
      <div ref={ref} className="container-x grid items-center gap-14 lg:grid-cols-2">
        <div className={`reveal ${visible ? "is-visible" : ""}`}>
          <span className="eyebrow">Our story</span>
          <h2 className="section-title mt-4">
            Built by traders, <span className="text-brand">for traders</span>
          </h2>
          <div className="mt-5 space-y-4 text-muted">
            <p>
              GAMAT Fx Academy began with a simple frustration: too many aspiring
              traders were losing money to hype, signal-selling and shallow
              &ldquo;get-rich-quick&rdquo; content. What the market lacked was a place
              that taught traders to actually <em>think</em> — to read fundamentals,
              understand institutional order flow, and manage risk like professionals.
            </p>
            <p>
              So we built one. What started as a small mentorship circle has grown into
              a full academy training thousands of students and supporting a community
              of over 40,000 traders across Africa and beyond.
            </p>
            <p>
              Today we are a hub for financial education and digital empowerment —
              combining structured curricula, live market sessions and a
              results-driven mentorship system that holds every trader accountable to
              their own growth.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {["Fundamentals-first", "Risk-led", "Mentorship-driven", "Community-backed"].map(
              (t) => (
                <span key={t} className="chip">
                  <BadgeCheck className="h-3.5 w-3.5" /> {t}
                </span>
              )
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <img
            src="/images/about.jpg"
            alt="GAMAT Fx Academy students"
            className="col-span-2 h-64 w-full rounded-3xl object-cover shadow-lg"
          />
          {[
            { end: 4000, suffix: "+", label: "Students trained" },
            { end: 40000, suffix: "+", label: "Community members" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-3xl border border-line bg-white p-6 shadow-[0_14px_45px_-25px_rgba(22,24,28,0.3)]"
            >
              <div className="font-display text-3xl font-extrabold text-ink">
                <Counter end={s.end} suffix={s.suffix} />
              </div>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Founder -------------------------------- */

function Founder() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="section bg-ink text-white">
      <div ref={ref} className="container-x grid items-stretch gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
        {/* Portrait — fixed aspect so it aligns cleanly with the copy column */}
        <div className="relative min-h-[420px] overflow-hidden rounded-3xl shadow-2xl lg:min-h-full">
          <img
            src="/images/founder.jpg"
            alt="Tonye S. Taylor — Founder & Lead Mentor of GAMAT Fx Academy"
            className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/70 to-transparent p-6">
            <p className="font-display text-lg font-bold">Tonye S. Taylor</p>
            <p className="text-sm text-brand-light">Founder &amp; Lead Mentor</p>
          </div>
        </div>

        <div className={`reveal flex flex-col justify-center ${visible ? "is-visible" : ""}`}>
          <span className="eyebrow text-brand-light">Meet the founder</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight md:text-4xl">
            A mentor who still trades the markets he teaches
          </h2>
          <Quote className="mt-6 h-8 w-8 text-brand" />
          <p className="mt-3 text-lg leading-relaxed text-white/75">
            &ldquo;I never wanted to build another signal group. I wanted to build
            traders who could stand on their own — people who understand
            <span className="text-white"> why </span>
            price moves, not just where to click. That is the whole point of
            GAMAT.&rdquo;
          </p>
          <p className="mt-5 text-sm leading-relaxed text-white/60">
            With over six years navigating currencies, indices and crypto through
            multiple market cycles, Tonye S. Taylor has mentored thousands of traders and
            built a curriculum grounded in fundamentals, supply &amp; demand, and
            disciplined risk management.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-6 border-t border-white/10 pt-6">
            {[
              { end: 6, suffix: "+", label: "Years trading" },
              { end: 12, suffix: "", label: "Programs built" },
              { end: 4000, suffix: "+", label: "Traders mentored" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-2xl font-extrabold">
                  <Counter end={s.end} suffix={s.suffix} />
                </div>
                <p className="mt-1 text-xs text-white/55">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button type="button" onClick={() => navigate("/mentor")} className="btn-primary">
              Full mentor profile <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Approach -------------------------------- */

const approach = [
  {
    icon: BookOpenCheck,
    step: "01",
    title: "Learn the foundation",
    body: "Structured lessons on market fundamentals, supply & demand and price structure — no fluff, no shortcuts.",
  },
  {
    icon: LineChart,
    step: "02",
    title: "Apply in live markets",
    body: "Weekly live sessions where we break down real setups, news events and trade management in real time.",
  },
  {
    icon: BrainCircuit,
    step: "03",
    title: "Build the mindset",
    body: "Psychology, journaling and routine coaching that turn knowledge into consistent, repeatable execution.",
  },
  {
    icon: ShieldCheck,
    step: "04",
    title: "Trade with accountability",
    body: "Personal reviews, performance tracking and a private community that keeps your discipline honest.",
  },
];

function Approach() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="section bg-white">
      <div ref={ref} className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center">How we teach</span>
          <h2 className="section-title mt-4">Our four-step approach</h2>
          <p className="mt-4 text-muted">
            A deliberate path from complete beginner to accountable, self-sufficient
            trader.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {approach.map((a, i) => (
            <div
              key={a.step}
              className={`card reveal ${visible ? "is-visible" : ""} relative`}
              style={{ transitionDelay: `${i * 110}ms` }}
            >
              <span className="absolute right-6 top-6 font-display text-4xl font-extrabold text-brand/10">
                {a.step}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
                <a.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-ink">
                {a.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{a.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- Team ---------------------------------- */

function Team() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const { publishedTeam } = useStore();

  return (
    <section id="team" className="section bg-cream">
      <div ref={ref} className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center">About the Team</span>
          <h2 className="section-title mt-4">Meet the team behind GAMAT</h2>
          <p className="mt-4 text-muted">
            Active traders, educators and mentors committed to your growth. Click a profile for the full story.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {publishedTeam.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => navigate(`/team/${m.slug}`)}
              className={`card reveal ${visible ? "is-visible" : ""} text-center transition hover:-translate-y-1`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {m.avatar ? (
                <img src={m.avatar} alt={m.name} className="mx-auto h-16 w-16 rounded-full object-cover ring-4 ring-brand/15" />
              ) : (
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark font-display text-lg font-extrabold text-white shadow-md">
                  {m.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </span>
              )}
              <h3 className="mt-4 font-display text-base font-bold text-ink">{m.name}</h3>
              <p className="mt-1 text-sm font-medium text-brand">{m.role}</p>
              <p className="mt-2 text-xs text-muted">{m.focus}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand">
                View profile <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </button>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button type="button" onClick={() => navigate("/team")} className="btn-outline-dark">
            About the Team — full directory
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Why choose ------------------------------- */

const reasons = [
  "Fundamentals-first curriculum, not recycled indicator strategies",
  "Live market breakdowns every single week",
  "Personal performance reviews and trade journaling support",
  "A 40,000+ strong community of accountable traders",
  "Mentors who actively trade the markets they teach",
  "Lifetime access to course updates and replays",
];

function WhyChoose() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="section bg-white">
      <div ref={ref} className="container-x grid items-center gap-12 lg:grid-cols-2">
        <div className={`reveal ${visible ? "is-visible" : ""}`}>
          <span className="eyebrow">The difference</span>
          <h2 className="section-title mt-4">Why traders choose GAMAT Fx Academy</h2>
          <p className="mt-4 text-muted">
            We measure our success by one thing only — whether our students can trade
            profitably without us.
          </p>

          <ul className="mt-8 space-y-4">
            {reasons.map((r) => (
              <li key={r} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
                  <BadgeCheck className="h-4 w-4" />
                </span>
                <span className="text-sm leading-relaxed text-ink/80">{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-9 text-white shadow-xl">
          <Users className="h-9 w-9" />
          <h3 className="mt-5 font-display text-2xl font-extrabold leading-snug">
            You are never trading alone
          </h3>
          <p className="mt-3 text-white/85">
            Every GAMAT student joins a private network of traders sharing analysis,
            reviewing each other's journals and growing together — long after the
            course ends.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/courses")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand transition hover:-translate-y-0.5 hover:shadow-md"
            >
              View Courses <ArrowUpRight className="h-4 w-4" />
            </button>
            <a
              href={CONTACT.telegram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              <Send className="h-4 w-4" /> Join Telegram
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- Page ---------------------------------- */

export default function AboutUs() {
  return (
    <>
      <PageHero
        crumb="About Us"
        eyebrow="About GAMAT Fx Academy"
        image="/images/about-hero.jpg"
        title={
          <>
            A hub for financial education and{" "}
            <span className="text-brand">digital empowerment</span>
          </>
        }
        subtitle="We exist to turn ambitious beginners into disciplined, consistently profitable traders — through honest education, live market mentorship and a community that holds you accountable."
      />

      <Story />
      <Pillars />
      <Founder />
      <Approach />
      <Timeline />
      <Team />
      <WhyChoose />
      <Faq />

      {/* Closing CTA */}
      <section className="bg-cream pb-24">
        <div className="container-x">
          <div className="rounded-3xl border border-line bg-white px-8 py-14 text-center shadow-[0_22px_60px_-32px_rgba(22,24,28,0.4)]">
            <h2 className="section-title mx-auto max-w-2xl">
              Ready to start your trading journey with us?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Join the next mentorship intake and learn the exact framework our
              students use to trade the markets with confidence.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/events")}
                className="btn-primary"
              >
                Register for Next Class <ArrowUpRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="btn-outline-dark"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
