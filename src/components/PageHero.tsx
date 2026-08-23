import { ChevronRight } from "lucide-react";
import { navigate } from "../lib/router";

type PageHeroProps = {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  image: string;
  crumb: string;
};

/** Compact inner-page hero that matches the home page hero treatment. */
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  crumb,
}: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img src={image} alt="" aria-hidden="true" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/95 via-ink/88 to-[#0c0d10]/92" />
        <div className="absolute inset-0 bg-[radial-gradient(55%_55%_at_85%_15%,rgba(220,53,69,0.35),transparent_60%)]" />
      </div>

      <div className="container-x pb-20 pt-36 text-white md:pb-28 md:pt-44">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-white/55">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="transition hover:text-white"
          >
            Home
          </button>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-brand-light">{crumb}</span>
        </nav>

        <span className="eyebrow text-brand-light">{eyebrow}</span>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-white/75">{subtitle}</p>
      </div>
    </section>
  );
}
