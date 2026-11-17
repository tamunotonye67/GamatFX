/**
 * Vercel Serverless Function: Resend Inbound Email Forwarder
 * Receives Resend `email.received` webhooks and forwards incoming emails
 * (e.g. hello@gamatfxacademy.com) to your personal Gmail/inbox via Resend.
 *
 * Required Vercel Environment Variables:
 *  - RESEND_API_KEY
 *  - FORWARD_TO_EMAIL (or ADMIN_NOTIFY_EMAIL) = your Gmail address
 */

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, service: "gamatfx-inbound-email" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const apiKey = (process.env.RESEND_API_KEY || "").trim();
    const forwardTo = (
      process.env.FORWARD_TO_EMAIL ||
      process.env.ADMIN_NOTIFY_EMAIL ||
      ""
    ).trim();

    if (!apiKey || !forwardTo) {
      return res.status(200).json({
        ok: false,
        skipped: true,
        message: "RESEND_API_KEY or FORWARD_TO_EMAIL is not configured.",
      });
    }

    const event = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    if (event.type && event.type !== "email.received") {
      return res.status(200).json({ ok: true, ignored: event.type });
    }

    const data = event.data || event;
    const emailId = data.email_id || data.id;
    let sender = data.from || "unknown@sender.com";
    let recipients = Array.isArray(data.to) ? data.to : [data.to || "hello@gamatfxacademy.com"];
    let subject = data.subject || "(No Subject)";
    let htmlBody = data.html || "";
    let textBody = data.text || "";

    // Fetch full received email content from Resend Receiving API
    if (emailId && !htmlBody && !textBody) {
      const detailRes = await fetch(
        `https://api.resend.com/emails/receiving/${encodeURIComponent(emailId)}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${apiKey}` },
        }
      );
      if (detailRes.ok) {
        const detail = await detailRes.json().catch(() => ({}));
        sender = detail.from || sender;
        recipients = Array.isArray(detail.to) ? detail.to : recipients;
        subject = detail.subject || subject;
        htmlBody = detail.html || "";
        textBody = detail.text || "";
      }
    }

    const fromEmail =
      (process.env.EVENT_FROM_EMAIL || "").trim() ||
      "GAMAT FX Academy <events@gamatfxacademy.com>";

    const toLabel = recipients.join(", ");
    const banner = `
      <div style="background:#f4f5f7;border:1px solid #e5e7eb;border-radius:10px;padding:12px 14px;margin-bottom:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;color:#374151;">
        <div><strong>From:</strong> ${escapeHtml(sender)}</div>
        <div><strong>To:</strong> ${escapeHtml(toLabel)}</div>
        <div><strong>Subject:</strong> ${escapeHtml(subject)}</div>
      </div>
    `;

    const forwardHtml = htmlBody
      ? `${banner}${htmlBody}`
      : `${banner}<pre style="white-space:pre-wrap;font-family:inherit;font-size:14px;color:#111827;">${escapeHtml(textBody || "(Empty message body)")}</pre>`;

    const forwardRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [forwardTo],
        reply_to: sender,
        subject: `[${toLabel}] ${subject}`,
        html: forwardHtml,
        ...(textBody ? { text: `From: ${sender}\nTo: ${toLabel}\n\n${textBody}` } : {}),
      }),
    });

    const out = await forwardRes.json().catch(() => ({}));
    if (!forwardRes.ok) {
      return res.status(forwardRes.status).json({
        ok: false,
        message: out?.message || "Failed to forward inbound email",
      });
    }

    return res.status(200).json({ ok: true, id: out?.id });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err?.message || "Inbound email error" });
  }
}
