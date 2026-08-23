import { useState } from "react";
import PageHero from "../components/PageHero";
import PageCta from "../components/PageCta";
import { useStore } from "../lib/store";
import { navigate } from "../lib/router";
import { Lock, ArrowUpRight, Video } from "lucide-react";

export default function MentorshipSurveyPage() {
  const { user, isAuthed } = useStore();
  const rawHash = typeof window !== "undefined" ? window.location.hash : "";
  const planParam = rawHash.includes("plan=") ? rawHash.split("plan=")[1]?.split("&")[0] : "pro";
  const planId = ["starter", "pro", "elite"].includes(planParam) ? planParam : "pro";

  const planTitles: Record<string, string> = {
    starter: "Starter Mentorship Package ($29/mo)",
    pro: "Pro Trader Mentorship Package ($75/mo)",
    elite: "Elite Mentorship Package ($139/mo)",
  };

  const [experienceLevel, setExperienceLevel] = useState("Complete Beginner (0-6 months)");
  const [tradingPath, setTradingPath] = useState("Forex Currency Pairs");
  const [challenges, setChallenges] = useState("");
  const [longTermGoals, setLongTermGoals] = useState("");
  const [availability, setAvailability] = useState("Evening Sessions (7 PM UTC)");

  if (!isAuthed) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
        <Lock className="h-14 w-14 text-brand" />
        <h1 className="mt-6 font-display text-3xl font-extrabold text-ink">Sign in required</h1>
        <p className="mt-3 max-w-md text-muted">
          Please sign in or create an account to complete your pre-enrollment survey for the <strong className="text-ink">{planTitles[planId]}</strong>.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => navigate("/login")} className="btn-outline-dark">Log In</button>
          <button onClick={() => navigate("/signup")} className="btn-primary">Create Account</button>
        </div>
      </section>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const surveyData = {
      userId: user?.id,
      userName: `${user?.firstName} ${user?.lastName}`,
      userEmail: user?.email,
      planId,
      experienceLevel,
      tradingPath,
      challenges,
      longTermGoals,
      availability,
      submittedAt: new Date().toISOString(),
    };
    localStorage.setItem(`gamat_survey_${user?.id}_${planId}`, JSON.stringify(surveyData));

    // Proceed to Mentorship Checkout Page
    navigate(`/checkout/mentorship-${planId}`);
  };

  return (
    <>
      <PageHero
        crumb="Pre-Enrollment Survey"
        eyebrow="Step 1 of 2: Student Assessment"
        image="/images/hero.jpg"
        title={<>Mentorship Intake <span className="text-brand">Questionnaire</span></>}
        subtitle={`Answer these questions about your trading level & goals to proceed with enrolling in the ${planTitles[planId]}.`}
      />

      <section className="section bg-cream">
        <div className="container-x max-w-3xl space-y-8">
          {/* Live Class Notice */}
          <div className="rounded-3xl border border-line bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand shrink-0">
                <Video className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-ink">Live Interactive Classes (Zoom & Google Meet)</h3>
                <p className="text-xs text-muted mt-0.5 leading-relaxed">
                  Your mentorship package is conducted via <strong>Live Zoom & Google Meet Classes</strong>. Completing this intake survey helps lead mentors tailor your live masterclasses and 1-on-1 calls.
                </p>
              </div>
            </div>
          </div>

          {/* Survey Form */}
          <div className="rounded-3xl border border-line bg-white p-8 sm:p-10 shadow-xl">
            <div className="border-b border-line pb-4 flex items-center justify-between">
              <div>
                <span className="eyebrow">Student Intake Questionnaire</span>
                <h2 className="font-display text-xl font-extrabold text-ink mt-1">
                  {planTitles[planId]}
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Answer the questions below, then click proceed to complete your enrolment via Bank Transfer.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6 text-left">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-ink">
                  1. What is your current trading experience level?
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-line bg-cream px-4 py-3 text-xs font-semibold text-ink outline-none focus:border-brand focus:bg-white"
                >
                  <option value="Complete Beginner (0-6 months)">Complete Beginner (0-6 months experience)</option>
                  <option value="Intermediate (6 months - 2 years)">Intermediate Trader (6 months - 2 years experience)</option>
                  <option value="Advanced Trader (2+ years)">Advanced Trader (2+ years trading markets)</option>
                  <option value="Prop Firm Challenger / Funded">Prop Firm Challenger / Seeking Funded Account</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-ink">
                  2. Primary Market Focus / Trading Path
                </label>
                <select
                  value={tradingPath}
                  onChange={(e) => setTradingPath(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-line bg-cream px-4 py-3 text-xs font-semibold text-ink outline-none focus:border-brand focus:bg-white"
                >
                  <option value="Forex Currency Pairs">Forex Currency Pairs (EUR/USD, GBP/JPY, Gold)</option>
                  <option value="Crypto & DeFi">Crypto & DeFi (Bitcoin, Ethereum, Altcoins)</option>
                  <option value="Synthetic Indices">Synthetic Indices (Volatility 75, Boom & Crash)</option>
                  <option value="Macro & Commodities">Macro Economy & Commodities</option>
                  <option value="Multi-Asset Institutional">Multi-Asset Institutional Trading</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-ink">
                  3. What are your current biggest trading challenges & pain points?
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your current struggle (e.g. risk management, emotional discipline, entering trades late, or failing prop firm evaluations...)"
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-line bg-cream p-3.5 text-xs text-ink placeholder-muted outline-none focus:border-brand focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-ink">
                  4. What do you hope to learn or master in the long run?
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your long-term goal (e.g. Master price action analysis, build a mechanical trade strategy, pass a $100k prop firm challenge, or trade full-time...)"
                  value={longTermGoals}
                  onChange={(e) => setLongTermGoals(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-line bg-cream p-3.5 text-xs text-ink placeholder-muted outline-none focus:border-brand focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-ink">
                  5. Preferred Live Class Time Slot
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-line bg-cream px-4 py-3 text-xs font-semibold text-ink outline-none focus:border-brand focus:bg-white"
                >
                  <option value="Morning Sessions (9 AM UTC)">Morning Sessions (9 AM UTC)</option>
                  <option value="Afternoon Sessions (2 PM UTC)">Afternoon Sessions (2 PM UTC)</option>
                  <option value="Evening Sessions (7 PM UTC)">Evening Sessions (7 PM UTC)</option>
                  <option value="Weekend Masterclasses">Weekend Masterclasses</option>
                </select>
              </div>

              <div className="pt-4 border-t border-line">
                <button type="submit" className="btn-primary w-full !py-3.5 text-xs font-bold flex items-center justify-center gap-2">
                  Proceed to Enrolment & Bank Transfer <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <PageCta
        tone="red"
        title="Ready to transform your trading consistency?"
        body="Submit your survey answers above to lock in your mentorship profile and proceed to bank transfer enrolment."
        primaryLabel="Back to Mentorship Plans"
        primaryTo="/#mentorship-pricing"
      />
    </>
  );
}
