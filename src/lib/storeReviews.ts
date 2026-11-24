import { supabase, supabaseUrl, supabaseKey } from "./supabase";

export type StoreProductReview = {
  id: string;
  productId: string;
  userName: string;
  userEmail?: string;
  rating: number;
  comment: string;
  createdAt: string;
};

const STORE_REVIEWS_KEY = "gamat.store_reviews.v1";
const SUPABASE_STORE_REVIEW_SLUG = "sys_store_review";

export function loadStoreReviews(): StoreProductReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE_REVIEWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((r: any) => ({
      id: String(r.id),
      productId: String(r.productId || ""),
      userName: String(r.userName || "Verified Buyer"),
      userEmail: r.userEmail ? String(r.userEmail) : undefined,
      rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
      comment: String(r.comment || ""),
      createdAt: r.createdAt || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export function saveStoreReviews(list: StoreProductReview[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_REVIEWS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("gamat:store-reviews-updated"));
  } catch {}
}

export async function fetchSupabaseStoreReviews(): Promise<StoreProductReview[]> {
  const local = loadStoreReviews();
  try {
    let rows: any[] | null = null;
    const { data, error } = await supabase
      .from("service_enquiries")
      .select("*")
      .eq("service_slug", SUPABASE_STORE_REVIEW_SLUG)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      rows = data;
    } else {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/service_enquiries?service_slug=eq.${SUPABASE_STORE_REVIEW_SLUG}&order=created_at.desc&select=*`,
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

    if (!rows) return local;

    const remoteIds = new Set<string>();
    const remoteItems: StoreProductReview[] = rows.map((r: any) => {
      remoteIds.add(String(r.id));
      return {
        id: String(r.id),
        productId: String(r.ref || ""),
        userName: String(r.name || "Verified Buyer"),
        userEmail: r.email && r.email !== "buyer@gamatfx.com" ? String(r.email) : undefined,
        rating: Math.min(5, Math.max(1, Number(r.budget) || 5)),
        comment: String(r.message || ""),
        createdAt: r.created_at || new Date().toISOString(),
      };
    });

    const unsynced = local.filter((loc) => !remoteIds.has(loc.id));
    const pushed: StoreProductReview[] = [];
    if (unsynced.length > 0) {
      const results = await Promise.all(
        unsynced.map(async (loc) => ((await saveSupabaseStoreReview(loc)) ? loc : null))
      );
      for (const item of results) {
        if (item) pushed.push(item);
      }
    }

    const merged = [...remoteItems, ...pushed].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    saveStoreReviews(merged);
    return merged;
  } catch {
    return local;
  }
}

export async function saveSupabaseStoreReview(rev: StoreProductReview): Promise<boolean> {
  const payload = {
    id: rev.id,
    ref: rev.productId,
    service_slug: SUPABASE_STORE_REVIEW_SLUG,
    service_title: `Store Rating (${rev.rating}★)`,
    package_name: rev.productId,
    name: rev.userName || "Verified Buyer",
    email: rev.userEmail || "buyer@gamatfx.com",
    phone: "/store",
    company: null,
    budget: String(rev.rating),
    message: rev.comment || `Rated ${rev.rating} out of 5 stars`,
    user_id: null,
    status: "published",
    created_at: rev.createdAt,
  };
  try {
    const { error } = await supabase.from("service_enquiries").insert(payload);
    if (!error || error.code === "23505") return true;
    const res = await fetch(`${supabaseUrl}/rest/v1/service_enquiries`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=ignore-duplicates,return=minimal",
      },
      body: JSON.stringify(payload),
    });
    return res.ok || res.status === 409;
  } catch {
    return false;
  }
}

export async function submitStoreReview(input: {
  productId: string;
  userName: string;
  userEmail?: string;
  rating: number;
  comment?: string;
}): Promise<StoreProductReview> {
  const newRev: StoreProductReview = {
    id: `srev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    productId: input.productId,
    userName: input.userName.trim() || "Verified Buyer",
    userEmail: input.userEmail?.trim() || undefined,
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    comment: input.comment?.trim() || "",
    createdAt: new Date().toISOString(),
  };

  const current = loadStoreReviews();
  const next = [newRev, ...current];
  saveStoreReviews(next);
  await saveSupabaseStoreReview(newRev);
  return newRev;
}

export function getEffectiveProductRating(
  prod: { id: string; rating: number; reviewCount: number },
  allReviews: StoreProductReview[]
): { rating: number; reviewCount: number; productReviews: StoreProductReview[] } {
  const productReviews = allReviews.filter((r) => r.productId === prod.id);
  const baseCount = prod.reviewCount > 0 ? prod.reviewCount : 0;
  const baseSum = baseCount > 0 ? prod.rating * baseCount : 0;
  const userSum = productReviews.reduce((sum, r) => sum + r.rating, 0);
  const totalCount = baseCount + productReviews.length;
  const avg = totalCount > 0 ? (baseSum + userSum) / totalCount : 0;
  return {
    rating: Number(avg.toFixed(1)),
    reviewCount: totalCount,
    productReviews,
  };
}
