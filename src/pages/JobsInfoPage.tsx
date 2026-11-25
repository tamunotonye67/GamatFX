import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  Globe2,
  HelpCircle,
  Send,
  ShieldCheck,
} from "lucide-react";
import Logo from "../components/Logo";
import { navigate } from "../lib/router";
import { useStore } from "../lib/store";

export type JobsInfoSection =
  | "guidelines"
  | "culture"
  | "certificates"
  | "conduct"
  | "report"
  | "faq";

const SECTION_CONTENT: Record<
  Exclude<JobsInfoSection, "report" | "faq">,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    icon: typeof Globe2;
    highlights: Array<{ title: string; body: string }>;
  }
> = {
  guidelines: {
    eyebrow: "GAMAT Fx Fellowship",
    title: "Volunteer & Fellowship Guidelines",
    subtitle:
      "Clear expectations, flexible async collaboration, and real portfolio ownership for every contributor.",
    icon: FileCheck2,
    highlights: [
      {
        title: "Flexible Remote Commitment",
        body: "Contribute 6–12 hours per week around your trading sessions, studies, or full-time schedule with async check-ins.",
      },
      {
        title: "Real Production Ownership",
        body: "Every fellow ships tangible deliverables — from live market breakdowns and React UI tools to curriculum playbooks.",
      },
      {
        title: "Direct Mentor Feedback",
        body: "Receive structured weekly reviews from GAMAT Fx leads so your skills and portfolio improve rapidly.",
      },
      {
        title: "Open Communication",
        body: "Use our private team channels to coordinate deliverables, flag blockers early, and collaborate across time zones.",
      },
    ],
  },
  culture: {
    eyebrow: "How We Work",
    title: "Remote-First Culture",
    subtitle:
      "One connected trading, engineering, and education team operating seamlessly across Lagos, London, and New York sessions.",
    icon: Globe2,
    highlights: [
      {
        title: "Built Around Market Sessions",
        body: "Collaborate during London and New York liquidity windows or contribute asynchronously from anywhere in the world.",
      },
      {
        title: "Zero Corporate Bloat",
        body: "Skip endless status meetings — we value shipped work, clear writing, and high-trust execution.",
      },
      {
        title: "Cross-Disciplinary Desks",
        body: "Engineers, FX analysts, video editors, and student success leads work side-by-side on shared academy goals.",
      },
      {
        title: "Complimentary Academy Access",
        body: "Active fellows receive full access to GAMAT Fx courses, live market outlooks, and interactive study tools.",
      },
    ],
  },
  certificates: {
    eyebrow: "Recognition & Growth",
    title: "Experience Certificates & Paid Path",
    subtitle:
      "Every completed fellowship milestone is backed by verifiable proof and a priority pathway into paid roles.",
    icon: Award,
    highlights: [
      {
        title: "Verifiable Serial Certificates",
        body: "Graduating fellows receive an official GAMAT Fx Experience Certificate verifiable online via our certificate portal.",
      },
      {
        title: "Portfolio & Case Study Credit",
        body: "Showcase your shipped code, market research, or creative assets publicly in your personal portfolio.",
      },
      {
        title: "Priority Path to Paid Seats",
        body: "Top-performing volunteers are first in line whenever paid analyst, engineering, or operations roles open up.",
      },
      {
        title: "Founder & Lead References",
        body: "Outstanding contributors receive direct recommendation letters and LinkedIn endorsements from team leads.",
      },
    ],
  },
  conduct: {
    eyebrow: "Standards & Trust",
    title: "Fellowship Code of Conduct",
    subtitle:
      "Maintaining a high-integrity, respectful, and disciplined environment for our team and 1,000+ students.",
    icon: ShieldCheck,
    highlights: [
      {
        title: "Integrity First",
        body: "Never promise guaranteed trading profits, solicit student funds, or promote unauthorized third-party signals.",
      },
      {
        title: "Respect & Professionalism",
        body: "Treat fellow contributors and students with patience, clarity, and constructive feedback at all times.",
      },
      {
        title: "Data & Privacy Protection",
        body: "Keep student records, internal tools, and proprietary academy materials strictly confidential.",
      },
      {
        title: "Accountability",
        body: "Communicate ahead of time if you need a break or cannot meet a scheduled session or deliverable deadline.",
      },
    ],
  },
};

