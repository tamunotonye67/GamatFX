import { supabase } from "./supabase";

export type DiscoverySourceId =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "twitter"
  | "whatsapp"
  | "telegram"
  | "facebook"
  | "linkedin"
  | "friend_referral"
  | "google_search"
  | "live_event"
  | "other";

export type DiscoveryResponse = {
  id: string;
  sourceId: DiscoverySourceId;
  sourceLabel: string;
  detail?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  visitorType: "visitor" | "new_student";
  route: string;
  createdAt: string;
};

export const DISCOVERY_OPTIONS: {
  id: DiscoverySourceId;
  label: string;
  sub: string;
  color: string;
  promptPlaceholder?: string;
}[] = [
  {
    id: "instagram",
    label: "Instagram",
    sub: "Reels, stories & @gamatfx posts",
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "youtube",
    label: "YouTube",
    sub: "Market breakdowns & tutorials",
    color: "from-red-600 to-rose-600",
  },
  {
    id: "tiktok",
    label: "TikTok",
    sub: "Short clips & live trading setups",
    color: "from-slate-900 to-slate-700",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    sub: "Broadcast, group or status update",
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "telegram",
    label: "Telegram",
    sub: "Trading channel or community group",
    color: "from-sky-500 to-blue-600",
  },
  {
    id: "twitter",
    label: "X (Twitter)",
    sub: "Spaces, threads & market updates",
    color: "from-neutral-800 to-neutral-950",
  },
  {
    id: "facebook",
    label: "Facebook",
    sub: "Social feed, group or page post",
    color: "from-blue-600 to-blue-700",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    sub: "Professional network or article",
    color: "from-sky-600 to-blue-800",
  },
  {
    id: "friend_referral",
    label: "Friend / Ambassador",
    sub: "Recommended by a student or trader",
    color: "from-emerald-500 to-teal-600",
    promptPlaceholder: "Who told you about us? (Name or referral code - optional)",
  },
  {
    id: "google_search",
    label: "Google Search",
    sub: "Searched for forex academy or mentor",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "live_event",
    label: "Live Event / Webinar",
    sub: "Bootcamp, seminar or trading workshop",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "other",
    label: "Other Source",
    sub: "Podcast, blog, billboard or elsewhere",
    color: "from-purple-500 to-violet-600",
    promptPlaceholder: "Tell us where you heard about GAMAT Fx Academy...",
  },
];

const RESPONSES_KEY = "gamat.discovery_responses.v1";
const COMPLETED_KEY = "gamat.discovery_completed.v1";
const SESSION_DISMISSED_KEY = "gamat.discovery_dismissed_session.v1";
const JUST_REGISTERED_KEY = "gamat.discovery_just_registered.v1";
const SUPABASE_DISCOVERY_SLUG = "sys_discovery_survey";

type CompletedRecord = {
  visitorDone?: boolean;
  userIds?: string[];
  emails?: string[];
  lastSourceId?: string;
  lastDetail?: string;
};

export function normalizeDiscoverySourceId(rawId?: string, rawLabel?: string): DiscoverySourceId {
  const id = (rawId || "").trim().toLowerCase();
  if (id === "whatsapp_telegram") return "whatsapp";
  if (id === "facebook_linkedin") return "facebook";

  const exact = DISCOVERY_OPTIONS.find((o) => o.id === id);
  if (exact) return exact.id;

  const lbl = (rawLabel || "").trim().toLowerCase();
  if (lbl.includes("instagram")) return "instagram";
  if (lbl.includes("youtube")) return "youtube";
  if (lbl.includes("tiktok")) return "tiktok";
  if (lbl.includes("telegram")) return "telegram";
  if (lbl.includes("whatsapp")) return "whatsapp";
  if (lbl.includes("twitter") || lbl.startsWith("x ")) return "twitter";
  if (lbl.includes("linkedin")) return "linkedin";
  if (lbl.includes("facebook")) return "facebook";
  if (lbl.includes("friend") || lbl.includes("ambassador") || lbl.includes("referral")) return "friend_referral";
  if (lbl.includes("google")) return "google_search";
  if (lbl.includes("event") || lbl.includes("webinar")) return "live_event";

  return "other";
}

function normalizeResponseItem(raw: any): DiscoveryResponse {
  const sourceId = normalizeDiscoverySourceId(raw?.sourceId, raw?.sourceLabel);
  const opt = DISCOVERY_OPTIONS.find((o) => o.id === sourceId) || DISCOVERY_OPTIONS[0];
  return {
    id: String(raw?.id || `disc_${Date.now().toString(36)}`),
    sourceId,
    sourceLabel: opt.label,
    detail: raw?.detail ? String(raw.detail).trim() : undefined,
    userId: raw?.userId ? String(raw.userId) : undefined,
    userName: raw?.userName ? String(raw.userName) : undefined,
    userEmail: raw?.userEmail ? String(raw.userEmail).trim().toLowerCase() : undefined,
    visitorType: raw?.visitorType === "new_student" ? "new_student" : "visitor",
    route: raw?.route ? String(raw.route) : "/",
    createdAt: raw?.createdAt || new Date().toISOString(),
  };
}

