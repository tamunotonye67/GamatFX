import { supabase } from "./supabase";

const CF_MEDIA_BASE = (import.meta.env.VITE_CLOUDFLARE_MEDIA_URL || "").trim().replace(/\/+$/, "");

/**
 * Rewrites public Supabase Storage URLs to go through your Cloudflare Worker cache
 * when VITE_CLOUDFLARE_MEDIA_URL is configured (no-op otherwise).
 */
export function toEdgeMediaUrl(url: string): string {
  if (!url || !CF_MEDIA_BASE) return url;
  return url.replace(
    /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//i,
    `${CF_MEDIA_BASE}/storage/v1/object/public/`
  );
}

/**
 * Attempts to upload directly to Cloudflare R2 ($0 egress) via /api/r2-presign.
 * Returns null if R2 is not configured yet so callers seamlessly fall back to Supabase Storage.
 */
async function tryUploadToR2(key: string, file: File): Promise<string | null> {
  try {
    const res = await fetch("/api/r2-presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key,
        contentType: file.type || "application/octet-stream",
      }),
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    if (!data?.ok || !data?.uploadUrl || !data?.publicUrl) return null;

    const putRes = await fetch(data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!putRes.ok) return null;
    return data.publicUrl as string;
  } catch {
    return null;
  }
}

/**
 * Uploads a user avatar image to Cloudflare R2 (if configured) or Supabase Storage 'avatars' bucket.
 * Returns the public CDN URL of the uploaded image.
 */
export async function uploadAvatar(userId: string, file: File): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    const fileExt = file.name.split(".").pop() || "jpg";
    const filePath = `user_${userId}_${Date.now()}.${fileExt}`;

    const r2Url = await tryUploadToR2(`avatars/${filePath}`, file);
    if (r2Url) return { ok: true, url: r2Url };

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.warn("Supabase avatar upload notice:", uploadError.message);
      // Fallback: If bucket does not exist or upload failed, convert file to data URL
      const dataUrl = await fileToDataUrl(file);
      return { ok: true, url: dataUrl };
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return { ok: true, url: toEdgeMediaUrl(publicUrl) };
  } catch (err: any) {
    console.warn("Avatar upload fallback triggered:", err);
    const dataUrl = await fileToDataUrl(file);
    return { ok: true, url: dataUrl };
  }
}

/**
 * Uploads a course poster or learning asset to the Supabase Storage 'course-materials' bucket.
 * Returns the public CDN URL of the uploaded asset.
 */
export async function uploadCourseAsset(courseId: string, file: File): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    const fileExt = file.name.split(".").pop() || "jpg";
    const filePath = `course_${courseId}_${Date.now()}.${fileExt}`;

    const r2Url = await tryUploadToR2(`course-materials/${filePath}`, file);
    if (r2Url) return { ok: true, url: r2Url };

    const { error: uploadError } = await supabase.storage
      .from("course-materials")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.warn("Supabase course asset upload notice:", uploadError.message);
      const dataUrl = await fileToDataUrl(file);
      return { ok: true, url: dataUrl };
    }

    const { data: { publicUrl } } = supabase.storage.from("course-materials").getPublicUrl(filePath);
    return { ok: true, url: toEdgeMediaUrl(publicUrl) };
  } catch (err: any) {
    const dataUrl = await fileToDataUrl(file);
    return { ok: true, url: dataUrl };
  }
}

/**
 * Uploads a course preview or lesson video to Cloudflare R2 (if configured) or Supabase Storage 'course-materials' bucket.
 * Falls back to a data URL only for small clips (<= 2.5MB) so localStorage is never exhausted.
 */
export async function uploadCourseVideo(courseId: string, file: File): Promise<{ ok: boolean; url?: string; error?: string }> {
  const MAX_CLOUD_BYTES = 200 * 1024 * 1024; // 200MB
  if (file.size > MAX_CLOUD_BYTES) {
    return { ok: false, error: "Video file is larger than 200MB. Please compress it or paste a video URL instead." };
  }

  try {
    const fileExt = (file.name.split(".").pop() || "mp4").toLowerCase();
    const filePath = `videos/course_${courseId || "new"}_${Date.now()}.${fileExt}`;

    const r2Url = await tryUploadToR2(`course-materials/${filePath}`, file);
    if (r2Url) return { ok: true, url: r2Url };

    const { error: uploadError } = await supabase.storage
      .from("course-materials")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type || "video/mp4",
      });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from("course-materials").getPublicUrl(filePath);
      return { ok: true, url: toEdgeMediaUrl(publicUrl) };
    }

    console.warn("Supabase course video upload notice:", uploadError.message);
    if (file.size <= 2.5 * 1024 * 1024) {
      const dataUrl = await fileToDataUrl(file);
      return { ok: true, url: dataUrl };
    }
    return {
      ok: false,
      error: `Cloud video upload failed (${uploadError.message}). Paste a video URL or try a smaller clip.`,
    };
  } catch (err: any) {
    if (file.size <= 2.5 * 1024 * 1024) {
      const dataUrl = await fileToDataUrl(file);
      return { ok: true, url: dataUrl };
    }
    return {
      ok: false,
      error: err?.message || "Video upload failed. Please paste a video URL instead.",
    };
  }
}

