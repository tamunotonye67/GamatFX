import { supabase, supabaseKey, supabaseUrl } from "./supabase";

export type JobDepartment =
  | "Trading & Mentorship"
  | "Content & Media"
  | "Engineering & Product"
  | "Operations & Support";

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
  experience: string;
  coverNote: string;
  status: JobApplicationStatus;
  createdAt: string;
};

const JOBS_STORAGE_KEY = "gamat.job_roles.v1";
const APPS_STORAGE_KEY = "gamat.job_applications.v1";
const SUPABASE_JOB_ROLE_SLUG = "__gamat_job_role__";
const SUPABASE_JOB_APP_SLUG = "__gamat_job_application__";

export const SEED_JOB_ROLES: JobRole[] = [
  {
    id: "job_senior_analyst",
    title: "Senior Forex Market Analyst & Live Mentor",
    department: "Trading & Mentorship",
    location: "Remote / Hybrid (Lagos)",
    type: "Full-time",
    compensation: "Competitive + Performance Bonus",
    summary:
      "Lead weekly London & New York live market breakdowns, audit student trade journals, and host 1-on-1 mentorship reviews.",
    requirements:
      "3+ years consistent live/funded trading track record, strong SMC & institutional order-flow mastery, clear live teaching presence.",
    open: true,
    createdAt: "2026-11-01T10:00:00.000Z",
  },
  {
    id: "job_community_lead",
    title: "Student Success & Community Operations Lead",
    department: "Operations & Support",
    location: "Remote",
    type: "Full-time",
    compensation: "$900 – $1,400 / mo",
    summary:
      "Manage student onboarding, coordinate live workshop check-ins, and keep our private trading floor active and supportive.",
    requirements:
      "2+ years in EdTech or trading community management, strong written communication, organized & empathetic.",
    open: true,
    createdAt: "2026-11-05T10:00:00.000Z",
  },
  {
    id: "job_video_editor",
    title: "Short-Form Video Editor & Motion Designer",
    department: "Content & Media",
    location: "Remote",
    type: "Contract",
    compensation: "$700 – $1,200 / mo",
    summary:
      "Turn live trading breakdowns, student wins, and market recaps into crisp Reels, TikToks, and YouTube Shorts.",
    requirements:
      "Proficiency in Premiere Pro / After Effects / DaVinci Resolve, strong pacing & clean typography sensibility.",
    open: true,
    createdAt: "2026-11-10T10:00:00.000Z",
  },
  {
    id: "job_fullstack_eng",
    title: "Full-Stack React & TypeScript Engineer",
    department: "Engineering & Product",
    location: "Remote",
    type: "Full-time",
    compensation: "$1,800 – $3,000 / mo",
    summary:
      "Build interactive trading tools, whiteboard features, and student analytics inside the GAMAT Fx web platform.",
    requirements:
      "Strong React, TypeScript, Tailwind CSS, and Supabase/PostgreSQL experience. Bonus for Canvas/WebGL or fintech UI experience.",
    open: true,
    createdAt: "2026-11-12T10:00:00.000Z",
  },
];

export function loadJobRoles(): JobRole[] {
  try {
    const raw = localStorage.getItem(JOBS_STORAGE_KEY);
    if (!raw) return SEED_JOB_ROLES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_JOB_ROLES;
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

export async function fetchSupabaseJobRoles(): Promise<JobRole[]> {
  const local = loadJobRoles();
  try {
    let rows: any[] | null = null;
    const { data, error } = await supabase
      .from("service_enquiries")
      .select("*")
      .eq("service_slug", SUPABASE_JOB_ROLE_SLUG)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      rows = data;
    } else {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/service_enquiries?service_slug=eq.${SUPABASE_JOB_ROLE_SLUG}&order=created_at.desc&select=*`,
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

    const remote: JobRole[] = rows
      .filter((r: any) => r.status !== "deleted")
      .map((r: any) => {
        let parsed: any = {};
        try {
          parsed = JSON.parse(String(r.message || "{}"));
        } catch {}
        return {
          id: String(r.id),
          title: String(r.service_title || "Open Role"),
          department: (r.package_name as JobDepartment) || "Trading & Mentorship",
          location: String(r.company || "Remote"),
          type: (r.ref as JobType) || "Full-time",
          compensation: String(r.budget || "Competitive"),
          summary: String(parsed.summary || r.message || ""),
          requirements: String(parsed.requirements || ""),
          open: r.status !== "closed",
          createdAt: r.created_at || new Date().toISOString(),
        };
      });

    if (remote.length > 0) {
      saveJobRoles(remote);
      return remote;
    }
    return local;
  } catch {
    return local;
  }
}

export async function upsertSupabaseJobRole(role: JobRole): Promise<boolean> {
  const payload = {
    id: role.id,
    ref: role.type,
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
    const { error: insertErr } = await supabase
      .from("service_enquiries")
      .insert(payload);
    return !insertErr || insertErr.code === "23505";
  } catch {
    return false;
  }
}

export async function deleteSupabaseJobRole(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("service_enquiries")
      .delete()
      .eq("id", id);
    if (!error) return true;
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
          experience: String(r.budget || ""),
          coverNote: String(parsed.coverNote || r.message || ""),
          status: (r.status as JobApplicationStatus) || "new",
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
    message: JSON.stringify({ coverNote: app.coverNote }),
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
