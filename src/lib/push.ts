import { getNotifPrefs, setNotifPrefs, type PushSubscriptionRecord } from "./notifPrefs";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

async function fetchVapidPublicKey(): Promise<string | null> {
  const envKey = (import.meta as ImportMeta & { env?: { VITE_VAPID_PUBLIC_KEY?: string } }).env
    ?.VITE_VAPID_PUBLIC_KEY;
  if (envKey) return envKey;
  try {
    const res = await fetch("/api/push?action=vapid-key");
    if (!res.ok) return null;
    const data = await res.json();
    return data?.publicKey || null;
  } catch {
    return null;
  }
}

/** Subscribes this device to Web Push and stores the subscription in the user's notif_prefs. */
export async function subscribeToPush(userId: string): Promise<{ ok: boolean; reason?: string }> {
  if (!isPushSupported()) return { ok: false, reason: "unsupported" };

  let perm = Notification.permission;
  if (perm !== "granted") {
    perm = await Notification.requestPermission();
  }
  if (perm !== "granted") return { ok: false, reason: perm };

  const publicKey = await fetchVapidPublicKey();
  if (!publicKey) {
    // Still keep browserNotifications enabled locally even if server VAPID keys aren't configured yet
    return { ok: false, reason: "missing_vapid_key" };
  }

  try {
    let reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      reg = await navigator.serviceWorker.register("/sw.js");
    }
    await navigator.serviceWorker.ready;

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
    }

    const json = sub.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
      return { ok: false, reason: "invalid_subscription" };
    }

    const record: PushSubscriptionRecord = {
      endpoint: json.endpoint,
      expirationTime: json.expirationTime ?? null,
      keys: {
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      },
      updatedAt: new Date().toISOString(),
    };

    const current = getNotifPrefs(userId);
    const existing = Array.isArray(current.pushSubscriptions) ? current.pushSubscriptions : [];
    const filtered = existing.filter((s) => s.endpoint !== record.endpoint);
    // Keep up to 5 most recent devices per account
    const nextSubs = [record, ...filtered].slice(0, 5);
    setNotifPrefs(userId, {
      ...current,
      browserNotifications: true,
      pushSubscriptions: nextSubs,
    });

    return { ok: true };
  } catch {
    return { ok: false, reason: "subscribe_failed" };
  }
}

/** Unsubscribes this device from Web Push and removes its endpoint from notif_prefs. */
export async function unsubscribeFromPush(userId: string): Promise<void> {
  if (!isPushSupported()) return;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      const endpoint = sub.endpoint;
      await sub.unsubscribe().catch(() => undefined);
      const current = getNotifPrefs(userId);
      const existing = Array.isArray(current.pushSubscriptions) ? current.pushSubscriptions : [];
      setNotifPrefs(userId, {
        ...current,
        browserNotifications: false,
        pushSubscriptions: existing.filter((s) => s.endpoint !== endpoint),
      });
    }
  } catch {}
}

/** Sends a Web Push notification via /api/push (best-effort, non-blocking). */
export async function sendWebPush(params: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  emails?: string[];
  userIds?: string[];
}): Promise<{ ok: boolean; sent?: number; skipped?: boolean }> {
  try {
    const res = await fetch("/api/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) return { ok: false };
    return await res.json();
  } catch {
    return { ok: false };
  }
}
