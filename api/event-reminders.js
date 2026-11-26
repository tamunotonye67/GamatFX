/**
 * Vercel Cron Function: 24-Hour Event Reminder Emails
 * Runs daily via vercel.json cron (`0 8 * * *`) and emails confirmed attendees
 * whose event starts tomorrow.
 *
 * Also handles `/api/push` (via `vercel.json` rewrite `?__push=1`) to stay
 * within the 12-function Vercel Hobby limit.
 */

import * as webpushMod from "web-push";

const webpush = webpushMod.default || webpushMod;

const MONTHS = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseEventDateUtc(ev) {
  const year = parseInt(ev.year, 10);
  const month = MONTHS[String(ev.month || "").trim().toLowerCase()];
  const day = parseInt(ev.day, 10);
  if (!year || month === undefined || !day) return null;
  return new Date(Date.UTC(year, month, day));
}

function getVapidConfig() {
  let publicKey = (process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY || "").trim();
  let privateKey = (process.env.VAPID_PRIVATE_KEY || "").trim();
  const combined = (process.env.VAPID_KEYS || "").trim();

  if (combined && (!publicKey || !privateKey)) {
    if (combined.startsWith("{")) {
      try {
        const parsed = JSON.parse(combined);
        publicKey = publicKey || String(parsed.publicKey || "").trim();
        privateKey = privateKey || String(parsed.privateKey || "").trim();
      } catch {}
    } else if (combined.includes(":")) {
      const [pub, priv] = combined.split(":");
      publicKey = publicKey || String(pub || "").trim();
      privateKey = privateKey || String(priv || "").trim();
    }
  }

  const subject = (process.env.VAPID_SUBJECT || "mailto:hello@gamatfxacademy.com").trim();
  return { publicKey, privateKey, subject };
}

async function handlePush(req, res) {
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
      message: "VAPID_KEYS not configured",
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

  const supabaseUrl =
    (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim() ||
    "https://pbbtiazbpolvajjsqirs.supabase.co";
  const supabaseKey =
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "").trim() ||
    "sb_publishable_FnEN-7WZtC0_qvoNApQNSw__c9KqANV";

  try {
    const accRes = await fetch(
      `${supabaseUrl}/rest/v1/accounts?select=id,email,status,notif_prefs`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
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
                keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
              },
              payload
            );
            sent += 1;
          } catch (err) {
            failed += 1;
            const code = err?.statusCode;
            if (code === 404 || code === 410) deadEndpoints.add(sub.endpoint);
          }
        })
      );

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

