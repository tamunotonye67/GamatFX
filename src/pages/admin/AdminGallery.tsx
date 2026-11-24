import { useEffect, useRef, useState } from "react";
import { AdminShell, Card, StatCard, Badge, SearchBar, Modal, Empty } from "./AdminShell";
import {
  GALLERY_CATEGORIES,
  SEED_GALLERY,
  loadGalleryItems,
  saveGalleryItems,
  fetchSupabaseGallery,
  upsertSupabaseGalleryItem,
  deleteSupabaseGalleryItem,
  type GalleryCategory,
  type GalleryItem,
} from "../../lib/gallery";
import { uploadStoreAsset } from "../../lib/supabaseStorage";
import { Camera, Plus, Pencil, Trash2, Upload, Loader2, Star, ExternalLink } from "lucide-react";
import { navigate } from "../../lib/router";

type Draft = {
  id?: string;
  title: string;
  category: GalleryCategory;
  caption: string;
  image: string;
  date: string;
  featured: boolean;
};

const blankDraft = (): Draft => ({
  title: "",
  category: "Campus & Classes",
  caption: "",
  image: "",
  date: String(new Date().getFullYear()),
  featured: true,
});

export function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>(() => loadGalleryItems());
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState<"all" | GalleryCategory>("all");
  const [editing, setEditing] = useState<Draft | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchSupabaseGallery().then((remote) => setItems(remote));
  }, []);

  const filtered = items.filter((item) => {
    if (catFilter !== "all" && item.category !== catFilter) return false;
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return (
      item.title.toLowerCase().includes(s) ||
      item.caption.toLowerCase().includes(s) ||
      item.category.toLowerCase().includes(s)
    );
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadStoreAsset(file);
      if (url && editing) {
        setEditing({ ...editing, image: url });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.title.trim() || !editing.image.trim()) return;
    setSaving(true);
    try {
      const existing = editing.id ? items.find((i) => i.id === editing.id) : undefined;
      const item: GalleryItem = {
        id: editing.id || `gal_${Date.now().toString(36)}`,
        title: editing.title.trim(),
        category: editing.category,
        caption: editing.caption.trim(),
        image: editing.image.trim(),
        date: editing.date.trim() || undefined,
        featured: editing.featured,
        createdAt: existing?.createdAt || new Date().toISOString(),
      };
      const next = existing
        ? items.map((i) => (i.id === item.id ? item : i))
        : [item, ...items];
      setItems(next);
      saveGalleryItems(next);
      await upsertSupabaseGalleryItem(item);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this photo from the gallery?")) return;
    const next = items.filter((i) => i.id !== id);
    const finalItems = next.length > 0 ? next : SEED_GALLERY;
    setItems(finalItems);
    saveGalleryItems(finalItems);
    await deleteSupabaseGalleryItem(id);
  };

  const featuredCount = items.filter((i) => i.featured !== false).length;

  return (
    <AdminShell
      title="Campus Gallery"
      subtitle="Upload and manage photos shown on the About Us gallery section and the /gallery page."
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/gallery")}
            className="btn-outline-dark !py-2 !px-3.5 text-xs"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View Gallery
          </button>
          <button
            type="button"
            onClick={() => setEditing(blankDraft())}
            className="btn-primary !py-2 !px-4 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Add Photo
          </button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Photos" value={items.length} icon={Camera} />
        <StatCard label="Featured on About Us" value={featuredCount} icon={Star} tone="brand" />
        <StatCard label="Categories" value={GALLERY_CATEGORIES.length} icon={Camera} tone="success" />
      </div>

      <Card className="mt-6 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar value={q} onChange={setQ} placeholder="Search gallery photos..." />
          <div className="flex flex-wrap gap-1.5">
            {(["all", ...GALLERY_CATEGORIES] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCatFilter(c)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  catFilter === c
                    ? "bg-brand text-white"
                    : "border border-line bg-cream text-ink/75 hover:border-brand"
                }`}
              >
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6">
            <Empty
              icon={Camera}
              title="No gallery photos found"
              body="Try clearing your search or add a new campus photo."
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-line bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full bg-ink overflow-hidden">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                    <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
                      <Badge tone="ink">{item.category}</Badge>
                      {item.featured !== false && <Badge tone="brand">About Us</Badge>}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-sm font-bold text-ink truncate">{item.title}</h3>
                      {item.date && <span className="text-[11px] text-muted shrink-0">{item.date}</span>}
                    </div>
                    <p className="mt-1 text-xs text-muted line-clamp-2">{item.caption}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-line bg-cream/40 px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({
                        id: item.id,
                        title: item.title,
                        category: item.category,
                        caption: item.caption,
                        image: item.image,
                        date: item.date || "",
                        featured: item.featured !== false,
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1 text-xs font-semibold text-ink hover:border-brand hover:text-brand cursor-pointer"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit Gallery Photo" : "Add Gallery Photo"}
      >
        {editing && (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                Photo Title *
              </label>
              <input
                type="text"
                required
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="e.g. August Mentorship Cohort"
                className="w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Category
                </label>
                <select
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value as GalleryCategory })}
                  className="w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand"
                >
                  {GALLERY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                  Year / Date
                </label>
                <input
                  type="text"
                  value={editing.date}
                  onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  placeholder="2026"
                  className="w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                Image URL or Upload *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={editing.image}
                  onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                  placeholder="https://... or /images/gallery/..."
                  className="flex-1 rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand"
                />
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-bold text-ink hover:border-brand cursor-pointer disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  Upload
                </button>
              </div>
              {editing.image && (
                <img
                  src={editing.image}
                  alt="Preview"
                  className="mt-2 h-32 w-full rounded-xl object-cover border border-line"
                />
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                Caption
              </label>
              <textarea
                rows={3}
                value={editing.caption}
                onChange={(e) => setEditing({ ...editing, caption: e.target.value })}
                placeholder="Brief description of the moment..."
                className="w-full rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-brand"
              />
            </div>

            <label className="flex items-center gap-2.5 text-xs font-semibold text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={editing.featured}
                onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                className="h-4 w-4 accent-brand"
              />
              Show in the About Us Gallery preview section
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="btn-outline-dark !py-2 !px-4 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || uploading}
                className="btn-primary !py-2 !px-5 text-xs disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Photo"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </AdminShell>
  );
}
