import { supabase } from "./supabase";
import type { CombatStats } from "./combat";
import type {
  AffiliateCommission,
  AffiliateProfile,
  AffiliateSettings,
  PayoutRequest,
} from "./affiliate";

export const COMBAT_SERVICE_SLUG = "__gamat_user_combat__";
export const AFFILIATE_SERVICE_SLUG = "__gamat_affiliate_state__";

export async function saveCombatToSupabase(
  userId: string | null | undefined,
  stats: CombatStats
): Promise<void> {
  if (!userId) return;
  try {
    const rowId = `combat_${userId}`;
    const payload = {
      id: rowId,
      ref: `CMBT-${userId.slice(0, 8)}`,
      service_slug: COMBAT_SERVICE_SLUG,
      service_title: "Market Combat Stats",
      name: "Combat Sync",
      email: "combat@gamatfxacademy.com",
      phone: "-",
      message: JSON.stringify(stats),
      user_id: userId,
      status: "resolved",
    };
    const { error } = await supabase
      .from("service_enquiries")
      .upsert(payload, { onConflict: "id" });
    if (error) {
      await supabase
        .from("service_enquiries")
        .update({ message: payload.message })
        .eq("id", rowId);
    }
  } catch {
    // Non-fatal: localStorage copy remains intact
  }
}

export async function fetchAllCombatFromSupabase(): Promise<
  Record<string, CombatStats> | null
> {
  try {
    const { data, error } = await supabase
      .from("service_enquiries")
      .select("user_id, message")
      .eq("service_slug", COMBAT_SERVICE_SLUG);

    if (error || !data) return null;
    const out: Record<string, CombatStats> = {};
    for (const row of data) {
      if (!row.user_id || !row.message) continue;
      try {
        const parsed = JSON.parse(row.message) as CombatStats;
        if (parsed && typeof parsed === "object") {
          out[row.user_id] = parsed;
        }
      } catch {}
    }
    return out;
  } catch {
    return null;
  }
}

export type AffiliateCloudLedger = {
  commissions: AffiliateCommission[];
  payouts: PayoutRequest[];
  settings?: AffiliateSettings;
};

export async function saveAffiliateProfileToSupabase(
  profile: AffiliateProfile
): Promise<void> {
  if (!profile?.userId) return;
  try {
    const rowId = `aff_prof_${profile.userId}`;
    const payload = {
      id: rowId,
      ref: `AFFP-${profile.userId.slice(0, 8)}`,
      service_slug: AFFILIATE_SERVICE_SLUG,
      service_title: "Affiliate Profile",
      name: profile.userName || "Affiliate",
      email: profile.userEmail || "affiliate@gamatfxacademy.com",
      phone: "-",
      message: JSON.stringify({ kind: "profile", data: profile }),
      user_id: profile.userId,
      status: "resolved",
    };
    const { error } = await supabase
      .from("service_enquiries")
      .upsert(payload, { onConflict: "id" });
    if (error) {
      await supabase
        .from("service_enquiries")
        .update({ message: payload.message })
        .eq("id", rowId);
    }
  } catch {}
}

export async function saveAffiliateLedgerToSupabase(
  ledger: AffiliateCloudLedger
): Promise<void> {
  try {
    const rowId = "aff_ledger_global";
    const payload = {
      id: rowId,
      ref: "AFF-LEDGER",
      service_slug: AFFILIATE_SERVICE_SLUG,
      service_title: "Affiliate Ledger",
      name: "Affiliate Ledger",
      email: "affiliate@gamatfxacademy.com",
      phone: "-",
      message: JSON.stringify({ kind: "ledger", data: ledger }),
      status: "resolved",
    };
    const { error } = await supabase
      .from("service_enquiries")
      .upsert(payload, { onConflict: "id" });
    if (error) {
      await supabase
        .from("service_enquiries")
        .update({ message: payload.message })
        .eq("id", rowId);
    }
  } catch {}
}

export async function fetchAffiliateStateFromSupabase(): Promise<{
  profiles: AffiliateProfile[];
  commissions: AffiliateCommission[];
  payouts: PayoutRequest[];
  settings?: AffiliateSettings;
} | null> {
  try {
    const { data, error } = await supabase
      .from("service_enquiries")
      .select("message")
      .eq("service_slug", AFFILIATE_SERVICE_SLUG);

    if (error || !data) return null;

    const profiles: AffiliateProfile[] = [];
    let commissions: AffiliateCommission[] = [];
    let payouts: PayoutRequest[] = [];
    let settings: AffiliateSettings | undefined;

    for (const row of data) {
      if (!row.message) continue;
      try {
        const parsed = JSON.parse(row.message) as {
          kind?: "profile" | "ledger";
          data?: any;
        };
        if (parsed.kind === "profile" && parsed.data?.userId) {
          profiles.push(parsed.data as AffiliateProfile);
        } else if (parsed.kind === "ledger" && parsed.data) {
          if (Array.isArray(parsed.data.commissions)) {
            commissions = parsed.data.commissions;
          }
          if (Array.isArray(parsed.data.payouts)) {
            payouts = parsed.data.payouts;
          }
          if (parsed.data.settings) {
            settings = parsed.data.settings;
          }
        }
      } catch {}
    }

    return { profiles, commissions, payouts, settings };
  } catch {
    return null;
  }
}
