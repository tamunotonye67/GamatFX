import PageHero from "../components/PageHero";
import PageCta from "../components/PageCta";
import MentorshipPricingSection from "../components/MentorshipPricingSection";
import Counter from "../components/Counter";
import { useReveal } from "../lib/useReveal";
import { navigate } from "../lib/router";
import {
  BookOpen, Users, Quote, CheckCircle2, ArrowUpRight,
  Target, LineChart, GraduationCap, Globe2, Mic2, ShieldCheck,
} from "lucide-react";

const milestones = [
  {
    year: "2018",
    title: "First live markets, first hard lessons",
    body: "Tonye S. Taylor began trading currencies full-time after years of studying price behaviour and macroeconomic drivers. Early losses forged a permanent respect for risk.",
  },
  {
    year: "2019–2020",
    title: "Process over prediction",
    body: "Developed a fundamentals-first framework combining supply and demand with structured risk rules — the backbone of every GAMAT curriculum today.",
  },
  {
    year: "2021",
    title: "From private mentoring to a public academy",
    body: "What started as one-to-one coaching for a handful of traders evolved into organised cohorts, recorded modules and a growing Port Harcourt community.",
  },
  {
    year: "2022–2023",
    title: "Curriculum, community and consistency",
    body: "Launched flagship programmes in fundamentals, price action and mentorship. The Telegram community crossed tens of thousands of members seeking education over signals.",
  },
  {
    year: "2024–2025",
    title: "Scaling honest education",
    body: "Expanded into academy consultancy, corporate training and digital support for traders — always with the same rule: teach people to think, never to copy blindly.",
  },
  {
    year: "2026",
    title: "GAMAT Fx Academy today",
    body: "Thousands of students trained, a multi-programme catalogue, live intakes in Port Harcourt and a desk that still publishes daily outlooks from the markets Tonye trades.",
  },
];

const credentials = [
  { icon: LineChart, title: "Active market practitioner", body: "Still trades live currencies, indices and crypto — and teaches only what is used on the desk." },
  { icon: GraduationCap, title: "Curriculum architect", body: "Designed GAMAT’s fundamentals, supply & demand, price action and mentorship programmes from the ground up." },
  { icon: Users, title: "Mentor to thousands", body: "Guided retail and aspiring professional traders across Africa and the diaspora through structured cohorts." },
  { icon: Mic2, title: "Public educator", body: "Regular live sessions, webinars and market breakdowns focused on process, not hype." },
  { icon: Globe2, title: "Community builder", body: "Grew a free education-first Telegram community known for analysis over signal-selling." },
  { icon: ShieldCheck, title: "Integrity-first brand", body: "No account management, no guaranteed profits — only transparent, rules-based education." },
];

const focus = [
  "Forex fundamentals & central-bank driven bias",
  "Institutional supply and demand mapping",
  "Price action, liquidity and market structure",
  "Risk, expectancy and drawdown control",
  "Trader psychology and journaling systems",
  "Prop-firm evaluation discipline",
];

