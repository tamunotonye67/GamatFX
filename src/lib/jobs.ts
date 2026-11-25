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
    id: "job_react_builder",
    title: "React & TypeScript Platform Builder",
    department: "Engineering & Product",
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
    title: "Senior FX Market Analyst & Session Lead",
    department: "Trading & Mentorship",
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
    title: "Short-Form Video & Motion Designer",
    department: "Content & Media",
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
    id: "job_community_lead",
    title: "Student Success & Community Moderator",
    department: "Operations & Support",
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
    id: "job_mql5_dev",
    title: "MQL5 & Trading Tooling Developer",
    department: "Engineering & Product",
    location: "Remote · Global",
    type: "Contract",
    compensation: "Fellowship + Revenue Share Path",
    summary:
      "Build custom MetaTrader 5 indicators, risk calculators, and session utilities used daily by GAMAT Fx students.",
    requirements:
      "Hands-on MQL5/MQL4 scripting experience, clean risk-math logic, and attention to execution reliability.",
    image:
      "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=900&q=80",
    open: true,
    createdAt: "2026-11-06T10:00:00.000Z",
  },
  {
    id: "job_curriculum_writer",
    title: "Trading Curriculum & Playbook Writer",
    department: "Content & Media",
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
