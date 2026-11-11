/**
 * Vercel Serverless Function: /join or /api/join
 * Provides dynamic OpenGraph preview metadata for WhatsApp, Facebook, Twitter, Telegram, etc.
 * when a student's personal invite link is shared, and smoothly redirects humans to the signup flow.
 */

export default function handler(req, res) {
  const query = req.query || {};
  const ref = (query.ref || "").trim().toUpperCase();
  const course = (query.course || "Forex Foundations").trim();

  const title = ref
    ? `Join Me at GAMAT Fx Academy (Invite Code: ${ref})`
    : "GAMAT Fx Academy | Official Student Enrollment Proof";

  const description = ref
    ? `I just enrolled for ${course} at GAMAT Fx Academy! You can register at no cost using my link (Invite Code: ${ref}).`
    : "I just enrolled at GAMAT Fx Academy! Register at no cost to learn institutional forex trading.";

  const redirectUrl = ref
    ? `https://gamatfxacademy.com/#/signup?ref=${encodeURIComponent(ref)}`
    : "https://gamatfxacademy.com/#/signup";

  const imageUrl = "https://gamatfxacademy.com/images/og-share-card.png";

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />

  <!-- Open Graph / WhatsApp / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://gamatfxacademy.com/join${ref ? `?ref=${encodeURIComponent(ref)}` : ""}" />
  <meta property="og:site_name" content="GAMAT Fx Academy" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:secure_url" content="${imageUrl}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="GAMAT Fx Academy Student Share Card" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${imageUrl}" />

  <!-- Instant Human Redirect -->
  <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
  <link rel="canonical" href="${redirectUrl}" />
</head>
<body style="background:#080c14;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <div style="text-align:center;padding:20px;">
    <p style="font-size:18px;font-weight:bold;">Redirecting to GAMAT Fx Academy...</p>
    <p style="font-size:14px;color:#94a3b8;"><a href="${redirectUrl}" style="color:#dc3545;text-decoration:none;">Click here if you are not redirected automatically</a></p>
  </div>
  <script>
    window.location.replace("${redirectUrl}");
  </script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(html);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
