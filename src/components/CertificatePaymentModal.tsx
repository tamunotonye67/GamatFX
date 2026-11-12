import { useState } from "react";
import { Award, CheckCircle2, Lock, ShieldCheck, CreditCard, Building2, Loader2, Check, ArrowRight, X, Copy } from "lucide-react";
import { useStore } from "../lib/store";
import { getCourse, naira, asCourse, COURSE_ALIASES } from "../lib/courses";
import { payWithBachs, generateTxRef } from "../lib/bachs";
import { CONTACT } from "../lib/contact";
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
  const [method, setMethod] = useState<"card" | "transfer">("card");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedAcct, setCopiedAcct] = useState(false);

  if (!isOpen) return null;

  const builtIn = getCourse(courseId);
  const managed = managedCourses.find((m) => m.id === courseId);
  const course = builtIn ?? (managed ? asCourse(managed) : undefined);
  const best = bestAttempt(courseId);
  const fee = 10000;
  const txRef = generateTxRef("CERT");

  const handlePayWithBachs = () => {
    if (!user) return;
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

  const handleConfirmTransfer = async () => {
    if (!user) return;
    setProcessing(true);
    await payCertificateFee(courseId, "transfer", txRef);
    setProcessing(false);
    setSuccess(true);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-white shadow-2xl">
        {/* Top accent bar */}
        <div className="h-2.5 w-full bg-gradient-to-r from-brand via-amber-500 to-brand" />

        <button
          onClick={onClose}
          className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-cream text-muted transition hover:bg-line hover:text-ink cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-8">
          {success ? (
            <div className="text-center py-4">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-9 w-9" />
              </span>
              <h2 className="mt-4 font-display text-2xl font-extrabold text-ink">
                Certificate Unlocked!
              </h2>
              <p className="mt-2 text-sm text-muted">
                Your official accredited certificate for <strong className="text-ink">{course?.title}</strong> is now verified and available for immediate download in your dashboard.
              </p>
              <button
                onClick={() => {
                  onClose();
                  navigate("/dashboard");
                }}
                className="btn-primary mt-6 w-full !py-3.5"
              >
                View Certificate in Dashboard <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand">
                  <Award className="h-6 w-6" />
                </span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand">
                    Accredited Certification
                  </span>
                  <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
                    Unlock Official Certificate
                  </h2>
                  <p className="mt-0.5 text-xs text-muted">
                    {course?.title || "GAMAT Fx Academy"}
                  </p>
                </div>
              </div>

              {/* Exam Passed Confirmation Badge */}
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                    <Check className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-emerald-950">Examination Passed</p>
                    <p className="text-[11px] text-emerald-700">
                      Score: {best?.score ?? 70}% (Required: 70%)
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-200/80 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-900">
                  Qualified
                </span>
              </div>

              {/* Pricing breakdown */}
              <div className="mt-4 rounded-2xl border border-line bg-cream/70 p-4 space-y-2 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Certificate Issuance & Accreditation:</span>
                  <span className="font-semibold text-ink">{naira(fee)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Anti-tamper Verification & Serial Number:</span>
                  <span className="font-semibold text-emerald-700">Included (Free)</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Print-Ready High-Res PNG Download:</span>
                  <span className="font-semibold text-emerald-700">Included (Free)</span>
                </div>
                <div className="pt-2 border-t border-line flex justify-between text-sm font-extrabold text-ink">
                  <span>Total Certification Fee:</span>
                  <span className="text-brand text-base">{naira(fee)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="mt-5 space-y-2">
                <label className="block text-xs font-bold text-ink uppercase tracking-wider">
                  Select Payment Option
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setMethod("card")}
                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition cursor-pointer ${
                      method === "card"
                        ? "border-brand bg-brand-light text-brand font-bold"
                        : "border-line bg-white text-muted hover:border-brand/40"
                    }`}
                  >
                    <CreditCard className="h-4 w-4 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Pay via Bachs</p>
                      <p className="text-[10px] text-muted">Card, USSD, Crypto</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod("transfer")}
                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition cursor-pointer ${
                      method === "transfer"
                        ? "border-brand bg-brand-light text-brand font-bold"
                        : "border-line bg-white text-muted hover:border-brand/40"
                    }`}
                  >
                    <Building2 className="h-4 w-4 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Bank Transfer</p>
                      <p className="text-[10px] text-muted">Direct Academy Account</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Bank Transfer Details Box */}
              {method === "transfer" && (
                <div className="mt-4 rounded-2xl border border-line bg-amber-50/50 p-4 text-xs space-y-2.5">
                  <p className="font-bold text-amber-950 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-amber-800" /> Transfer to Official GAMAT Account:
                  </p>
                  <div className="bg-white rounded-xl border border-amber-200/80 p-3 space-y-1">
                    <p className="text-muted">Bank Name: <strong className="text-ink">Moniepoint MFB</strong></p>
                    <div className="flex items-center justify-between">
                      <p className="text-muted">
                        Account No: <strong className="text-ink text-sm">8061949891</strong>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("8061949891");
                          setCopiedAcct(true);
                          setTimeout(() => setCopiedAcct(false), 2000);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:underline"
                      >
                        <Copy className="h-3 w-3" /> {copiedAcct ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="text-muted">Account Name: <strong className="text-ink">GAMAT FX ACADEMY</strong></p>
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-muted">Payment Ref: <strong>{txRef}</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(txRef);
                          setCopiedRef(true);
                          setTimeout(() => setCopiedRef(false), 2000);
                        }}
                        className="inline-flex items-center gap-1 font-bold text-brand hover:underline"
                      >
                        <Copy className="h-3 w-3" /> {copiedRef ? "Copied" : "Copy Ref"}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <a
                      href={`https://wa.me/2348061949891?text=${encodeURIComponent(
                        `Hi GAMAT Academy, I completed payment of ₦10,000 for my Certificate (${course?.title}). Ref: ${txRef}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      Notify on WhatsApp (Instant Confirm)
                    </a>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-2.5">
                {method === "card" ? (
                  <button
                    type="button"
                    onClick={handlePayWithBachs}
                    disabled={processing}
                    className="btn-primary w-full !py-3.5 font-bold shadow-lg shadow-brand/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Launching Checkout...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" /> Pay {naira(fee)} & Unlock Certificate
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConfirmTransfer}
                    disabled={processing}
                    className="btn-primary w-full !py-3.5 font-bold shadow-lg shadow-brand/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" /> I Have Sent {naira(fee)} (Unlock Certificate)
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="btn-outline-dark w-full !py-2.5 text-xs"
                >
                  Close & Pay Later
                </button>
              </div>

              <p className="mt-3 text-center text-[10px] text-muted flex items-center justify-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                Verified & Accredited by GAMAT Fx Academy · 100% Guaranteed Issuance
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
