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

type CompletedRecord = {
  visitorDone?: boolean;
  userIds?: string[];
  emails?: string[];
  lastSourceId?: DiscoverySourceId;
  lastDetail?: string;
};

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

/** Marks that a user just completed registration so we can prompt them if they haven't answered yet. */
export function triggerDiscoveryForNewRegistration(userId?: string, email?: string) {
  if (typeof window === "undefined") return;
  try {
    const rec = getCompletedRecord();
    const cleanEmail = email?.trim().toLowerCase();

    // If they already answered as a visitor on this device, link their visitor response to their new account
    if (rec.visitorDone && rec.lastSourceId) {
      const responses = loadDiscoveryResponses();
      const updated = responses.map((r, idx) =>
        idx === 0 && !r.userId
          ? {
              ...r,
              userId,
              userEmail: cleanEmail,
              visitorType: "new_student" as const,
            }
          : r
      );
      localStorage.setItem(RESPONSES_KEY, JSON.stringify(updated));
      const userIds = new Set(rec.userIds || []);
      const emails = new Set(rec.emails || []);
      if (userId) userIds.add(userId);
      if (cleanEmail) emails.add(cleanEmail);
      saveCompletedRecord({
        ...rec,
        userIds: Array.from(userIds),
        emails: Array.from(emails),
      });
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
    // If they just registered, don't suppress even if they skipped earlier as an anonymous visitor
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
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
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
  const opt = DISCOVERY_OPTIONS.find((o) => o.id === input.sourceId) || DISCOVERY_OPTIONS[0];
  const cleanEmail = input.userEmail?.trim().toLowerCase();
  const isNewStudent = Boolean(input.userId || cleanEmail || consumeJustRegisteredFlag());

  const newResp: DiscoveryResponse = {
    id: `disc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    sourceId: input.sourceId,
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
        lastSourceId: input.sourceId,
        lastDetail: input.detail?.trim() || undefined,
      });

      sessionStorage.removeItem(JUST_REGISTERED_KEY);
      sessionStorage.setItem(SESSION_DISMISSED_KEY, "1");
      window.dispatchEvent(new CustomEvent("gamat:discovery-updated"));
    } catch {}
  }

  return newResp;
}