export default function MentorPage() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <>
      <PageHero
        crumb="About the Mentor"
        eyebrow="Tonye S. Taylor"
        image="/images/founder.jpg"
        title={<>Founder & Lead Mentor of <span className="text-brand">GAMAT Fx Academy</span></>}
        subtitle="Trader, educator and curriculum designer building disciplined, independent traders through high-quality forex education and results-driven mentorship."
      />

      {/* Profile strip */}
      <section className="border-b border-line bg-white py-12">
        <div className="container-x grid items-center gap-10 lg:grid-cols-[280px_1fr]">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-3xl shadow-xl">
            <img
              src="/images/founder.jpg"
              alt="Tonye S. Taylor, Founder and Lead Mentor at GAMAT Fx Academy"
              className="h-full w-full object-cover object-[center_18%]"
            />
          </div>
          <div>
            <span className="eyebrow">Founder profile</span>
            <h2 className="section-title mt-3">Tonye S. Taylor</h2>
            <p className="mt-2 font-semibold text-brand">Founder & Lead Mentor · Port Harcourt, Nigeria</p>
            <p className="mt-4 max-w-2xl text-muted">
              Tonye S. Taylor is the founder of GAMAT Fx Academy and the architect of its
              education system. His work centres on teaching traders to read fundamentals,
              map institutional supply and demand, and execute with professional risk
              management — so they can stand on their own long after the course ends.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { end: 6, suffix: "+", label: "Years trading" },
                { end: 4000, suffix: "+", label: "Traders mentored" },
                { end: 12, suffix: "", label: "Programmes built" },
                { end: 40, suffix: "K+", label: "Community reach" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-line bg-cream p-4 text-center">
                  <div className="font-display text-2xl font-extrabold text-ink">
                    <Counter end={s.end} suffix={s.suffix} />
                  </div>
                  <p className="mt-1 text-xs text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bio + focus */}
      <section className="section bg-cream">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Biography</span>
            <h2 className="section-title mt-4">A career built on process, not promises</h2>
            <div className="mt-5 space-y-4 text-muted">
              <p>
                Tonye S. Taylor entered the financial markets with a simple frustration:
                most retail education sold excitement instead of skill. He spent years
                refining a method that starts with macroeconomic bias, maps where
                institutions leave orders, and only then looks for precise technical
                execution.
              </p>
              <p>
                That method became the foundation of GAMAT Fx Academy — an education brand
                based in Port Harcourt, Nigeria, now known for fundamentals, supply and
                demand, and mentorship that holds traders accountable to their own journals.
              </p>
              <p>
                Beyond the classroom, Tonye continues to trade live markets, publish desk
                commentary and design programmes for individuals, academies and corporate
                teams seeking serious financial literacy rather than shortcuts.
              </p>
            </div>
            <Quote className="mt-8 h-8 w-8 text-brand" />
            <p className="mt-3 text-lg font-medium leading-relaxed text-ink">
              “We measure success by whether our students can trade profitably without us.”
            </p>
          </div>

          <div className="rounded-3xl border border-line bg-white p-8 shadow-sm">
            <h3 className="font-display text-xl font-bold text-ink">Areas of expertise</h3>
            <ul className="mt-6 space-y-3">
              {focus.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-ink/80">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {f}
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => navigate("/courses")} className="btn-primary mt-8">
              Explore his courses <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="section bg-white">
        <div ref={ref} className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">Why traders follow Tonye</span>
            <h2 className="section-title mt-4">Credentials that matter in the market</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {credentials.map((c, i) => (
              <div key={c.title} className={`card reveal ${visible ? "is-visible" : ""}`} style={{ transitionDelay: `${(i % 3) * 90}ms` }}>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
                  <c.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-ink">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section bg-cream">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">Career milestones</span>
            <h2 className="section-title mt-4">The journey behind GAMAT Fx Academy</h2>
            <p className="mt-4 text-muted">
              A public record of how Tonye S. Taylor built an education brand around
              integrity, process and real market experience.
            </p>
          </div>

          <ol className="relative mx-auto mt-14 max-w-3xl space-y-6">
            <span aria-hidden className="absolute bottom-2 left-[19px] top-2 w-px bg-line md:left-1/2 md:-translate-x-1/2" />
            {milestones.map((m, i) => {
              const right = i % 2 === 1;
              return (
                <li key={m.year} className="relative pl-14 md:pl-0">
                  <span className="absolute left-0 top-5 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-brand text-[10px] font-bold text-white shadow-md md:left-1/2 md:-translate-x-1/2">
                    {m.year.slice(2, 4)}
                  </span>
                  <div className={`md:w-[calc(50%-2.5rem)] ${right ? "md:ml-auto" : "md:mr-auto"}`}>
                    <div className="card !p-6">
                      <span className="font-display text-sm font-extrabold uppercase tracking-widest text-brand">{m.year}</span>
                      <h3 className="mt-2 font-display text-lg font-bold text-ink">{m.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{m.body}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* SEO / about block */}
      <section className="section bg-white">
        <div className="container-x mx-auto max-w-3xl">
          <div className="rounded-3xl border border-line bg-cream p-8 md:p-10">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-brand" />
              <h2 className="font-display text-2xl font-extrabold text-ink">About Tonye S. Taylor</h2>
            </div>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted">
              <p>
                <strong className="text-ink">Tonye S. Taylor</strong> is a Nigerian forex
                educator, market analyst and the founder of{" "}
                <strong className="text-ink">GAMAT Fx Academy</strong> in Port Harcourt.
                He is known for teaching forex fundamentals, supply and demand, price action
                and professional risk management to retail traders who want lasting skill
                rather than short-term signals.
              </p>
              <p>
                Under his leadership, GAMAT Fx Academy has trained thousands of students,
                built a large free trading community and developed programmes covering
                beginner foundations through advanced mentorship and prop-firm preparation.
                Tonye also advises academies and organisations on curriculum design,
                trading education systems and financial literacy training.
              </p>
              <p>
                Media and partnership enquiries: use the contact page or reach the academy
                desk directly. Students can learn from Tonye through live intakes, online
                courses and the official GAMAT community channels.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => navigate("/courses")} className="btn-primary">
                <BookOpen className="h-4 w-4" /> View courses
              </button>
              <button type="button" onClick={() => navigate("/contact")} className="btn-outline-dark">
                Contact the academy
              </button>
              <button type="button" onClick={() => navigate("/about")} className="btn-outline-dark">
                Back to About Us
              </button>
            </div>
          </div>
        </div>
      </section>

      <MentorshipPricingSection />

      <PageCta
        tone="red"
        title="Learn directly from Tonye’s curriculum"
        body="Start with the flagship fundamentals programme or join the next mentorship intake in Port Harcourt."
        primaryLabel="Browse Courses"
        primaryTo="/courses"
      />
    </>
  );
}
