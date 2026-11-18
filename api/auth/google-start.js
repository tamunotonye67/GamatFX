import crypto from "node:crypto";

/**
 * Vercel Serverless Function: Start Direct Google OAuth Flow
 * Redirects users to Google with redirect_uri on gamatfxacademy.com
 * so Google's consent screen shows gamatfxacademy.com / GAMAT Fx Academy
 * instead of *.supabase.co.
 */

function getOrigin(req) {
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "gamatfxacademy.com")
    .split(",")[0]
    .trim();
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const clientId = (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "").trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || "").trim();

  if (!clientId || !clientSecret) {
    return res.status(200).json({
      ok: false,
      configured: false,
      message: "Direct Google OAuth environment variables are not configured.",
    });
  }

  const origin = getOrigin(req);
  const redirectUri = `${origin}/api/auth/google-callback`;
  const state = crypto.randomBytes(24).toString("hex");

  const isHttps = origin.startsWith("https://");
  res.setHeader(
    "Set-Cookie",
    `gamat_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${isHttps ? "; Secure" : ""}`
  );

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  if (req.query?.mode === "url") {
    return res.status(200).json({ ok: true, url });
  }

  return res.redirect(302, url);
}
