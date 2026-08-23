import PageHero from "../components/PageHero";
import PageCta from "../components/PageCta";
import { useReveal } from "../lib/useReveal";
import { navigate } from "../lib/router";
import { SERVICES } from "../lib/services";
import {
  GraduationCap,
  Building2,
  Briefcase,
  Megaphone,
  ArrowUpRight,
  BadgeCheck,
  PhoneCall,
  FileSearch,
  Rocket,
  LifeBuoy,
} from "lucide-react";

const ICONS = { education: GraduationCap, consultancy: Building2, advisory: Briefcase, marketing: Megaphone };

const services = SERVICES.map((s) => ({
  slug: s.slug,
  icon: ICONS[s.icon],
  title: s.title,
  body: s.short,
  points: s.features.slice(0, 4).map((f) => f.title),
}));

const process = [
  { icon: PhoneCall, step: "01", title: "Discovery call", body: "We start by understanding your goals, audience and constraints — no templates, no assumptions." },
  { icon: FileSearch, step: "02", title: "Audit & proposal", body: "A clear written plan with scope, timeline, deliverables and transparent pricing." },
  { icon: Rocket, step: "03", title: "Build & launch", body: "We execute in agreed milestones, keeping you informed at every stage of delivery." },
  { icon: LifeBuoy, step: "04", title: "Support & optimise", body: "Post-launch support, training for your team and iterative improvements over time." },
];

const audiences = [
  { title: "Aspiring traders", body: "Individuals who want a structured, honest path into the markets." },
  { title: "Existing academies", body: "Institutions looking to professionalise their curriculum and operations." },
  { title: "Corporates & teams", body: "Organisations investing in financial literacy for their people." },
  { title: "Mentors & creators", body: "Educators who need the tech, brand and systems to scale." },
];

function ServiceList() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section className="section bg-white">
      <div ref={ref} className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center">What we offer</span>
          <h2 className="section-title mt-4">A comprehensive suite of services</h2>
          <p className="mt-4 text-muted">
            We stand as a committed partner for individuals and organizations seeking
            to enhance their financial literacy, business capabilities and digital
            presence.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {services.map((s, i) => (
            <div
              key={s.title}
              className={`card reveal ${visible ? "is-visible" : ""} flex flex-col`}
              style={{ transitionDelay: `${(i % 2) * 120}ms` }}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-ink">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{s.body}</p>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-xs text-ink/75">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {p}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => navigate(`/services/${s.slug}`)}
                className="btn-outline-dark mt-6 self-start"
              >
                Learn More <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Process() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section className="section bg-ink text-white">
      <div ref={ref} className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center text-brand-light">How we work</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold md:text-4xl">
            A simple, transparent process
          </h2>
          <p className="mt-4 text-white/65">
            Four clear stages from first conversation to long-term support.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {process.map((p, i) => (
            <div
              key={p.step}
              className={`reveal ${visible ? "is-visible" : ""} relative rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition hover:-translate-y-1 hover:border-brand/50`}
              style={{ transitionDelay: `${i * 110}ms` }}
            >
              <span className="absolute right-6 top-6 font-display text-4xl font-extrabold text-white/5">
                {p.step}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ServicesPage() {
  return (
    <>
      <PageHero
        crumb="Services"
        eyebrow="What we offer"
        image="/images/services.jpg"
        title={<>Services built around <span className="text-brand">your growth</span></>}
        subtitle="Beyond the classroom, we partner with individuals, academies and organizations to build financial literacy, capable teams and a credible digital presence."
      />

      <ServiceList />
      <Process />

      {/* Who we work with — image height matches the full partner-card column */}
      <section className="section bg-cream">
        <div className="container-x grid items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="relative min-h-[420px] overflow-hidden rounded-3xl shadow-xl lg:min-h-full">
            <img
              src="/images/services.jpg"
              alt="GAMAT Fx consultancy session"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
          </div>

          <div className="flex h-full flex-col">
            <span className="eyebrow">Who we work with</span>
            <h2 className="section-title mt-4">Partners at every stage</h2>
            <p className="mt-4 text-muted">
              Whether you are taking your first trade or scaling an entire academy, we
              have a service designed for where you are right now.
            </p>
            <div className="mt-8 grid flex-1 auto-rows-fr gap-4 sm:grid-cols-2">
              {audiences.map((a) => (
                <div key={a.title} className="flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-sm">
                  <h3 className="font-display text-base font-bold text-ink">{a.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm text-muted">{a.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PageCta
        tone="red"
        title="Let's build something together"
        body="Tell us what you're working on and we'll put together a clear, practical proposal."
        primaryLabel="Get in Touch"
        primaryTo="/events"
      />
    </>
  );
}