/**
 * Uploads a company logo or official signature to Cloudflare R2 (if configured) or Supabase Storage 'company-assets' bucket.
 * Returns the public CDN URL of the uploaded asset.
 */
export async function uploadCompanyAsset(assetKey: string, file: File): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    const fileExt = file.name.split(".").pop() || "png";
    const filePath = `asset_${assetKey}_${Date.now()}.${fileExt}`;

    const r2Url = await tryUploadToR2(`company-assets/${filePath}`, file);
    if (r2Url) return { ok: true, url: r2Url };

    const { error: uploadError } = await supabase.storage
      .from("company-assets")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.warn("Supabase company asset upload notice:", uploadError.message);
      const dataUrl = await fileToDataUrl(file);
      return { ok: true, url: dataUrl };
    }

    const { data: { publicUrl } } = supabase.storage.from("company-assets").getPublicUrl(filePath);
    return { ok: true, url: toEdgeMediaUrl(publicUrl) };
  } catch (err: any) {
    const dataUrl = await fileToDataUrl(file);
    return { ok: true, url: dataUrl };
  }
}

/** Format bytes into friendly size string like 1.4 MB */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Uploads a store digital deliverable file (e.g. PDF, ZIP, EA .ex4/.ex5, indicator scripts)
 * to Cloudflare R2 (if configured) or Supabase Storage with graceful fallback to Base64 data URL.
 */
export async function uploadStoreFile(productId: string, file: File): Promise<{ ok: boolean; url: string; fileName: string; fileSize: string; error?: string }> {
  const sizeStr = formatBytes(file.size);
  try {
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `store_files/${productId || "prod"}_${Date.now()}_${cleanName}`;

    const r2Url = await tryUploadToR2(`course-materials/${filePath}`, file);
    if (r2Url) return { ok: true, url: r2Url, fileName: file.name, fileSize: sizeStr };

    const bucket = "course-materials";
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return { ok: true, url: toEdgeMediaUrl(publicUrl), fileName: file.name, fileSize: sizeStr };
    }
    console.warn("Supabase store file upload notice:", uploadError.message);
  } catch (err: any) {
    console.warn("Store file upload fallback triggered:", err);
  }

  const dataUrl = await fileToDataUrl(file);
  return { ok: true, url: dataUrl, fileName: file.name, fileSize: sizeStr };
}

/**
 * Uploads a store thumbnail picture or gallery preview picture.
 * Returns public URL (or data URL fallback).
 */
export async function uploadStoreAsset(productId: string, file: File, prefix = "thumb"): Promise<{ ok: boolean; url: string; fileName: string; error?: string }> {
  try {
    const fileExt = file.name.split(".").pop() || "jpg";
    const filePath = `store_${prefix}_${productId || "prod"}_${Date.now()}.${fileExt}`;

    const r2Url = await tryUploadToR2(`course-materials/${filePath}`, file);
    if (r2Url) return { ok: true, url: r2Url, fileName: file.name };

    const { error: uploadError } = await supabase.storage
      .from("course-materials")
      .upload(filePath, file, { upsert: true });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from("course-materials").getPublicUrl(filePath);
      return { ok: true, url: toEdgeMediaUrl(publicUrl), fileName: file.name };
    }
    console.warn("Supabase store asset upload notice:", uploadError.message);
  } catch (err: any) {
    console.warn("Store asset upload fallback triggered:", err);
  }

  const dataUrl = await fileToDataUrl(file);
  return { ok: true, url: dataUrl, fileName: file.name };
}

/**
 * Uploads any general image (forum screenshots, club chat images, news/outlook covers, SOTW photos)
 * directly to Cloudflare R2 ($0 egress), falling back to a compressed data URL if R2 is unavailable.
 */
export async function uploadPublicImage(folder: string, file: File): Promise<string> {
  const cleanFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, "") || "media";
  const ext = (file.name.split(".").pop() || "jpg").replace(/[^a-zA-Z0-9]/g, "") || "jpg";
  const key = `${cleanFolder}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const r2Url = await tryUploadToR2(key, file);
  if (r2Url) return r2Url;
  return fileToDataUrl(file);
}

/** Utility to convert a File object to a Base64 data URL, automatically compressing images to prevent storage quota exhaustion */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    // If it's an image, downscale and compress to compact JPEG (~70KB) so it safely fits anywhere
    if (file.type.startsWith("image/") && typeof document !== "undefined") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const maxDim = 1200;
            let width = img.width;
            let height = img.height;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL("image/jpeg", 0.82);
              resolve(compressed);
              return;
            }
          } catch {}
          resolve(String(e.target?.result || ""));
        };
        img.onerror = () => resolve(String(e.target?.result || ""));
        img.src = String(e.target?.result || "");
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => resolve(String(e.target?.result || ""));
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

