import { supabase } from "./supabase";
import { COURSES } from "./courses";
import { courseToRow } from "./supabaseCourses";
import { accountToRow } from "./supabaseAuth";
import { saveSupabaseNews, saveSupabaseEvent, saveSupabaseReview, saveSupabaseSOTW, saveSupabaseGiveaway } from "./supabaseServices";
import type { ManagedCourse, Account, NewsItem, EventItem, ReviewItem, StudentOfTheWeek, Giveaway } from "./store";

/**
 * Checks key Supabase database tables on app initialization.
 * If empty, seeds initial foundation records directly into Supabase.
 */
export async function seedSupabaseDatabaseIfEmpty(initialData: {
  courses: ManagedCourse[];
  accounts: Account[];
  news: NewsItem[];
  events: EventItem[];
  reviews: ReviewItem[];
  sotw: StudentOfTheWeek;
  giveaways: Giveaway[];
}) {
  try {
    // 1. Seed Courses if table is empty
    const { count: courseCount } = await supabase.from("courses").select("*", { count: "exact", head: true });
    if (courseCount === 0 || courseCount === null) {
      console.log("⚡ Seeding Supabase database table: courses...");
      const rows = (initialData.courses.length > 0 ? initialData.courses : COURSES as any[]).map(c => courseToRow(c));
      await supabase.from("courses").upsert(rows);
    }

    // 2. Seed Accounts if table is empty
    const { count: accountCount } = await supabase.from("accounts").select("*", { count: "exact", head: true });
    if (accountCount === 0 || accountCount === null) {
      console.log("⚡ Seeding Supabase database table: accounts...");
      const rows = initialData.accounts.map(a => accountToRow(a));
      await supabase.from("accounts").upsert(rows);
    }

    // 3. Seed News if table is empty
    const { count: newsCount } = await supabase.from("news").select("*", { count: "exact", head: true });
    if (newsCount === 0 || newsCount === null) {
      console.log("⚡ Seeding Supabase database table: news...");
      for (const item of initialData.news) {
        await saveSupabaseNews(item);
      }
    }

    // 4. Seed Events if table is empty
    const { count: eventCount } = await supabase.from("events").select("*", { count: "exact", head: true });
    if (eventCount === 0 || eventCount === null) {
      console.log("⚡ Seeding Supabase database table: events...");
      for (const item of initialData.events) {
        await saveSupabaseEvent(item);
      }
    }

    // 5. Seed Reviews if table is empty
    const { count: reviewCount } = await supabase.from("reviews").select("*", { count: "exact", head: true });
    if (reviewCount === 0 || reviewCount === null) {
      console.log("⚡ Seeding Supabase database table: reviews...");
      for (const item of initialData.reviews) {
        await saveSupabaseReview(item);
      }
    }

    // 6. Seed Student of the Week if table is empty
    const { count: sotwCount } = await supabase.from("student_of_the_week").select("*", { count: "exact", head: true });
    if (sotwCount === 0 || sotwCount === null) {
      console.log("⚡ Seeding Supabase database table: student_of_the_week...");
      await saveSupabaseSOTW(initialData.sotw);
    }

    // 7. Seed Giveaways if table is empty
    const { count: giveawayCount } = await supabase.from("giveaways").select("*", { count: "exact", head: true });
    if (giveawayCount === 0 || giveawayCount === null) {
      console.log("⚡ Seeding Supabase database table: giveaways...");
      for (const item of initialData.giveaways) {
        await saveSupabaseGiveaway(item);
      }
    }
  } catch (err) {
    console.warn("Supabase database seeding notice:", err);
  }
}

/**
 * Subscribes to Supabase Realtime changes across key tables.
 * When data changes in Supabase, triggers the provided callback.
 */
export function subscribeToSupabaseRealtime(onTableChange: (tableName: string) => void) {
  const channel = supabase
    .channel("gamatfx-realtime-sync")
    .on(
      "postgres_changes",
      { event: "*", schema: "public" },
      (payload) => {
        if (payload.table) {
          onTableChange(payload.table);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
