import { useState, useEffect } from "react";
import { getCourse, totalLessons, naira, asCourse } from "../lib/courses";
import { useStore } from "../lib/store";
import { navigate } from "../lib/router";
import Logo from "../components/Logo";
import {
  ArrowLeft, Lock, CreditCard, Building2, Coins, CheckCircle2,
  ShieldCheck, ArrowUpRight, Loader2, Tag, Video, MessagesSquare, Send, MessageSquare, Check,
} from "lucide-react";
import { payWithBachs, generateTxRef } from "../lib/bachs";
import { getActiveReferralCode } from "../lib/affiliate";

type Method = "card" | "transfer" | "crypto";

export default function CheckoutPage({ id }: { id: string }) {
  const { user, isAuthed, enroll, isEnrolled, priceOf, recordPayment, managedCourses, validateCoupon } = useStore();
  const builtIn = getCourse(id);
  const managed = managedCourses.find((c) => c.id === id && c.published);
  const course = builtIn ?? (managed ? asCourse(managed) : undefined);
  const isMentorship = course?.tag === "Mentorship" || course?.id.startsWith("mentorship-");
  const [selectedMethod, setSelectedMethod] = useState<Method>("card");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const claimed = sessionStorage.getItem("gamat_claimed_coupon");
      if (claimed && !appliedCode) {
        const res = validateCoupon(claimed, "courses", course.id);
        if (res.ok && res.discountPercent && res.coupon) {
          setCoupon(res.coupon.code);
          setAppliedCode(res.coupon.code);
          setDiscount(res.discountPercent / 100);
          setCouponMsg(`Success! ${res.discountPercent}% discount applied (${res.coupon.code}).`);
          return;
        }
      }

      // Check if referred by an ambassador
      const activeRef = getActiveReferralCode();
      if (activeRef && !appliedCode && discount === 0) {
        setDiscount(0.05);
        setCouponMsg(`Ambassador invite "${activeRef}" active — 5% welcome discount applied!`);
      }
    } catch {}
  }, [validateCoupon, appliedCode, discount]);

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
  const discountAmt = Math.round(base * discount);
  const discountedSubtotal = Math.max(0, base - discountAmt);
  const vat = Math.round(discountedSubtotal * 0.075);
  const total = discountedSubtotal + vat;

  const applyCoupon = (codeToApply = coupon) => {
    setCouponMsg(null);
    const res = validateCoupon(codeToApply, "courses", course.id);
    if (res.ok && res.discountPercent && res.coupon) {
      setCoupon(res.coupon.code);
      setAppliedCode(res.coupon.code);
      setDiscount(res.discountPercent / 100);
      setCouponMsg(`Success! ${res.discountPercent}% discount applied (${res.coupon.code}).`);
      try {
        sessionStorage.setItem("gamat_claimed_coupon", res.coupon.code);
      } catch {}
    } else {
      setAppliedCode(null);
      setDiscount(0);
      setCouponMsg(res.error || "That coupon code isn't valid.");
    }
  };

  const removeCoupon = () => {
    setCoupon("");
    setAppliedCode(null);
    setDiscount(0);
    setCouponMsg(null);
    try {
      sessionStorage.removeItem("gamat_claimed_coupon");
    } catch {}
  };

  const pay = (e: React.FormEvent) => {
    e.preventDefault();

    let activeDiscount = discount;
    let activeCode = appliedCode;
    if (coupon.trim() && coupon.trim().toUpperCase() !== appliedCode) {
      const check = validateCoupon(coupon, "courses", course.id);
      if (check.ok && check.discountPercent && check.coupon) {
        activeDiscount = check.discountPercent / 100;
        activeCode = check.coupon.code;
        setCoupon(check.coupon.code);
        setAppliedCode(check.coupon.code);
        setDiscount(activeDiscount);
        setCouponMsg(`Success! ${check.discountPercent}% discount applied (${check.coupon.code}).`);
      }
    }

    const finalDiscountAmt = Math.round(base * activeDiscount);
    const finalSubtotal = Math.max(0, base - finalDiscountAmt);
    const finalVat = Math.round(finalSubtotal * 0.075);
    const finalTotal = finalSubtotal + finalVat;

    setProcessing(true);

    const ref = generateTxRef("GFX");

    const completePayment = () => {
      enroll(course.id);
      recordPayment({
        userId: user!.id,
        userName: `${user!.firstName} ${user!.lastName}`,
        userEmail: user!.email,
        courseId: course.id,
        courseTitle: course.title,
        subtotal: base,
        vat: finalVat,
        discount: finalDiscountAmt,
        amount: finalTotal,
        method: selectedMethod,
        coupon: activeDiscount && activeCode ? activeCode : undefined,
      });
      try {
        sessionStorage.removeItem("gamat_claimed_coupon");
      } catch {}
      setProcessing(false);
      setDone(true);
      window.scrollTo({ top: 0 });
    };

    if (finalTotal > 0) {
      payWithBachs({
        amount: finalTotal,
        currency: "NGN",
        email: user!.email,
        name: `${user!.firstName} ${user!.lastName}`.trim(),
        phone: user!.phone,
        reference: ref,
        metadata: {
          course_id: course.id,
          student_id: user!.id,
          course_title: course.title,
          preferred_channel: selectedMethod,
        },
        onSuccess: () => completePayment(),
        onClose: () => setProcessing(false),
        onError: (err) => {
          setProcessing(false);
          alert(`Payment could not be completed: ${err.message}`);
        },
      });
    } else {
      setTimeout(completePayment, 600);
    }
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
      <section className="flex min-h-screen items-center justify-center bg-cream px-4 py-12 sm:px-6 sm:py-20">
        <div className="w-full max-w-lg rounded-3xl border border-line bg-white p-6 sm:p-10 text-center shadow-[0_22px_60px_-32px_rgba(22,24,28,0.4)]">
          <span className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-brand-light">
            <CheckCircle2 className="h-9 w-9 sm:h-11 sm:w-11 text-brand" />
          </span>
          <h1 className="mt-6 font-display text-2xl sm:text-3xl font-extrabold text-ink">Payment successful!</h1>
          <p className="mt-3 text-sm sm:text-base text-muted">You're now enrolled in <strong className="text-ink">{course.title}</strong>. A receipt has been sent to {user?.email}.</p>

          <div className="mt-7 rounded-2xl bg-cream p-4 sm:p-5 text-left text-sm">
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
    <section className="min-h-screen bg-cream px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-2">
          <Logo />
          <span className="inline-flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-muted">
            <ShieldCheck className="h-4 w-4 shrink-0 text-brand" /> Secure checkout
          </span>
        </div>

        <button onClick={() => navigate(`/courses/${course.id}`)} className="mt-6 sm:mt-8 inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-brand">
          <ArrowLeft className="h-4 w-4" /> Back to course
        </button>

        <div className="mt-5 sm:mt-6 grid gap-6 sm:gap-8 lg:grid-cols-[1.3fr_1fr]">
          {/* Payment form */}
          <form onSubmit={pay} className="rounded-3xl border border-line bg-white p-6 sm:p-9 shadow-[0_20px_50px_-30px_rgba(22,24,28,0.25)]">
            {/* Simple, Modern Header */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-brand">Checkout</span>
              <h1 className="mt-1 font-display text-2xl font-extrabold text-ink sm:text-3xl">
                Complete Enrollment
              </h1>
              <p className="mt-2 text-xs text-muted sm:text-sm">
                Enrolling as <strong className="text-ink font-semibold">{user?.firstName} {user?.lastName}</strong> ({user?.email})
              </p>
            </div>

            {/* Simple & Modern Payment Method Card */}
            <div className="mt-7">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2.5">
                Payment Method
              </label>

              <div className="flex items-center justify-between rounded-2xl border-2 border-brand/20 bg-brand/[0.03] p-4 transition">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-24 items-center justify-center rounded-xl bg-white border border-line shadow-xs px-2.5">
                    <img
                      src="/images/bachs-logo.png"
                      alt="Bachs"
                      className="h-4.5 w-auto object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">Bachs Checkout</p>
                    <p className="text-xs text-muted">Card, Bank Transfer, or Crypto</p>
                  </div>
                </div>

                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white shadow-xs">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={processing}
              className="btn-primary mt-8 w-full !py-4 text-base font-bold shadow-xl shadow-brand/20 transition hover:shadow-brand/30 disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
            >
              {processing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Launching Bachs Checkout…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> Pay {naira(total)}
                </>
              )}
            </button>

            {/* Minimal Trust Indicator */}
            <p className="mt-4 text-center text-xs text-muted flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Payments are 256-bit encrypted and processed securely by Bachs</span>
            </p>
          </form>

          {/* Summary */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-3xl border border-line bg-white p-5 sm:p-7 shadow-[0_22px_60px_-35px_rgba(22,24,28,0.35)]">
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
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted">Coupon code</label>
                  {appliedCode && (
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[11px] font-semibold text-muted underline hover:text-brand"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyCoupon();
                      }
                    }}
                    placeholder="WELCOME10"
                    className="w-full rounded-xl border border-line bg-cream px-4 py-2.5 font-mono text-sm uppercase tracking-wider text-ink placeholder-muted/60 outline-none transition focus:border-brand focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => applyCoupon()}
                    className="shrink-0 rounded-xl border border-ink/15 bg-ink px-4 text-sm font-semibold text-white transition hover:bg-brand hover:border-brand"
                  >
                    Apply
                  </button>
                </div>
                {couponMsg && (
                  <p className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${discount > 0 ? "text-emerald-600" : "text-brand"}`}>
                    <Tag className="h-3.5 w-3.5 shrink-0" /> {couponMsg}
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm">
                <Row l="Subtotal" v={naira(base)} />
                {discount > 0 && <Row l={`Discount (${Math.round(discount * 100)}% — ${appliedCode})`} v={`− ${naira(discountAmt)}`} accent />}
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
