/**
 * Vercel Serverless Function: /api/preview
 * Serves section-specific and item-specific (store products, courses) Open Graph &
 * Twitter Card metadata to social media crawlers (WhatsApp, Facebook, X/Twitter,
 * Telegram, LinkedIn, Discord, Slack).
 */

const ROUTE_PREVIEWS = {
  "/store": {
    title: "Academy Store | GAMAT Fx Academy",
    description: "Shop official GAMAT Fx Academy merchandise, physical trading journals, and pro trader gear.",
    image: "https://gamatfxacademy.com/images/og-banner.jpg",
  },
  "/courses": {
    title: "Trading Courses | GAMAT Fx Academy",
    description: "Master institutional order flow, price action, risk management, and trading psychology with structured courses.",
    image: "https://gamatfxacademy.com/images/hero.jpg",
  },
  "/services": {
    title: "1-on-1 Mentorship & Services | GAMAT Fx Academy",
    description: "Book 1-on-1 mentorship, portfolio reviews, and specialized trader coaching at GAMAT Fx Academy.",
    image: "https://gamatfxacademy.com/images/services.jpg",
  },
  "/events": {
    title: "Live Events & Bootcamps | GAMAT Fx Academy",
    description: "Register for upcoming trading bootcamps, live workshops, and community meetups.",
    image: "https://gamatfxacademy.com/images/community.jpg",
  },
  "/forum": {
    title: "Student Forum | GAMAT Fx Academy",
    description: "Discuss charts, share wins and lessons, and connect with mentors and fellow traders.",
    image: "https://gamatfxacademy.com/images/community.jpg",
  },
  "/outlook": {
    title: "Market Outlooks | GAMAT Fx Academy",
    description: "Weekly institutional market breakdowns, key liquidity levels, and pair outlooks.",
    image: "https://gamatfxacademy.com/images/og-banner.jpg",
  },
  "/news": {
    title: "Academy News | GAMAT Fx Academy",
    description: "Latest announcements, updates, and articles from GAMAT Fx Academy.",
    image: "https://gamatfxacademy.com/images/og-banner.jpg",
  },
  "/giveaways": {
    title: "Community Giveaways | GAMAT Fx Academy",
    description: "Funded account challenges, store gear, and scholarship giveaways for GAMAT Fx Academy students.",
    image: "https://gamatfxacademy.com/images/og-banner.jpg",
  },
  "/verify-certificate": {
    title: "Verify Certificate | GAMAT Fx Academy",
    description: "Verify the authenticity of an official GAMAT Fx Academy course completion certificate.",
    image: "https://gamatfxacademy.com/images/og-banner.jpg",
  },
  "/about": {
    title: "About GAMAT Fx Academy",
    description: "Learn about GAMAT Fx Academy's mission, mentors, and institutional trading curriculum.",
    image: "https://gamatfxacademy.com/images/about-hero.jpg",
  },
};

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resolvePublicImage(raw, fallback) {
  const s = String(raw || "").trim();
  if (!s || s.startsWith("data:")) return fallback;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) return `https://gamatfxacademy.com${s}`;
  return fallback;
}

export default async function handler(req, res) {
  const rawPath = String(req.query?.path || "/").trim();
  const cleanPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const parts = cleanPath.split("/").filter(Boolean);
  const baseSegment = "/" + (parts[0] || "");
  const productId = String(req.query?.product || "").trim();
  const courseId = baseSegment === "/courses" && parts[1] ? parts[1] : "";
  const lookupId = productId || courseId;

  let meta = ROUTE_PREVIEWS[cleanPath] || ROUTE_PREVIEWS[baseSegment] || {
    title: "GAMAT Fx Academy | Premier Forex Trading Education & Mentorship",
    description:
      "Premier forex trading education, 1-on-1 mentorship, institutional order-flow training, and a results-driven trading community.",
    image: "https://gamatfxacademy.com/images/og-banner.jpg",
  };

  if (lookupId) {
    try {
      const supabaseUrl =
        (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim() ||
        "https://pbbtiazbpolvajjsqirs.supabase.co";
      const supabaseKey =
        (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "").trim() ||
        "sb_publishable_FnEN-7WZtC0_qvoNApQNSw__c9KqANV";

      const r = await fetch(
        `${supabaseUrl}/rest/v1/courses?id=eq.${encodeURIComponent(lookupId)}&select=id,title,short,desc,price,poster,tag&limit=1`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      );
      if (r.ok) {
        const rows = await r.json();
        const item = rows && rows[0];
        if (item && item.title) {
          const priceNum = Number(item.price) || 0;
          const priceLabel = priceNum > 0 ? `₦${priceNum.toLocaleString()}` : "Free";
          meta = {
            title: `${item.title} (${priceLabel}) | GAMAT Fx Academy`,
            description: String(item.short || item.desc || meta.description).slice(0, 220),
            image: resolvePublicImage(item.poster, meta.image),
          };
        }
      }
    } catch {}
  }

  const querySuffix = productId ? `?product=${encodeURIComponent(productId)}` : "";
  const pageUrl = `https://gamatfxacademy.com${cleanPath === "/" ? "" : cleanPath}${querySuffix}`;
  const redirectUrl = `https://gamatfxacademy.com/#${cleanPath}${querySuffix}`;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}" />

  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(pageUrl)}" />
  <meta property="og:site_name" content="GAMAT Fx Academy" />
  <meta property="og:title" content="${escapeHtml(meta.title)}" />
  <meta property="og:description" content="${escapeHtml(meta.description)}" />
  <meta property="og:image" content="${escapeHtml(meta.image)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(meta.image)}" />
  <meta property="og:image:alt" content="${escapeHtml(meta.title)}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
  <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
  <meta name="twitter:image" content="${escapeHtml(meta.image)}" />

  <meta http-equiv="refresh" content="0;url=${escapeHtml(redirectUrl)}" />
  <link rel="canonical" href="${escapeHtml(pageUrl)}" />
</head>
<body>
  <script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(html);
}
