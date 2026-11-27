import { supabase, supabaseKey, supabaseUrl } from "./supabase";

export type JobDepartment =
  | "Dev & IT"
  | "Trading & Analysis"
  | "Design & Creative"
  | "Marketing"
  | "Admin & Support"
  | "Writing & Content";

export function normalizeJobDepartment(raw?: string): JobDepartment {
  switch (raw) {
    case "Dev & IT":
    case "Engineering & Product":
      return "Dev & IT";
    case "Trading & Analysis":
    case "Trading & Mentorship":
      return "Trading & Analysis";
    case "Design & Creative":
    case "Content & Media":
      return "Design & Creative";
    case "Marketing":
      return "Marketing";
    case "Admin & Support":
    case "Operations & Support":
      return "Admin & Support";
    case "Writing & Content":
      return "Writing & Content";
    default:
      return "Trading & Analysis";
  }
}

export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";

export type JobRole = {
  id: string;
  title: string;
  department: JobDepartment;
  location: string;
  type: JobType;
  compensation: string;
  summary: string;
  requirements: string;
  image?: string;
  open: boolean;
  createdAt: string;
};

export type JobApplicationStatus =
  | "new"
  | "reviewing"
  | "shortlisted"
  | "hired"
  | "rejected";

export type JobApplication = {
  id: string;
  ref: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  portfolioUrl: string;
  cvUrl?: string;
  cvFileName?: string;
  experience: string;
  coverNote: string;
  status: JobApplicationStatus;
  certificateIssued?: boolean;
  certificateIssuedAt?: string;
  createdAt: string;
};

export function makeFellowshipCertificateCode(ref: string): string {
  const clean = ref.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() || "FELLOW";
  return `GMX-FEL-${clean}`;
}

const JOBS_STORAGE_KEY = "gamat.job_roles.v1";
const APPS_STORAGE_KEY = "gamat.job_applications.v1";
const SUPABASE_JOB_ROLE_SLUG = "__gamat_job_role__";
const SUPABASE_JOB_APP_SLUG = "__gamat_job_application__";

export const SEED_JOB_ROLES: JobRole[] = [
  {
    id: "job_react_builder",
    title: "React & TypeScript Engineers",
    department: "Dev & IT",
    location: "Remote · Global",
    type: "Part-time",
    compensation: "Volunteer Fellowship · Certificate",
    summary:
      "Ship interactive trading tools, whiteboard canvases, and student dashboards inside the GAMAT Fx web platform.",
    requirements:
      "Strong React, TypeScript, and Tailwind CSS fundamentals; passion for clean fintech UI and async collaboration.",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80",
    open: true,
    createdAt: "2026-11-12T10:00:00.000Z",
  },
  {
    id: "job_senior_analyst",
    title: "Senior FX Market Analysts",
    department: "Trading & Analysis",
    location: "Remote · London / NY",
    type: "Part-time",
    compensation: "Fellowship + Academy Access",
    summary:
      "Host weekly London & New York market breakdowns, audit student trade journals, and guide 1-on-1 mentorship reviews.",
    requirements:
      "Consistent live/funded trading track record, strong SMC & order-flow mastery, and clear live teaching presence.",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=80",
    open: true,
    createdAt: "2026-11-11T10:00:00.000Z",
  },
  {
    id: "job_video_editor",
    title: "Short-Form Video Editors",
    department: "Design & Creative",
    location: "Remote · Global",
    type: "Part-time",
    compensation: "Fellowship · Portfolio Credit",
    summary:
      "Transform live trading breakdowns, student milestones, and market recaps into crisp Reels, TikToks, and YouTube Shorts.",
    requirements:
      "Proficiency in Premiere Pro, After Effects, or DaVinci Resolve with strong pacing and clean typography.",
    image:
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=80",
    open: true,
    createdAt: "2026-11-10T10:00:00.000Z",
  },
  {
    id: "job_growth_ads",
    title: "Paid Ads & Funnel Specialists",
    department: "Marketing",
    location: "Remote · Global",
    type: "Part-time",
    compensation: "Fellowship + Growth Bonus",
    summary:
      "Launch high-converting Meta & YouTube acquisition funnels and track cohort sign-ups across our global campaigns.",
    requirements:
      "Hands-on experience with Meta Ads Manager, YouTube campaign analytics, and conversion copywriting.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
    open: true,
    createdAt: "2026-11-09T10:00:00.000Z",
  },
  {
    id: "job_community_lead",
    title: "Student Success Leads",
    department: "Admin & Support",
    location: "Remote · Global",
    type: "Part-time",
    compensation: "Volunteer · Priority Paid Path",
    summary:
      "Guide new student onboarding, coordinate live session check-ins, and keep our private trading floor active and supportive.",
    requirements:
      "Empathetic written communication, organized workflow habits, and familiarity with online learning communities.",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
    open: true,
    createdAt: "2026-11-08T10:00:00.000Z",
  },
  {
    id: "job_curriculum_writer",
    title: "Trading Curriculum Writers",
    department: "Writing & Content",
    location: "Remote · Global",
    type: "Part-time",
    compensation: "Volunteer Fellowship · Certificate",
    summary:
      "Author structured FX workbooks, daily market commentary, and certification quiz banks for academy cohorts.",
    requirements:
      "Clear, structured financial writing style and solid grasp of price action, risk management, and trading psychology.",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
    open: true,
    createdAt: "2026-11-04T10:00:00.000Z",
  },
];

