/**
 * Vercel Serverless Function: Direct Google OAuth Callback
 * Exchanges Google's authorization code for an ID token on gamatfxacademy.com
 * and hands the ID token to the frontend to sign into Supabase via signInWithIdToken.
 */

function getOrigin(req) {
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "gamatfxacademy.com")
    .split(",")[0]
    .trim();
  return `${proto}://${host}`;
}

function parseCookies(cookieHeader) {
  const out = {};
  String(cookieHeader || "")
    .split(";")
    .forEach((part) => {
      const idx = part.indexOf("=");
      if (idx > 0) {
        const k = part.slice(0, idx).trim();
        const v = part.slice(idx + 1).trim();
        out[k] = decodeURIComponent(v);
      }
    });
  return out;
}

export default async function handler(req, res) {
  const origin = getOrigin(req);
  const isHttps = origin.startsWith("https://");
  const clearFlags = `Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isHttps ? "; Secure" : ""}`;
  res.setHeader("Set-Cookie", [
    `gamat_oauth_state=; ${clearFlags}`,
    `gamat_oauth_nonce=; ${clearFlags}`,
  ]);

  const failRedirect = (msg) =>
    res.redirect(302, `${origin}/#/login?oauth_error=${encodeURIComponent(msg)}`);

  try {
    const { code, state, error } = req.query || {};
    if (error) {
      return failRedirect(`Google sign-in was cancelled or failed (${String(error)}).`);
    }

    const cookies = parseCookies(req.headers.cookie);
    if (!state || !cookies.gamat_oauth_state || cookies.gamat_oauth_state !== String(state)) {
      return failRedirect("Invalid OAuth session state. Please try signing in again.");
    }

    if (!code) {
      return failRedirect("Missing authorization code from Google.");
    }

    const clientId = (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "").trim();
    const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || "").trim();
    if (!clientId || !clientSecret) {
      return failRedirect("Google OAuth is not configured on the server.");
    }

    const redirectUri = `${origin}/api/auth/google-callback`;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: String(code),
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokenData = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !tokenData.id_token) {
      return failRedirect(tokenData.error_description || tokenData.error || "Failed to exchange Google token.");
    }

    const nonceParam = cookies.gamat_oauth_nonce
      ? `&google_nonce=${encodeURIComponent(cookies.gamat_oauth_nonce)}`
      : "";

    return res.redirect(
      302,
      `${origin}/#/?google_id_token=${encodeURIComponent(tokenData.id_token)}${nonceParam}`
    );
  } catch (err) {
    return failRedirect(err?.message || "Unexpected error during Google sign-in.");
  }
}
