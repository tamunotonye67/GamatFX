export type StreakActivityKind = "game" | "learning" | "forum";

export type DailyStreakState = {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string | null; // YYYY-MM-DD (local)
  totalActiveDays: number;
  gamesPlayed: number;
  lessonsCompleted: number;
  forumMessages: number;
  lastCelebratedTier: number;
};

export type StreakTier = {
  min: number;
  name: string;
  flameFrom: string;
  flameTo: string;
  cardBg: string;
  accent: string;
  badgeText: string;
};

export const STREAK_TIERS: StreakTier[] = [
  {
    min: 1,
    name: "Spark",
    flameFrom: "#fb923c",
    flameTo: "#dc3545",
    cardBg: "#ffe4e6",
    accent: "#dc3545",
    badgeText: "#9f1239",
  },
  {
    min: 3,
    name: "Ignite",
    flameFrom: "#f43f5e",
    flameTo: "#be123c",
    cardBg: "#fce7f3",
    accent: "#e11d48",
    badgeText: "#9d174d",
  },
  {
    min: 7,
    name: "Blaze",
    flameFrom: "#ec4899",
    flameTo: "#9333ea",
    cardBg: "#fae8ff",
    accent: "#c026d3",
    badgeText: "#86198f",
  },
  {
    min: 14,
    name: "Inferno",
    flameFrom: "#c084fc",
    flameTo: "#7e22ce",
    cardBg: "#f3e8ff",
    accent: "#9333ea",
    badgeText: "#6b21a8",
  },
  {
    min: 30,
    name: "Nova",
    flameFrom: "#e879f9",
    flameTo: "#6d28d9",
    cardBg: "#ede9fe",
    accent: "#7c3aed",
    badgeText: "#5b21b6",
  },
  {
    min: 60,
    name: "Supernova",
    flameFrom: "#f472b6",
    flameTo: "#7c3aed",
    cardBg: "#f5d0fe",
    accent: "#a21caf",
    badgeText: "#701a75",
  },
  {
    min: 100,
    name: "Legend",
    flameFrom: "#d946ef",
    flameTo: "#6b21a8",
    cardBg: "#f3d5ff",
    accent: "#a855f7",
    badgeText: "#581c87",
  },
];

const STORAGE_PREFIX = "gamat.daily_streak.v1.";

function localDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function yesterdayDateKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDateKey(d);
}

const DEFAULT_STATE: DailyStreakState = {
  currentStreak: 0,
  bestStreak: 0,
  lastActiveDate: null,
  totalActiveDays: 0,
  gamesPlayed: 0,
  lessonsCompleted: 0,
  forumMessages: 0,
  lastCelebratedTier: 0,
};

export function loadStreakState(userId?: string | null): DailyStreakState {
  if (!userId) return { ...DEFAULT_STATE };
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<DailyStreakState>;
    const state: DailyStreakState = { ...DEFAULT_STATE, ...parsed };
    // Reset currentStreak display if user missed yesterday AND hasn't played today
    const today = localDateKey();
    const yesterday = yesterdayDateKey();
    if (
      state.lastActiveDate &&
      state.lastActiveDate !== today &&
      state.lastActiveDate !== yesterday
    ) {
      return { ...state, currentStreak: 0 };
    }
    return state;
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveStreakState(userId: string, state: DailyStreakState) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(state));
  } catch {}
}

export function getStreakTier(days: number): StreakTier {
  let matched = STREAK_TIERS[0];
  for (const tier of STREAK_TIERS) {
    if (days >= tier.min) matched = tier;
  }
  return matched;
}

export function recordStreakActivity(
  userId: string | null | undefined,
  kind: StreakActivityKind
): { state: DailyStreakState; upgradedTier: StreakTier | null } {
  if (!userId) return { state: { ...DEFAULT_STATE }, upgradedTier: null };

  const prev = loadStreakState(userId);
  const today = localDateKey();
  const yesterday = yesterdayDateKey();

  let currentStreak = prev.currentStreak;
  let totalActiveDays = prev.totalActiveDays;

  if (prev.lastActiveDate === today) {
    // Already active today — keep streak count
    currentStreak = Math.max(1, currentStreak);
  } else if (prev.lastActiveDate === yesterday) {
    currentStreak = prev.currentStreak + 1;
    totalActiveDays += 1;
  } else {
    currentStreak = 1;
    totalActiveDays += 1;
  }

  const bestStreak = Math.max(prev.bestStreak, currentStreak);
  const gamesPlayed = prev.gamesPlayed + (kind === "game" ? 1 : 0);
  const lessonsCompleted = prev.lessonsCompleted + (kind === "learning" ? 1 : 0);
  const forumMessages = prev.forumMessages + (kind === "forum" ? 1 : 0);

  const tier = getStreakTier(currentStreak);
  const upgraded = currentStreak > 0 && tier.min > prev.lastCelebratedTier;

  const next: DailyStreakState = {
    currentStreak,
    bestStreak,
    lastActiveDate: today,
    totalActiveDays,
    gamesPlayed,
    lessonsCompleted,
    forumMessages,
    lastCelebratedTier: upgraded ? tier.min : prev.lastCelebratedTier,
  };

  saveStreakState(userId, next);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("gamat:streak-updated", {
        detail: {
          userId,
          state: next,
          upgradedTier: upgraded ? tier : null,
        },
      })
    );
  }

  return { state: next, upgradedTier: upgraded ? tier : null };
}

export function openStreakModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("gamat:open-streak-modal"));
  }
}