export function loadJobRoles(): JobRole[] {
  try {
    const raw = localStorage.getItem(JOBS_STORAGE_KEY);
    if (!raw) return SEED_JOB_ROLES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed.map((r: JobRole) => ({
          ...r,
          department: normalizeJobDepartment(r.department),
        }))
      : SEED_JOB_ROLES;
  } catch {
    return SEED_JOB_ROLES;
  }
}

export function saveJobRoles(roles: JobRole[]): void {
  try {
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(roles));
  } catch {}
}

export function loadJobApplications(): JobApplication[] {
  try {
    const raw = localStorage.getItem(APPS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveJobApplications(apps: JobApplication[]): void {
  try {
    localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(apps));
  } catch {}
}

const DELETED_JOBS_STORAGE_KEY = "gamatfx_deleted_job_roles_v1";

function loadLocalDeletedJobIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_JOBS_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

function addLocalDeletedJobId(id: string): void {
  try {
    const ids = loadLocalDeletedJobIds();
    ids.add(id);
    localStorage.setItem(DELETED_JOBS_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {}
}

export async function fetchSupabaseJobRoles(): Promise<JobRole[]> {
  const local = loadJobRoles();
  const localDeletedIds = loadLocalDeletedJobIds();
  try {
    let rows: any[] | null = null;
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/service_enquiries?service_slug=eq.${SUPABASE_JOB_ROLE_SLUG}&order=created_at.desc&select=*`,
        {
          cache: "no-store",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) rows = json;
      }
    } catch {}

    if (!rows || rows.length === 0) {
      try {
        const { data, error } = await supabase
          .from("service_enquiries")
          .select("*")
          .eq("service_slug", SUPABASE_JOB_ROLE_SLUG)
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          rows = data;
        }
      } catch {}
    }

    if (!rows || rows.length === 0) return local;

    const deletedIds = new Set<string>([
      ...localDeletedIds,
      ...rows.filter((r: any) => r.status === "deleted").map((r: any) => String(r.id)),
    ]);

    const remoteMap = new Map<string, JobRole>();
    for (const r of rows) {
      const rowId = String(r.id);
      if (r.status === "deleted") continue;
      if (localDeletedIds.has(rowId)) {
        void deleteSupabaseJobRole(rowId);
        continue;
      }
      let parsed: any = {};
      try {
        parsed = JSON.parse(String(r.message || "{}"));
      } catch {}
      const validTypes: JobType[] = ["Full-time", "Part-time", "Contract", "Internship"];
      const rawType = validTypes.includes(r.phone as JobType)
        ? (r.phone as JobType)
        : validTypes.includes(r.ref as JobType)
        ? (r.ref as JobType)
        : "Full-time";
      const role: JobRole = {
        id: String(r.id),
        title: String(r.service_title || "Open Role"),
        department: normalizeJobDepartment(r.package_name),
        location: String(r.company || "Remote"),
        type: rawType,
        compensation: String(r.budget || "Competitive"),
        summary: String(parsed.summary || r.message || ""),
        requirements: String(parsed.requirements || ""),
        ...(parsed.image ? { image: String(parsed.image) } : {}),
        open: r.status !== "closed",
        createdAt: r.created_at || new Date().toISOString(),
      };
      remoteMap.set(role.id, role);
    }

    // Merge remote roles with seed roles and any unsynced local roles (excluding deleted ones)
    const seedIds = new Set(SEED_JOB_ROLES.map((s) => s.id));
    const merged: JobRole[] = Array.from(remoteMap.values());
    for (const seed of SEED_JOB_ROLES) {
      if (!remoteMap.has(seed.id) && !deletedIds.has(seed.id)) {
        merged.push(seed);
      }
    }
    for (const localRole of local) {
      if (
        !remoteMap.has(localRole.id) &&
        !seedIds.has(localRole.id) &&
        !deletedIds.has(localRole.id)
      ) {
        merged.push(localRole);
        void upsertSupabaseJobRole(localRole);
      }
    }
    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    saveJobRoles(merged);
    return merged;
  } catch {
    return local;
  }
}

let lastJobSyncError: string | null = null;

export function getLastJobSyncError(): string | null {
  return lastJobSyncError;
}

export async function upsertSupabaseJobRole(role: JobRole): Promise<boolean> {
  lastJobSyncError = null;
  const payload = {
    id: role.id,
    ref: `JOB-${role.id}`,
    service_slug: SUPABASE_JOB_ROLE_SLUG,
    service_title: role.title,
    package_name: role.department,
    name: "GAMAT Hiring",
    email: "careers@gamatfxacademy.com",
    phone: role.type,
    company: role.location,
    budget: role.compensation,
    message: JSON.stringify({
      summary: role.summary,
      requirements: role.requirements,
      ...(role.image ? { image: role.image } : {}),
    }),
    user_id: null,
    status: role.open ? "open" : "closed",
    created_at: role.createdAt,
  };

  try {
    const { error } = await supabase
      .from("service_enquiries")
      .upsert(payload, { onConflict: "id" });
    if (!error) return true;
    lastJobSyncError = `${error.code || "SB"}: ${error.message}`;
  } catch (err) {
    lastJobSyncError = err instanceof Error ? err.message : String(err);
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/service_enquiries?on_conflict=id`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      lastJobSyncError = null;
      return true;
    }
    const errText = await res.text().catch(() => "");
    lastJobSyncError = `HTTP ${res.status}: ${errText || res.statusText}`;
  } catch (err) {
    lastJobSyncError = err instanceof Error ? err.message : String(err);
  }

  // Fallback: try PATCH on existing row, else plain INSERT without on_conflict
  try {
    const patchRes = await fetch(
      `${supabaseUrl}/rest/v1/service_enquiries?id=eq.${encodeURIComponent(role.id)}`,
      {
        method: "PATCH",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(payload),
      }
    );
    if (patchRes.ok) {
      const updated = await patchRes.json().catch(() => []);
      if (Array.isArray(updated) && updated.length > 0) {
        lastJobSyncError = null;
        return true;
      }
    }

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/service_enquiries`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (insertRes.ok) {
      lastJobSyncError = null;
      return true;
    }
    const errText = await insertRes.text().catch(() => "");
    lastJobSyncError = `HTTP ${insertRes.status}: ${errText || insertRes.statusText}`;
  } catch (err) {
    lastJobSyncError = err instanceof Error ? err.message : String(err);
  }

  return false;
}

export async function deleteSupabaseJobRole(id: string): Promise<boolean> {
  addLocalDeletedJobId(id);
  const isSeed = SEED_JOB_ROLES.some((s) => s.id === id);
  const tombstone = {
    id,
    ref: `JOB-${id}`,
    service_slug: SUPABASE_JOB_ROLE_SLUG,
    service_title: id,
    package_name: "Trading & Analysis",
    name: "GAMAT Hiring",
    email: "careers@gamatfxacademy.com",
    phone: "Part-time",
    company: "Remote",
    budget: "",
    message: "{}",
    user_id: null,
    status: "deleted",
    created_at: new Date().toISOString(),
  };

  if (isSeed) {
    try {
      const { error } = await supabase
        .from("service_enquiries")
        .upsert(tombstone, { onConflict: "id" });
      if (!error) return true;
    } catch {}
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/service_enquiries?on_conflict=id`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(tombstone),
      });
      if (res.ok) return true;
    } catch {}
  }

  // Try actual DELETE and verify rows were deleted
  try {
    const delRes = await fetch(
      `${supabaseUrl}/rest/v1/service_enquiries?id=eq.${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: "return=representation",
        },
      }
    );
    if (delRes.ok) {
      const deletedRows = await delRes.json().catch(() => []);
      if (Array.isArray(deletedRows) && deletedRows.length > 0) {
        return true;
      }
    }
  } catch {}

  // Fallback: mark status = "deleted" via PATCH (in case RLS blocks DELETE)
  try {
    const patchRes = await fetch(
      `${supabaseUrl}/rest/v1/service_enquiries?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ status: "deleted" }),
      }
    );
    if (patchRes.ok) return true;
  } catch {}

  try {
    const { error: updateErr } = await supabase
      .from("service_enquiries")
      .update({ status: "deleted" })
      .eq("id", id);
    return !updateErr;
  } catch {
    return false;
  }
}

