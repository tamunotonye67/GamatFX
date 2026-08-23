import { ArrowUpRight, Send, Mail, MapPin, Phone, AlertTriangle } from "lucide-react";
import Logo from "./Logo";
import { navigate, type Route } from "../lib/router";
import { CONTACT } from "../lib/contact";

type FooterItem = { label: string; to: Route };

const footerLinks: { title: string; items: FooterItem[] }[] = [
  {
    title: "Academy",
    items: [
      { label: "Home", to: "/" },
      { label: "About Us", to: "/about" },
      { label: "About the Team", to: "/team" },
      { label: "Courses", to: "/courses" },
      { label: "Services", to: "/services" },
    ],
  },
  {
    title: "Community",
    items: [
      { label: "Student Forum", to: "/forum" },
      { label: "Fun Zone & Games", to: "/fun" },
      { label: "News Events", to: "/news" },
      { label: "Daily Outlook", to: "/outlook" },
      { label: "Giveaways", to: "/giveaways" },
      { label: "Blog", to: "/blog" },
      { label: "Telegram Community", to: "/community" },
      { label: "Reviews", to: "/reviews" },
      { label: "Events & Intakes", to: "/events" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "How It Works", to: "/how-it-works" },
      { label: "FAQ", to: "/faq" },
      { label: "Contact Us", to: "/contact" },
      { label: "Login / Sign Up", to: "/login" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      {/* Final CTA */}
      <div className="container-x py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-dark px-8 py-14 text-center shadow-xl md:px-16">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold leading-tight md:text-4xl">
              Ready to become a consistently profitable trader?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/85">
              Join thousands of traders learning, growing, and winning with GAMAT Fx
              Academy. Your journey starts today.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/courses")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Get Started <ArrowUpRight className="h-4 w-4" />
              </button>
              <a
                href={CONTACT.telegram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                <Send className="h-4 w-4" /> Join Telegram
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer body */}
      <div className="border-t border-white/10">
        <div className="container-x grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo variant="light" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              A hub for financial education and digital empowerment — building elite
              traders through high-quality forex education and results-driven
              mentorship.
            </p>
            <div className="mt-6 space-y-3 text-sm text-white/70">
              <p className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-brand-light" />
                <span>{CONTACT.city}</span>
              </p>
              <p className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-brand-light" />
                <a href={`mailto:${CONTACT.email}`} className="transition hover:text-white">{CONTACT.email}</a>
              </p>
              <p className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-brand-light" />
                <a href={CONTACT.phoneHref} className="transition hover:text-white">{CONTACT.phone}</a>
              </p>
            </div>
          </div>

          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white/90">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.items.map((item) => (
                  <li key={`${col.title}-${item.label}`}>
                    <button
                      type="button"
                      onClick={() => navigate(item.to)}
                      className="text-left text-sm text-white/60 transition hover:text-brand-light"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Risk disclaimer */}
        <div className="container-x border-t border-white/10 py-8">
          <div className="flex gap-4 rounded-2xl border border-brand/25 bg-brand/10 p-5">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brand-light" />
            <div className="text-xs leading-relaxed text-white/60">
              <p className="font-bold uppercase tracking-wide text-white/85">
                Risk disclaimer
              </p>
              <p className="mt-2">
                Trading foreign exchange, CFDs, cryptocurrencies and synthetic indices carries a
                high level of risk and may not be suitable for every investor. Leverage can work
                against you as well as for you. You could sustain a total loss of your deposited
                funds and should never trade with money you cannot afford to lose.
              </p>
              <p className="mt-2">
                All content published by GAMAT Fx Academy — including courses, live sessions,
                market commentary, articles and games — is strictly{" "}
                <strong className="text-white/85">educational</strong> and does not constitute
                financial, investment, tax or legal advice. We do not manage funds on behalf of
                students and we do not sell trading signals. Past performance is never indicative
                of future results. Any prices shown in our simulators are fictional and are not
                live market data.
              </p>
              <p className="mt-2">
                You are solely responsible for your own trading decisions. Please read our{" "}
                <button type="button" onClick={() => navigate("/terms")} className="font-semibold text-brand-light underline underline-offset-2 hover:text-white">
                  Terms of Service
                </button>{" "}
                and{" "}
                <button type="button" onClick={() => navigate("/privacy")} className="font-semibold text-brand-light underline underline-offset-2 hover:text-white">
                  Privacy Policy
                </button>{" "}
                before using our services.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="container-x flex flex-col items-center justify-between gap-4 border-t border-white/10 py-7 text-sm text-white/50 sm:flex-row">
          <p className="text-center text-sm text-white/55 sm:text-left">
            Copyright © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-white/80">GAMAT Fx Academy</span>
            {" · "}All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <button type="button" onClick={() => navigate("/privacy")} className="transition hover:text-white">
              Privacy
            </button>
            <button type="button" onClick={() => navigate("/terms")} className="transition hover:text-white">
              Terms
            </button>
            <button type="button" onClick={() => navigate("/contact")} className="transition hover:text-white">
              Contact
            </button>
            <a
              href={CONTACT.telegram}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              Telegram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
