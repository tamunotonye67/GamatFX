import { useState } from "react";
import { getCourse, totalLessons, naira, asCourse } from "../lib/courses";
import { useStore } from "../lib/store";
import { navigate } from "../lib/router";
import Logo from "../components/Logo";
import {
  ArrowLeft, Lock, CreditCard, Building2, Smartphone, CheckCircle2,
  ShieldCheck, ArrowUpRight, Loader2, Tag, Video, MessagesSquare, Send, MessageSquare, Check,
} from "lucide-react";

type Method = "card" | "transfer" | "ussd";

const methods: { id: Method; label: string; icon: React.ElementType; hint: string }[] = [
  { id: "card", label: "Debit / Credit Card", icon: CreditCard, hint: "Visa, Mastercard, Verve" },
  { id: "transfer", label: "Bank Transfer", icon: Building2, hint: "Pay from any Nigerian bank" },
  { id: "ussd", label: "USSD", icon: Smartphone, hint: "Dial a code to pay" },
];

export default function CheckoutPage({ id }: { id: string }) {
  const { user, isAuthed, enroll, isEnrolled, priceOf, recordPayment, managedCourses, validateCoupon } = useStore();
  const builtIn = getCourse(id);
  const managed = managedCourses.find((c) => c.id === id && c.published);
  const course = builtIn ?? (managed ? asCourse(managed) : undefined);
  const isMentorship = course?.tag === "Mentorship" || course?.id.startsWith("mentorship-");
  const [method, setMethod] = useState<Method>(isMentorship ? "transfer" : "card");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [transferRef, setTransferRef] = useState("");

  if (!course) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
        <h1 className="font-display text-3xl font-extrabold text-ink">Course not found</h1>
        <button onClick={() => navigate("/courses")} className="btn-primary mt-8">Back to Courses</button>
      </section>
    );
  }

  if (!isAuthed) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
        <Lock className="h-14 w-14 text-brand" />
        <h1 className="mt-6 font-display text-3xl font-extrabold text-ink">Sign in to continue</h1>
        <p className="mt-3 max-w-md text-muted">You need an account to enroll in <strong className="text-ink">{course.title}</strong>.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => navigate("/login")} className="btn-outline-dark">Log In</button>
          <button onClick={() => navigate("/signup")} className="btn-primary">Create Account</button>
        </div>
      </section>
    );
  }

  if (isEnrolled(course.id) && !done) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
        <CheckCircle2 className="h-14 w-14 text-brand" />
        <h1 className="mt-6 font-display text-3xl font-extrabold text-ink">You already own this course</h1>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => navigate(`/learn/${course.id}`)} className="btn-primary">Continue Learning</button>
          <button onClick={() => navigate("/dashboard")} className="btn-outline-dark">Go to Dashboard</button>
        </div>
      </section>
    );
  }

  const base = managed ? managed.price : priceOf(course.id);
  const vat = Math.round(base * 0.075);
  const discountAmt = Math.round(base * discount);
  const total = base + vat - discountAmt;

  const applyCoupon = () => {
    setCouponMsg(null);
    const res = validateCoupon(coupon, "courses");
    if (res.ok && res.discountPercent) {
      setDiscount(res.discountPercent / 100);
      setCouponMsg(`Success! ${res.discountPercent}% discount applied (${res.coupon?.code}).`);
    } else {
      setDiscount(0);
      setCouponMsg(res.error || "That coupon code isn't valid.");
    }
  };

  const pay = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    window.setTimeout(() => {
      enroll(course.id);
      recordPayment({
        userId: user!.id,
        userName: `${user!.firstName} ${user!.lastName}`,
        userEmail: user!.email,
        courseId: course.id,
        courseTitle: course.title,
        subtotal: base,
        vat,
        discount: discountAmt,
        amount: total,
        method,
        coupon: discount ? coupon.trim().toUpperCase() : undefined,
      });
      setProcessing(false);
      setDone(true);
      window.scrollTo({ top: 0 });
    }, 1600);
  };

  /* ----------------------------- Success ----------------------------- */
  if (done) {
    const isMentorship = course.tag === "Mentorship" || course.id.startsWith("mentorship-");

    if (isMentorship) {
      return (
        <section className="min-h-screen bg-cream px-6 py-12">
          <div className="mx-auto max-w-3xl space-y-8">
            {/* Welcome & Confirmation Letter */}
            <div className="rounded-3xl border border-line bg-white p-8 sm:p-10 text-center shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-brand via-amber-500 to-brand" />
              
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-light">
                <CheckCircle2 className="h-11 w-11 text-brand" />
              </span>

              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800">
                <Check className="h-3.5 w-3.5" /> Seat Confirmed & Enrolled
              </span>

              <h1 className="mt-4 font-display text-2xl sm:text-3xl font-extrabold text-ink">
                Welcome to GAMAT FX Mentorship!
              </h1>
              <p className="mt-2 text-sm text-muted max-w-xl mx-auto">
                Congratulations <strong className="text-ink">{user?.firstName}</strong>! Your seat for <strong className="text-brand">{course.title}</strong> is officially active.
              </p>

              {/* Live Class Notice */}
              <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-50/70 p-5 text-left text-xs space-y-2">
                <div className="flex items-center gap-2 text-sm font-extrabold text-amber-900">
                  <Video className="h-4 w-4 text-brand" /> Live Class Delivery via Zoom & Google Meet
                </div>
                <p className="text-amber-800/90 leading-relaxed">
                  Your mentorship package is conducted strictly via <strong>Live Interactive Zoom & Google Meet Classes</strong> — giving you direct real-time access to mentors, chart breakdowns, and live market execution.
                </p>
              </div>

              {/* Community Links */}
              <div className="mt-7 text-left">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink">
                  🔗 Step 1: Join Your Private Mentorship Community
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Connect directly with mentors and fellow traders across our official private channels to receive your live class links:
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <a
                    href="https://discord.gg/gamatfx"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-3.5 text-xs font-bold text-indigo-900 transition hover:bg-indigo-100 shadow-sm"
                  >
                    <MessagesSquare className="h-5 w-5 text-indigo-600 shrink-0" />
                    <div>
                      <span>Discord Server</span>
                      <span className="block text-[10px] font-normal text-indigo-700">VIP Live Rooms</span>
                    </div>
                  </a>

                  <a
                    href="https://t.me/gamatfx_official"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 rounded-2xl border border-sky-200 bg-sky-50/80 p-3.5 text-xs font-bold text-sky-900 transition hover:bg-sky-100 shadow-sm"
                  >
                    <Send className="h-5 w-5 text-sky-600 shrink-0" />
                    <div>
                      <span>Telegram VIP</span>
                      <span className="block text-[10px] font-normal text-sky-700">Signals & Calls</span>
                    </div>
                  </a>

                  <a
                    href="https://chat.whatsapp.com/gamatfx"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs font-bold text-emerald-900 transition hover:bg-emerald-100 shadow-sm"
                  >
                    <MessageSquare className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div>
                      <span>WhatsApp VIP</span>
                      <span className="block text-[10px] font-normal text-emerald-700">Class Alerts</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Embedded Onboarding Intake Survey */}
            <MentorshipSurveyCard user={user} courseId={course.id} />
          </div>
        </section>
      );
    }

    return (
      <section className="flex min-h-screen items-center justify-center bg-cream px-6 py-20">
        <div className="w-full max-w-lg rounded-3xl border border-line bg-white p-10 text-center shadow-[0_22px_60px_-32px_rgba(22,24,28,0.4)]">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-light">
            <CheckCircle2 className="h-11 w-11 text-brand" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-extrabold text-ink">Payment successful!</h1>
          <p className="mt-3 text-muted">You're now enrolled in <strong className="text-ink">{course.title}</strong>. A receipt has been sent to {user?.email}.</p>

          <div className="mt-7 rounded-2xl bg-cream p-5 text-left text-sm">
            <Row l="Course" v={course.title} />
            <Row l="Amount paid" v={naira(total)} />
            <Row l="Lessons unlocked" v={`${totalLessons(course)}`} />
            <Row l="Access" v="Lifetime" last />
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button onClick={() => navigate(`/learn/${course.id}`)} className="btn-primary w-full">
              Start Learning <ArrowUpRight className="h-4 w-4" />
            </button>
            <button onClick={() => navigate("/dashboard")} className="btn-outline-dark w-full">Go to Dashboard</button>
          </div>
        </div>
      </section>
    );
  }

  /* ----------------------------- Checkout ----------------------------- */
  return (
    <section className="min-h-screen bg-cream px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted">
            <ShieldCheck className="h-4 w-4 text-brand" /> Secure checkout
          </span>
        </div>

        <button onClick={() => navigate(`/courses/${course.id}`)} className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-brand">
          <ArrowLeft className="h-4 w-4" /> Back to course
        </button>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          {/* Payment form */}
          <form onSubmit={pay} className="rounded-3xl border border-line bg-white p-8 shadow-[0_22px_60px_-35px_rgba(22,24,28,0.35)]">
            <h1 className="font-display text-2xl font-extrabold text-ink">Complete your enrollment</h1>
            <p className="mt-1.5 text-sm text-muted">Signed in as {user?.email}</p>

            {/* Method */}
            <p className="mt-7 text-xs font-semibold uppercase tracking-wide text-muted">Payment method</p>
            
            {isMentorship ? (
              <div className="mt-3 rounded-2xl border border-brand/40 bg-amber-50/80 p-4 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                  <Building2 className="h-4 w-4 text-brand" /> Bank Transfer Only
                </div>
                <p className="mt-1 text-amber-800/90 leading-relaxed">
                  Mentorship packages are processed exclusively via Bank Transfer for direct account verification & mentor onboarding.
                </p>
              </div>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {methods.map((m) => (
                  <button key={m.id} type="button" onClick={() => setMethod(m.id)}
                    className={`rounded-2xl border p-4 text-left transition ${method === m.id ? "border-brand bg-brand-light" : "border-line hover:border-brand/50"}`}>
                    <m.icon className={`h-5 w-5 ${method === m.id ? "text-brand" : "text-muted"}`} />
                    <p className={`mt-2 text-sm font-semibold ${method === m.id ? "text-brand" : "text-ink"}`}>{m.label}</p>
                    <p className="mt-0.5 text-[11px] text-muted">{m.hint}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Fields */}
            <div className="mt-7 space-y-5">
              {!isMentorship && method === "card" && (
                <>
                  <Field label="Cardholder name" ph="Jane Doe" />
                  <Field label="Card number" ph="4242 4242 4242 4242" inputMode="numeric" />
                  <div className="grid grid-cols-2 gap-5">
                    <Field label="Expiry" ph="MM / YY" />
                    <Field label="CVV" ph="123" inputMode="numeric" />
                  </div>
                </>
              )}

              {(method === "transfer" || isMentorship) && (
                <div className="rounded-2xl border border-line bg-cream p-5 text-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-line/60 pb-3">
                    <p className="font-extrabold text-ink text-xs uppercase tracking-wider">Official Mentorship Account Details</p>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">Verified Account</span>
                  </div>
                  
                  <div className="space-y-2 text-xs text-muted">
                    <div className="flex justify-between py-1 border-b border-line/30">
                      <span>Bank Name:</span>
                      <strong className="text-ink font-bold">Providus Bank Plc / Zenith Bank</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-line/30">
                      <span>Account Number:</span>
                      <strong className="text-brand font-black text-sm tracking-wider">1301234567</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Account Name:</span>
                      <strong className="text-ink font-bold">GAMAT Fx Academy Ltd</strong>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-ink">
                      Sender Name / Transfer Ref / Receipt Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={transferRef}
                      onChange={(e) => setTransferRef(e.target.value)}
                      placeholder="e.g. John Doe - Zenith Bank Transfer"
                      className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-xs text-ink placeholder-muted outline-none focus:border-brand"
                    />
                  </div>

                  <p className="pt-1 text-[11px] text-muted leading-relaxed">
                    Once your bank transfer is completed, click <strong>Complete Transfer Enrolment</strong> below.
                  </p>
                </div>
              )}

              {!isMentorship && method === "ussd" && (
                <div className="rounded-2xl border border-line bg-cream p-5 text-center">
                  <p className="text-sm text-muted">Dial this code on your registered phone:</p>
                  <p className="mt-3 font-display text-3xl font-extrabold text-brand">*737*000*{String(total).slice(0, 4)}#</p>
                  <p className="mt-3 text-xs text-muted">Then click confirm below.</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={processing} className="btn-primary mt-8 w-full disabled:cursor-not-allowed disabled:opacity-70">
              {processing ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Verifying Transfer…</>
              ) : (
                <><Lock className="h-4 w-4" /> {isMentorship ? "Complete Transfer Enrolment" : `Pay ${naira(total)}`}</>
              )}
            </button>
            <p className="mt-3 text-center text-xs text-muted">
              This is a demo checkout — no real payment is taken.
            </p>
          </form>

          {/* Summary */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-3xl border border-line bg-white p-7 shadow-[0_22px_60px_-35px_rgba(22,24,28,0.35)]">
              <h2 className="font-display text-lg font-bold text-ink">Order summary</h2>

              <div className="mt-5 flex gap-4">
                <img src={course.poster} alt="" className="h-20 w-28 shrink-0 rounded-xl object-cover" />
                <div>
                  <p className="font-display text-sm font-bold leading-snug text-ink">{course.title}</p>
                  <p className="mt-1 text-xs text-muted">{course.level} · {totalLessons(course)} lessons</p>
                </div>
              </div>

              {/* Coupon */}
              <div className="mt-6">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">Coupon code</label>
                <div className="flex gap-2">
                  <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="GAMAT20"
                    className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 text-sm text-ink placeholder-muted/60 outline-none transition focus:border-brand focus:bg-white" />
                  <button type="button" onClick={applyCoupon} className="shrink-0 rounded-xl border border-ink/15 px-4 text-sm font-semibold text-ink transition hover:border-brand hover:text-brand">
                    Apply
                  </button>
                </div>
                {couponMsg && (
                  <p className={`mt-2 flex items-center gap-1.5 text-xs ${discount ? "text-brand" : "text-muted"}`}>
                    <Tag className="h-3.5 w-3.5" /> {couponMsg}
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm">
                <Row l="Subtotal" v={naira(base)} />
                {discount > 0 && <Row l={`Discount (${discount * 100}%)`} v={`− ${naira(discountAmt)}`} accent />}
                <Row l="VAT (7.5%)" v={naira(vat)} />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                <span className="font-semibold text-ink">Total</span>
                <span className="font-display text-2xl font-extrabold text-brand">{naira(total)}</span>
              </div>

              <ul className="mt-6 space-y-2 border-t border-line pt-5">
                {["Lifetime access", "Certificate on completion", "Private community access"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Row({ l, v, accent, last }: { l: string; v: string; accent?: boolean; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${last ? "" : "mb-1.5"}`}>
      <span className="text-muted">{l}</span>
      <span className={`font-semibold ${accent ? "text-brand" : "text-ink"}`}>{v}</span>
    </div>
  );
}

function Field({ label, ph, inputMode }: { label: string; ph: string; inputMode?: "numeric" }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">{label}</label>
      <input required placeholder={ph} inputMode={inputMode}
        className="w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm text-ink placeholder-muted/60 outline-none transition focus:border-brand focus:bg-white" />
    </div>
  );
}

function MentorshipSurveyCard({ user, courseId }: { user: any; courseId: string }) {
  const [tradingPath, setTradingPath] = useState("Forex");
  const [challenges, setChallenges] = useState("");
  const [longTermGoals, setLongTermGoals] = useState("");
  const [availability, setAvailability] = useState("Evening Sessions (7 PM UTC)");
  const [submitted, setSubmitted] = useState(() => {
    return !!localStorage.getItem(`gamat_survey_${user?.id}_${courseId}`);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const surveyData = {
      userId: user?.id,
      userName: `${user?.firstName} ${user?.lastName}`,
      userEmail: user?.email,
      courseId,
      tradingPath,
      challenges,
      longTermGoals,
      availability,
      submittedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(`gamat_survey_${user?.id}_${courseId}`, JSON.stringify(surveyData));
    setSubmitted(true);
  };

  return (
    <div className="rounded-3xl border border-line bg-white p-8 sm:p-10 shadow-xl text-left">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <span className="eyebrow">Step 2: Onboarding Intake</span>
          <h2 className="font-display text-xl font-extrabold text-ink mt-1">
            Mentorship Intake Survey
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Help your lead mentors tailor your live Zoom/Meet sessions to your specific trading goals.
          </p>
        </div>
        {submitted && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" /> Received
          </span>
        )}
      </div>

      {submitted ? (
        <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
          <h3 className="mt-3 font-display text-base font-bold text-emerald-950">
            Survey Response Received!
          </h3>
          <p className="mt-1 text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
            Your lead mentor has received your intake survey profile. We will review your background and challenges before your first live Zoom/Meet class!
          </p>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="btn-primary mt-6 !py-2.5 text-xs font-bold"
          >
            Go to Student Dashboard
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-ink">
              1. What is your primary trading path / market focus?
            </label>
            <select
              value={tradingPath}
              onChange={(e) => setTradingPath(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line bg-cream px-4 py-2.5 text-xs font-semibold text-ink outline-none focus:border-brand focus:bg-white"
            >
              <option value="Forex">Forex Trading (EUR/USD, GBP/JPY, Gold)</option>
              <option value="Crypto">Crypto & DeFi Markets (Bitcoin, Ethereum, Altcoins)</option>
              <option value="Synthetics">Synthetic Indices (Volatility 75, Boom & Crash)</option>
              <option value="Macro">Macro Economy & Commodities</option>
              <option value="Multi-Asset">Multi-Asset Institutional Trading</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-ink">
              2. What are your current biggest trading challenges & pain points?
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Struggling with risk management, emotional discipline, entering trades too late, or passing prop firm evaluations..."
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line bg-cream p-3.5 text-xs text-ink placeholder-muted outline-none focus:border-brand focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-ink">
              3. What do you hope to learn or master in the long run?
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Master price action, build a consistent mechanical trading strategy, get funded with $100k+, or trade full-time..."
              value={longTermGoals}
              onChange={(e) => setLongTermGoals(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line bg-cream p-3.5 text-xs text-ink placeholder-muted outline-none focus:border-brand focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-ink">
              4. Preferred Live Class Time Slot
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line bg-cream px-4 py-2.5 text-xs font-semibold text-ink outline-none focus:border-brand focus:bg-white"
            >
              <option value="Morning Sessions (9 AM UTC)">Morning Sessions (9 AM UTC)</option>
              <option value="Afternoon Sessions (2 PM UTC)">Afternoon Sessions (2 PM UTC)</option>
              <option value="Evening Sessions (7 PM UTC)">Evening Sessions (7 PM UTC)</option>
              <option value="Weekend Masterclasses">Weekend Masterclasses</option>
            </select>
          </div>

          <button type="submit" className="btn-primary w-full !py-3 text-xs font-bold">
            Submit Mentorship Survey <ArrowUpRight className="h-4 w-4" />
          </button>
        </form>
      )}
    </div>
  );
}