const HIRING_FAQS: Array<{ q: string; a: string }> = [
  {
    q: "How does the GAMAT Fx Volunteer Fellowship work?",
    a: "Our Fellowship is a remote, project-based program where analysts, developers, designers, marketers, and writers collaborate directly with the GAMAT Fx team on live academy initiatives. You build real-world proof of work while receiving mentor feedback.",
  },
  {
    q: "Are these roles paid, or can they lead to paid positions?",
    a: "Most open tracks start as Volunteer Fellowships (typically 6–12 hours/week) with verified completion certificates and portfolio credits. High-performing fellows who ship consistently are prioritized when paid contract or full-time roles open up.",
  },
  {
    q: "Do I need to be a GAMAT Fx student before applying?",
    a: "No. While familiarity with forex markets and trading education is a plus—especially for Trading & Analysis roles—we welcome skilled builders, designers, writers, and community operators from outside the academy as well.",
  },
  {
    q: "What is the weekly time commitment and schedule?",
    a: "Most roles are flexible and asynchronous, requiring 6–12 hours per week. We coordinate across Lagos, London, and New York time zones using async updates and short weekly syncs, so you can contribute alongside school, trading, or a day job.",
  },
  {
    q: "What do I receive after completing a Fellowship term?",
    a: "Contributors who complete their term receive a verified GAMAT Fx Fellowship Certificate (verifiable on our certificate portal), a written recommendation letter upon request, public portfolio attribution, and priority access to academy resources.",
  },
  {
    q: "How long does the application review take?",
    a: "Our team reviews applications on a rolling basis. Shortlisted candidates usually hear back by email within 5–7 business days for a brief intro chat or a short practical task relevant to the role.",
  },
  {
    q: "Can I apply for more than one role or department?",
    a: "Yes—you can browse our six skill tracks on the Careers page and apply to any open role that matches your strengths. We recommend tailoring your portfolio link and cover note to each specific position.",
  },
  {
    q: "Who can I contact if I have questions about my application?",
    a: "You can reach our team directly at support@gamatfxacademy.com or submit a message via the Report an Issue tab on this page.",
  },
];

