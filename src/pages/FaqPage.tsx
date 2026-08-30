import PageHero from "../components/PageHero";
import PageCta from "../components/PageCta";
import Faq from "../components/Faq";
import { navigate } from "../lib/router";
import { GraduationCap, CreditCard, Users, LifeBuoy } from "lucide-react";

const topics = [
  { icon: GraduationCap, title: "Courses & learning", body: "Curriculum, levels, access and certificates.", to: "/courses" as const },
  { icon: CreditCard, title: "Payments & pricing", body: "Fees, instalments and refund policy.", to: "/terms" as const },
  { icon: Users, title: "Community", body: "Joining, rules and moderation.", to: "/community" as const },
  { icon: LifeBuoy, title: "Support", body: "Get help from a real human.", to: "/contact" as const },
];

const extra = [
  { q: "Can I pay in instalments?", a: "Yes. Our mentorship programs can be split into two or three payments. Contact our team before enrolling and we'll set up a plan for you." },
  { q: "Do you offer refunds?", a: "Enrollments are generally non-refundable because content is digital and delivered immediately. There is no automatic refund button in your dashboard — any refund, if approved, is handled manually by our team. If you have not accessed any material within 7 days of purchase, contact us on WhatsApp or email and we will review your case." },
  { q: "Will I get a certificate?", a: "Yes. A GAMAT Fx Academy certificate is issued on completion of any full program, including our mentorship cohorts." },
  { q: "What device do I need?", a: "Any laptop or smartphone with a stable internet connection. We teach on MT4/MT5 and professional charting platforms, both of which are free and run on all major devices." },
  { q: "Do you help with prop firm challenges?", a: "Yes — our Funded Trader Prep program is built specifically around evaluation rules, drawdown limits and payout discipline." },
  { q: "How do I contact a mentor directly?", a: "Enrolled students get mentor access inside the private community, plus scheduled review calls depending on their program tier." },
];

export default function FaqPage() {
  return (
    <>
      <PageHero
        crumb="FAQ"
        eyebrow="Help centre"
        image="/images/about.jpg"
        title={<>Frequently asked <span className="text-brand">questions</span></>}
        subtitle="Everything you need to know about our courses, community, payments and mentorship — answered plainly."
      />

      {/* Topic shortcuts */}
      <section className="border-b border-line bg-white py-14">
        <div className="container-x grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {topics.map((t) => (
            <button
              key={t.title}
              type="button"
              onClick={() => navigate(t.to)}
              className="card text-left"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand">
                <t.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-ink">{t.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{t.body}</p>
            </button>
          ))}
        </div>
      </section>

      <Faq />

      {/* Additional questions */}
      <section className="section bg-white">
        <div className="container-x mx-auto max-w-3xl">
          <div className="text-center">
            <span className="eyebrow justify-center">More answers</span>
            <h2 className="section-title mt-4">Payments, access &amp; logistics</h2>
          </div>
          <div className="mt-10 space-y-4">
            {extra.map((e) => (
              <div key={e.q} className="rounded-2xl border border-line bg-cream p-6">
                <h3 className="font-display text-base font-bold text-ink">{e.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{e.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageCta
        tone="red"
        title="Didn't find your answer?"
        body="Send us a message and a member of our team will get back to you within 24 hours."
        primaryLabel="Contact Us"
        primaryTo="/contact"
      />
    </>
  );
}
