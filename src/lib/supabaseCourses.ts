import { supabase } from "./supabase";
import { COURSES, type Course } from "./courses";
import type { ManagedCourse } from "./store";

/** Database row schema for the Supabase `courses` table. */
export type SupabaseCourseRow = {
  id: string;
  tag: string;
  level: string;
  title: string;
  short: string;
  desc: string;
  duration: string;
  enrolled: number;
  rating: number;
  price: number;
  old_price?: number | null;
  featured: boolean;
  poster: string;
  video: string;
  outcomes: string[];
  requirements: string[];
  modules: any[];
  published?: boolean;
  created_at?: string;
  updated_at?: string;
};

/** Converts a frontend Course model to a Supabase table row. */
export function courseToRow(c: Course | ManagedCourse): SupabaseCourseRow {
  return {
    id: c.id,
    tag: c.tag || "Fundamental",
    level: c.level || "All levels",
    title: c.title,
    short: c.short || "",
    desc: c.desc || "",
    duration: c.duration || "Self-paced",
    enrolled: ("enrolled" in c ? c.enrolled : 0) ?? 0,
    rating: ("rating" in c ? c.rating : 5) ?? 5,
    price: c.price ?? 0,
    old_price: c.oldPrice ?? null,
    featured: !!c.featured,
    poster: c.poster || "",
    video: c.video || "",
    outcomes: c.outcomes ?? [],
    requirements: c.requirements ?? [],
    modules: c.modules ?? [],
    published: ("published" in c ? c.published : true) ?? true,
    updated_at: new Date().toISOString(),
  };
}

/** Converts a Supabase table row to a frontend Course model. */
export function rowToCourse(row: SupabaseCourseRow): Course & { published?: boolean } {
  return {
    id: row.id,
    tag: (row.tag as Course["tag"]) || "Fundamental",
    level: row.level || "All levels",
    title: row.title,
    short: row.short || row.desc || "",
    desc: row.desc || row.short || "",
    duration: row.duration || "Self-paced",
    enrolled: row.enrolled ?? 0,
    rating: row.rating ?? 5,
    price: Number(row.price ?? 0),
    oldPrice: row.old_price ? Number(row.old_price) : undefined,
    featured: !!row.featured,
    poster: row.poster || "/images/about-hero.jpg",
    video: row.video || "",
    outcomes: Array.isArray(row.outcomes) ? row.outcomes : [],
    requirements: Array.isArray(row.requirements) ? row.requirements : [],
    modules: Array.isArray(row.modules) ? row.modules : [],
    published: row.published ?? true,
  };
}

/** Fetches courses from Supabase. If table is empty or unpopulated, seeds default courses into Supabase. */
export async function fetchSupabaseCourses(): Promise<Course[]> {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Supabase courses fetch error (falling back to local default):", error.message);
      return COURSES;
    }

    if (!data || data.length === 0) {
      console.log("No courses found in Supabase. Seeding default courses to Supabase database...");
      await seedSupabaseCourses(COURSES);
      return COURSES;
    }

    return data.map((row) => rowToCourse(row as SupabaseCourseRow));
  } catch (err) {
    console.error("Failed to connect to Supabase courses table:", err);
    return COURSES;
  }
}

/** Seeds default static courses to Supabase. */
export async function seedSupabaseCourses(courses: Course[]): Promise<void> {
  try {
    const rows = courses.map((c) => courseToRow(c));
    const { error } = await supabase.from("courses").upsert(rows, { onConflict: "id" });
    if (error) {
      console.warn("Supabase courses seed error:", error.message);
    } else {
      console.log("Successfully seeded courses to Supabase database!");
    }
  } catch (err) {
    console.error("Failed to seed courses to Supabase:", err);
  }
}

/** Saves or updates a course in Supabase database. */
export async function saveSupabaseCourse(course: ManagedCourse | Course): Promise<{ ok: boolean; error?: string }> {
  try {
    const row = courseToRow(course);
    const { error } = await supabase.from("courses").upsert(row, { onConflict: "id" });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to save course to Supabase" };
  }
}

/** Deletes a course from Supabase database by ID. */
export async function deleteSupabaseCourse(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to delete course from Supabase" };
  }
}
