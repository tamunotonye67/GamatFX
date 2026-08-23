import { useEffect, useState } from "react";
import PageHero from "../components/PageHero";
import PageCta from "../components/PageCta";
import { navigate } from "../lib/router";
import { AlertTriangle, ChevronRight, Printer, ArrowUp, FileText, ShieldCheck } from "lucide-react";

type Section = { heading: string; body: string[] };

const slugify = (s: string) => s.toLowerCase().replace(/^\d+\.\s*/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ------------------------------- Content ------------------------------- */

const termsSections: Section[] = [
  { heading: "1. Acceptance of terms", body: ["By accessing or using the GAMAT Fx Academy website, courses, community channels or any related service, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you should not use our services."] },
  { heading: "2. Educational purpose only", body: ["All content provided by GAMAT Fx Academy is strictly educational. Nothing we publish, teach, stream or share constitutes financial, investment, tax or legal advice.", "We do not manage funds on behalf of students, and we do not sell trading signals. Any market analysis we share is for illustration and teaching purposes only."] },
  { heading: "3. Risk disclosure", body: ["Trading foreign exchange, CFDs, cryptocurrencies and synthetic indices carries a high level of risk and may not be suitable for every investor. Leverage can work against you as well as for you.", "You could sustain a total loss of your deposited funds and should not trade with money you cannot afford to lose. Past performance is never indicative of future results."] },
  { heading: "4. Enrollment and access", body: ["Course access is granted to a single named individual. Sharing login credentials, redistributing course materials, or reselling any part of our content is strictly prohibited and will result in immediate termination without refund.", "Where lifetime access is offered, it refers to the operational lifetime of the course on our platform."] },
  { heading: "5. Payments and refunds", body: [
    "All fees are quoted in Nigerian Naira (₦) unless otherwise stated and are payable in advance. Because our content is digital and delivered immediately, enrollments are generally non-refundable.",
    "There is no automated self-service refund button in the student dashboard. Any refund, if granted at all, is processed manually by the academy after you contact us and we review your case.",
    "If you have not accessed any course material within seven (7) days of purchase, email hello@gamatfxacademy.com or message us on WhatsApp to request a manual review. Approved refunds are issued by the admin team only and may take several business days.",
    "Chargebacks initiated without first contacting us may result in permanent suspension of your account and community access.",
  ] },
  { heading: "6. Community conduct", body: ["Our community channels are strictly moderated. Signal selling, account management offers, referral spam, unsolicited direct messages, harassment and guaranteed-profit claims are prohibited.", "We reserve the right to remove any member who breaches these standards without notice or refund."] },
  { heading: "7. Intellectual property", body: ["All course materials, videos, workbooks, templates, branding and written content remain the intellectual property of GAMAT Fx Academy. You may not reproduce, distribute or create derivative works without our prior written consent."] },
  { heading: "8. Limitation of liability", body: ["To the fullest extent permitted by law, GAMAT Fx Academy shall not be liable for any trading losses, lost profits, or any indirect, incidental or consequential damages arising from your use of our services or reliance on our educational content."] },
  { heading: "9. Changes to these terms", body: ["We may update these Terms of Service from time to time. Continued use of our services after any update constitutes acceptance of the revised terms."] },
  { heading: "10. Contact", body: ["Questions about these terms can be directed to hello@gamatfxacademy.com."] },
];

const privacySections: Section[] = [
  { heading: "1. Introduction", body: ["GAMAT Fx Academy respects your privacy and is committed to protecting your personal data. This policy explains what information we collect, why we collect it, and how we handle it."] },
  { heading: "2. Information we collect", body: ["Information you give us: your name, email address, phone number, country and any details you submit through our enrollment, registration or contact forms.", "Information collected automatically: basic analytics such as pages visited, device type and approximate location, used only to improve the website experience."] },
  { heading: "3. How we use your information", body: ["To deliver the courses, events and services you have requested.", "To send confirmations, joining instructions and important account notices.", "To respond to your enquiries and provide student support.", "To send occasional educational updates and announcements — you may unsubscribe at any time."] },
  { heading: "4. Lawful basis for processing", body: ["We process personal data on the basis of contract (to deliver services you have purchased), legitimate interest (to improve and secure our services) and consent (for marketing communications)."] },
  { heading: "5. Sharing your information", body: ["We do not sell, rent or trade your personal data. We share information only with trusted service providers who help us operate — such as payment processors, email delivery services and video hosting platforms — and only to the extent necessary.", "We may disclose information where required to do so by law."] },
  { heading: "6. Payments, billing records and refunds", body: [
    "We store purchase references, course titles, amounts and payment status so we can deliver access and keep accurate accounts.",
    "Refunds are not automated inside the student dashboard. If a refund is approved, it is processed manually by our team. We may update your billing record to show a manual refund status and keep that history for accounting and dispute resolution.",
    "Payment-card details are handled by our payment providers — we do not store full card numbers on GAMAT systems.",
  ] },
  { heading: "7. Data retention", body: ["We retain enrollment and transaction records for as long as necessary to provide access to purchased content and to meet legal and accounting obligations. Marketing contact data is retained until you unsubscribe."] },
  { heading: "8. Your rights", body: ["You have the right to access the personal data we hold about you, to request correction of inaccurate data, to request deletion, and to withdraw consent to marketing at any time.", "To exercise any of these rights, email hello@gamatfxacademy.com."] },
  { heading: "9. Cookies", body: ["Our website uses a minimal set of cookies for essential functionality and anonymous analytics. You can disable cookies in your browser settings, though some features may not function correctly."] },
  { heading: "10. Security", body: ["We apply appropriate technical and organisational measures to protect your data. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security."] },
  { heading: "11. Contact", body: ["For any privacy-related questions or requests, contact us at hello@gamatfxacademy.com."] },
];

/* -------------------------------- Layout ------------------------------- */

function Legal({
  crumb, eyebrow, title, subtitle, updated, sections, showRisk, other,
}: {
  crumb: string;
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  updated: string;
  sections: Section[];
  showRisk?: boolean;
  other: { label: string; to: string; icon: React.ElementType };
}) {
  const ids = sections.map((s) => slugify(s.heading));
  const [active, setActive] = useState(ids[0]);
  const [showTop, setShowTop] = useState(false);

  /* Highlight the section currently in view. */
  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 600);
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids.join("|")]);

  /** Scrolls without touching location.hash (which drives the router). */
  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top: y, behavior: "smooth" });
    setActive(id);
  };

  return (
    <>
      <PageHero crumb={crumb} eyebrow={eyebrow} image="/images/hero.jpg" title={title} subtitle={subtitle} />

      <section className="section bg-cream">
        <div className="container-x grid gap-10 lg:grid-cols-[260px_1fr]">
          {/* Sticky index */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <nav className="rounded-2xl border border-line bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">On this page</p>
                <ul className="mt-4 space-y-1">
                  {sections.map((s, i) => {
                    const id = ids[i];
                    const on = active === id;
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          onClick={() => jump(id)}
                          className={`flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                            on ? "bg-brand-light font-semibold text-brand" : "text-ink/65 hover:bg-cream hover:text-brand"
                          }`}
                        >
                          <ChevronRight className={`mt-0.5 h-3.5 w-3.5 shrink-0 transition ${on ? "text-brand" : "text-muted/50"}`} />
                          <span>{s.heading}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="rounded-2xl border border-line bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Related</p>
                <button onClick={() => navigate(other.to)}
                  className="mt-3 flex w-full items-center gap-3 rounded-xl border border-line p-3 text-left transition hover:border-brand hover:bg-cream">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
                    <other.icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-semibold text-ink">{other.label}</span>
                </button>
                <button onClick={() => window.print()}
                  className="mt-2 flex w-full items-center gap-3 rounded-xl border border-line p-3 text-left transition hover:border-brand hover:bg-cream">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cream text-muted">
                    <Printer className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-semibold text-ink">Print / save PDF</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Body */}
          <div className="rounded-3xl border border-line bg-white p-8 shadow-[0_22px_60px_-35px_rgba(22,24,28,0.35)] md:p-12">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
              <p className="text-sm text-muted">Last updated: <strong className="text-ink">{updated}</strong></p>
              <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-muted">
                {sections.length} sections
              </span>
            </div>

            {showRisk && (
              <div className="mt-6 flex gap-4 rounded-2xl border border-brand/25 bg-brand-light p-5">
                <AlertTriangle className="h-6 w-6 shrink-0 text-brand" />
                <p className="text-sm leading-relaxed text-ink/80">
                  <strong className="font-semibold text-ink">Risk warning:</strong> Trading
                  forex, CFDs and crypto carries a high level of risk and can result in
                  the loss of all your capital. Our content is educational only and is
                  never financial advice.
                </p>
              </div>
            )}

            {/* Mobile index */}
            <details className="mt-6 rounded-2xl border border-line bg-cream p-5 lg:hidden">
              <summary className="cursor-pointer text-sm font-bold text-ink">Jump to a section</summary>
              <ul className="mt-3 space-y-1">
                {sections.map((s, i) => (
                  <li key={ids[i]}>
                    <button type="button" onClick={() => jump(ids[i])}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-ink/70 transition hover:bg-white hover:text-brand">
                      {s.heading}
                    </button>
                  </li>
                ))}
              </ul>
            </details>

            <div className="mt-8 space-y-10">
              {sections.map((s, i) => (
                <div key={ids[i]} id={ids[i]} className="scroll-mt-28">
                  <h2 className="font-display text-xl font-bold text-ink">{s.heading}</h2>
                  {s.body.map((p, j) => (
                    <p key={j} className="mt-3 text-[15px] leading-[1.85] text-muted">{p}</p>
                  ))}
                </div>
              ))}
            </div>

            {/* Footer actions */}
            <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-line pt-7">
              <button onClick={() => navigate("/contact")} className="btn-primary">Ask a question</button>
              <button onClick={() => navigate(other.to)} className="btn-outline-dark">
                <other.icon className="h-4 w-4" /> {other.label}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Back to top */}
      {showTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-8 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-xl transition hover:-translate-y-1 hover:bg-brand-dark">
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      <PageCta
        tone="light"
        title="Questions about this policy?"
        body="Our team is happy to clarify anything you're unsure about."
        primaryLabel="Contact Us"
        primaryTo="/contact"
      />
    </>
  );
}

/* -------------------------------- Pages -------------------------------- */

export function TermsPage() {
  return (
    <Legal
      crumb="Terms of Service"
      eyebrow="Legal"
      title={<>Terms of <span className="text-brand">Service</span></>}
      subtitle="The rules that govern your use of GAMAT Fx Academy's website, courses, events and community channels."
      updated="1 January 2026"
      sections={termsSections}
      showRisk
      other={{ label: "Read our Privacy Policy", to: "/privacy", icon: ShieldCheck }}
    />
  );
}

export function PrivacyPage() {
  return (
    <Legal
      crumb="Privacy Policy"
      eyebrow="Legal"
      title={<>Privacy <span className="text-brand">Policy</span></>}
      subtitle="How GAMAT Fx Academy collects, uses, stores and protects your personal information."
      updated="1 January 2026"
      sections={privacySections}
      other={{ label: "Read our Terms of Service", to: "/terms", icon: FileText }}
    />
  );
}
