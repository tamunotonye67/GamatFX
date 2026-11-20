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
  let knownPassword = defaultPassword;
  if (!knownPassword && typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("gamat.credentials.v1");
      if (raw) {
        const creds = JSON.parse(raw);
        if (creds && typeof creds === "object" && creds[row.email.toLowerCase()]) {
          knownPassword = creds[row.email.toLowerCase()];
        }
      }
    } catch {}
  }

  return {
    id: row.id,
    firstName: row.first_name,
    middleName: row.middle_name ?? undefined,
    lastName: row.last_name,
    email: row.email,
    password: knownPassword || "password123",
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

    // 0. Check if an active profile with this email already exists in public.accounts
    let deletedSet = new Set<string>();
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("gamat.deleted_accounts.v1");
        if (raw) {
          deletedSet = new Set<string>(JSON.parse(raw).map((s: string) => s.toLowerCase()));
        }
      } catch {}
    }

    const { data: existingProfile } = await supabase
      .from("accounts")
      .select("id, email")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingProfile) {
      const isMarkedDeleted =
        deletedSet.has(existingProfile.id.toLowerCase()) || deletedSet.has(cleanEmail);
      if (!isMarkedDeleted) {
        return { ok: false, error: "An account with this email already exists." };
      }
      // Remove stale deleted profile row so re-registration succeeds cleanly
      await supabase.from("accounts").delete().eq("id", existingProfile.id);
    }

    // Clear any deletion tombstones for this email (and any previous ID) immediately
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("gamat.deleted_accounts.v1");
        if (raw) {
          const list: string[] = JSON.parse(raw);
          const oldIdLower = existingProfile?.id?.toLowerCase();
          const filtered = list.filter((s) => {
            const lower = s.toLowerCase();
            return lower !== cleanEmail && (!oldIdLower || lower !== oldIdLower);
          });
          localStorage.setItem("gamat.deleted_accounts.v1", JSON.stringify(filtered));
        }
      } catch {}
    }

    // Cache credential immediately in persistent vault
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("gamat.credentials.v1");
        const creds = raw ? JSON.parse(raw) : {};
        creds[cleanEmail] = pass;
        localStorage.setItem("gamat.credentials.v1", JSON.stringify(creds));
      } catch {}
    }

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

    let userId = authData?.user?.id || "";

    if (authError) {
      console.warn("Supabase auth signup notice:", authError.message);
      // Since we already verified above that no active profile exists in public.accounts,
      // an authError here (such as "User already registered" in auth.users from a previously
      // deleted account, or email rate limits) should not block re-creating the account profile.
      try {
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });
        if (signInData?.user?.id) {
          userId = signInData.user.id;
        }
      } catch {}
    }

    if (!userId) {
      userId = `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    }

    // Ensure userId is also cleared from deletion tombstones
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("gamat.deleted_accounts.v1");
        if (raw) {
          const list: string[] = JSON.parse(raw);
          const uidLower = userId.toLowerCase();
          const filtered = list.filter((s) => {
            const lower = s.toLowerCase();
            return lower !== cleanEmail && lower !== uidLower;
          });
          localStorage.setItem("gamat.deleted_accounts.v1", JSON.stringify(filtered));
        }
      } catch {}
    }

    const newAccount: Account = {
      ...accData,
      email: cleanEmail,
      id: userId,
      password: pass,
      joined: new Date().toISOString(),
    };

    // 2. Save user profile to Supabase `accounts` table (removing any conflicting email row first)
    await supabase.from("accounts").delete().eq("email", cleanEmail).neq("id", userId);
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

    // Check if account is in deleted tombstone list
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("gamat.deleted_accounts.v1");
        if (raw) {
          const deleted = new Set<string>(JSON.parse(raw).map((s: string) => s.toLowerCase()));
          if (deleted.has(cleanEmail)) {
            await supabase.auth.signOut().catch(() => {});
            return {
              ok: false,
              error: "This account has been deleted. Please sign up to create a new account.",
            };
          }
        }
      } catch {}
    }

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
        // Check if this specific profile is in the deleted tombstone list
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("gamat.deleted_accounts.v1");
            if (raw) {
              const deleted = new Set<string>(JSON.parse(raw).map((s: string) => s.toLowerCase()));
              if (deleted.has(cleanEmail)) {
                await supabase.auth.signOut().catch(() => {});
                return {
                  ok: false,
                  error: "This account has been deleted. Please sign up to create a new account.",
                };
              }
            }
          } catch {}
        }

        const acc = rowToAccount(rows as SupabaseAccountRow, pass);
        return { ok: true, account: acc };
      }

      // If user profile is missing from accounts table, they were deleted from the database
      await supabase.auth.signOut().catch(() => {});
      return {
        ok: false,
        error: "This account has been deleted. Please sign up to create a new account.",
      };
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
export async function fetchSupabaseAccounts(): Promise<{ ok: boolean; accounts: Account[]; error?: string }> {
  try {
    const { data, error } = await supabase.from("accounts").select("*");
    if (error) {
      console.warn("Failed to fetch accounts from Supabase:", error.message);
      return { ok: false, accounts: [], error: error.message };
    }
    const accounts = (data || []).map((row) => rowToAccount(row as SupabaseAccountRow));
    return { ok: true, accounts };
  } catch (err: any) {
    console.error("Failed to fetch accounts from Supabase:", err);
    return { ok: false, accounts: [], error: err.message || "Network error" };
  }
}

/** Saves or updates an account profile in Supabase `accounts` table. */
export async function saveSupabaseAccount(acc: Account): Promise<{ ok: boolean; error?: string }> {
  try {
    const cleanEmail = acc.email.trim().toLowerCase();
    const row = accountToRow({ ...acc, email: cleanEmail });

    // Check if an existing row for this email already exists under a different ID
    const { data: existingByEmail } = await supabase
      .from("accounts")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingByEmail && existingByEmail.id && existingByEmail.id !== acc.id) {
      const { id: _ignoreId, ...patchWithoutId } = row;
      const { data: updatedRows, error: updateErr } = await supabase
        .from("accounts")
        .update(patchWithoutId)
        .eq("id", existingByEmail.id)
        .select("id");
      if (!updateErr && updatedRows && updatedRows.length > 0) return { ok: true };
    }

    const { data: upsertedRows, error } = await supabase
      .from("accounts")
      .upsert(row, { onConflict: "id" })
      .select("id");
    if (!error && upsertedRows && upsertedRows.length > 0) {
      return { ok: true };
    }

    // Fallback: try updating directly by email
    const { id: _ignoreId, ...patchWithoutId } = row;
    const { data: emailRows, error: emailUpdateErr } = await supabase
      .from("accounts")
      .update(patchWithoutId)
      .eq("email", cleanEmail)
      .select("id");
    if (!emailUpdateErr && emailRows && emailRows.length > 0) return { ok: true };

    return {
      ok: false,
      error: error?.message || emailUpdateErr?.message || "Account row was not updated in Supabase.",
    };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to save account to Supabase" };
  }
}

/** Deletes an account profile and associated enrollments from Supabase `accounts` and `enrollments` tables. */
export async function deleteSupabaseAccount(id: string, email?: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const cleanEmail = email?.trim().toLowerCase();

    // 1. Delete associated enrollments for this user
    try {
      await supabase.from("enrollments").delete().eq("user_id", id);
    } catch (e: any) {
      console.warn("Could not delete enrollments for user in Supabase:", e);
    }

    // 2. Delete by ID from accounts table
    const { error: errId } = await supabase.from("accounts").delete().eq("id", id);
    if (errId) {
      console.warn("Supabase account delete notice by id:", errId.message);
    }

    // 3. Delete by email from accounts table if provided
    let errEmail: any = null;
    if (cleanEmail) {
      const res = await supabase.from("accounts").delete().eq("email", cleanEmail);
      errEmail = res.error;
      if (errEmail) {
        console.warn("Supabase account delete notice by email:", errEmail.message);
      }
    }

    // 4. Optional RPC to delete from auth.users if configured in Supabase SQL editor
    try {
      await supabase.rpc("delete_user_by_admin", {
        target_user_id: id,
        target_email: cleanEmail || "",
      });
    } catch {
      // Ignored if RPC is not installed in database
    }

    if (errId && errEmail) {
      return { ok: false, error: errId.message || errEmail.message };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to delete account from Supabase" };
  }
}

/** Signs in or signs up a user using direct Google OAuth on our domain (with Supabase OAuth fallback). */
export async function signInWithGoogleSupabase(): Promise<{ ok: boolean; error?: string }> {
  try {
    try {
      const startRes = await fetch("/api/auth/google-start?mode=url");
      if (startRes.ok) {
        const startData = await startRes.json().catch(() => ({}));
        if (startData?.ok && startData?.url) {
          window.location.href = startData.url;
          return { ok: true };
        }
      }
    } catch {
      // Fall back to Supabase OAuth if direct endpoint is unavailable
    }

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
    const siteOrigin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "https://gamatfxacademy.com";
    const redirectTo = `${siteOrigin}/reset-password`;
    const req = supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
    const timeout = new Promise<{ error: { message: string } }>((resolve) =>
      setTimeout(() => resolve({ error: { message: "__TIMEOUT__" } }), 10000)
    );
    const { error } = await Promise.race([req, timeout]);
    if (error) {
      if (error.message === "__TIMEOUT__") {
        return {
          ok: true,
        };
      }
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
    if (error) {
      if (error.message.toLowerCase().includes("auth session missing")) {
        return {
          ok: false,
          error: "Your password reset session has expired or is invalid. Please request a new password reset link from the login page.",
        };
      }
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to update password" };
  }
}

