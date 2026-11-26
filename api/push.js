import webpush from "web-push";

const DEFAULT_SUPABASE_URL = "https://pbbtiazbpolvajjsqirs.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_FnEN-7WZtC0_qvoNApQNSw__c9KqANV";

function getSupabaseConfig() {
  const url =
    (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim() ||
    DEFAULT_SUPABASE_URL;
  const key =
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "").trim() ||
    DEFAULT_SUPABASE_KEY;
  return { url, key };
}

function getVapidConfig() {
  const publicKey = (process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY || "").trim();
  const privateKey = (process.env.VAPID_PRIVATE_KEY || "").trim();
  const subject = (process.env.VAPID_SUBJECT || "mailto:hello@gamatfxacademy.com").trim();
  return { publicKey, privateKey, subject };
}

export default async function handler(req, res) {
  const { publicKey, privateKey, subject } = getVapidConfig();

  if (req.method === "GET") {
    return res.status(200).json({
      ok: Boolean(publicKey),
      publicKey: publicKey || null,
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!publicKey || !privateKey) {
    return res.status(200).json({
      ok: false,
      skipped: true,
      sent: 0,
      message: "VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not configured",
    });
  }

  let bodyData = req.body || {};
  if (typeof bodyData === "string") {
    try {
      bodyData = JSON.parse(bodyData);
    } catch {
      bodyData = {};
    }
  }

  const title = String(bodyData.title || "GAMAT Fx Academy").trim();
  const body = String(bodyData.body || "").trim();
  const url = String(bodyData.url || "/#/dashboard").trim();
  const tag = String(bodyData.tag || "gamatfx-update").trim();
  const targetEmails = Array.isArray(bodyData.emails)
    ? new Set(bodyData.emails.map((e) => String(e || "").trim().toLowerCase()).filter(Boolean))
    : null;
  const targetUserIds = Array.isArray(bodyData.userIds)
    ? new Set(bodyData.userIds.map((id) => String(id || "").trim()).filter(Boolean))
    : null;

  if (!body) {
    return res.status(400).json({ ok: false, error: "Notification body is required" });
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig();

  try {
    const accRes = await fetch(
      `${supabaseUrl}/rest/v1/accounts?select=id,email,status,notif_prefs`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!accRes.ok) {
      return res.status(200).json({ ok: false, sent: 0, message: "Could not query accounts" });
    }

    const accounts = await accRes.json();
    const payload = JSON.stringify({
      title,
      body,
      url,
      tag,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
    });

    let sent = 0;
    let failed = 0;

    for (const acc of accounts || []) {
      if (acc.status && acc.status !== "active") continue;
      if (targetEmails && !targetEmails.has(String(acc.email || "").trim().toLowerCase())) continue;
      if (targetUserIds && !targetUserIds.has(String(acc.id || "").trim())) continue;

      const prefs = acc.notif_prefs && typeof acc.notif_prefs === "object" ? acc.notif_prefs : null;
      if (!prefs || prefs.browserNotifications === false) continue;

      const subs = Array.isArray(prefs.pushSubscriptions) ? prefs.pushSubscriptions : [];
      if (!subs.length) continue;

      const deadEndpoints = new Set();

      await Promise.all(
        subs.map(async (sub) => {
          if (!sub || !sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) return;
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                expirationTime: sub.expirationTime ?? null,
                keys: {
                  p256dh: sub.keys.p256dh,
                  auth: sub.keys.auth,
                },
              },
              payload
            );
            sent += 1;
          } catch (err) {
            failed += 1;
            const code = err?.statusCode;
            if (code === 404 || code === 410) {
              deadEndpoints.add(sub.endpoint);
            }
          }
        })
      );

      // Prune expired/uninstalled subscriptions
      if (deadEndpoints.size > 0) {
        const cleaned = subs.filter((s) => s && !deadEndpoints.has(s.endpoint));
        const nextPrefs = { ...prefs, pushSubscriptions: cleaned };
        await fetch(`${supabaseUrl}/rest/v1/accounts?id=eq.${encodeURIComponent(acc.id)}`, {
          method: "PATCH",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ notif_prefs: nextPrefs }),
        }).catch(() => undefined);
      }
    }

    return res.status(200).json({ ok: true, sent, failed });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : "Failed to send push notifications",
    });
  }
}
