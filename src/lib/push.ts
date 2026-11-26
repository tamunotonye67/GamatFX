import { getNotifPrefs, setNotifPrefs, type PushSubscriptionRecord } from "./notifPrefs";
import { supabase } from "./supabase";

const PUSH_SUB_SLUG = "sys_push_sub";

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

async function persistPushSubscriptionsToSupabase(
  userId: string,
  email: string | undefined,
  subs: PushSubscriptionRecord[]
): Promise<void> {
  let cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail) {
    try {
      const { data } = await supabase.auth.getUser();
      cleanEmail = String(data?.user?.email || "").trim().toLowerCase();
    } catch {}
  }

  const rowId = `push_${userId}`;
  const payload = {
    id: rowId,
    ref: rowId,
    service_slug: PUSH_SUB_SLUG,
    service_title: "Web Push Subscription",
    package_name: "pwa",
    name: "Push Subscriber",
    email: cleanEmail || `${userId}@push.local`,
    phone: "/dashboard",
    company: null,
    budget: String(subs.length),
    message: JSON.stringify(subs),
    user_id: userId,
    status: subs.length > 0 ? "active" : "inactive",
    created_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase
      .from("service_enquiries")
      .upsert(payload, { onConflict: "id" });
    if (error && error.code !== "23505") {
      await supabase.from("service_enquiries").insert(payload);
    }
  } catch {}
}

/** Subscribes this device to Web Push and stores the subscription in Supabase. */
export async function subscribeToPush(
  userId: string,
  userEmail?: string
): Promise<{ ok: boolean; reason?: string }> {
  if (!isPushSupported()) return { ok: false, reason: "unsupported" };

  let perm = Notification.permission;
  if (perm !== "granted") {
    perm = await Notification.requestPermission();
  }
  if (perm !== "granted") return { ok: false, reason: perm };

  const publicKey = await fetchVapidPublicKey();
  if (!publicKey) {
    return { ok: false, reason: "missing_vapid_key" };
  }

  try {
    let reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      reg = await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });
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
    const nextSubs = [record, ...filtered].slice(0, 5);

    setNotifPrefs(userId, {
      ...current,
      browserNotifications: true,
      pushSubscriptions: nextSubs,
    });
    await persistPushSubscriptionsToSupabase(userId, userEmail, nextSubs);

    return { ok: true };
  } catch {
    return { ok: false, reason: "subscribe_failed" };
  }
}

/** Unsubscribes this device from Web Push and removes its endpoint from Supabase. */
export async function unsubscribeFromPush(userId: string, userEmail?: string): Promise<void> {
  if (!isPushSupported()) return;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      const endpoint = sub.endpoint;
      await sub.unsubscribe().catch(() => undefined);
      const current = getNotifPrefs(userId);
      const existing = Array.isArray(current.pushSubscriptions) ? current.pushSubscriptions : [];
      const nextSubs = existing.filter((s) => s.endpoint !== endpoint);
      setNotifPrefs(userId, {
        ...current,
        browserNotifications: false,
        pushSubscriptions: nextSubs,
      });
      await persistPushSubscriptionsToSupabase(userId, userEmail, nextSubs);
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
