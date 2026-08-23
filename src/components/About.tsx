import { useReveal } from "../lib/useReveal";
import Counter from "./Counter";
import { Award, Users, BookOpen } from "lucide-react";

const stats = [
  { icon: Award, end: 6, suffix: "+", label: "Years Trading Experience" },
  { icon: Users, end: 4000, suffix: "+", label: "Students Trained" },
  { icon: BookOpen, end: 12, label: "Courses & Programs" },
];

export default function About() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="about" className="section bg-cream">
      <div ref={ref} className="container-x grid items-center gap-14 lg:grid-cols-2">
        {/* Copy + stats */}
        <div className={`reveal ${visible ? "is-visible" : ""}`}>
          <span className="eyebrow">Why learn from us</span>
          <h2 className="section-title mt-4">
            Why learn from us as a{" "}
            <span className="text-brand">forex trading academy</span>
          </h2>
          <p className="mt-5 max-w-xl text-muted">
            We provide in-depth and practical training programs designed to equip
            individuals with the knowledge and skills required to navigate the
            complexities of the foreign exchange market — and trade with confidence.
          </p>

          <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-line bg-white p-5 shadow-[0_10px_40px_-22px_rgba(22,24,28,0.25)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <s.icon className="h-5 w-5" />
                </span>
                <div className="mt-4 font-display text-3xl font-extrabold text-ink">
                  <Counter end={s.end} suffix={s.suffix} />
                </div>
                <p className="mt-1 text-sm font-medium text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Imagery */}
        <div className="grid grid-cols-2 gap-4">
          <img
            src="/images/about.jpg"
            alt="GAMAT Fx Academy students graduating"
            className="h-full w-full rounded-3xl object-cover shadow-lg"
          />
          <div className="flex flex-col gap-4">
            <div className="rounded-3xl bg-ink p-7 text-white shadow-lg">
              <p className="font-display text-2xl font-extrabold leading-snug">
                “We don't just teach trading — we build{" "}
                <span className="text-brand">disciplined, profitable traders.</span>”
              </p>
              <p className="mt-4 text-sm text-white/60">— GAMAT Fx Academy</p>
            </div>
            <div className="flex-1 rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-7 text-white shadow-lg">
              <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
                Mentorship first
              </p>
              <p className="mt-2 font-display text-xl font-bold leading-snug">
                Real market insights. Real accountability. Real results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
