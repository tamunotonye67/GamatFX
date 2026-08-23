import { useReveal } from "../lib/useReveal";
import { Target, Eye, HeartHandshake } from "lucide-react";

const pillars = [
  {
    icon: Target,
    title: "Our Mission",
    body: "To equip traders with the knowledge, mindset, and confidence to consistently win in the global financial markets through high-quality forex education and results-driven mentorship.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    body: "To become the most respected and result-oriented forex academy — setting the gold standard for trading excellence and professional mentorship across Africa and beyond.",
  },
  {
    icon: HeartHandshake,
    title: "Our Values",
    body: "Empowerment — equipping clients with the tools to trade confidently. Integrity — transparency and fairness in everything we do. Excellence — a relentless pursuit of better outcomes.",
  },
];

export default function Pillars() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="section bg-white">
      <div ref={ref} className="container-x">
        <div className="max-w-2xl">
          <span className="eyebrow">Who we are</span>
          <h2 className="section-title mt-4">Mission, vision &amp; values</h2>
          <p className="mt-4 text-muted">
            Everything we do is anchored in a clear purpose and a set of values that
            put our traders first.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map((p, i) => (
            <div
              key={p.title}
              className={`card reveal ${visible ? "is-visible" : ""}`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
                <p.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-ink">
                {p.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