export default function JobsInfoPage({
  section,
}: {
  section: JobsInfoSection;
}) {
  const { user } = useStore();
  const [issueSubject, setIssueSubject] = useState("");
  const [issueEmail, setIssueEmail] = useState(user?.email || "");
  const [issueDetails, setIssueDetails] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const goToMainRoute = (path: string) => {
    const clean = path.startsWith("/") ? path : `/${path}`;
    if (
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
    ) {
      navigate(clean);
    } else {
      window.location.href = `https://gamatfxacademy.com${clean}`;
    }
  };

  const tabs: Array<{ id: JobsInfoSection; label: string; route: string }> = [
    { id: "faq", label: "Hiring FAQ", route: "/jobs/faq" },
    { id: "guidelines", label: "Guidelines", route: "/jobs/guidelines" },
    { id: "culture", label: "Remote Culture", route: "/jobs/culture" },
    { id: "certificates", label: "Certificates & Paid Path", route: "/jobs/certificates" },
    { id: "conduct", label: "Code of Conduct", route: "/jobs/conduct" },
    { id: "report", label: "Report an Issue", route: "/jobs/report" },
  ];

  const info =
    section !== "report" && section !== "faq" ? SECTION_CONTENT[section] : null;
  const Icon = info?.icon || ShieldCheck;

  return (
    <div className="min-h-screen bg-[#111215] text-white selection:bg-brand selection:text-white">
      <header className="border-b border-white/10 bg-[#111215]">
        <div className="mx-auto flex min-h-[84px] max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate("/jobs")}
            className="cursor-pointer"
          >
            <Logo variant="light" size="md" asDiv />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/jobs")}
              aria-label="Back to Careers"
              title="Back to Careers"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-xs font-semibold text-white/90 hover:bg-white/10 transition cursor-pointer sm:h-auto sm:w-auto sm:gap-1.5 sm:px-4 sm:py-1.5"
            >
              <ArrowLeft className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">Back to Careers</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/jobs/opportunities")}
              aria-label="Explore Opportunities"
              title="Explore Opportunities"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs font-bold text-white hover:bg-brand-dark transition cursor-pointer sm:h-auto sm:w-auto sm:gap-1.5 sm:px-4 sm:py-1.5"
            >
              <Briefcase className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Explore Opportunities</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-8">
        {/* Section switcher pills (horizontally scrollable on mobile) */}
        <div className="mb-8 sm:mb-10 -mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.route)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                section === tab.id
                  ? "bg-brand text-white"
                  : "border border-white/15 bg-[#16181d] text-white/70 hover:border-white/30 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {section === "report" ? (
          <div className="rounded-3xl border border-white/10 bg-[#16181d] p-6 sm:p-10 shadow-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Support &amp; Trust
            </span>
            <h1 className="mt-2 font-sans text-3xl sm:text-4xl font-medium tracking-tight text-white">
              Report an Issue
            </h1>
            <p className="mt-2 text-sm text-white/65">
              Spotted a bug, broken link, or concern on{" "}
              <span className="text-white/90">jobs.gamatfxacademy.com</span>? Let
              our team know below or email{" "}
              <a
                href="mailto:support@gamatfxacademy.com"
                className="text-rose-400 underline hover:text-rose-300"
              >
                support@gamatfxacademy.com
              </a>
              .
            </p>

            {reportSent ? (
              <div className="mt-8 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
                <h2 className="mt-3 text-lg font-semibold text-white">
                  Report received
                </h2>
                <p className="mt-1 text-sm text-white/65">
                  Thank you for helping us keep GAMAT Fx Careers reliable. Our
                  team will review this shortly.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/jobs")}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs font-bold text-ink hover:bg-cream cursor-pointer"
                >
                  Back to Careers <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!issueSubject.trim() || !issueDetails.trim()) return;
                  setReportSent(true);
                  setIssueSubject("");
                  setIssueDetails("");
                }}
                className="mt-8 space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/75">
                      Your Email
                    </label>
                    <input
                      type="email"
                      required
                      value={issueEmail}
                      onChange={(e) => setIssueEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/15 bg-[#111215] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/75">
                      Issue Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={issueSubject}
                      onChange={(e) => setIssueSubject(e.target.value)}
                      placeholder="e.g. Application form or role link"
                      className="w-full rounded-xl border border-white/15 bg-[#111215] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/75">
                    Details
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={issueDetails}
                    onChange={(e) => setIssueDetails(e.target.value)}
                    placeholder="Describe what happened or what needs attention..."
                    className="w-full rounded-xl border border-white/15 bg-[#111215] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-bold text-white shadow-lg shadow-brand/30 hover:bg-brand-dark cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" /> Submit Issue Report
                </button>
              </form>
            )}
          </div>
        ) : section === "faq" ? (
          <div className="space-y-8">
            <div className="rounded-3xl border border-white/10 bg-[#16181d] p-7 sm:p-10 shadow-2xl">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-brand/40 bg-brand/15 text-brand">
                <HelpCircle className="h-5 w-5" />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
                Careers &amp; Fellowship FAQ
              </p>
              <h1 className="mt-2 font-sans text-3xl sm:text-4xl font-medium tracking-tight text-white">
                Frequently Asked Questions
              </h1>
              <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-white/65">
                Everything you need to know about applying, remote collaboration,
                certificates, and growing with the GAMAT Fx team.
              </p>
            </div>

            <div className="space-y-3">
              {HIRING_FAQS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={item.q}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#16181d] transition hover:border-white/20"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
                    >
                      <span className="font-sans text-sm sm:text-base font-semibold text-white">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-white/60 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-brand" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-white/10 px-6 pb-5 pt-4 text-sm leading-relaxed text-white/70">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5">
              <div>
                <p className="font-sans text-sm font-semibold text-white">
                  Ready to join the team?
                </p>
                <p className="text-xs text-white/60">
                  Browse open positions or reach out to our team if your question
                  isn&apos;t listed above.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate("/jobs/report")}
                  className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/85 hover:bg-white/10 cursor-pointer"
                >
                  Ask a Question
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/jobs/opportunities")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2 text-xs font-bold text-white hover:bg-brand-dark cursor-pointer"
                >
                  Browse Open Roles <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          info && (
            <div className="space-y-8">
              <div className="rounded-3xl border border-white/10 bg-[#16181d] p-7 sm:p-10 shadow-2xl">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-brand/40 bg-brand/15 text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-brand">
                  {info.eyebrow}
                </p>
                <h1 className="mt-2 font-sans text-3xl sm:text-4xl font-medium tracking-tight text-white">
                  {info.title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-white/65">
                  {info.subtitle}
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {info.highlights.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-[#16181d] p-6"
                  >
                    <h2 className="font-sans text-base font-semibold text-white">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#16181d] p-6">
                <div>
                  <div className="text-sm font-semibold text-white">
                    Ready to contribute with GAMAT Fx?
                  </div>
                  <div className="text-xs text-white/55 mt-0.5">
                    Explore open volunteer tracks or verify an existing
                    certificate.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => navigate("/jobs/opportunities")}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-ink hover:bg-cream cursor-pointer"
                  >
                    Explore Opportunities <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goToMainRoute("/verify-certificate")}
                    className="rounded-full border border-white/20 bg-white/[0.04] px-5 py-2.5 text-xs font-semibold text-white/90 hover:bg-white/10 cursor-pointer"
                  >
                    Verify Certificate
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}
