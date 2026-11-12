import { supabase } from "./supabase";

/**
 * Uploads a user avatar image to the Supabase Storage 'avatars' bucket.
 * Returns the public CDN URL of the uploaded image.
 */
export async function uploadAvatar(userId: string, file: File): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    const fileExt = file.name.split(".").pop() || "jpg";
    const filePath = `user_${userId}_${Date.now()}.${fileExt}`;

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
    return { ok: true, url: publicUrl };
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

    const { error: uploadError } = await supabase.storage
      .from("course-materials")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.warn("Supabase course asset upload notice:", uploadError.message);
      const dataUrl = await fileToDataUrl(file);
      return { ok: true, url: dataUrl };
    }

    const { data: { publicUrl } } = supabase.storage.from("course-materials").getPublicUrl(filePath);
    return { ok: true, url: publicUrl };
  } catch (err: any) {
    const dataUrl = await fileToDataUrl(file);
    return { ok: true, url: dataUrl };
  }
}

/**
 * Uploads a company logo or official signature to the Supabase Storage 'company-assets' bucket.
 * Returns the public CDN URL of the uploaded asset.
 */
export async function uploadCompanyAsset(assetKey: string, file: File): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    const fileExt = file.name.split(".").pop() || "png";
    const filePath = `asset_${assetKey}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("company-assets")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.warn("Supabase company asset upload notice:", uploadError.message);
      const dataUrl = await fileToDataUrl(file);
      return { ok: true, url: dataUrl };
    }

    const { data: { publicUrl } } = supabase.storage.from("company-assets").getPublicUrl(filePath);
    return { ok: true, url: publicUrl };
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
 * to Supabase Storage with graceful fallback to Base64 data URL.
 */
export async function uploadStoreFile(productId: string, file: File): Promise<{ ok: boolean; url: string; fileName: string; fileSize: string; error?: string }> {
  const sizeStr = formatBytes(file.size);
  try {
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `store_files/${productId || "prod"}_${Date.now()}_${cleanName}`;

    const bucket = "course-materials";
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return { ok: true, url: publicUrl, fileName: file.name, fileSize: sizeStr };
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

    const { error: uploadError } = await supabase.storage
      .from("course-materials")
      .upload(filePath, file, { upsert: true });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from("course-materials").getPublicUrl(filePath);
      return { ok: true, url: publicUrl, fileName: file.name };
    }
    console.warn("Supabase store asset upload notice:", uploadError.message);
  } catch (err: any) {
    console.warn("Store asset upload fallback triggered:", err);
  }

  const dataUrl = await fileToDataUrl(file);
  return { ok: true, url: dataUrl, fileName: file.name };
}

/** Utility to convert a File object to a Base64 data URL */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