export async function fetchSupabaseJobApplications(): Promise<JobApplication[]> {
  const local = loadJobApplications();
  try {
    let rows: any[] | null = null;
    const { data, error } = await supabase
      .from("service_enquiries")
      .select("*")
      .eq("service_slug", SUPABASE_JOB_APP_SLUG)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      rows = data;
    } else {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/service_enquiries?service_slug=eq.${SUPABASE_JOB_APP_SLUG}&order=created_at.desc&select=*`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) rows = json;
      }
    }

    if (!rows || rows.length === 0) return local;

    const remote: JobApplication[] = rows
      .filter((r: any) => r.status !== "deleted")
      .map((r: any) => {
        let parsed: any = {};
        try {
          parsed = JSON.parse(String(r.message || "{}"));
        } catch {}
        return {
          id: String(r.id),
          ref: String(r.ref || "APP"),
          jobId: String(r.package_name || ""),
          jobTitle: String(r.service_title || "Role"),
          name: String(r.name || ""),
          email: String(r.email || ""),
          phone: String(r.phone || ""),
          portfolioUrl: String(r.company || ""),
          ...(parsed.cvUrl ? { cvUrl: String(parsed.cvUrl) } : {}),
          ...(parsed.cvFileName ? { cvFileName: String(parsed.cvFileName) } : {}),
          experience: String(r.budget || ""),
          coverNote: String(parsed.coverNote || r.message || ""),
          status: (r.status as JobApplicationStatus) || "new",
          ...(parsed.certificateIssued ? { certificateIssued: true } : {}),
          ...(parsed.certificateIssuedAt
            ? { certificateIssuedAt: String(parsed.certificateIssuedAt) }
            : {}),
          createdAt: r.created_at || new Date().toISOString(),
        };
      });

    saveJobApplications(remote);
    return remote;
  } catch {
    return local;
  }
}

export async function submitSupabaseJobApplication(
  app: JobApplication
): Promise<boolean> {
  const payload = {
    id: app.id,
    ref: app.ref,
    service_slug: SUPABASE_JOB_APP_SLUG,
    service_title: app.jobTitle,
    package_name: app.jobId,
    name: app.name,
    email: app.email,
    phone: app.phone,
    company: app.portfolioUrl || null,
    budget: app.experience || null,
    message: JSON.stringify({
      coverNote: app.coverNote,
      ...(app.cvUrl ? { cvUrl: app.cvUrl } : {}),
      ...(app.cvFileName ? { cvFileName: app.cvFileName } : {}),
      ...(app.certificateIssued ? { certificateIssued: true } : {}),
      ...(app.certificateIssuedAt
        ? { certificateIssuedAt: app.certificateIssuedAt }
        : {}),
    }),
    user_id: null,
    status: app.status,
    created_at: app.createdAt,
  };

  try {
    const { error } = await supabase
      .from("service_enquiries")
      .upsert(payload, { onConflict: "id" });
    if (!error) return true;
    const { error: insertErr } = await supabase
      .from("service_enquiries")
      .insert(payload);
    return !insertErr;
  } catch {
    return false;
  }
}

export async function updateSupabaseJobApplicationStatus(
  id: string,
  status: JobApplicationStatus
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("service_enquiries")
      .update({ status })
      .eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

export async function updateSupabaseJobApplicationCertificate(
  app: JobApplication,
  issued: boolean,
  issuedAt?: string
): Promise<boolean> {
  try {
    const message = JSON.stringify({
      coverNote: app.coverNote,
      ...(app.cvUrl ? { cvUrl: app.cvUrl } : {}),
      ...(app.cvFileName ? { cvFileName: app.cvFileName } : {}),
      certificateIssued: issued,
      ...(issuedAt ? { certificateIssuedAt: issuedAt } : {}),
    });
    const { error } = await supabase
      .from("service_enquiries")
      .update({ message })
      .eq("id", app.id);
    return !error;
  } catch {
    return false;
  }
}
