import { useState } from "react";
import { Check, Zap, Crown, ArrowRight, UserCheck, ShieldCheck, PhoneCall, Video } from "lucide-react";
import { navigate } from "../lib/router";

export type MentorshipPlanId = "starter" | "pro" | "elite";

export default function MentorshipPricingSection() {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      id: "starter" as MentorshipPlanId,
      name: "Starter",
      tagline: "Live Zoom & Google Meet interactive mentorship for beginners.",
      icon: UserCheck,
      monthlyPrice: "$29",
      annualPrice: "$19",
      billedAnnuallyText: "Billed annually ($228/yr)",
      popular: false,
      activeFeatures: [
        "Live Weekly Zoom & Google Meet Classes",
        "Forex & Market Structure Q&A",
        "Private Discord & WhatsApp Access",
        "Mentorship Intake Survey",
      ],
      inactiveFeatures: [],
      cta: "Get Starter",
    },
    {
      id: "pro" as MentorshipPlanId,
      name: "Pro Trader",
      tagline: "Live daily Zoom/Meet trading room for consistent profitability.",
      icon: Zap,
      monthlyPrice: "$75",
      annualPrice: "$55",
      billedAnnuallyText: "Billed annually ($660/yr)",
      popular: true,
      activeFeatures: [
        "All Starter features included",
        "Daily Live Zoom/Meet Trading Room",
        "Real-Time Signal Alerts",
        "2 × 1-on-1 Zoom Calls / month",
      ],
      inactiveFeatures: [],
      cta: "Get Pro Trader",
    },
    {
      id: "elite" as MentorshipPlanId,
      name: "Elite",
      tagline: "For serious traders preparing for live prop firm evaluations & funding.",
      icon: Crown,
      monthlyPrice: "$139",
      annualPrice: "$99",
      billedAnnuallyText: "Billed annually ($1188/yr)",
      popular: false,
      activeFeatures: [
        "All Pro Trader features included",
        "4 × 1-on-1 Zoom Calls / month",
        "Live Prop Firm Challenge Coaching",
        "24/7 Direct Mentor Access",
      ],
      inactiveFeatures: [],
      cta: "Get Elite",
    },
  ];

  return (
    <section id="mentorship-pricing" className="section bg-cream relative overflow-hidden">
      <div className="container-x">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">
            Mentorship Pricing Packages
          </span>
          <h2 className="section-title mt-3">
            Trading <span className="text-brand">Mentorship Plan</span>
          </h2>
          <p className="mt-4 text-base text-muted">
            Select your preferred mentorship plans to elevate your trading skills
          </p>

          {/* Stitchable Joined Billing Toggle Buttons */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center rounded-full bg-slate-200/80 p-1.5 border border-line shadow-inner">
              <button
                type="button"
                onClick={() => setAnnual(false)}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-all duration-200 ${
                  !annual
                    ? "bg-brand text-white shadow-md"
                    : "text-slate-700 hover:text-ink"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setAnnual(true)}
                className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold transition-all duration-200 ${
                  annual
                    ? "bg-brand text-white shadow-md"
                    : "text-slate-700 hover:text-ink"
                }`}
              >
                <span>Annual</span>
                <span className="rounded-full bg-amber-400 text-slate-950 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                  Save 30%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid with 3D Stacked Layering: Starter & Elite stacked behind Pro Trader */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3 items-center relative py-4">
          {plans.map((p, idx) => {
            const price = annual ? p.annualPrice : p.monthlyPrice;
            const isPro = p.popular;

            let stackStyles = "";
            if (isPro) {
              stackStyles = "bg-slate-950 text-white border-2 border-brand shadow-[0_35px_90px_-15px_rgba(220,53,69,0.6)] lg:scale-105 z-20 relative";
            } else if (idx === 0) {
              // Starter (Left) stacked behind Pro
              stackStyles = "bg-white text-ink border border-line shadow-md lg:scale-95 z-10 lg:-mr-10 opacity-95 hover:opacity-100 hover:scale-100 hover:z-30";
            } else {
              // Elite (Right) stacked behind Pro
              stackStyles = "bg-white text-ink border border-line shadow-md lg:scale-95 z-10 lg:-ml-10 opacity-95 hover:opacity-100 hover:scale-100 hover:z-30";
            }

            return (
              <div
                key={p.id}
                className={`flex flex-col justify-between rounded-3xl p-7 transition-all duration-500 ${stackStyles}`}
              >
                {/* Popular Badge */}
                {isPro && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand via-rose-600 to-brand px-4 py-1 text-xs font-black uppercase tracking-wider text-white shadow-lg">
                      <Zap className="h-3.5 w-3.5" /> Popular Plan
                    </span>
                  </div>
                )}

                <div>
                  <h3 className={`mt-2 font-display text-2xl font-extrabold ${isPro ? "text-white" : "text-ink"}`}>
                    {p.name}
                  </h3>
                  <p className={`mt-1.5 text-xs leading-relaxed min-h-[32px] ${isPro ? "text-white/70" : "text-muted"}`}>
                    {p.tagline}
                  </p>

                  {/* Price */}
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className={`font-display text-4xl font-black ${isPro ? "text-white" : "text-ink"}`}>
                      {price}
                    </span>
                    <span className={`text-xs font-semibold ${isPro ? "text-white/70" : "text-muted"}`}>
                      /month
                    </span>
                  </div>

                  <p className={`mt-1 text-[11px] font-medium ${isPro ? "text-amber-300" : "text-emerald-600 font-bold"}`}>
                    {annual ? p.billedAnnuallyText : "Flexibility to cancel anytime"}
                  </p>

                  {/* Live Class Badge */}
                  <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-brand/10 p-2 text-[10px] font-bold text-brand border border-brand/20">
                    <Video className="h-3.5 w-3.5 shrink-0" /> Live Zoom & Google Meet Classes
                  </div>

                  {/* Divider */}
                  <div className={`my-4 h-px ${isPro ? "bg-white/10" : "bg-line"}`} />

                  {/* Active Features */}
                  <ul className="space-y-2.5 text-xs">
                    {p.activeFeatures.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className={`h-4 w-4 shrink-0 mt-0.5 ${isPro ? "text-amber-400" : "text-emerald-600"}`} />
                        <span className={`font-medium ${isPro ? "text-white/95" : "text-ink/90"}`}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="mt-6 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/mentorship-survey?plan=${p.id}`)}
                    className={`w-full py-3 rounded-full font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      isPro
                        ? "bg-brand text-white hover:bg-brand-dark shadow-md"
                        : "btn-outline-dark"
                    }`}
                  >
                    {p.cta} <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Support Guarantee */}
        <div className="mt-12 rounded-2xl border border-line bg-white p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-ink text-sm">Need help choosing the right mentorship plan?</p>
              <p className="text-xs text-muted">Book a 1-on-1 consultation call with our team for personalized advice.</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/contact")}
            className="btn-outline-dark !py-2.5 text-xs shrink-0"
          >
            <PhoneCall className="h-3.5 w-3.5" /> Contact Mentor Team
          </button>
        </div>
      </div>
    </section>
  );
}
