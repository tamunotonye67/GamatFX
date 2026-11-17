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
      const { to, name, itemTitle, amount, reference, method, category = "Enrollment", downloadUrl, isPreorder, releaseDate } = body;
      if (!to || !itemTitle) {
        return res.status(400).json({ ok: false, message: "Missing required receipt fields (to, itemTitle)" });
      }

      const safeName = escapeHtml(name || "Student");
      const safeTitle = escapeHtml(itemTitle);
      const safeRef = escapeHtml(reference || "N/A");
      const safeMethod = escapeHtml(method || "Online Payment");
      const safeCategory = escapeHtml(category);
      const safeRelease = releaseDate ? escapeHtml(releaseDate) : "";
      const isFree = !(Number(amount) > 0);
      const amountLabel = isFree
        ? "Free (₦0)"
        : `₦${Number(amount).toLocaleString("en-NG")}`;
      const safeDownloadUrl =
        downloadUrl && /^https?:\/\//i.test(String(downloadUrl).trim())
          ? String(downloadUrl).trim()
          : "";

      const heading = isPreorder
        ? "Pre-Order Confirmed"
        : isFree
          ? "Your Free Download Is Ready"
          : "Payment Receipt";

      const intro = isPreorder
        ? `Hi <strong>${safeName}</strong>, your pre-order reservation for <strong>${safeTitle}</strong> is confirmed! We'll notify you as soon as the full release goes live${safeRelease ? ` (expected <strong>${safeRelease}</strong>)` : ""}.`
        : isFree
          ? `Hi <strong>${safeName}</strong>, thank you! Here is your free access to <strong>${safeTitle}</strong>.`
          : `Hi <strong>${safeName}</strong>, thank you! Your payment for <strong>${safeTitle}</strong> has been confirmed.`;

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
                        <h1 style="margin:8px 0 0;font-size:24px;font-weight:800;color:#ffffff;">${heading}</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:28px;">
                        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
                          ${intro}
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:16px;font-size:13px;color:#374151;">
                          <tr><td style="padding:6px 0;color:#6b7280;width:130px;">Type</td><td style="padding:6px 0;font-weight:600;color:#111827;">${safeCategory}</td></tr>
                          <tr><td style="padding:6px 0;color:#6b7280;">Item</td><td style="padding:6px 0;font-weight:600;color:#111827;">${safeTitle}</td></tr>
                          ${safeRelease ? `<tr><td style="padding:6px 0;color:#6b7280;">Expected Release</td><td style="padding:6px 0;font-weight:600;color:#111827;">${safeRelease}</td></tr>` : ""}
                          <tr><td style="padding:6px 0;color:#6b7280;">Amount</td><td style="padding:6px 0;font-weight:700;color:#dc3545;">${amountLabel}</td></tr>
                          <tr><td style="padding:6px 0;color:#6b7280;">Reference</td><td style="padding:6px 0;font-weight:600;color:#111827;">${safeRef}</td></tr>
                          <tr><td style="padding:6px 0;color:#6b7280;">Method</td><td style="padding:6px 0;font-weight:600;color:#111827;">${safeMethod}</td></tr>
                        </table>
                        <div style="text-align:center;margin-top:24px;">
                          ${
                            safeDownloadUrl
                              ? `<a href="${escapeHtml(safeDownloadUrl)}" style="display:inline-block;background:#dc3545;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 26px;border-radius:9999px;margin:0 6px 10px;">${isPreorder ? "Download Early-Access Pass" : "Download File Now"}</a>`
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
        subject: `${isPreorder ? "Pre-Order Confirmed" : isFree ? "Your Download" : "Receipt"}: ${itemTitle} (${safeRef})`,
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

    if (type === "affiliate") {
      const { to, affiliateName, eventKind = "signup", referralCode, referredName, itemTitle, commissionAmount } = body;
      if (!to) {
        return res.status(400).json({ ok: false, message: "Missing recipient email (to)" });
      }

      const safeAffName = escapeHtml(affiliateName || "Ambassador");
      const safeCode = escapeHtml(referralCode || "");
      const safeRefName = escapeHtml(referredName || "A new trader");
      const safeItem = escapeHtml(itemTitle || "");
      const isCommission = eventKind === "commission" && Number(commissionAmount) > 0;
      const commLabel = isCommission ? `₦${Number(commissionAmount).toLocaleString("en-NG")}` : "";

      const subject = isCommission
        ? `You earned ${commLabel} affiliate commission!`
        : `New referral signup with your code ${referralCode || ""}`.trim();

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
                        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#fda4af;">GAMAT FX AFFILIATE</p>
                        <h1 style="margin:8px 0 0;font-size:22px;font-weight:800;color:#ffffff;">${isCommission ? `Commission Earned: ${commLabel}` : "New Referral Signup!"}</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:28px;">
                        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
                          Hi <strong>${safeAffName}</strong>, ${
                            isCommission
                              ? `<strong>${safeRefName}</strong> just completed a purchase using your referral link${safeItem ? ` (<strong>${safeItem}</strong>)` : ""}. Your commission of <strong style="color:#dc3545;">${commLabel}</strong> has been credited to your affiliate balance!`
                              : `<strong>${safeRefName}</strong> just created a GAMAT FX account using your referral link${safeCode ? ` (<code>${safeCode}</code>)` : ""}. When they enroll in a course or purchase from the store, you'll earn your affiliate commission automatically.`
                          }
                        </p>
                        <div style="text-align:center;margin-top:24px;">
                          <a href="https://gamatfxacademy.com/#/dashboard" style="display:inline-block;background:#dc3545;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 26px;border-radius:9999px;">
                            View Affiliate Dashboard
                          </a>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:16px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;font-size:12px;color:#6b7280;">
                        GAMAT FX Academy · Partner &amp; Affiliate Program
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
        subject,
        html,
      });

      if (!result.ok) {
        return res.status(result.status).json({ ok: false, message: result.data?.message || "Failed to send affiliate email" });
      }
      return res.status(200).json({ ok: true, id: result.data?.id });
    }

    if (type === "welcome") {
      const { to, name } = body;
      if (!to) return res.status(400).json({ ok: false, message: "Missing recipient email (to)" });
      const safeName = escapeHtml(name || "Trader");

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
                        <h1 style="margin:8px 0 0;font-size:24px;font-weight:800;color:#ffffff;">Welcome to GAMAT FX!</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:28px;">
                        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
                          Hi <strong>${safeName}</strong>, welcome aboard! Your student account is ready. Explore our institutional order-flow courses, free store resources, live events, and community forum.
                        </p>
                        <div style="text-align:center;margin-top:24px;">
                          <a href="https://gamatfxacademy.com/#/dashboard" style="display:inline-block;background:#dc3545;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 26px;border-radius:9999px;margin:0 6px 10px;">
                            Open My Dashboard
                          </a>
                          <a href="https://gamatfxacademy.com/#/courses" style="display:inline-block;background:#16181c;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 26px;border-radius:9999px;margin:0 6px 10px;">
                            Browse Courses
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
        subject: "Welcome to GAMAT FX Academy!",
        html,
      });
      if (!result.ok) return res.status(result.status).json({ ok: false, message: result.data?.message || "Failed to send welcome email" });
      return res.status(200).json({ ok: true, id: result.data?.id });
    }

    if (type === "payout") {
      const { to, affiliateName, eventKind = "requested", amount, method, details, note } = body;
      const safeName = escapeHtml(affiliateName || "Ambassador");
      const safeMethod = escapeHtml(method || "bank");
      const safeDetails = escapeHtml(details || "");
      const safeNote = note ? escapeHtml(note) : "";
      const amountLabel = `₦${Number(amount || 0).toLocaleString("en-NG")}`;

      if (eventKind === "requested") {
        const adminHtml = `
          <!DOCTYPE html>
          <html>
            <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#16181c;padding:20px;">
              <h2 style="margin:0 0 12px;">New Affiliate Payout Request: ${amountLabel}</h2>
              <p><strong>Ambassador:</strong> ${safeName} (${escapeHtml(to || "")})<br/>
              <strong>Amount:</strong> ${amountLabel}<br/>
              <strong>Method:</strong> ${safeMethod}<br/>
              <strong>Details:</strong> ${safeDetails}</p>
              <p><a href="https://gamatfxacademy.com/#/admin/affiliates">Review in Admin Affiliates</a></p>
            </body>
          </html>
        `;
        const result = await sendResendEmail(apiKey, {
          from: fromEmail,
          to: [adminEmail],
          ...(to ? { reply_to: to } : {}),
          subject: `Payout Request: ${amountLabel} — ${affiliateName || "Ambassador"}`,
          html: adminHtml,
        });
        if (!result.ok) return res.status(result.status).json({ ok: false, message: result.data?.message || "Failed to notify admin" });
        return res.status(200).json({ ok: true, id: result.data?.id });
      }

      if (!to) return res.status(400).json({ ok: false, message: "Missing recipient email (to)" });
      const isPaid = eventKind === "paid";
      const html = `
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#16181c;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 14px;">
              <tr><td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
                  <tr>
                    <td style="background:#16181c;padding:28px;text-align:center;">
                      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#fda4af;">GAMAT FX AFFILIATE</p>
                      <h1 style="margin:8px 0 0;font-size:22px;font-weight:800;color:#ffffff;">${isPaid ? `Payout Sent: ${amountLabel}` : "Payout Request Update"}</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:28px;">
                      <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#374151;">
                        Hi <strong>${safeName}</strong>, ${
                          isPaid
                            ? `your affiliate payout of <strong style="color:#dc3545;">${amountLabel}</strong> via <strong>${safeMethod}</strong> has been processed and marked as paid.`
                            : `your affiliate payout request of <strong>${amountLabel}</strong> could not be processed and the balance has been returned to your affiliate wallet.`
                        }
                      </p>
                      ${safeNote ? `<div style="background:#f9fafb;border-radius:10px;padding:12px 14px;font-size:13px;color:#374151;margin-bottom:16px;"><strong>Note:</strong> ${safeNote}</div>` : ""}
                      <div style="text-align:center;margin-top:20px;">
                        <a href="https://gamatfxacademy.com/#/dashboard" style="display:inline-block;background:#dc3545;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 26px;border-radius:9999px;">View Dashboard</a>
                      </div>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>
      `;
      const result = await sendResendEmail(apiKey, {
        from: fromEmail,
        to: [to],
        reply_to: adminEmail,
        subject: isPaid ? `Payout Processed: ${amountLabel}` : `Payout Request Returned: ${amountLabel}`,
        html,
      });
      if (!result.ok) return res.status(result.status).json({ ok: false, message: result.data?.message || "Failed to send payout email" });
      return res.status(200).json({ ok: true, id: result.data?.id });
    }

    if (type === "quiz_passed") {
      const { to, name, courseTitle, score, courseId } = body;
      if (!to || !courseTitle) return res.status(400).json({ ok: false, message: "Missing required fields (to, courseTitle)" });
      const safeName = escapeHtml(name || "Student");
      const safeCourse = escapeHtml(courseTitle);
      const safeScore = Number(score || 0);
      const certUrl = `https://gamatfxacademy.com/#/quiz/${encodeURIComponent(courseId || "")}`;

      const html = `
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#16181c;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 14px;">
              <tr><td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
                  <tr>
                    <td style="background:#16181c;padding:28px;text-align:center;">
                      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#fda4af;">GAMAT FX CERTIFICATION</p>
                      <h1 style="margin:8px 0 0;font-size:24px;font-weight:800;color:#ffffff;">Congratulations — You Passed!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:28px;">
                      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
                        Hi <strong>${safeName}</strong>, you passed the final assessment for <strong>${safeCourse}</strong> with a score of <strong style="color:#dc3545;">${safeScore}%</strong>!
                      </p>
                      <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#4b5563;">
                        Your official GAMAT FX Academy certificate is ready to view or unlock.
                      </p>
                      <div style="text-align:center;">
                        <a href="${certUrl}" style="display:inline-block;background:#dc3545;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 26px;border-radius:9999px;">
                          Claim Your Certificate
                        </a>
                      </div>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>
      `;
      const result = await sendResendEmail(apiKey, {
        from: fromEmail,
        to: [to],
        reply_to: adminEmail,
        subject: `Exam Passed (${safeScore}%): ${courseTitle}`,
        html,
      });
      if (!result.ok) return res.status(result.status).json({ ok: false, message: result.data?.message || "Failed to send quiz email" });
      return res.status(200).json({ ok: true, id: result.data?.id });
    }

    if (type === "giveaway_winner") {
      const { to, name, giveawayTitle, reward } = body;
      if (!to || !giveawayTitle) return res.status(400).json({ ok: false, message: "Missing required fields (to, giveawayTitle)" });
      const safeName = escapeHtml(name || "Trader");
      const safeTitle = escapeHtml(giveawayTitle);
      const safeReward = escapeHtml(reward || "Community Reward");

      const html = `
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#16181c;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 14px;">
              <tr><td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
                  <tr>
                    <td style="background:#16181c;padding:28px;text-align:center;">
                      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#fda4af;">GAMAT FX GIVEAWAY</p>
                      <h1 style="margin:8px 0 0;font-size:24px;font-weight:800;color:#ffffff;">You Won a Giveaway!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:28px;">
                      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
                        Congratulations <strong>${safeName}</strong>! You were selected as a winner in <strong>${safeTitle}</strong>.
                      </p>
                      <div style="background:#fdf2f4;border:1px dashed #dc3545;border-radius:12px;padding:14px;text-align:center;margin-bottom:20px;">
                        <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Your Reward</p>
                        <p style="margin:4px 0 0;font-size:18px;font-weight:800;color:#dc3545;">${safeReward}</p>
                      </div>
                      <div style="text-align:center;">
                        <a href="https://gamatfxacademy.com/#/giveaways" style="display:inline-block;background:#dc3545;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 26px;border-radius:9999px;">
                          View Giveaway Announcement
                        </a>
                      </div>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>
      `;
      const result = await sendResendEmail(apiKey, {
        from: fromEmail,
        to: [to],
        reply_to: adminEmail,
        subject: `Congratulations! You won: ${giveawayTitle}`,
        html,
      });
      if (!result.ok) return res.status(result.status).json({ ok: false, message: result.data?.message || "Failed to send giveaway email" });
      return res.status(200).json({ ok: true, id: result.data?.id });
    }

    if (type === "event_cancelled") {
      const { to, name, eventTitle, eventDate, ticket } = body;
      if (!to || !eventTitle) return res.status(400).json({ ok: false, message: "Missing required fields (to, eventTitle)" });
      const safeName = escapeHtml(name || "Attendee");
      const safeTitle = escapeHtml(eventTitle);
      const safeDate = escapeHtml(eventDate || "");
      const safeTicket = escapeHtml(ticket || "");

      const html = `
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#16181c;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 14px;">
              <tr><td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
                  <tr>
                    <td style="background:#16181c;padding:28px;text-align:center;">
                      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#fda4af;">GAMAT FX EVENTS</p>
                      <h1 style="margin:8px 0 0;font-size:22px;font-weight:800;color:#ffffff;">Registration Cancelled</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:28px;">
                      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
                        Hi <strong>${safeName}</strong>, your registration for <strong>${safeTitle}</strong>${safeDate ? ` (${safeDate})` : ""}${safeTicket ? ` — Ticket <code>${safeTicket}</code>` : ""} — has been cancelled and your seat has been released.
                      </p>
                      <div style="text-align:center;margin-top:20px;">
                        <a href="https://gamatfxacademy.com/#/events" style="display:inline-block;background:#dc3545;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 26px;border-radius:9999px;">Browse Upcoming Events</a>
                      </div>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>
      `;
      const result = await sendResendEmail(apiKey, {
        from: fromEmail,
        to: [to],
        reply_to: adminEmail,
        subject: `Cancelled: ${eventTitle}${ticket ? ` (${ticket})` : ""}`,
        html,
      });
      if (!result.ok) return res.status(result.status).json({ ok: false, message: result.data?.message || "Failed to send cancellation email" });
      return res.status(200).json({ ok: true, id: result.data?.id });
    }

    if (type === "mentorship_survey") {
      const { userEmail, userName, courseOrPlan, experienceLevel, tradingPath, challenges, longTermGoals, availability } = body;
      const safeName = escapeHtml(userName || "Student");
      const safeEmail = escapeHtml(userEmail || "");
      const safePlan = escapeHtml(courseOrPlan || "Mentorship");
      const adminHtml = `
        <!DOCTYPE html>
        <html>
          <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#16181c;padding:20px;">
            <h2 style="margin:0 0 12px;">New Mentorship Onboarding Survey</h2>
            <p><strong>Student:</strong> ${safeName} (${safeEmail})<br/>
            <strong>Track/Plan:</strong> ${safePlan}<br/>
            ${experienceLevel ? `<strong>Experience:</strong> ${escapeHtml(experienceLevel)}<br/>` : ""}
            <strong>Market Focus:</strong> ${escapeHtml(tradingPath || "")}<br/>
            <strong>Availability:</strong> ${escapeHtml(availability || "")}</p>
            ${challenges ? `<p><strong>Challenges:</strong><br/>${escapeHtml(challenges).replace(/\n/g, "<br/>")}</p>` : ""}
            ${longTermGoals ? `<p><strong>Long-Term Goals:</strong><br/>${escapeHtml(longTermGoals).replace(/\n/g, "<br/>")}</p>` : ""}
          </body>
        </html>
      `;
      const result = await sendResendEmail(apiKey, {
        from: fromEmail,
        to: [adminEmail],
        ...(userEmail ? { reply_to: userEmail } : {}),
        subject: `Mentorship Survey: ${userName || userEmail || "Student"} (${courseOrPlan || "Mentorship"})`,
        html: adminHtml,
      });
      if (!result.ok) return res.status(result.status).json({ ok: false, message: result.data?.message || "Failed to send survey alert" });
      return res.status(200).json({ ok: true, id: result.data?.id });
    }

    if (type === "team_bio") {
      const { to, name, role, eventKind = "submitted" } = body;
      const safeName = escapeHtml(name || "Team Member");
      const safeRole = escapeHtml(role || "Contributor");

      if (eventKind === "submitted") {
        const adminHtml = `
          <!DOCTYPE html>
          <html>
            <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#16181c;padding:20px;">
              <h2 style="margin:0 0 12px;">New Team Bio Submission</h2>
              <p><strong>Name:</strong> ${safeName} (${escapeHtml(to || "")})<br/>
              <strong>Role:</strong> ${safeRole}</p>
              <p><a href="https://gamatfxacademy.com/#/admin/team">Review in Admin Team</a></p>
            </body>
          </html>
        `;
        const result = await sendResendEmail(apiKey, {
          from: fromEmail,
          to: [adminEmail],
          ...(to ? { reply_to: to } : {}),
          subject: `Team Bio Submitted: ${name || "Staff"} (${role || ""})`,
          html: adminHtml,
        });
        if (!result.ok) return res.status(result.status).json({ ok: false, message: result.data?.message || "Failed to notify admin" });
        return res.status(200).json({ ok: true, id: result.data?.id });
      }

      if (!to) return res.status(400).json({ ok: false, message: "Missing recipient email (to)" });
      const approved = eventKind === "approved";
      const html = `
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#16181c;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 14px;">
              <tr><td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
                  <tr>
                    <td style="background:#16181c;padding:28px;text-align:center;">
                      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#fda4af;">GAMAT FX TEAM</p>
                      <h1 style="margin:8px 0 0;font-size:22px;font-weight:800;color:#ffffff;">${approved ? "Team Bio Approved!" : "Team Bio Update"}</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:28px;">
                      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
                        Hi <strong>${safeName}</strong>, ${
                          approved
                            ? `your team profile (<strong>${safeRole}</strong>) has been approved and is now live on the GAMAT FX Academy team page.`
                            : `your recent team profile submission (<strong>${safeRole}</strong>) was not approved. Please update your bio in the dashboard and resubmit.`
                        }
                      </p>
                      <div style="text-align:center;margin-top:20px;">
                        <a href="https://gamatfxacademy.com/#/about" style="display:inline-block;background:#dc3545;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 26px;border-radius:9999px;">View Team Page</a>
                      </div>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>
      `;
      const result = await sendResendEmail(apiKey, {
        from: fromEmail,
        to: [to],
        reply_to: adminEmail,
        subject: approved ? "Your GAMAT FX Team Bio is Live!" : "Update on Your Team Bio Submission",
        html,
      });
      if (!result.ok) return res.status(result.status).json({ ok: false, message: result.data?.message || "Failed to send team bio email" });
      return res.status(200).json({ ok: true, id: result.data?.id });
    }

    if (type === "forum_reply") {
      const { to, authorName, replierName, threadTitle, replyPreview } = body;
      if (!to || !threadTitle) return res.status(400).json({ ok: false, message: "Missing required fields (to, threadTitle)" });
      const safeAuthor = escapeHtml(authorName || "Trader");
      const safeReplier = escapeHtml(replierName || "A community member");
      const safeThread = escapeHtml(threadTitle);
      const safePreview = escapeHtml(replyPreview || "").slice(0, 300);

      const html = `
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#16181c;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 14px;">
              <tr><td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
                  <tr>
                    <td style="background:#16181c;padding:28px;text-align:center;">
                      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#fda4af;">GAMAT FX COMMUNITY</p>
                      <h1 style="margin:8px 0 0;font-size:22px;font-weight:800;color:#ffffff;">New Reply to Your Thread</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:28px;">
                      <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#374151;">
                        Hi <strong>${safeAuthor}</strong>, <strong>${safeReplier}</strong> replied to your forum post <strong>"${safeThread}"</strong>:
                      </p>
                      ${safePreview ? `<div style="background:#f9fafb;border-left:3px solid #dc3545;padding:12px 14px;border-radius:0 10px 10px 0;font-size:13px;color:#374151;line-height:1.6;margin-bottom:20px;">${safePreview}</div>` : ""}
                      <div style="text-align:center;">
                        <a href="https://gamatfxacademy.com/#/forum" style="display:inline-block;background:#dc3545;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 26px;border-radius:9999px;">View Reply in Forum</a>
                      </div>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </body>
        </html>
      `;
      const result = await sendResendEmail(apiKey, {
        from: fromEmail,
        to: [to],
        reply_to: adminEmail,
        subject: `New reply: ${threadTitle}`,
        html,
      });
      if (!result.ok) return res.status(result.status).json({ ok: false, message: result.data?.message || "Failed to send forum reply email" });
      return res.status(200).json({ ok: true, id: result.data?.id });
    }

    if (type === "review_submitted") {
      const { userName, userEmail, targetType, targetTitle, rating, comment } = body;
      const safeName = escapeHtml(userName || "Student");
      const safeTarget = escapeHtml(targetTitle || targetType || "Academy");
      const safeComment = escapeHtml(comment || "").replace(/\n/g, "<br/>");
      const stars = "★".repeat(Math.max(1, Math.min(5, Number(rating || 5))));

      const adminHtml = `
        <!DOCTYPE html>
        <html>
          <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#16181c;padding:20px;">
            <h2 style="margin:0 0 12px;">New Student Review (${stars})</h2>
            <p><strong>Student:</strong> ${safeName}${userEmail ? ` (${escapeHtml(userEmail)})` : ""}<br/>
            <strong>For:</strong> ${safeTarget}</p>
            <div style="background:#f4f5f7;padding:14px;border-radius:10px;line-height:1.6;">${safeComment}</div>
            <p><a href="https://gamatfxacademy.com/#/reviews">View Reviews</a></p>
          </body>
        </html>
      `;
      const result = await sendResendEmail(apiKey, {
        from: fromEmail,
        to: [adminEmail],
        ...(userEmail ? { reply_to: userEmail } : {}),
        subject: `New ${rating || 5}★ Review from ${userName || "Student"}: ${targetTitle || ""}`.trim(),
        html: adminHtml,
      });
      if (!result.ok) return res.status(result.status).json({ ok: false, message: result.data?.message || "Failed to notify admin" });
      return res.status(200).json({ ok: true, id: result.data?.id });
    }

    if (type === "discovery_survey") {
      const { sourceId, detail, userName, userEmail, route } = body;
      const adminHtml = `
        <!DOCTYPE html>
        <html>
          <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#16181c;padding:20px;">
            <h2 style="margin:0 0 12px;">New Discovery Survey Response</h2>
            <p><strong>Source:</strong> ${escapeHtml(sourceId || "")}<br/>
            ${detail ? `<strong>Detail:</strong> ${escapeHtml(detail)}<br/>` : ""}
            <strong>User:</strong> ${escapeHtml(userName || "Visitor")}${userEmail ? ` (${escapeHtml(userEmail)})` : ""}<br/>
            ${route ? `<strong>Page:</strong> ${escapeHtml(route)}` : ""}</p>
          </body>
        </html>
      `;
      const result = await sendResendEmail(apiKey, {
        from: fromEmail,
        to: [adminEmail],
        ...(userEmail ? { reply_to: userEmail } : {}),
        subject: `Discovery Survey: ${sourceId || "Response"}${userName ? ` — ${userName}` : ""}`,
        html: adminHtml,
      });
      if (!result.ok) return res.status(result.status).json({ ok: false, message: result.data?.message || "Failed to send discovery alert" });
      return res.status(200).json({ ok: true, id: result.data?.id });
    }

    return res.status(400).json({ ok: false, message: "Unsupported email type" });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err?.message || "Email server error" });
  }
}
