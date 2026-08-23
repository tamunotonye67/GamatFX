import { useState } from "react";
import { Plus } from "lucide-react";
import { useReveal } from "../lib/useReveal";

const faqs = [
  {
    q: "Do I need any prior trading experience to join?",
    a: "Not at all. Our curriculum starts from absolute basics — what the forex market is, how it moves and why — before progressing into fundamentals, supply & demand and advanced execution. Experienced traders can skip ahead to the advanced modules.",
  },
  {
    q: "How much capital do I need to start trading?",
    a: "You can begin practising on a demo account with zero capital. When you go live, we recommend starting small and scaling only once you have demonstrated consistency for at least three months. Risk management is taught before position sizing.",
  },
  {
    q: "Are the classes online or physical?",
    a: "Both. Our courses are available fully online with lifetime access to recordings, and we also run physical mentorship classes and live trading sessions at our Port Harcourt academy.",
  },
  {
    q: "Do you sell trading signals?",
    a: "No. We deliberately do not run a paid signal service. Our goal is to make you independent — we teach analysis and share market breakdowns so you can make your own decisions with confidence.",
  },
  {
    q: "How long does it take to become profitable?",
    a: "It varies by individual, but most committed students spend three to six months building consistency on demo before trading live meaningfully. We focus on durable skill, not overnight results.",
  },
  {
    q: "What support do I get after the course ends?",
    a: "Lifetime access to course updates, our private trader community, weekly live sessions and periodic performance reviews. Your access does not expire when the cohort does.",
  },
];

/** Accordion FAQ matching the site's card styling. */
export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="section bg-cream">
      <div ref={ref} className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center">Questions</span>
          <h2 className="section-title mt-4">Frequently asked questions</h2>
          <p className="mt-4 text-muted">
            Everything you might want to know before joining the academy.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl space-y-4">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className={`reveal ${visible ? "is-visible" : ""} overflow-hidden rounded-2xl border bg-white shadow-[0_10px_40px_-25px_rgba(22,24,28,0.3)] transition-colors ${
                  isOpen ? "border-brand/40" : "border-line"
                }`}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                >
                  <span className="font-display text-base font-bold text-ink">
                    {f.q}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      isOpen
                        ? "rotate-45 bg-brand text-white"
                        : "bg-brand-light text-brand"
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-sm leading-relaxed text-muted">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
