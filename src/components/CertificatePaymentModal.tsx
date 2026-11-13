import { useState } from "react";
import { Award, CheckCircle2, Lock, ShieldCheck, Loader2, Check, X } from "lucide-react";
import { useStore } from "../lib/store";
import { getCourse, naira, asCourse } from "../lib/courses";
import { payWithBachs, generateTxRef } from "../lib/bachs";
import { navigate } from "../lib/router";

interface CertificatePaymentModalProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CertificatePaymentModal({
  courseId,
  isOpen,
  onClose,
  onSuccess,
}: CertificatePaymentModalProps) {
  const { user, payCertificateFee, managedCourses, bestAttempt } = useStore();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const builtIn = getCourse(courseId);
  const managed = managedCourses.find((m) => m.id === courseId);
  const course = builtIn ?? (managed ? asCourse(managed) : undefined);
  const best = bestAttempt(courseId);
  const fee = 10000;
  const txRef = generateTxRef("CERT");

  const handlePay = () => {
    if (!user) {
      navigate(`/login?next=/quiz/${courseId}`);
      return;
    }
    setProcessing(true);

    payWithBachs({
      amount: fee,
      currency: "NGN",
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim(),
      phone: user.phone,
      reference: txRef,
      metadata: {
        type: "certificate_fee",
        course_id: courseId,
        course_title: course?.title || courseId,
        student_id: user.id,
        student_name: `${user.firstName} ${user.lastName}`.trim(),
      },
      onSuccess: async (session) => {
        await payCertificateFee(courseId, "card", session.reference || txRef);
        setProcessing(false);
        setSuccess(true);
        if (onSuccess) onSuccess();
      },
      onClose: () => setProcessing(false),
      onError: (err) => {
        setProcessing(false);
        alert(`Payment notice: ${err.message}`);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-line bg-white shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-cream text-muted transition hover:bg-line hover:text-ink cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-7">
          {success ? (
            <div className="text-center py-4">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-9 w-9" />
              </span>
              <h2 className="mt-4 font-display text-2xl font-extrabold text-ink">
                Certificate Unlocked!
              </h2>
              <p className="mt-2 text-sm text-muted">
                Your official accredited certificate for <strong className="text-ink">{course?.title}</strong> is now verified and ready in your dashboard.
              </p>
              <button
                onClick={() => {
                  onClose();
                  navigate("/dashboard");
                }}
                className="btn-primary mt-6 w-full !py-3.5 font-bold"
              >
                View Certificate in Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-brand">Checkout</span>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-ink">
                  Unlock Certificate
                </h2>
                <p className="mt-1 text-xs text-muted sm:text-sm">
                  {course?.title || "GAMAT Fx Academy"}
                </p>
              </div>

              {/* Exam Passed pill */}
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  <p className="text-xs font-bold text-emerald-950">
                    <span className="sm:hidden">Exam Passed</span>
                    <span className="hidden sm:inline">Examination Passed</span>
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-700">
                  Score: {best?.score ?? 70}%
                </span>
              </div>

              {/* Order & Payment Summary */}
              <div className="mt-4 rounded-2xl border border-line bg-cream/70 p-4 space-y-2 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Accredited Certificate &amp; Serial:</span>
                  <span className="font-semibold text-ink">{naira(fee)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Print-Ready High-Res Download:</span>
                  <span className="font-semibold text-emerald-700">Included Free</span>
                </div>
                <div className="pt-2 border-t border-line flex justify-between items-baseline text-sm font-extrabold text-ink">
                  <span>Total Due:</span>
                  <span className="text-brand font-display text-xl">{naira(fee)}</span>
                </div>
              </div>

              {/* Payment Method - Bachs (Matches CheckoutPage) */}
              <div className="mt-5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
                  Payment Method
                </label>
                <div className="flex items-center justify-between rounded-2xl border-2 border-brand/20 bg-brand/[0.03] p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-20 items-center justify-center rounded-xl bg-white border border-line shadow-xs px-2">
                      <img
                        src="/images/bachs-logo.png"
                        alt="Bachs"
                        className="h-4 w-auto object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-ink">Bachs Checkout</p>
                      <p className="text-[11px] text-muted">Card, Bank Transfer, or Crypto</p>
                    </div>
                  </div>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white shadow-xs">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              <button
                type="button"
                onClick={handlePay}
                disabled={processing}
                className="btn-primary mt-6 w-full !py-3.5 text-sm font-bold shadow-xl shadow-brand/20 transition hover:shadow-brand/30 disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Launching Bachs Checkout…
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" /> Pay {naira(fee)} with Bachs
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="mt-2.5 w-full py-2 text-xs font-semibold text-muted hover:text-ink transition cursor-pointer text-center"
              >
                Close &amp; Pay Later
              </button>

              {/* Minimal Trust Indicator */}
              <p className="mt-3 text-center text-[11px] text-muted flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>256-bit encrypted and processed securely by Bachs</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
