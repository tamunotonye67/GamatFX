export type StoreProductCategory = "all" | "ebook" | "indicator" | "bot" | "strategy" | "tool";

export type StoreProduct = {
  id: string;
  title: string;
  tagline: string;
  category: "ebook" | "indicator" | "bot" | "strategy" | "tool";
  price: number; // in Naira (0 for free items)
  originalPrice?: number;
  isFree?: boolean; // Set as 100% Free tool / resource
  isPreorder?: boolean; // Set as Pre-order tool / upcoming release
  preorderReleaseDate?: string; // Estimated release window e.g. "April 2026"
  preorderNote?: string; // Preorder notice or early-bird perks
  rating: number;
  reviewCount: number;
  badge?: string; // e.g. "Best Seller #1", "Prop-Firm Verified", "New Release"
  author: string; // e.g. "By GAMAT Institutional Research Team"
  description: string;
  features: string[];
  deliverableType: string; // e.g. "Instant PDF + Cheatsheet", "MT4/MT5 Robot File"
  downloadUrl?: string;
  fileName?: string;
  accessInstructions?: string;
  published: boolean;
  salesCount: number;
  image: string;
  gallery?: string[];
  fileSize?: string;
  compatibility?: string[]; // e.g. ["TradingView", "MT4", "MT5", "PDF"]
  createdAt: string;
  updatedAt?: string;
};

const LEGACY_MOCK_PRODUCT_IDS = new Set([
  "gamat-playbook-v1",
  "gamat-trade-journal",
  "gamat-sniper-indicator",
  "gamat-prop-firm-bundle",
  "gamat-quantum-orderflow-bot",
]);

export const SEED_STORE_PRODUCTS: StoreProduct[] = [];

export const STORE_STORAGE_KEY = "gamat.store_products.v2";

export function loadStoredProducts(): StoreProduct[] {
  try {
    const raw = localStorage.getItem(STORE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const rawDel = localStorage.getItem("gamat.deleted_store_products.v1");
      const delSet = new Set<string>(rawDel ? JSON.parse(rawDel) : []);
      const cleaned = parsed.filter(
        (p: StoreProduct) => !LEGACY_MOCK_PRODUCT_IDS.has(p.id) && !delSet.has(p.id)
      );
      if (cleaned.length !== parsed.length) {
        try {
          localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(cleaned));
        } catch {}
      }
      return cleaned;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveStoredProducts(list: StoreProduct[]): void {
  try {
    localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    // Fallback: If localStorage quota is exceeded (e.g. large base64 data URLs), strip oversize base64 and retry
    try {
      const sanitized = list.map((p) => ({
        ...p,
        image: p.image?.startsWith("data:") && p.image.length > 60000
          ? "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1000&q=80"
          : p.image,
        gallery: p.gallery?.map((g) => (g.startsWith("data:") && g.length > 60000 ? "" : g)).filter(Boolean),
        downloadUrl: p.downloadUrl?.startsWith("data:") && p.downloadUrl.length > 60000 ? undefined : p.downloadUrl,
      }));
      localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(sanitized));
    } catch {}
  }
}