function getCompletedRecord(): CompletedRecord {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCompletedRecord(rec: CompletedRecord) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(rec));
  } catch {}
}

/** Inserts (or updates when linking a user) a discovery response in Supabase so it reflects across all devices and admin sessions. */
export async function saveSupabaseDiscoveryResponse(resp: DiscoveryResponse, isUpdate = false): Promise<void> {
  const payload = {
    id: resp.id,
    ref: resp.sourceId,
    service_slug: SUPABASE_DISCOVERY_SLUG,
    service_title: resp.sourceLabel,
    package_name: resp.visitorType,
    name: resp.userName || (resp.visitorType === "new_student" ? "New Student" : "Website Visitor"),
    email: resp.userEmail || "visitor@gamatfx.com",
    phone: resp.route || "/",
    company: resp.userId ?? null,
    budget: resp.detail ?? null,
    message: resp.detail || resp.sourceLabel,
    user_id: null,
    status: "closed",
    created_at: resp.createdAt,
  };
  try {
    const { error } = isUpdate
      ? await supabase.from("service_enquiries").upsert(payload, { onConflict: "id" })
      : await supabase.from("service_enquiries").insert(payload);
    if (error && error.code !== "23505") {
      console.error("Supabase discovery response save error:", error);
    }
  } catch (err) {
    console.warn("Supabase discovery response save notice:", err);
  }
}

/** Fetches all discovery survey responses from Supabase and merges them with local responses. */
export async function fetchSupabaseDiscoveryResponses(): Promise<DiscoveryResponse[]> {
  const local = loadDiscoveryResponses();
  try {
    const { data, error } = await supabase
      .from("service_enquiries")
      .select("*")
      .eq("service_slug", SUPABASE_DISCOVERY_SLUG)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return local;
    }

    const remoteIds = new Set<string>();
    const remoteItems: DiscoveryResponse[] = data.map((r: any) => {
      remoteIds.add(String(r.id));
      const sourceId = normalizeDiscoverySourceId(r.ref, r.service_title);
      const opt = DISCOVERY_OPTIONS.find((o) => o.id === sourceId) || DISCOVERY_OPTIONS[0];
      const detailText = r.budget || (r.message && r.message !== r.service_title && r.message !== opt.label ? r.message : undefined);
      const cleanEmail = r.email && r.email !== "visitor@gamatfx.com" ? String(r.email).trim().toLowerCase() : undefined;
      const cleanName = r.name && r.name !== "Website Visitor" && r.name !== "New Student" ? String(r.name) : undefined;
      return {
        id: String(r.id),
        sourceId,
        sourceLabel: opt.label,
        detail: detailText || undefined,
        userId: r.company || r.user_id || undefined,
        userName: cleanName,
        userEmail: cleanEmail,
        visitorType: r.package_name === "new_student" ? "new_student" : "visitor",
        route: r.phone || "/",
        createdAt: r.created_at || new Date().toISOString(),
      };
    });

    // Push any local responses that haven't been synced to Supabase yet
    for (const loc of local) {
      if (!remoteIds.has(loc.id)) {
        saveSupabaseDiscoveryResponse(loc);
      }
    }

    const map = new Map<string, DiscoveryResponse>();
    remoteItems.forEach((item) => map.set(item.id, item));
    local.forEach((item) => {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    });

    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(RESPONSES_KEY, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent("gamat:discovery-updated"));
      } catch {}
    }

    return merged;
  } catch {
    return local;
  }
}

/** Marks that a user just completed registration so we can prompt them if they haven't answered yet. */
export function triggerDiscoveryForNewRegistration(userId?: string, email?: string) {
  if (typeof window === "undefined") return;
  try {
    const rec = getCompletedRecord();
    const cleanEmail = email?.trim().toLowerCase();

    // If they already answered as a visitor on this device, link their visitor response to their new account
    if (rec.visitorDone && rec.lastSourceId) {
      const responses = loadDiscoveryResponses();
      let linkedItem: DiscoveryResponse | null = null;
      const updated = responses.map((r, idx) => {
        if (idx === 0 && !r.userId) {
          linkedItem = {
            ...r,
            userId,
            userEmail: cleanEmail,
            visitorType: "new_student" as const,
          };
          return linkedItem;
        }
        return r;
      });
      localStorage.setItem(RESPONSES_KEY, JSON.stringify(updated));
      if (linkedItem) {
        saveSupabaseDiscoveryResponse(linkedItem, true);
      }
      const userIds = new Set(rec.userIds || []);
      const emails = new Set(rec.emails || []);
      if (userId) userIds.add(userId);
      if (cleanEmail) emails.add(cleanEmail);
      saveCompletedRecord({
        ...rec,
        userIds: Array.from(userIds),
        emails: Array.from(emails),
      });
      window.dispatchEvent(new CustomEvent("gamat:discovery-updated"));
      return;
    }

    sessionStorage.setItem(
      JUST_REGISTERED_KEY,
      JSON.stringify({ userId: userId || "", email: cleanEmail || "", ts: Date.now() })
    );
    sessionStorage.removeItem(SESSION_DISMISSED_KEY);
    window.dispatchEvent(new CustomEvent("gamat:discovery-trigger"));
  } catch {}
}

