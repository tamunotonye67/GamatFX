import { useState, useMemo } from "react";
import { AdminShell, Card, StatCard, Badge, SearchBar, Modal, Empty, exportCsv, fmtDate } from "./AdminShell";
import { Th, Td, IconBtn } from "./AdminMain";
import { useStore } from "../../lib/store";
import { naira, compactNaira } from "../../lib/courses";
import { type StoreProduct, type StoreProductCategory } from "../../lib/storeProducts";
import {
  ShoppingBag, Plus, Pencil, Trash2, Eye, EyeOff, Bot, LineChart,
  BookOpen, Target, Package, LayoutGrid, Download, CheckCircle2, DollarSign,
  Clock, Gift
} from "lucide-react";

export function AdminStore() {
  const { admin } = useStore();
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Modals
  const [editing, setEditing] = useState<StoreProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<StoreProduct | null>(null);

  const products = admin.storeProducts || [];

  const storePayments = useMemo(() => {
    return admin.payments.filter((p) => p.courseId.startsWith("store-") && p.status === "paid");
  }, [admin.payments]);

  const storeRevenue = useMemo(() => {
    return storePayments.reduce((s, p) => s + p.amount, 0);
  }, [storePayments]);

  const publishedCount = useMemo(() => {
    return products.filter((p) => p.published).length;
  }, [products]);

  const preorderCount = useMemo(() => {
    return products.filter((p) => p.isPreorder).length;
  }, [products]);

  const freeCount = useMemo(() => {
    return products.filter((p) => p.isFree || p.price === 0).length;
  }, [products]);

  const totalSales = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.salesCount || 0), 0) + storePayments.length;
  }, [products, storePayments]);

  const rows = useMemo(() => {
    return products.filter((p) => {
      const matchQ = `${p.title} ${p.tagline} ${p.deliverableType}`.toLowerCase().includes(q.toLowerCase());
      const matchCat = catFilter === "all" || p.category === catFilter;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && p.published) ||
        (statusFilter === "draft" && !p.published) ||
        (statusFilter === "preorder" && p.isPreorder) ||
        (statusFilter === "free" && (p.isFree || p.price === 0));
      return matchQ && matchCat && matchStatus;
    });
  }, [products, q, catFilter, statusFilter]);

  const categoryIcon = (cat: string) => {
    switch (cat) {
      case "bot": return Bot;
      case "indicator": return LineChart;
      case "ebook": return BookOpen;
      case "strategy": return Target;
      default: return Package;
    }
  };

  return (
    <AdminShell
      title="Store & Trading Tools"
      subtitle={`${products.length} total products (E-books, AI bots, indicators, and strategy blueprints)`}
      action={
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() =>
              exportCsv(
                "gamat_store_products.csv",
                rows.map((p) => ({
                  ID: p.id,
                  Title: p.title,
                  Category: p.category,
                  Price: p.isFree || p.price === 0 ? "FREE" : p.price,
                  OriginalPrice: p.originalPrice ?? "",
                  IsFree: p.isFree || p.price === 0 ? "Yes" : "No",
                  IsPreorder: p.isPreorder ? "Yes" : "No",
                  PreorderReleaseDate: p.preorderReleaseDate ?? "",
                  SalesCount: p.salesCount,
                  Status: p.published ? "Published" : "Draft",
                  Deliverable: p.deliverableType,
                  CreatedAt: fmtDate(p.createdAt),
                }))
              )
            }
            className="btn-outline-dark !py-2 sm:!py-2.5 text-xs font-bold flex-1 sm:flex-none justify-center"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={() => setCreating(true)}
            className="btn-primary !py-2 sm:!py-2.5 text-xs font-bold flex-1 sm:flex-none justify-center"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      }
    >
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={ShoppingBag} label="Total Products" value={products.length} sub={`${publishedCount} active in store`} />
        <StatCard
          icon={DollarSign}
          label="Store Revenue"
          value={compactNaira(storeRevenue)}
          fullValue={naira(storeRevenue)}
          sub={`${storePayments.length} purchases recorded`}
        />
        <StatCard
          icon={Clock}
          label="Pre-Orders & Free"
          value={`${preorderCount} / ${freeCount}`}
          sub={`${preorderCount} upcoming • ${freeCount} free tools`}
        />
        <StatCard icon={Package} label="Units Delivered" value={totalSales} sub="Digital & physical downloads" />
      </div>

      <Card className="mt-6 sm:mt-8 overflow-hidden">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 border-b border-line p-3 sm:p-4">
          <div className="w-full sm:w-auto sm:min-w-[240px] flex-1">
            <SearchBar value={q} onChange={setQ} placeholder="Search product title, deliverable, or tagline…" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="flex-1 sm:flex-none rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-ink outline-none focus:border-brand"
            >
              <option value="all">All categories</option>
              <option value="bot">AI Bots & EAs</option>
              <option value="indicator">Indicators</option>
              <option value="ebook">E-Books & Playbooks</option>
              <option value="strategy">Strategy Blueprints</option>
              <option value="tool">Physical Journals & Tools</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-ink outline-none focus:border-brand"
            >
              <option value="all">All statuses & types</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="preorder">Pre-orders only</option>
              <option value="free">Free items only</option>
            </select>
          </div>
          <span className="text-xs text-muted sm:ml-auto self-center sm:self-auto">{rows.length} item(s)</span>
        </div>

        {/* Product List */}
        {rows.length > 0 ? (
          <>
            {/* Mobile Card List (< md) */}
            <div className="md:hidden divide-y divide-line">
              {rows.map((p) => {
                const CatIcon = categoryIcon(p.category);
                return (
                  <div key={p.id} className="p-4 space-y-3 transition hover:bg-cream/40">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="flex h-10 w-10 shrink-0 aspect-square items-center justify-center rounded-xl bg-cream border border-line text-brand">
                          <CatIcon className="h-5 w-5 shrink-0" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-ink text-sm leading-snug">{p.title}</p>
                          <p className="text-xs text-muted truncate mt-0.5">{p.tagline}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <Badge tone="gray">{p.category.toUpperCase()}</Badge>
                            <Badge tone={p.published ? "green" : "amber"}>
                              {p.published ? "Published" : "Draft"}
                            </Badge>
                            {p.isPreorder && (
                              <Badge tone="purple">
                                <Clock className="h-2.5 w-2.5 inline mr-0.5" /> PRE-ORDER
                              </Badge>
                            )}
                            {(p.isFree || p.price === 0) && (
                              <Badge tone="green">
                                <Gift className="h-2.5 w-2.5 inline mr-0.5" /> FREE
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-line/60">
                      <div>
                        <span className="text-muted block text-[10px] uppercase font-semibold">Price</span>
                        <span className="font-bold text-ink">
                          {p.isFree || p.price === 0 ? (
                            <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                              <Gift className="h-3 w-3" /> FREE
                            </span>
                          ) : (
                            naira(p.price)
                          )}
                        </span>
                        {p.originalPrice && (
                          <span className="text-[10px] text-muted line-through ml-1.5">{naira(p.originalPrice)}</span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-muted block text-[10px] uppercase font-semibold">Sales</span>
                        <span className="font-semibold text-ink">{p.salesCount || 0} units</span>
                      </div>
                    </div>

                    {p.isPreorder && p.preorderReleaseDate && (
                      <p className="text-[11px] font-semibold text-purple-700 flex items-center gap-1 bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-100">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>Releases: {p.preorderReleaseDate}</span>
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-muted truncate max-w-[180px]">
                        {p.deliverableType}
                      </span>
                      <div className="flex items-center gap-1">
                        <IconBtn
                          title={p.published ? "Unpublish" : "Publish"}
                          onClick={() => admin.saveStoreProduct({ ...p, published: !p.published })}
                        >
                          {p.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </IconBtn>
                        <IconBtn title="Edit" onClick={() => setEditing(p)}>
                          <Pencil className="h-4 w-4" />
                        </IconBtn>
                        <IconBtn
                          danger
                          title="Delete"
                          onClick={() => {
                            if (confirm(`Delete "${p.title}"?`)) admin.deleteStoreProduct(p.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconBtn>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[850px] text-sm">
                <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <Th className="w-[30%] min-w-[260px]">Product</Th>
                    <Th className="whitespace-nowrap">Category</Th>
                    <Th className="whitespace-nowrap">Price</Th>
                    <Th className="whitespace-nowrap">Deliverable</Th>
                    <Th className="whitespace-nowrap">Status</Th>
                    <Th className="whitespace-nowrap">Sales</Th>
                    <Th right>Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((p) => {
                    const CatIcon = categoryIcon(p.category);
                    return (
                      <tr key={p.id} className="transition hover:bg-cream/50">
                        <Td className="min-w-[260px]">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 aspect-square items-center justify-center rounded-xl bg-cream border border-line text-brand">
                              <CatIcon className="h-5 w-5 shrink-0" />
                            </span>
                            <div className="min-w-0 max-w-xs">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="truncate font-semibold text-ink">{p.title}</p>
                                {p.isPreorder && (
                                  <Badge tone="purple">
                                    <Clock className="h-2.5 w-2.5 inline mr-0.5" /> PRE-ORDER
                                  </Badge>
                                )}
                                {(p.isFree || p.price === 0) && (
                                  <Badge tone="green">
                                    <Gift className="h-2.5 w-2.5 inline mr-0.5" /> FREE
                                  </Badge>
                                )}
                              </div>
                              <p className="truncate text-xs text-muted">{p.tagline}</p>
                              {p.isPreorder && p.preorderReleaseDate && (
                                <p className="text-[11px] font-semibold text-purple-700 flex items-center gap-1 mt-0.5">
                                  <Clock className="h-3 w-3 shrink-0" />
                                  <span>Releases: {p.preorderReleaseDate}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </Td>
                        <Td className="whitespace-nowrap">
                          <Badge tone="gray">{p.category.toUpperCase()}</Badge>
                        </Td>
                        <Td className="whitespace-nowrap">
                          <div>
                            <p className="font-bold text-ink">
                              {p.isFree || p.price === 0 ? (
                                <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                                  <Gift className="h-3.5 w-3.5" /> FREE
                                </span>
                              ) : (
                                naira(p.price)
                              )}
                            </p>
                            {p.originalPrice && (
                              <p className="text-[11px] text-muted line-through">{naira(p.originalPrice)}</p>
                            )}
                          </div>
                        </Td>
                        <Td className="whitespace-nowrap">
                          <span className="text-xs text-muted line-clamp-1 max-w-[200px]">
                            {p.deliverableType}
                          </span>
                        </Td>
                        <Td className="whitespace-nowrap">
                          <Badge tone={p.published ? "green" : "amber"}>
                            {p.published ? "Published" : "Draft"}
                          </Badge>
                        </Td>
                        <Td className="whitespace-nowrap">
                          <span className="font-semibold text-ink">{p.salesCount || 0}</span>
                        </Td>
                        <Td right>
                          <div className="flex justify-end gap-1">
                            <IconBtn
                              title={p.published ? "Unpublish" : "Publish"}
                              onClick={() => admin.saveStoreProduct({ ...p, published: !p.published })}
                            >
                              {p.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </IconBtn>
                            <IconBtn title="Edit" onClick={() => setEditing(p)}>
                              <Pencil className="h-4 w-4" />
                            </IconBtn>
                            <IconBtn
                              danger
                              title="Delete"
                              onClick={() => {
                                if (confirm(`Delete "${p.title}"?`)) admin.deleteStoreProduct(p.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </IconBtn>
                          </div>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <Empty icon={ShoppingBag} title="No products found" body="Create a new store product or adjust filters." />
        )}
      </Card>

      {/* Add / Edit Product Modal */}
      {(creating || editing) && (
        <ProductFormModal
          product={editing || undefined}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </AdminShell>
  );
}

function ProductFormModal({ product, onClose }: { product?: StoreProduct; onClose: () => void }) {
  const { admin } = useStore();
  const [f, setF] = useState({
    title: product?.title ?? "",
    tagline: product?.tagline ?? "",
    category: product?.category ?? "bot",
    price: product?.isFree || product?.price === 0 ? "0" : (product?.price ? String(product.price) : "25000"),
    originalPrice: product?.originalPrice ? String(product.originalPrice) : "45000",
    isFree: product?.isFree ?? (product?.price === 0),
    isPreorder: product?.isPreorder ?? false,
    preorderReleaseDate: product?.preorderReleaseDate ?? "",
    preorderNote: product?.preorderNote ?? "",
    badge: product?.badge ?? "Best Seller",
    author: product?.author ?? "By GAMAT Institutional Research Desk",
    image: product?.image ?? "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1000&q=80",
    deliverableType: product?.deliverableType ?? "Instant PDF Download",
    downloadUrl: product?.downloadUrl ?? "",
    accessInstructions: product?.accessInstructions ?? "Instant download available upon checkout.",
    description: product?.description ?? "",
    featuresStr: product?.features ? product.features.join("\n") : "Complete user manual included\nProp-firm compatible\nFree lifetime updates",
    published: product?.published ?? true,
  });

  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.title.trim()) {
      setErr("Product title is required.");
      return;
    }
    const isFree = f.isFree;
    const numPrice = isFree ? 0 : Number(f.price);
    if (!isFree && (!numPrice || numPrice <= 0)) {
      setErr("Please enter a valid price in Naira, or check 'Set as 100% Free Item'.");
      return;
    }

    const features = f.featuresStr
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = admin.saveStoreProduct({
      id: product?.id,
      title: f.title.trim(),
      tagline: f.tagline.trim(),
      category: f.category as StoreProduct["category"],
      price: numPrice,
      originalPrice: f.originalPrice ? Number(f.originalPrice) : undefined,
      isFree,
      isPreorder: f.isPreorder,
      preorderReleaseDate: f.isPreorder ? f.preorderReleaseDate.trim() : undefined,
      preorderNote: f.isPreorder ? f.preorderNote.trim() : undefined,
      badge: f.badge.trim() || undefined,
      author: f.author.trim() || "By GAMAT Institutional Research Desk",
      image: f.image.trim() || "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1000&q=80",
      deliverableType: f.deliverableType.trim(),
      downloadUrl: f.downloadUrl.trim() || undefined,
      accessInstructions: f.accessInstructions.trim(),
      description: f.description.trim(),
      features,
      published: f.published,
      rating: product?.rating ?? 5.0,
      reviewCount: product?.reviewCount ?? 1,
    });

    if (res.ok) {
      onClose();
    } else {
      setErr(res.error || "Failed to save product.");
    }
  };

  return (
    <Modal open onClose={onClose} title={product ? "Edit Store Product" : "Add Store Product"} wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        {err && (
          <p className="rounded-xl border border-brand/30 bg-brand-light p-3 text-xs font-bold text-brand">
            {err}
          </p>
        )}

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-muted">Product Title</label>
          <input
            type="text"
            required
            value={f.title}
            onChange={(e) => setF({ ...f, title: e.target.value })}
            placeholder="e.g. GAMAT Apex Scalper EA"
            className="mt-1 w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-brand"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted">Author / Creator Line</label>
            <input
              type="text"
              value={f.author}
              onChange={(e) => setF({ ...f, author: e.target.value })}
              placeholder="e.g. By Lead Mentor Tonye & Research Desk"
              className="mt-1 w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted">Cover Image URL</label>
            <input
              type="url"
              value={f.image}
              onChange={(e) => setF({ ...f, image: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="mt-1 w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-brand"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-muted">Tagline (One-sentence summary)</label>
          <input
            type="text"
            value={f.tagline}
            onChange={(e) => setF({ ...f, tagline: e.target.value })}
            placeholder="e.g. Automated session breakout robot with strict prop-firm risk limits"
            className="mt-1 w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-muted">Category</label>
          <select
            value={f.category}
            onChange={(e) => setF({ ...f, category: e.target.value as any })}
            className="mt-1 w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-brand"
          >
            <option value="bot">AI Bots & EAs</option>
            <option value="indicator">Indicators & Scripts</option>
            <option value="ebook">E-Books & Playbooks</option>
            <option value="strategy">Strategy Blueprints</option>
            <option value="tool">Physical Journals & Tools</option>
          </select>
        </div>

        {/* 1. Item Pricing & Free Item Setting */}
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="isFree"
                checked={f.isFree}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setF({
                    ...f,
                    isFree: checked,
                    price: checked ? "0" : (f.price === "0" ? "25000" : f.price),
                    badge: checked && (!f.badge || f.badge === "Best Seller") ? "Free Resource" : f.badge,
                  });
                }}
                className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
              />
              <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Gift className="h-4 w-4 text-emerald-600" />
                <span>Set as 100% Free Item (₦0)</span>
              </span>
            </label>
            {f.isFree && (
              <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Free Download Active
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted">
            Check this to let students and visitors access/download this tool without any payment. You can enter an Original Price to demonstrate its value (e.g. ₦15,000 struck through).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-muted">
                Price (₦ Naira) {f.isFree ? "(Free = ₦0)" : ""}
              </label>
              <input
                type="number"
                disabled={f.isFree}
                required={!f.isFree}
                value={f.isFree ? "0" : f.price}
                onChange={(e) => setF({ ...f, price: e.target.value })}
                placeholder={f.isFree ? "0 (Free)" : "e.g. 25000"}
                className="mt-1 w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-brand disabled:bg-slate-100 disabled:text-muted disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-muted">
                Original / Value Price (Strike-through)
              </label>
              <input
                type="number"
                value={f.originalPrice}
                onChange={(e) => setF({ ...f, originalPrice: e.target.value })}
                placeholder="e.g. 45000"
                className="mt-1 w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-brand"
              />
            </div>
          </div>
        </div>

        {/* 2. Pre-Order Configuration Setting */}
        <div className="rounded-2xl border border-purple-200/90 bg-purple-50/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                id="isPreorder"
                checked={f.isPreorder}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setF({
                    ...f,
                    isPreorder: checked,
                    badge: checked && (!f.badge || f.badge === "Best Seller") ? "Pre-Order" : f.badge,
                  });
                }}
                className="h-4 w-4 rounded accent-purple-600 cursor-pointer"
              />
              <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-purple-700" />
                <span>Mark Tool / Product as Pre-Order</span>
              </span>
            </label>
            {f.isPreorder && (
              <span className="text-[11px] font-extrabold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                Pre-Order Mode Enabled
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted">
            Enable pre-orders for upcoming bots, indicators, or physical journals so students can reserve their copy before the official release.
          </p>

          {f.isPreorder && (
            <div className="space-y-3 pt-2 border-t border-purple-100">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-purple-950">
                  Expected Release / Delivery Window
                </label>
                <input
                  type="text"
                  value={f.preorderReleaseDate}
                  onChange={(e) => setF({ ...f, preorderReleaseDate: e.target.value })}
                  placeholder="e.g. April 2026 or April 15, 2026"
                  className="mt-1 w-full rounded-xl border border-purple-200 bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-purple-950">
                  Pre-Order Notice & Early-Bird Incentive Note
                </label>
                <textarea
                  rows={2}
                  value={f.preorderNote}
                  onChange={(e) => setF({ ...f, preorderNote: e.target.value })}
                  placeholder="e.g. Pre-order now to lock in 50% early bird launch pricing. Software license and files delivered on release day."
                  className="mt-1 w-full rounded-xl border border-purple-200 bg-white p-3 text-xs text-ink outline-none focus:border-purple-600"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted">Badge Label</label>
            <input
              type="text"
              value={f.badge}
              onChange={(e) => setF({ ...f, badge: e.target.value })}
              placeholder="e.g. Best Seller, Prop-Firm Safe, New"
              className="mt-1 w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted">Deliverable Type</label>
            <input
              type="text"
              value={f.deliverableType}
              onChange={(e) => setF({ ...f, deliverableType: e.target.value })}
              placeholder="e.g. Compiled EX4/EX5 Robots + Setup Guide"
              className="mt-1 w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-brand"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-muted">Download URL or File Host Link</label>
          <input
            type="text"
            value={f.downloadUrl}
            onChange={(e) => setF({ ...f, downloadUrl: e.target.value })}
            placeholder="https://gamatfxacademy.com/assets/downloads/file.zip"
            className="mt-1 w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-brand font-mono text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-muted">Delivery & License Instructions</label>
          <input
            type="text"
            value={f.accessInstructions}
            onChange={(e) => setF({ ...f, accessInstructions: e.target.value })}
            placeholder="Instant download available upon checkout..."
            className="mt-1 w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-muted">Feature Highlights (One per line)</label>
          <textarea
            rows={3}
            value={f.featuresStr}
            onChange={(e) => setF({ ...f, featuresStr: e.target.value })}
            placeholder="Enter each feature bullet on a new line..."
            className="mt-1 w-full rounded-xl border border-line bg-white p-3 text-xs text-ink outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-muted">Full Description</label>
          <textarea
            rows={4}
            value={f.description}
            onChange={(e) => setF({ ...f, description: e.target.value })}
            placeholder="Detailed description of the tool, indicators, or e-book..."
            className="mt-1 w-full rounded-xl border border-line bg-white p-3 text-xs text-ink outline-none focus:border-brand"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="published"
            checked={f.published}
            onChange={(e) => setF({ ...f, published: e.target.checked })}
            className="h-4 w-4 rounded accent-brand"
          />
          <label htmlFor="published" className="text-xs font-bold text-ink cursor-pointer">
            Publish in Store immediately
          </label>
        </div>

        <div className="pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2 border-t border-line">
          <button type="button" onClick={onClose} className="btn-outline-dark !py-2.5 justify-center">
            Cancel
          </button>
          <button type="submit" className="btn-primary !py-2.5 justify-center">
            {product ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
