import { useReveal } from "../lib/useReveal";

const milestones = [
  {
    year: "2019",
    title: "The first mentorship circle",
    body: "A handful of traders meeting weekly to study fundamentals and review live charts together.",
  },
  {
    year: "2021",
    title: "GAMAT Fx Academy is founded",
    body: "The mentorship circle becomes a structured academy with a formal curriculum and its first paid cohort.",
  },
  {
    year: "2023",
    title: "Community crosses 10,000 traders",
    body: "Our Telegram channel becomes one of the most active free forex education communities in the region.",
  },
  {
    year: "2024",
    title: "Physical academy opens in Port Harcourt",
    body: "In-person classes launch, combining classroom teaching with live trading floor experience.",
  },
  {
    year: "2026",
    title: "4,000+ students & 40,000+ members",
    body: "GAMAT expands into consultancy, business advisory and digital support for traders and academies.",
  },
];

/** Vertical milestone timeline styled to match the home page cards. */
export default function Timeline() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="section bg-white">
      <div ref={ref} className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center">Our journey</span>
          <h2 className="section-title mt-4">Milestones that shaped us</h2>
          <p className="mt-4 text-muted">
            From a small study group to one of the most trusted forex academies in the
            region.
          </p>
        </div>

        <div className="relative mx-auto mt-14 max-w-3xl">
          {/* spine */}
          <span
            aria-hidden="true"
            className="absolute left-[19px] top-2 bottom-2 w-px bg-line md:left-1/2 md:-translate-x-1/2"
          />

          <ol className="space-y-8">
            {milestones.map((m, i) => {
              const right = i % 2 === 1;
              return (
                <li
                  key={m.year}
                  className={`reveal ${visible ? "is-visible" : ""} relative pl-14 md:pl-0`}
                  style={{ transitionDelay: `${i * 110}ms` }}
                >
                  {/* dot */}
                  <span className="absolute left-0 top-5 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-brand text-[11px] font-bold text-white shadow-md md:left-1/2 md:-translate-x-1/2">
                    {m.year.slice(2)}
                  </span>

                  <div
                    className={`md:w-[calc(50%-2.5rem)] ${
                      right ? "md:ml-auto" : "md:mr-auto"
                    }`}
                  >
                    <div className="card !p-6">
                      <span className="font-display text-sm font-extrabold uppercase tracking-widest text-brand">
                        {m.year}
                      </span>
                      <h3 className="mt-2 font-display text-lg font-bold text-ink">
                        {m.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {m.body}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