export default async function handler(req, res) {
  if (req.query?.__push === "1" || String(req.url || "").includes("__push=1")) {
    return handlePush(req, res);
  }

  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  if (!apiKey) {
    return res.status(200).json({ ok: false, skipped: true, message: "RESEND_API_KEY not set" });
  }

  const supabaseUrl =
    (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim() ||
    "https://pbbtiazbpolvajjsqirs.supabase.co";
  const supabaseKey =
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "").trim() ||
    "sb_publishable_FnEN-7WZtC0_qvoNApQNSw__c9KqANV";

  const fromEmail =
    (process.env.EVENT_FROM_EMAIL || "").trim() ||
    "GAMAT FX Academy <events@gamatfxacademy.com>";

  try {
    const [evRes, regRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/events?select=*&status=eq.published`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      }),
      fetch(`${supabaseUrl}/rest/v1/registrations?select=*&status=eq.confirmed`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      }),
    ]);

    if (!evRes.ok || !regRes.ok) {
      return res.status(200).json({ ok: false, message: "Could not query Supabase events/registrations" });
    }

    const events = await evRes.json();
    const registrations = await regRes.json();

    const now = new Date();
    const tomorrowUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

    const tomorrowEvents = new Map();
    for (const ev of events || []) {
      const d = parseEventDateUtc(ev);
      if (d && d.getTime() === tomorrowUtc.getTime()) {
        tomorrowEvents.set(ev.id, ev);
      }
    }

    let accRes = await fetch(
      `${supabaseUrl}/rest/v1/accounts?select=id,email,first_name,last_name,nickname,birthday,status,notif_prefs`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    );
    if (!accRes.ok) {
      accRes = await fetch(
        `${supabaseUrl}/rest/v1/accounts?select=id,email,first_name,last_name,nickname,birthday,status`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      );
    }
    const accounts = accRes.ok ? await accRes.json() : [];
    const accountByEmail = new Map(
      (accounts || [])
        .filter((a) => a?.email)
        .map((a) => [String(a.email).trim().toLowerCase(), a])
    );

    let eventRemindersSent = 0;
    if (tomorrowEvents.size > 0) {
      for (const reg of registrations || []) {
        const ev = tomorrowEvents.get(reg.event_id);
        if (!ev || !reg.email) continue;
        const regAcc = accountByEmail.get(String(reg.email).trim().toLowerCase());
        if (regAcc?.notif_prefs && regAcc.notif_prefs.emailEvents === false) continue;

        const safeName = escapeHtml(reg.name || "Trader");
        const safeTitle = escapeHtml(ev.title || reg.event_title || "GAMAT FX Event");
        const safeTicket = escapeHtml(reg.ticket || "");
        const safeTime = escapeHtml(ev.time || "");
        const safeLocation = escapeHtml(ev.location || "");
        const ticketUrl = `https://gamatfxacademy.com/#/events?ticket=${encodeURIComponent(reg.ticket || "")}`;

        const html = `
          <!DOCTYPE html>
          <html>
            <body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#16181c;">
              <table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 14px;">
                <tr><td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
                    <tr>
                      <td style="background:#16181c;padding:28px;text-align:center;">
                        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#fda4af;">EVENT REMINDER</p>
                        <h1 style="margin:8px 0 0;font-size:22px;font-weight:800;color:#ffffff;">See You Tomorrow!</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:28px;">
                        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
                          Hi <strong>${safeName}</strong>, just a quick reminder that <strong>${safeTitle}</strong> is tomorrow!
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:16px;font-size:13px;color:#374151;">
                          ${safeTicket ? `<tr><td style="padding:5px 0;color:#6b7280;width:100px;">Ticket</td><td style="padding:5px 0;font-weight:700;color:#dc3545;">${safeTicket}</td></tr>` : ""}
                          ${safeTime ? `<tr><td style="padding:5px 0;color:#6b7280;">Time</td><td style="padding:5px 0;font-weight:600;color:#111827;">${safeTime}</td></tr>` : ""}
                          ${safeLocation ? `<tr><td style="padding:5px 0;color:#6b7280;">Location</td><td style="padding:5px 0;font-weight:600;color:#111827;">${safeLocation}</td></tr>` : ""}
                        </table>
                        <div style="text-align:center;margin-top:22px;">
                          <a href="${ticketUrl}" style="display:inline-block;background:#dc3545;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 26px;border-radius:9999px;">View Ticket &amp; QR Code</a>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
          </html>
        `;

        const mailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [reg.email],
            subject: `Reminder: ${ev.title || reg.event_title} is Tomorrow!`,
            html,
          }),
        });
        if (mailRes.ok) eventRemindersSent += 1;
      }
    }

    // Daily Birthday Check & Email Dispatch
    let birthdayEmailsSent = 0;
    const todayMm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const todayDd = String(now.getUTCDate()).padStart(2, "0");
    const todayMmDd = `${todayMm}-${todayDd}`;

    if (accRes.ok) {
      const celebrants = (accounts || []).filter((acc) => {
        if (!acc?.email || !acc?.birthday) return false;
        if (acc.status && acc.status !== "active") return false;
        if (acc.notif_prefs && acc.notif_prefs.emailBirthdays === false) return false;
        const bday = String(acc.birthday).trim();
        const match = bday.match(/^\d{4}-(\d{2}-\d{2})/);
        return match ? match[1] === todayMmDd : false;
      });

      const academyFrom =
        (process.env.ACADEMY_FROM_EMAIL || "").trim() ||
        "GAMAT FX Academy <noreply@gamatfxacademy.com>";

      for (const acc of celebrants) {
        const displayName =
          [acc.first_name, acc.last_name].filter(Boolean).join(" ").trim() ||
          acc.nickname ||
          "Trader";
        const firstName = escapeHtml(acc.first_name || displayName);

        const bdayHtml = `
          <!DOCTYPE html>
          <html>
            <body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#16181c;">
              <table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 14px;">
                <tr><td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
                    <tr>
                      <td style="background:linear-gradient(135deg,#be123c,#dc3545);padding:32px 28px;text-align:center;">
                        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ffe4e6;">BIRTHDAY CELEBRATION</p>
                        <h1 style="margin:10px 0 0;font-size:26px;font-weight:800;color:#ffffff;">Happy Birthday, ${firstName}!</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:28px;">
                        <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#374151;">
                          Wishing you a joyful birthday and a year filled with growth, discipline, and winning trades!
                        </p>
                        <p style="margin:0 0 22px;font-size:14px;line-height:1.6;color:#4b5563;">
                          Everyone at <strong>GAMAT FX Academy</strong> is celebrating you today. Stop by the Student Forum to say hello to the community!
                        </p>
                        <div style="text-align:center;">
                          <a href="https://gamatfxacademy.com/#/dashboard" style="display:inline-block;background:#dc3545;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 26px;border-radius:9999px;">Visit Your Dashboard</a>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
          </html>
        `;

        const mailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: academyFrom,
            to: [acc.email],
            subject: `Happy Birthday, ${acc.first_name || displayName}! — GAMAT FX Academy`,
            html: bdayHtml,
          }),
        });
        if (mailRes.ok) birthdayEmailsSent += 1;
      }

      if (celebrants.length > 0) {
        const adminEmail = (process.env.ADMIN_NOTIFY_EMAIL || "hello@gamatfxacademy.com").trim();
        const namesList = celebrants
          .map((c) => {
            const full = [c.first_name, c.last_name].filter(Boolean).join(" ").trim() || c.nickname || c.email;
            return `<li style="margin:4px 0;"><strong>${escapeHtml(full)}</strong> (${escapeHtml(c.email)})</li>`;
          })
          .join("");

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: academyFrom,
            to: [adminEmail],
            subject: `Today's Birthdays (${celebrants.length}) — GAMAT FX Academy`,
            html: `
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#16181c;padding:20px;">
                <h2 style="margin:0 0 12px;">Today's Birthday Celebrants (${celebrants.length})</h2>
                <p style="margin:0 0 12px;color:#4b5563;">Automated birthday greetings were sent to:</p>
                <ul style="padding-left:20px;margin:0;">${namesList}</ul>
              </div>
            `,
          }),
        });
      }
    }

    return res.status(200).json({ ok: true, eventRemindersSent, birthdayEmailsSent });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err?.message || "Reminder cron failed" });
  }
}
