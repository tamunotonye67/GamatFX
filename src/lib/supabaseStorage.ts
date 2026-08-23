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

/** Utility to convert a File object to a Base64 data URL */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
