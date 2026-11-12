/**
 * Vercel Serverless Function: /api/qr or /qr.png
 * Returns a crisp square PNG containing ONLY the QR code for WhatsApp & Telegram link preview thumbnails.
 */

export default async function handler(req, res) {
  const query = req.query || {};
  const ref = (query.ref || "").trim().toUpperCase();

  const targetUrl = ref
    ? `https://gamatfxacademy.com/#/signup?ref=${encodeURIComponent(ref)}`
    : "https://gamatfxacademy.com/#/signup";

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=560x560&margin=20&format=png&data=${encodeURIComponent(targetUrl)}`;

  try {
    const upstream = await fetch(qrApiUrl);
    if (!upstream.ok) {
      throw new Error(`Upstream returned ${upstream.status}`);
    }
    const buffer = await upstream.arrayBuffer();

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400");
    return res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    // Resilient fallback to static square QR code
    return res.redirect(302, "https://gamatfxacademy.com/images/og-share-card-square.png");
  }
}
