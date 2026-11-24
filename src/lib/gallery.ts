import { supabase, supabaseUrl, supabaseKey } from "./supabase";

export type GalleryCategory =
  | "Campus & Classes"
  | "Trading Floor"
  | "Graduations"
  | "Live Events";

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  "Campus & Classes",
  "Trading Floor",
  "Graduations",
  "Live Events",
];

export type GalleryItem = {
  id: string;
  title: string;
  category: GalleryCategory;
  caption: string;
  image: string;
  date?: string;
  featured?: boolean;
  createdAt: string;
};

const GALLERY_STORAGE_KEY = "gamat.gallery.v1";
const SUPABASE_GALLERY_SLUG = "sys_gallery_item";

export const SEED_GALLERY: GalleryItem[] = [
  {
    id: "gal-trading-floor",
    title: "Live Trading Floor Analysis",
    category: "Trading Floor",
    caption: "Students and mentors mapping liquidity and candlestick structure together at our Port Harcourt desk.",
    image: "/images/gallery/trading-floor.jpg",
    date: "2026",
    featured: true,
    createdAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "gal-mentorship-session",
    title: "Price Action Mentorship Class",
    category: "Campus & Classes",
    caption: "In-person mentorship session breaking down support, resistance, and institutional order flow.",
    image: "/images/gallery/mentorship-session.jpg",
    date: "2026",
    featured: true,
    createdAt: "2026-07-24T10:00:00.000Z",
  },
  {
    id: "gal-graduation",
    title: "Cohort Graduation & Certification",
    category: "Graduations",
    caption: "Graduating traders celebrating their completion certificates after completing the 12-week mentorship.",
    image: "/images/gallery/graduation.jpg",
    date: "2026",
    featured: true,
    createdAt: "2026-07-13T10:00:00.000Z",
  },
  {
    id: "gal-live-workshop",
    title: "Port Harcourt Forex Workshop & Meetup",
    category: "Live Events",
    caption: "Full-house community workshop reviewing macro fundamentals and live chart setups.",
    image: "/images/gallery/live-workshop.jpg",
    date: "2026",
    featured: true,
    createdAt: "2026-06-18T10:00:00.000Z",
  },
  {
    id: "gal-chart-review",
    title: "One-on-One Chart & Journal Review",
    category: "Trading Floor",
    caption: "Peer and mentor trade review session focused on risk management and execution discipline.",
    image: "/images/gallery/chart-review.jpg",
    date: "2026",
    featured: true,
    createdAt: "2026-06-05T10:00:00.000Z",
  },
  {
    id: "gal-campus-lab",
    title: "Port Harcourt Trading Lab",
    category: "Campus & Classes",
    caption: "Students collaborating in our dedicated trading lab at Skillerville, Choba-Ozouba Road.",
    image: "/images/gallery/campus-lab.jpg",
    date: "2026",
    featured: true,
    createdAt: "2026-05-20T10:00:00.000Z",
  },
];

function normalizeCategory(raw?: string): GalleryCategory {
  if (raw === "Trading Floor" || raw === "Graduations" || raw === "Live Events" || raw === "Campus & Classes") {
    return raw;
  }
  return "Campus & Classes";
}

export function loadGalleryItems(): GalleryItem[] {
  if (typeof window === "undefined") return SEED_GALLERY;
  try {
    const raw = localStorage.getItem(GALLERY_STORAGE_KEY);
    if (!raw) return SEED_GALLERY;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return SEED_GALLERY;
    return parsed.map((item: any) => ({
      id: String(item.id),
      title: String(item.title || "Academy Highlight"),
      category: normalizeCategory(item.category),
      caption: String(item.caption || ""),
      image: String(item.image || "/images/gallery/trading-floor.jpg"),
      date: item.date ? String(item.date) : undefined,
      featured: item.featured !== false,
      createdAt: item.createdAt || new Date().toISOString(),
    }));
  } catch {
    return SEED_GALLERY;
  }
}

export function saveGalleryItems(items: GalleryItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("gamat:gallery-updated"));
  } catch {}
}

export async function fetchSupabaseGallery(): Promise<GalleryItem[]> {
  const local = loadGalleryItems();
  try {
    let rows: any[] | null = null;
    const { data, error } = await supabase
      .from("service_enquiries")
      .select("*")
      .eq("service_slug", SUPABASE_GALLERY_SLUG)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      rows = data;
    } else {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/service_enquiries?service_slug=eq.${SUPABASE_GALLERY_SLUG}&order=created_at.desc&select=*`,
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

    if (!rows || rows.length === 0) {
      return local;
    }

    const remoteItems: GalleryItem[] = rows
      .filter((r: any) => r.status !== "deleted")
      .map((r: any) => ({
        id: String(r.id),
        title: String(r.service_title || "Academy Highlight"),
        category: normalizeCategory(r.package_name),
        caption: String(r.message || ""),
        image: String(r.phone || "/images/gallery/trading-floor.jpg"),
        date: r.budget ? String(r.budget) : undefined,
        featured: r.company !== "false",
        createdAt: r.created_at || new Date().toISOString(),
      }));

    if (remoteItems.length === 0) {
      return local;
    }

    saveGalleryItems(remoteItems);
    return remoteItems;
  } catch {
    return local;
  }
}

export async function upsertSupabaseGalleryItem(item: GalleryItem): Promise<boolean> {
  const payload = {
    id: item.id,
    ref: item.category,
    service_slug: SUPABASE_GALLERY_SLUG,
    service_title: item.title,
    package_name: item.category,
    name: "GAMAT Gallery",
    email: "hello@gamatfxacademy.com",
    phone: item.image,
    company: item.featured === false ? "false" : "true",
    budget: item.date || null,
    message: item.caption || item.title,
    user_id: null,
    status: "published",
    created_at: item.createdAt,
  };

  try {
    const { error } = await supabase.from("service_enquiries").upsert(payload, { onConflict: "id" });
    if (!error) return true;
    const { error: insertErr } = await supabase.from("service_enquiries").insert(payload);
    return !insertErr || insertErr.code === "23505";
  } catch {
    return false;
  }
}

export async function deleteSupabaseGalleryItem(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("service_enquiries").delete().eq("id", id);
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
