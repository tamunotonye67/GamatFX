import { ArrowUpRight, Send } from "lucide-react";
import { navigate, type Route } from "../lib/router";
import { CONTACT } from "../lib/contact";

type PageCtaProps = {
  title: string;
  body: string;
  primaryLabel: string;
  primaryTo: Route;
  tone?: "light" | "red";
};

/** Closing call-to-action block shared by all inner pages. */
export default function PageCta({
  title,
  body,
  primaryLabel,
  primaryTo,
  tone = "light",
}: PageCtaProps) {
  const red = tone === "red";

  return (
    <section className={`pb-24 ${red ? "bg-white" : "bg-cream"}`}>
      <div className="container-x">
        <div
          className={`relative overflow-hidden rounded-3xl px-8 py-14 text-center shadow-[0_22px_60px_-32px_rgba(22,24,28,0.4)] ${
            red
              ? "bg-gradient-to-br from-brand to-brand-dark text-white"
              : "border border-line bg-white"
          }`}
        >
          {red && (
            <>
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
              <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10" />
            </>
          )}

          <div className="relative">
            <h2
              className={`mx-auto max-w-2xl font-display text-3xl font-extrabold leading-tight md:text-4xl ${
                red ? "text-white" : "text-ink"
              }`}
            >
              {title}
            </h2>
            <p
              className={`mx-auto mt-4 max-w-xl ${
                red ? "text-white/85" : "text-muted"
              }`}
            >
              {body}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate(primaryTo)}
                className={
                  red
                    ? "inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand transition hover:-translate-y-0.5 hover:shadow-md"
                    : "btn-primary"
                }
              >
                {primaryLabel} <ArrowUpRight className="h-4 w-4" />
              </button>
              <a
                href={CONTACT.telegram}
                target="_blank"
                rel="noreferrer"
                className={
                  red
                    ? "inline-flex items-center justify-center gap-2 rounded-full border border-white/35 px-7 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
                    : "btn-outline-dark"
                }
              >
                <Send className="h-4 w-4" /> Join Telegram
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
