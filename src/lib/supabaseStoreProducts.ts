import { supabase } from "./supabase";
import { SEED_STORE_PRODUCTS, type StoreProduct, type StoreProductCategory } from "./storeProducts";

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
        rating: p.rating ?? 5.0,
        reviewCount: p.reviewCount ?? 1,
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
    category: (meta.category || row.level || "bot") as StoreProductCategory,
    price: Number(row.price) || 0,
    originalPrice: row.old_price ? Number(row.old_price) : undefined,
    isFree: meta.isFree !== undefined ? Boolean(meta.isFree) : row.price === 0,
    isPreorder: Boolean(meta.isPreorder),
    preorderReleaseDate: meta.preorderReleaseDate || undefined,
    preorderNote: meta.preorderNote || undefined,
    rating: typeof meta.rating === "number" ? meta.rating : 5.0,
    reviewCount: typeof meta.reviewCount === "number" ? meta.reviewCount : 1,
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

/** Fetches store products from Supabase. If empty, seeds initial store products into Supabase. */
export async function fetchSupabaseStoreProducts(): Promise<StoreProduct[]> {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("tag", "StoreProduct")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase store products fetch error (falling back to local default):", error.message);
      return SEED_STORE_PRODUCTS;
    }

    if (!data || data.length === 0) {
      console.log("No store products found in Supabase. Seeding default store products to Supabase database...");
      await seedSupabaseStoreProducts(SEED_STORE_PRODUCTS);
      return SEED_STORE_PRODUCTS;
    }

    return data.map((row) => rowToStoreProduct(row));
  } catch (err) {
    console.error("Failed to connect to Supabase for store products:", err);
    return SEED_STORE_PRODUCTS;
  }
}

/** Seeds default store products into Supabase. */
export async function seedSupabaseStoreProducts(products: StoreProduct[]): Promise<void> {
  try {
    const rows = products.map((p) => storeProductToRow(p));
    const { error } = await supabase.from("courses").upsert(rows, { onConflict: "id" });
    if (error) {
      console.warn("Supabase store products seed notice:", error.message);
    } else {
      console.log("Successfully seeded store products to Supabase database!");
    }
  } catch (err) {
    console.error("Failed to seed store products to Supabase:", err);
  }
}

/** Saves or updates a store product in Supabase database. */
export async function saveSupabaseStoreProduct(product: StoreProduct): Promise<{ ok: boolean; error?: string }> {
  try {
    const row = storeProductToRow(product);
    const { error } = await supabase.from("courses").upsert(row, { onConflict: "id" });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to save store product to Supabase" };
  }
}

/** Deletes a store product from Supabase database by ID. */
export async function deleteSupabaseStoreProduct(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("courses").delete().eq("id", id).eq("tag", "StoreProduct");
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to delete store product from Supabase" };
  }
}
