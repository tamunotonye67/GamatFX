import { supabase } from "./supabase";
import type { Account } from "./store";

export type SupabaseAccountRow = {
  id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  bio?: string | null;
  avatar?: string | null;
  nickname?: string | null;
  birthday?: string | null;
  role: string;
  staff_level?: string | null;
  job_title?: string | null;
  status: string;
  joined?: string | null;
};

/** Converts a frontend Account object into a Supabase database row. */
export function accountToRow(acc: Account): SupabaseAccountRow {
  return {
    id: acc.id,
    first_name: acc.firstName,
    middle_name: acc.middleName ?? null,
    last_name: acc.lastName,
    email: acc.email,
    phone: acc.phone ?? null,
    country: acc.country ?? null,
    bio: acc.bio ?? null,
    avatar: acc.avatar ?? null,
    nickname: acc.nickname ?? null,
    birthday: acc.birthday ?? null,
    role: acc.role || "student",
    staff_level: acc.staffLevel ?? null,
    job_title: acc.jobTitle ?? null,
    status: acc.status || "active",
    joined: acc.joined || new Date().toISOString(),
  };
}

/** Converts a Supabase database row into a frontend Account object. */
export function rowToAccount(row: SupabaseAccountRow, defaultPassword?: string): Account {
  return {
    id: row.id,
    firstName: row.first_name,
    middleName: row.middle_name ?? undefined,
    lastName: row.last_name,
    email: row.email,
    password: defaultPassword || "password123",
    phone: row.phone ?? undefined,
    country: row.country ?? undefined,
    bio: row.bio ?? undefined,
    avatar: row.avatar ?? undefined,
    nickname: row.nickname ?? undefined,
    birthday: row.birthday ?? undefined,
    role: (row.role as Account["role"]) || "student",
    staffLevel: (row.staff_level as Account["staffLevel"]) ?? undefined,
    jobTitle: row.job_title ?? undefined,
    status: (row.status as Account["status"]) || "active",
    joined: row.joined || new Date().toISOString(),
  };
}

/** Registers a new user with Supabase Auth and inserts their profile into public.accounts table. */
export async function signUpSupabaseUser(
  email: string,
  pass: string,
  accData: Omit<Account, "id" | "joined">
): Promise<{ ok: boolean; account?: Account; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const siteOrigin = typeof window !== "undefined" && window.location.origin ? window.location.origin : undefined;
    // 1. Register in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: pass,
      options: {
        emailRedirectTo: siteOrigin,
        data: {
          first_name: accData.firstName,
          last_name: accData.lastName,
        },
      },
    });

    if (authError) {
      console.warn("Supabase auth signup notice:", authError.message);
      if (
        authError.message.toLowerCase().includes("user already registered") ||
        authError.message.toLowerCase().includes("already exists")
      ) {
        return { ok: false, error: "An account with this email already exists." };
      }
      return { ok: false, error: authError.message };
    }

    const userId = authData.user?.id || `u_${Date.now()}`;
    const newAccount: Account = {
      ...accData,
      email: cleanEmail,
      id: userId,
      joined: new Date().toISOString(),
    };

    // 2. Save user profile to Supabase `accounts` table
    const row = accountToRow(newAccount);
    const { error: dbError } = await supabase.from("accounts").upsert(row, { onConflict: "id" });
    if (dbError) {
      console.warn("Supabase accounts insert error:", dbError.message);
    }

    return { ok: true, account: newAccount };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to sign up with Supabase" };
  }
}

/** Authenticates a user with Supabase Auth and fetches their profile from public.accounts table. */
export async function signInSupabaseUser(
  email: string,
  pass: string
): Promise<{ ok: boolean; account?: Account; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: pass,
    });

    if (authError) {
      console.warn("Supabase auth login notice:", authError.message);
      return { ok: false, error: authError.message };
    }

    if (authData?.user) {
      // Query user profile from public.accounts
      const { data: rows, error: dbError } = await supabase
        .from("accounts")
        .select("*")
        .eq("email", cleanEmail)
        .single();

      if (!dbError && rows) {
        const acc = rowToAccount(rows as SupabaseAccountRow, pass);
        return { ok: true, account: acc };
      }

      // Fallback if row does not exist yet in accounts table
      const fallbackAcc: Account = {
        id: authData.user.id,
        firstName: authData.user.user_metadata?.first_name || cleanEmail.split("@")[0],
        lastName: authData.user.user_metadata?.last_name || "User",
        email: cleanEmail,
        password: pass,
        role: "student",
        status: "active",
        joined: new Date().toISOString(),
      };
      saveSupabaseAccount(fallbackAcc);
      return { ok: true, account: fallbackAcc };
    }

    return { ok: false, error: "Invalid login credentials" };
  } catch (err: any) {
    return { ok: false, error: err.message || "Sign in failed" };
  }
}

/** Signs out the current user session in Supabase. */
export async function signOutSupabaseUser(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn("Supabase sign out notice:", err);
  }
}

/** Fetches all user accounts from Supabase `accounts` table. */
export async function fetchSupabaseAccounts(): Promise<Account[]> {
  try {
    const { data, error } = await supabase.from("accounts").select("*");
    if (error || !data) return [];
    return data.map((row) => rowToAccount(row as SupabaseAccountRow));
  } catch (err) {
    console.error("Failed to fetch accounts from Supabase:", err);
    return [];
  }
}

/** Saves or updates an account profile in Supabase `accounts` table. */
export async function saveSupabaseAccount(acc: Account): Promise<{ ok: boolean; error?: string }> {
  try {
    const row = accountToRow(acc);
    const { error } = await supabase.from("accounts").upsert(row, { onConflict: "id" });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to save account to Supabase" };
  }
}

/** Deletes an account profile from Supabase `accounts` table. */
export async function deleteSupabaseAccount(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("accounts").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to delete account from Supabase" };
  }
}

/** Signs in or signs up a user using Google OAuth via Supabase. */
export async function signInWithGoogleSupabase(): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to sign in with Google" };
  }
}

/** Sends a password reset email via Supabase Auth. */
export async function resetPasswordForEmailSupabase(email: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const siteOrigin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "";
    const redirectTo = `${siteOrigin}/#reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
    if (error) {
      if (error.message.toLowerCase().includes("rate limit") || error.message.toLowerCase().includes("rate_limit")) {
        return {
          ok: false,
          error: "You have requested too many password reset emails recently. Please wait a few minutes before trying again.",
        };
      }
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to send reset email" };
  }
}

/** Updates the password for the active recovery session in Supabase Auth. */
export async function updatePasswordSupabase(newPassword: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to update password" };
  }
}

