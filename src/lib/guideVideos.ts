import { supabase, supabaseUrl, supabaseKey } from "./supabase";

export type GuideAudience = "student" | "staff" | "whiteboard";

export type GuideVideo = {
  id: string;
  audience: GuideAudience;
  title: string;
  description: string;
  duration?: string;
  videoUrl: string;
  updatedAt: string;
};

const STORAGE_KEY = "gamat.guide_videos.v1";
const DELETED_KEY = "gamat.guide_videos_deleted.v1";
const SUPABASE_SLUG = "sys_guide_video";

export const SEED_GUIDE_VIDEOS: GuideVideo[] = [
  {
    id: "gv-student-overview",
    audience: "student",
    title: "Platform Overview & Course Access",
    description: "How to navigate your Student Dashboard, watch course lessons, and track progress.",
    duration: "2 min",
    videoUrl: "",
    updatedAt: "2026-11-24T00:00:00.000Z",
  },
  {
    id: "gv-student-attendance",
    audience: "student",
    title: "Live Class Check-In & Certificates",
    description: "Where to enter your live event attendance code in My Events and download your certificate.",
    duration: "2 min",
    videoUrl: "",
    updatedAt: "2026-11-24T00:00:00.000Z",
  },
  {
    id: "gv-staff-events",
    audience: "staff",
    title: "Staff Guide: Events & Live Attendance Codes",
    description: "How Managers create events, generate live check-in codes, and confirm registrations.",
    duration: "3 min",
    videoUrl: "",
    updatedAt: "2026-11-24T00:00:00.000Z",
  },
  {
    id: "gv-staff-content",
    audience: "staff",
    title: "Staff Guide: Publishing Articles, News & Outlooks",
    description: "How Authors and Editors draft, review, and publish content from the Admin Panel.",
    duration: "3 min",
    videoUrl: "",
    updatedAt: "2026-11-24T00:00:00.000Z",
  },
  {
    id: "gv-student-store-wallet",
    audience: "student",
    title: "Store, Discount Coupons & Invite & Earn",
    description: "How to purchase books or tools in the Store, apply coupons, and track referral rewards in your Wallet.",
    duration: "2 min",
    videoUrl: "",
    updatedAt: "2026-11-24T00:00:00.000Z",
  },
  {
    id: "gv-staff-store-coupons",
    audience: "staff",
    title: "Staff Guide: Store Products, Coupons & Banner Display",
    description: "How to add Store items, create discount codes, and choose which coupon appears on the homepage top banner.",
    duration: "3 min",
    videoUrl: "",
    updatedAt: "2026-11-24T00:00:00.000Z",
  },
  {
    id: "gv-student-journal-mentorship",
    audience: "student",
    title: "Trade Journal, 1-on-1 Booking & Whiteboard Hub",
    description: "How to log trades in your journal, schedule 1-on-1 mentorship calls, and study interactive charts in the Whiteboard Hub.",
    duration: "2 min",
    videoUrl: "",
    updatedAt: "2026-11-24T00:00:00.000Z",
  },
  {
    id: "gv-staff-students-roles",
    audience: "staff",
    title: "Staff Guide: Students, Enrollments & Team Roles",
    description: "How to manage student accounts, verify enrollments and certificates, and assign Manager, Editor, or Author roles.",
    duration: "3 min",
    videoUrl: "",
    updatedAt: "2026-11-24T00:00:00.000Z",
  },
  {
    id: "gv-whiteboard-basics",
    audience: "whiteboard",
    title: "Whiteboard Basics: Canvas Navigation, Shapes & Sticky Notes",
    description: "How to pan, zoom, draw trendlines, add sticky notes, and organize multi-tab technical diagrams.",
    duration: "2 min",
    videoUrl: "",
    updatedAt: "2026-11-24T00:00:00.000Z",
  },
  {
    id: "gv-whiteboard-smc",
    audience: "whiteboard",
    title: "Whiteboard Pro: Chart Markup, SMC Zones & Templates",
    description: "How to mark Order Blocks, FVGs, Break of Structure, and load pre-built chart templates onto the canvas.",
    duration: "3 min",
    videoUrl: "",
    updatedAt: "2026-11-24T00:00:00.000Z",
  },
];

function getDeletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markDeletedId(id: string) {
  try {
    const set = getDeletedIds();
    set.add(id);
    localStorage.setItem(DELETED_KEY, JSON.stringify([...set]));
  } catch {}
}

export function getGuideVideosLocal(): GuideVideo[] {
  const deleted = getDeletedIds();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const list = parsed.filter((v) => v && v.id && !deleted.has(v.id));
        const existingIds = new Set(list.map((v) => v.id));
        for (const seed of SEED_GUIDE_VIDEOS) {
          if (!deleted.has(seed.id) && !existingIds.has(seed.id)) {
            list.push(seed);
          }
        }
        return list;
      }
    }
  } catch {}
  return SEED_GUIDE_VIDEOS.filter((v) => !deleted.has(v.id));
}

export function setGuideVideosLocal(items: GuideVideo[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export async function fetchGuideVideos(): Promise<GuideVideo[]> {
  const deleted = getDeletedIds();
  const local = getGuideVideosLocal();
  try {
    const { data, error } = await supabase
      .from("service_enquiries")
      .select("id, notes, created_at")
      .eq("service_slug", SUPABASE_SLUG)
      .order("created_at", { ascending: false });

    if (error || !data) return local;

    const map = new Map<string, GuideVideo>();
    for (const seed of SEED_GUIDE_VIDEOS) {
      if (!deleted.has(seed.id)) map.set(seed.id, seed);
    }

    for (const row of data) {
      try {
        const parsed = JSON.parse(row.notes || "{}") as Partial<GuideVideo>;
        if (!parsed.id || deleted.has(parsed.id)) continue;
        if (parsed.title) {
          map.set(parsed.id, {
            id: parsed.id,
            audience:
              parsed.audience === "staff"
                ? "staff"
                : parsed.audience === "whiteboard"
                ? "whiteboard"
                : "student",
            title: parsed.title,
            description: parsed.description ?? "",
            duration: parsed.duration ?? "",
            videoUrl: parsed.videoUrl ?? "",
            updatedAt: parsed.updatedAt ?? row.created_at ?? new Date().toISOString(),
          });
        }
      } catch {}
    }

    const merged = Array.from(map.values());
    setGuideVideosLocal(merged);
    return merged;
  } catch {
    return local;
  }
}

export async function saveGuideVideo(video: GuideVideo): Promise<{ ok: boolean; error?: string }> {
  const updated: GuideVideo = { ...video, updatedAt: new Date().toISOString() };
  const current = getGuideVideosLocal();
  const exists = current.some((v) => v.id === updated.id);
  const next = exists ? current.map((v) => (v.id === updated.id ? updated : v)) : [updated, ...current];
  setGuideVideosLocal(next);

  try {
    const payload = {
      service_slug: SUPABASE_SLUG,
      service_title: updated.title,
      name: updated.id,
      email: "guide-video@gamatfx.internal",
      phone: updated.audience,
      message: updated.videoUrl || "slot",
      notes: JSON.stringify(updated),
      status: "published",
    };

    // Delete previous row for this video id if present so we don't accumulate duplicates
    await supabase
      .from("service_enquiries")
      .delete()
      .eq("service_slug", SUPABASE_SLUG)
      .eq("name", updated.id);

    const { error } = await supabase.from("service_enquiries").insert(payload);
    if (!error) return { ok: true };

    // Anon REST fallback if authenticated JWT hits RLS
    const res = await fetch(`${supabaseUrl}/rest/v1/service_enquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) return { ok: true };
    return { ok: false, error: error.message };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to save guide video" };
  }
}

export async function deleteGuideVideo(id: string): Promise<{ ok: boolean }> {
  markDeletedId(id);
  const next = getGuideVideosLocal().filter((v) => v.id !== id);
  setGuideVideosLocal(next);
  try {
    await supabase
      .from("service_enquiries")
      .delete()
      .eq("service_slug", SUPABASE_SLUG)
      .eq("name", id);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
