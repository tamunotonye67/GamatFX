import { useEffect, useMemo, useState } from "react";
import PageHero from "../components/PageHero";
import PageCta from "../components/PageCta";
import {
  GALLERY_CATEGORIES,
  loadGalleryItems,
  fetchSupabaseGallery,
  type GalleryCategory,
  type GalleryItem,
} from "../lib/gallery";
import { Camera, ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(() => loadGalleryItems());
  const [cat, setCat] = useState<"All" | GalleryCategory>("All");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchSupabaseGallery().then((remote) => {
      if (mounted) setItems(remote);
    });
    const onUpdate = () => {
      if (mounted) setItems(loadGalleryItems());
    };
    window.addEventListener("gamat:gallery-updated", onUpdate);
    return () => {
      mounted = false;
      window.removeEventListener("gamat:gallery-updated", onUpdate);
    };
  }, []);

  const filtered = useMemo(() => {
    if (cat === "All") return items;
    return items.filter((item) => item.category === cat);
  }, [items, cat]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") setLightboxIdx((prev) => (prev === null ? null : (prev + 1) % filtered.length));
      if (e.key === "ArrowLeft") setLightboxIdx((prev) => (prev === null ? null : (prev - 1 + filtered.length) % filtered.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, filtered.length]);

  const activeItem = lightboxIdx !== null ? filtered[lightboxIdx] : null;

  return (
    <>
      <PageHero
        crumb="Gallery"
        eyebrow="Campus & Community Gallery"
        image="/images/gallery/live-workshop.jpg"
        title={
          <>
            Inside <span className="text-brand">GAMAT Fx</span> Academy
          </>
        }
        subtitle="Real moments from our Port Harcourt trading floor, physical mentorship classes, cohort graduations, and live market workshops."
      />

      <section className="section bg-cream">
        <div className="container-x">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {(["All", ...GALLERY_CATEGORIES] as const).map((c) => {
                const active = cat === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCat(c);
                      setLightboxIdx(null);
                    }}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                      active
                        ? "bg-brand text-white shadow-sm"
                        : "border border-line bg-white text-ink/75 hover:border-brand hover:text-brand"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-muted">
              <Camera className="h-4 w-4 text-brand" />
              <span>
                {filtered.length} {filtered.length === 1 ? "photo" : "photos"}
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLightboxIdx(idx)}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-white text-left shadow-[0_14px_40px_-24px_rgba(22,24,28,0.3)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(22,24,28,0.4)] cursor-pointer"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
                    <ZoomIn className="h-4 w-4" />
                  </span>
                  <span className="absolute left-3 bottom-3 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                    {item.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-base font-bold text-ink">{item.title}</h3>
                      {item.date && <span className="text-[11px] font-semibold text-muted shrink-0">{item.date}</span>}
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted line-clamp-2">{item.caption}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeItem && lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setLightboxIdx(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-ink text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxIdx(null)}
              aria-label="Close gallery preview"
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-brand transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative bg-black">
              <img
                src={activeItem.image}
                alt={activeItem.title}
                className="max-h-[70vh] w-full object-contain"
              />
              {filtered.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setLightboxIdx((lightboxIdx - 1 + filtered.length) % filtered.length)}
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-brand transition cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxIdx((lightboxIdx + 1) % filtered.length)}
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-brand transition cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            <div className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brand/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                    {activeItem.category}
                  </span>
                  {activeItem.date && <span className="text-xs text-white/55">{activeItem.date}</span>}
                </div>
                <h3 className="mt-1.5 font-display text-lg font-bold text-white">{activeItem.title}</h3>
                <p className="mt-1 text-xs sm:text-sm text-white/75">{activeItem.caption}</p>
              </div>
              <span className="text-xs text-white/50 shrink-0">
                {lightboxIdx + 1} / {filtered.length}
              </span>
            </div>
          </div>
        </div>
      )}

      <PageCta
        tone="light"
        title="Ready to join our next cohort?"
        body="Train with us online or in person at our Port Harcourt campus."
        primaryLabel="Browse Courses"
        primaryTo="/courses"
      />
    </>
  );
}
