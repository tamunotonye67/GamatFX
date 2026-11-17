/**
 * Vercel Serverless Function: General Transactional Emails via Resend
 * Supports:
 *  - type: "receipt" (Course, Certificate, or Store purchase receipt)
 *  - type: "enquiry" (Contact / Service enquiry confirmation to user + notification to academy)
 */

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendResendEmail(apiKey, payload) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "Method not allowed" });

  try {
    const apiKey = (process.env.RESEND_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(200).json({
        ok: false,
        skipped: true,
        message: "RESEND_API_KEY is not configured in environment variables.",
      });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { type } = body;

    const fromEmail =
      (process.env.EVENT_FROM_EMAIL || "").trim() ||
      "GAMAT FX Academy <events@gamatfxacademy.com>";
    const adminEmail =
      (process.env.ADMIN_NOTIFY_EMAIL || "").trim() ||
      "hello@gamatfxacademy.com";

    if (type === "receipt") {
      const { to, name, itemTitle, amount, reference, method, category = "Enrollment", downloadUrl } = body;
      if (!to || !itemTitle) {
        return res.status(400).json({ ok: false, message: "Missing required receipt fields (to, itemTitle)" });
      }

      const safeName = escapeHtml(name || "Student");
      const safeTitle = escapeHtml(itemTitle);
      const safeRef = escapeHtml(reference || "N/A");
      const safeMethod = escapeHtml(method || "Online Payment");
      const safeCategory = escapeHtml(category);
      const isFree = !(Number(amount) > 0);
      const amountLabel = isFree
        ? "Free (₦0)"
        : `₦${Number(amount).toLocaleString("en-NG")}`;
      const safeDownloadUrl =
        downloadUrl && /^https?:\/\//i.test(String(downloadUrl).trim())
          ? String(downloadUrl).trim()
          : "";

      const html = `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
          <body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#16181c;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 14px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
                    <tr>
                      <td style="background:#16181c;padding:28px;text-align:center;">
                        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#fda4af;">GAMAT FX ACADEMY</p>
                        <h1 style="margin:8px 0 0;font-size:24px;font-weight:800;color:#ffffff;">${isFree ? "Your Free Download Is Ready" : "Payment Receipt"}</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:28px;">
                        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
                          Hi <strong>${safeName}</strong>, thank you! ${isFree ? `Here is your free access to <strong>${safeTitle}</strong>.` : `Your payment for <strong>${safeTitle}</strong> has been confirmed.`}
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:16px;font-size:13px;color:#374151;">
                          <tr><td style="padding:6px 0;color:#6b7280;width:130px;">Type</td><td style="padding:6px 0;font-weight:600;color:#111827;">${safeCategory}</td></tr>
                          <tr><td style="padding:6px 0;color:#6b7280;">Item</td><td style="padding:6px 0;font-weight:600;color:#111827;">${safeTitle}</td></tr>
                          <tr><td style="padding:6px 0;color:#6b7280;">Amount</td><td style="padding:6px 0;font-weight:700;color:#dc3545;">${amountLabel}</td></tr>
                          <tr><td style="padding:6px 0;color:#6b7280;">Reference</td><td style="padding:6px 0;font-weight:600;color:#111827;">${safeRef}</td></tr>
                          <tr><td style="padding:6px 0;color:#6b7280;">Method</td><td style="padding:6px 0;font-weight:600;color:#111827;">${safeMethod}</td></tr>
                        </table>
                        <div style="text-align:center;margin-top:24px;">
                          ${
                            safeDownloadUrl
                              ? `<a href="${escapeHtml(safeDownloadUrl)}" style="display:inline-block;background:#dc3545;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 26px;border-radius:9999px;margin:0 6px 10px;">Download File Now</a>`
                              : ""
                          }
                          <a href="${safeDownloadUrl ? "https://gamatfxacademy.com/#/store" : "https://gamatfxacademy.com/#/dashboard"}" style="display:inline-block;background:${safeDownloadUrl ? "#16181c" : "#dc3545"};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 26px;border-radius:9999px;margin:0 6px 10px;">
                            ${safeDownloadUrl ? "Visit GAMAT Store" : "Open My Dashboard"}
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

      const result = await sendResendEmail(apiKey, {
        from: fromEmail,
        to: [to],
        reply_to: adminEmail,
        subject: `${isFree ? "Your Download" : "Receipt"}: ${itemTitle} (${safeRef})`,
        html,
      });

      if (!result.ok) {
        return res.status(result.status).json({ ok: false, message: result.data?.message || "Failed to send receipt" });
      }
      return res.status(200).json({ ok: true, id: result.data?.id });
    }

    if (type === "enquiry") {
      const { to, name, phone, serviceTitle, packageName, budget, company, message, ref } = body;
      if (!to || !message) {
        return res.status(400).json({ ok: false, message: "Missing required enquiry fields (to, message)" });
      }

      const safeName = escapeHtml(name || "Visitor");
      const safeEmail = escapeHtml(to);
      const safePhone = escapeHtml(phone || "Not provided");
      const safeService = escapeHtml(serviceTitle || "General Enquiry");
      const safePkg = packageName ? escapeHtml(packageName) : "";
      const safeBudget = budget ? escapeHtml(budget) : "";
      const safeCompany = company ? escapeHtml(company) : "";
      const safeMsg = escapeHtml(message).replace(/\n/g, "<br/>");
      const safeRef = escapeHtml(ref || "ENQ");

      // 1. Confirmation email to the user
      const userHtml = `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
          <body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#16181c;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 14px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
                    <tr>
                      <td style="background:#16181c;padding:28px;text-align:center;">
                        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#fda4af;">GAMAT FX ACADEMY</p>
                        <h1 style="margin:8px 0 0;font-size:22px;font-weight:800;color:#ffffff;">We Received Your Message</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:28px;">
                        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#374151;">
                          Hi <strong>${safeName}</strong>, thanks for reaching out regarding <strong>${safeService}</strong>. Our team will respond within 24 hours.
                        </p>
                        <p style="margin:0 0 16px;font-size:13px;color:#6b7280;">
                          Reference: <strong style="color:#dc3545;">${safeRef}</strong>
                        </p>
                        <div style="background:#f9fafb;border-radius:12px;padding:16px;font-size:13px;color:#374151;line-height:1.6;">
                          ${safeMsg}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:16px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;font-size:12px;color:#6b7280;">
                        GAMAT FX Academy · Reply to this email anytime
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;

      // 2. Notification email to admin (with reply_to set to the user's email)
      const adminHtml = `
        <!DOCTYPE html>
        <html>
          <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#16181c;padding:20px;">
            <h2 style="margin:0 0 12px;">New Enquiry (${safeRef}): ${safeService}</h2>
            <p><strong>Name:</strong> ${safeName}<br/>
            <strong>Email:</strong> ${safeEmail}<br/>
            <strong>Phone:</strong> ${safePhone}<br/>
            ${safeCompany ? `<strong>Company:</strong> ${safeCompany}<br/>` : ""}
            ${safePkg ? `<strong>Package:</strong> ${safePkg}<br/>` : ""}
            ${safeBudget ? `<strong>Budget:</strong> ${safeBudget}<br/>` : ""}</p>
            <div style="background:#f4f5f7;padding:14px;border-radius:10px;line-height:1.6;">${safeMsg}</div>
          </body>
        </html>
      `;

      const [userRes] = await Promise.all([
        sendResendEmail(apiKey, {
          from: fromEmail,
          to: [to],
          reply_to: adminEmail,
          subject: `We received your enquiry: ${serviceTitle || "GAMAT FX"} (${safeRef})`,
          html: userHtml,
        }),
        sendResendEmail(apiKey, {
          from: fromEmail,
          to: [adminEmail],
          reply_to: to,
          subject: `New Enquiry [${safeRef}]: ${serviceTitle || "General"} — ${name || to}`,
          html: adminHtml,
        }),
      ]);

      if (!userRes.ok) {
        return res.status(userRes.status).json({ ok: false, message: userRes.data?.message || "Failed to send enquiry email" });
      }
      return res.status(200).json({ ok: true, id: userRes.data?.id });
    }

    return res.status(400).json({ ok: false, message: "Unsupported email type" });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err?.message || "Email server error" });
  }
}
