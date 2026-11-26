import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Lock,
  MapPin,
  Search,
  Send,
  Share2,
  Upload,
  X,
} from "lucide-react";
import Logo from "../components/Logo";
import {
  fetchSupabaseJobApplications,
  fetchSupabaseJobRoles,
  loadJobApplications,
  loadJobRoles,
  makeFellowshipCertificateCode,
  saveJobApplications,
  submitSupabaseJobApplication,
  type JobApplication,
  type JobApplicationStatus,
  type JobDepartment,
  type JobRole,
  type JobType,
} from "../lib/jobs";
import { navigate } from "../lib/router";
import { useStore } from "../lib/store";
import { uploadJobFile } from "../lib/supabaseStorage";

const DEPARTMENTS: Array<"All" | JobDepartment> = [
  "All",
  "Dev & IT",
  "Trading & Analysis",
  "Design & Creative",
  "Marketing",
  "Admin & Support",
  "Writing & Content",
];

const DEPARTMENT_THUMBNAILS: Record<JobDepartment, string> = {
  "Dev & IT":
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80",
  "Trading & Analysis":
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=80",
  "Design & Creative":
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=80",
  Marketing:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
  "Admin & Support":
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
  "Writing & Content":
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
};

function getRoleThumbnail(role: JobRole): string {
  return role.image || DEPARTMENT_THUMBNAILS[role.department];
}

const SKILL_SHOWCASE: Array<{
  label: string;
  dept: JobDepartment;
  image: string;
}> = [
  {
    label: "Dev & IT",
    dept: "Dev & IT",
    image: "/images/fellows/dev-it.jpg",
  },
  {
    label: "Trading",
    dept: "Trading & Analysis",
    image: "/images/fellows/trading.jpg",
  },
  {
    label: "Design",
    dept: "Design & Creative",
    image: "/images/fellows/design.jpg",
  },
  {
    label: "Marketing",
    dept: "Marketing",
    image: "/images/fellows/marketing.jpg",
  },
  {
    label: "Support",
    dept: "Admin & Support",
    image: "/images/fellows/support.jpg",
  },
  {
    label: "Writing",
    dept: "Writing & Content",
    image: "/images/fellows/writing.jpg",
  },
];

