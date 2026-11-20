import crypto from "node:crypto";

function r2Hmac(key, data) {
  return crypto.createHmac("sha256", key).update(data).digest();
}

function r2Sha256Hex(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function r2EncodeRfc3986(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

async function handleR2Presign(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const accountId = (process.env.R2_ACCOUNT_ID || "").trim();
  const accessKeyId = (process.env.R2_ACCESS_KEY_ID || "").trim();
  const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || "").trim();
  const bucket = (process.env.R2_BUCKET || "").trim();
  const publicBase = (process.env.R2_PUBLIC_URL || "").trim().replace(/\/+$/, "");

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBase) {
    return res.status(200).json({
      ok: false,
      configured: false,
      message: "Cloudflare R2 is not configured yet.",
    });
  }

  if (req.method === "GET") {
    const rawKey = String(req.query?.key || "").replace(/^\/+/, "");
    if (!rawKey || rawKey.includes("..")) {
      return res.status(400).json({ ok: false, message: "Invalid object key" });
    }
    const encodedKey = rawKey.split("/").map(r2EncodeRfc3986).join("/");
    return res.status(200).json({
      ok: true,
      configured: true,
      publicUrl: `${publicBase}/${encodedKey}`,
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const rawKey = String(body.key || "").replace(/^\/+/, "");
    const contentType = String(body.contentType || "application/octet-stream");

    if (!rawKey || rawKey.includes("..")) {
      return res.status(400).json({ ok: false, message: "Invalid object key" });
    }

    const host = `${accountId}.r2.cloudflarestorage.com`;
    const region = "auto";
    const service = "s3";
    const expires = 300;

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

    const encodedKey = rawKey.split("/").map(r2EncodeRfc3986).join("/");
    const canonicalUri = `/${r2EncodeRfc3986(bucket)}/${encodedKey}`;

    const queryParams = {
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": `${accessKeyId}/${credentialScope}`,
      "X-Amz-Date": amzDate,
      "X-Amz-Expires": String(expires),
      "X-Amz-SignedHeaders": "host",
    };

    const canonicalQueryString = Object.keys(queryParams)
      .sort()
      .map((k) => `${r2EncodeRfc3986(k)}=${r2EncodeRfc3986(queryParams[k])}`)
      .join("&");

    const canonicalHeaders = `host:${host}\n`;
    const canonicalRequest = [
      "PUT",
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      "host",
      "UNSIGNED-PAYLOAD",
    ].join("\n");

    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      r2Sha256Hex(canonicalRequest),
    ].join("\n");

    const kDate = r2Hmac(`AWS4${secretAccessKey}`, dateStamp);
    const kRegion = r2Hmac(kDate, region);
    const kService = r2Hmac(kRegion, service);
    const kSigning = r2Hmac(kService, "aws4_request");
    const signature = crypto.createHmac("sha256", kSigning).update(stringToSign).digest("hex");

    const uploadUrl = `https://${host}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
    const publicUrl = `${publicBase}/${encodedKey}`;

    return res.status(200).json({
      ok: true,
      configured: true,
      uploadUrl,
      publicUrl,
      contentType,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err?.message || "Failed to generate R2 presigned URL",
    });
  }
}

/**
 * Vercel Serverless Function: Create Bachs Checkout Session (and R2 Presign)
 * Handles session creation securely on the server with zero CORS issues.
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.query?.__r2 === "1" || (req.url && req.url.includes("r2-presign"))) {
    return handleR2Presign(req, res);
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const apiKey = (process.env.BACHS_API_KEY || "").trim();

    if (!apiKey) {
      return res.status(500).json({
        message: "Bachs API key is not configured. Please add BACHS_API_KEY to your Vercel Environment Variables.",
      });
    }

    const isSandbox = apiKey.startsWith("sk_sandbox_");
    const baseUrl = isSandbox
      ? "https://sandbox-api.bachs.io/v1"
      : "https://api.bachs.io/v1";

    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { amount, currency = "NGN", email, name, phone, reference, metadata } = body;

    if (!amount || !email) {
      return res.status(400).json({ message: "Missing required fields (amount, email)" });
    }

    const formattedAmount = Number(amount).toFixed(2);

    const payload = {
      pricing: {
        amount: formattedAmount,
        currency,
      },
      customer: {
        email,
        name: name || "Student",
        ...(phone ? { phone } : {}),
      },
      reference: reference || `GFX-${Date.now()}`,
      metadata: metadata || {},
    };

    const response = await fetch(`${baseUrl}/checkout-sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({
      checkout_id: data.checkout_id,
      checkout_url: data.checkout_url,
      amount: data.amount || formattedAmount,
      currency: data.currency || currency,
      reference: data.reference || payload.reference,
      status: data.status,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to create checkout session" });
  }
}
