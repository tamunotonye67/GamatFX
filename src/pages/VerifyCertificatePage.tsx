import { useMemo, useState } from "react";
import { Award, CheckCircle2, Search, ShieldAlert, ArrowUpRight } from "lucide-react";
import { useStore } from "../lib/store";
import { getCourse } from "../lib/courses";
import { formatAccountName } from "../lib/formatName";
import { navigate } from "../lib/router";

export function makeCertificateCode(userId: string, courseId: string): string {
  return `GMX-${userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}-${courseId.toUpperCase()}`;
}

export default function VerifyCertificatePage() {
  const { admin } = useStore();
  const initialQuery = useMemo(() => {
    const hashQ = window.location.hash.split("?")[1] || "";
    const params = new URLSearchParams(hashQ || window.location.search);
    return (params.get("id") || "").trim();
  }, []);

  const [code, setCode] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(initialQuery);

  const match = useMemo(() => {
    const clean = submitted.trim().toUpperCase();
    if (!clean) return null;

    for (const acc of admin.accounts) {
      const userAttempts = admin.attempts.filter((a) => a.userId === acc.id && a.passed);
      for (const att of userAttempts) {
        const expected = makeCertificateCode(acc.id, att.courseId);
        if (clean === expected) {
          const course = getCourse(att.courseId);
          return {
            code: expected,
            studentName: formatAccountName(acc),
            courseTitle: course?.title || att.courseId,
            score: att.score,
            issuedAt: att.submittedAt,
          };
        }
      }
    }
    return null;
  }, [submitted, admin.accounts, admin.attempts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(code.trim());
  };

  return (
    <div className="bg-cream py-14 sm:py-20">
      <div className="container-x max-w-2xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand-light px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand">
            <Award className="h-4 w-4" /> Official Credential Check
          </span>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl font-extrabold text-ink">
            Verify a GAMAT Fx Certificate
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted">
            Enter a student’s certificate ID to confirm completion and exam mastery.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col sm:flex-row gap-3 rounded-2xl border border-line bg-white p-3 shadow-xs"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. GMX-U1A2B3C4-PRICE-ACTION"
              className="w-full rounded-xl bg-cream/60 py-3 pl-10 pr-4 text-sm font-mono text-ink outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <button type="submit" className="btn-primary whitespace-nowrap">
            Verify ID
          </button>
        </form>

        {submitted && (
          <div className="mt-6 rounded-3xl border border-line bg-white p-8 shadow-xs">
            {match ? (
              <div className="text-center">
                <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Verified Official Certificate
                </p>
                <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">
                  {match.studentName}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Successfully completed <strong className="text-ink">{match.courseTitle}</strong>
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3 rounded-2xl border border-line bg-cream p-4 text-left text-xs">
                  <div>
                    <span className="block text-muted">Certificate ID</span>
                    <strong className="font-mono text-ink">{match.code}</strong>
                  </div>
                  <div>
                    <span className="block text-muted">Exam Score</span>
                    <strong className="text-ink">{match.score}% (Passed)</strong>
                  </div>
                  <div>
                    <span className="block text-muted">Issued Date</span>
                    <strong className="text-ink">
                      {new Date(match.issuedAt).toLocaleDateString()}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <ShieldAlert className="mx-auto h-12 w-12 text-amber-500" />
                <h2 className="mt-4 font-display text-xl font-bold text-ink">
                  Certificate not found
                </h2>
                <p className="mt-2 text-sm text-muted">
                  No verified certificate matched <span className="font-mono text-ink">{submitted}</span>.
                  Double-check the ID or ask the graduate for their direct verification link.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/courses")}
                  className="btn-outline-dark mt-6"
                >
                  Explore Courses <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