export default function JobsOpportunitiesPage() {
  const { user } = useStore();
  const [roles, setRoles] = useState<JobRole[]>(() => loadJobRoles());
  const [apps, setApps] = useState<JobApplication[]>(() => loadJobApplications());
  const [viewTab, setViewTab] = useState<"roles" | "applications">("roles");
  const [dept, setDept] = useState<"All" | JobDepartment>("All");
  const [jobTypeFilter, setJobTypeFilter] = useState<"All" | JobType>("All");
  const [query, setQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);
  const deepLinkHandledRef = useRef(false);

  // Application form state
  const [name, setName] = useState(
    user ? `${user.firstName} ${user.lastName}`.trim() : ""
  );
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [cvFileName, setCvFileName] = useState("");
  const [uploadingCv, setUploadingCv] = useState(false);
  const [experience, setExperience] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    void fetchSupabaseJobRoles().then((remote) => {
      if (remote.length > 0) setRoles(remote);
    });
    void fetchSupabaseJobApplications().then((remoteApps) => {
      setApps(remoteApps);
    });
  }, []);

  const allOpenRoles = useMemo(() => roles.filter((r) => r.open), [roles]);

  // Support deep links like /jobs/opportunities?job=job_123
  useEffect(() => {
    if (deepLinkHandledRef.current || allOpenRoles.length === 0 || !user) return;
    const hash = window.location.hash || "";
    const hashQuery = hash.includes("?") ? hash.split("?")[1] : "";
    const params = new URLSearchParams(hashQuery || window.location.search);
    const jobId = params.get("job");
    if (jobId) {
      const match = allOpenRoles.find((r) => r.id === jobId);
      if (match) {
        deepLinkHandledRef.current = true;
        setSelectedRole(match);
      }
    }
  }, [allOpenRoles, user]);

  const openRoles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allOpenRoles.filter((r) => {
      const matchDept = dept === "All" || r.department === dept;
      const matchType = jobTypeFilter === "All" || r.type === jobTypeFilter;
      const matchQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q);
      return matchDept && matchType && matchQuery;
    });
  }, [allOpenRoles, dept, jobTypeFilter, query]);

  const myApplications = useMemo(() => {
    const userEmail = (user?.email || "").trim().toLowerCase();
    if (!userEmail) return [];
    return apps.filter((a) => a.email.trim().toLowerCase() === userEmail);
  }, [apps, user]);

  const copyJobLink = (roleId: string) => {
    const url = `${window.location.origin}/jobs/opportunities?job=${encodeURIComponent(roleId)}`;
    void navigator.clipboard?.writeText(url);
    setCopiedJobId(roleId);
    window.setTimeout(() => {
      setCopiedJobId((prev) => (prev === roleId ? null : prev));
    }, 2000);
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCv(true);
    setErrorMsg("");
    const res = await uploadJobFile("cv", file);
    if (res.ok && res.url) {
      setCvUrl(res.url);
      setCvFileName(res.fileName || file.name);
    } else {
      setErrorMsg(res.error || "Unable to upload CV. You can paste a link instead.");
    }
    setUploadingCv(false);
    e.target.value = "";
  };

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

  const openModal = (role: JobRole) => {
    setSelectedRole(role);
    setSubmittedRef(null);
    setErrorMsg("");
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg(
        "Please fill in your full name, email address, and phone number."
      );
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    const refCode = `JOB-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const app: JobApplication = {
      id: `jobapp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ref: refCode,
      jobId: selectedRole.id,
      jobTitle: selectedRole.title,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      portfolioUrl: portfolioUrl.trim(),
      ...(cvUrl ? { cvUrl, cvFileName } : {}),
      experience: experience.trim(),
      coverNote: coverNote.trim(),
      status: "new",
      createdAt: new Date().toISOString(),
    };

    const existing = loadJobApplications();
    const nextApps = [app, ...existing];
    setApps(nextApps);
    saveJobApplications(nextApps);
    await submitSupabaseJobApplication(app);

    setSubmitting(false);
    setSubmittedRef(refCode);
    setPhone("");
    setPortfolioUrl("");
    setCvUrl("");
    setCvFileName("");
    setExperience("");
    setCoverNote("");
  };

  return (
    <div className="min-h-screen bg-[#111215] text-white selection:bg-brand selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111215]/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-[84px] max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate("/jobs")}
            className="cursor-pointer"
          >
            <Logo variant="light" size="md" asDiv />
          </button>

          <div className="flex items-center gap-2.5">
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
            {user && (
              <button
                type="button"
                onClick={() => goToMainRoute("/dashboard")}
                className="rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-dark transition cursor-pointer"
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Sign-in Gate if not logged in */}
      {!user ? (
        <main className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand/40 bg-brand/15 text-brand">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-6 font-sans text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Sign in to Explore Opportunities
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-base">
            Open positions and direct role applications are reserved for
            registered GAMAT Fx members. Sign up or log in to view all live
            opportunities.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => goToMainRoute("/signup")}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-sm font-bold text-white shadow-lg shadow-brand/30 hover:bg-brand-dark transition cursor-pointer"
            >
              Create Account / Login <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/jobs")}
              className="rounded-full border border-white/20 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition cursor-pointer"
            >
              Back to Careers
            </button>
          </div>
        </main>
      ) : (
        <main className="mx-auto max-w-[1440px] px-4 py-14 sm:px-8">
          {/* Welcome, onboard! & 6 portrait cards */}
          <section className="mb-12">
            <div className="relative overflow-hidden rounded-2xl border border-amber-300/60 bg-gradient-to-br from-[#fde047] via-[#facc15] to-[#f59e0b] p-5 sm:p-7 shadow-2xl">
              {/* Organic wobble, paint splash & subtle watermark layers */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                {/* Soft sunlit highlight splash top-left */}
                <div className="absolute -left-16 -top-20 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
                {/* Deep warm amber wobble bottom-center */}
                <div className="absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-[#d97706]/25 blur-3xl" />

                {/* Organic liquid splash & paint wobble SVG */}
                <svg
                  viewBox="0 0 800 500"
                  preserveAspectRatio="none"
                  className="absolute inset-0 h-full w-full"
                >
                  <path
                    d="M-30,110 C70,40 160,170 250,95 C340,20 420,140 520,85 C610,35 710,120 840,60 L840,-30 L-30,-30 Z"
                    fill="rgba(255,255,255,0.16)"
                  />
                  <path
                    d="M-40,420 C60,340 140,450 260,375 C380,300 470,440 610,360 C710,305 780,360 840,330 L840,530 L-40,530 Z"
                    fill="rgba(180,83,9,0.12)"
                  />
                  {/* Playful organic splash blob behind left writeup */}
                  <path
                    d="M330,180 C375,145 435,175 450,225 C465,275 425,335 365,345 C305,355 255,310 265,255 C272,215 295,205 330,180 Z"
                    fill="rgba(255,255,255,0.18)"
                  />
                  {/* Micro splash droplets */}
                  <circle cx="475" cy="155" r="10" fill="rgba(17,18,21,0.06)" />
                  <circle cx="496" cy="176" r="5" fill="rgba(255,255,255,0.35)" />
                  <circle cx="92" cy="390" r="14" fill="rgba(17,18,21,0.05)" />
                  <circle cx="122" cy="408" r="6" fill="rgba(255,255,255,0.30)" />
                  <circle cx="415" cy="68" r="8" fill="rgba(180,83,9,0.14)" />
                </svg>

                {/* Subtle oversized GAMAT watermark */}
                <span className="absolute -bottom-6 left-6 select-none font-display text-[88px] sm:text-[120px] font-black uppercase tracking-tighter text-[#111215]/[0.05] leading-none">
                  GAMAT Fx
                </span>
              </div>

              <div className="relative z-10 grid grid-cols-1 gap-7 lg:grid-cols-12 lg:items-center">
                {/* Left part: Welcome, onboard! with writeups */}
                <div className="flex flex-col justify-center lg:col-span-5 lg:pr-4">
                  <h2 className="font-sans text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-[1.08] tracking-tight text-[#111215]">
                    {user?.firstName ? `Welcome aboard, ${user.firstName}!` : "Welcome aboard!"}
                  </h2>

                  <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#111215]/85 font-medium">
                    We are building the next generation of disciplined traders,
                    engineers, designers, and market educators. Whether you are
                    joining a volunteer fellowship track or a core team role,
                    your work directly shapes how students learn and grow.
                  </p>

                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#111215]/70 font-medium">
                    Pick a track below, share your work or CV, and build real
                    products alongside our global team.
                  </p>
                </div>

                {/* Right part: Mobile swipeable snap carousel; sm+ 6 tall slim vertical portrait cards */}
                <div className="lg:col-span-7">
                  <div className="flex h-[250px] sm:h-[380px] lg:h-[400px] items-stretch gap-2.5 sm:gap-2 overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none no-scrollbar -mx-1 px-1 sm:mx-0 sm:px-0">
                    {SKILL_SHOWCASE.map((item, idx) => {
                      const themes = [
                        {
                          bg: "bg-[#e2a72e]",
                          fade: "from-[#e2a72e] via-[#e2a72e]/40",
                          text: "text-[#1a1204]",
                          arrow: "text-[#1a1204]/10",
                          sub: "TRACK 01",
                        },
                        {
                          bg: "bg-[#5a0b8c]",
                          fade: "from-[#5a0b8c] via-[#5a0b8c]/40",
                          text: "text-white",
                          arrow: "text-black/25",
                          sub: "TRACK 02",
                        },
                        {
                          bg: "bg-[#e8245e]",
                          fade: "from-[#e8245e] via-[#e8245e]/40",
                          text: "text-white",
                          arrow: "text-black/20",
                          sub: "TRACK 03",
                        },
                        {
                          bg: "bg-[#1d4ed8]",
                          fade: "from-[#1d4ed8] via-[#1d4ed8]/40",
                          text: "text-white",
                          arrow: "text-black/25",
                          sub: "TRACK 04",
                        },
                        {
                          bg: "bg-[#e2a72e]",
                          fade: "from-[#e2a72e] via-[#e2a72e]/40",
                          text: "text-[#1a1204]",
                          arrow: "text-[#1a1204]/10",
                          sub: "TRACK 05",
                        },
                        {
                          bg: "bg-[#e8245e]",
                          fade: "from-[#e8245e] via-[#e8245e]/40",
                          text: "text-white",
                          arrow: "text-black/20",
                          sub: "TRACK 06",
                        },
                      ];
                      const theme = themes[idx % themes.length];
                      return (
                        <div
                          key={item.label}
                          className="flex shrink-0 w-[148px] snap-start sm:w-auto sm:shrink sm:flex-1 sm:min-w-0 items-stretch gap-2.5 sm:gap-2"
                        >
                          <button
                            type="button"
                            onClick={() => setDept(item.dept)}
                            title={`Filter ${item.dept} roles`}
                            className={`group relative flex-1 min-w-0 overflow-hidden rounded-xl sm:rounded-2xl ${theme.bg} shadow-xl cursor-pointer`}
                          >
                            {/* Large subtle angled arrow watermark */}
                            <svg
                              aria-hidden="true"
                              viewBox="0 0 64 64"
                              className={`pointer-events-none absolute -right-2 top-3 h-20 w-20 sm:h-24 sm:w-24 ${theme.arrow}`}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="7"
                              strokeLinecap="square"
                            >
                              <path d="M14 14 L48 48 M48 22 L48 48 L22 48" />
                            </svg>

                            {/* Tall portrait image rising from bottom with seamless top & bottom gradient blends */}
                            <div className="absolute inset-x-0 bottom-0 h-[72%] w-full overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.label}
                                loading="lazy"
                                className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                              />
                              <div
                                aria-hidden="true"
                                className={`pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${theme.fade} to-transparent`}
                              />
                              <div
                                aria-hidden="true"
                                className={`pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t ${theme.fade} to-transparent`}
                              />
                            </div>
                          </button>

                          {idx < SKILL_SHOWCASE.length - 1 && (
                            <div
                              aria-hidden="true"
                              className="w-[2px] shrink-0 self-stretch bg-gradient-to-b from-transparent via-brand to-rose-400/20"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-2.5 flex items-center justify-end gap-1 text-[11px] font-bold uppercase tracking-wider text-[#111215]/60 sm:hidden">
                    Swipe to explore tracks <ArrowRight className="h-3 w-3" />
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-sans text-3xl sm:text-4xl font-medium tracking-tight text-white">
                {viewTab === "roles"
                  ? `Open Positions (${openRoles.length})`
                  : `My Applications (${myApplications.length})`}
              </h1>
              <p className="text-sm text-white/55 mt-1">
                {viewTab === "roles"
                  ? `Welcome back, ${user.firstName}. Select a role below to submit your application.`
                  : "Track the live review status of your submitted applications."}
              </p>
            </div>

            {/* Switch between Open Positions & My Applications */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewTab("roles")}
                className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  viewTab === "roles"
                    ? "bg-brand text-white"
                    : "border border-white/15 bg-[#16181d] text-white/75 hover:border-white/30 hover:text-white"
                }`}
              >
                Open Positions ({allOpenRoles.length})
              </button>
              <button
                type="button"
                onClick={() => setViewTab("applications")}
                className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  viewTab === "applications"
                    ? "bg-brand text-white"
                    : "border border-white/15 bg-[#16181d] text-white/75 hover:border-white/30 hover:text-white"
                }`}
              >
                My Applications ({myApplications.length})
              </button>
            </div>
          </div>

          {viewTab === "applications" ? (
            myApplications.length > 0 ? (
              <div className="space-y-4">
                {myApplications.map((a) => {
                  const statusStyles: Record<JobApplicationStatus, string> = {
                    new: "bg-sky-500/15 text-sky-300 border-sky-500/30",
                    reviewing: "bg-amber-500/15 text-amber-300 border-amber-500/30",
                    shortlisted: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
                    hired: "bg-emerald-500/25 text-emerald-200 border-emerald-400/50",
                    rejected: "bg-rose-500/15 text-rose-300 border-rose-500/30",
                  };
                  return (
                    <article
                      key={a.id}
                      className="rounded-2xl border border-white/10 bg-[#16181d] p-5 sm:p-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="rounded-md bg-white/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-white/85">
                              {a.ref}
                            </span>
                            <span className="text-xs text-white/50">
                              Applied {new Date(a.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-display text-lg font-bold text-white">
                            {a.jobTitle}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-3">
                            {a.portfolioUrl && (
                              <a
                                href={a.portfolioUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-300 hover:underline"
                              >
                                Portfolio <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            {a.cvUrl && (
                              <a
                                href={a.cvUrl}
                                target="_blank"
                                rel="noreferrer"
                                download={a.cvFileName || "CV"}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:underline"
                              >
                                <FileText className="h-3 w-3" />{" "}
                                {a.cvFileName || "Uploaded CV"}
                              </a>
                            )}
                            {(a.status === "hired" || a.certificateIssued) && (
                              <a
                                href={
                                  typeof window !== "undefined" &&
                                  (window.location.hostname === "localhost" ||
                                    window.location.hostname === "127.0.0.1")
                                    ? `/verify-certificate?id=${encodeURIComponent(
                                        makeFellowshipCertificateCode(a.ref)
                                      )}`
                                    : `https://gamatfxacademy.com/verify-certificate?id=${encodeURIComponent(
                                        makeFellowshipCertificateCode(a.ref)
                                      )}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/25"
                              >
                                <Award className="h-3 w-3" />
                                Cert: {makeFellowshipCertificateCode(a.ref)} · Verify
                              </a>
                            )}
                          </div>
                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center self-start sm:self-center rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider ${
                            statusStyles[a.status]
                          }`}
                        >
                          {a.status}
                        </span>
                      </div>
                      {a.coverNote && (
                        <p className="mt-3 rounded-xl border border-white/5 bg-[#111215] p-3.5 text-xs leading-relaxed text-white/70">
                          {a.coverNote}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-[#16181d] p-10 text-center">
                <Briefcase className="mx-auto h-8 w-8 text-white/30" />
                <p className="mt-3 font-display text-base font-bold text-white">
                  You haven&apos;t applied to any roles yet
                </p>
                <p className="mt-1 text-sm text-white/55">
                  Explore open positions and submit an application to track its status here.
                </p>
                <button
                  type="button"
                  onClick={() => setViewTab("roles")}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-dark cursor-pointer"
                >
                  Browse Open Roles <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          ) : (
            <>
              {/* Sticky Search + Category Filter Bar across all devices */}
              <div className="sticky top-[84px] z-30 -mx-4 mb-6 border-b border-white/10 bg-[#111215]/95 px-4 py-3.5 backdrop-blur-md sm:-mx-8 sm:px-8 lg:mb-8">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
                  {/* Department filter pills (single scrollable row on mobile, wrap on desktop) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar lg:flex-wrap lg:overflow-visible">
                    {DEPARTMENTS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDept(d)}
                        className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                          dept === d
                            ? "bg-brand text-white"
                            : "border border-white/15 bg-[#16181d] text-white/70 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  {/* Type filter + Search bar */}
                  <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
                    <select
                      value={jobTypeFilter}
                      onChange={(e) =>
                        setJobTypeFilter(e.target.value as "All" | JobType)
                      }
                      aria-label="Filter by employment type"
                      className="rounded-xl border border-white/15 bg-[#16181d] px-3.5 py-2.5 text-xs font-semibold text-white outline-none focus:border-brand"
                    >
                      <option value="All">All Types</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                    <div className="relative w-full sm:w-64 shrink-0">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search roles..."
                        className="w-full rounded-xl border border-white/15 bg-[#16181d] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Role rows with left-side picture thumbnails */}
              {openRoles.length > 0 ? (
                <div className="space-y-4">
                  {openRoles.map((role, idx) => {
                    const cardTones = [
                      "border-rose-500/25 bg-gradient-to-br from-[#28141b] via-[#1b1318] to-[#141216] hover:border-rose-400/55",
                      "border-sky-500/25 bg-gradient-to-br from-[#131d2e] via-[#131823] to-[#11131a] hover:border-sky-400/55",
                      "border-emerald-500/25 bg-gradient-to-br from-[#12261e] via-[#121c18] to-[#101514] hover:border-emerald-400/55",
                      "border-violet-500/25 bg-gradient-to-br from-[#21152e] via-[#181322] to-[#131118] hover:border-violet-400/55",
                      "border-amber-500/25 bg-gradient-to-br from-[#291f12] via-[#1d1711] to-[#161310] hover:border-amber-400/55",
                      "border-cyan-500/25 bg-gradient-to-br from-[#12242b] via-[#121b20] to-[#101418] hover:border-cyan-400/55",
                    ];
                    const tone = cardTones[idx % cardTones.length];
                    return (
                    <article
                      key={role.id}
                      className={`group rounded-2xl border p-4 sm:p-5 transition ${tone}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-5">
                        {/* Left thumbnail picture */}
                        <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl bg-[#0e1014] md:h-36 md:w-52 lg:h-40 lg:w-60">
                          <img
                            src={getRoleThumbnail(role)}
                            alt={role.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                          <div
                            aria-hidden="true"
                            className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
                          />
                        </div>

                        {/* Center role details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2.5">
                            <span className="rounded-md bg-brand/15 px-2.5 py-0.5 text-[11px] font-bold text-rose-300">
                              {role.department}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-white/70">
                              <MapPin className="h-3 w-3 text-brand" />{" "}
                              {role.location}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-white/70">
                              <Clock className="h-3 w-3 text-brand" /> {role.type}
                            </span>
                            {role.compensation && (
                              <span className="inline-flex items-center rounded-md bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                                {role.compensation}
                              </span>
                            )}
                          </div>

                          <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                            {role.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-white/65">
                            {role.summary}
                          </p>
                          {role.requirements && (
                            <p className="mt-2 text-xs leading-relaxed text-white/50">
                              <strong className="text-white/80">
                                Requirements:
                              </strong>{" "}
                              {role.requirements}
                            </p>
                          )}
                        </div>

                        {/* Right CTA + Share */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => copyJobLink(role.id)}
                            aria-label="Copy shareable job link"
                            title="Copy shareable link"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/80 hover:border-brand/50 hover:text-white transition cursor-pointer"
                          >
                            {copiedJobId === role.id ? (
                              <Check className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Share2 className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => openModal(role)}
                            className="inline-flex flex-1 md:flex-initial items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs font-bold text-ink transition hover:bg-cream cursor-pointer"
                          >
                            Apply Now <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-[#16181d] p-10 text-center">
                  <Briefcase className="mx-auto h-8 w-8 text-white/30" />
                  <p className="mt-3 font-display text-base font-bold text-white">
                    No matching open roles right now
                  </p>
                  <p className="mt-1 text-sm text-white/55">
                    Try another department, type, or clear your search filter.
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      )}

      {/* Application Modal */}
      {selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-[#16181d] text-white shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedRole(null)}
              aria-label="Close modal"
              className="absolute right-5 top-5 z-10 rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="max-h-[90vh] overflow-y-auto no-scrollbar p-6 sm:p-8">

            {submittedRef ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
                <h3 className="mt-4 font-display text-xl font-bold text-white">
                  Application Received!
                </h3>
                <p className="mt-2 text-sm text-white/65 leading-relaxed">
                  Thank you for applying for{" "}
                  <strong className="text-white">{selectedRole.title}</strong>.
                  Our hiring team will review your profile and reach out via
                  email.
                </p>
                <div className="mt-4 inline-block rounded-xl border border-dashed border-brand/50 bg-brand/10 px-4 py-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/55 block">
                    Reference ID
                  </span>
                  <span className="font-display text-sm font-extrabold text-rose-300">
                    {submittedRef}
                  </span>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setSelectedRole(null)}
                    className="w-full rounded-full bg-white py-3 text-sm font-bold text-ink hover:bg-cream cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="inline-block rounded-md bg-brand/15 px-2.5 py-1 text-[11px] font-bold text-rose-300">
                  {selectedRole.department}
                </span>
                <h3 className="mt-2 font-display text-xl font-bold text-white pr-8">
                  Apply for {selectedRole.title}
                </h3>
                <p className="mt-1 text-xs text-white/55">
                  {selectedRole.location} · {selectedRole.type}
                </p>

                <form onSubmit={handleApply} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-white/70">
                      Full Name *
                    </label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-white/70">
                        Email Address *
                      </label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-white/70">
                        Phone / WhatsApp *
                      </label>
                      <input
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-white/70">
                        CV / Portfolio / LinkedIn URL
                      </label>
                      <input
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-white/70">
                        Years of Experience
                      </label>
                      <input
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="e.g. 3 years"
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-white/70">
                      Upload Resume / CV (PDF or DOCX, optional)
                    </label>
                    <label className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white/75 hover:border-brand/60 cursor-pointer">
                      <span className="flex items-center gap-2 truncate">
                        <Upload className="h-4 w-4 shrink-0 text-brand" />
                        <span className="truncate">
                          {uploadingCv
                            ? "Uploading CV..."
                            : cvFileName || "Choose PDF or Word document (max 10MB)"}
                        </span>
                      </span>
                      {cvFileName && (
                        <span className="shrink-0 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                          Attached
                        </span>
                      )}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleCvUpload}
                        disabled={uploadingCv}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-white/70">
                      Why GAMAT Fx &amp; Relevant Experience
                    </label>
                    <textarea
                      rows={4}
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      placeholder="Tell us about your background, track record, or links to work you're proud of..."
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-xs font-semibold text-rose-400">
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-bold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? "Submitting..." : "Submit Application"}
                  </button>
                </form>
              </>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
