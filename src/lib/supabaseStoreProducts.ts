import { supabase } from "./supabase";
import { type StoreProduct, type StoreProductCategory } from "./storeProducts";

export function storeProductToRow(p: StoreProduct): any {
  return {
    id: p.id,
    tag: "StoreProduct",
    level: p.category,
    title: p.title,
    short: p.tagline || "",
    desc: p.description || "",
    duration: p.deliverableType || "Digital Download",
    price: p.price,
    old_price: p.originalPrice || null,
    poster: p.image || "",
    video: p.downloadUrl || "",
    outcomes: Array.isArray(p.features) ? p.features : [],
    requirements: Array.isArray(p.gallery) ? p.gallery : [],
    modules: [
      {
        isStoreProduct: true,
        category: p.category,
        deliverableType: p.deliverableType,
        fileName: p.fileName,
        fileSize: p.fileSize,
        accessInstructions: p.accessInstructions,
        badge: p.badge,
        author: p.author,
        isFree: p.isFree ?? (p.price === 0),
        isPreorder: p.isPreorder ?? false,
        preorderReleaseDate: p.preorderReleaseDate,
        preorderNote: p.preorderNote,
        compatibility: p.compatibility,
        salesCount: p.salesCount ?? 0,
        rating: p.rating ?? 0,
        reviewCount: p.reviewCount ?? 0,
        createdAt: p.createdAt || new Date().toISOString(),
      },
    ],
    published: p.published !== false,
    updated_at: p.updatedAt || new Date().toISOString(),
  };
}

export function rowToStoreProduct(row: any): StoreProduct {
  const meta = (Array.isArray(row.modules) && row.modules[0]) || {};
  return {
    id: row.id,
    title: row.title || "Untitled Product",
    tagline: row.short || "",
    category: (meta.category || row.level || "bot") as Exclude<StoreProductCategory, "all">,
    price: Number(row.price) || 0,
    originalPrice: row.old_price ? Number(row.old_price) : undefined,
    isFree: meta.isFree !== undefined ? Boolean(meta.isFree) : row.price === 0,
    isPreorder: Boolean(meta.isPreorder),
    preorderReleaseDate: meta.preorderReleaseDate || undefined,
    preorderNote: meta.preorderNote || undefined,
    rating: typeof meta.rating === "number" ? meta.rating : 0,
    reviewCount: typeof meta.reviewCount === "number" ? meta.reviewCount : 0,
    badge: meta.badge || undefined,
    author: meta.author || "By GAMAT Institutional Research Desk",
    description: row.desc || "",
    features: Array.isArray(row.outcomes) ? row.outcomes : [],
    deliverableType: meta.deliverableType || row.duration || "Digital Download",
    downloadUrl: row.video || meta.downloadUrl || undefined,
    fileName: meta.fileName || undefined,
    fileSize: meta.fileSize || undefined,
    accessInstructions: meta.accessInstructions || "Instant download available upon checkout.",
    published: row.published !== false,
    salesCount: typeof meta.salesCount === "number" ? meta.salesCount : 0,
    image: row.poster || "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1000&q=80",
    gallery: Array.isArray(row.requirements) ? row.requirements : [],
    compatibility: Array.isArray(meta.compatibility) ? meta.compatibility : ["TradingView", "MT4", "MT5", "PDF"],
    createdAt: meta.createdAt || row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at,
  };
}

const LEGACY_MOCK_IDS = new Set([
  "gamat-playbook-v1",
  "gamat-trade-journal",
  "gamat-sniper-indicator",
  "gamat-prop-firm-bundle",
  "gamat-quantum-orderflow-bot",
]);

/** Fetches store products from Supabase without re-seeding deleted/mock items. */
export async function fetchSupabaseStoreProducts(): Promise<StoreProduct[] | null> {
  try {
    const { supabaseUrl, supabaseKey } = await import("./supabase");
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/courses?tag=eq.StoreProduct&order=created_at.desc&select=*`,
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
        if (Array.isArray(json)) {
          return json
            .map((row) => rowToStoreProduct(row))
            .filter((p) => !LEGACY_MOCK_IDS.has(p.id));
        }
      }
    } catch {}

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("tag", "StoreProduct")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase store products fetch error:", error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data
      .map((row) => rowToStoreProduct(row))
      .filter((p) => !LEGACY_MOCK_IDS.has(p.id));
  } catch (err) {
    console.error("Failed to connect to Supabase for store products:", err);
    return null;
  }
}

/** Saves or updates a store product in Supabase database. */
export async function saveSupabaseStoreProduct(product: StoreProduct): Promise<{ ok: boolean; error?: string }> {
  try {
    const row = storeProductToRow(product);
    const { error } = await supabase.from("courses").upsert(row, { onConflict: "id" });
    if (!error) return { ok: true };
  } catch {}

  try {
    const { supabaseUrl, supabaseKey } = await import("./supabase");
    const row = storeProductToRow(product);
    const res = await fetch(`${supabaseUrl}/rest/v1/courses?on_conflict=id`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(row),
    });
    if (res.ok) return { ok: true };
    return { ok: false, error: `HTTP ${res.status}` };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to save store product to Supabase" };
  }
}

/** Deletes a store product from Supabase database by ID. */
export async function deleteSupabaseStoreProduct(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { supabaseUrl, supabaseKey } = await import("./supabase");
    const res = await fetch(
      `${supabaseUrl}/rest/v1/courses?id=eq.${encodeURIComponent(id)}&tag=eq.StoreProduct`,
      {
        method: "DELETE",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: "return=representation",
        },
      }
    );
    if (res.ok) return { ok: true };
  } catch {}

  try {
    const { error } = await supabase.from("courses").delete().eq("id", id).eq("tag", "StoreProduct");
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to delete store product from Supabase" };
  }
}
