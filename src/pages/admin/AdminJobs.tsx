import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { AdminShell, StatCard } from "./AdminShell";
import {
  deleteSupabaseJobRole,
  fetchSupabaseJobApplications,
  fetchSupabaseJobRoles,
  loadJobApplications,
  loadJobRoles,
  saveJobApplications,
  saveJobRoles,
  updateSupabaseJobApplicationStatus,
  upsertSupabaseJobRole,
  type JobApplication,
  type JobApplicationStatus,
  type JobDepartment,
  type JobRole,
  type JobType,
} from "../../lib/jobs";

export function AdminJobs() {
  const [tab, setTab] = useState<"roles" | "applications">("roles");
  const [roles, setRoles] = useState<JobRole[]>(() => loadJobRoles());
  const [apps, setApps] = useState<JobApplication[]>(() => loadJobApplications());

  // New role form
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState<JobDepartment>("Trading & Analysis");
  const [location, setLocation] = useState("Remote");
  const [type, setType] = useState<JobType>("Full-time");
  const [compensation, setCompensation] = useState("");
  const [image, setImage] = useState("");
  const [summary, setSummary] = useState("");
  const [requirements, setRequirements] = useState("");

  useEffect(() => {
    void fetchSupabaseJobRoles().then((r) => {
      if (r.length > 0) setRoles(r);
    });
    void fetchSupabaseJobApplications().then((a) => {
      setApps(a);
    });
  }, []);

  const stats = useMemo(() => {
    const openCount = roles.filter((r) => r.open).length;
    const totalApps = apps.length;
    const newApps = apps.filter((a) => a.status === "new").length;
    const shortlisted = apps.filter((a) => a.status === "shortlisted").length;
    return { openCount, totalApps, newApps, shortlisted };
  }, [roles, apps]);

  const addRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;
    const newRole: JobRole = {
      id: `job_${Date.now()}`,
      title: title.trim(),
      department,
      location: location.trim() || "Remote",
      type,
      compensation: compensation.trim() || "Volunteer Fellowship · Certificate",
      summary: summary.trim(),
      requirements: requirements.trim(),
      ...(image.trim() ? { image: image.trim() } : {}),
      open: true,
      createdAt: new Date().toISOString(),
    };
    const next = [newRole, ...roles];
    setRoles(next);
    saveJobRoles(next);
    await upsertSupabaseJobRole(newRole);

    setTitle("");
    setCompensation("");
    setImage("");
    setSummary("");
    setRequirements("");
  };

  const toggleOpen = async (role: JobRole) => {
    const updated = { ...role, open: !role.open };
    const next = roles.map((r) => (r.id === role.id ? updated : r));
    setRoles(next);
    saveJobRoles(next);
    await upsertSupabaseJobRole(updated);
  };

  const removeRole = async (id: string) => {
    const next = roles.filter((r) => r.id !== id);
    setRoles(next);
    saveJobRoles(next);
    await deleteSupabaseJobRole(id);
  };

  const updateAppStatus = async (id: string, status: JobApplicationStatus) => {
    const next = apps.map((a) => (a.id === id ? { ...a, status } : a));
    setApps(next);
    saveJobApplications(next);
    await updateSupabaseJobApplicationStatus(id, status);
  };

  return (
    <AdminShell
      title="Jobs & Hiring"
      subtitle="Manage open roles on jobs.gamatfxacademy.com and review candidate applications."
    >
      {/* 2x2 Mobile / 4-col Desktop Stats */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Briefcase} label="Open Roles" value={stats.openCount} />
        <StatCard icon={Users} label="Total Applicants" value={stats.totalApps} />
        <StatCard icon={Plus} label="New Applications" value={stats.newApps} />
        <StatCard icon={CheckCircle2} label="Shortlisted" value={stats.shortlisted} />
      </div>

      {/* Sub-tabs */}
      <div className="mt-6 flex items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setTab("roles")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            tab === "roles"
              ? "bg-brand text-white"
              : "border border-line bg-white text-ink/75 hover:text-brand"
          }`}
        >
          Open Roles ({roles.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("applications")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            tab === "applications"
              ? "bg-brand text-white"
              : "border border-line bg-white text-ink/75 hover:text-brand"
          }`}
        >
          Applications ({apps.length})
        </button>
      </div>

      {tab === "roles" ? (
        <div className="space-y-6">
          <form
            onSubmit={addRole}
            className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-2xs space-y-4"
          >
            <h3 className="font-display text-base font-bold text-ink">
              Post a New Role
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted">
                  Role Title *
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Junior Market Analyst"
                  className="w-full rounded-xl border border-line bg-cream/40 px-3 py-2 text-sm text-ink outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as JobDepartment)}
                  className="w-full rounded-xl border border-line bg-cream/40 px-3 py-2 text-sm text-ink outline-none focus:border-brand"
                >
                  <option value="Dev & IT">Dev &amp; IT</option>
                  <option value="Trading & Analysis">Trading &amp; Analysis</option>
                  <option value="Design & Creative">Design &amp; Creative</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Admin & Support">Admin &amp; Support</option>
                  <option value="Writing & Content">Writing &amp; Content</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted">
                  Employment Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as JobType)}
                  className="w-full rounded-xl border border-line bg-cream/40 px-3 py-2 text-sm text-ink outline-none focus:border-brand"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted">
                  Location
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Remote / Lagos"
                  className="w-full rounded-xl border border-line bg-cream/40 px-3 py-2 text-sm text-ink outline-none focus:border-brand"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-muted">
                  Compensation
                </label>
                <input
                  value={compensation}
                  onChange={(e) => setCompensation(e.target.value)}
                  placeholder="e.g. Volunteer Fellowship · Certificate"
                  className="w-full rounded-xl border border-line bg-cream/40 px-3 py-2 text-sm text-ink outline-none focus:border-brand"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-muted">
                  Thumbnail Image URL (optional)
                </label>
                <input
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://... (defaults to department thumbnail)"
                  className="w-full rounded-xl border border-line bg-cream/40 px-3 py-2 text-sm text-ink outline-none focus:border-brand"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted">
                Role Summary *
              </label>
              <textarea
                required
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Describe what this person will own..."
                className="w-full rounded-xl border border-line bg-cream/40 px-3 py-2 text-sm text-ink outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted">
                Key Requirements
              </label>
              <input
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Skills, experience, or tools required..."
                className="w-full rounded-xl border border-line bg-cream/40 px-3 py-2 text-sm text-ink outline-none focus:border-brand"
              />
            </div>
            <button type="submit" className="btn-primary">
              <Plus className="h-4 w-4" /> Publish Role
            </button>
          </form>

          <div className="space-y-3">
            {roles.map((r) => (
              <div
                key={r.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 shadow-2xs"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        r.open
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-muted"
                      }`}
                    >
                      {r.open ? "Open" : "Paused"}
                    </span>
                    <span className="text-xs font-semibold text-muted">
                      {r.department} · {r.location} · {r.type}
                    </span>
                  </div>
                  <h4 className="font-display text-base font-bold text-ink">
                    {r.title}
                  </h4>
                  <p className="mt-1 text-xs text-muted line-clamp-2">
                    {r.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleOpen(r)}
                    className="btn-outline-dark !py-2 !px-3.5 text-xs"
                  >
                    {r.open ? "Pause" : "Reopen"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRole(r.id)}
                    aria-label="Delete role"
                    className="rounded-xl p-2 text-muted hover:bg-cream hover:text-brand cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.length === 0 ? (
            <div className="rounded-2xl border border-line bg-white p-10 text-center text-sm text-muted">
              No job applications yet. Submissions from{" "}
              <strong>jobs.gamatfxacademy.com</strong> will appear here.
            </div>
          ) : (
            apps.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-line bg-white p-5 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="chip">{a.ref}</span>
                      <span className="text-xs font-semibold text-brand">
                        {a.jobTitle}
                      </span>
                      <span className="text-xs text-muted">
                        · {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-display text-base font-bold text-ink">
                      {a.name}
                    </h4>
                    <p className="text-xs text-muted mt-0.5">
                      {a.email} · {a.phone}
                      {a.experience ? ` · ${a.experience} exp` : ""}
                    </p>
                    {a.portfolioUrl && (
                      <a
                        href={a.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                      >
                        Portfolio / CV <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {a.coverNote && (
                      <p className="mt-2 rounded-xl bg-cream/60 p-3 text-xs leading-relaxed text-ink/85">
                        {a.coverNote}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    <select
                      value={a.status}
                      onChange={(e) =>
                        updateAppStatus(a.id, e.target.value as JobApplicationStatus)
                      }
                      className="rounded-xl border border-line bg-cream/40 px-3 py-2 text-xs font-bold text-ink outline-none focus:border-brand"
                    >
                      <option value="new">New</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </AdminShell>
  );
}
