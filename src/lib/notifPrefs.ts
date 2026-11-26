import { supabase } from "./supabase";

export type PushSubscriptionRecord = {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
  updatedAt?: string;
};

export type NotifPrefs = {
  browserNotifications: boolean;
  soundEnabled: boolean;
  inAppRivalry: boolean;
  inAppBirthdays: boolean;
  emailBirthdays: boolean;
  emailMentions: boolean;
  emailEvents: boolean;
  pushSubscriptions?: PushSubscriptionRecord[];
};

export const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  browserNotifications: false,
  soundEnabled: false,
  inAppRivalry: true,
  inAppBirthdays: true,
  emailBirthdays: true,
  emailMentions: true,
  emailEvents: true,
};

const keyFor = (userId: string) => `gamat.notif_prefs.${userId}`;

export function getNotifPrefs(userId?: string): NotifPrefs {
  if (!userId || typeof window === "undefined") return { ...DEFAULT_NOTIF_PREFS };
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (!raw) return { ...DEFAULT_NOTIF_PREFS };
    return { ...DEFAULT_NOTIF_PREFS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_NOTIF_PREFS };
  }
}

export function setNotifPrefs(userId: string, prefs: NotifPrefs): void {
  if (!userId || typeof window === "undefined") return;
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(prefs));
    window.dispatchEvent(new CustomEvent("gamat-notif-prefs-changed", { detail: { userId } }));
  } catch {}
  void syncNotifPrefsToSupabase(userId, prefs);
}

export async function syncNotifPrefsToSupabase(userId: string, prefs: NotifPrefs): Promise<void> {
  try {
    await supabase.auth.updateUser({ data: { notif_prefs: prefs } });
  } catch {}
  try {
    await supabase.from("accounts").update({ notif_prefs: prefs }).eq("id", userId);
  } catch {}
}

export async function hydrateNotifPrefsFromSupabase(userId?: string): Promise<NotifPrefs> {
  const local = getNotifPrefs(userId);
  if (!userId || typeof window === "undefined") return local;
  try {
    const { data } = await supabase.auth.getUser();
    const remote = data?.user?.user_metadata?.notif_prefs;
    if (remote && typeof remote === "object") {
      const merged = { ...DEFAULT_NOTIF_PREFS, ...remote, ...local };
      localStorage.setItem(keyFor(userId), JSON.stringify(merged));
      return merged;
    }
  } catch {}
  return local;
}

export function playNotificationChime(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = [
      { freq: 1046.5, start: 0, dur: 0.14 },
      { freq: 1318.5, start: 0.1, dur: 0.2 },
    ];

    notes.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0.001, now + start);
      gain.gain.exponentialRampToValueAtTime(0.06, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    });

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 600);
  } catch {}
}