/** Checks whether the current visitor or authenticated user has already completed the survey. */
export function hasCompletedDiscoverySurvey(userId?: string | null, email?: string | null): boolean {
  if (typeof window === "undefined") return true;
  const rec = getCompletedRecord();
  const cleanEmail = email?.trim().toLowerCase();

  if (userId && rec.userIds?.includes(userId)) return true;
  if (cleanEmail && rec.emails?.includes(cleanEmail)) return true;
  if (rec.visitorDone) return true;

  return false;
}

/** Checks whether the popup was dismissed during the current browser session. */
export function isDiscoveryDismissedForSession(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const justReg = sessionStorage.getItem(JUST_REGISTERED_KEY);
    if (justReg) return false;
    return sessionStorage.getItem(SESSION_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissDiscoveryForSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_DISMISSED_KEY, "1");
    sessionStorage.removeItem(JUST_REGISTERED_KEY);
  } catch {}
}

export function consumeJustRegisteredFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(sessionStorage.getItem(JUST_REGISTERED_KEY));
  } catch {
    return false;
  }
}

export function loadDiscoveryResponses(): DiscoveryResponse[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RESPONSES_KEY);
    let list: DiscoveryResponse[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        list = parsed.map(normalizeResponseItem);
      }
    }

    // Recover from CompletedRecord if visitorDone was recorded but RESPONSES_KEY was cleared or empty
    if (list.length === 0) {
      const rec = getCompletedRecord();
      if (rec.visitorDone && rec.lastSourceId) {
        const sourceId = normalizeDiscoverySourceId(rec.lastSourceId);
        const opt = DISCOVERY_OPTIONS.find((o) => o.id === sourceId) || DISCOVERY_OPTIONS[0];
        const recovered: DiscoveryResponse = {
          id: `disc_rec_${(rec.emails?.[0] || "visitor").replace(/[^a-z0-9]/gi, "")}`,
          sourceId,
          sourceLabel: opt.label,
          detail: rec.lastDetail || undefined,
          userId: rec.userIds?.[0] || undefined,
          userEmail: rec.emails?.[0] || undefined,
          visitorType: rec.userIds?.length || rec.emails?.length ? "new_student" : "visitor",
          route: "/",
          createdAt: new Date().toISOString(),
        };
        list = [recovered];
        localStorage.setItem(RESPONSES_KEY, JSON.stringify(list));
      }
    }

    return list;
  } catch {
    return [];
  }
}

export function saveDiscoveryResponse(input: {
  sourceId: DiscoverySourceId;
  detail?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  route?: string;
}): DiscoveryResponse {
  const sourceId = normalizeDiscoverySourceId(input.sourceId);
  const opt = DISCOVERY_OPTIONS.find((o) => o.id === sourceId) || DISCOVERY_OPTIONS[0];
  const cleanEmail = input.userEmail?.trim().toLowerCase();
  const isNewStudent = Boolean(input.userId || cleanEmail || consumeJustRegisteredFlag());

  const newResp: DiscoveryResponse = {
    id: `disc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    sourceId,
    sourceLabel: opt.label,
    detail: input.detail?.trim() || undefined,
    userId: input.userId || undefined,
    userName: input.userName || undefined,
    userEmail: cleanEmail || undefined,
    visitorType: isNewStudent ? "new_student" : "visitor",
    route: input.route || "/",
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const existing = loadDiscoveryResponses();
      const updated = [newResp, ...existing];
      localStorage.setItem(RESPONSES_KEY, JSON.stringify(updated));

      const rec = getCompletedRecord();
      const userIds = new Set(rec.userIds || []);
      const emails = new Set(rec.emails || []);
      if (input.userId) userIds.add(input.userId);
      if (cleanEmail) emails.add(cleanEmail);

      saveCompletedRecord({
        visitorDone: true,
        userIds: Array.from(userIds),
        emails: Array.from(emails),
        lastSourceId: sourceId,
        lastDetail: input.detail?.trim() || undefined,
      });

      sessionStorage.removeItem(JUST_REGISTERED_KEY);
      sessionStorage.setItem(SESSION_DISMISSED_KEY, "1");
      window.dispatchEvent(new CustomEvent("gamat:discovery-updated"));
    } catch {}
  }

  saveSupabaseDiscoveryResponse(newResp);

  return newResp;
}
