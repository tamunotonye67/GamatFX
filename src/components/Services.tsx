import { useReveal } from "../lib/useReveal";
import { ArrowUpRight, GraduationCap, Building2, Briefcase, Megaphone } from "lucide-react";
import { navigate } from "../lib/router";
import ServiceGallery from "./ServiceGallery";

const services = [
  {
    icon: GraduationCap,
    title: "Forex Trading Education",
    body: "In-depth, practical training programs designed to equip individuals with the skills to navigate the forex market.",
  },
  {
    icon: Building2,
    title: "Academy Setup & Mgt. Consultancy",
    body: "Curriculum design, infrastructure planning and operational strategy for new and growing academies.",
  },
  {
    icon: Briefcase,
    title: "Business Training & Advisory",
    body: "Tailored training programs and advisory services to strengthen business acumen and operations.",
  },
  {
    icon: Megaphone,
    title: "Digital Marketing & Tech Support",
    body: "A strong online presence, funnels and reliable tech support built specifically for traders and mentors.",
  },
];

export default function Services() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="services" className="section bg-cream">
      <div ref={ref} className="container-x grid items-center gap-12 lg:grid-cols-2">
        {/* No `reveal` here — its transform would create a containing block
            and break the gallery's absolutely-positioned layers. */}
        <div className="flex justify-center lg:justify-start">
          <ServiceGallery />
        </div>

        <div className={`reveal ${visible ? "is-visible" : ""}`}>
          <span className="eyebrow">What we offer</span>
          <h2 className="section-title mt-4">Services</h2>
          <p className="mt-4 text-muted">
            A comprehensive suite of services designed to cater to a wide range of
            needs — for individuals and organizations alike.
          </p>

          <div className="mt-8 space-y-4">
            {services.map((s, i) => (
              <div
                key={s.title}
                className={`card reveal ${visible ? "is-visible" : ""} !flex !flex-row !items-start !gap-4 !p-5`}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="font-display text-base font-bold text-ink">
                    {s.title}
                  </h4>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate("/services")}
            className="btn-outline-dark mt-8"
          >
            See More <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
