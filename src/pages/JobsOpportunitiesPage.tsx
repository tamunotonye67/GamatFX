import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  Search,
  Send,
  X,
} from "lucide-react";
import Logo from "../components/Logo";
import {
  fetchSupabaseJobRoles,
  loadJobApplications,
  loadJobRoles,
  saveJobApplications,
  submitSupabaseJobApplication,
  type JobApplication,
  type JobDepartment,
  type JobRole,
} from "../lib/jobs";
import { navigate } from "../lib/router";
import { useStore } from "../lib/store";

const DEPARTMENTS: Array<"All" | JobDepartment> = [
  "All",
  "Trading & Mentorship",
  "Content & Media",
  "Engineering & Product",
  "Operations & Support",
];

const DEPARTMENT_THUMBNAILS: Record<JobDepartment, string> = {
  "Trading & Mentorship":
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=80",
  "Content & Media":
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=80",
  "Engineering & Product":
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80",
  "Operations & Support":
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
};

function getRoleThumbnail(role: JobRole): string {
  return role.image || DEPARTMENT_THUMBNAILS[role.department];
}

export default function JobsOpportunitiesPage() {
  const { user } = useStore();
  const [roles, setRoles] = useState<JobRole[]>(() => loadJobRoles());
  const [dept, setDept] = useState<"All" | JobDepartment>("All");
  const [query, setQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);

  // Application form state
  const [name, setName] = useState(
    user ? `${user.firstName} ${user.lastName}`.trim() : ""
  );
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [experience, setExperience] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    void fetchSupabaseJobRoles().then((remote) => {
      if (remote.length > 0) setRoles(remote);
    });
  }, []);

  const allOpenRoles = useMemo(() => roles.filter((r) => r.open), [roles]);

  const openRoles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allOpenRoles.filter((r) => {
      const matchDept = dept === "All" || r.department === dept;
      const matchQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q);
      return matchDept && matchQuery;
    });
  }, [allOpenRoles, dept, query]);

  const goToMainRoute = (path: string) => {
    const clean = path.startsWith("/") ? path : `/${path}`;
    if (
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
    ) {
      navigate(clean);
    } else {
      window.location.href = `https://gamatfxacademy.com/#${clean}`;
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
      experience: experience.trim(),
      coverNote: coverNote.trim(),
      status: "new",
      createdAt: new Date().toISOString(),
    };

    const existing = loadJobApplications();
    saveJobApplications([app, ...existing]);
    await submitSupabaseJobApplication(app);

    setSubmitting(false);
    setSubmittedRef(refCode);
    setPhone("");
    setPortfolioUrl("");
    setExperience("");
    setCoverNote("");
  };

  return (
    <div className="min-h-screen bg-[#111215] text-white selection:bg-brand selection:text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#111215]">
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
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10 transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Careers
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
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
                Member Opportunities
              </span>
              <h1 className="mt-2 font-sans text-3xl sm:text-4xl font-medium tracking-tight text-white">
                Open Positions ({openRoles.length})
              </h1>
              <p className="text-sm text-white/55 mt-1">
                Welcome back, {user.firstName}. Select a role below to submit
                your application.
              </p>
            </div>

            <div className="relative w-full lg:w-72">
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

          {/* Department filter */}
          <div className="flex flex-wrap gap-1.5 mb-8">
            {DEPARTMENTS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDept(d)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                  dept === d
                    ? "bg-brand text-white"
                    : "border border-white/15 bg-[#16181d] text-white/70 hover:border-white/30 hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Role grid with cover thumbnails */}
          {openRoles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {openRoles.map((role) => (
                <article
                  key={role.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#16181d] shadow-xl transition hover:border-brand/50"
                >
                  {/* Thumbnail cover */}
                  <div className="relative h-48 w-full overflow-hidden bg-[#0e1014]">
                    <img
                      src={getRoleThumbnail(role)}
                      alt={role.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#16181d] via-[#16181d]/30 to-black/25"
                    />
                    <div className="absolute inset-x-4 top-4 flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full border border-white/20 bg-black/55 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                        {role.department}
                      </span>
                      {role.compensation && (
                        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-200 backdrop-blur-md">
                          {role.compensation}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-brand" />
                          {role.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-brand" />
                          {role.type}
                        </span>
                      </div>

                      <h3 className="mt-3 font-display text-xl font-bold leading-snug text-white">
                        {role.title}
                      </h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-white/70">
                        {role.summary}
                      </p>

                      {role.requirements && (
                        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-white/60">
                          <span className="font-semibold text-white/85">
                            Requirements:{" "}
                          </span>
                          {role.requirements}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-2">
                      <button
                        type="button"
                        onClick={() => openModal(role)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-ink transition hover:bg-cream cursor-pointer"
                      >
                        Apply for this role <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[#16181d] p-10 text-center">
              <Briefcase className="mx-auto h-8 w-8 text-white/30" />
              <p className="mt-3 font-display text-base font-bold text-white">
                No matching open roles right now
              </p>
              <p className="mt-1 text-sm text-white/55">
                Try another department or clear your search filter.
              </p>
            </div>
          )}
        </main>
      )}

      {/* Application Modal */}
      {selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/15 bg-[#16181d] p-6 sm:p-8 text-white shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedRole(null)}
              aria-label="Close modal"
              className="absolute right-5 top-5 rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

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
      )}
    </div>
  );
}
