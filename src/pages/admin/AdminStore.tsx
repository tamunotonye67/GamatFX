import { useState, useMemo, useRef } from "react";
import { AdminShell, Card, StatCard, Badge, SearchBar, Modal, Empty, exportCsv, fmtDate } from "./AdminShell";
import { Th, Td, IconBtn } from "./AdminMain";
import { useStore } from "../../lib/store";
import { naira, compactNaira } from "../../lib/courses";
import { type StoreProduct, type StoreProductCategory } from "../../lib/storeProducts";
import { uploadStoreFile, uploadStoreAsset } from "../../lib/supabaseStorage";
import { normalizeImageUrl, handleImageError, DEFAULT_FALLBACK_IMAGES } from "../../lib/imageUrl";
import {
  ShoppingBag, Plus, Pencil, Trash2, Eye, EyeOff, Bot, LineChart,
  BookOpen, Target, Package, LayoutGrid, Download, CheckCircle2, DollarSign,
  Clock, Gift, Upload, Image as ImageIcon, X, FileText, Loader2, Link2, ExternalLink, ArrowLeftRight
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
          <div>
            {/* Mobile Horizontal Scroll Hint */}
            <div className="sm:hidden px-4 py-2.5 bg-cream/70 border-b border-line flex items-center justify-between text-[11px] text-muted">
              <span className="flex items-center gap-1.5 font-semibold text-ink">
                <ArrowLeftRight className="h-3.5 w-3.5 text-brand shrink-0" />
                <span>Swipe left / right to scroll full table</span>
              </span>
              <span className="font-bold text-muted">{rows.length} item(s)</span>
            </div>

            {/* Scrollable Table for All Devices (Mobile, Tablet, Desktop) */}
            <div className="overflow-x-auto overscroll-x-contain">
              <table className="w-full min-w-[1100px] text-sm">
                <thead className="bg-cream text-left text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <Th className="min-w-[320px]">Product</Th>
                    <Th className="whitespace-nowrap min-w-[120px]">Category</Th>
                    <Th className="whitespace-nowrap min-w-[120px]">Price</Th>
                    <Th className="whitespace-nowrap min-w-[200px]">Deliverable</Th>
                    <Th className="whitespace-nowrap min-w-[110px]">Status</Th>
                    <Th className="whitespace-nowrap min-w-[90px]">Sales</Th>
                    <Th right className="whitespace-nowrap min-w-[120px]">Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((p) => {
                    const CatIcon = categoryIcon(p.category);
                    return (
                      <tr key={p.id} className="transition hover:bg-cream/50">
                        <Td className="min-w-[320px]">
                          <div className="flex items-start gap-3">
                            {p.image ? (
                              <img
                                src={normalizeImageUrl(p.image, DEFAULT_FALLBACK_IMAGES.product)}
                                onError={handleImageError(DEFAULT_FALLBACK_IMAGES.product)}
                                alt=""
                                className="h-10 w-10 shrink-0 aspect-square rounded-xl object-cover border border-line bg-white mt-0.5"
                              />
                            ) : (
                              <span className="flex h-10 w-10 shrink-0 aspect-square items-center justify-center rounded-xl bg-cream border border-line text-brand mt-0.5">
                                <CatIcon className="h-5 w-5 shrink-0" />
                              </span>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-ink leading-snug">{p.title}</span>
                                {p.isPreorder && (
                                  <Badge tone="purple">
                                    <Clock className="h-3 w-3 shrink-0" />
                                    <span>PRE-ORDER</span>
                                  </Badge>
                                )}
                                {(p.isFree || p.price === 0) && (
                                  <Badge tone="green">
                                    <Gift className="h-3 w-3 shrink-0" />
                                    <span>FREE</span>
                                  </Badge>
                                )}
                              </div>
                              <p className="truncate text-xs text-muted mt-0.5">{p.tagline}</p>
                              {p.isPreorder && p.preorderReleaseDate && (
                                <p className="text-[11px] font-semibold text-purple-700 flex items-center gap-1.5 mt-1">
                                  <Clock className="h-3 w-3 shrink-0" />
                                  <span>Releases: {p.preorderReleaseDate}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </Td>
                        <Td className="whitespace-nowrap min-w-[120px]">
                          <Badge tone="gray">{p.category.toUpperCase()}</Badge>
                        </Td>
                        <Td className="whitespace-nowrap min-w-[120px]">
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
                        <Td className="whitespace-nowrap min-w-[200px]">
                          <span className="text-xs text-muted">
                            {p.deliverableType}
                          </span>
                        </Td>
                        <Td className="whitespace-nowrap min-w-[110px]">
                          <Badge tone={p.published ? "green" : "amber"}>
                            {p.published ? "Published" : "Draft"}
                          </Badge>
                        </Td>
                        <Td className="whitespace-nowrap min-w-[90px]">
                          <span className="font-semibold text-ink">{p.salesCount || 0}</span>
                        </Td>
                        <Td right className="whitespace-nowrap min-w-[120px]">
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
          </div>
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
    gallery: product?.gallery ?? [],
    deliverableType: product?.deliverableType ?? "Instant PDF Download",
    downloadUrl: product?.downloadUrl ?? "",
    fileName: product?.fileName ?? "",
    fileSize: product?.fileSize ?? "",
    accessInstructions: product?.accessInstructions ?? "Instant download available upon checkout.",
    description: product?.description ?? "",
    featuresStr: product?.features ? product.features.join("\n") : "Complete user manual included\nProp-firm compatible\nFree lifetime updates",
    published: product?.published ?? true,
  });

  const [err, setErr] = useState<string | null>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  const thumbInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    setErr(null);
    try {
      const res = await uploadStoreAsset(product?.id || "prod", file, "thumb");
      if (res.ok && res.url) {
        setF((prev) => ({ ...prev, image: res.url }));
      }
    } catch (err: any) {
      setErr(err?.message || "Failed to upload thumbnail.");
    } finally {
      setUploadingThumb(false);
      if (thumbInputRef.current) thumbInputRef.current.value = "";
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    setErr(null);
    try {
      const res = await uploadStoreFile(product?.id || "prod", file);
      if (res.ok && res.url) {
        setF((prev) => {
          let autoDeliverable = prev.deliverableType;
          const ext = file.name.split(".").pop()?.toLowerCase();
          if (ext === "zip" || ext === "rar") autoDeliverable = "ZIP Archive Bundle";
          else if (ext === "ex4" || ext === "ex5") autoDeliverable = "MT4/MT5 EA Robot File";
          else if (ext === "mq4" || ext === "mq5") autoDeliverable = "Custom Indicator Script";
          else if (ext === "pdf") autoDeliverable = "Instant PDF Document";
          else if (ext === "tpl") autoDeliverable = "MT4/MT5 Chart Template";

          return {
            ...prev,
            downloadUrl: res.url,
            fileName: res.fileName,
            fileSize: res.fileSize,
            deliverableType: autoDeliverable,
          };
        });
      }
    } catch (err: any) {
      setErr(err?.message || "Failed to upload deliverable file.");
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingGallery(true);
    setErr(null);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const res = await uploadStoreAsset(product?.id || "prod", file, "gallery");
        if (res.ok && res.url) urls.push(res.url);
      }
      if (urls.length) {
        setF((prev) => ({ ...prev, gallery: [...prev.gallery, ...urls] }));
      }
    } catch (err: any) {
      setErr(err?.message || "Failed to upload preview picture.");
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const addGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    const normalized = normalizeImageUrl(newGalleryUrl.trim(), DEFAULT_FALLBACK_IMAGES.product);
    setF((prev) => ({ ...prev, gallery: [...prev.gallery, normalized] }));
    setNewGalleryUrl("");
  };

  const removeGalleryImg = (index: number) => {
    setF((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

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

    const normImage = normalizeImageUrl(f.image.trim(), DEFAULT_FALLBACK_IMAGES.product) || DEFAULT_FALLBACK_IMAGES.product;
    const normGallery = f.gallery.length
      ? f.gallery.map((g) => normalizeImageUrl(g, DEFAULT_FALLBACK_IMAGES.product)).filter(Boolean)
      : undefined;

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
      image: normImage,
      gallery: normGallery,
      deliverableType: f.deliverableType.trim(),
      downloadUrl: f.downloadUrl.trim() || undefined,
      fileName: f.fileName.trim() || undefined,
      fileSize: f.fileSize.trim() || undefined,
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

        {/* 1. Cover Image / Thumbnail Upload */}
        <div className="rounded-2xl border border-line bg-cream/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-ink flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-brand" />
              <span>Cover Thumbnail Picture</span>
            </span>
            <span className="text-[11px] font-normal text-muted">Upload an image file or provide a link</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={normalizeImageUrl(f.image, DEFAULT_FALLBACK_IMAGES.product)}
                onError={handleImageError(DEFAULT_FALLBACK_IMAGES.product)}
                alt="Product thumbnail preview"
                className="h-20 w-28 rounded-xl object-cover border border-line shadow-xs bg-white"
              />
              {uploadingThumb && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center text-white">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={uploadingThumb}
                  onClick={() => thumbInputRef.current?.click()}
                  className="btn-outline-dark !py-1.5 !px-3 text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {uploadingThumb ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  <span>{uploadingThumb ? "Uploading Thumbnail..." : "Upload Thumbnail Picture"}</span>
                </button>
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbUpload}
                  className="hidden"
                />
                {f.image && (
                  <button
                    type="button"
                    onClick={() => setF({ ...f, image: "" })}
                    className="text-xs text-muted hover:text-brand transition underline px-1 cursor-pointer"
                  >
                    Clear Image
                  </button>
                )}
              </div>

              <div>
                <input
                  type="url"
                  value={f.image}
                  onChange={(e) => setF({ ...f, image: e.target.value })}
                  onBlur={() => {
                    if (f.image.trim()) {
                      const norm = normalizeImageUrl(f.image.trim());
                      if (norm && norm !== f.image) setF((prev) => ({ ...prev, image: norm }));
                    }
                  }}
                  placeholder="https://... or paste Google Drive / Dropbox image link"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-1.5 text-xs text-ink outline-none focus:border-brand font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Preview Pictures & Screenshots Gallery */}
        <div className="rounded-2xl border border-line bg-cream/40 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-ink flex items-center gap-1.5">
                <LayoutGrid className="h-4 w-4 text-brand" />
                <span>Preview Pictures & Screenshots Gallery ({f.gallery.length})</span>
              </span>
              <p className="text-[11px] text-muted">
                Add screenshots of the tool, indicators, backtest results, or playbook sample pages.
              </p>
            </div>
            <button
              type="button"
              disabled={uploadingGallery}
              onClick={() => galleryInputRef.current?.click()}
              className="btn-outline-dark !py-1.5 !px-3 text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {uploadingGallery ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              <span>{uploadingGallery ? "Uploading..." : "Upload Preview Pictures"}</span>
            </button>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              className="hidden"
            />
          </div>

          {/* Current Gallery Grid */}
          {f.gallery.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
              {f.gallery.map((url, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-line bg-white aspect-[4/3]">
                  <img
                    src={normalizeImageUrl(url, DEFAULT_FALLBACK_IMAGES.product)}
                    onError={handleImageError(DEFAULT_FALLBACK_IMAGES.product)}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImg(idx)}
                    title="Remove preview image"
                    className="absolute top-1 right-1 rounded-full bg-black/70 hover:bg-brand text-white p-1 transition cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Preview by URL */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="url"
              value={newGalleryUrl}
              onChange={(e) => setNewGalleryUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addGalleryUrl(); } }}
              placeholder="Or paste preview picture URL (https://...)"
              className="flex-1 rounded-xl border border-line bg-white px-3.5 py-1.5 text-xs text-ink outline-none focus:border-brand font-mono"
            />
            <button
              type="button"
              onClick={addGalleryUrl}
              disabled={!newGalleryUrl.trim()}
              className="rounded-xl border border-line bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-ink disabled:opacity-40 cursor-pointer"
            >
              Add URL
            </button>
          </div>
        </div>

        {/* 3. Deliverable Digital Product File (Direct Upload or Link) */}
        <div className="rounded-2xl border border-blue-200/90 bg-blue-50/40 p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-blue-950 flex items-center gap-1.5">
                <Package className="h-4 w-4 text-blue-600" />
                <span>Product Deliverable File (Direct Upload or Link)</span>
              </span>
              {f.downloadUrl && (
                <span className="text-[11px] font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> File Attached
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted mt-0.5">
              Upload the actual digital tool, bot, indicator, or e-book PDF so buyers can download it directly without links breaking.
            </p>
          </div>

          {/* Active File Card if available */}
          {f.downloadUrl ? (
            <div className="rounded-xl border border-blue-200 bg-white p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-10 w-10 shrink-0 aspect-square items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-ink truncate">
                    {f.fileName || (f.downloadUrl.startsWith("data:") ? "Uploaded Digital File" : f.downloadUrl.split("/").pop() || "Product File")}
                  </p>
                  <p className="text-[11px] text-muted flex items-center gap-2 mt-0.5">
                    {f.fileSize && <span className="font-semibold text-blue-700">{f.fileSize}</span>}
                    <span className="truncate max-w-[220px] text-slate-400 font-mono text-[10px]">
                      {f.downloadUrl.startsWith("data:") ? "Base64 Secure File Data" : f.downloadUrl}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <a
                  href={f.downloadUrl}
                  download={f.fileName || `${f.title || "product"}.bin`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100 transition inline-flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" /> Test Download
                </a>
                <button
                  type="button"
                  disabled={uploadingFile}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11px] font-bold text-ink hover:bg-slate-50 transition inline-flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" /> Replace File
                </button>
                <button
                  type="button"
                  onClick={() => setF({ ...f, downloadUrl: "", fileName: "", fileSize: "" })}
                  className="rounded-lg p-1.5 text-muted hover:text-brand hover:bg-brand-light transition cursor-pointer"
                  title="Remove file"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 bg-white/70 hover:bg-white p-5 text-center transition group"
            >
              <div className="flex flex-col items-center justify-center gap-1.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition">
                  {uploadingFile ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                </span>
                <p className="text-xs font-bold text-ink mt-1">
                  {uploadingFile ? "Uploading product file..." : "Click to Upload Digital Product File"}
                </p>
                <p className="text-[11px] text-muted">
                  Supports PDF e-books, ZIP archives, MT4/MT5 EX4/EX5 robots, MQ4/MQ5 indicators, templates
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* External URL alternative */}
          <div className="pt-1">
            <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1">
              <Link2 className="h-3 w-3" />
              <span>Or Provide External File Download Link (Google Drive, Mega, Dropbox, S3)</span>
            </label>
            <input
              type="text"
              value={f.downloadUrl}
              onChange={(e) => setF({ ...f, downloadUrl: e.target.value })}
              placeholder="https://drive.google.com/... or https://gamatfxacademy.com/assets/file.zip"
              className="mt-1 w-full rounded-xl border border-line bg-white px-3.5 py-2 text-xs text-ink outline-none focus:border-brand font-mono"
            />
          </div>
        </div>

        {/* 4. Item Pricing & Free Item Setting */}
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

        {/* 5. Pre-Order Configuration Setting */}
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
            <label className="text-xs font-bold uppercase tracking-wide text-muted">Deliverable Format / Label</label>
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
          <button type="button" onClick={onClose} className="btn-outline-dark !py-2.5 justify-center cursor-pointer">
            Cancel
          </button>
          <button type="submit" className="btn-primary !py-2.5 justify-center cursor-pointer">
            {product ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
