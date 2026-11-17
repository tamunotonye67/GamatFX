/**
 * Vercel Serverless Function: Send Event Registration Confirmation Email
 * Uses Resend REST API (zero external dependencies).
 * Requires RESEND_API_KEY in Vercel Environment Variables.
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
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const {
      to,
      name,
      ticket,
      eventTitle,
      eventDate,
      eventTime,
      eventLocation,
      price,
      paymentRef,
    } = body;

    if (!to || !ticket || !eventTitle) {
      return res.status(400).json({ ok: false, message: "Missing required fields (to, ticket, eventTitle)" });
    }

    const apiKey = (process.env.RESEND_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(200).json({
        ok: false,
        skipped: true,
        message: "RESEND_API_KEY is not configured in environment variables.",
      });
    }

    const fromEmail =
      (process.env.EVENT_FROM_EMAIL || "").trim() ||
      "GAMAT FX Academy <onboarding@resend.dev>";

    const safeName = escapeHtml(name || "Trader");
    const safeTicket = escapeHtml(ticket);
    const safeTitle = escapeHtml(eventTitle);
    const safeDate = escapeHtml(eventDate || "");
    const safeTime = escapeHtml(eventTime || "");
    const safeLocation = escapeHtml(eventLocation || "");
    const safePayRef = paymentRef ? escapeHtml(paymentRef) : "";
    const priceLabel = price && Number(price) > 0
      ? `₦${Number(price).toLocaleString("en-NG")} (Paid)`
      : "Free Entry";

    const ticketUrl = `https://gamatfxacademy.com/#/events?ticket=${encodeURIComponent(ticket)}`;
    const qrImgUrl = `https://gamatfxacademy.com/api/qr?ticket=${encodeURIComponent(ticket)}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#16181c;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 14px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
                  <tr>
                    <td style="background:#16181c;padding:28px 28px 24px;text-align:center;">
                      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#fda4af;">GAMAT FX ACADEMY</p>
                      <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;font-weight:800;color:#ffffff;">Your Seat Is Confirmed</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:28px;">
                      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
                        Hi <strong>${safeName}</strong>, thank you for registering! Here is your official event pass for <strong>${safeTitle}</strong>.
                      </p>

                      <div style="background:#fdf2f4;border:2px dashed #dc3545;border-radius:16px;padding:20px;text-align:center;margin:20px 0;">
                        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#6b7280;">Ticket Number</p>
                        <p style="margin:6px 0 14px;font-size:26px;font-weight:800;letter-spacing:2px;color:#dc3545;">${safeTicket}</p>
                        <img src="${qrImgUrl}" alt="Event Ticket QR Code" width="150" height="150" style="display:block;margin:0 auto;border-radius:12px;border:1px solid #e5e7eb;background:#ffffff;padding:6px;" />
                        <p style="margin:10px 0 0;font-size:12px;color:#6b7280;">Present this QR code or ticket number at check-in.</p>
                      </div>

                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:16px;font-size:13px;color:#374151;">
                        <tr>
                          <td style="padding:5px 0;color:#6b7280;width:110px;">Event</td>
                          <td style="padding:5px 0;font-weight:600;color:#111827;">${safeTitle}</td>
                        </tr>
                        ${safeDate ? `<tr><td style="padding:5px 0;color:#6b7280;">Date</td><td style="padding:5px 0;font-weight:600;color:#111827;">${safeDate}</td></tr>` : ""}
                        ${safeTime ? `<tr><td style="padding:5px 0;color:#6b7280;">Time</td><td style="padding:5px 0;font-weight:600;color:#111827;">${safeTime}</td></tr>` : ""}
                        ${safeLocation ? `<tr><td style="padding:5px 0;color:#6b7280;">Location</td><td style="padding:5px 0;font-weight:600;color:#111827;">${safeLocation}</td></tr>` : ""}
                        <tr>
                          <td style="padding:5px 0;color:#6b7280;">Access</td>
                          <td style="padding:5px 0;font-weight:600;color:#111827;">${priceLabel}</td>
                        </tr>
                        ${safePayRef ? `<tr><td style="padding:5px 0;color:#6b7280;">Payment Ref</td><td style="padding:5px 0;font-weight:600;color:#111827;">${safePayRef}</td></tr>` : ""}
                      </table>

                      <div style="text-align:center;margin-top:24px;">
                        <a href="${ticketUrl}" style="display:inline-block;background:#dc3545;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 26px;border-radius:9999px;">
                          View Ticket on GAMAT FX
                        </a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;font-size:12px;color:#6b7280;">
                      GAMAT FX Academy · Institutional Trading Education
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: `Confirmed: ${eventTitle} (Ticket ${ticket})`,
        html,
      }),
    });

    const data = await resendRes.json().catch(() => ({}));
    if (!resendRes.ok) {
      return res.status(resendRes.status).json({
        ok: false,
        message: data?.message || "Failed to send confirmation email",
      });
    }

    return res.status(200).json({ ok: true, id: data?.id });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err?.message || "Email server error" });
  }
}
